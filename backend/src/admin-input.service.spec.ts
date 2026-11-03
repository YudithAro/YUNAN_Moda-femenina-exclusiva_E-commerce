import { BadRequestException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const db = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock('./database.js', () => ({ pool: db }));
import { CategoriesService } from './categories/categories.service.js';
import { CouponsService } from './coupons/coupons.service.js';
import { SuppliersService } from './suppliers/suppliers.service.js';

const id = '00000000-0000-4000-8000-000000000001';
const services = [new CategoriesService(), new CouponsService(), new SuppliersService()];

describe('Administrative input validation', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    db.query.mockResolvedValue({ rows: [{ id }], rowCount: 1 });
  });

  it.each([null, undefined, [], 'text', 12])('rejects invalid body %j without database access', async body => {
    for (const service of services) {
      await expect(service.create(body)).rejects.toBeInstanceOf(BadRequestException);
      await expect(service.update(id, body)).rejects.toBeInstanceOf(BadRequestException);
    }
    expect(db.query).not.toHaveBeenCalled();
  });

  it('rejects invalid record IDs and empty updates without database access', async () => {
    for (const service of services) {
      await expect(service.findOne("1' OR 1=1")).rejects.toBeInstanceOf(BadRequestException);
      await expect(service.remove('invalid')).rejects.toBeInstanceOf(BadRequestException);
      await expect(service.update(id, {})).rejects.toBeInstanceOf(BadRequestException);
    }
    expect(db.query).not.toHaveBeenCalled();
  });

  it('returns 404 for absent records instead of an empty successful response', async () => {
    db.query.mockResolvedValue({ rows: [] });
    for (const service of services) {
      await expect(service.findOne(id)).rejects.toBeInstanceOf(NotFoundException);
      await expect(service.remove(id)).rejects.toBeInstanceOf(NotFoundException);
    }
    await expect(new CategoriesService().update(id, { name: 'Vestidos' })).rejects.toBeInstanceOf(NotFoundException);
    await expect(new SuppliersService().update(id, { active: false })).rejects.toBeInstanceOf(NotFoundException);
    await expect(new CouponsService().update(id, { active: false })).rejects.toBeInstanceOf(NotFoundException);
  });

  it('normalizes accented category names to stable nonempty slugs', async () => {
    await new CategoriesService().create({ name: '  Colección de Verano  ', description: '  Novedades\n2026  ' });
    const values = db.query.mock.calls[0][1];
    expect(values.slice(1)).toEqual(['Colección de Verano', 'coleccion-de-verano', 'Novedades\n2026']);
  });

  it.each([{ name: '' }, { name: 'a'.repeat(121) }, { name: 'Vestidos', slug: '../admin' }, { name: 'Vestidos', description: 5 }])('rejects malformed category %j', async body => {
    await expect(new CategoriesService().create(body)).rejects.toBeInstanceOf(BadRequestException);
    expect(db.query).not.toHaveBeenCalled();
  });

  it('allows clearing a category description without clearing the omitted name', async () => {
    await new CategoriesService().update(id, { description: '' });
    expect(db.query.mock.calls[0][1]).toEqual([null, null, id, true, null]);
  });

  it.each([
    { discount: 0 }, { discount: -2 }, { discount: '10' }, { discount: 10.123 },
    { discount: Number.NaN }, { discount: Number.POSITIVE_INFINITY }, { discount: 101 },
    { type: 'AMOUNT' }, { active: 'false' }, { code: 'HAS SPACES' }, { code: {} },
  ])('rejects unsafe coupon fields %j before database access', async changes => {
    await expect(new CouponsService().create({ code: 'VERANO10', discount: 10, ...changes })).rejects.toBeInstanceOf(BadRequestException);
    expect(db.query).not.toHaveBeenCalled();
  });

  it('allows a fixed amount over 100 and preserves false activation', async () => {
    await new CouponsService().create({ code: '  verano-25 ', discount: 125.5, type: 'FIXED', active: false });
    expect(db.query.mock.calls[0][1].slice(1)).toEqual(['VERANO-25', 125.5, 'FIXED', false]);
  });

  it('guards percentage limits atomically on partial coupon updates', async () => {
    db.query.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [{ id, discount: 50, type: 'PERCENTAGE' }] });
    await expect(new CouponsService().update(id, { discount: 150 })).rejects.toBeInstanceOf(BadRequestException);
    expect(db.query.mock.calls[0][0]).toContain("COALESCE($3, type) = 'FIXED' OR COALESCE($2, discount) <= 100");
  });

  it.each([
    { name: '' }, { name: 'a'.repeat(151) }, { email: 'invalid-address' },
    { phone: 'not-a-number' }, { phone: '+1 123' }, { phone: '9'.repeat(16) },
    { contactName: ['contact'] }, { active: 1 },
  ])('rejects invalid supplier fields %j before database access', async changes => {
    await expect(new SuppliersService().create({ name: 'Proveedor', ...changes })).rejects.toBeInstanceOf(BadRequestException);
    expect(db.query).not.toHaveBeenCalled();
  });

  it('normalizes supplier contact details and accepts international phone formatting', async () => {
    await new SuppliersService().create({ name: '  Textiles Lima  ', email: ' INFO@EXAMPLE.COM ', phone: '+51 (951) 162-161', active: false });
    expect(db.query.mock.calls[0][1].slice(1)).toEqual(['Textiles Lima', null, 'info@example.com', '+51 (951) 162-161', false]);
  });

  it('clears explicit nullable supplier contact fields while retaining omitted fields', async () => {
    await new SuppliersService().update(id, { email: null, phone: '', active: false });
    expect(db.query.mock.calls[0][1]).toEqual([null, null, null, null, false, id, false, true, true]);
  });
});

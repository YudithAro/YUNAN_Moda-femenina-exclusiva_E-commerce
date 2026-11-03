import { BadRequestException, ConflictException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const db = vi.hoisted(() => ({ query: vi.fn(), connect: vi.fn(), clientQuery: vi.fn(), release: vi.fn() }));
vi.mock('../database.js', () => ({ pool: { query: db.query, connect: db.connect } }));
import { ProductsService } from './products.service.js';

const productId = '00000000-0000-4000-8000-000000000001';
const variantId = '00000000-0000-4000-8000-000000000002';
const product = { id: productId, name: 'Vestido', price: '50.00', stock: 4, categoryId: productId, sizes: ['M'], colors: ['Negro'], images: [] };

describe('ProductsService variant stock', () => {
  let service: ProductsService;
  beforeEach(() => {
    vi.resetAllMocks();
    db.connect.mockResolvedValue({ query: db.clientQuery, release: db.release });
    db.query.mockResolvedValue({ rows: [product] });
    db.clientQuery.mockImplementation(async (sql: string) => {
      if (sql.includes('SELECT * FROM "product"')) return { rows: [product] };
      if (sql.includes('SELECT id FROM "variant"')) return { rows: [{ id: variantId }] };
      if (sql.includes('SELECT * FROM "variant"')) return { rows: [{ id: variantId, productId, size: 'M', color: 'Negro', stock: 4 }] };
      return { rows: [], rowCount: 1 };
    });
    service = new ProductsService();
  });

  it('derives total inventory from variants instead of trusting a client total', async () => {
    await service.update(productId, { stock: 999, variants: [{ id: variantId, size: 'M', color: 'Negro', stock: 2 }, { size: 'L', color: 'Negro', stock: 3 }] });
    const total = db.clientQuery.mock.calls.find(call => call[0].includes('sizes = ARRAY'))!;
    expect(total[1]).toEqual([5, productId]);
    expect(db.clientQuery.mock.calls.some(call => call[0].includes('DELETE FROM "variant"'))).toBe(false);
    expect(db.clientQuery.mock.calls.at(-1)?.[0]).toBe('COMMIT');
  });

  it('preserves managed variants when an unrelated product field is edited', async () => {
    await service.update(productId, { name: 'Nuevo nombre' });
    expect(db.clientQuery.mock.calls.some(call => call[0].includes('UPDATE "variant"'))).toBe(false);
  });

  it('blocks changing only the total stock of a product managed by variants', async () => {
    await expect(service.update(productId, { stock: 20 })).rejects.toBeInstanceOf(BadRequestException);
    expect(db.clientQuery.mock.calls.at(-1)?.[0]).toBe('ROLLBACK');
  });

  it('rejects duplicate combinations ignoring case before opening a transaction', async () => {
    await expect(service.update(productId, { variants: [{ size: 'M', color: 'Negro', stock: 1 }, { size: 'm', color: 'negro', stock: 2 }] })).rejects.toBeInstanceOf(BadRequestException);
    expect(db.connect).not.toHaveBeenCalled();
  });

  it('does not let a historical variant change identity', async () => {
    await expect(service.update(productId, { variants: [{ id: variantId, size: 'L', color: 'Negro', stock: 2 }] })).rejects.toBeInstanceOf(BadRequestException);
    expect(db.clientQuery.mock.calls.at(-1)?.[0]).toBe('ROLLBACK');
  });

  it.each([-1, 1.5, '4'])('rejects invalid stock %s before database access', async stock => {
    await expect(service.update(productId, { stock })).rejects.toBeInstanceOf(BadRequestException);
    expect(db.connect).not.toHaveBeenCalled();
  });

  it('preserves products referenced by sales', async () => {
    const implementation = db.clientQuery.getMockImplementation()!;
    db.clientQuery.mockImplementation(async (...args: [string, unknown[]?]) => args[0].includes('SELECT id FROM "orderItem"') ? { rows: [{ id: variantId }] } : implementation(...args));
    await expect(service.remove(productId)).rejects.toBeInstanceOf(ConflictException);
    expect(db.clientQuery.mock.calls.some(call => call[0].includes('DELETE FROM "product"'))).toBe(false);
    expect(db.clientQuery.mock.calls.at(-1)?.[0]).toBe('ROLLBACK');
  });

  it('does not erase existing total stock when an unmanaged product sends an empty variants array', async () => {
    const implementation = db.clientQuery.getMockImplementation()!;
    db.clientQuery.mockImplementation(async (...args: [string, unknown[]?]) => args[0].includes('FROM "variant"') ? { rows: [] } : implementation(...args));
    await service.update(productId, { variants: [] });
    expect(db.clientQuery.mock.calls.some(call => call[0].includes('sizes = ARRAY'))).toBe(false);
    expect(db.clientQuery.mock.calls.some(call => call[0].includes('UPDATE "variant"'))).toBe(false);
  });

  it('blocks converting inventory while a cancellable sale reserves a legacy total', async () => {
    const implementation = db.clientQuery.getMockImplementation()!;
    db.clientQuery.mockImplementation(async (...args: [string, unknown[]?]) => {
      if (args[0].includes('FROM "variant"')) return { rows: [] };
      if (args[0].includes('JOIN "order"')) return { rows: [{ id: variantId }] };
      return implementation(...args);
    });
    await expect(service.update(productId, { variants: [{ size: 'M', color: 'Negro', stock: 4 }] })).rejects.toBeInstanceOf(ConflictException);
    expect(db.clientQuery.mock.calls.at(-1)?.[0]).toBe('ROLLBACK');
  });
});

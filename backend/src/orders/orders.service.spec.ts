import { BadRequestException, ConflictException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const db = vi.hoisted(() => ({ query: vi.fn(), connect: vi.fn(), clientQuery: vi.fn(), release: vi.fn() }));
vi.mock('../database.js', () => ({ pool: { query: db.query, connect: db.connect } }));
import { OrdersService } from './orders.service.js';

const productId = '00000000-0000-4000-8000-000000000001';
const variantId = '00000000-0000-4000-8000-000000000002';
const orderId = '00000000-0000-4000-8000-000000000003';
const requestId = '00000000-0000-4000-8000-000000000004';
const sale = (quantity = 2) => ({ customerName: 'Cliente', customerPhone: '999888777', items: [{ productId, quantity, price: 0.01 }] });
const statements = () => db.clientQuery.mock.calls.map(call => String(call[0]).trim());

describe('OrdersService inventory transactions', () => {
  let service: OrdersService;
  beforeEach(() => {
    vi.resetAllMocks();
    db.connect.mockResolvedValue({ query: db.clientQuery, release: db.release });
    db.clientQuery.mockImplementation(async (sql: string) => {
      if (sql.includes('SELECT id, name, price, stock')) return { rows: [{ id: productId, price: '19.95', stock: 5 }] };
      if (sql.includes('SELECT id, size, color, stock')) return { rows: [] };
      if (sql.includes('INSERT INTO "order"')) return { rows: [{ id: orderId }], rowCount: 1 };
      return { rows: [], rowCount: 1 };
    });
    service = new OrdersService();
  });

  it('calculates prices on the server and writes the order and inventory on one client', async () => {
    await expect(service.createManual(sale())).resolves.toEqual({ success: true, orderId, total: '39.90' });
    expect(db.query).not.toHaveBeenCalled();
    expect(statements()[0]).toBe('BEGIN');
    expect(statements().at(-1)).toBe('COMMIT');
    const order = db.clientQuery.mock.calls.find(call => call[0].includes('INSERT INTO "order"'))!;
    expect(order[1][2]).toBe('39.90');
    const item = db.clientQuery.mock.calls.find(call => call[0].includes('INSERT INTO "orderItem"'))!;
    expect(item[1].at(-1)).toBe('19.95');
    const stock = db.clientQuery.mock.calls.find(call => call[0].includes('UPDATE "product" SET stock = $1'))!;
    expect(stock[1]).toEqual([3, productId]);
    expect(db.release).toHaveBeenCalledOnce();
  });

  it.each([0, -1, 1.5, '2', 10001])('rejects quantity %s before any database access', async quantity => {
    await expect(service.createManual({ ...sale(), items: [{ productId, quantity }] })).rejects.toBeInstanceOf(BadRequestException);
    expect(db.connect).not.toHaveBeenCalled();
  });

  it('rejects overselling and rolls back without inserting an order', async () => {
    await expect(service.createManual(sale(6))).rejects.toBeInstanceOf(ConflictException);
    expect(statements()).toContain('ROLLBACK');
    expect(statements().some(sql => sql.includes('INSERT INTO "order"'))).toBe(false);
    expect(statements()).not.toContain('COMMIT');
    expect(db.release).toHaveBeenCalledOnce();
  });

  it('combines duplicate lines so they cannot bypass product stock', async () => {
    await expect(service.createManual({ ...sale(), items: [{ productId, quantity: 3 }, { productId, quantity: 3 }] })).rejects.toBeInstanceOf(ConflictException);
    expect(db.clientQuery.mock.calls.filter(call => call[0].includes('SELECT id, name, price, stock'))).toHaveLength(1);
  });

  it('requires a real variant when the product has combinations', async () => {
    db.clientQuery.mockImplementation(async (sql: string) => {
      if (sql.includes('SELECT id, name, price, stock')) return { rows: [{ id: productId, price: '20.00', stock: 5 }] };
      if (sql.includes('SELECT id, size, color, stock')) return { rows: [{ id: variantId, size: 'M', color: 'Negro', stock: 1 }] };
      return { rows: [], rowCount: 1 };
    });
    await expect(service.createManual(sale())).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.createManual({ ...sale(), items: [{ productId, variantId, quantity: 2 }] })).rejects.toBeInstanceOf(ConflictException);
    expect(statements().filter(sql => sql === 'ROLLBACK')).toHaveLength(2);
  });

  it('rolls back product/variant deductions if inserting an order item fails', async () => {
    const implementation = db.clientQuery.getMockImplementation()!;
    db.clientQuery.mockImplementation(async (...args: [string, unknown[]?]) => {
      if (args[0].includes('INSERT INTO "orderItem"')) throw new Error('database unavailable');
      return implementation(...args);
    });
    await expect(service.createManual(sale())).rejects.toThrow('database unavailable');
    expect(statements().at(-1)).toBe('ROLLBACK');
    expect(statements()).not.toContain('COMMIT');
    expect(db.release).toHaveBeenCalledOnce();
  });

  it('returns the original sale for a repeated request and does not deduct stock twice', async () => {
    const items = [{ productId, quantity: 2 }];
    const fingerprint = createHash('sha256').update(JSON.stringify({ name: 'Cliente', phone: '999888777', items })).digest('hex');
    db.clientQuery.mockImplementation(async (sql: string) => sql.includes('SELECT id, total, "requestFingerprint"')
      ? { rows: [{ id: orderId, total: '39.90', requestFingerprint: fingerprint }] }
      : { rows: [], rowCount: 1 });
    await expect(service.createManual({ ...sale(), requestId })).resolves.toEqual({ success: true, orderId, total: '39.90' });
    expect(statements().some(sql => sql.includes('UPDATE "product"'))).toBe(false);
    expect(statements().some(sql => sql.includes('pg_advisory_xact_lock'))).toBe(true);
  });

  it('rejects a reused request key with changed sale content', async () => {
    db.clientQuery.mockImplementation(async (sql: string) => sql.includes('SELECT id, total, "requestFingerprint"')
      ? { rows: [{ id: orderId, total: '39.90', requestFingerprint: 'another-sale' }] }
      : { rows: [], rowCount: 1 });
    await expect(service.createManual({ ...sale(), requestId })).rejects.toBeInstanceOf(ConflictException);
    expect(statements().at(-1)).toBe('ROLLBACK');
  });

  it('restores the original variant and product once when cancelling', async () => {
    let order = { id: orderId, status: 'PAID', inventoryReserved: true };
    db.clientQuery.mockImplementation(async (sql: string) => {
      if (sql.includes('SELECT * FROM "order"')) return { rows: [{ ...order }] };
      if (sql.includes('SUM(quantity)::int')) return { rows: [{ productId, variantId, quantity: 2 }] };
      if (sql.includes('UPDATE "order" SET status')) { order = { ...order, status: 'CANCELLED', inventoryReserved: false }; return { rows: [order] }; }
      return { rows: [{ id: productId }], rowCount: 1 };
    });
    await service.updateStatus(orderId, 'CANCELLED');
    await service.updateStatus(orderId, 'CANCELLED');
    expect(db.clientQuery.mock.calls.filter(call => call[0].includes('UPDATE "variant" SET stock = stock +'))).toHaveLength(1);
    expect(db.clientQuery.mock.calls.filter(call => call[0].includes('UPDATE "product" SET stock = stock +'))).toHaveLength(1);
    expect(db.clientQuery.mock.calls.some(call => call[0].includes('FOR UPDATE'))).toBe(true);
  });

  it('does not invent inventory movements for legacy orders', async () => {
    db.clientQuery.mockImplementation(async (sql: string) => sql.includes('SELECT * FROM "order"')
      ? { rows: [{ id: orderId, status: 'PAID', inventoryReserved: false }] }
      : { rows: [{ id: orderId, status: 'CANCELLED' }], rowCount: 1 });
    await service.updateStatus(orderId, 'CANCELLED');
    expect(statements().some(sql => sql.includes('UPDATE "product"'))).toBe(false);
  });

  it('rejects skipping payment and reversing terminal order states', async () => {
    db.clientQuery.mockResolvedValue({ rows: [{ id: orderId, status: 'PENDING' }], rowCount: 1 });
    await expect(service.updateStatus(orderId, 'DELIVERED')).rejects.toBeInstanceOf(ConflictException);
    db.clientQuery.mockResolvedValue({ rows: [{ id: orderId, status: 'CANCELLED' }], rowCount: 1 });
    await expect(service.updateStatus(orderId, 'PAID')).rejects.toBeInstanceOf(ConflictException);
  });

  it('lists orders with one aggregate query instead of one query per order', async () => {
    db.query.mockResolvedValue({ rows: [{ id: orderId, itemCount: 2 }] });
    await expect(service.findAll()).resolves.toEqual([{ id: orderId, itemCount: 2 }]);
    expect(db.query).toHaveBeenCalledOnce();
    expect(db.query.mock.calls[0][0]).toContain('GROUP BY "orderId"');
  });
});

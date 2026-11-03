import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { PoolClient } from 'pg';
import { createHash } from 'node:crypto';
import { pool } from '../database.js';

const transitions: Record<string, readonly string[]> = {
  PENDING: ['PAID', 'CANCELLED'], PAID: ['SHIPPED', 'CANCELLED'], SHIPPED: ['DELIVERED'], DELIVERED: [], CANCELLED: [],
};
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
type SaleItem = { productId: string; variantId?: string; quantity: number };
type PreparedItem = SaleItem & { price: string; size: string | null; color: string | null };

function assertId(id: unknown, label: string): asserts id is string {
  if (typeof id !== 'string' || !uuid.test(id)) throw new BadRequestException(`${label} inválido.`);
}

/** Keep DECIMAL prices as integer cents; client prices are never authoritative. */
function priceInCents(value: string): number {
  if (!/^\d+(\.\d{1,2})?$/.test(String(value))) throw new ConflictException('El precio del producto no es válido.');
  const [whole, fraction = ''] = String(value).split('.');
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  if (!Number.isSafeInteger(cents)) throw new ConflictException('El precio del producto no es válido.');
  return cents;
}

@Injectable()
export class OrdersService {
  private async list(limit?: number) {
    const { rows } = await pool.query(`
      SELECT o.*, json_build_object('id', u.id, 'name', u.name, 'email', u.email) AS "user",
        COALESCE(items.count, 0)::int AS "itemCount"
      FROM "order" o
      LEFT JOIN "user" u ON o."userId" = u.id
      LEFT JOIN (SELECT "orderId", SUM(quantity)::int AS count FROM "orderItem" GROUP BY "orderId") items
        ON items."orderId" = o.id
      ORDER BY o."createdAt" DESC ${limit === undefined ? '' : 'LIMIT $1'}
    `, limit === undefined ? [] : [limit]);
    return rows;
  }

  findAll() { return this.list(); }

  findRecent(limit = 10) {
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new BadRequestException('Límite inválido.');
    return this.list(limit);
  }

  async findOne(id: string) {
    assertId(id, 'Pedido');
    const { rows } = await pool.query(`
      SELECT o.*, json_build_object('id', u.id, 'name', u.name, 'email', u.email) AS "user"
      FROM "order" o LEFT JOIN "user" u ON o."userId" = u.id WHERE o.id = $1
    `, [id]);
    if (!rows.length) throw new NotFoundException('Pedido no encontrado.');
    const items = await pool.query(`
      SELECT oi.*, json_build_object('id', p.id, 'name', p.name, 'images', p.images) AS product
      FROM "orderItem" oi LEFT JOIN "product" p ON oi."productId" = p.id WHERE oi."orderId" = $1
    `, [id]);
    return { ...rows[0], items: items.rows };
  }

  private async transaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await work(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally { client.release(); }
  }

  async updateStatus(id: string, status: string) {
    assertId(id, 'Pedido');
    if (!Object.hasOwn(transitions, status)) throw new BadRequestException('Estado de pedido inválido.');
    return this.transaction(async client => {
      const { rows } = await client.query('SELECT * FROM "order" WHERE id = $1 FOR UPDATE', [id]);
      const order = rows[0];
      if (!order) throw new NotFoundException('Pedido no encontrado.');
      if (order.status === status) return order;
      if (!transitions[order.status]?.includes(status)) throw new ConflictException(`No se puede cambiar de ${order.status} a ${status}.`);
      if (status === 'CANCELLED' && order.inventoryReserved) {
        const { rows: items } = await client.query(`
          SELECT "productId", "variantId", SUM(quantity)::int AS quantity
          FROM "orderItem" WHERE "orderId" = $1 GROUP BY "productId", "variantId"
          ORDER BY "productId", "variantId" NULLS FIRST
        `, [id]);
        // Lock products in the same order as new sales and inventory edits.
        const productIds = [...new Set(items.map(item => item.productId))].sort();
        for (const productId of productIds) await client.query('SELECT id FROM "product" WHERE id = $1 FOR UPDATE', [productId]);
        for (const item of items) {
          if (item.variantId) {
            const restored = await client.query('UPDATE "variant" SET stock = stock + $1 WHERE id = $2 AND "productId" = $3 RETURNING id', [item.quantity, item.variantId, item.productId]);
            if (!restored.rowCount) throw new ConflictException('No se encuentra la variante que debe recuperar existencias.');
          }
          const restored = await client.query('UPDATE "product" SET stock = stock + $1, "updatedAt" = NOW() WHERE id = $2 RETURNING id', [item.quantity, item.productId]);
          if (!restored.rowCount) throw new ConflictException('No se encuentra el producto que debe recuperar existencias.');
        }
      }
      const updated = await client.query(`
        UPDATE "order" SET status = $1,
          "inventoryReserved" = CASE WHEN $1 = 'CANCELLED' THEN false ELSE "inventoryReserved" END,
          "updatedAt" = NOW() WHERE id = $2 RETURNING *
      `, [status, id]);
      return updated.rows[0];
    });
  }

  async createManual(data: unknown) {
    if (!data || typeof data !== 'object') throw new BadRequestException('Datos de venta inválidos.');
    const sale = data as Record<string, unknown>;
    if (!Array.isArray(sale.items) || !sale.items.length || sale.items.length > 100) throw new BadRequestException('La venta debe contener entre 1 y 100 productos.');
    const name = typeof sale.customerName === 'string' ? sale.customerName.trim() : '';
    const phone = typeof sale.customerPhone === 'string' ? sale.customerPhone.trim() : '';
    if (!name || name.length > 200 || phone.length > 40 || (phone && !/^[+\d\s()-]+$/.test(phone))) throw new BadRequestException('Nombre o teléfono del cliente inválido.');
    if (sale.requestId !== undefined) {
      assertId(sale.requestId, 'Identificador de venta');
      sale.requestId = sale.requestId.toLowerCase();
    }
    const combined = new Map<string, SaleItem>();
    for (const raw of sale.items) {
      if (!raw || typeof raw !== 'object') throw new BadRequestException('Producto de venta inválido.');
      const item = raw as Record<string, unknown>;
      assertId(item.productId, 'Producto');
      if (item.variantId !== undefined && item.variantId !== null) assertId(item.variantId, 'Variante');
      if (typeof item.quantity !== 'number' || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 10000) throw new BadRequestException('La cantidad debe ser un entero positivo de hasta 10000 unidades.');
      const productId = item.productId.toLowerCase();
      const variantId = typeof item.variantId === 'string' ? item.variantId.toLowerCase() : undefined;
      const key = `${productId}:${variantId ?? ''}`;
      const quantity = (combined.get(key)?.quantity ?? 0) + item.quantity;
      if (quantity > 10000) throw new BadRequestException('Cantidad total del producto demasiado grande.');
      combined.set(key, { productId, variantId, quantity });
    }
    const items = [...combined.values()].sort((a, b) => `${a.productId}:${a.variantId ?? ''}`.localeCompare(`${b.productId}:${b.variantId ?? ''}`));
    const fingerprint = createHash('sha256').update(JSON.stringify({ name, phone, items })).digest('hex');
    return this.transaction(async client => {
      if (sale.requestId) {
        await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))', [sale.requestId]);
        const previous = await client.query('SELECT id, total, "requestFingerprint" FROM "order" WHERE "idempotencyKey" = $1', [sale.requestId]);
        if (previous.rows.length) {
          if (previous.rows[0].requestFingerprint !== fingerprint) throw new ConflictException('Este identificador ya fue utilizado para otra venta. Abre una venta nueva.');
          return { success: true, orderId: previous.rows[0].id, total: previous.rows[0].total };
        }
      }
      const prepared: PreparedItem[] = [];
      let totalCents = 0;
      const products = new Map<string, { price: string; stock: number }>();
      for (const productId of [...new Set(items.map(item => item.productId))].sort()) {
        const { rows } = await client.query('SELECT id, name, price, stock FROM "product" WHERE id = $1 FOR UPDATE', [productId]);
        if (!rows.length) throw new NotFoundException('Uno de los productos ya no existe.');
        products.set(productId, rows[0]);
      }
      for (const item of items) {
        const product = products.get(item.productId)!;
        const variants = await client.query('SELECT id, size, color, stock FROM "variant" WHERE "productId" = $1 ORDER BY id FOR UPDATE', [item.productId]);
        let size: string | null = null;
        let color: string | null = null;
        if (variants.rows.length) {
          const variant = variants.rows.find(row => row.id === item.variantId);
          if (!variant) throw new BadRequestException('Selecciona una combinación válida de talla y color.');
          if (variant.stock < item.quantity) throw new ConflictException('Stock insuficiente para la talla y color seleccionados.');
          await client.query('UPDATE "variant" SET stock = stock - $1 WHERE id = $2', [item.quantity, variant.id]);
          size = variant.size;
          color = variant.color;
        } else if (item.variantId) throw new BadRequestException('La variante no pertenece al producto.');
        if (product.stock < item.quantity) throw new ConflictException('Stock insuficiente para completar la venta.');
        product.stock -= item.quantity;
        const cents = priceInCents(product.price);
        totalCents += cents * item.quantity;
        if (!Number.isSafeInteger(totalCents) || totalCents > 9999999999) throw new BadRequestException('El total supera el límite permitido.');
        prepared.push({ ...item, price: (cents / 100).toFixed(2), size, color });
      }
      const total = (totalCents / 100).toFixed(2);
      const order = await client.query(`
        INSERT INTO "order" (id, "customerName", "customerPhone", total, status, "inventoryReserved", "idempotencyKey", "requestFingerprint", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), $1, $2, $3, 'PAID', true, $4, $5, NOW(), NOW()) RETURNING id
      `, [name, phone || null, total, sale.requestId ?? null, fingerprint]);
      const orderId = order.rows[0].id;
      for (const item of prepared) await client.query(`
        INSERT INTO "orderItem" (id, "orderId", "productId", "variantId", size, color, quantity, price)
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7)
      `, [orderId, item.productId, item.variantId ?? null, item.size, item.color, item.quantity, item.price]);
      for (const [productId, product] of products) await client.query('UPDATE "product" SET stock = $1, "updatedAt" = NOW() WHERE id = $2', [product.stock, productId]);
      return { success: true, orderId, total };
    });
  }
}

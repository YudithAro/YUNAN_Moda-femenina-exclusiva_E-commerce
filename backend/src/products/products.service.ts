import { BadRequestException, ConflictException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import crypto from 'node:crypto';
import type { PoolClient } from 'pg';
import { createClient } from '@supabase/supabase-js';
import { pool } from '../database.js';

type VariantInput = { id?: string; size: string | null; color: string | null; stock: number };
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const variantsSelect = `COALESCE((SELECT json_agg(v ORDER BY v.size, v.color, v.id) FROM "variant" v WHERE v."productId" = p.id), '[]'::json) AS variants`;

function quantity(value: unknown): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value > 2147483647) throw new BadRequestException('Las existencias deben ser un entero mayor o igual a cero.');
  return value;
}
function strings(value: unknown, label: string, maxLength = 100): string[] {
  if (!Array.isArray(value) || value.length > 100 || value.some(item => typeof item !== 'string' || item.length > maxLength)) throw new BadRequestException(`${label} inválidos.`);
  return [...new Set((value as string[]).map(item => item.trim()).filter(Boolean))];
}
function variantInputs(value: unknown): VariantInput[] {
  if (!Array.isArray(value) || value.length > 200) throw new BadRequestException('La lista de variantes no es válida.');
  const keys = new Set<string>();
  return value.map((raw: unknown) => {
    if (!raw || typeof raw !== 'object') throw new BadRequestException('Variante inválida.');
    const item = raw as Record<string, unknown>;
    const normalize = (entry: unknown) => {
      if (entry === undefined || entry === null || entry === '') return null;
      if (typeof entry !== 'string' || entry.trim().length > 100) throw new BadRequestException('Talla o color inválido.');
      return entry.trim() || null;
    };
    const size = normalize(item.size);
    const color = normalize(item.color);
    const key = JSON.stringify([size?.toLowerCase() ?? '', color?.toLowerCase() ?? '']);
    if (keys.has(key)) throw new BadRequestException('Hay combinaciones de talla y color repetidas.');
    keys.add(key);
    if (item.id !== undefined && (typeof item.id !== 'string' || !uuid.test(item.id))) throw new BadRequestException('Identificador de variante inválido.');
    return { id: item.id as string | undefined, size, color, stock: quantity(item.stock) };
  });
}

@Injectable()
export class ProductsService {
  private supabaseUrl = process.env.SUPABASE_URL;
  private supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  private supabase = this.supabaseUrl && this.supabaseKey ? createClient(this.supabaseUrl, this.supabaseKey) : null;

  async uploadImage(file: Express.Multer.File): Promise<string> {
    if (!this.supabase) throw new ServiceUnavailableException('El almacenamiento de imágenes no está configurado.');
    const formats: Record<string, { extension: string; valid: (buffer: Buffer) => boolean }> = {
      'image/jpeg': { extension: 'jpg', valid: buffer => buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff },
      'image/png': { extension: 'png', valid: buffer => buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) },
      'image/webp': { extension: 'webp', valid: buffer => buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP' },
    };
    const format = formats[file.mimetype];
    if (!format || !file.buffer || file.buffer.length > 5 * 1024 * 1024 || !format.valid(file.buffer)) throw new BadRequestException('Sube una imagen JPG, PNG o WebP válida de hasta 5 MB.');
    const fileName = `${crypto.randomUUID()}.${format.extension}`;
    const { error } = await this.supabase.storage.from('products').upload(fileName, file.buffer, { contentType: file.mimetype, upsert: false });
    if (error) throw new ServiceUnavailableException('No se pudo guardar la imagen. Inténtalo nuevamente.');
    return this.supabase.storage.from('products').getPublicUrl(fileName).data.publicUrl;
  }

  async findAll() {
    const { rows } = await pool.query(`SELECT p.*, row_to_json(c) AS category, ${variantsSelect} FROM "product" p LEFT JOIN "category" c ON p."categoryId" = c.id ORDER BY p."createdAt" DESC`);
    return rows;
  }

  async getLowStock(threshold = 10) {
    const { rows } = await pool.query(`SELECT p.*, row_to_json(c) AS category, ${variantsSelect} FROM "product" p LEFT JOIN "category" c ON p."categoryId" = c.id WHERE p.stock <= $1 ORDER BY p.stock ASC`, [threshold]);
    return rows;
  }

  async findOne(id: string) {
    if (!uuid.test(id)) throw new BadRequestException('Identificador de producto inválido.');
    const { rows } = await pool.query(`SELECT p.*, row_to_json(c) AS category, ${variantsSelect} FROM "product" p LEFT JOIN "category" c ON p."categoryId" = c.id WHERE p.id = $1`, [id]);
    if (!rows.length) throw new NotFoundException('Producto no encontrado.');
    return rows[0];
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
      const code = (error as { code?: string }).code;
      if (code === '23505') throw new ConflictException('Ya existe un producto o variante con esos datos.');
      if (code === '23503') throw new ConflictException('Revisa la categoría o los pedidos asociados al producto.');
      throw error;
    } finally { client.release(); }
  }

  private validate(data: unknown, creating: boolean): Record<string, unknown> {
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new BadRequestException('Producto inválido.');
    const input = { ...data } as Record<string, unknown>;
    if (creating || input.name !== undefined) {
      if (typeof input.name !== 'string' || !input.name.trim() || input.name.trim().length > 200) throw new BadRequestException('Nombre de producto inválido.');
      input.name = input.name.trim();
    }
    if (input.description !== undefined && input.description !== null && (typeof input.description !== 'string' || input.description.length > 10000)) throw new BadRequestException('Descripción inválida.');
    if (creating || input.price !== undefined) {
      if (typeof input.price !== 'number' || !Number.isFinite(input.price) || input.price < 0 || input.price > 99999999.99 || Math.abs(input.price * 100 - Math.round(input.price * 100)) > 0.000001) throw new BadRequestException('El precio debe ser positivo y tener como máximo dos decimales.');
    }
    if (input.categoryId !== undefined && (typeof input.categoryId !== 'string' || !uuid.test(input.categoryId))) throw new BadRequestException('Categoría inválida.');
    if (input.slug !== undefined && (typeof input.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug) || input.slug.length > 220)) throw new BadRequestException('Slug inválido.');
    if (input.stock !== undefined) quantity(input.stock);
    if (input.sizes !== undefined) input.sizes = strings(input.sizes, 'Tallas');
    if (input.colors !== undefined) input.colors = strings(input.colors, 'Colores');
    if (input.images !== undefined) {
      input.images = strings(input.images, 'Enlaces de imágenes', 2048);
      if ((input.images as string[]).some(url => !url.startsWith('/uploads/') && !/^https?:\/\//i.test(url))) throw new BadRequestException('Enlace de imagen inválido.');
    }
    if (input.variants !== undefined) input.variants = variantInputs(input.variants);
    return input;
  }

  private async saveVariants(client: PoolClient, productId: string, variants: VariantInput[]) {
    const existing = await client.query('SELECT * FROM "variant" WHERE "productId" = $1 ORDER BY id FOR UPDATE', [productId]);
    if (!variants.length && existing.rows.length) throw new BadRequestException('Conserva las variantes existentes; puedes poner sus existencias en cero.');
    if (!variants.length) return;
    if (!existing.rows.length) {
      const openOrders = await client.query(`SELECT oi.id FROM "orderItem" oi JOIN "order" o ON o.id = oi."orderId"
        WHERE oi."productId" = $1 AND oi."variantId" IS NULL AND o."inventoryReserved" = true
          AND o.status IN ('PENDING', 'PAID') LIMIT 1`, [productId]);
      if (openOrders.rows.length) throw new ConflictException('Completa o cancela las ventas abiertas de este producto antes de distribuir sus existencias por talla y color.');
    }
    // Never delete variants: order cancellations must be able to restore the original combination.
    await client.query('UPDATE "variant" SET stock = 0 WHERE "productId" = $1', [productId]);
    for (const variant of variants) {
      const matching = existing.rows.find(row => (row.size ?? '').toLowerCase() === (variant.size ?? '').toLowerCase() && (row.color ?? '').toLowerCase() === (variant.color ?? '').toLowerCase());
      if (variant.id && (!matching || variant.id !== matching.id)) throw new BadRequestException('La talla y color de una variante existente no pueden cambiar. Agrega una combinación nueva.');
      if (matching) await client.query('UPDATE "variant" SET stock = $1 WHERE id = $2', [variant.stock, matching.id]);
      else await client.query('INSERT INTO "variant" (id, "productId", size, color, stock) VALUES ($1, $2, $3, $4, $5)', [crypto.randomUUID(), productId, variant.size, variant.color, variant.stock]);
    }
    const total = variants.reduce((sum, variant) => sum + variant.stock, 0);
    quantity(total);
    await client.query(`UPDATE "product" SET stock = $1,
      sizes = ARRAY(SELECT DISTINCT size FROM "variant" WHERE "productId" = $2 AND size IS NOT NULL ORDER BY size),
      colors = ARRAY(SELECT DISTINCT color FROM "variant" WHERE "productId" = $2 AND color IS NOT NULL ORDER BY color),
      "updatedAt" = NOW() WHERE id = $2`, [total, productId]);
  }

  async create(raw: unknown) {
    const data = this.validate(raw, true);
    const id = crypto.randomUUID();
    await this.transaction(async client => {
      let categoryId = data.categoryId;
      if (!categoryId) {
        const category = await client.query('SELECT id FROM "category" WHERE slug = $1', ['general']);
        categoryId = category.rows[0]?.id;
        if (!categoryId) throw new BadRequestException('Selecciona una categoría para el producto.');
      }
      const baseSlug = String(data.name).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'producto';
      const slug = data.slug ?? `${baseSlug}-${id.slice(0, 8)}`;
      await client.query(`INSERT INTO "product" (id, name, slug, description, price, "categoryId", images, stock, sizes, colors, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
      [id, data.name, slug, data.description ?? null, data.price, categoryId, data.images ?? [], data.stock ?? 0, data.sizes ?? [], data.colors ?? []]);
      if (data.variants !== undefined) await this.saveVariants(client, id, data.variants as VariantInput[]);
    });
    return this.findOne(id);
  }

  async update(id: string, raw: unknown) {
    if (!uuid.test(id)) throw new BadRequestException('Identificador de producto inválido.');
    const data = this.validate(raw, false);
    await this.transaction(async client => {
      const result = await client.query('SELECT * FROM "product" WHERE id = $1 FOR UPDATE', [id]);
      const current = result.rows[0];
      if (!current) throw new NotFoundException('Producto no encontrado.');
      const existingVariants = await client.query('SELECT id FROM "variant" WHERE "productId" = $1', [id]);
      if (existingVariants.rows.length && data.variants === undefined) {
        if (data.stock !== undefined && data.stock !== current.stock) throw new BadRequestException('Actualiza las existencias por talla y color.');
        delete data.stock; delete data.sizes; delete data.colors;
      }
      const merged = { ...current, ...data };
      await client.query(`UPDATE "product" SET name = $1, description = $2, price = $3, stock = $4,
        "categoryId" = $5, sizes = $6, colors = $7, images = $8, "updatedAt" = NOW() WHERE id = $9`,
      [merged.name, merged.description, merged.price, merged.stock, merged.categoryId, merged.sizes ?? [], merged.colors ?? [], merged.images ?? [], id]);
      if (data.variants !== undefined) await this.saveVariants(client, id, data.variants as VariantInput[]);
    });
    return this.findOne(id);
  }

  async remove(id: string) {
    if (!uuid.test(id)) throw new BadRequestException('Identificador de producto inválido.');
    return this.transaction(async client => {
      const result = await client.query('SELECT * FROM "product" WHERE id = $1 FOR UPDATE', [id]);
      if (!result.rows.length) throw new NotFoundException('Producto no encontrado.');
      const orders = await client.query('SELECT id FROM "orderItem" WHERE "productId" = $1 LIMIT 1', [id]);
      if (orders.rows.length) throw new ConflictException('El producto tiene ventas registradas. Conserva su historial y coloca las existencias en cero.');
      await client.query('DELETE FROM "variant" WHERE "productId" = $1', [id]);
      await client.query('DELETE FROM "product" WHERE id = $1', [id]);
      return result.rows[0];
    });
  }
}

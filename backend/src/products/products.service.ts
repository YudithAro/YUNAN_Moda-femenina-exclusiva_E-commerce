import { Injectable, NotFoundException } from '@nestjs/common';
import pg from 'pg';
import crypto from 'crypto';

import 'dotenv/config';
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZAanthony200399@localhost:5432/tienda_ropa?schema=public', ssl: process.env.DATABASE_URL?.includes('supabase') ? { rejectUnauthorized: false } : undefined
});

@Injectable()
export class ProductsService {
  async findAll() {
    const { rows } = await pool.query(`
      SELECT p.*, row_to_json(c) as category 
      FROM "product" p
      LEFT JOIN "category" c ON p."categoryId" = c.id
      ORDER BY p."createdAt" DESC
    `);
    return rows;
  }

  async getLowStock(threshold: number = 10) {
    const { rows } = await pool.query(`
      SELECT p.*, row_to_json(c) as category 
      FROM "product" p
      LEFT JOIN "category" c ON p."categoryId" = c.id
      WHERE p.stock <= $1
      ORDER BY p.stock ASC
    `, [threshold]);
    return rows;
  }

  async findOne(id: string) {
    const { rows } = await pool.query(`
      SELECT p.*, row_to_json(c) as category 
      FROM "product" p
      LEFT JOIN "category" c ON p."categoryId" = c.id
      WHERE p.id = $1
    `, [id]);
    
    if (rows.length === 0) throw new NotFoundException('Product not found');
    return rows[0];
  }

  async create(data: any) {
    let categoryId = data.categoryId;
    
    // Auto-assign "General" category if missing
    if (!categoryId) {
      const { rows } = await pool.query('SELECT id FROM "category" WHERE slug = $1', ['general']);
      if (rows.length > 0) {
        categoryId = rows[0].id;
      }
    }
    
    const slug = data.slug || (data.name ? data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '');
    const id = crypto.randomUUID();
    const images = data.images || [];
    
    const { rows } = await pool.query(`
      INSERT INTO "product" (id, name, slug, description, price, "categoryId", images, stock, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *
    `, [id, data.name, slug, data.description || null, data.price, categoryId, images, data.stock || 0]);
    
    return rows[0];
  }

  async update(id: string, data: any) {
    let query = `
      UPDATE "product"
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          price = COALESCE($3, price),
          stock = COALESCE($4, stock),
          "categoryId" = COALESCE($5, "categoryId"),
          "updatedAt" = NOW()
    `;
    
    const params: any[] = [data.name, data.description, data.price, data.stock, data.categoryId];
    
    if (data.images !== undefined) {
      query += `, images = $6 WHERE id = $7 RETURNING *`;
      params.push(JSON.stringify(data.images), id); // pg handles array of json or jsonb, stringifying helps if type is json
    } else {
      query += ` WHERE id = $6 RETURNING *`;
      params.push(id);
    }
    
    // Convert array to postgres array format or json string if it's a jsonb column
    // The create method uses $7 directly, which pg driver maps to JSON if the column is jsonb.
    // Let's use the same behavior as create:
    if (data.images !== undefined) {
      params[5] = data.images; // Use raw array for pg driver to serialize
    }
    
    const { rows } = await pool.query(query, params);
    
    return rows[0];
  }

  async remove(id: string) {
    const { rows } = await pool.query(`
      DELETE FROM "product" WHERE id = $1 RETURNING *
    `, [id]);
    return rows[0];
  }
}

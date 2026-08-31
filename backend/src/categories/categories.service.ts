import { Injectable, NotFoundException } from '@nestjs/common';
import pg from 'pg';
import crypto from 'crypto';

import 'dotenv/config';
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZAanthony200399@localhost:5432/tienda_ropa?schema=public', ssl: process.env.DATABASE_URL?.includes('supabase') ? { rejectUnauthorized: false } : undefined
});

@Injectable()
export class CategoriesService {
  async findAll() {
    const { rows } = await pool.query(`
      SELECT * FROM "category"
      ORDER BY "createdAt" DESC
    `);
    return rows;
  }

  async findOne(id: string) {
    const { rows } = await pool.query(`
      SELECT * FROM "category" WHERE id = $1
    `, [id]);
    
    if (rows.length === 0) throw new NotFoundException('Category not found');
    return rows[0];
  }

  async create(data: any) {
    const slug = data.slug || (data.name ? data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '');
    const id = crypto.randomUUID();
    
    const { rows } = await pool.query(`
      INSERT INTO "category" (id, name, slug, description, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING *
    `, [id, data.name, slug, data.description || null]);
    
    return rows[0];
  }

  async update(id: string, data: any) {
    const { rows } = await pool.query(`
      UPDATE "category"
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          "updatedAt" = NOW()
      WHERE id = $3
      RETURNING *
    `, [data.name, data.description, id]);
    
    return rows[0];
  }

  async remove(id: string) {
    const { rows } = await pool.query(`
      DELETE FROM "category" WHERE id = $1 RETURNING *
    `, [id]);
    return rows[0];
  }
}

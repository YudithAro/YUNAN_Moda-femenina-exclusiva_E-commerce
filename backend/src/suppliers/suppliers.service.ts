import { Injectable, NotFoundException } from '@nestjs/common';
import pg from 'pg';
import crypto from 'crypto';

import 'dotenv/config';
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZAanthony200399@localhost:5432/tienda_ropa?schema=public', ssl: process.env.DATABASE_URL?.includes('supabase') ? { rejectUnauthorized: false } : undefined
});

@Injectable()
export class SuppliersService {
  async findAll() {
    const { rows } = await pool.query(`
      SELECT * FROM "supplier"
      ORDER BY "createdAt" DESC
    `);
    return rows;
  }

  async findOne(id: string) {
    const { rows } = await pool.query(`
      SELECT * FROM "supplier" WHERE id = $1
    `, [id]);
    
    if (rows.length === 0) throw new NotFoundException('Supplier not found');
    return rows[0];
  }

  async create(data: any) {
    const id = crypto.randomUUID();
    
    const { rows } = await pool.query(`
      INSERT INTO "supplier" (id, name, "contactName", email, phone, active, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *
    `, [id, data.name, data.contactName || null, data.email || null, data.phone || null, data.active !== undefined ? data.active : true]);
    
    return rows[0];
  }

  async update(id: string, data: any) {
    const { rows } = await pool.query(`
      UPDATE "supplier"
      SET name = COALESCE($1, name),
          "contactName" = COALESCE($2, "contactName"),
          email = COALESCE($3, email),
          phone = COALESCE($4, phone),
          active = COALESCE($5, active),
          "updatedAt" = NOW()
      WHERE id = $6
      RETURNING *
    `, [data.name, data.contactName, data.email, data.phone, data.active, id]);
    
    return rows[0];
  }

  async remove(id: string) {
    const { rows } = await pool.query(`
      DELETE FROM "supplier" WHERE id = $1 RETURNING *
    `, [id]);
    return rows[0];
  }
}

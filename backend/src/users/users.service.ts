import { Injectable } from '@nestjs/common';
import pg from 'pg';
import crypto from 'crypto';

import 'dotenv/config';
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZAanthony200399@localhost:5432/tienda_ropa?schema=public', ssl: process.env.DATABASE_URL?.includes('supabase') ? { rejectUnauthorized: false } : undefined
});

@Injectable()
export class UsersService {
  async findAll() {
    const { rows } = await pool.query(`
      SELECT id, name, email, role, "createdAt" FROM "user"
      ORDER BY "createdAt" DESC
    `);
    
    // Attach order counts to each user for the dashboard
    for (const user of rows) {
      const ordersRes = await pool.query(`
        SELECT COUNT(*) as count FROM "order" WHERE "userId" = $1
      `, [user.id]);
      user.orderCount = parseInt(ordersRes.rows[0].count, 10);
      
      const totalRes = await pool.query(`
        SELECT SUM(total) as total FROM "order" WHERE "userId" = $1 AND status != 'CANCELLED'
      `, [user.id]);
      user.totalSpent = parseFloat(totalRes.rows[0].total) || 0;
    }
    
    return rows;
  }

  async findByEmail(email: string): Promise<any> {
    const { rows } = await pool.query('SELECT * FROM "user" WHERE email = $1', [email]);
    return rows[0] || null;
  }

  async create(data: any): Promise<any> {
    const id = data.id || crypto.randomUUID();

    const { rows } = await pool.query(`
      INSERT INTO "user" (id, name, email, role, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING *
    `, [id, data.name, data.email, data.role || 'USER']);
    
    return rows[0];
  }

  async updateRole(id: string, role: string) {
    const { rows } = await pool.query(`
      UPDATE "user"
      SET role = $1, "updatedAt" = NOW()
      WHERE id = $2
      RETURNING *
    `, [role, id]);
    
    return rows[0];
  }

  async updateId(oldId: string, newId: string) {
    // Intentamos actualizar el ID (puede fallar si hay foreign keys, pero como es cuenta nueva/admin debería estar bien)
    try {
      await pool.query(`UPDATE "user" SET id = $1 WHERE id = $2`, [newId, oldId]);
    } catch (e) {
      console.error('Error updating user ID:', e);
    }
  }
}

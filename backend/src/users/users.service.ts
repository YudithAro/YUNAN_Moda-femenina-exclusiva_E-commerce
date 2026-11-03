import { ConflictException, Injectable } from '@nestjs/common';
import { pool } from '../database.js';
import type { AuthUser } from '../auth/auth.types.js';

@Injectable()
export class UsersService {
  async findAll() {
    const { rows } = await pool.query(`
      SELECT u.id, u.name, u.email, u.role, u."createdAt",
        COUNT(o.id)::int AS "orderCount",
        COALESCE(SUM(o.total) FILTER (WHERE o.status IN ('PAID', 'SHIPPED', 'DELIVERED')), 0) AS "totalSpent"
      FROM "user" u LEFT JOIN "order" o ON o."userId" = u.id
      GROUP BY u.id ORDER BY u."createdAt" DESC
    `);
    return rows.map(row => ({ ...row, totalSpent: Number(row.totalSpent) }));
  }

  async syncVerifiedUser(data: { id: string; email: string; name: string }): Promise<AuthUser> {
    try {
      const { rows } = await pool.query(`
        INSERT INTO "user" (id, name, email, role, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, 'USER', NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email, "updatedAt" = NOW()
        RETURNING id, email, name, role
      `, [data.id, data.name.trim().slice(0, 120) || data.email.split('@')[0], data.email]);
      return rows[0];
    } catch (error) {
      if ((error as { code?: string }).code === '23505') {
        throw new ConflictException('Este correo tiene un perfil anterior. El administrador debe vincularlo con su ID de Supabase.');
      }
      throw error;
    }
  }
}

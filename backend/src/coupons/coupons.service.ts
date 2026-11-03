import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { pool } from '../database.js';
import crypto from 'crypto';
import { bodyRecord, booleanValue, positiveAmount, requiredText, requireChanges, uuid } from '../input-validation.js';

function couponCode(value: unknown) {
  const code = requiredText(value, 'El código', 64).toUpperCase();
  if (code.length > 64 || !/^[A-Z0-9_-]+$/.test(code)) throw new BadRequestException('El código solo puede contener hasta 64 letras, números, guiones y guiones bajos.');
  return code;
}

function couponType(value: unknown): 'PERCENTAGE' | 'FIXED' {
  if (value !== 'PERCENTAGE' && value !== 'FIXED') throw new BadRequestException('El tipo de descuento debe ser PERCENTAGE o FIXED.');
  return value;
}

@Injectable()
export class CouponsService {
  async findAll() {
    const { rows } = await pool.query(`
      SELECT * FROM "coupon"
      ORDER BY "createdAt" DESC
    `);
    return rows;
  }

  async findOne(id: string) {
    uuid(id);
    const { rows } = await pool.query(`
      SELECT * FROM "coupon" WHERE id = $1
    `, [id]);
    
    if (rows.length === 0) throw new NotFoundException('El cupón no existe.');
    return rows[0];
  }

  async create(input: unknown) {
    const data = bodyRecord(input);
    const code = couponCode(data.code);
    const discount = positiveAmount(data.discount);
    const type = data.type === undefined ? 'PERCENTAGE' : couponType(data.type);
    const active = data.active === undefined ? true : booleanValue(data.active, 'El estado activo');
    if (type === 'PERCENTAGE' && discount > 100) throw new BadRequestException('El descuento porcentual no puede superar 100.');
    const id = crypto.randomUUID();
    
    const { rows } = await pool.query(`
      INSERT INTO "coupon" (id, code, discount, type, active, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `, [id, code, discount, type, active]);
    
    return rows[0];
  }

  async update(id: string, input: unknown) {
    uuid(id);
    const data = bodyRecord(input);
    requireChanges(data, ['code', 'discount', 'type', 'active']);
    const code = data.code === undefined ? null : couponCode(data.code);
    const discount = data.discount === undefined ? null : positiveAmount(data.discount);
    const type = data.type === undefined ? null : couponType(data.type);
    const active = data.active === undefined ? null : booleanValue(data.active, 'El estado activo');
    if (type === 'PERCENTAGE' && discount !== null && discount > 100) throw new BadRequestException('El descuento porcentual no puede superar 100.');
    const { rows } = await pool.query(`
      UPDATE "coupon"
      SET code = COALESCE($1, code),
          discount = COALESCE($2, discount),
          type = COALESCE($3, type),
          active = COALESCE($4, active),
          "updatedAt" = NOW()
      WHERE id = $5
        AND (COALESCE($3, type) = 'FIXED' OR COALESCE($2, discount) <= 100)
      RETURNING *
    `, [code, discount, type, active, id]);
    
    if (!rows.length) {
      await this.findOne(id);
      throw new BadRequestException('El descuento porcentual no puede superar 100.');
    }
    return rows[0];
  }

  async remove(id: string) {
    uuid(id);
    const { rows } = await pool.query(`
      DELETE FROM "coupon" WHERE id = $1 RETURNING *
    `, [id]);
    if (!rows.length) throw new NotFoundException('El cupón no existe.');
    return rows[0];
  }
}

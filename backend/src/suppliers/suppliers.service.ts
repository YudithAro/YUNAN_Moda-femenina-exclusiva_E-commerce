import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { pool } from '../database.js';
import crypto from 'crypto';
import { bodyRecord, booleanValue, nullableText, requiredText, requireChanges, uuid } from '../input-validation.js';

function supplierEmail(value: unknown) {
  const email = nullableText(value, 'El correo', 254);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new BadRequestException('El correo no es válido.');
  return email?.toLowerCase() || null;
}

function supplierPhone(value: unknown) {
  const phone = nullableText(value, 'El teléfono', 30);
  if (phone && (!/^\+?[()\d.\s-]+$/.test(phone) || !/^\d{6,15}$/.test(phone.replace(/\D/g, '')))) throw new BadRequestException('El teléfono debe contener entre 6 y 15 dígitos.');
  return phone;
}

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
    uuid(id);
    const { rows } = await pool.query(`
      SELECT * FROM "supplier" WHERE id = $1
    `, [id]);
    
    if (rows.length === 0) throw new NotFoundException('El proveedor no existe.');
    return rows[0];
  }

  async create(input: unknown) {
    const data = bodyRecord(input);
    const name = requiredText(data.name, 'El nombre', 150);
    const contactName = data.contactName === undefined ? null : nullableText(data.contactName, 'El contacto', 120);
    const email = data.email === undefined ? null : supplierEmail(data.email);
    const phone = data.phone === undefined ? null : supplierPhone(data.phone);
    const active = data.active === undefined ? true : booleanValue(data.active, 'El estado activo');
    const id = crypto.randomUUID();
    
    const { rows } = await pool.query(`
      INSERT INTO "supplier" (id, name, "contactName", email, phone, active, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *
    `, [id, name, contactName, email, phone, active]);
    
    return rows[0];
  }

  async update(id: string, input: unknown) {
    uuid(id);
    const data = bodyRecord(input);
    requireChanges(data, ['name', 'contactName', 'email', 'phone', 'active']);
    const name = data.name === undefined ? null : requiredText(data.name, 'El nombre', 150);
    const contactName = data.contactName === undefined ? null : nullableText(data.contactName, 'El contacto', 120);
    const email = data.email === undefined ? null : supplierEmail(data.email);
    const phone = data.phone === undefined ? null : supplierPhone(data.phone);
    const active = data.active === undefined ? null : booleanValue(data.active, 'El estado activo');
    const { rows } = await pool.query(`
      UPDATE "supplier"
      SET name = COALESCE($1, name),
          "contactName" = CASE WHEN $7::boolean THEN $2 ELSE "contactName" END,
          email = CASE WHEN $8::boolean THEN $3 ELSE email END,
          phone = CASE WHEN $9::boolean THEN $4 ELSE phone END,
          active = COALESCE($5, active),
          "updatedAt" = NOW()
      WHERE id = $6
      RETURNING *
    `, [name, contactName, email, phone, active, id, data.contactName !== undefined, data.email !== undefined, data.phone !== undefined]);
    
    if (!rows.length) throw new NotFoundException('El proveedor no existe.');
    return rows[0];
  }

  async remove(id: string) {
    uuid(id);
    const { rows } = await pool.query(`
      DELETE FROM "supplier" WHERE id = $1 RETURNING *
    `, [id]);
    if (!rows.length) throw new NotFoundException('El proveedor no existe.');
    return rows[0];
  }
}

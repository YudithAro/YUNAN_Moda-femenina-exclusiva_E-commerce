import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { pool } from '../database.js';
import crypto from 'crypto';
import { bodyRecord, nullableText, requiredText, requireChanges, uuid } from '../input-validation.js';

function categorySlug(value: unknown) {
  const slug = requiredText(value, 'El enlace de la categoría', 160).toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new BadRequestException('El enlace solo puede contener letras sin tildes, números y guiones.');
  }
  return slug;
}

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
    uuid(id);
    const { rows } = await pool.query(`
      SELECT * FROM "category" WHERE id = $1
    `, [id]);
    
    if (rows.length === 0) throw new NotFoundException('La categoría no existe.');
    return rows[0];
  }

  async create(input: unknown) {
    const data = bodyRecord(input);
    const name = requiredText(data.name, 'El nombre', 120);
    const id = crypto.randomUUID();
    const generated = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const slug = data.slug === undefined ? generated || `categoria-${id.slice(0, 8)}` : categorySlug(data.slug);
    const description = data.description === undefined ? null : nullableText(data.description, 'La descripción', 2000, true);
    
    const { rows } = await pool.query(`
      INSERT INTO "category" (id, name, slug, description, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING *
    `, [id, name, slug, description]);
    
    return rows[0];
  }

  async update(id: string, input: unknown) {
    uuid(id);
    const data = bodyRecord(input);
    requireChanges(data, ['name', 'slug', 'description']);
    const name = data.name === undefined ? null : requiredText(data.name, 'El nombre', 120);
    const slug = data.slug === undefined ? null : categorySlug(data.slug);
    const description = data.description === undefined ? null : nullableText(data.description, 'La descripción', 2000, true);
    const { rows } = await pool.query(`
      UPDATE "category"
      SET name = COALESCE($1, name),
          description = CASE WHEN $4::boolean THEN $2 ELSE description END,
          slug = COALESCE($5, slug),
          "updatedAt" = NOW()
      WHERE id = $3
      RETURNING *
    `, [name, description, id, data.description !== undefined, slug]);
    
    if (!rows.length) throw new NotFoundException('La categoría no existe.');
    return rows[0];
  }

  async remove(id: string) {
    uuid(id);
    const { rows } = await pool.query(`
      DELETE FROM "category" WHERE id = $1 RETURNING *
    `, [id]);
    if (!rows.length) throw new NotFoundException('La categoría no existe.');
    return rows[0];
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import pg from 'pg';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

import 'dotenv/config';
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZAanthony200399@localhost:5432/tienda_ropa?schema=public', ssl: process.env.DATABASE_URL?.includes('supabase') ? { rejectUnauthorized: false } : undefined
});

@Injectable()
export class ProductsService {
  private supabaseUrl = process.env.SUPABASE_URL;
  private supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  private supabase = (this.supabaseUrl && this.supabaseKey) ? createClient(this.supabaseUrl, this.supabaseKey) : null;

  async uploadImage(file: Express.Multer.File): Promise<string> {
    if (!this.supabase) {
      throw new Error('Las credenciales de Supabase (SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY) no están configuradas en el .env del backend.');
    }
    
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${fileExt}`;

    const { data, error } = await this.supabase.storage
      .from('products')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) {
      console.error('Error uploading to Supabase Storage:', error);
      throw error;
    }

    const { data: publicUrlData } = this.supabase.storage
      .from('products')
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  }
  
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
    const sizes = data.sizes || [];
    const colors = data.colors || [];
    
    const { rows } = await pool.query(`
      INSERT INTO "product" (id, name, slug, description, price, "categoryId", images, stock, sizes, colors, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
      RETURNING *
    `, [id, data.name, slug, data.description || null, data.price, categoryId, images, data.stock || 0, sizes, colors]);
    
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
          sizes = COALESCE($6, sizes),
          colors = COALESCE($7, colors),
          "updatedAt" = NOW()
    `;
    
    const params: any[] = [data.name, data.description, data.price, data.stock, data.categoryId, data.sizes, data.colors];
    
    if (data.images !== undefined) {
      query += `, images = $8 WHERE id = $9 RETURNING *`;
      params.push(JSON.stringify(data.images), id); 
    } else {
      query += ` WHERE id = $8 RETURNING *`;
      params.push(id);
    }
    
    if (data.images !== undefined) {
      params[7] = data.images; 
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

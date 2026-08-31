import { Injectable, NotFoundException } from '@nestjs/common';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZAanthony200399@localhost:5432/tienda_ropa?schema=public'
});

@Injectable()
export class OrdersService {
  async findAll() {
    // Fetch orders with user details
    const { rows } = await pool.query(`
      SELECT 
        o.id, o.total, o.status, o."createdAt",
        json_build_object('id', u.id, 'name', u.name, 'email', u.email) as user
      FROM "order" o
      LEFT JOIN "user" u ON o."userId" = u.id
      ORDER BY o."createdAt" DESC
    `);
    
    // We could fetch order items here or in a separate call.
    // For a dashboard, simple listing is fine. We can attach item counts.
    for (const order of rows) {
      const itemsRes = await pool.query(`
        SELECT COUNT(*) as count FROM "orderItem" WHERE "orderId" = $1
      `, [order.id]);
      order.itemCount = parseInt(itemsRes.rows[0].count, 10);
    }
    
    return rows;
  }

  async findOne(id: string) {
    const { rows } = await pool.query(`
      SELECT 
        o.*,
        json_build_object('id', u.id, 'name', u.name, 'email', u.email) as user
      FROM "order" o
      LEFT JOIN "user" u ON o."userId" = u.id
      WHERE o.id = $1
    `, [id]);
    
    if (rows.length === 0) throw new NotFoundException('Order not found');
    const order = rows[0];

    // Fetch items
    const items = await pool.query(`
      SELECT 
        oi.id, oi.quantity, oi.price,
        json_build_object('id', p.id, 'name', p.name, 'images', p.images) as product
      FROM "orderItem" oi
      LEFT JOIN "product" p ON oi."productId" = p.id
      WHERE oi."orderId" = $1
    `, [id]);
    
    order.items = items.rows;
    return order;
  }

  async updateStatus(id: string, status: string) {
    const { rows } = await pool.query(`
      UPDATE "order"
      SET status = $1, "updatedAt" = NOW()
      WHERE id = $2
      RETURNING *
    `, [status, id]);
    
    return rows[0];
  }

  async createManual(data: any) {
    let total = 0;
    for (const item of data.items) {
      total += (item.quantity * item.price);
    }

    const { rows: orderRows } = await pool.query(`
      INSERT INTO "order" (id, "customerName", "customerPhone", total, status, "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), $1, $2, $3, 'PAID', NOW(), NOW())
      RETURNING id
    `, [data.customerName, data.customerPhone, total]);
    
    const orderId = orderRows[0].id;

    for (const item of data.items) {
      await pool.query(`
        INSERT INTO "orderItem" (id, "orderId", "productId", quantity, price)
        VALUES (gen_random_uuid(), $1, $2, $3, $4)
      `, [orderId, item.productId, item.quantity, item.price]);
      
      await pool.query(`
        UPDATE "product" SET stock = GREATEST(stock - $1, 0) WHERE id = $2
      `, [item.quantity, item.productId]);
    }
    
    return { success: true, orderId };
  }
}

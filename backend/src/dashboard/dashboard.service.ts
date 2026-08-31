import { Injectable } from '@nestjs/common';
import pg from 'pg';

import 'dotenv/config';
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZAanthony200399@localhost:5432/tienda_ropa?schema=public', ssl: process.env.DATABASE_URL?.includes('supabase') ? { rejectUnauthorized: false } : undefined
});

@Injectable()
export class DashboardService {
  async getMetrics() {
    try {
      // 1. Total de ingresos (Status != CANCELLED)
      const revenueResult = await pool.query(`
        SELECT COALESCE(SUM(total), 0) as total_revenue FROM "order" WHERE status != 'CANCELLED'
      `);
      
      // 2. Total de pedidos
      const ordersResult = await pool.query(`
        SELECT COUNT(*) as total_orders FROM "order"
      `);
      
      // 3. Clientes registrados
      const usersResult = await pool.query(`
        SELECT COUNT(*) as total_users FROM "user" WHERE role = 'USER'
      `);
      
      // 4. Productos con bajo stock (<= 10)
      const lowStockResult = await pool.query(`
        SELECT COUNT(*) as low_stock_items FROM "product" WHERE stock <= 10
      `);

      // 5. Gráfico de ingresos mensuales (Últimos 6 meses)
      const monthlyRevenue = await pool.query(`
        SELECT 
          to_char(DATE_TRUNC('month', "createdAt"), 'Mon') as name,
          SUM(total) as total
        FROM "order"
        WHERE status != 'CANCELLED' AND "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY DATE_TRUNC('month', "createdAt") ASC
      `);

      // 6. Últimos pedidos recientes
      const recentOrders = await pool.query(`
        SELECT 
          o.id, 
          o.total, 
          o.status, 
          o."createdAt",
          COALESCE(o."customerName", u.name) as customer_name,
          COALESCE(o."customerPhone", u.email) as customer_email
        FROM "order" o
        LEFT JOIN "user" u ON o."userId" = u.id
        ORDER BY o."createdAt" DESC
        LIMIT 5
      `);

      // 7. Pedidos por Estado
      const ordersByStatus = await pool.query(`
        SELECT status, COUNT(*) as count FROM "order" GROUP BY status
      `);

      // 8. Top 5 Productos más vendidos
      const topProducts = await pool.query(`
        SELECT p.name, SUM(oi.quantity) as total_sold
        FROM "orderItem" oi
        JOIN "product" p ON oi."productId" = p.id
        GROUP BY p.id, p.name
        ORDER BY total_sold DESC
        LIMIT 5
      `);

      return {
        totalRevenue: parseFloat(revenueResult.rows[0].total_revenue),
        totalOrders: parseInt(ordersResult.rows[0].total_orders, 10),
        totalUsers: parseInt(usersResult.rows[0].total_users, 10),
        lowStockItems: parseInt(lowStockResult.rows[0].low_stock_items, 10),
        monthlyRevenue: monthlyRevenue.rows.map(r => ({ name: r.name, total: parseFloat(r.total) })),
        recentOrders: recentOrders.rows,
        ordersByStatus: ordersByStatus.rows.map(r => ({ name: r.status, value: parseInt(r.count, 10) })),
        topProducts: topProducts.rows.map(r => ({ name: r.name, sold: parseInt(r.total_sold, 10) }))
      };
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      throw error;
    }
  }
}

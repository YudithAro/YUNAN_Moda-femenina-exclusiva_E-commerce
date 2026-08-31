import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  const users = await pool.query('SELECT count(*) FROM "user"');
  const productsCount = await pool.query('SELECT count(*) FROM "product"');
  console.log('users:', users.rows[0].count);
  console.log('products count:', productsCount.rows[0].count);
  const products = await pool.query('SELECT name FROM "product"');
  console.log('products:', products.rows);
  pool.end();
}

check();

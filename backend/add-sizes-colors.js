import pg from 'pg';
import 'dotenv/config';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function addColumns() {
  console.log('Connecting to database...');
  try {
    await pool.query(`
      ALTER TABLE "product" 
      ADD COLUMN IF NOT EXISTS "sizes" TEXT[] DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS "colors" TEXT[] DEFAULT '{}';
    `);
    console.log('✅ Columns sizes and colors added to product table successfully!');
  } catch (err) {
    console.error('❌ Error modifying table:', err);
  } finally {
    pool.end();
  }
}

addColumns();

import pg from 'pg';
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZAanthony200399@localhost:5432/tienda_ropa?schema=public'
});

async function run() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "coupon" (
        "id" VARCHAR(255) PRIMARY KEY,
        "code" VARCHAR(255) UNIQUE NOT NULL,
        "discount" DECIMAL NOT NULL,
        "type" VARCHAR(50) NOT NULL DEFAULT 'PERCENTAGE',
        "active" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Table coupon created successfully');
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();

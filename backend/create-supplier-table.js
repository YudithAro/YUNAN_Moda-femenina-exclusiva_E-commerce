import pg from 'pg';
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZAanthony200399@localhost:5432/tienda_ropa?schema=public'
});

async function run() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "supplier" (
        "id" VARCHAR(255) PRIMARY KEY,
        "name" VARCHAR(255) NOT NULL,
        "contactName" VARCHAR(255),
        "email" VARCHAR(255),
        "phone" VARCHAR(50),
        "active" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Table supplier created successfully');
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();

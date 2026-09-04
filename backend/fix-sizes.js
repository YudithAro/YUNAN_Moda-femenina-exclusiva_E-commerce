import pg from 'pg';
import 'dotenv/config';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZAanthony200399@localhost:5432/tienda_ropa?schema=public',
  ssl: process.env.DATABASE_URL?.includes('supabase') ? { rejectUnauthorized: false } : undefined
});

async function fixSizes() {
  await pool.query('UPDATE product SET sizes = $1, colors = $2 WHERE name = $3', [['S', 'M'], ['Negro', 'Beige', 'Plomo'], 'Polo']);
  console.log("Fixed Polo sizes and colors");
  process.exit(0);
}

fixSizes();

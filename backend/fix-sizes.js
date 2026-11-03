import pg from 'pg';
import 'dotenv/config';
if (!process.env.DATABASE_URL) throw new Error('Configura DATABASE_URL.');

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('supabase') ? { rejectUnauthorized: false } : undefined
});

async function fixSizes() {
  await pool.query('UPDATE product SET sizes = $1, colors = $2 WHERE name = $3', [['S', 'M'], ['Negro', 'Beige', 'Plomo'], 'Polo']);
  console.log("Fixed Polo sizes and colors");
  process.exit(0);
}

fixSizes();

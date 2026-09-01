import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    await pool.query('ALTER TABLE "user" DROP COLUMN IF EXISTS "password"');
    console.log('Password column dropped successfully.');
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();

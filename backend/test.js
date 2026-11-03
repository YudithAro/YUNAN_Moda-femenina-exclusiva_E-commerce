import pg from 'pg';
import 'dotenv/config';
if (!process.env.DATABASE_URL) throw new Error('Configura DATABASE_URL.');
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
pool.query('SELECT COALESCE(SUM(total), 0) as total_revenue FROM "order" WHERE status != \'CANCELLED\'').then(res => console.log('OK', res.rows)).catch(err => console.error('ERROR', err)).finally(() => pool.end());

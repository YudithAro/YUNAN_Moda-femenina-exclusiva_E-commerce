import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://postgres:Tienda_Ropa@db.mmvgezwaijypyshwjjeo.supabase.co:5432/postgres', ssl: { rejectUnauthorized: false } });
pool.query('SELECT COALESCE(SUM(total), 0) as total_revenue FROM "order" WHERE status != \'CANCELLED\'').then(res => console.log('OK', res.rows)).catch(err => console.error('ERROR', err)).finally(() => pool.end());

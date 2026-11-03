import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { pool } from '../dist/database.js';

let client;
try {
  if (!process.argv.includes('--check') && new URL(process.env.DATABASE_URL).port === '6543') {
    throw new Error('Usa conexión directa o Session Pooler (5432) para ejecutar migraciones.');
  }
  client = await pool.connect();
  const { rows: [role] } = await client.query(`
    SELECT current_user AS name, rolsuper OR rolbypassrls AS bypass
    FROM pg_roles WHERE rolname = current_user
  `);
  const { rows: [ownership] } = await client.query(`
    SELECT bool_and(pg_has_role(current_user, c.relowner, 'USAGE')) AS owns
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname IN ('user', 'product', 'variant', 'order', 'orderItem')
  `);
  if (!role.bypass && !ownership.owns) throw new Error('La conexión de la API debe ser propietaria de las tablas o tener BYPASSRLS.');
  if (process.argv.includes('--check')) {
    const { rows } = await client.query(`
      SELECT table_name, column_name FROM information_schema.columns
      WHERE table_schema = 'public' AND
        ((table_name = 'order' AND column_name = 'inventoryReserved') OR
         (table_name = 'orderItem' AND column_name = 'variantId'))
    `);
    console.log(rows.length === 2 ? 'Conexión y columnas de inventario verificadas.' : 'Conexión verificada. La migración de inventario todavía está pendiente.');
  } else {
    await client.query("SELECT pg_advisory_lock(hashtext('yunan-safe-migrations'))");
    for (const name of ['20261102_inventory_safety.sql', '20261102_api_access.sql']) {
      const sql = await readFile(new URL(`../migrations/${name}`, import.meta.url), 'utf8');
      await client.query(sql);
      console.log(`Migración aplicada: ${name}`);
    }
  }
} catch (error) {
  await client?.query('ROLLBACK').catch(() => {});
  console.error('No se completó la migración. Revisa la conexión, los permisos y las instrucciones de INVENTORY.md.');
  if (error?.code) console.error(`Código PostgreSQL: ${error.code}`);
  process.exitCode = 1;
} finally {
  await client?.query("SELECT pg_advisory_unlock(hashtext('yunan-safe-migrations'))").catch(() => {});
  client?.release();
  await pool.end();
}

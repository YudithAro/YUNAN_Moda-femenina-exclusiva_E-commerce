import pg from 'pg';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ZAanthony200399@localhost:5432/tienda_ropa?schema=public'
});

async function run() {
  try {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash('admin123', salt);
    const id = crypto.randomUUID();

    // Comprobar si ya existe admin@yunan.com
    const check = await pool.query('SELECT * FROM "user" WHERE email = $1', ['admin@yunan.com']);
    if (check.rows.length > 0) {
       console.log('El usuario admin@yunan.com ya existe. Actualizando contraseña...');
       await pool.query('UPDATE "user" SET password = $1, role = $2 WHERE email = $3', [hashedPassword, 'ADMIN', 'admin@yunan.com']);
    } else {
       await pool.query(`
         INSERT INTO "user" (id, name, email, password, role, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       `, [id, 'Administrador Yunan', 'admin@yunan.com', hashedPassword, 'ADMIN']);
       console.log('Administrador creado con éxito.');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();

import 'dotenv/config';
import pg from 'pg';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://mmvgezwaijypyshwjjeo.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('❌ Debes configurar SUPABASE_SECRET_KEY en tu archivo .env');
  process.exit(1);
}

async function createAdminUser() {
  const email = 'admin@yunan.com';
  const password = 'admin-investigacion';

  // Primero intentamos borrar el usuario existente si lo hay
  console.log('Buscando usuarios existentes con ese email...');
  const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    headers: {
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY,
    },
  });

  if (listRes.ok) {
    const data = await listRes.json();
    const existing = data.users?.find(u => u.email === email);
    if (existing) {
      console.log(`Usuario existente encontrado (ID: ${existing.id}). Eliminando...`);
      await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${existing.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'apikey': SERVICE_ROLE_KEY,
        },
      });
      console.log('Usuario anterior eliminado.');
    }
  }

  // Crear usuario admin con email ya confirmado
  console.log('Creando usuario admin con email confirmado...');
  const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { name: 'Administrador YUNAN' },
      app_metadata: { role: 'ADMIN' },
    }),
  });

  const result = await createRes.json();

  if (createRes.ok) {
    console.log('✅ ¡Usuario admin creado exitosamente!');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   ID Supabase: ${result.id}`);
    
    // Ahora sincronizar con nuestra tabla local
    console.log('\nSincronizando con base de datos local...');
    
    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });

    // Verificar si ya existe
    const check = await pool.query('SELECT * FROM "user" WHERE email = $1', [email]);
    if (check.rows.length > 0) {
      await pool.query('UPDATE "user" SET id = $1, role = $2, "updatedAt" = NOW() WHERE email = $3', [result.id, 'ADMIN', email]);
      console.log('✅ Usuario local actualizado con ID de Supabase y rol ADMIN.');
    } else {
      await pool.query(`
        INSERT INTO "user" (id, name, email, role, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, NOW(), NOW())
      `, [result.id, 'Administrador YUNAN', email, 'ADMIN']);
      console.log('✅ Usuario local creado con rol ADMIN.');
    }

    await pool.end();
  } else {
    console.error('❌ Error al crear usuario:', JSON.stringify(result, null, 2));
  }
}

createAdminUser().catch(console.error);

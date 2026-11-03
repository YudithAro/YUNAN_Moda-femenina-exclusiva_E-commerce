import 'dotenv/config';
import { pool } from '../dist/database.js';

const email = process.env.ADMIN_EMAIL?.trim();
if (!email) {
  console.error('Configura ADMIN_EMAIL con el correo de una cuenta existente y confirmada en Supabase Auth.');
  await pool.end();
  process.exitCode = 1;
} else {
  try {
    const { rows: [account] } = await pool.query(
      'SELECT id, email, raw_user_meta_data FROM auth.users WHERE lower(email) = lower($1) AND email_confirmed_at IS NOT NULL', [email],
    );
    if (!account) throw new Error('La cuenta debe existir y tener el correo confirmado en Supabase Auth.');
    const { rows: [previous] } = await pool.query('SELECT id FROM public."user" WHERE lower(email) = lower($1)', [account.email]);
    if (previous && previous.id !== account.id) {
      throw new Error('El perfil anterior tiene otro ID. Vincula su historial con el ID verificado de Supabase antes de asignar el rol.');
    }
    const name = typeof account.raw_user_meta_data?.name === 'string' ? account.raw_user_meta_data.name.slice(0, 120) : account.email.split('@')[0];
    await pool.query(`
      INSERT INTO public."user" (id, name, email, role, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, 'ADMIN', NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET role = 'ADMIN', "updatedAt" = NOW()
    `, [account.id, name, account.email]);
    console.log('Rol de administrador asignado a la cuenta verificada.');
  } catch (error) {
    console.error(error?.code ? `No se pudo asignar el rol (${error.code}).` : error.message);
    process.exitCode = 1;
  } finally { await pool.end(); }
}

// Requires an existing confirmed Supabase account and ADMIN_EMAIL.
import('./scripts/grant-admin.mjs').catch(() => { process.exitCode = 1; });

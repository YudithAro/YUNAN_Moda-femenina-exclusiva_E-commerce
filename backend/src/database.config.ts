import type { PoolConfig } from 'pg';
import { readFileSync } from 'node:fs';

const sslParameters = new Set(['ssl', 'sslmode', 'sslcert', 'sslkey', 'sslrootcert', 'uselibpqcompat', 'sslnegotiation']);

/** Keep URL options from overriding the deployment's explicit TLS policy in pg. */
export function databaseOptions(env: NodeJS.ProcessEnv = process.env): PoolConfig {
  const max = Number(env.DATABASE_POOL_MAX || 5);
  if (!Number.isInteger(max) || max < 1 || max > 50) throw new Error('DATABASE_POOL_MAX debe ser un entero entre 1 y 50.');
  for (const key of ['DATABASE_SSL', 'DATABASE_SSL_REJECT_UNAUTHORIZED']) {
    if (env[key] !== undefined && env[key] !== '' && env[key] !== 'true' && env[key] !== 'false') {
      throw new Error(key + ' debe ser true o false.');
    }
  }
  let connectionString = env.DATABASE_URL;
  let supabase = false;
  let urlRequestsTls = false;
  if (connectionString) {
    let parsed: URL;
    try {
      parsed = new URL(connectionString);
      if (!['postgres:', 'postgresql:'].includes(parsed.protocol) || !parsed.hostname) throw new Error();
    } catch { throw new Error('DATABASE_URL debe ser una URL PostgreSQL válida.'); }
    const host = parsed.hostname.toLowerCase();
    supabase = ['supabase.co', 'supabase.com'].some(domain => host === domain || host.endsWith('.' + domain));
    const sslMode = parsed.searchParams.get('sslmode');
    const sslFlag = parsed.searchParams.get('ssl');
    urlRequestsTls = Boolean(sslMode && sslMode !== 'disable')
      || Boolean(sslFlag && sslFlag !== 'false' && sslFlag !== '0')
      || ['sslcert', 'sslkey', 'sslrootcert'].some(key => Boolean(parsed.searchParams.get(key)))
      || parsed.searchParams.get('sslnegotiation') === 'direct';
    // pg reparses connectionString after merging its config, replacing ssl and CA.
    // Authentication/query parameters unrelated to TLS remain unchanged.
    for (const key of sslParameters) parsed.searchParams.delete(key);
    connectionString = parsed.toString();
  }
  const tls = env.DATABASE_SSL === 'true' || (env.DATABASE_SSL !== 'false' && (supabase || urlRequestsTls));
  return {
    connectionString,
    max,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    ssl: tls ? {
      rejectUnauthorized: env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false',
      ...(env.DATABASE_SSL_CA
        ? { ca: env.DATABASE_SSL_CA.replace(/\\n/g, '\n') }
        : supabase ? { ca: readFileSync(new URL('../certs/supabase-root-2021.crt', import.meta.url), 'utf8') } : {}),
    } : false,
  };
}

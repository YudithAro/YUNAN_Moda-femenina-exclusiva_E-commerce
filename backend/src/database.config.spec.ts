import pg from 'pg';
import { describe, expect, it } from 'vitest';
import { databaseOptions } from './database.config.js';

const cloud = 'postgresql://user:fake@project.supabase.co:5432/postgres';
const local = 'postgresql://user:fake@localhost:5432/postgres';
function actualSsl(env: NodeJS.ProcessEnv) {
  // Constructing a Client parses its configuration without opening a connection.
  const client = new pg.Client(databaseOptions(env));
  return (client as unknown as { connectionParameters: { ssl: unknown } }).connectionParameters.ssl;
}

describe('PostgreSQL TLS configuration', () => {
  it.each(['sslmode=require', 'sslmode=disable', 'sslmode=no-verify', 'ssl=false', 'sslmode=require&uselibpqcompat=true'])('keeps Supabase verification and CA despite URL parameter %s', option => {
    expect(actualSsl({ DATABASE_URL: cloud + '?' + option, DATABASE_SSL_CA: 'BEGIN\\nCA\\nEND' })).toEqual({
      rejectUnauthorized: true, ca: 'BEGIN\nCA\nEND',
    });
  });

  it('detects the Supabase pooler by hostname', () => {
    expect(actualSsl({ DATABASE_URL: 'postgresql://user:fake@aws-0-us-east-1.pooler.supabase.com:5432/postgres' })).toEqual({ rejectUnauthorized: true });
  });

  it('does not infer TLS from credentials or lookalike domains', () => {
    expect(databaseOptions({ DATABASE_URL: 'postgresql://supabase:fake@localhost:5432/postgres' }).ssl).toBe(false);
    expect(databaseOptions({ DATABASE_URL: 'postgresql://user:fake@supabase.co.example.org:5432/postgres' }).ssl).toBe(false);
  });

  it('retains TLS requested in a non-Supabase URL with verification enabled', () => {
    for (const parameter of ['sslmode=require', 'ssl=no-verify', 'sslrootcert=ignored']) {
      expect(actualSsl({ DATABASE_URL: local + '?' + parameter })).toEqual({ rejectUnauthorized: true });
    }
  });

  it('allows an explicit local TLS override without connection-string options reversing it', () => {
    expect(actualSsl({ DATABASE_URL: local + '?sslmode=require', DATABASE_SSL: 'false' })).toBe(false);
    expect(actualSsl({ DATABASE_URL: local + '?sslmode=disable', DATABASE_SSL: 'true' })).toEqual({ rejectUnauthorized: true });
  });

  it('permits disabling verification only by explicit environment configuration', () => {
    expect(actualSsl({ DATABASE_URL: cloud, DATABASE_SSL_REJECT_UNAUTHORIZED: 'false' })).toEqual({ rejectUnauthorized: false });
  });

  it('preserves unrelated query parameters and removes certificate-file options', () => {
    const config = databaseOptions({ DATABASE_URL: cloud + '?application_name=yunan&sslmode=require&sslcert=ignored&sslkey=ignored&sslrootcert=ignored&sslnegotiation=direct' });
    const parsed = new URL(config.connectionString!);
    expect([...parsed.searchParams.entries()]).toEqual([['application_name', 'yunan']]);
    expect(actualSsl({ DATABASE_URL: config.connectionString })).toEqual({ rejectUnauthorized: true });
  });

  it.each(['0', '-1', '1.5', '51', 'invalid', 'Infinity'])('rejects invalid pool size %s', max => {
    expect(() => databaseOptions({ DATABASE_POOL_MAX: max })).toThrow('DATABASE_POOL_MAX');
  });

  it('keeps the pool bounded and rejects malformed configuration without echoing secrets', () => {
    expect(databaseOptions({}).max).toBe(5);
    expect(databaseOptions({ DATABASE_POOL_MAX: '50' }).max).toBe(50);
    expect(() => databaseOptions({ DATABASE_URL: 'not-a-url-with-a-secret' })).toThrow('DATABASE_URL debe ser una URL PostgreSQL válida.');
    expect(() => databaseOptions({ DATABASE_SSL: 'yes' })).toThrow('DATABASE_SSL debe ser true o false.');
  });
});

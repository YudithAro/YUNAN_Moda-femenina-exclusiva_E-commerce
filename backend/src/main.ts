import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { HttpErrorFilter } from './http-error.filter.js';
import { corsOrigins } from './deployment.config.js';
import { pool } from './database.js';

async function bootstrap() {
  for (const key of ['DATABASE_URL', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']) {
    if (!process.env[key]) throw new Error(`Falta configurar ${key}.`);
  }
  const origins = corsOrigins();
  if (process.env.RENDER === 'true') {
    // Do not accept traffic until this release's schema and TLS connection work.
    await pool.query('SELECT "inventoryReserved", "idempotencyKey", "requestFingerprint" FROM "order" LIMIT 0');
    await pool.query('SELECT "variantId", size, color FROM "orderItem" LIMIT 0');
  }
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: origins, methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'OPTIONS'], allowedHeaders: ['Authorization', 'Content-Type'] });
  app.useGlobalFilters(new HttpErrorFilter());
  app.use((_req: unknown, res: { setHeader: (name: string, value: string) => void }, next: () => void) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Cache-Control', 'no-store');
    next();
  });
  app.enableShutdownHooks();
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
await bootstrap();

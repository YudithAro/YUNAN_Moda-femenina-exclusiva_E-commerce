import pg from 'pg';
import 'dotenv/config';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  console.log('Connecting to Supabase...');
  try {
    await pool.query(`
      DROP TABLE IF EXISTS "OrderItem" CASCADE;
      DROP TABLE IF EXISTS "orderItem" CASCADE;
      DROP TABLE IF EXISTS "Variant" CASCADE;
      DROP TABLE IF EXISTS "variant" CASCADE;
      DROP TABLE IF EXISTS "Product" CASCADE;
      DROP TABLE IF EXISTS "product" CASCADE;
      DROP TABLE IF EXISTS "Category" CASCADE;
      DROP TABLE IF EXISTS "category" CASCADE;
      DROP TABLE IF EXISTS "order" CASCADE;
      DROP TABLE IF EXISTS "Coupon" CASCADE;
      DROP TABLE IF EXISTS "coupon" CASCADE;
      DROP TABLE IF EXISTS "Supplier" CASCADE;
      DROP TABLE IF EXISTS "supplier" CASCADE;
      DROP TABLE IF EXISTS "user" CASCADE;

      CREATE TABLE IF NOT EXISTS "user" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "email" TEXT UNIQUE NOT NULL,
        "password" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "role" TEXT DEFAULT 'USER',
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS "category" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" TEXT UNIQUE NOT NULL,
        "slug" TEXT UNIQUE NOT NULL,
        "description" TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS "product" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" TEXT NOT NULL,
        "slug" TEXT UNIQUE NOT NULL,
        "description" TEXT,
        "price" DECIMAL(10,2) NOT NULL,
        "categoryId" UUID REFERENCES "category"("id"),
        "images" TEXT[],
        "stock" INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS "variant" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "productId" UUID REFERENCES "product"("id"),
        "size" TEXT,
        "color" TEXT,
        "stock" INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS "order" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" UUID REFERENCES "user"("id"),
        "customerName" TEXT,
        "customerPhone" TEXT,
        "total" DECIMAL(10,2) NOT NULL,
        "status" TEXT DEFAULT 'PENDING',
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS "orderItem" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "orderId" UUID REFERENCES "order"("id"),
        "productId" UUID REFERENCES "product"("id"),
        "quantity" INTEGER NOT NULL,
        "price" DECIMAL(10,2) NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS "coupon" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "code" TEXT UNIQUE NOT NULL,
        "discount" DECIMAL(10,2) NOT NULL,
        "type" TEXT NOT NULL,
        "expiresAt" TIMESTAMP,
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS "supplier" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" TEXT NOT NULL,
        "contactEmail" TEXT,
        "contactPhone" TEXT,
        "address" TEXT,
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Supabase Migration completed successfully! All tables created.');
  } catch (err) {
    console.error('❌ Error migrating to Supabase:', err);
  } finally {
    pool.end();
  }
}

migrate();

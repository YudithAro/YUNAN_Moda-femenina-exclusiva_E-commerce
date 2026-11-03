-- Additive migration for the Render API / Supabase PostgreSQL database.
-- Run once before deploying the updated API. Safe to run again.
-- No existing stock, orders, products or variants are removed or redistributed.
BEGIN;

ALTER TABLE "product"
  ADD COLUMN IF NOT EXISTS sizes text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS colors text[] NOT NULL DEFAULT '{}';

ALTER TABLE "order"
  ADD COLUMN IF NOT EXISTS "inventoryReserved" boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "idempotencyKey" uuid,
  ADD COLUMN IF NOT EXISTS "requestFingerprint" text;

ALTER TABLE "orderItem"
  ADD COLUMN IF NOT EXISTS "variantId" uuid,
  ADD COLUMN IF NOT EXISTS size text,
  ADD COLUMN IF NOT EXISTS color text;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orderItem_variantId_inventory_fk' AND conrelid = '"orderItem"'::regclass) THEN
    ALTER TABLE "orderItem" ADD CONSTRAINT "orderItem_variantId_inventory_fk"
      FOREIGN KEY ("variantId") REFERENCES "variant"(id) ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_stock_nonnegative' AND conrelid = 'product'::regclass) THEN
    ALTER TABLE "product" ADD CONSTRAINT product_stock_nonnegative CHECK (stock >= 0) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'variant_stock_nonnegative' AND conrelid = 'variant'::regclass) THEN
    ALTER TABLE "variant" ADD CONSTRAINT variant_stock_nonnegative CHECK (stock >= 0) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'order_item_positive_quantity' AND conrelid = '"orderItem"'::regclass) THEN
    ALTER TABLE "orderItem" ADD CONSTRAINT order_item_positive_quantity CHECK (quantity > 0) NOT VALID;
  END IF;
END $$;

-- If old duplicate combinations exist, this fails and rolls back without deleting them.
-- Reconcile duplicate rows and associated stock before retrying.
CREATE UNIQUE INDEX IF NOT EXISTS variant_product_size_color_inventory_key
  ON "variant" ("productId", lower(COALESCE(size, '')), lower(COALESCE(color, '')));
CREATE UNIQUE INDEX IF NOT EXISTS order_idempotency_inventory_key ON "order" ("idempotencyKey") WHERE "idempotencyKey" IS NOT NULL;
CREATE INDEX IF NOT EXISTS orderItem_orderId_inventory_idx ON "orderItem" ("orderId");
CREATE INDEX IF NOT EXISTS orderItem_productId_inventory_idx ON "orderItem" ("productId");
CREATE INDEX IF NOT EXISTS orderItem_variantId_inventory_idx ON "orderItem" ("variantId");
CREATE INDEX IF NOT EXISTS order_createdAt_inventory_idx ON "order" ("createdAt" DESC);

COMMIT;

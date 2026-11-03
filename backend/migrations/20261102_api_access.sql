-- Business data is read/written through the authenticated Render API.
-- Supabase browser clients are used for Auth and public product images.
-- Apply with the database owner. The API connection role must bypass RLS.
BEGIN;
DO $$
DECLARE table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['user', 'category', 'product', 'variant', 'order', 'orderItem', 'coupon', 'supplier'] LOOP
    IF to_regclass(format('public.%I', table_name)) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
      -- Revoking privileges also closes access through old permissive policies.
      EXECUTE format('REVOKE ALL ON TABLE public.%I FROM PUBLIC, anon, authenticated', table_name);
    END IF;
  END LOOP;
END $$;
COMMIT;

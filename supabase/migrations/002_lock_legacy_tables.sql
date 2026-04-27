-- After Sanity becomes the source of truth, prevent any writes to the legacy tables.
-- Reads remain allowed for the inert period (~2 weeks) for rollback safety.

-- Drop any existing write policies (if they exist).
DROP POLICY IF EXISTS "categories_insert" ON public.categories;
DROP POLICY IF EXISTS "categories_update" ON public.categories;
DROP POLICY IF EXISTS "categories_delete" ON public.categories;
DROP POLICY IF EXISTS "sub_categories_insert" ON public.sub_categories;
DROP POLICY IF EXISTS "sub_categories_update" ON public.sub_categories;
DROP POLICY IF EXISTS "sub_categories_delete" ON public.sub_categories;
DROP POLICY IF EXISTS "services_insert" ON public.services;
DROP POLICY IF EXISTS "services_update" ON public.services;
DROP POLICY IF EXISTS "services_delete" ON public.services;

-- Revoke INSERT/UPDATE/DELETE from the anon and authenticated roles entirely.
REVOKE INSERT, UPDATE, DELETE ON public.categories FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.sub_categories FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.services FROM anon, authenticated;

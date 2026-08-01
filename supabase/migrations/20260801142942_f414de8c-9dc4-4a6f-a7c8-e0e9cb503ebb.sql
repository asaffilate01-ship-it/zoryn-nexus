DROP POLICY IF EXISTS "Authenticated can write provider resources" ON public.provider_resources;
REVOKE INSERT, UPDATE, DELETE ON public.provider_resources FROM authenticated;
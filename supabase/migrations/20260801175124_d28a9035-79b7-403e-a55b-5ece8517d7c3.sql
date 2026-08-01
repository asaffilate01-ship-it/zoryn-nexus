DROP POLICY IF EXISTS "Authenticated can read provider resources" ON public.provider_resources;
CREATE POLICY "Authenticated can read demo provider resources" ON public.provider_resources
  FOR SELECT TO authenticated USING (is_demo = true);

DROP POLICY IF EXISTS "Authenticated can read onboarding actions" ON public.onboarding_actions;
CREATE POLICY "Authenticated can read demo onboarding actions" ON public.onboarding_actions
  FOR SELECT TO authenticated USING (is_demo = true);
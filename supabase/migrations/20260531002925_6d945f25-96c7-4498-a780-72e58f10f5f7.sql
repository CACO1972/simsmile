-- Lock down simulation_credits: remove permissive public policies.
-- All real access happens via edge functions with service_role (bypasses RLS).
DROP POLICY IF EXISTS "Allow insert from edge function" ON public.simulation_credits;
DROP POLICY IF EXISTS "Allow select by email" ON public.simulation_credits;
DROP POLICY IF EXISTS "Allow update payment status" ON public.simulation_credits;

ALTER TABLE public.simulation_credits ENABLE ROW LEVEL SECURITY;

-- Revoke client-role privileges; service_role keeps full access (bypasses RLS).
REVOKE ALL ON public.simulation_credits FROM anon, authenticated;
GRANT ALL ON public.simulation_credits TO service_role;
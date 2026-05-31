REVOKE EXECUTE ON FUNCTION public.update_completed_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.qa_bypass_emails FROM anon, authenticated;
GRANT ALL ON public.qa_bypass_emails TO service_role;
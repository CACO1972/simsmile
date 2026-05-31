
-- LEADS: captura sin pago
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'simulation_unlock',
  detected_gender TEXT,
  has_simulation BOOLEAN NOT NULL DEFAULT false,
  has_skin_analysis BOOLEAN NOT NULL DEFAULT false,
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.leads TO anon, authenticated;
GRANT ALL ON public.leads TO service_role;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede insertar un lead (form público)
CREATE POLICY "Anyone can submit a lead"
  ON public.leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Solo service role lee (no exponer base de leads al cliente)
-- (no SELECT policy => bloqueado por default para anon/authenticated)

CREATE INDEX idx_leads_email ON public.leads(email);
CREATE INDEX idx_leads_created_at ON public.leads(created_at DESC);

-- BYPASS QA
CREATE TABLE public.qa_bypass_emails (
  email TEXT PRIMARY KEY,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.qa_bypass_emails TO service_role;

ALTER TABLE public.qa_bypass_emails ENABLE ROW LEVEL SECURITY;
-- Sin policies => solo service role accede vía edge functions

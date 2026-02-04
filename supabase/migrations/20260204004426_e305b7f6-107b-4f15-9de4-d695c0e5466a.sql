-- Tabla para gestionar compras y créditos de simulaciones
CREATE TABLE public.simulation_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  phone TEXT,
  credits_total INTEGER NOT NULL DEFAULT 3,
  credits_used INTEGER NOT NULL DEFAULT 0,
  amount_paid INTEGER NOT NULL DEFAULT 5990,
  currency TEXT NOT NULL DEFAULT 'CLP',
  flow_order_id TEXT,
  flow_payment_status TEXT DEFAULT 'pending',
  package_type TEXT NOT NULL DEFAULT 'basic',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  paid_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '30 days')
);

-- Índices para búsqueda rápida
CREATE INDEX idx_simulation_credits_email ON public.simulation_credits(email);
CREATE INDEX idx_simulation_credits_flow_order ON public.simulation_credits(flow_order_id);

-- Habilitar RLS
ALTER TABLE public.simulation_credits ENABLE ROW LEVEL SECURITY;

-- Política pública para insertar (el pago viene de la edge function)
CREATE POLICY "Allow insert from edge function"
ON public.simulation_credits
FOR INSERT
WITH CHECK (true);

-- Política pública para leer por email (sin auth requerido)
CREATE POLICY "Allow select by email"
ON public.simulation_credits
FOR SELECT
USING (true);

-- Política para actualizar estado de pago
CREATE POLICY "Allow update payment status"
ON public.simulation_credits
FOR UPDATE
USING (true);
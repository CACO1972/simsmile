-- Tabla para guardar análisis de sonrisa
CREATE TABLE public.smile_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Imágenes
  rest_image_url TEXT NOT NULL,
  smile_image_url TEXT NOT NULL,
  simulated_image_url TEXT,
  
  -- Métricas calculadas (JSON para flexibilidad)
  metrics JSONB NOT NULL,
  
  -- Información de contacto (se llena después)
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  contact_submitted BOOLEAN DEFAULT FALSE,
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Para seguimiento de clínica
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'scheduled', 'completed')),
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.smile_analyses ENABLE ROW LEVEL SECURITY;

-- Policy: Cualquiera puede crear un análisis (es público)
CREATE POLICY "Anyone can create analysis"
  ON public.smile_analyses
  FOR INSERT
  WITH CHECK (true);

-- Policy: Cualquiera puede leer su propio análisis por ID
CREATE POLICY "Anyone can read their own analysis"
  ON public.smile_analyses
  FOR SELECT
  USING (true);

-- Policy: Cualquiera puede actualizar su análisis (para agregar contacto)
CREATE POLICY "Anyone can update their analysis"
  ON public.smile_analyses
  FOR UPDATE
  USING (true);

-- Índices para mejorar rendimiento
CREATE INDEX idx_smile_analyses_created_at ON public.smile_analyses(created_at DESC);
CREATE INDEX idx_smile_analyses_status ON public.smile_analyses(status);
CREATE INDEX idx_smile_analyses_contact_email ON public.smile_analyses(contact_email) WHERE contact_email IS NOT NULL;

-- Función para actualizar completed_at automáticamente
CREATE OR REPLACE FUNCTION public.update_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.contact_submitted = TRUE AND OLD.contact_submitted = FALSE THEN
    NEW.completed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para actualizar completed_at
CREATE TRIGGER update_smile_analyses_completed_at
  BEFORE UPDATE ON public.smile_analyses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_completed_at();
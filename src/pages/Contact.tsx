import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSmileAnalysis } from "@/contexts/SmileAnalysisContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  email: z.string().email("Email inválido").max(255),
  phone: z.string().regex(/^[+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, "Teléfono inválido"),
});

export default function Contact() {
  const navigate = useNavigate();
  const { analysisId, setContactData, setContactSubmitted } = useSmileAnalysis();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Proteger ruta
  useEffect(() => {
    if (!analysisId) {
      navigate("/captura-reposo");
    }
  }, [analysisId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      // Validar con Zod
      contactSchema.parse(formData);
      
      setLoading(true);

      // Actualizar en base de datos
      const { error } = await supabase
        .from("smile_analyses")
        .update({
          contact_name: formData.name,
          contact_email: formData.email,
          contact_phone: formData.phone,
          contact_submitted: true,
        })
        .eq("id", analysisId);

      if (error) throw error;

      // Actualizar contexto
      setContactData(formData);
      setContactSubmitted(true);

      toast.success("¡Datos guardados correctamente!");
      navigate("/resultados");
      
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            newErrors[error.path[0] as string] = error.message;
          }
        });
        setErrors(newErrors);
      } else {
        toast.error("Error al guardar los datos");
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Paso 5 de 6</span>
            <span className="text-sm font-medium text-primary">83%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-primary h-2 rounded-full transition-all" style={{ width: '83%' }} />
          </div>
        </div>

        {/* Content */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-lg">
          <div className="bg-primary/10 p-6 border-b border-border">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              📋 Tus Datos de Contacto
            </h1>
            <p className="text-muted-foreground">
              Para enviarte tu análisis completo y agendar una consulta
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Juan Pérez"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="tu@email.com"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono / WhatsApp *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+56 9 1234 5678"
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
              )}
            </div>

            {/* Privacy Notice */}
            <div className="bg-accent/20 p-4 rounded-lg border border-accent">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="text-sm text-foreground">
                  <strong>Tu privacidad es importante.</strong> Usaremos estos datos únicamente para enviarte tu análisis y contactarte sobre tu consulta dental. No compartiremos tu información con terceros.
                </p>
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Al completar recibirás:</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-muted-foreground">Tu simulación de sonrisa transformada</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-muted-foreground">Análisis detallado de tu sonrisa</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-muted-foreground">Posibilidad de agendar consulta gratis</span>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </>
              ) : (
                <>
                  Ver Mis Resultados
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

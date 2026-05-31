import { useState } from "react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Lock, Gift, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getSupabase } from "@/integrations/supabase/safeClient";

const LeadSchema = z.object({
  name: z.string().trim().min(2, "Ingresa tu nombre").max(100, "Nombre muy largo"),
  email: z.string().trim().email("Email inválido").max(255),
  whatsapp: z
    .string()
    .trim()
    .min(8, "WhatsApp inválido")
    .max(20)
    .regex(/^[+\d\s-]+$/, "Solo números, +, espacios o guiones"),
});

interface LeadCaptureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  detectedGender?: 'male' | 'female' | 'neutral';
  idealImage?: string;
  onSuccess: (email: string) => void;
}

export const LeadCaptureModal = ({
  open,
  onOpenChange,
  detectedGender,
  idealImage,
  onSuccess,
}: LeadCaptureModalProps) => {
  const [form, setForm] = useState({ name: '', email: '', whatsapp: '+56 9 ' });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const parsed = LeadSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors({
        name: fieldErrors.name?.[0],
        email: fieldErrors.email?.[0],
        whatsapp: fieldErrors.whatsapp?.[0],
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await getSupabase().functions.invoke('submit-lead', {
        body: {
          ...parsed.data,
          detectedGender,
          idealImage,
        },
      });
      if (error) throw error;

      localStorage.setItem('simsmile_email', parsed.data.email);
      toast.success("¡Listo! Desbloqueamos tu simulación.");
      onSuccess(parsed.data.email);
      onOpenChange(false);
    } catch (err) {
      console.error('Lead submit error:', err);
      toast.error("No pudimos guardar tus datos. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <Gift className="w-8 h-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl text-center">
            Desbloquea tu simulación gratis
          </DialogTitle>
          <DialogDescription className="text-center">
            Déjanos tus datos y te enviamos tu análisis completo + una evaluación gratuita con un especialista.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="lead-name">Nombre *</Label>
            <Input
              id="lead-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Tu nombre"
              autoComplete="name"
              maxLength={100}
              className="mt-1"
            />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="lead-whatsapp">WhatsApp *</Label>
            <Input
              id="lead-whatsapp"
              type="tel"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              placeholder="+56 9 1234 5678"
              autoComplete="tel"
              maxLength={20}
              className="mt-1"
            />
            {errors.whatsapp && <p className="text-xs text-destructive mt-1">{errors.whatsapp}</p>}
          </div>

          <div>
            <Label htmlFor="lead-email">Email *</Label>
            <Input
              id="lead-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="tu@email.com"
              autoComplete="email"
              maxLength={255}
              className="mt-1"
            />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:opacity-90 text-white font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Ver mi sonrisa ideal
              </>
            )}
          </Button>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Lock className="w-3 h-3" />
            <span>Tus datos están protegidos. No spam.</span>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LeadCaptureModal;

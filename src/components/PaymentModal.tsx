import { useState } from "react";
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
import { PricingCard } from "./PricingCard";
import { getSupabase } from "@/integrations/supabase/safeClient";
import { toast } from "sonner";
import { ShieldCheck, Lock } from "lucide-react";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentSuccess?: (email: string) => void;
  defaultPackage?: string; // 'basic' para ir directo al pago de 5990
}

export const PaymentModal = ({ open, onOpenChange, onPaymentSuccess, defaultPackage }: PaymentModalProps) => {
  const [step, setStep] = useState<'email' | 'packages'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [directPayment, setDirectPayment] = useState(!!defaultPackage);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Por favor ingresa tu email');
      return;
    }

    setLoading(true);
    try {
      // Verificar si ya tiene créditos
      const { data, error } = await getSupabase().functions.invoke('flow-payment/check-credits', {
        body: { email }
      });

      if (error) throw error;

      if (data?.hasCredits && data.remainingCredits > 0) {
        toast.success(`¡Ya tienes ${data.remainingCredits} créditos disponibles!`);
        onPaymentSuccess?.(email);
        onOpenChange(false);
        return;
      }

      // Si hay paquete predefinido, ir directo al pago
      if (defaultPackage) {
        await handleSelectPackage(defaultPackage);
      } else {
        setStep('packages');
      }
    } catch (error) {
      console.error('Error checking credits:', error);
      if (defaultPackage) {
        await handleSelectPackage(defaultPackage);
      } else {
        setStep('packages');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPackage = async (packageId: string) => {
    setLoading(true);
    setSelectedPackage(packageId);

    try {
      const { data, error } = await getSupabase().functions.invoke('flow-payment/flow-payment', {
        body: { email, phone, packageType: packageId }
      });

      if (error) throw error;

      if (data?.paymentUrl) {
        // Redirigir a Flow
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('No se recibió URL de pago');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Error al procesar el pago. Intenta de nuevo.');
    } finally {
      setLoading(false);
      setSelectedPackage(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={step === 'packages' ? "max-w-4xl" : "max-w-md"}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {step === 'email' ? 'Ingresa tus datos' : 'Elige tu plan'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {step === 'email' 
              ? 'Para comenzar tu simulación de sonrisa con IA'
              : 'Selecciona el paquete que mejor se adapte a ti'}
          </DialogDescription>
        </DialogHeader>

        {step === 'email' ? (
          <form onSubmit={handleEmailSubmit} className="space-y-6 mt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone">Teléfono (opcional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+56 9 1234 5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Verificando...' : 'Continuar'}
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Lock className="w-3 h-3" />
              <span>Tus datos están protegidos</span>
            </div>
          </form>
        ) : (
          <div className="mt-6">
            <PricingCard
              onSelectPackage={handleSelectPackage}
              loading={loading}
              selectedPackage={selectedPackage || undefined}
            />

            <div className="mt-6 flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Pago seguro con Flow</span>
              </div>
              <div className="flex items-center gap-1">
                <Lock className="w-4 h-4 text-primary" />
                <span>SSL 256-bit</span>
              </div>
            </div>

            <Button
              variant="ghost"
              onClick={() => setStep('email')}
              className="w-full mt-4"
            >
              ← Volver
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
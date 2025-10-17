import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Sparkles, Mail } from "lucide-react";

interface WaitlistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WaitlistModal = ({ open, onOpenChange }: WaitlistModalProps) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !name) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    setIsSubmitting(true);

    try {
      // Aquí integrarías con tu backend/email service
      // Por ahora solo mostramos éxito
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("¡Registrado! Te notificaremos cuando esté disponible 🎉");
      setEmail("");
      setName("");
      onOpenChange(false);
    } catch {
      toast.error("Error al registrarse. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-primary" />
            Versión Premium - Próximamente
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            Sé de los primeros en acceder a:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>Análisis facial completo con 478 puntos de referencia</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>Simulaciones ilimitadas con IA avanzada</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>Reportes PDF profesionales para tu dentista</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>Métricas cefalométricas y análisis DSD</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>Comparativa antes/después interactiva</span>
            </li>
          </ul>

          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
              <Mail className="h-4 w-4" />
              {isSubmitting ? "Registrando..." : "Únete a la Lista de Espera"}
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground">
            🎁 Los primeros 100 registrados obtendrán 50% de descuento
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
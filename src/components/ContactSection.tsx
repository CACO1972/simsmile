import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, User } from "lucide-react";
import { toast } from "sonner";
import simsmileLogo from "@/assets/simsmile-logo-white-bg.png";

interface ContactSectionProps {
  onSubmit: (data: { name: string; email: string; phone: string; message: string }) => void;
}

export const ContactSection = ({ onSubmit }: ContactSectionProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error("Por favor completa los campos requeridos");
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-8 md:py-12 pb-2 md:pb-4 relative overflow-hidden bg-background">
      {/* Animated gradient background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-accent/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-secondary/10 rounded-full blur-[140px]" />
      </div>

      {/* Logo at top */}
      <div className="w-full mb-8 flex justify-center z-10">
        <img src={simsmileLogo} alt="SimSmile" className="w-48 md:w-64 opacity-60 animate-fade-in" />
      </div>

      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col justify-center mt-4 md:mt-0 z-10">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-center mb-4">
          Información de Contacto
        </h2>
        <p className="text-center text-muted-foreground mb-6 md:mb-8 text-sm md:text-base">
          Déjanos tus datos para enviarte el análisis completo
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6 bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-6 md:p-8">
          <div>
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Nombre Completo *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Tu nombre"
              required
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Correo Electrónico *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="tu@email.com"
              required
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Teléfono
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 234 567 890"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="message">Mensaje Adicional</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="¿Tienes alguna pregunta o comentario?"
              className="mt-2"
              rows={4}
            />
          </div>

          <Button type="submit" size="lg" className="w-full">
            Continuar al Análisis
          </Button>
        </form>
      </div>
    </div>
  );
};

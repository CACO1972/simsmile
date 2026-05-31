import { MessageCircle, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CLINIC_WHATSAPP, CLINIC_NAME, CLINIC_BOOKING_URL } from "@/lib/monetization";

interface WhatsAppCTAProps {
  userName?: string;
  variant?: 'banner' | 'card';
}

export const WhatsAppCTA = ({ userName, variant = 'banner' }: WhatsAppCTAProps) => {
  const message = encodeURIComponent(
    `Hola${userName ? ` soy ${userName}` : ''}, vi mi simulación en SimSmile y me gustaría agendar una evaluación gratuita.`
  );
  const waLink = `https://wa.me/${CLINIC_WHATSAPP}?text=${message}`;

  if (variant === 'card') {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 p-6 text-white text-center shadow-xl space-y-3">
        <Calendar className="w-10 h-10 mx-auto" />
        <h3 className="text-xl font-bold">¿Te gusta tu nueva sonrisa?</h3>
        <p className="text-sm opacity-95">
          Primera evaluación gratuita en {CLINIC_NAME}. Reserva tu hora hoy.
        </p>
        <Button
          asChild
          size="lg"
          className="bg-white text-pink-600 hover:bg-white/90 font-bold w-full"
        >
          <a href={CLINIC_BOOKING_URL} target="_blank" rel="noopener noreferrer">
            <Calendar className="w-5 h-5 mr-2" />
            Reservar hora online
            <ArrowRight className="w-4 h-4 ml-2" />
          </a>
        </Button>
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 text-xs text-white/90 hover:text-white underline underline-offset-4"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          O escríbenos por WhatsApp
        </a>
      </div>
    );
  }

  return (
    <div className="sticky bottom-4 z-40 mx-auto max-w-md px-4 space-y-2">
      <Button
        asChild
        size="lg"
        className="w-full h-14 bg-gradient-to-r from-primary to-accent text-white font-bold shadow-2xl shadow-primary/30"
      >
        <a href={CLINIC_BOOKING_URL} target="_blank" rel="noopener noreferrer">
          <Calendar className="w-5 h-5 mr-2" />
          Reservar hora online
          <ArrowRight className="w-4 h-4 ml-2" />
        </a>
      </Button>
      <Button
        asChild
        variant="outline"
        size="sm"
        className="w-full h-10 bg-[#25D366]/10 border-[#25D366]/40 text-[#1ebe5d] hover:bg-[#25D366]/20 hover:text-[#1ebe5d] font-semibold"
      >
        <a href={waLink} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="w-4 h-4 mr-2" />
          O contáctanos por WhatsApp
        </a>
      </Button>
    </div>
  );
};

export default WhatsAppCTA;

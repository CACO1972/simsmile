import { MessageCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CLINIC_WHATSAPP, CLINIC_NAME } from "@/lib/monetization";

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
      <div className="rounded-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 p-6 text-white text-center shadow-xl">
        <Calendar className="w-10 h-10 mx-auto mb-3" />
        <h3 className="text-xl font-bold mb-2">¿Te gusta tu nueva sonrisa?</h3>
        <p className="text-sm opacity-95 mb-4">
          Primera evaluación gratuita en {CLINIC_NAME}. Hablemos hoy.
        </p>
        <Button
          asChild
          size="lg"
          className="bg-white text-pink-600 hover:bg-white/90 font-bold w-full"
        >
          <a href={waLink} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="w-5 h-5 mr-2" />
            Agendar por WhatsApp
          </a>
        </Button>
      </div>
    );
  }

  return (
    <div className="sticky bottom-4 z-40 mx-auto max-w-md px-4">
      <Button
        asChild
        size="lg"
        className="w-full h-14 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold shadow-2xl"
      >
        <a href={waLink} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="w-6 h-6 mr-2" />
          Agendar evaluación gratis
        </a>
      </Button>
    </div>
  );
};

export default WhatsAppCTA;

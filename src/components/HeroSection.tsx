import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import logoMain from "@/assets/simsmile-logo-main.png";

interface HeroSectionProps {
  onStart: () => void;
}

export const HeroSection = ({ onStart }: HeroSectionProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-between px-4 py-12 relative overflow-hidden bg-[hsl(var(--lavender-soft))]">
      
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-lavender/20 via-transparent to-primary/10 animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute inset-0 bg-gradient-to-tl from-primary/5 via-transparent to-lavender/15 animate-[pulse_10s_ease-in-out_infinite_reverse]" />
      </div>
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-primary/30 to-transparent rounded-full blur-3xl animate-[float_15s_ease-in-out_infinite]" />
        <div className="absolute top-2/3 right-1/3 w-40 h-40 bg-gradient-to-br from-lavender/40 to-transparent rounded-full blur-3xl animate-[float_20s_ease-in-out_infinite_reverse]" />
        <div className="absolute bottom-1/4 left-1/2 w-36 h-36 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl animate-[float_18s_ease-in-out_infinite]" />
      </div>

      {/* Logo y contenido principal */}
      <div className="flex-1 flex flex-col items-center justify-center text-center z-10 max-w-2xl w-full">
        <img 
          src={logoMain} 
          alt="SimSmile" 
          className="w-48 md:w-64 mx-auto mb-12 animate-fade-in"
        />
        
        <p className="text-xl md:text-2xl text-foreground/80 mb-6 font-light">
          Descubre el potencial de tu sonrisa con inteligencia artificial
        </p>
        
        <p className="text-base md:text-lg text-muted-foreground font-light">
          Análisis facial avanzado y simulación de diseño de sonrisa en segundos
        </p>
      </div>

      {/* Botón en la parte inferior */}
      <div className="z-10 pb-8">
        <Button
          size="lg"
          onClick={onStart}
          className="text-lg px-12 py-6 bg-gradient-to-r from-gold to-primary hover:opacity-90 transition-all hover:scale-105 shadow-lg"
        >
          <Sparkles className="mr-2" />
          Comenzar Análisis
        </Button>
      </div>
    </div>
  );
};

import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import logoMain from "@/assets/simsmile-logo-main.png";
interface HeroSectionProps {
  onStart: () => void;
}
export const HeroSection = ({
  onStart
}: HeroSectionProps) => {
  return <div className="min-h-screen flex flex-col items-center justify-between px-4 py-12 relative overflow-hidden bg-[hsl(var(--lavender-soft))]">
      
      {/* Subtle background animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-32 h-32">
          <div className="relative w-full h-full rounded-full border-2 border-[#3DD6B4]/20 animate-[spin_20s_linear_infinite]" />
        </div>
        
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40">
          <div className="relative w-full h-full rounded-full border-2 border-[#E91E84]/20 animate-[spin_25s_linear_infinite_reverse]" />
        </div>
      </div>

      {/* Logo y contenido principal */}
      <div className="flex-1 flex flex-col items-center justify-center text-center z-10 max-w-2xl w-full">
        
        
        
        
        <p className="text-base md:text-lg text-muted-foreground font-light">
          Análisis facial avanzado y simulación de diseño de sonrisa en segundos
        </p>
      </div>

      {/* Botón en la parte inferior */}
      <div className="z-10 pb-8">
        <Button size="lg" onClick={onStart} className="text-lg px-12 py-6 bg-gradient-to-r from-gold to-primary hover:opacity-90 transition-all hover:scale-105 shadow-lg">
          <Sparkles className="mr-2" />
          Comenzar Análisis
        </Button>
      </div>
    </div>;
};
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import logoMain from "@/assets/simsmile-logo-minimal.png";

interface HeroSectionProps {
  onStart: () => void;
}

export const HeroSection = ({ onStart }: HeroSectionProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden bg-gradient-to-b from-[#1a0b2e] via-[#2d1b4e] to-[#3d2863]">
      
      {/* Main gradient glow effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-[60%] bg-gradient-to-b from-[hsl(270,100%,75%)] via-[hsl(270,80%,65%)] to-transparent opacity-40 blur-[120px]" />
        <div className="absolute bottom-0 left-0 right-0 h-[50%] bg-gradient-to-t from-[hsl(265,70%,50%)] to-transparent opacity-30 blur-[100px]" />
      </div>
      
      {/* Radial glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-[hsl(280,100%,70%)] rounded-full opacity-20 blur-[150px] animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute top-[30%] right-[15%] w-[400px] h-[400px] bg-[hsl(260,90%,65%)] rounded-full opacity-25 blur-[120px] animate-[pulse_10s_ease-in-out_infinite_reverse]" />
        <div className="absolute bottom-[20%] left-[50%] -translate-x-1/2 w-[600px] h-[300px] bg-[hsl(270,85%,60%)] rounded-full opacity-30 blur-[140px]" />
      </div>

      {/* Content */}
      <div className="flex flex-col items-center justify-center text-center z-10 max-w-5xl w-full py-4">
        <img 
          src={logoMain} 
          alt="SimSmile" 
          className="w-64 md:w-96 lg:w-[32rem] mx-auto mb-4 animate-fade-in"
        />
        
        <h1 className="text-2xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-3">
          IA Poderosa,
          <br />
          <span className="bg-gradient-to-r from-[hsl(270,100%,85%)] via-[hsl(280,90%,75%)] to-[hsl(260,85%,80%)] bg-clip-text text-transparent">
            Sonrisas Más Brillantes
          </span>
        </h1>
        
        <p className="text-sm md:text-lg lg:text-xl text-white/80 font-light max-w-2xl leading-relaxed mb-8">
          Descubre el potencial de tu sonrisa con nuestro simulador de inteligencia artificial avanzado
        </p>

        <div>
          <Button
            size="lg"
            onClick={onStart}
            className="text-base md:text-lg px-10 py-5 md:px-16 md:py-7 bg-gradient-to-r from-[hsl(270,90%,65%)] via-[hsl(280,85%,60%)] to-[hsl(265,80%,65%)] hover:from-[hsl(270,90%,70%)] hover:via-[hsl(280,85%,65%)] hover:to-[hsl(265,80%,70%)] text-white font-semibold rounded-full transition-all hover:scale-105 shadow-[0_0_40px_rgba(168,85,247,0.4)] hover:shadow-[0_0_60px_rgba(168,85,247,0.6)] flex flex-col items-center gap-1"
          >
            <span className="flex items-center">
              <Sparkles className="mr-2 md:mr-3" />
              Comenzar Análisis Gratis
            </span>
            <span className="text-xs md:text-sm font-normal opacity-90">
              ⚡ Gratis por Tiempo Limitado - Aprovecha Ahora
            </span>
          </Button>
        </div>

        <p className="text-xs md:text-sm text-white/40 font-light italic mt-8">
          Powered by Clínica Miró
        </p>
      </div>
    </div>
  );
};

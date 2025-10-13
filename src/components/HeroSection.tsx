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
      <div className="flex flex-col items-center justify-center text-center z-10 max-w-5xl w-full space-y-8">
        <img 
          src={logoMain} 
          alt="SimSmile" 
          className="w-96 md:w-[40rem] lg:w-[48rem] mx-auto animate-fade-in"
        />
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight">
          IA Poderosa,
          <br />
          <span className="bg-gradient-to-r from-[hsl(270,100%,85%)] via-[hsl(280,90%,75%)] to-[hsl(260,85%,80%)] bg-clip-text text-transparent">
            Sonrisas Más Brillantes
          </span>
        </h1>
        
        <p className="text-lg md:text-xl lg:text-2xl text-white/80 font-light max-w-3xl leading-relaxed">
          Descubre el potencial de tu sonrisa con nuestro simulador de inteligencia artificial avanzado
        </p>

        <div className="pt-4">
          <Button
            size="lg"
            onClick={onStart}
            className="text-lg px-16 py-7 bg-gradient-to-r from-[hsl(270,90%,65%)] via-[hsl(280,85%,60%)] to-[hsl(265,80%,65%)] hover:from-[hsl(270,90%,70%)] hover:via-[hsl(280,85%,65%)] hover:to-[hsl(265,80%,70%)] text-white font-semibold rounded-full transition-all hover:scale-105 shadow-[0_0_40px_rgba(168,85,247,0.4)] hover:shadow-[0_0_60px_rgba(168,85,247,0.6)]"
          >
            <Sparkles className="mr-3" />
            Comenzar Análisis Gratis
          </Button>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 pt-12">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-1">3x</div>
            <div className="text-sm md:text-base text-white/60">Más Rápido</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-1">99.9%</div>
            <div className="text-sm md:text-base text-white/60">Precisión</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-1">10K+</div>
            <div className="text-sm md:text-base text-white/60">Análisis Realizados</div>
          </div>
        </div>

        <p className="text-sm md:text-base text-white/40 font-light italic pt-8">
          Powered by Clínica Miró
        </p>
      </div>
    </div>
  );
};

import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { Logo } from "./Logo";

interface HeroSectionProps {
  onStart: () => void;
}

export const HeroSection = ({ onStart }: HeroSectionProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-8 left-8">
        <Logo size="lg" className="opacity-70" />
      </div>
      
      {/* Orbital circles animation with connecting geometric patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Background circles with connecting lines via pseudo-elements */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32">
          <div className="relative w-full h-full rounded-full border-4 border-[#3DD6B4]/30 animate-[spin_15s_linear_infinite] shadow-[0_0_30px_rgba(61,214,180,0.3)]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#3DD6B4] animate-pulse shadow-[0_0_20px_rgba(61,214,180,0.8)]" />
          </div>
        </div>
        
        <div className="absolute top-1/3 right-1/3 w-48 h-48">
          <div className="relative w-full h-full rounded-full border-4 border-[#FDB913]/30 animate-[spin_20s_linear_infinite_reverse] shadow-[0_0_30px_rgba(253,185,19,0.3)]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#FDB913] animate-pulse shadow-[0_0_20px_rgba(253,185,19,0.8)]" />
          </div>
        </div>
        
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40">
          <div className="relative w-full h-full rounded-full border-4 border-[#E91E84]/30 animate-[spin_18s_linear_infinite] shadow-[0_0_30px_rgba(233,30,132,0.3)]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#E91E84] animate-pulse shadow-[0_0_20px_rgba(233,30,132,0.8)]" />
          </div>
        </div>

        {/* SVG for connecting lines forming triangular patterns */}
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
          <defs>
            <linearGradient id="heroGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3DD6B4" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#FDB913" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="heroGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDB913" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#E91E84" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="heroGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E91E84" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3DD6B4" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          
          {/* Animated lines connecting the circles */}
          <line
            x1="25%"
            y1="25%"
            x2="66%"
            y2="33%"
            stroke="url(#heroGradient1)"
            strokeWidth="2"
            className="animate-[pulse_3s_ease-in-out_infinite]"
          >
            <animate attributeName="opacity" values="0.2;0.5;0.2" dur="3s" repeatCount="indefinite" />
          </line>
          
          <line
            x1="66%"
            y1="33%"
            x2="75%"
            y2="75%"
            stroke="url(#heroGradient2)"
            strokeWidth="2"
            className="animate-[pulse_3s_ease-in-out_infinite]"
          >
            <animate attributeName="opacity" values="0.2;0.5;0.2" dur="4s" repeatCount="indefinite" />
          </line>
          
          <line
            x1="75%"
            y1="75%"
            x2="25%"
            y2="25%"
            stroke="url(#heroGradient3)"
            strokeWidth="2"
            className="animate-[pulse_3s_ease-in-out_infinite]"
          >
            <animate attributeName="opacity" values="0.2;0.5;0.2" dur="5s" repeatCount="indefinite" />
          </line>
        </svg>
      </div>

      <div className="text-center z-10 max-w-3xl mb-32">
        <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6 bg-gradient-to-r from-gold via-lavender to-gold bg-clip-text text-transparent">
          SimSmile
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8">
          Descubre el potencial de tu sonrisa con inteligencia artificial
        </p>
        <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
          Análisis facial avanzado y simulación de diseño de sonrisa en segundos
        </p>
      </div>

      {/* Botón posicionado debajo del círculo rojo */}
      <div className="absolute bottom-[15%] right-[20%] z-10">
        <Button
          size="lg"
          onClick={onStart}
          className="text-lg px-8 py-6 bg-gradient-to-r from-gold to-primary hover:opacity-90 transition-opacity"
        >
          <Sparkles className="mr-2" />
          Comenzar Análisis
        </Button>
      </div>
    </div>
  );
};

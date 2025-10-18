import { useEffect, useState } from "react";
import { OrbitalAnimation } from "./OrbitalAnimation";
import simsmileLogo from "@/assets/simsmile-logo-pink.png";
import { Lightbulb, Sparkles, TrendingUp } from "lucide-react";

const funFacts = [
  {
    icon: Sparkles,
    title: "¿Sabías que?",
    text: "Una sonrisa activa 14 músculos faciales y puede mejorar tu estado de ánimo instantáneamente."
  },
  {
    icon: TrendingUp,
    title: "Dato curioso",
    text: "El 99.7% de los adultos considera que una sonrisa es un activo social importante."
  },
  {
    icon: Lightbulb,
    title: "Tip dental",
    text: "Los dientes se pueden mover durante toda la vida. Un tratamiento puede mejorar tu sonrisa a cualquier edad."
  },
  {
    icon: Sparkles,
    title: "¿Sabías que?",
    text: "La proporción áurea (1.618) se encuentra naturalmente en las sonrisas más armónicas."
  },
  {
    icon: TrendingUp,
    title: "Dato interesante",
    text: "Sonreír puede reducir el estrés y la presión arterial según estudios científicos."
  },
  {
    icon: Lightbulb,
    title: "Caso real",
    text: "El 85% de nuestros pacientes reportan mayor confianza después del tratamiento."
  }
];

export const LoadingAnimation = () => {
  const [countdown, setCountdown] = useState(30); // 30 segundos
  const [progress, setProgress] = useState(0);
  const [currentFactIndex, setCurrentFactIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + (100 / 30);
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Cambiar dato curioso cada 5 segundos
  useEffect(() => {
    const factTimer = setInterval(() => {
      setCurrentFactIndex(prev => (prev + 1) % funFacts.length);
    }, 5000);

    return () => clearInterval(factTimer);
  }, []);

  const currentFact = funFacts[currentFactIndex];
  const FactIcon = currentFact.icon;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden bg-background">
      {/* Animated gradient background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-accent/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-secondary/10 rounded-full blur-[140px]" />
      </div>

      {/* Logo at top */}
      <div className="w-full mb-8 absolute top-8 flex justify-center z-10">
        <img src={simsmileLogo} alt="SimSmile" className="w-48 md:w-64 opacity-60 animate-fade-in" />
      </div>

      {/* Orbital circles animation */}
      <div className="relative mt-4 md:mt-0 z-10">
        <OrbitalAnimation size="large" />
      </div>

      <div className="mt-8 md:mt-12 text-center space-y-6 max-w-2xl mx-auto">
        <h2 className="text-xl md:text-2xl font-heading font-bold mb-2">
          Analizando tu Sonrisa
        </h2>
        <p className="text-sm md:text-base text-muted-foreground">
          Nuestro sistema de IA está procesando tus imágenes...
        </p>

        {/* Countdown Timer */}
        <div className="flex flex-col items-center gap-4 mt-8">
          <div className="text-4xl md:text-5xl font-bold text-primary">
            {countdown}s
          </div>
          
          {/* Progress Bar */}
          <div className="w-64 md:w-80 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <p className="text-xs md:text-sm text-muted-foreground">
            Por favor espera mientras procesamos tu análisis
          </p>
        </div>

        {/* Fun Facts Card - Contenido entretenido */}
        <div className="mt-12 bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20 rounded-2xl p-6 md:p-8 animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FactIcon className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold text-primary mb-2">
                {currentFact.title}
              </h3>
              <p className="text-sm md:text-base text-foreground/80 leading-relaxed">
                {currentFact.text}
              </p>
            </div>
          </div>
          
          {/* Indicador de progreso de datos */}
          <div className="flex gap-2 justify-center mt-6">
            {funFacts.map((_, index) => (
              <div 
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentFactIndex 
                    ? 'w-8 bg-primary' 
                    : 'w-1.5 bg-primary/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Video de transformaciones (opcional) */}
        <div className="mt-8 rounded-xl overflow-hidden border-2 border-primary/20 shadow-lg">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-auto"
          >
            <source src="/assets/smile-transformation-unified.mp4" type="video/mp4" />
          </video>
        </div>
      </div>
    </div>
  );
};

import { useEffect, useState } from "react";
import { OrbitalAnimation } from "./OrbitalAnimation";
import simsmileLogo from "@/assets/simsmile-logo-pink.png";

export const LoadingAnimation = () => {
  const [countdown, setCountdown] = useState(20); // 20 segundos
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + (100 / 20);
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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

      <div className="mt-8 md:mt-12 text-center space-y-6">
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
      </div>
    </div>
  );
};

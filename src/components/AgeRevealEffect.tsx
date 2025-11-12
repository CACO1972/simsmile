import { useState, useEffect } from "react";
import { Sparkles, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";

interface AgeRevealEffectProps {
  currentAge: number;
  estimatedYouthfulness: number;
}

export const AgeRevealEffect = ({ currentAge, estimatedYouthfulness }: AgeRevealEffectProps) => {
  const [displayAge, setDisplayAge] = useState(currentAge);
  const targetAge = currentAge - estimatedYouthfulness;
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Start animation after a brief delay for dramatic effect
    const startDelay = setTimeout(() => {
      setIsAnimating(true);
      
      const duration = 2000; // 2 seconds
      const steps = Math.abs(currentAge - targetAge);
      const stepDuration = duration / steps;
      
      let count = currentAge;
      const interval = setInterval(() => {
        count--;
        setDisplayAge(count);
        
        if (count <= targetAge) {
          clearInterval(interval);
          setIsAnimating(false);
        }
      }, stepDuration);

      return () => clearInterval(interval);
    }, 500);

    return () => clearTimeout(startDelay);
  }, [currentAge, targetAge]);

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/10 to-background border-2 border-primary/30 p-8 mb-8">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 text-center">
        {/* Header */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 border border-accent/50 mb-6">
          <Sparkles className="h-4 w-4 text-accent animate-pulse" />
          <span className="text-sm font-semibold text-accent">Análisis de Edad con IA</span>
        </div>

        <h2 className="text-2xl md:text-3xl font-heading font-bold mb-3 text-foreground">
          Tu Sonrisa Rejuvenecida
        </h2>
        
        <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
          Con nuestro tratamiento de diseño de sonrisa, podrías verte hasta
        </p>

        {/* Age Counter - Main Effect */}
        <div className="relative inline-block mb-6">
          <div className="text-7xl md:text-9xl font-bold bg-gradient-to-br from-primary via-accent to-primary bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-500">
            {displayAge}
          </div>
          <div className="text-2xl md:text-3xl font-semibold text-muted-foreground mt-2">
            años
          </div>
          
          {/* Animated indicator during countdown */}
          {isAnimating && (
            <div className="absolute -right-12 top-1/2 -translate-y-1/2">
              <TrendingDown className="h-8 w-8 text-accent animate-bounce" />
            </div>
          )}
        </div>

        <p className="text-xl md:text-2xl font-semibold text-accent mb-8">
          {isAnimating ? "¡Calculando..." : `${estimatedYouthfulness} años menos que tu edad actual! ✨`}
        </p>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="bg-background/80 backdrop-blur rounded-2xl p-4 border border-border/50 hover:border-primary/50 transition-all">
            <div className="text-3xl mb-2">😁</div>
            <p className="font-semibold text-sm">Más Confianza</p>
          </div>
          <div className="bg-background/80 backdrop-blur rounded-2xl p-4 border border-border/50 hover:border-primary/50 transition-all">
            <div className="text-3xl mb-2">✨</div>
            <p className="font-semibold text-sm">Dientes Más Blancos</p>
          </div>
          <div className="bg-background/80 backdrop-blur rounded-2xl p-4 border border-border/50 hover:border-primary/50 transition-all">
            <div className="text-3xl mb-2">❤️</div>
            <p className="font-semibold text-sm">Autoestima Elevada</p>
          </div>
        </div>

        {!isAnimating && (
          <div className="mt-8 text-xs text-muted-foreground max-w-md mx-auto animate-in fade-in duration-1000">
            * Estimación basada en estudios clínicos que demuestran que una sonrisa mejorada 
            puede reducir la edad percibida entre 5-10 años
          </div>
        )}
      </div>
    </Card>
  );
};

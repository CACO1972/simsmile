import { useEffect, useState } from "react";
import simsmileLogo from "@/assets/simsmile-logo-pink.png";
import { Scan, Brain, Zap } from "lucide-react";

interface LoadingAnimationProps {
  userImage?: string;
}

const analysisSteps = [
  { icon: Scan, text: "Detectando puntos faciales..." },
  { icon: Brain, text: "Analizando proporciones áureas..." },
  { icon: Zap, text: "Procesando simetría facial..." },
  { icon: Scan, text: "Evaluando alineación dental..." },
  { icon: Brain, text: "Calculando métricas de sonrisa..." },
  { icon: Zap, text: "Generando simulación ideal..." }
];

export const LoadingAnimation = ({ userImage }: LoadingAnimationProps) => {
  const [countdown, setCountdown] = useState(30);
  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [scanPosition, setScanPosition] = useState(0);

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

  // Cambiar paso de análisis cada 5 segundos
  useEffect(() => {
    const stepTimer = setInterval(() => {
      setCurrentStepIndex(prev => (prev + 1) % analysisSteps.length);
    }, 5000);
    return () => clearInterval(stepTimer);
  }, []);

  // Efecto de escaneo continuo
  useEffect(() => {
    const scanTimer = setInterval(() => {
      setScanPosition(prev => (prev >= 100 ? 0 : prev + 2));
    }, 50);
    return () => clearInterval(scanTimer);
  }, []);

  const currentStep = analysisSteps[currentStepIndex];
  const StepIcon = currentStep.icon;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden bg-background">
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-accent/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-secondary/10 rounded-full blur-[140px]" />
      </div>

      {/* Logo */}
      <div className="w-full mb-8 absolute top-8 flex justify-center z-10">
        <img src={simsmileLogo} alt="SimSmile" className="w-48 md:w-64 opacity-60 animate-fade-in" />
      </div>

      <div className="mt-20 text-center space-y-8 max-w-4xl mx-auto z-10 w-full">
        <div>
          <h2 className="text-2xl md:text-3xl font-heading font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Analizando tu Sonrisa con IA
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Procesamiento de imagen y detección facial en progreso
          </p>
        </div>

        {/* Imagen del usuario con efecto de escaneo */}
        {userImage && (
          <div className="relative max-w-md mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-xl blur opacity-50 animate-pulse" />
            <div className="relative bg-background/95 backdrop-blur-sm border-2 border-primary/30 rounded-xl overflow-hidden">
              <img 
                src={userImage} 
                alt="Análisis en progreso" 
                className="w-full h-auto"
              />
              
              {/* Efecto de escaneo horizontal */}
              <div 
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-80 transition-all duration-100 ease-linear"
                style={{ top: `${scanPosition}%` }}
              >
                <div className="absolute inset-0 animate-pulse bg-accent/50 blur-sm" />
              </div>

              {/* Grid de análisis */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="w-full h-full" style={{
                  backgroundImage: `
                    linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px'
                }} />
              </div>

              {/* Puntos de detección animados */}
              <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-accent rounded-full animate-ping" />
              <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-primary rounded-full animate-ping" style={{ animationDelay: '0.3s' }} />
              <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-accent rounded-full animate-ping" style={{ animationDelay: '0.6s' }} />
              <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-primary rounded-full animate-ping" style={{ animationDelay: '0.9s' }} />

              {/* Overlay de procesamiento */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
            </div>
          </div>
        )}

        {/* Paso actual de análisis */}
        <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-6">
          <div className="flex items-center justify-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
              <StepIcon className="h-5 w-5 text-primary" />
            </div>
            <p className="text-base md:text-lg font-semibold text-foreground">
              {currentStep.text}
            </p>
          </div>

          {/* Progress bar */}
          <div className="mt-4 w-full h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-muted-foreground">
              {Math.round(progress)}% completado
            </p>
            <p className="text-xs text-muted-foreground">
              {countdown}s restantes
            </p>
          </div>
        </div>

        {/* Indicadores de pasos */}
        <div className="flex gap-2 justify-center">
          {analysisSteps.map((_, index) => (
            <div 
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentStepIndex 
                  ? 'w-8 bg-primary' 
                  : index < currentStepIndex
                  ? 'w-2 bg-primary/50'
                  : 'w-2 bg-primary/20'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

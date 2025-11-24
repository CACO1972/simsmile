import { useEffect, useState } from "react";
import simsmileLogo from "@/assets/simsmile-logo-pink.png";
import { Scan, Brain, Zap, Eye, Sparkles, Activity } from "lucide-react";

interface LoadingAnimationProps {
  userImage?: string;
}

const analysisSteps = [
  { icon: Scan, text: "Escaneando geometría facial 3D..." },
  { icon: Brain, text: "Analizando 68 puntos de referencia facial..." },
  { icon: Eye, text: "Detectando simetría y proporciones áureas..." },
  { icon: Zap, text: "Procesando con redes neuronales profundas..." },
  { icon: Activity, text: "Evaluando armonía y balance dental..." },
  { icon: Sparkles, text: "Generando simulación con IA avanzada..." }
];

// Partículas flotantes para efecto neural network
interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

export const LoadingAnimation = ({ userImage }: LoadingAnimationProps) => {
  const [countdown, setCountdown] = useState(30);
  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [scanPosition, setScanPosition] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [neuralPulse, setNeuralPulse] = useState(0);

  // Generar partículas iniciales
  useEffect(() => {
    const initialParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.5 + 0.3
    }));
    setParticles(initialParticles);
  }, []);

  // Animar partículas
  useEffect(() => {
    const particleTimer = setInterval(() => {
      setParticles(prev => prev.map(p => ({
        ...p,
        x: (p.x + p.vx + 100) % 100,
        y: (p.y + p.vy + 100) % 100
      })));
    }, 50);
    return () => clearInterval(particleTimer);
  }, []);

  // Pulso neural
  useEffect(() => {
    const pulseTimer = setInterval(() => {
      setNeuralPulse(prev => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(pulseTimer);
  }, []);

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
      {/* Animated gradient background with neural network effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-accent/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-secondary/10 rounded-full blur-[140px]" />
        
        {/* Partículas flotantes - red neuronal */}
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.3 }}>
          {particles.map((p, i) => (
            <g key={p.id}>
              <circle
                cx={`${p.x}%`}
                cy={`${p.y}%`}
                r={p.size}
                fill="currentColor"
                className="text-primary"
                opacity={p.opacity}
              />
              {/* Conexiones entre partículas cercanas */}
              {particles.slice(i + 1, i + 4).map((p2, j) => {
                const distance = Math.sqrt(Math.pow(p.x - p2.x, 2) + Math.pow(p.y - p2.y, 2));
                if (distance < 20) {
                  return (
                    <line
                      key={`${p.id}-${p2.id}`}
                      x1={`${p.x}%`}
                      y1={`${p.y}%`}
                      x2={`${p2.x}%`}
                      y2={`${p2.y}%`}
                      stroke="currentColor"
                      strokeWidth="0.5"
                      className="text-accent"
                      opacity={0.2}
                    />
                  );
                }
                return null;
              })}
            </g>
          ))}
        </svg>
      </div>

      {/* Logo */}
      <div className="w-full mb-8 absolute top-8 flex justify-center z-10">
        <img src={simsmileLogo} alt="SimSmile" className="w-48 md:w-64 opacity-60 animate-fade-in" />
      </div>

      <div className="mt-20 text-center space-y-8 max-w-4xl mx-auto z-10 w-full">
        <div>
          <h2 className="text-2xl md:text-3xl font-heading font-bold mb-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-pulse">
            🧠 IA de Clase Mundial Procesando
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Análisis facial con redes neuronales profundas
          </p>
        </div>

        {/* Imagen del usuario - MÁS PEQUEÑA con efectos avanzados */}
        {userImage && (
          <div className="relative max-w-xs mx-auto">
            {/* Anillos orbitales animados */}
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '8s' }}>
              <div className="absolute inset-0 border-2 border-primary/30 rounded-full" />
            </div>
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '12s', animationDirection: 'reverse' }}>
              <div className="absolute inset-4 border-2 border-accent/20 rounded-full" />
            </div>
            
            {/* Pulso neural externo */}
            <div 
              className="absolute -inset-2 bg-gradient-to-r from-primary via-accent to-primary rounded-full blur-xl opacity-60"
              style={{
                transform: `scale(${1 + Math.sin(neuralPulse * Math.PI / 180) * 0.1})`,
                transition: 'transform 0.05s ease-out'
              }}
            />
            
            <div className="relative bg-background/95 backdrop-blur-sm border-4 border-primary/50 rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={userImage} 
                alt="Análisis en progreso" 
                className="w-full h-auto"
              />
              
              {/* Efecto de escaneo horizontal mejorado con doble línea */}
              <div 
                className="absolute left-0 right-0 h-1.5 transition-all duration-100 ease-linear"
                style={{ top: `${scanPosition}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent to-transparent opacity-100 shadow-lg shadow-accent/50" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60 blur-md" />
              </div>

              {/* Grid de análisis hexagonal */}
              <div className="absolute inset-0 pointer-events-none opacity-30">
                <svg className="w-full h-full">
                  <defs>
                    <pattern id="hexagons" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M20 0 L30 10 L30 30 L20 40 L10 30 L10 10 Z" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="0.5" 
                        className="text-primary"
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#hexagons)" />
                </svg>
              </div>

              {/* Puntos de detección facial animados - más puntos */}
              <div className="absolute top-[15%] left-[20%] w-2 h-2 bg-accent rounded-full animate-ping" />
              <div className="absolute top-[15%] right-[20%] w-2 h-2 bg-accent rounded-full animate-ping" style={{ animationDelay: '0.2s' }} />
              <div className="absolute top-[30%] left-[15%] w-2 h-2 bg-primary rounded-full animate-ping" style={{ animationDelay: '0.4s' }} />
              <div className="absolute top-[30%] right-[15%] w-2 h-2 bg-primary rounded-full animate-ping" style={{ animationDelay: '0.6s' }} />
              <div className="absolute top-[45%] left-1/2 -translate-x-1/2 w-2 h-2 bg-accent rounded-full animate-ping" style={{ animationDelay: '0.8s' }} />
              <div className="absolute bottom-[25%] left-[30%] w-2 h-2 bg-primary rounded-full animate-ping" style={{ animationDelay: '1s' }} />
              <div className="absolute bottom-[25%] right-[30%] w-2 h-2 bg-accent rounded-full animate-ping" style={{ animationDelay: '1.2s' }} />
              
              {/* Líneas de conexión facial */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <line x1="20%" y1="15%" x2="80%" y2="15%" stroke="currentColor" strokeWidth="1" className="text-primary/50" />
                <line x1="15%" y1="30%" x2="85%" y2="30%" stroke="currentColor" strokeWidth="1" className="text-accent/50" />
                <line x1="50%" y1="15%" x2="50%" y2="75%" stroke="currentColor" strokeWidth="1" className="text-primary/50" strokeDasharray="4 4" />
              </svg>

              {/* Overlay de procesamiento con efectos */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
              
              {/* Badge de IA activa */}
              <div className="absolute top-3 right-3 bg-accent/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                IA ACTIVA
              </div>
            </div>
          </div>
        )}

        {/* Paso actual de análisis con efectos mejorados */}
        <div className="bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 border-2 border-primary/40 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg" style={{
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}>
              <StepIcon className="h-6 w-6 text-white" />
            </div>
            <p className="text-base md:text-lg font-semibold text-foreground">
              {currentStep.text}
            </p>
          </div>

          {/* Progress bar mejorada con gradiente animado */}
          <div className="mt-4 w-full h-3 bg-muted rounded-full overflow-hidden border border-primary/20 shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-primary via-accent to-primary transition-all duration-1000 ease-linear relative"
              style={{ 
                width: `${progress}%`,
                backgroundSize: '200% 100%',
                animation: 'gradient-shift 2s linear infinite'
              }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <p className="text-sm font-semibold text-primary">
              {Math.round(progress)}% completado
            </p>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-accent animate-pulse" />
              <p className="text-sm font-semibold text-accent">
                {countdown}s
              </p>
            </div>
          </div>
        </div>

        {/* Indicadores de pasos mejorados */}
        <div className="flex gap-3 justify-center">
          {analysisSteps.map((step, index) => (
            <div 
              key={index}
              className={`h-3 rounded-full transition-all duration-500 ${
                index === currentStepIndex 
                  ? 'w-12 bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/50' 
                  : index < currentStepIndex
                  ? 'w-3 bg-primary/70'
                  : 'w-3 bg-primary/20'
              }`}
            />
          ))}
        </div>

        {/* Stats de análisis en tiempo real */}
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
          <div className="bg-background/50 backdrop-blur-sm border border-primary/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              68
            </div>
            <div className="text-xs text-muted-foreground">Puntos Faciales</div>
          </div>
          <div className="bg-background/50 backdrop-blur-sm border border-accent/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              3D
            </div>
            <div className="text-xs text-muted-foreground">Análisis</div>
          </div>
          <div className="bg-background/50 backdrop-blur-sm border border-primary/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              φ
            </div>
            <div className="text-xs text-muted-foreground">Golden Ratio</div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>
    </div>
  );
};
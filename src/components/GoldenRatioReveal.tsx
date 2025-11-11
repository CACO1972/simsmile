import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Eye, EyeOff, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface GoldenRatioRevealProps {
  smileImage: string;
  restImage: string;
  facialAnalysis: {
    horizontal_ratio?: { upper: number; middle: number; lower: number };
    overall_golden_ratio_score?: number;
  };
  onFullscreen?: () => void;
}

export const GoldenRatioReveal = ({ 
  smileImage, 
  restImage,
  facialAnalysis,
  onFullscreen 
}: GoldenRatioRevealProps) => {
  const [showOverlay, setShowOverlay] = useState(true);
  const [animationPhase, setAnimationPhase] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Animación secuencial del reveal
  useEffect(() => {
    const phases = [0, 1, 2, 3];
    let currentPhase = 0;
    
    const interval = setInterval(() => {
      currentPhase = (currentPhase + 1) % phases.length;
      setAnimationPhase(currentPhase);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Dibujar el overlay del golden ratio con animación
  useEffect(() => {
    if (!canvasRef.current || !imageRef.current || !showOverlay) return;
    
    const canvas = canvasRef.current;
    const image = imageRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawAnimatedOverlay = () => {
      canvas.width = image.naturalWidth || image.width;
      canvas.height = image.naturalHeight || image.height;
      
      const w = canvas.width;
      const h = canvas.height;

      // Clear canvas
      ctx.clearRect(0, 0, w, h);

      if (!facialAnalysis.horizontal_ratio) return;

      const { upper, middle, lower } = facialAnalysis.horizontal_ratio;
      const upperBoundary = (upper / 100) * h;
      const middleBoundary = upperBoundary + (middle / 100) * h;

      // Efecto de glow animado
      const glowIntensity = 0.5 + Math.sin(Date.now() / 500) * 0.3;
      
      // Líneas horizontales principales con glow
      ctx.shadowColor = `rgba(168, 85, 247, ${glowIntensity})`;
      ctx.shadowBlur = 20;
      ctx.strokeStyle = `rgba(168, 85, 247, 0.9)`;
      ctx.lineWidth = 4;

      // Línea superior
      ctx.beginPath();
      ctx.moveTo(0, upperBoundary);
      ctx.lineTo(w, upperBoundary);
      ctx.stroke();

      // Línea media
      ctx.beginPath();
      ctx.moveTo(0, middleBoundary);
      ctx.lineTo(w, middleBoundary);
      ctx.stroke();

      // Líneas del Golden Ratio ideal (punteadas)
      ctx.setLineDash([15, 10]);
      ctx.strokeStyle = `rgba(251, 191, 36, 0.7)`;
      ctx.shadowColor = `rgba(251, 191, 36, ${glowIntensity})`;
      
      const ideal1 = h * 0.333;
      const ideal2 = h * 0.667;
      
      ctx.beginPath();
      ctx.moveTo(0, ideal1);
      ctx.lineTo(w, ideal1);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, ideal2);
      ctx.lineTo(w, ideal2);
      ctx.stroke();

      ctx.setLineDash([]);
      ctx.shadowBlur = 0;

      // Dibujamos el símbolo phi (φ) en el centro
      ctx.fillStyle = `rgba(168, 85, 247, 0.15)`;
      ctx.font = `${w * 0.3}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('φ', w / 2, h / 2);

      // Cuadros informativos animados
      const drawInfoBox = (text: string, value: string, x: number, y: number, color: string) => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(x, y, 140, 70);
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, 140, 70);
        
        ctx.fillStyle = color;
        ctx.font = 'bold 12px system-ui';
        ctx.textAlign = 'left';
        ctx.fillText(text, x + 10, y + 25);
        
        ctx.font = 'bold 24px system-ui';
        ctx.fillText(value, x + 10, y + 55);
      };

      // Información de los tercios
      drawInfoBox('Superior', `${upper.toFixed(1)}%`, 20, 20, 'rgba(168, 85, 247, 1)');
      drawInfoBox('Medio', `${middle.toFixed(1)}%`, 20, 100, 'rgba(168, 85, 247, 1)');
      drawInfoBox('Inferior', `${lower.toFixed(1)}%`, 20, 180, 'rgba(168, 85, 247, 1)');

      // Golden Ratio ideal
      drawInfoBox('φ Ideal', '33.3%', w - 160, h / 2 - 35, 'rgba(251, 191, 36, 1)');

      // Score principal
      if (facialAnalysis.overall_golden_ratio_score !== undefined) {
        const score = facialAnalysis.overall_golden_ratio_score;
        const scoreColor = score >= 80 ? '#22c55e' : score >= 60 ? '#facc15' : '#ef4444';
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(w / 2 - 80, h - 100, 160, 80);
        
        ctx.strokeStyle = scoreColor;
        ctx.lineWidth = 3;
        ctx.strokeRect(w / 2 - 80, h - 100, 160, 80);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('Golden Score', w / 2, h - 75);
        
        ctx.fillStyle = scoreColor;
        ctx.font = 'bold 36px system-ui';
        ctx.fillText(`${score}`, w / 2, h - 40);
      }
    };

    if (image.complete) {
      drawAnimatedOverlay();
      const animationFrame = setInterval(drawAnimatedOverlay, 50);
      return () => clearInterval(animationFrame);
    } else {
      image.onload = () => {
        drawAnimatedOverlay();
        const animationFrame = setInterval(drawAnimatedOverlay, 50);
        return () => clearInterval(animationFrame);
      };
    }
  }, [facialAnalysis, showOverlay]);

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 border-2 border-primary/30 p-0">
      {/* Header con título animado */}
      <motion.div 
        className="relative z-10 p-6 text-center bg-gradient-to-b from-background/80 to-transparent backdrop-blur-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="inline-flex items-center gap-2 mb-3"
          animate={{ 
            scale: [1, 1.05, 1],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Sparkles className="h-6 w-6 text-primary" />
          <h2 className="text-3xl md:text-4xl font-heading font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Análisis Golden Ratio
          </h2>
          <Sparkles className="h-6 w-6 text-accent" />
        </motion.div>
        <p className="text-muted-foreground">
          Tu sonrisa comparada con la proporción áurea perfecta φ (1:1.618)
        </p>
      </motion.div>

      {/* Contenedor principal de la imagen */}
      <div className="relative aspect-[3/4] md:aspect-square max-w-3xl mx-auto" ref={containerRef}>
        {/* Background con efectos de glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 blur-3xl animate-pulse" />
        
        {/* Imagen base */}
        <img 
          ref={imageRef}
          src={smileImage}
          alt="Análisis de sonrisa"
          className="absolute inset-0 w-full h-full object-cover rounded-lg"
          crossOrigin="anonymous"
        />

        {/* Canvas con overlay del golden ratio */}
        <AnimatePresence>
          {showOverlay && (
            <motion.canvas 
              ref={canvasRef}
              className="absolute inset-0 w-full h-full object-contain rounded-lg pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          )}
        </AnimatePresence>

        {/* Partículas flotantes decorativas */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </div>

        {/* Badge flotante con score */}
        {facialAnalysis.overall_golden_ratio_score !== undefined && (
          <motion.div
            className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm border-2 border-primary rounded-2xl px-6 py-3 shadow-2xl"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.5
            }}
          >
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Score</div>
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {facialAnalysis.overall_golden_ratio_score}
              </div>
              <div className="text-xs text-primary">φ Perfect</div>
            </div>
          </motion.div>
        )}

        {/* Botón para fullscreen */}
        <motion.button
          className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm border border-primary/50 rounded-full p-3 hover:bg-primary/20 transition-all"
          onClick={onFullscreen}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Maximize2 className="h-5 w-5 text-primary" />
        </motion.button>
      </div>

      {/* Controles inferiores */}
      <div className="p-6 flex items-center justify-center gap-4 bg-gradient-to-t from-background/80 to-transparent backdrop-blur-sm">
        <Button
          onClick={() => setShowOverlay(!showOverlay)}
          variant="outline"
          className="gap-2 border-primary/50 hover:bg-primary/10"
        >
          {showOverlay ? (
            <>
              <EyeOff className="h-4 w-4" />
              Ocultar Análisis
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              Ver Análisis
            </>
          )}
        </Button>
      </div>

      {/* Indicadores de tercios inferiores */}
      {facialAnalysis.horizontal_ratio && (
        <div className="px-6 pb-6 grid grid-cols-3 gap-3">
          <motion.div 
            className="bg-primary/10 backdrop-blur-sm border border-primary/30 rounded-lg p-3 text-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-xs text-muted-foreground mb-1">Superior</div>
            <div className="text-xl font-bold text-primary">
              {facialAnalysis.horizontal_ratio.upper.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">φ: 33.3%</div>
          </motion.div>
          
          <motion.div 
            className="bg-primary/10 backdrop-blur-sm border border-primary/30 rounded-lg p-3 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="text-xs text-muted-foreground mb-1">Medio</div>
            <div className="text-xl font-bold text-primary">
              {facialAnalysis.horizontal_ratio.middle.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">φ: 33.3%</div>
          </motion.div>
          
          <motion.div 
            className="bg-primary/10 backdrop-blur-sm border border-primary/30 rounded-lg p-3 text-center"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="text-xs text-muted-foreground mb-1">Inferior</div>
            <div className="text-xl font-bold text-primary">
              {facialAnalysis.horizontal_ratio.lower.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">φ: 33.3%</div>
          </motion.div>
        </div>
      )}
    </Card>
  );
};

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles, Eye, CreditCard, Camera } from "lucide-react";
import { motion } from "framer-motion";

interface BlurredSimulationProps {
  originalImage: string;
  simulatedImage: string;
  onUnlock: () => void;
  onRetake?: () => void;
  loading?: boolean;
}

export const BlurredSimulation = ({
  originalImage,
  simulatedImage,
  onUnlock,
  onRetake,
  loading = false,
}: BlurredSimulationProps) => {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-20 right-1/4 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-2xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 mb-4"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              ¡Simulación Lista!
            </span>
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Tu Nueva Sonrisa Está Lista
          </h1>
          <p className="text-muted-foreground">
            Hemos analizado tu rostro y creado una simulación personalizada
          </p>
        </div>

        {/* Image comparison */}
        <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-6 mb-8 overflow-hidden">
          <div className="grid grid-cols-2 gap-4">
            {/* Original */}
            <div className="relative">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden">
                <img
                  src={originalImage}
                  alt="Tu foto original"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-full text-xs text-white font-medium">
                Antes
              </div>
            </div>

            {/* Simulated - Blurred */}
            <div className="relative group">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden relative">
                <img
                  src={simulatedImage}
                  alt="Tu sonrisa simulada"
                  className="w-full h-full object-cover blur-[20px] scale-105"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 flex flex-col items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-16 h-16 rounded-full bg-primary/30 backdrop-blur-md border-2 border-primary flex items-center justify-center mb-3"
                  >
                    <Lock className="w-8 h-8 text-white" />
                  </motion.div>
                  <p className="text-white font-semibold text-center px-4">
                    Desbloquea tu simulación
                  </p>
                </div>
              </div>
              <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-primary/90 backdrop-blur-sm rounded-full text-xs text-white font-medium">
                Después
              </div>
            </div>
          </div>

          {/* Quick preview button */}
          <button
            onClick={() => setShowPreview(true)}
            onMouseLeave={() => setShowPreview(false)}
            className="absolute top-4 right-4 p-2 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors"
          >
            <Eye className="w-5 h-5 text-white" />
          </button>

          {/* Quick preview overlay */}
          {showPreview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/90 flex items-center justify-center p-4 rounded-3xl"
            >
              <img
                src={simulatedImage}
                alt="Preview"
                className="max-w-full max-h-full object-contain blur-[10px] opacity-60"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-white/80 text-lg font-medium">
                  Vista previa limitada
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Unlock section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 rounded-2xl p-6 text-center"
        >
          <h3 className="text-xl font-bold text-foreground mb-2">
            Desbloquea Tu Transformación
          </h3>
          <p className="text-muted-foreground mb-4 text-sm">
            Accede a tu simulación en alta calidad sin costo
          </p>

          <div className="flex flex-col items-center justify-center mb-4 gap-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-bold uppercase tracking-wide">
              ✨ Gratis por tiempo limitado
            </div>
          </div>


          <Button
            size="lg"
            onClick={onUnlock}
            disabled={loading}
            className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-semibold rounded-full px-10 py-6 text-lg shadow-lg shadow-primary/30"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span> Procesando...
              </span>
            ) : (
              <>
                <CreditCard className="w-5 h-5 mr-2" />
                Desbloquear Ahora
              </>
            )}
          </Button>

          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
            <span>✓ 3 simulaciones incluidas</span>
            <span>✓ Pago seguro</span>
            <span>✓ Satisfacción garantizada</span>
          </div>

          {onRetake && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRetake}
              className="mt-4 text-muted-foreground hover:text-foreground gap-2"
            >
              <Camera className="w-4 h-4" />
              Tomar otra foto
            </Button>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default BlurredSimulation;

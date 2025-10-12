import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CameraCapture } from "@/components/ia-lab/CameraCapture";
import { useSmileAnalysis } from "@/contexts/SmileAnalysisContext";
import { Button } from "@/components/ui/button";

export default function CaptureRest() {
  const navigate = useNavigate();
  const { restImage, setRestImage } = useSmileAnalysis();
  const [showCamera, setShowCamera] = useState(false);

  const handleCapture = (imageData: string) => {
    setRestImage(imageData);
    setShowCamera(false);
    navigate("/captura-sonrisa");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Paso 2 de 6</span>
            <span className="text-sm font-medium text-primary">33%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-primary h-2 rounded-full transition-all" style={{ width: '33%' }} />
          </div>
        </div>

        {/* Content */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-lg">
          <div className="bg-primary/10 p-6 border-b border-border">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              📷 Foto en Reposo
            </h1>
            <p className="text-muted-foreground">
              Mantén una expresión neutral, labios cerrados
            </p>
          </div>

          <div className="p-6 space-y-6">
            {!restImage ? (
              <>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center p-8">
                    <svg className="w-16 h-16 mx-auto text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    </svg>
                    <p className="text-muted-foreground">No hay foto capturada aún</p>
                  </div>
                </div>

                <div className="bg-accent/20 p-4 rounded-lg">
                  <p className="text-sm text-foreground leading-relaxed">
                    💡 <strong>Consejo:</strong> Relaja tu rostro y mantén una expresión natural, como si estuvieras mirando al horizonte. No sonrías ni frunzas el ceño.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => navigate("/instrucciones")}
                    className="flex-1"
                  >
                    Volver
                  </Button>
                  <Button
                    onClick={() => setShowCamera(true)}
                    className="flex-1"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    </svg>
                    Abrir Cámara
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-lg overflow-hidden border border-border">
                  <img src={restImage} alt="Foto en reposo" className="w-full h-auto" />
                </div>

                <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-sm text-foreground">
                      <strong>¡Perfecto!</strong> Foto en reposo capturada correctamente
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setRestImage(null);
                      setShowCamera(true);
                    }}
                  >
                    Repetir Foto
                  </Button>
                  <Button
                    onClick={() => navigate("/captura-sonrisa")}
                    className="flex-1"
                  >
                    Continuar
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showCamera && (
        <CameraCapture
          mode="rest"
          onCapture={handleCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}

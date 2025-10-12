import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CameraCapture } from "@/components/ia-lab/CameraCapture";
import { useSmileAnalysis } from "@/contexts/SmileAnalysisContext";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export default function Capture() {
  const navigate = useNavigate();
  const { restImage, smileImage, setRestImage, setSmileImage } = useSmileAnalysis();
  const [showCamera, setShowCamera] = useState(false);
  const [currentMode, setCurrentMode] = useState<"rest" | "smile">("rest");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = (imageData: string) => {
    if (currentMode === "rest") {
      setRestImage(imageData);
    } else {
      setSmileImage(imageData);
    }
    setShowCamera(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      if (currentMode === "rest") {
        setRestImage(imageData);
      } else {
        setSmileImage(imageData);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCameraClick = (mode: "rest" | "smile") => {
    setCurrentMode(mode);
    setShowCamera(true);
  };

  const handleGalleryClick = (mode: "rest" | "smile") => {
    setCurrentMode(mode);
    fileInputRef.current?.click();
  };

  const canContinue = restImage && smileImage;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Paso 2 de 5</span>
            <span className="text-sm font-display font-bold text-primary">40%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div className="bg-primary h-3 rounded-full transition-all shadow-sm shadow-primary/50" style={{ width: '40%' }} />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-display font-black text-foreground mb-4">
            📸 Captura tus <span className="text-primary">Fotos</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Necesitamos dos fotos: una en reposo y otra sonriendo
          </p>
        </div>

        {/* Capture Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Rest Photo */}
          <div className="bg-card rounded-3xl border-2 border-border overflow-hidden shadow-lg">
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-6 border-b-2 border-border">
              <h2 className="text-2xl font-display font-black text-foreground mb-2 flex items-center gap-2">
                <span className="text-3xl">😐</span>
                Foto en Reposo
              </h2>
              <p className="text-sm text-muted-foreground">Expresión neutral, sin sonreír</p>
            </div>

            <div className="p-6 space-y-4">
              {restImage ? (
                <>
                  <div className="aspect-[3/4] rounded-xl overflow-hidden border-2 border-border">
                    <img src={restImage} alt="Foto en reposo" className="w-full h-full object-cover" />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRestImage(null)}
                    className="w-full"
                  >
                    🔄 Cambiar Foto
                  </Button>
                </>
              ) : (
                <>
                  <div className="aspect-[3/4] bg-muted rounded-xl flex items-center justify-center border-2 border-dashed border-border">
                    <div className="text-center p-4">
                      <svg className="w-16 h-16 mx-auto text-muted-foreground mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      </svg>
                      <p className="text-sm text-muted-foreground">Sin foto</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Button
                      onClick={() => handleCameraClick("rest")}
                      className="w-full font-display font-bold"
                    >
                      📷 Tomar Selfie
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleGalleryClick("rest")}
                      className="w-full font-display font-bold"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Subir de Galería
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Smile Photo */}
          <div className="bg-card rounded-3xl border-2 border-border overflow-hidden shadow-lg">
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-6 border-b-2 border-border">
              <h2 className="text-2xl font-display font-black text-foreground mb-2 flex items-center gap-2">
                <span className="text-3xl">😁</span>
                Foto Sonriendo
              </h2>
              <p className="text-sm text-muted-foreground">Tu mejor sonrisa natural</p>
            </div>

            <div className="p-6 space-y-4">
              {smileImage ? (
                <>
                  <div className="aspect-[3/4] rounded-xl overflow-hidden border-2 border-border">
                    <img src={smileImage} alt="Foto sonriendo" className="w-full h-full object-cover" />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSmileImage(null)}
                    className="w-full"
                  >
                    🔄 Cambiar Foto
                  </Button>
                </>
              ) : (
                <>
                  <div className="aspect-[3/4] bg-muted rounded-xl flex items-center justify-center border-2 border-dashed border-border">
                    <div className="text-center p-4">
                      <svg className="w-16 h-16 mx-auto text-muted-foreground mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-muted-foreground">Sin foto</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Button
                      onClick={() => handleCameraClick("smile")}
                      className="w-full font-display font-bold"
                    >
                      📷 Tomar Selfie
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleGalleryClick("smile")}
                      className="w-full font-display font-bold"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Subir de Galería
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => navigate("/instrucciones")}
            className="flex-1 py-6 text-lg font-display font-bold rounded-xl border-2"
          >
            Volver
          </Button>
          <Button
            onClick={() => navigate("/procesando")}
            disabled={!canContinue}
            className="flex-1 py-6 text-lg font-display font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
          >
            Analizar Fotos
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {showCamera && (
        <CameraCapture
          mode={currentMode}
          onCapture={handleCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}

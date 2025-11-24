import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Upload } from "lucide-react";
import simsmileLogo from "@/assets/simsmile-logo-white-bg.png";
import guiaFotoRostroCompleto from "@/assets/guia-foto-rostro-completo-editada.jpg";
import { toast } from "sonner";

interface CaptureSectionProps {
  onCapture: (smileImage: string) => void;
}

export const CaptureSection = ({ onCapture }: CaptureSectionProps) => {
  const [smileImage, setSmileImage] = useState<string>("");
  const [step, setStep] = useState<"upload" | "confirm">("upload");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Por favor sube una imagen válida");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("La imagen es muy grande. Máximo 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setSmileImage(result);
      setStep("confirm");
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = () => {
    onCapture(smileImage);
  };

  const handleRetake = () => {
    setSmileImage("");
    setStep("upload");
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-8 md:py-12 relative overflow-hidden bg-background">
      {/* Animated gradient background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-accent/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-secondary/10 rounded-full blur-[140px]" />
      </div>

      {/* Logo at top */}
      <div className="w-full mb-8 flex justify-center z-10">
        <img src={simsmileLogo} alt="SimSmile" className="w-48 md:w-64 opacity-60 animate-fade-in" />
      </div>

      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col justify-center mt-4 md:mt-0 z-10">
        {step === "upload" && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Sube tu foto sonriendo
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Elige una foto de tu rostro sonriendo naturalmente, mostrando tus dientes
              </p>
            </div>

            {/* Image Reference */}
            <div className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-lg p-4 max-w-2xl mx-auto">
              <img 
                src={guiaFotoRostroCompleto} 
                alt="Guía para foto de rostro completo" 
                className="w-full h-auto rounded-lg"
              />
            </div>
            
            {/* Upload Area */}
            <div className="max-w-md mx-auto">
              <label htmlFor="file-upload" className="block">
                <div className="relative group cursor-pointer">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-300" />
                  <div className="relative bg-card/50 backdrop-blur-sm border-2 border-dashed border-border hover:border-primary/50 rounded-lg p-12 transition-all group-hover:scale-[1.02]">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Upload className="w-8 h-8 text-primary" />
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold mb-1">
                          Selecciona tu foto
                        </p>
                        <p className="text-sm text-muted-foreground">
                          JPG, PNG o WEBP (máx. 10MB)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="sr-only"
                />
              </label>
            </div>
          </div>
        )}

        {step === "confirm" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl md:text-3xl font-heading font-bold text-center mb-2">
                Foto Cargada
              </h3>
              <p className="text-muted-foreground text-center">
                Revisa tu foto y confirma para comenzar el análisis
              </p>
            </div>

            <div className="relative group max-w-md mx-auto">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-300" />
              <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg overflow-hidden">
                <img src={smileImage} alt="Foto sonriendo" className="w-full h-auto" />
              </div>
            </div>

            <div className="flex gap-4 max-w-md mx-auto">
              <Button
                onClick={handleRetake}
                variant="outline"
                size="lg"
                className="flex-1 border-2 hover:border-accent/50 hover:bg-accent/5 transition-all hover:scale-105"
              >
                Elegir Otra Foto
              </Button>
              <Button
                onClick={handleConfirm}
                size="lg"
                className="flex-1 gap-2 bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/40 transition-all hover:scale-105"
              >
                Analizar Sonrisa
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

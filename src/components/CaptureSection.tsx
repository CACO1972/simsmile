import { useState } from "react";
import { Button } from "@/components/ui/button";
import CameraCapture from "./CameraCapture";
import { ArrowRight, Check, X } from "lucide-react";
import simsmileLogo from "@/assets/simsmile-logo-white-bg.png";

interface CaptureSectionProps {
  onCapture: (restImage: string, smileImage: string) => void;
}

export const CaptureSection = ({ onCapture }: CaptureSectionProps) => {
  const [restImage, setRestImage] = useState<string>("");
  const [smileImage, setSmileImage] = useState<string>("");
  const [step, setStep] = useState<"rest" | "rest-confirm" | "smile" | "smile-confirm">("rest");

  const handleRestCapture = (image: string) => {
    setRestImage(image);
    setStep("rest-confirm");
  };

  const handleRestConfirm = () => {
    setStep("smile");
  };

  const handleRestRetake = () => {
    setRestImage("");
    setStep("rest");
  };

  const handleSmileCapture = (image: string) => {
    setSmileImage(image);
    setStep("smile-confirm");
  };

  const handleSmileConfirm = () => {
    onCapture(restImage, smileImage);
  };

  const handleSmileRetake = () => {
    setSmileImage("");
    setStep("smile");
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
        {step === "rest" && (
          <div className="space-y-6">
            {/* Quick Tips */}
            <div className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-lg p-4 max-w-2xl mx-auto">
              <h3 className="text-lg font-heading font-bold mb-3 text-center">Consejos para una Buena Foto</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Rostro de frente</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Iluminación clara</span>
                </div>
                <div className="flex items-start gap-2">
                  <X className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">No ángulos extremos</span>
                </div>
                <div className="flex items-start gap-2">
                  <X className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">No fotos borrosas</span>
                </div>
              </div>
            </div>
            
            <CameraCapture
              onCapture={handleRestCapture}
              title="Foto en Reposo"
              description="Toma una foto de tu rostro con expresión neutral, labios cerrados"
            />
          </div>
        )}
        
        {step === "rest-confirm" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-heading font-bold text-center mb-2">
                Foto en Reposo Capturada
              </h3>
              <p className="text-muted-foreground text-center">
                Revisa tu foto y confirma si está bien para continuar
              </p>
            </div>

            <div className="relative group max-w-md mx-auto">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-300" />
              <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg overflow-hidden">
                <img src={restImage} alt="Foto en reposo" className="w-full h-auto" />
              </div>
            </div>

            <div className="flex gap-4 max-w-md mx-auto">
              <Button
                onClick={handleRestRetake}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                Tomar de Nuevo
              </Button>
              <Button
                onClick={handleRestConfirm}
                size="lg"
                className="flex-1 gap-2"
              >
                Continuar
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
        
        {step === "smile" && (
          <div className="space-y-6">
            {/* Quick Tips */}
            <div className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-lg p-4 max-w-2xl mx-auto">
              <h3 className="text-lg font-heading font-bold mb-3 text-center">Para la Foto Sonriendo</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Sonrisa natural</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Muestra tus dientes</span>
                </div>
                <div className="flex items-start gap-2">
                  <X className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">No sonrisa forzada</span>
                </div>
                <div className="flex items-start gap-2">
                  <X className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">No labios cerrados</span>
                </div>
              </div>
            </div>
            
            <CameraCapture
              onCapture={handleSmileCapture}
              title="Foto Sonriendo"
              description="Ahora sonríe naturalmente mostrando tus dientes"
            />
          </div>
        )}

        {step === "smile-confirm" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-heading font-bold text-center mb-2">
                Foto Sonriendo Capturada
              </h3>
              <p className="text-muted-foreground text-center">
                Revisa tu foto y confirma para comenzar el análisis
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-lg blur opacity-25 transition duration-300" />
                <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg overflow-hidden p-4">
                  <h4 className="text-lg font-heading font-bold mb-3 text-center">En Reposo</h4>
                  <img src={restImage} alt="Foto en reposo" className="w-full h-auto rounded-lg" />
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-accent to-primary rounded-lg blur opacity-25 transition duration-300" />
                <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg overflow-hidden p-4">
                  <h4 className="text-lg font-heading font-bold mb-3 text-center">Sonriendo</h4>
                  <img src={smileImage} alt="Foto sonriendo" className="w-full h-auto rounded-lg" />
                </div>
              </div>
            </div>

            <div className="flex gap-4 max-w-md mx-auto">
              <Button
                onClick={handleSmileRetake}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                Tomar de Nuevo
              </Button>
              <Button
                onClick={handleSmileConfirm}
                size="lg"
                className="flex-1 gap-2"
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

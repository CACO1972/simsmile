import { useState } from "react";
import { Button } from "@/components/ui/button";
import CameraCapture from "./CameraCapture";
import { Logo } from "./Logo";
import { ArrowRight } from "lucide-react";

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
    <div className="min-h-screen flex flex-col px-4 py-8">
      <div className="absolute top-8 left-8">
        <Logo size="sm" className="opacity-50" />
      </div>

      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col justify-center">
        {step === "rest" && (
          <CameraCapture
            onCapture={handleRestCapture}
            title="Foto en Reposo"
            description="Toma una foto de tu rostro con expresión neutral, labios cerrados"
          />
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
              <div className="absolute -inset-1 bg-gradient-to-r from-gold to-lavender rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-300" />
              <div className="relative bg-card border border-border rounded-lg overflow-hidden">
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
          <CameraCapture
            onCapture={handleSmileCapture}
            title="Foto Sonriendo"
            description="Ahora sonríe naturalmente mostrando tus dientes"
          />
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
                <div className="absolute -inset-1 bg-gradient-to-r from-gold to-lavender rounded-lg blur opacity-25 transition duration-300" />
                <div className="relative bg-card border border-border rounded-lg overflow-hidden p-4">
                  <h4 className="text-lg font-heading font-bold mb-3 text-center">En Reposo</h4>
                  <img src={restImage} alt="Foto en reposo" className="w-full h-auto rounded-lg" />
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-lavender to-gold rounded-lg blur opacity-25 transition duration-300" />
                <div className="relative bg-card border border-border rounded-lg overflow-hidden p-4">
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

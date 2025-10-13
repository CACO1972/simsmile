import { Button } from "@/components/ui/button";
import { Check, X, Camera } from "lucide-react";
import { Logo } from "./Logo";
import correctPhotoExample from "@/assets/correct-photo-example.jpg";
import incorrectPhotoExample from "@/assets/incorrect-photo-example.jpg";
import miroLogo from "@/assets/clinica-miro-logo.png";

interface InstructionsSectionProps {
  onContinue: () => void;
}

export const InstructionsSection = ({ onContinue }: InstructionsSectionProps) => {
  return (
    <div className="min-h-screen flex flex-col px-4 py-8">
      <div className="absolute top-8 left-8">
        <Logo size="xl" />
      </div>

      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col justify-center">
        <h2 className="text-4xl md:text-5xl font-heading font-bold text-center mb-4">
          Instrucciones para el Análisis
        </h2>
        <p className="text-center text-muted-foreground mb-12">
          Sigue estas recomendaciones para obtener los mejores resultados
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Foto Correcta */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="relative">
              <img 
                src={correctPhotoExample} 
                alt="Ejemplo de foto correcta"
                className="w-full h-64 object-cover"
              />
              <div className="absolute top-4 right-4 bg-green-500/90 p-3 rounded-full">
                <Check className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-heading font-bold mb-4 text-green-500">Foto Correcta</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Rostro de frente, mirando a la cámara</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Iluminación uniforme y clara</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Sonrisa natural mostrando los dientes</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Fondo neutro sin distracciones</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Foto Incorrecta */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="relative">
              <img 
                src={incorrectPhotoExample} 
                alt="Ejemplo de foto incorrecta"
                className="w-full h-64 object-cover"
              />
              <div className="absolute top-4 right-4 bg-destructive/90 p-3 rounded-full">
                <X className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-heading font-bold mb-4 text-destructive">Evita Esto</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <X className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                  <span>Rostro de perfil o ángulos extremos</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                  <span>Sombras fuertes o contraluz</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                  <span>Labios cerrados o sonrisa forzada</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                  <span>Fotos borrosas o pixeladas</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center space-y-6">
          <Button size="lg" onClick={onContinue} className="text-lg px-8">
            <Camera className="mr-2" />
            Entendido, Continuar
          </Button>
          
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground">Powered by</span>
              <img src={miroLogo} alt="Clínica Miró" className="h-8" />
            </div>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              © 2025 Dr. Carlos Montoya. Todos los derechos reservados.
              <br />
              IP y Patent Pending
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

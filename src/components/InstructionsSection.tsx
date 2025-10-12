import { Button } from "@/components/ui/button";
import { Check, X, Camera } from "lucide-react";
import { Logo } from "./Logo";

interface InstructionsSectionProps {
  onContinue: () => void;
}

export const InstructionsSection = ({ onContinue }: InstructionsSectionProps) => {
  return (
    <div className="min-h-screen flex flex-col px-4 py-8">
      <div className="absolute top-8 left-8">
        <Logo size="sm" className="opacity-50" />
      </div>

      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col justify-center">
        <h2 className="text-4xl md:text-5xl font-heading font-bold text-center mb-4">
          Instrucciones para el Análisis
        </h2>
        <p className="text-center text-muted-foreground mb-12">
          Sigue estas recomendaciones para obtener los mejores resultados
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Foto Correcta */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-500/20 p-2 rounded-full">
                <Check className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="text-xl font-heading font-bold">Foto Correcta</h3>
            </div>
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

          {/* Foto Incorrecta */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-destructive/20 p-2 rounded-full">
                <X className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-xl font-heading font-bold">Evita Esto</h3>
            </div>
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

        <div className="text-center">
          <Button size="lg" onClick={onContinue} className="text-lg px-8">
            <Camera className="mr-2" />
            Entendido, Continuar
          </Button>
        </div>
      </div>
    </div>
  );
};

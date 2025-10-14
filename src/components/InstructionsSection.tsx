import { Button } from "@/components/ui/button";
import { Check, X, Camera } from "lucide-react";
import correctPhotoExample from "@/assets/correct-photo-example.jpg";
import incorrectPhotoExample from "@/assets/incorrect-photo-example.jpg";
import simsmileLogo from "@/assets/simsmile-logo-white-bg.png";

interface InstructionsSectionProps {
  onContinue: () => void;
}

export const InstructionsSection = ({ onContinue }: InstructionsSectionProps) => {
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
        <img src={simsmileLogo} alt="SimSmile" className="w-64 md:w-80 animate-fade-in" />
      </div>

      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col justify-center mt-4 md:mt-0 z-10">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-center mb-4">
          Instrucciones para el Análisis
        </h2>
        <p className="text-center text-muted-foreground mb-8 md:mb-12 text-sm md:text-base">
          Sigue estas recomendaciones para obtener los mejores resultados
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Foto Correcta */}
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg overflow-hidden hover:border-primary/50 transition-all">
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
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg overflow-hidden hover:border-primary/50 transition-all">
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
          
          <p className="text-xs text-muted-foreground/60 max-w-md mx-auto">
            © 2025 Dr. Carlos Montoya. Todos los derechos reservados.
            <br />
            IP y Patent Pending
          </p>
        </div>
      </div>
    </div>
  );
};

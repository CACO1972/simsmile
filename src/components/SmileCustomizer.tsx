import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Sparkles, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SmileCustomizerProps {
  baseImage: string;
  onSimulate: (customizedImage: string) => void;
}

export const SmileCustomizer = ({ baseImage, onSimulate }: SmileCustomizerProps) => {
  const [teethLength, setTeethLength] = useState([50]); // 0-100
  const [teethWidth, setTeethWidth] = useState([50]); // 0-100
  const [teethWhiteness, setTeethWhiteness] = useState([50]); // 0-100
  const [isSimulating, setIsSimulating] = useState(false);

  const resetToDefaults = () => {
    setTeethLength([50]);
    setTeethWidth([50]);
    setTeethWhiteness([50]);
    toast.success("Valores restablecidos");
  };

  const getParameterLabel = (value: number, type: 'length' | 'width' | 'whiteness') => {
    if (value < 30) return type === 'whiteness' ? 'Menos blanco' : 'Más cortos';
    if (value < 45) return type === 'whiteness' ? 'Natural' : 'Cortos';
    if (value < 55) return 'Estándar';
    if (value < 70) return type === 'whiteness' ? 'Brillante' : 'Largos';
    return type === 'whiteness' ? 'Muy blanco' : 'Más largos';
  };

  const handleSimulate = async () => {
    setIsSimulating(true);
    toast.loading("Generando tu sonrisa personalizada...");

    try {
      // Crear el prompt basado en los parámetros ajustados
      const lengthDesc = teethLength[0] < 40 ? "dientes más cortos" 
        : teethLength[0] > 60 ? "dientes más largos" : "longitud de dientes estándar";
      
      const widthDesc = teethWidth[0] < 40 ? "dientes más delgados" 
        : teethWidth[0] > 60 ? "dientes más anchos" : "ancho de dientes estándar";
      
      const whitenessDesc = teethWhiteness[0] < 40 ? "tono de dientes natural" 
        : teethWhiteness[0] > 60 ? "dientes muy blancos" : "dientes blancos naturales";

      const customPrompt = `Adjust this smile photo with these specifications:
- ${lengthDesc}
- ${widthDesc}
- ${whitenessDesc}

Maintain facial proportions, skin tone, and natural appearance. Focus only on teeth modifications.`;

      const { data, error } = await supabase.functions.invoke('simulate-smile', {
        body: {
          image: baseImage,
          customPrompt: customPrompt,
          customParameters: {
            teethLength: teethLength[0],
            teethWidth: teethWidth[0],
            teethWhiteness: teethWhiteness[0]
          }
        }
      });

      toast.dismiss();

      if (error) throw error;

      if (data?.customizedImage) {
        onSimulate(data.customizedImage);
        toast.success("¡Sonrisa personalizada generada!");
      } else {
        throw new Error("No se recibió imagen personalizada");
      }
    } catch (error) {
      console.error("Error simulating custom smile:", error);
      toast.dismiss();
      toast.error("Error al generar la sonrisa personalizada");
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-accent/10 to-card/50 backdrop-blur border-accent/30 p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-heading font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-accent" />
          Personaliza Tu Sonrisa
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={resetToDefaults}
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Restablecer
        </Button>
      </div>

      <p className="text-sm text-muted-foreground mb-6">
        Ajusta los parámetros para ver cómo quedaría tu sonrisa con diferentes características
      </p>

      <div className="space-y-6 mb-8">
        {/* Longitud de Dientes */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Longitud de Dientes</label>
            <span className="text-xs px-3 py-1 rounded-full bg-accent/20 text-accent border border-accent/30">
              {getParameterLabel(teethLength[0], 'length')}
            </span>
          </div>
          <Slider
            value={teethLength}
            onValueChange={setTeethLength}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Más cortos</span>
            <span>Estándar</span>
            <span>Más largos</span>
          </div>
        </div>

        {/* Ancho de Dientes */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Ancho de Dientes</label>
            <span className="text-xs px-3 py-1 rounded-full bg-accent/20 text-accent border border-accent/30">
              {getParameterLabel(teethWidth[0], 'width')}
            </span>
          </div>
          <Slider
            value={teethWidth}
            onValueChange={setTeethWidth}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Más delgados</span>
            <span>Estándar</span>
            <span>Más anchos</span>
          </div>
        </div>

        {/* Blancura de Dientes */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Blancura de Dientes</label>
            <span className="text-xs px-3 py-1 rounded-full bg-accent/20 text-accent border border-accent/30">
              {getParameterLabel(teethWhiteness[0], 'whiteness')}
            </span>
          </div>
          <Slider
            value={teethWhiteness}
            onValueChange={setTeethWhiteness}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Natural</span>
            <span>Blanco</span>
            <span>Muy blanco</span>
          </div>
        </div>
      </div>

      <Button
        onClick={handleSimulate}
        disabled={isSimulating}
        className="w-full gap-2 h-12 text-base"
        size="lg"
      >
        <Sparkles className="h-5 w-5" />
        {isSimulating ? "Generando..." : "Generar Sonrisa Personalizada"}
      </Button>

      <p className="text-xs text-muted-foreground text-center mt-4">
        La generación puede tomar unos segundos. Los resultados son orientativos.
      </p>
    </Card>
  );
};

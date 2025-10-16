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
      // Crear el prompt basado en los parámetros ajustados con cambios más evidentes
      const lengthValue = teethLength[0];
      const widthValue = teethWidth[0];
      const whitenessValue = teethWhiteness[0];
      
      // Instrucciones específicas por parámetro con rangos más marcados
      let lengthInstruction = "";
      if (lengthValue < 35) {
        lengthInstruction = "CRITICALLY IMPORTANT: Make teeth 25-30% SHORTER than current. Reduce vertical height dramatically so the change is clearly visible.";
      } else if (lengthValue < 48) {
        lengthInstruction = "Make teeth 10-15% shorter than current length. Noticeable reduction in height.";
      } else if (lengthValue > 65) {
        lengthInstruction = "CRITICALLY IMPORTANT: Make teeth 25-30% LONGER than current. Increase vertical height dramatically so the change is clearly visible. Elongate them significantly.";
      } else if (lengthValue > 52) {
        lengthInstruction = "Make teeth 10-15% longer than current length. Noticeable increase in height.";
      } else {
        lengthInstruction = "Keep teeth at standard proportional length.";
      }

      let widthInstruction = "";
      if (widthValue < 35) {
        widthInstruction = "CRITICALLY IMPORTANT: Make teeth 25-30% NARROWER/THINNER than current. Reduce horizontal width dramatically - make them visibly slimmer.";
      } else if (widthValue < 48) {
        widthInstruction = "Make teeth 10-15% narrower than current width. Visible slimming effect.";
      } else if (widthValue > 65) {
        widthInstruction = "CRITICALLY IMPORTANT: Make teeth 25-30% WIDER/BROADER than current. Increase horizontal width dramatically - make them noticeably broader.";
      } else if (widthValue > 52) {
        widthInstruction = "Make teeth 10-15% wider than current width. Visible broadening effect.";
      } else {
        widthInstruction = "Keep teeth at standard proportional width.";
      }

      let whitenessInstruction = "";
      if (whitenessValue < 35) {
        whitenessInstruction = "CRITICALLY IMPORTANT: Make teeth significantly LESS WHITE - use natural ivory/cream tones (shade A3-A4). Make the color change very obvious.";
      } else if (whitenessValue < 48) {
        whitenessInstruction = "Use natural tooth color with slight ivory tone (shade A2).";
      } else if (whitenessValue > 65) {
        whitenessInstruction = "CRITICALLY IMPORTANT: Make teeth EXTREMELY WHITE - brilliant Hollywood white (shade B1 or bleaching white). Make them dramatically brighter than current.";
      } else if (whitenessValue > 52) {
        whitenessInstruction = "Make teeth very white and bright (shade A1).";
      } else {
        whitenessInstruction = "Use standard natural white tooth color.";
      }

      const customPrompt = `You are a dental image editing AI. Edit this smile photo following these EXACT specifications. The changes MUST be clearly visible and obvious:

TEETH LENGTH ADJUSTMENT:
${lengthInstruction}

TEETH WIDTH ADJUSTMENT:
${widthInstruction}

TEETH COLOR/WHITENESS ADJUSTMENT:
${whitenessInstruction}

CRITICAL REQUIREMENTS:
- Make changes BOLD and CLEARLY VISIBLE - the difference must be obvious when comparing
- Apply changes to ALL visible teeth uniformly
- Maintain natural tooth texture and translucency
- Keep facial features, skin, and background exactly the same
- Focus ONLY on modifying the teeth as specified
- The adjustments should be dramatic enough to be immediately noticeable

Output a high-quality edited image where the tooth modifications are CLEARLY APPARENT.`;

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

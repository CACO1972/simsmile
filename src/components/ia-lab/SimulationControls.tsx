import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface Adjustments {
  toothLength: number;
  toothWidth: number;
  whiteness: number;
}

interface SimulationControlsProps {
  adjustments: Adjustments;
  onAdjustmentChange: (adjustments: Adjustments) => void;
  onReset: () => void;
  onRegenerate: () => void;
  isSimulating: boolean;
}

export function SimulationControls({ 
  adjustments, 
  onAdjustmentChange, 
  onReset, 
  onRegenerate,
  isSimulating 
}: SimulationControlsProps) {
  return (
    <div className="border-t border-border pt-6">
      <div className="bg-accent/10 rounded-xl p-6 border border-accent/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Ajustes sutiles (±5% máximo)
          </h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onReset}
          >
            Restablecer
          </Button>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center justify-between">
              <span>Longitud de dientes</span>
              <span className="text-xs font-mono text-muted-foreground">
                {adjustments.toothLength > 0 ? '+' : ''}{adjustments.toothLength}%
              </span>
            </Label>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-16">Más cortos</span>
              <Slider
                value={[adjustments.toothLength]}
                onValueChange={(val) => onAdjustmentChange({ ...adjustments, toothLength: val[0] })}
                min={-5}
                max={5}
                step={1}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-16 text-right">Más largos</span>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center justify-between">
              <span>Anchura de dientes</span>
              <span className="text-xs font-mono text-muted-foreground">
                {adjustments.toothWidth > 0 ? '+' : ''}{adjustments.toothWidth}%
              </span>
            </Label>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-16">Más estrechos</span>
              <Slider
                value={[adjustments.toothWidth]}
                onValueChange={(val) => onAdjustmentChange({ ...adjustments, toothWidth: val[0] })}
                min={-5}
                max={5}
                step={1}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-16 text-right">Más anchos</span>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Blancura de dientes</Label>
            <div className="grid grid-cols-3 gap-2">
              {(['Natural', 'Moderado', 'Intenso'] as const).map((level, idx) => (
                <button
                  key={level}
                  onClick={() => onAdjustmentChange({ ...adjustments, whiteness: idx })}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                    adjustments.whiteness === idx
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-foreground border-border hover:border-primary/50'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <Button 
            className="w-full mt-4" 
            onClick={onRegenerate}
            disabled={isSimulating || (adjustments.toothLength === 0 && adjustments.toothWidth === 0 && adjustments.whiteness === 0)}
            size="lg"
          >
            {isSimulating ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Regenerando...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Regenerar con ajustes
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-2">
            Los cambios se mantienen sutiles para preservar la armonía facial
          </p>
        </div>
      </div>
    </div>
  );
}

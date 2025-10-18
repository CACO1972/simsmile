import { Card } from "@/components/ui/card";
import { Lock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FacialAnalysisData {
  horizontal_ratio?: { 
    upper: number; 
    middle: number; 
    lower: number;
    explanation?: string;
    golden_ratio_comparison?: string;
  };
  vertical_ratio?: { 
    sections: number[];
    explanation?: string;
  };
  face_aspect_ratio?: { 
    value: number;
    golden_ratio_ideal: number;
    difference: number;
    explanation?: string;
  };
  eye_distance?: { 
    value: number; 
    category: string;
    explanation?: string;
  };
  eye_aspect_ratio?: { 
    value: number;
    explanation?: string;
  };
  nose_to_mouth_ratio?: { 
    value: number;
    golden_ratio_ideal: number;
    difference: number;
    explanation?: string;
  };
  symmetry_score?: number;
  overall_golden_ratio_score?: number;
  overall_assessment?: string;
}

interface FacialAnalysisReportProps {
  data: FacialAnalysisData;
  imageUrl: string;
  onUnlockPremium?: () => void;
}

// Análisis disponibles: 2 gratis, 4 premium
const ANALYSIS_ITEMS = [
  {
    id: 1,
    title: "Proporción Horizontal Facial (Regla de Tercios)",
    free: true,
    description: "Comparación con el ideal del Golden Ratio",
    getValue: (data: FacialAnalysisData) => {
      const h = data.horizontal_ratio;
      if (!h || h.upper === undefined || h.middle === undefined || h.lower === undefined) return null;
      return `${h.upper.toFixed(1)}% : ${h.middle.toFixed(1)}% : ${h.lower.toFixed(1)}%`;
    },
    getIdeal: () => "33.3% : 33.3% : 33.3%",
    getExplanation: (data: FacialAnalysisData) => {
      return data.horizontal_ratio?.explanation || "";
    },
    getGoldenRatioNote: (data: FacialAnalysisData) => {
      return data.horizontal_ratio?.golden_ratio_comparison || "";
    }
  },
  {
    id: 2,
    title: "Proporción Vertical Facial (Regla de Quintos)",
    free: true,
    description: "Balance del ancho facial según Golden Ratio",
    getValue: (data: FacialAnalysisData) => {
      const v = data.vertical_ratio?.sections;
      if (!v || v.length < 5 || v.some(val => val === undefined)) return null;
      return `${v[0].toFixed(1)}% : ${v[1].toFixed(1)}% : ${v[2].toFixed(1)}% : ${v[3].toFixed(1)}% : ${v[4].toFixed(1)}%`;
    },
    getIdeal: () => "20% : 20% : 20% : 20% : 20%",
    getExplanation: (data: FacialAnalysisData) => {
      return data.vertical_ratio?.explanation || "";
    }
  },
  {
    id: 3,
    title: "Ratio de Aspecto Facial",
    free: false,
    description: "Comparación directa con el Golden Ratio (φ = 1.618)",
    getValue: (data: FacialAnalysisData) => {
      const value = data.face_aspect_ratio?.value;
      return value ? `1 : ${value.toFixed(3)}` : null;
    },
    getIdeal: () => "1 : 1.618",
    getExplanation: (data: FacialAnalysisData) => {
      const far = data.face_aspect_ratio;
      if (!far) return "";
      const diff = Math.abs(far.difference);
      const percentage = ((1 - diff / 1.618) * 100).toFixed(1);
      return `${far.explanation || ""}\nTu rostro está ${percentage}% cerca del Golden Ratio ideal.`;
    },
    getGoldenRatioNote: (data: FacialAnalysisData) => {
      const far = data.face_aspect_ratio;
      if (!far) return "";
      if (Math.abs(far.difference) < 0.1) return "✨ Muy cerca del Golden Ratio";
      if (Math.abs(far.difference) < 0.3) return "Cercano al Golden Ratio";
      return "Se aleja del Golden Ratio";
    }
  },
  {
    id: 4,
    title: "Distancia entre Ojos",
    free: false,
    description: "Separación ideal según proporciones áureas",
    getValue: (data: FacialAnalysisData) => {
      const ed = data.eye_distance;
      return ed ? `${ed.value.toFixed(2)} (${ed.category})` : null;
    },
    getIdeal: () => "1.0 (ideal spacing)",
    getExplanation: (data: FacialAnalysisData) => {
      return data.eye_distance?.explanation || "";
    }
  },
  {
    id: 5,
    title: "Ratio de Aspecto de Ojos",
    free: false,
    description: "Forma de ojos y harmonía facial",
    getValue: (data: FacialAnalysisData) => {
      const ear = data.eye_aspect_ratio?.value;
      return ear ? `1 : ${ear.toFixed(3)}` : null;
    },
    getIdeal: () => "1 : 0.35-0.40",
    getExplanation: (data: FacialAnalysisData) => {
      return data.eye_aspect_ratio?.explanation || "";
    }
  },
  {
    id: 6,
    title: "Ratio Nariz-Boca (Golden Ratio)",
    free: false,
    description: "Comparación con φ = 0.618 (Golden Ratio)",
    getValue: (data: FacialAnalysisData) => {
      const nmr = data.nose_to_mouth_ratio?.value;
      return nmr ? `${nmr.toFixed(3)}` : null;
    },
    getIdeal: () => "0.618 (φ Golden Ratio)",
    getExplanation: (data: FacialAnalysisData) => {
      const nmr = data.nose_to_mouth_ratio;
      if (!nmr) return "";
      const diff = Math.abs(nmr.difference);
      const percentage = ((1 - diff / 0.618) * 100).toFixed(1);
      return `${nmr.explanation || ""}\nEsta proporción está ${percentage}% cerca del Golden Ratio φ (0.618).`;
    },
    getGoldenRatioNote: (data: FacialAnalysisData) => {
      const nmr = data.nose_to_mouth_ratio;
      if (!nmr) return "";
      if (Math.abs(nmr.difference) < 0.05) return "✨ Golden Ratio perfecto";
      if (Math.abs(nmr.difference) < 0.15) return "Muy cerca del Golden Ratio";
      return "Se aleja del Golden Ratio";
    }
  }
];

const AnalysisCard = ({ 
  item, 
  data, 
  locked 
}: { 
  item: typeof ANALYSIS_ITEMS[0]; 
  data: FacialAnalysisData; 
  locked: boolean 
}) => {
  const value = item.getValue(data);

  if (locked) {
    return (
      <Card className="relative overflow-hidden bg-muted/50 border-muted">
        <div className="absolute inset-0 backdrop-blur-sm bg-background/90 z-10 flex items-center justify-center">
          <div className="text-center p-6">
            <Lock className="h-16 w-16 text-muted-foreground mx-auto mb-3" />
            <p className="text-lg font-bold text-foreground mb-1">Análisis Premium</p>
            <p className="text-sm text-muted-foreground">Desbloquea para ver detalles</p>
          </div>
        </div>
        
        <div className="p-6 blur-sm">
          <h3 className="text-lg font-bold mb-2">{item.title}</h3>
          <div className="bg-muted/30 rounded-lg p-4">
            <p className="text-2xl font-bold text-primary">•••</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-card to-muted/10 border-primary/20 hover:border-primary/40 transition-all">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-bold flex-1">{item.title}</h3>
          {item.free && (
            <span className="px-3 py-1 text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
              GRATIS
            </span>
          )}
        </div>
        
        {/* Comparación visual TU vs IDEAL */}
        <div className="space-y-3 mb-4">
          {/* Tu medición */}
          <div className="bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl p-4 border-2 border-primary/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-primary mb-1">TU MEDICIÓN</p>
                <p className="text-2xl font-bold text-primary">{value || "N/A"}</p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>

          {/* Golden Ratio Ideal */}
          {'getIdeal' in item && (
            <div className="bg-gradient-to-r from-yellow-100/50 to-orange-100/50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-4 border-2 border-yellow-400/30 dark:border-yellow-600/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 mb-1">GOLDEN RATIO IDEAL</p>
                  <p className="text-lg font-bold text-yellow-800 dark:text-yellow-300">{item.getIdeal()}</p>
                </div>
                <div className="text-3xl">φ</div>
              </div>
            </div>
          )}
        </div>

        {/* Nota Golden Ratio - prominente */}
        {'getGoldenRatioNote' in item && item.getGoldenRatioNote(data) && (
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl border border-green-300 dark:border-green-700 mb-4">
            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0" />
            <p className="text-sm font-semibold text-green-800 dark:text-green-300">{item.getGoldenRatioNote(data)}</p>
          </div>
        )}

        {/* Explicación colapsable */}
        {'getExplanation' in item && item.getExplanation(data) && (
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-2">
              <span>Ver explicación detallada</span>
              <span className="group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="mt-3 p-4 bg-muted/30 rounded-lg border border-muted text-sm leading-relaxed">
              {item.getExplanation(data)}
            </div>
          </details>
        )}
      </div>
    </Card>
  );
};

export const FacialAnalysisReport = ({ 
  data, 
  imageUrl,
  onUnlockPremium 
}: FacialAnalysisReportProps) => {
  return (
    <div className="space-y-8">
      {/* Header mejorado */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 mb-4">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">Análisis Facial Completo</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-heading font-bold mb-3 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          Proporciones de Tu Rostro
        </h2>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          Comparación con el <span className="font-semibold text-primary">Golden Ratio φ (1.618)</span>, 
          la proporción áurea de la belleza universal
        </p>
      </div>

      {/* Resumen Golden Ratio - PRIMERO */}
      <Card className="bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 border-2 border-primary/30 overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-heading font-bold mb-2">
              Tu Puntuación Golden Ratio
            </h3>
            <p className="text-muted-foreground">
              Proximidad a las proporciones perfectas de la naturaleza
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
            {/* Score principal */}
            <div className="text-center">
              <div className="relative inline-block">
                <div className="h-32 w-32 rounded-full bg-gradient-to-br from-primary via-accent to-primary/70 flex items-center justify-center shadow-2xl">
                  <span className="text-5xl font-bold text-white">
                    {data.overall_golden_ratio_score || 'N/A'}
                  </span>
                </div>
                <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg shadow-lg">
                  φ
                </div>
              </div>
              <p className="text-lg font-semibold mt-4">Golden Ratio Score</p>
              <p className="text-sm text-muted-foreground">de 100 puntos</p>
            </div>
            
            {/* Simetría */}
            {data.symmetry_score && (
              <div className="text-center">
                <div className="h-32 w-32 rounded-full bg-gradient-to-br from-accent to-primary/50 flex items-center justify-center shadow-2xl">
                  <span className="text-5xl font-bold text-white">
                    {data.symmetry_score}
                  </span>
                </div>
                <p className="text-lg font-semibold mt-4">Simetría Facial</p>
                <p className="text-sm text-muted-foreground">Balance perfecto</p>
              </div>
            )}
          </div>

          {/* Interpretación */}
          {data.overall_assessment && (
            <div className="bg-white/50 dark:bg-black/20 rounded-xl p-6 border border-primary/20">
              <p className="text-base leading-relaxed text-center">
                {data.overall_assessment}
              </p>
            </div>
          )}

          {/* Barra visual del score */}
          <div className="mt-6">
            <div className="h-4 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-1000"
                style={{ width: `${data.overall_golden_ratio_score || 0}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>0</span>
              <span>50</span>
              <span>100</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Photo de referencia */}
      <Card className="bg-gradient-to-br from-card to-muted/20 border-primary/20 p-6">
        <h3 className="text-xl font-heading font-bold text-center mb-4">Tu Foto Analizada</h3>
        <div className="max-w-sm mx-auto">
          <img 
            src={imageUrl} 
            alt="Análisis facial"
            className="w-full aspect-square object-cover rounded-xl border-2 border-primary/30 shadow-xl"
          />
        </div>
      </Card>

      {/* Explicación simple del Golden Ratio */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-300 dark:border-yellow-700 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center text-2xl font-bold text-yellow-900">
            φ
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">¿Qué es el Golden Ratio φ?</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              El Golden Ratio (φ = 1.618) es una proporción matemática que aparece en la naturaleza, el arte y la arquitectura. 
              En el rostro humano, esta proporción define las medidas consideradas más armoniosas y estéticamente agradables.
            </p>
          </div>
        </div>
      </Card>

      {/* Grid de análisis - SIMPLIFICADO */}
      <div>
        <h3 className="text-2xl font-heading font-bold text-center mb-6">
          Análisis Detallado de Proporciones
        </h3>
        <div className="grid gap-6 md:grid-cols-2">
          {ANALYSIS_ITEMS.map((item) => (
            <AnalysisCard 
              key={item.id}
              item={item}
              data={data}
              locked={!item.free}
            />
          ))}
        </div>
      </div>

      {/* CTA Premium */}
      <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30 p-8 text-center">
        <h3 className="text-2xl font-heading font-bold mb-3">
          🔓 Desbloquea los 4 Análisis Premium
        </h3>
        <p className="text-muted-foreground mb-6">
          Obtén el análisis facial completo con todas las mediciones profesionales
        </p>
        <Button 
          size="lg" 
          onClick={onUnlockPremium}
          className="text-lg px-8 bg-gradient-to-r from-primary to-accent"
        >
          Ver Planes Premium
        </Button>
      </Card>
    </div>
  );
};

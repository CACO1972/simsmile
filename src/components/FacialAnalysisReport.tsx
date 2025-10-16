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
        <div className="absolute inset-0 backdrop-blur-sm bg-background/80 z-10 flex items-center justify-center">
          <div className="text-center">
            <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium text-muted-foreground">Premium</p>
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="text-xl font-heading font-bold mb-4">{item.title}</h3>
          {'description' in item && (
            <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
          )}
          <div className="bg-muted/30 rounded-lg p-4 mb-4">
            <p className="text-2xl font-bold text-primary">••• : ••• : •••</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-card to-muted/20 border-primary/20">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-heading font-bold mb-1">{item.title}</h3>
            {'description' in item && (
              <p className="text-sm text-muted-foreground">{item.description}</p>
            )}
          </div>
          {item.free && (
            <span className="px-2 py-1 text-xs font-semibold bg-primary/20 text-primary rounded-full">
              GRATIS
            </span>
          )}
        </div>
        
        {/* Tus mediciones */}
        <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-4 mb-3 border border-primary/20">
          <p className="text-xs text-muted-foreground mb-1">Tu Medición Real</p>
          <p className="text-2xl font-bold text-primary">{value || "N/A"}</p>
        </div>

        {/* Golden Ratio Ideal */}
        {'getIdeal' in item && (
          <div className="bg-gradient-to-br from-accent/5 to-accent/10 rounded-lg p-3 mb-4 border border-accent/20">
            <p className="text-xs text-muted-foreground mb-1">Golden Ratio Ideal φ</p>
            <p className="text-lg font-semibold text-accent-foreground">{item.getIdeal()}</p>
          </div>
        )}

        {/* Explicación simple */}
        {'getExplanation' in item && item.getExplanation(data) && (
          <div className="mb-4 p-4 bg-muted/20 rounded-lg border border-muted">
            <p className="text-sm leading-relaxed whitespace-pre-line">
              {item.getExplanation(data)}
            </p>
          </div>
        )}

        {/* Nota Golden Ratio */}
        {'getGoldenRatioNote' in item && item.getGoldenRatioNote(data) && (
          <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
            <p className="text-sm font-medium">{item.getGoldenRatioNote(data)}</p>
          </div>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-heading font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Análisis de Proporciones Faciales
        </h2>
        <p className="text-muted-foreground">
          6 análisis profesionales • 2 gratis, 4 premium
        </p>
      </div>

      {/* Photo de referencia */}
      <Card className="bg-gradient-to-br from-primary/5 to-card/50 p-6">
        <div className="max-w-md mx-auto">
          <img 
            src={imageUrl} 
            alt="Análisis facial"
            className="w-full aspect-square object-cover rounded-lg border-2 border-primary/30 shadow-xl"
          />
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span>Calidad de imagen: Excelente</span>
          </div>
        </div>
      </Card>

      {/* Grid de análisis */}
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

      {/* CTA Premium */}
      <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30 p-8 text-center">
        <h3 className="text-2xl font-heading font-bold mb-3">
          Desbloquea los 4 Análisis Premium
        </h3>
        <p className="text-muted-foreground mb-6">
          Obtén acceso completo a todos los análisis faciales profesionales
        </p>
        <Button 
          size="lg" 
          onClick={onUnlockPremium}
          className="text-lg px-8"
        >
          Ver Planes Premium
        </Button>
      </Card>

      {/* Resumen general con Golden Ratio Score */}
      <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-card p-6 border-primary/30">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-heading font-bold mb-2">
            Golden Ratio Score General
          </h3>
          <p className="text-muted-foreground">
            Proximidad de tus proporciones faciales al Golden Ratio φ (1.618)
          </p>
        </div>
        
        <div className="flex items-center justify-center gap-6 mb-6">
          <div className="text-center">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-2 mx-auto">
              <span className="text-3xl font-bold text-white">
                {data.overall_golden_ratio_score || 'N/A'}
              </span>
            </div>
            <p className="text-sm font-semibold">Score φ</p>
          </div>
          
          {data.symmetry_score && (
            <div className="text-center">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-accent to-primary/50 flex items-center justify-center mb-2 mx-auto">
                <span className="text-3xl font-bold text-white">
                  {data.symmetry_score}
                </span>
              </div>
              <p className="text-sm font-semibold">Simetría</p>
            </div>
          )}
        </div>

        {data.overall_assessment && (
          <div className="bg-muted/30 rounded-lg p-4 border border-muted">
            <p className="text-sm leading-relaxed text-center">
              {data.overall_assessment}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

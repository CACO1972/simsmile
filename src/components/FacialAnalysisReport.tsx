import { Card } from "@/components/ui/card";
import { Lock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FacialAnalysisData {
  horizontal_ratio?: { upper: number; middle: number; lower: number };
  vertical_ratio?: number[];
  face_aspect_ratio?: number;
  eye_distance?: { value: number; category: string };
  eye_width?: { value: number; category: string };
  eye_aspect_ratio?: number;
  nose_aspect_ratio?: number;
  nose_to_mouth_width?: number;
  nose_lip_chin_ratio?: number;
  upper_lower_lip_ratio?: number;
  mouth_width_percentage?: number;
  symmetry_score?: number;
  golden_ratio_score?: number;
  overall_balance?: string;
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
    title: "Face Horizontal Ratio",
    free: true,
    getValue: (data: FacialAnalysisData) => {
      const h = data.horizontal_ratio;
      if (!h) return null;
      return `${h.upper.toFixed(0)}% : ${h.middle.toFixed(0)}% : ${h.lower.toFixed(0)}%`;
    },
    getDetail: (data: FacialAnalysisData) => {
      const h = data.horizontal_ratio;
      if (!h) return "";
      const isBalanced = Math.abs(h.upper - 33) < 3 && Math.abs(h.middle - 33) < 3 && Math.abs(h.lower - 33) < 3;
      return isBalanced ? "Balanceado" : "Mejorable";
    },
    sections: ["Your Upper Section", "Your Middle Section", "Your Lower Section"]
  },
  {
    id: 2,
    title: "Face Vertical Ratio",
    free: true,
    getValue: (data: FacialAnalysisData) => {
      const v = data.vertical_ratio;
      if (!v || v.length < 5) return null;
      return `${v[0].toFixed(0)}% : ${v[1].toFixed(0)}% : ${v[2].toFixed(0)}% : ${v[3].toFixed(0)}% : ${v[4].toFixed(0)}%`;
    },
    getDetail: (data: FacialAnalysisData) => {
      const v = data.vertical_ratio;
      if (!v || v.length < 5) return "";
      const isBalanced = v.every(val => Math.abs(val - 20) < 3);
      return isBalanced ? "Balanceado" : "Mejorable";
    },
    sections: ["Eye Distance", "Eye Width"]
  },
  {
    id: 3,
    title: "Face Aspect Ratio",
    free: false,
    getValue: (data: FacialAnalysisData) => {
      return data.face_aspect_ratio ? `1 : ${data.face_aspect_ratio.toFixed(3)}` : null;
    },
    getDetail: (data: FacialAnalysisData) => {
      const ratio = data.face_aspect_ratio || 0;
      const ideal = 1.618; // Golden ratio
      const diff = Math.abs(ratio - ideal);
      return diff < 0.2 ? "Cerca del Golden Ratio" : "Proporción estándar";
    },
    sections: ["Your Face Aspect Ratio"]
  },
  {
    id: 4,
    title: "Eye Aspect Ratio",
    free: false,
    getValue: (data: FacialAnalysisData) => {
      return data.eye_aspect_ratio ? `1 : ${data.eye_aspect_ratio.toFixed(3)}` : null;
    },
    getDetail: (data: FacialAnalysisData) => {
      return data.eye_width?.category || "";
    },
    sections: []
  },
  {
    id: 5,
    title: "Nose Aspect Ratio",
    free: false,
    getValue: (data: FacialAnalysisData) => {
      return data.nose_aspect_ratio ? `1 : ${data.nose_aspect_ratio.toFixed(3)}` : null;
    },
    getDetail: (data: FacialAnalysisData) => {
      return "";
    },
    sections: ["Your Nose", "Nose Width to Mouth Width"]
  },
  {
    id: 6,
    title: "Nose to Lip to Chin",
    free: false,
    getValue: (data: FacialAnalysisData) => {
      return data.nose_lip_chin_ratio ? `1 : ${data.nose_lip_chin_ratio.toFixed(2)}` : null;
    },
    getDetail: (data: FacialAnalysisData) => {
      return "";
    },
    sections: ["Your Lower Face", "Upper Lip to Lower Lip", "Your Lips"]
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
  const detail = item.getDetail(data);

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
          <div className="bg-muted/30 rounded-lg p-4 mb-4">
            <p className="text-2xl font-bold text-primary">••• : ••• : •••</p>
          </div>
          {item.sections.map((section, idx) => (
            <div key={idx} className="bg-muted/20 rounded-lg p-3 mb-2">
              <p className="text-sm font-medium text-muted-foreground">{section}</p>
              <div className="h-2 bg-muted rounded-full mt-2" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-card to-muted/20 border-primary/20">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-heading font-bold">{item.title}</h3>
          {item.free && (
            <span className="px-2 py-1 text-xs font-semibold bg-primary/20 text-primary rounded-full">
              GRATIS
            </span>
          )}
        </div>
        
        <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-4 mb-4 border border-primary/20">
          <p className="text-sm text-muted-foreground mb-1">Your Ratio</p>
          <p className="text-3xl font-bold text-primary">{value || "N/A"}</p>
        </div>

        {detail && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-muted/30 rounded-lg">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium">{detail}</p>
          </div>
        )}

        {item.sections.map((section, idx) => {
          // Simular valores de las barras basados en los datos
          let barPosition = 50;
          let barLabel = "Balanced";
          
          if (section.includes("Upper") && data.horizontal_ratio) {
            const val = data.horizontal_ratio.upper;
            if (val < 30) { barPosition = 20; barLabel = "Short"; }
            else if (val > 36) { barPosition = 80; barLabel = "Long"; }
          } else if (section.includes("Middle") && data.horizontal_ratio) {
            const val = data.horizontal_ratio.middle;
            if (val < 30) { barPosition = 20; barLabel = "Short"; }
            else if (val > 36) { barPosition = 80; barLabel = "Long"; }
          } else if (section.includes("Lower") && data.horizontal_ratio) {
            const val = data.horizontal_ratio.lower;
            if (val < 30) { barPosition = 20; barLabel = "Short"; }
            else if (val > 36) { barPosition = 80; barLabel = "Long"; }
          } else if (section.includes("Eye Distance") && data.eye_distance) {
            if (data.eye_distance.category === "narrow") { barPosition = 20; barLabel = "Narrow"; }
            else if (data.eye_distance.category === "wide") { barPosition = 80; barLabel = "Wide"; }
          } else if (section.includes("Eye Width") && data.eye_width) {
            if (data.eye_width.category === "narrow") { barPosition = 20; barLabel = "Narrow"; }
            else if (data.eye_width.category === "wide") { barPosition = 80; barLabel = "Wide"; }
          }

          return (
            <div key={idx} className="mb-3">
              <p className="text-sm font-medium mb-2">{section}</p>
              <div className="relative">
                <div className="h-2 bg-gradient-to-r from-muted via-primary/30 to-muted rounded-full" />
                <div 
                  className="absolute top-0 h-2 w-16 bg-primary rounded-full shadow-lg"
                  style={{ left: `calc(${barPosition}% - 32px)` }}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Short</span>
                  <span className="font-medium text-primary">{barLabel}</span>
                  <span>Long</span>
                </div>
              </div>
            </div>
          );
        })}
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

      {/* Resumen general */}
      {data.overall_balance && (
        <Card className="bg-muted/30 p-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-1">Balance General</h4>
              <p className="text-2xl font-bold capitalize">{data.overall_balance}</p>
              {data.symmetry_score && (
                <p className="text-sm text-muted-foreground mt-1">
                  Simetría: {data.symmetry_score}%
                </p>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

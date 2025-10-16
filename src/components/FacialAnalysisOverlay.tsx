import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";

interface FacialAnalysisData {
  horizontal_ratio?: { 
    upper: number; 
    middle: number; 
    lower: number;
  };
  vertical_ratio?: { 
    sections: number[];
  };
  face_aspect_ratio?: { 
    value: number;
    golden_ratio_ideal: number;
  };
  symmetry_score?: number;
  overall_golden_ratio_score?: number;
}

interface FacialAnalysisOverlayProps {
  imageUrl: string;
  data: FacialAnalysisData;
}

export const FacialAnalysisOverlay = ({ imageUrl, data }: FacialAnalysisOverlayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !imageRef.current || !data) return;
    
    const canvas = canvasRef.current;
    const image = imageRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawOverlay = () => {
      // Set canvas size to match image
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      
      const w = canvas.width;
      const h = canvas.height;

      // Draw image first
      ctx.drawImage(image, 0, 0, w, h);

      // Only draw if we have horizontal_ratio data
      if (!data.horizontal_ratio) return;

      const { upper, middle, lower } = data.horizontal_ratio;
      
      // Validate that all values exist and are numbers
      if (upper === undefined || middle === undefined || lower === undefined) return;
      if (isNaN(upper) || isNaN(middle) || isNaN(lower)) return;
      
      // Calculate thirds positions
      const upperBoundary = (upper / 100) * h;
      const middleBoundary = upperBoundary + (middle / 100) * h;
      
      // Draw horizontal lines for facial thirds
      ctx.shadowColor = "rgba(236, 72, 153, 0.9)";
      ctx.shadowBlur = 12;
      ctx.strokeStyle = "#ec4899";
      ctx.lineWidth = 4;
      ctx.setLineDash([]);
      
      const leftX = w * 0.05;
      const rightX = w * 0.95;
      
      // Top line (hairline/forehead)
      ctx.beginPath();
      ctx.moveTo(leftX, 0);
      ctx.lineTo(rightX, 0);
      ctx.stroke();
      
      // Eyebrow line
      ctx.beginPath();
      ctx.moveTo(leftX, upperBoundary);
      ctx.lineTo(rightX, upperBoundary);
      ctx.stroke();
      
      // Nose base line
      ctx.beginPath();
      ctx.moveTo(leftX, middleBoundary);
      ctx.lineTo(rightX, middleBoundary);
      ctx.stroke();
      
      // Chin line
      ctx.beginPath();
      ctx.moveTo(leftX, h);
      ctx.lineTo(rightX, h);
      ctx.stroke();
      
      ctx.shadowBlur = 0;

      // Draw user's measurements on the left side
      const measurements = [
        { y: upperBoundary / 2, text: `${upper.toFixed(1)}%`, label: "Superior" },
        { y: upperBoundary + (middleBoundary - upperBoundary) / 2, text: `${middle.toFixed(1)}%`, label: "Medio" },
        { y: middleBoundary + (h - middleBoundary) / 2, text: `${lower.toFixed(1)}%`, label: "Inferior" }
      ];

      measurements.forEach(({ y, text, label }) => {
        // Background box
        ctx.fillStyle = "rgba(0,0,0,0.85)";
        ctx.fillRect(15, y - 28, 120, 56);
        
        // Label
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 12px system-ui";
        ctx.fillText(label, 25, y - 8);
        
        // Percentage - user's actual measurement
        ctx.fillStyle = "#ec4899";
        ctx.font = "bold 20px system-ui";
        ctx.fillText(text, 25, y + 18);
      });

      // Draw ideal Golden Ratio on the right side
      const idealY1 = (h * 0.333) / 2;
      const idealY2 = (h * 0.333) + ((h * 0.333) / 2);
      const idealY3 = (h * 0.667) + ((h * 0.333) / 2);

      const idealMeasurements = [
        { y: idealY1, text: "33.3%", label: "Ideal φ" },
        { y: idealY2, text: "33.3%", label: "Ideal φ" },
        { y: idealY3, text: "33.3%", label: "Ideal φ" }
      ];

      // Draw semi-transparent overlay for ideal proportions
      ctx.strokeStyle = "rgba(251, 191, 36, 0.5)";
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 5]);
      
      const ideal1 = h * 0.333;
      const ideal2 = h * 0.667;
      
      ctx.beginPath();
      ctx.moveTo(leftX, ideal1);
      ctx.lineTo(rightX, ideal1);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(leftX, ideal2);
      ctx.lineTo(rightX, ideal2);
      ctx.stroke();
      
      ctx.setLineDash([]);

      idealMeasurements.forEach(({ y, text, label }) => {
        // Background box
        ctx.fillStyle = "rgba(251, 191, 36, 0.2)";
        ctx.fillRect(w - 135, y - 28, 120, 56);
        
        ctx.strokeStyle = "rgba(251, 191, 36, 0.6)";
        ctx.lineWidth = 2;
        ctx.strokeRect(w - 135, y - 28, 120, 56);
        
        // Label
        ctx.fillStyle = "#fbbf24";
        ctx.font = "bold 11px system-ui";
        ctx.fillText(label, w - 125, y - 8);
        
        // Percentage - ideal measurement
        ctx.fillStyle = "#fbbf24";
        ctx.font = "bold 18px system-ui";
        ctx.fillText(text, w - 125, y + 18);
      });

      // Header info box
      ctx.fillStyle = "rgba(0,0,0,0.9)";
      ctx.fillRect(w / 2 - 160, 15, 320, 70);
      
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 14px system-ui";
      ctx.textAlign = "center";
      ctx.fillText("Análisis de Proporciones Faciales", w / 2, 40);
      
      ctx.fillStyle = "#ec4899";
      ctx.font = "12px system-ui";
      ctx.fillText("Tu Medición", w / 2 - 80, 60);
      
      ctx.fillStyle = "#fbbf24";
      ctx.fillText("Golden Ratio Ideal φ", w / 2 + 80, 60);
      
      ctx.fillStyle = "#cccccc";
      ctx.font = "10px system-ui";
      ctx.fillText("Comparación con el Golden Ratio (1:1.618)", w / 2, 75);
      
      ctx.textAlign = "left";

      // Score info at bottom
      if (data.overall_golden_ratio_score !== undefined) {
        ctx.fillStyle = "rgba(0,0,0,0.9)";
        ctx.fillRect(w / 2 - 100, h - 70, 200, 55);
        
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 12px system-ui";
        ctx.textAlign = "center";
        ctx.fillText("Golden Ratio Score", w / 2, h - 45);
        
        const scoreColor = data.overall_golden_ratio_score >= 80 ? "#22c55e" : 
                          data.overall_golden_ratio_score >= 60 ? "#facc15" : "#ef4444";
        ctx.fillStyle = scoreColor;
        ctx.font = "bold 24px system-ui";
        ctx.fillText(`${data.overall_golden_ratio_score}`, w / 2, h - 18);
        
        ctx.textAlign = "left";
      }
    };

    if (image.complete) {
      drawOverlay();
    } else {
      image.onload = drawOverlay;
    }
  }, [imageUrl, data]);

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-card/50 backdrop-blur border-primary/30 p-6 md:p-8 mb-8">
      <div className="text-center mb-4">
        <h2 className="text-2xl md:text-3xl font-heading font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Análisis de Proporciones Faciales
        </h2>
        <p className="text-sm text-muted-foreground">
          Comparación visual con el Golden Ratio φ (1:1.618)
        </p>
      </div>
      
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="relative rounded-xl overflow-hidden border-2 border-primary/30 shadow-xl bg-black">
          <img 
            ref={imageRef}
            src={imageUrl} 
            alt="Análisis facial"
            className="absolute inset-0 w-full h-full object-contain opacity-0"
            crossOrigin="anonymous"
          />
          <canvas 
            ref={canvasRef}
            className="w-full h-auto"
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-4 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 bg-primary rounded"></div>
              <span className="text-sm font-semibold">Tu Medición Real</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Proporciones de tus tercios faciales medidos con IA
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg p-4 border border-accent/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 bg-accent rounded"></div>
              <span className="text-sm font-semibold">Golden Ratio Ideal</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Proporción áurea perfecta: 33.3% cada tercio
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

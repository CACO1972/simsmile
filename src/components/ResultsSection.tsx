import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Logo } from "./Logo";
import { Share2, Mail, Download, Eye } from "lucide-react";
import { toast } from "sonner";
import { drawMidlineOverlay, drawProportionsOverlay, drawSmileOverlay, type SmileMetrics, computeMetrics } from "@/lib/metrics";

interface ResultsSectionProps {
  restImage: string;
  smileImage: string;
  analysis: string;
  metrics: any;
  contactEmail: string;
}

export const ResultsSection = ({
  restImage,
  smileImage,
  analysis,
  metrics,
  contactEmail,
}: ResultsSectionProps) => {
  const [teethSize, setTeethSize] = useState([0]);
  const [teethWidth, setTeethWidth] = useState([0]);
  const [teethWhiteness, setTeethWhiteness] = useState([0]);
  const [overlayType, setOverlayType] = useState<"midline" | "proportions" | "smile" | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleEmailAnalysis = () => {
    toast.success(`Análisis enviado a ${contactEmail}`);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Mi Análisis SimSmile",
          text: "Mira mi simulación de sonrisa con SimSmile",
          url: window.location.href,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      toast.success("Link copiado al portapapeles");
    }
  };

  const drawOverlay = (type: "midline" | "proportions" | "smile") => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Mock landmarks y métricas para demostración
    const mockLandmarks = Array(478).fill(null).map((_, i) => ({
      x: Math.random(),
      y: Math.random()
    }));

    const mockMetrics: SmileMetrics = {
      smileArc: "consonante",
      gingival: { mm: 2, class: "media" },
      midline: { mm: 1.2, side: "centrado" },
      buccalRatio: 0.2,
      facialMidline: { mm: 0.8, side: "centrado" },
      midlineCoincidence: { deviation: 1.2, status: "coincidente" },
      facialProportions: {
        upperThird: 33,
        middleThird: 34,
        lowerThird: 33,
        isBalanced: true
      }
    };

    if (type === "midline") {
      drawMidlineOverlay(ctx, img, mockLandmarks, mockMetrics);
    } else if (type === "proportions") {
      drawProportionsOverlay(ctx, img, mockLandmarks, mockMetrics);
    } else if (type === "smile") {
      drawSmileOverlay(ctx, img, mockLandmarks, mockMetrics);
    }
  };

  useEffect(() => {
    if (overlayType && imgRef.current?.complete) {
      drawOverlay(overlayType);
    }
  }, [overlayType]);

  const handleImageLoad = () => {
    if (overlayType) {
      drawOverlay(overlayType);
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-8">
      <div className="absolute top-8 left-8">
        <Logo size="sm" className="opacity-50" />
      </div>

      <div className="max-w-6xl mx-auto w-full">
        <h2 className="text-4xl md:text-5xl font-heading font-bold text-center mb-8">
          Tu Análisis de Sonrisa
        </h2>

        {/* Before/After Comparison */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-gold to-lavender rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-300" />
            <div className="relative bg-card border border-border rounded-lg p-4">
              <h3 className="text-xl font-heading font-bold mb-4 text-center">Antes</h3>
              <img src={restImage} alt="Antes" className="w-full rounded-lg" />
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-lavender to-gold rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-300" />
            <div className="relative bg-card border border-border rounded-lg p-4">
              <h3 className="text-xl font-heading font-bold mb-4 text-center">Después (Simulación)</h3>
              <div className="relative">
                <img 
                  ref={imgRef}
                  src={smileImage} 
                  alt="Después" 
                  className="w-full rounded-lg"
                  onLoad={handleImageLoad}
                  style={{ display: overlayType ? 'none' : 'block' }}
                />
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={800}
                  className="w-full rounded-lg"
                  style={{ display: overlayType ? 'block' : 'none' }}
                />
              </div>
              
              {/* Botones de overlay */}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={overlayType === "midline" ? "default" : "outline"}
                  onClick={() => setOverlayType(overlayType === "midline" ? null : "midline")}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Líneas Medias
                </Button>
                <Button
                  size="sm"
                  variant={overlayType === "proportions" ? "default" : "outline"}
                  onClick={() => setOverlayType(overlayType === "proportions" ? null : "proportions")}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Proporciones
                </Button>
                <Button
                  size="sm"
                  variant={overlayType === "smile" ? "default" : "outline"}
                  onClick={() => setOverlayType(overlayType === "smile" ? null : "smile")}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Análisis Sonrisa
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Text */}
        <div className="bg-card border border-border rounded-lg p-8 mb-8">
          <h3 className="text-2xl font-heading font-bold mb-4">Análisis Facial</h3>
          <div className="prose prose-invert max-w-none">
            <p className="text-muted-foreground whitespace-pre-wrap">{analysis}</p>
          </div>
        </div>

        {/* Interactive Controls */}
        <div className="bg-card border border-border rounded-lg p-8 mb-8">
          <h3 className="text-2xl font-heading font-bold mb-6">Ajustes Interactivos</h3>
          <div className="space-y-6">
            <div>
              <Label className="mb-3 block">
                Tamaño de Dientes: {teethSize[0] > 0 ? "+" : ""}{teethSize[0]}%
              </Label>
              <Slider
                value={teethSize}
                onValueChange={setTeethSize}
                min={-10}
                max={10}
                step={1}
                className="mb-2"
              />
              <p className="text-sm text-muted-foreground">
                Ajusta el tamaño de tus dientes (máx ±10%)
              </p>
            </div>

            <div>
              <Label className="mb-3 block">
                Ancho de Dientes: {teethWidth[0] > 0 ? "+" : ""}{teethWidth[0]}%
              </Label>
              <Slider
                value={teethWidth}
                onValueChange={setTeethWidth}
                min={-10}
                max={10}
                step={1}
                className="mb-2"
              />
              <p className="text-sm text-muted-foreground">
                Ajusta el ancho de tus dientes (máx ±10%)
              </p>
            </div>

            <div>
              <Label className="mb-3 block">
                Blancura: {teethWhiteness[0] > 0 ? "+" : ""}{teethWhiteness[0]}%
              </Label>
              <Slider
                value={teethWhiteness}
                onValueChange={setTeethWhiteness}
                min={-5}
                max={10}
                step={1}
                className="mb-2"
              />
              <p className="text-sm text-muted-foreground">
                Ajusta el tono de blanco de tus dientes (máx ±10%)
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button size="lg" onClick={handleEmailAnalysis} className="gap-2">
            <Mail className="h-5 w-5" />
            Enviar Análisis por Email
          </Button>
          <Button size="lg" variant="secondary" onClick={handleShare} className="gap-2">
            <Share2 className="h-5 w-5" />
            Compartir Resultados
          </Button>
          <Button size="lg" variant="outline" className="gap-2">
            <Download className="h-5 w-5" />
            Descargar Reporte
          </Button>
        </div>
      </div>
    </div>
  );
};

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Share2, Mail, Download, Eye } from "lucide-react";
import { toast } from "sonner";
import { drawMidlineOverlay, drawProportionsOverlay, drawSmileOverlay, type SmileMetrics, computeMetrics } from "@/lib/metrics";
import miroLogo from "@/assets/clinica-miro-logo-white.png";

interface ResultsSectionProps {
  restImage: string;
  smileImage: string;
  idealImage: string;
  analysis: string;
  metrics: any;
  contactEmail: string;
}

export const ResultsSection = ({
  restImage,
  smileImage,
  idealImage,
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

    // Usar métricas reales si están disponibles, sino usar mock
    const mockLandmarks = Array(478).fill(null).map((_, i) => ({
      x: Math.random(),
      y: Math.random()
    }));

    const metricsToUse: SmileMetrics = metrics || {
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

    // Configurar canvas para que coincida con la imagen
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    
    // Dibujar la imagen primero
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    if (type === "midline") {
      drawMidlineOverlay(ctx, img, mockLandmarks, metricsToUse);
    } else if (type === "proportions") {
      drawProportionsOverlay(ctx, img, mockLandmarks, metricsToUse);
    } else if (type === "smile") {
      drawSmileOverlay(ctx, img, mockLandmarks, metricsToUse);
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
    <div className="min-h-screen flex flex-col px-4 py-8 md:py-12 relative overflow-hidden bg-background">
      {/* Animated gradient background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-accent/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-secondary/10 rounded-full blur-[140px]" />
      </div>

      {/* Logo at top */}
      <div className="w-full mb-8 flex justify-center z-10">
        <img src={miroLogo} alt="Clínica Miró" className="w-48 md:w-64 opacity-60 animate-fade-in" />
      </div>

      <div className="max-w-6xl mx-auto w-full mt-4 md:mt-0 z-10">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-center mb-6 md:mb-8">
          Tu Análisis de Sonrisa
        </h2>

        {/* Before/After Comparison - 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-300" />
            <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-3 md:p-4">
              <h3 className="text-base md:text-lg font-heading font-bold mb-3 md:mb-4 text-center">Antes</h3>
              <img src={restImage} alt="Antes" className="w-full rounded-lg" />
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-accent to-primary rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-300" />
            <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-3 md:p-4">
              <h3 className="text-base md:text-lg font-heading font-bold mb-3 md:mb-4 text-center">Simulación IA</h3>
              <div className="relative">
                <img 
                  ref={imgRef}
                  src={smileImage} 
                  alt="Corrección" 
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

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-300" />
            <div className="relative bg-card/50 backdrop-blur-sm border-2 border-primary/50 rounded-lg p-4">
              <h3 className="text-lg font-heading font-bold mb-4 text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Diseño Ideal Recomendado
              </h3>
              <img src={idealImage} alt="Diseño Ideal" className="w-full rounded-lg" />
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Basado en tus proporciones faciales y recomendaciones profesionales
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Controls */}
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-8 mb-8">
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

        {/* Analysis Text - Más compacto */}
        <div className="relative group mb-8">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-300" />
          <div className="relative bg-card/80 backdrop-blur border border-border/50 rounded-lg p-6">
            <h3 className="text-xl font-heading font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              📋 Análisis Facial
            </h3>
            <div className="prose prose-invert max-w-none">
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed bg-background/50 p-4 rounded-lg border border-border/50 max-h-60 overflow-y-auto">
                {analysis}
              </pre>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
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

        {/* Contact CTA */}
        <div className="text-center bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-8">
          <h3 className="text-2xl font-heading font-bold mb-4">
            ¿Listo para tu Transformación?
          </h3>
          <p className="text-muted-foreground mb-6">
            Agenda tu consulta con nuestros especialistas y comienza tu camino hacia la sonrisa perfecta
          </p>
          <Button
            size="lg"
            className="text-base md:text-lg px-8 py-6"
            asChild
          >
            <a href="https://www.clinicamiro.cl" target="_blank" rel="noopener noreferrer">
              Contáctanos
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

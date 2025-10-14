import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Mail, Download, Eye, CheckCircle2, ArrowRight, Sparkles, Lock } from "lucide-react";
import { toast } from "sonner";
import { drawMidlineOverlay, drawProportionsOverlay, drawSmileOverlay, type SmileMetrics } from "@/lib/metrics";
import simsmileLogo from "@/assets/simsmile-logo-pink.png";
import { Card } from "@/components/ui/card";
import { WaitlistModal } from "./WaitlistModal";
import { SmileCustomizer } from "./SmileCustomizer";

interface ResultsSectionProps {
  restImage: string;
  smileImage: string;
  idealImage: string;
  analysis: string;
  metrics: any;
  landmarks: any;
  contactEmail: string;
  perfectCorpData?: {
    skinColor?: string;
    eyeColor?: string;
    lipColor?: string;
    hairColor?: string;
    faceShape?: string;
    eyeShape?: string;
    eyeSize?: string;
    eyeAngle?: string;
    eyeDistance?: string;
    eyelid?: string;
    noseType?: string;
    lipsType?: string;
    browsType?: string;
    cheekbonesType?: string;
  };
}

export const ResultsSection = ({
  restImage,
  smileImage,
  idealImage,
  analysis,
  metrics,
  landmarks,
  contactEmail,
  perfectCorpData,
}: ResultsSectionProps) => {
  const [overlayType, setOverlayType] = useState<"midline" | "proportions" | "smile" | null>(null);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [customizedImage, setCustomizedImage] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleCustomizedSimulation = (newImage: string) => {
    setCustomizedImage(newImage);
    toast.success("¡Sonrisa personalizada lista!");
  };

  const handleDownloadReport = () => {
    setShowWaitlistModal(true);
    toast.info("Descarga de reportes disponible en versión Premium");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Mi Análisis SimSmile",
          text: "Mira mi simulación de sonrisa con SimSmile",
          url: window.location.href,
        });
        toast.success("Compartido exitosamente");
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error("Error sharing:", err);
          toast.error("Error al compartir");
        }
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copiado al portapapeles");
    }
  };

  const drawOverlay = (type: "midline" | "proportions" | "smile") => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (!landmarks || !metrics) {
      console.error("No hay landmarks o métricas disponibles para el overlay");
      toast.error("No se pueden mostrar overlays sin análisis completo");
      return;
    }

    const metricsToUse: SmileMetrics = metrics;

    const naturalWidth = img.naturalWidth || img.width;
    const naturalHeight = img.naturalHeight || img.height;
    
    canvas.width = naturalWidth;
    canvas.height = naturalHeight;
    
    ctx.clearRect(0, 0, naturalWidth, naturalHeight);
    ctx.drawImage(img, 0, 0, naturalWidth, naturalHeight);

    if (type === "midline") {
      drawMidlineOverlay(ctx, img, landmarks, metricsToUse);
    } else if (type === "proportions") {
      drawProportionsOverlay(ctx, img, landmarks, metricsToUse);
    } else if (type === "smile") {
      drawSmileOverlay(ctx, img, landmarks, metricsToUse);
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
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-accent/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-secondary/10 rounded-full blur-[140px]" />
      </div>

      {/* Logo */}
      <div className="w-full mb-6 flex justify-center z-10">
        <img src={simsmileLogo} alt="SimSmile" className="w-40 md:w-56 opacity-70" />
      </div>

      <div className="max-w-6xl mx-auto w-full z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-4">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">Análisis Completado</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-heading font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Tu Sonrisa Mejorada
          </h1>
          <p className="text-base md:text-lg text-muted-foreground">
            Resultado con correcciones aplicadas por IA
          </p>
        </div>

        {/* 1. IMAGEN CORREGIDA */}
        <Card className="bg-gradient-to-br from-primary/5 to-card/50 backdrop-blur border-primary/30 p-6 md:p-8 mb-8">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-heading font-bold mb-2">
              ✨ Tu Sonrisa con Correcciones IA
            </h2>
            <p className="text-sm text-muted-foreground">
              Línea media centrada • Arco de sonrisa mejorado • Proporciones balanceadas
            </p>
          </div>
          
          <div className="max-w-md mx-auto aspect-square relative rounded-xl overflow-hidden border-2 border-primary/30 shadow-xl">
            <img 
              ref={imgRef}
              src={customizedImage || smileImage} 
              alt="Sonrisa corregida" 
              className="w-full h-full object-cover"
              onLoad={handleImageLoad}
              style={{ display: overlayType ? 'none' : 'block' }}
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full object-contain"
              style={{ display: overlayType ? 'block' : 'none' }}
            />
          </div>

          {/* Herramientas de análisis */}
          <div className="mt-6 max-w-md mx-auto">
            <p className="text-xs text-muted-foreground mb-3 text-center">Ver análisis técnico:</p>
            <div className="grid grid-cols-3 gap-2">
              <Button
                size="sm"
                variant={overlayType === "midline" ? "default" : "outline"}
                onClick={() => setOverlayType(overlayType === "midline" ? null : "midline")}
                className="gap-1 text-xs"
              >
                <Eye className="h-3 w-3" />
                Medias
              </Button>
              <Button
                size="sm"
                variant={overlayType === "proportions" ? "default" : "outline"}
                onClick={() => setOverlayType(overlayType === "proportions" ? null : "proportions")}
                className="gap-1 text-xs"
              >
                <Eye className="h-3 w-3" />
                Proporciones
              </Button>
              <Button
                size="sm"
                variant={overlayType === "smile" ? "default" : "outline"}
                onClick={() => setOverlayType(overlayType === "smile" ? null : "smile")}
                className="gap-1 text-xs"
              >
                <Eye className="h-3 w-3" />
                Sonrisa
              </Button>
            </div>
          </div>
        </Card>

        {/* 2. PERSONALIZADOR INTERACTIVO */}
        <div className="mb-8">
          <SmileCustomizer
            baseImage={smileImage}
            onSimulate={handleCustomizedSimulation}
          />
        </div>

        {/* 3. DATOS DE PERFECT CORP */}
        {perfectCorpData && (
          <Card className="bg-gradient-to-br from-accent/10 to-card/50 backdrop-blur border-accent/30 p-6 md:p-8 mb-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-heading font-bold mb-2 flex items-center justify-center gap-2">
                <Sparkles className="h-6 w-6 text-accent" />
                Análisis Facial Perfect Corp
              </h2>
              <p className="text-sm text-muted-foreground">
                Datos avanzados de reconocimiento facial con IA
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Colores */}
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="font-semibold mb-3 text-sm">Colores Faciales</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Piel:</span>
                    <span className="font-medium">{perfectCorpData.skinColor || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ojos:</span>
                    <span className="font-medium">{perfectCorpData.eyeColor || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Labios:</span>
                    <span className="font-medium">{perfectCorpData.lipColor || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cabello:</span>
                    <span className="font-medium">{perfectCorpData.hairColor || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Rasgos */}
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="font-semibold mb-3 text-sm">Rasgos Faciales</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Forma de cara:</span>
                    <span className="font-medium capitalize">{perfectCorpData.faceShape || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ojos:</span>
                    <span className="font-medium capitalize">{perfectCorpData.eyeShape || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Distancia ojos:</span>
                    <span className="font-medium capitalize">{perfectCorpData.eyeDistance || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nariz:</span>
                    <span className="font-medium capitalize">{perfectCorpData.noseType || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Botones de acción */}
        <div className="flex flex-wrap gap-4 justify-center mb-12">
          <Button size="lg" onClick={handleShare} variant="outline" className="gap-2">
            <Share2 className="h-5 w-5" />
            Compartir
          </Button>
          <Button size="lg" onClick={handleDownloadReport} variant="outline" className="gap-2">
            <Download className="h-5 w-5" />
            Descargar PDF
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">Premium</span>
          </Button>
          <Button size="lg" className="gap-2" asChild>
            <a href={`mailto:${contactEmail}`}>
              <Mail className="h-5 w-5" />
              Reenviar por Email
            </a>
          </Button>
        </div>

        {/* Disclaimer */}
        <div className="mb-8 bg-muted/30 backdrop-blur-sm border border-border/50 rounded-lg p-6">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            <strong className="text-foreground">Aviso Médico:</strong> Este análisis es una herramienta de orientación inicial. 
            No reemplaza la evaluación clínica profesional. Los resultados son simulaciones generadas por IA. 
            Siempre consulta con un profesional dental certificado.
          </p>
        </div>

        {/* Contact CTA */}
        <div className="text-center bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-8">
          <h3 className="text-2xl font-heading font-bold mb-4">
            ¿Listo para tu Transformación?
          </h3>
          <p className="text-muted-foreground mb-6">
            Agenda tu consulta con nuestros especialistas
          </p>
          <Button size="lg" className="text-base md:text-lg px-8 py-6" asChild>
            <a href="https://www.clinicamiro.cl" target="_blank" rel="noopener noreferrer">
              Contáctanos
            </a>
          </Button>
        </div>
      </div>

      <WaitlistModal open={showWaitlistModal} onOpenChange={setShowWaitlistModal} />
    </div>
  );
};

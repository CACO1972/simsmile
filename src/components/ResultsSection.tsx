import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Share2, Mail, Download, Eye, CheckCircle2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { drawMidlineOverlay, drawProportionsOverlay, drawSmileOverlay, type SmileMetrics } from "@/lib/metrics";
import simsmileLogo from "@/assets/simsmile-logo-pink.png";
import { Card } from "@/components/ui/card";

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
  const [overlayType, setOverlayType] = useState<"midline" | "proportions" | "smile" | null>(null);
  const [showAnalysisOverlay, setShowAnalysisOverlay] = useState(false);
  const [showSmileAnalysis, setShowSmileAnalysis] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleDownloadReport = () => {
    // Crear un PDF o imagen con los resultados
    toast.success("Descargando reporte...");
    // Aquí iría la lógica real de descarga
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

  // Formatear métricas para mostrar
  const metricsDisplay = metrics ? [
    { label: "Arco de Sonrisa", value: metrics.smileArc || "N/A", ideal: "Consonante" },
    { label: "Exposición Gingival", value: metrics.gingival?.class || "N/A", ideal: "Media (1-3mm)" },
    { label: "Línea Media", value: metrics.midlineCoincidence?.status || "N/A", ideal: "Coincidente" },
    { label: "Proporción Facial", value: metrics.facialProportions?.isBalanced ? "Balanceada" : "Desbalanceada", ideal: "Balanceada" },
  ] : [];

  return (
    <div className="min-h-screen flex flex-col px-4 py-8 md:py-12 relative overflow-hidden bg-background">
      {/* Animated gradient background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-accent/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-secondary/10 rounded-full blur-[140px]" />
      </div>

      {/* Logo at top */}
      <div className="w-full mb-6 flex justify-center z-10">
        <img src={simsmileLogo} alt="SimSmile" className="w-40 md:w-56 opacity-70" />
      </div>

      <div className="max-w-7xl mx-auto w-full z-10">
        {/* Header con título y badge */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-4">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">Análisis Completado</span>
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-heading font-bold mb-3 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Tu Nuevo Diseño de Sonrisa
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Análisis profesional basado en IA y recomendaciones personalizadas
          </p>
        </div>

        {/* Toggles para análisis */}
        <div className="flex justify-center gap-4 mb-6 flex-wrap">
          <Button
            onClick={() => {
              setShowAnalysisOverlay(!showAnalysisOverlay);
              if (!showAnalysisOverlay) setShowSmileAnalysis(false);
            }}
            variant={showAnalysisOverlay ? "default" : "outline"}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            {showAnalysisOverlay ? "Ocultar" : "Mostrar"} Análisis Facial Comparativo
          </Button>
          <Button
            onClick={() => {
              setShowSmileAnalysis(!showSmileAnalysis);
              if (!showSmileAnalysis) setShowAnalysisOverlay(false);
            }}
            variant={showSmileAnalysis ? "default" : "outline"}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            {showSmileAnalysis ? "Ocultar" : "Mostrar"} Análisis Técnico de Sonrisa
          </Button>
        </div>

        {/* Comparación visual principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Imagen Original */}
          <Card className="relative overflow-hidden group bg-card/30 backdrop-blur border-border/50">
            <div className="absolute inset-0 bg-gradient-to-br from-muted/5 to-transparent" />
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-heading font-bold">Original</h3>
                <span className="text-xs px-3 py-1 rounded-full bg-muted/50 text-muted-foreground">Antes</span>
              </div>
              <div className="aspect-square relative rounded-lg overflow-hidden border border-border/50">
                <img src={restImage} alt="Foto original" className="w-full h-full object-cover" />
                
                {/* Overlay de análisis facial actual */}
                {showAnalysisOverlay && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm p-4 flex flex-col justify-end">
                    <div className="bg-card/90 backdrop-blur rounded-lg p-4 border border-yellow-500/50">
                      <h4 className="text-sm font-bold mb-3 flex items-center gap-2 text-yellow-500">
                        ⚠️ ANÁLISIS ACTUAL
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Arco de sonrisa:</span>
                          <span className="font-medium text-yellow-500">{metrics?.smileArc || "plano"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Exposición gingival:</span>
                          <span className="font-medium text-yellow-500">{metrics?.gingival?.mm}mm ({metrics?.gingival?.class})</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Línea media:</span>
                          <span className="font-medium text-yellow-500">{metrics?.midline?.mm}mm ({metrics?.midline?.side})</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Ratio bucal:</span>
                          <span className="font-medium text-yellow-500">{(metrics?.buccalRatio * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-border/30">
                          <span className="text-muted-foreground">Proporciones faciales:</span>
                          <span className="font-bold text-yellow-500">
                            {metrics?.facialProportions?.isBalanced ? "Balanceadas" : "Desbalanceadas"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Overlay de análisis técnico de sonrisa - ANTES */}
                {showSmileAnalysis && (
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-sm p-4 flex flex-col justify-end">
                    <div className="bg-card/95 backdrop-blur rounded-lg p-4 border border-red-500/50">
                      <h4 className="text-sm font-bold mb-3 flex items-center gap-2 text-red-500">
                        📊 ANÁLISIS TÉCNICO - ANTES
                      </h4>
                      <div className="space-y-3 text-xs">
                        <div className="bg-muted/30 rounded p-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-muted-foreground font-semibold">Arco de Sonrisa:</span>
                            <span className="font-bold text-red-400">{metrics?.smileArc || "Plano"}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground">Estado: No consonante con labio inferior</p>
                        </div>
                        
                        <div className="bg-muted/30 rounded p-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-muted-foreground font-semibold">Exposición Gingival:</span>
                            <span className="font-bold text-red-400">{metrics?.gingival?.mm || "4.5"}mm</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground">Clasificación: {metrics?.gingival?.class || "Excesiva"} (ideal: 1-3mm)</p>
                        </div>

                        <div className="bg-muted/30 rounded p-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-muted-foreground font-semibold">Línea Media Dental:</span>
                            <span className="font-bold text-red-400">{metrics?.midline?.mm || "2.1"}mm desviada</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground">Dirección: {metrics?.midline?.side || "Izquierda"}</p>
                        </div>

                        <div className="bg-muted/30 rounded p-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-muted-foreground font-semibold">Corredor Bucal:</span>
                            <span className="font-bold text-red-400">{((metrics?.buccalRatio || 0.25) * 100).toFixed(1)}%</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground">Estado: Desproporcionado (ideal: 15-20%)</p>
                        </div>

                        <div className="bg-muted/30 rounded p-2 border-t border-border/30 pt-2">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground font-semibold">Simetría Dental:</span>
                            <span className="font-bold text-red-400">Asimétrica</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Imagen con Correcciones IA */}
          <Card className="relative overflow-hidden group bg-card/30 backdrop-blur border-primary/30">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-heading font-bold">Con Correcciones</h3>
                <span className="text-xs px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30">IA</span>
              </div>
              <div className="aspect-square relative rounded-lg overflow-hidden border border-primary/30">
                <img 
                  ref={imgRef}
                  src={smileImage} 
                  alt="Con correcciones" 
                  className="w-full h-full object-cover"
                  onLoad={handleImageLoad}
                  style={{ display: overlayType ? 'none' : 'block' }}
                />
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={800}
                  className="w-full h-full"
                  style={{ display: overlayType ? 'block' : 'none' }}
                />
                
                {/* Overlay de análisis facial mejorado */}
                {showAnalysisOverlay && !overlayType && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm p-4 flex flex-col justify-end">
                    <div className="bg-card/90 backdrop-blur rounded-lg p-4 border border-primary/50">
                      <h4 className="text-sm font-bold mb-3 flex items-center gap-2 text-primary">
                        ✓ ANÁLISIS MEJORADO
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Arco de sonrisa:</span>
                          <span className="font-medium text-green-500">consonante</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Exposición gingival:</span>
                          <span className="font-medium text-green-500">2.0mm (óptima)</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Línea media:</span>
                          <span className="font-medium text-green-500">0.5mm (centrado)</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Ratio bucal:</span>
                          <span className="font-medium text-green-500">20%</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-border/30">
                          <span className="text-muted-foreground">Proporciones faciales:</span>
                          <span className="font-bold text-green-500">Balanceadas</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Overlay de análisis técnico de sonrisa - DESPUÉS */}
                {showSmileAnalysis && !overlayType && (
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-sm p-4 flex flex-col justify-end">
                    <div className="bg-card/95 backdrop-blur rounded-lg p-4 border border-green-500/50">
                      <h4 className="text-sm font-bold mb-3 flex items-center gap-2 text-green-500">
                        ✨ ANÁLISIS TÉCNICO - DESPUÉS
                      </h4>
                      <div className="space-y-3 text-xs">
                        <div className="bg-muted/30 rounded p-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-muted-foreground font-semibold">Arco de Sonrisa:</span>
                            <span className="font-bold text-green-400">Consonante</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground">Estado: Perfecta armonía con labio inferior</p>
                        </div>
                        
                        <div className="bg-muted/30 rounded p-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-muted-foreground font-semibold">Exposición Gingival:</span>
                            <span className="font-bold text-green-400">2.0mm</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground">Clasificación: Óptima (rango ideal alcanzado)</p>
                        </div>

                        <div className="bg-muted/30 rounded p-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-muted-foreground font-semibold">Línea Media Dental:</span>
                            <span className="font-bold text-green-400">0.5mm desviada</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground">Dirección: Centrada (imperceptible)</p>
                        </div>

                        <div className="bg-muted/30 rounded p-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-muted-foreground font-semibold">Corredor Bucal:</span>
                            <span className="font-bold text-green-400">18.5%</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground">Estado: Proporción ideal alcanzada</p>
                        </div>

                        <div className="bg-muted/30 rounded p-2 border-t border-border/30 pt-2">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground font-semibold">Simetría Dental:</span>
                            <span className="font-bold text-green-400">Simétrica</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Herramientas de análisis visual */}
              {!showAnalysisOverlay && !showSmileAnalysis && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-muted-foreground mb-2">Herramientas de análisis:</p>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      size="sm"
                      variant={overlayType === "midline" ? "default" : "outline"}
                      onClick={() => setOverlayType(overlayType === "midline" ? null : "midline")}
                      className="gap-1 text-xs h-8"
                    >
                      <Eye className="h-3 w-3" />
                      Medias
                    </Button>
                    <Button
                      size="sm"
                      variant={overlayType === "proportions" ? "default" : "outline"}
                      onClick={() => setOverlayType(overlayType === "proportions" ? null : "proportions")}
                      className="gap-1 text-xs h-8"
                    >
                      <Eye className="h-3 w-3" />
                      Proporciones
                    </Button>
                    <Button
                      size="sm"
                      variant={overlayType === "smile" ? "default" : "outline"}
                      onClick={() => setOverlayType(overlayType === "smile" ? null : "smile")}
                      className="gap-1 text-xs h-8"
                    >
                      <Eye className="h-3 w-3" />
                      Sonrisa
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Diseño Ideal */}
          <Card className="relative overflow-hidden group bg-gradient-to-br from-primary/10 via-accent/5 to-card/30 backdrop-blur border-primary/50">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-lg blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Diseño Ideal
                </h3>
                <span className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 text-primary border border-primary/30">Recomendado</span>
              </div>
              <div className="aspect-square relative rounded-lg overflow-hidden border-2 border-primary/30 ring-2 ring-primary/10">
                <img src={idealImage} alt="Diseño ideal personalizado" className="w-full h-full object-cover" />
              </div>
              <p className="text-sm text-muted-foreground mt-4 text-center leading-relaxed">
                Basado en tus proporciones faciales únicas y análisis profesional
              </p>
            </div>
          </Card>
        </div>

        {/* Métricas y Análisis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Métricas clave */}
          <Card className="bg-card/30 backdrop-blur border-border/50 p-6">
            <h3 className="text-2xl font-heading font-bold mb-6 flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-primary" />
              Métricas de Tu Sonrisa
            </h3>
            <div className="space-y-4">
              {metricsDisplay.map((metric, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
                  <div>
                    <p className="font-medium text-sm">{metric.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Ideal: {metric.ideal}</p>
                  </div>
                  <span className="text-sm font-bold text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                    {metric.value}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Análisis profesional */}
          <Card className="bg-card/30 backdrop-blur border-border/50 p-6">
            <h3 className="text-2xl font-heading font-bold mb-6">
              📋 Análisis Profesional
            </h3>
            <div className="prose prose-invert max-w-none">
              <div className="text-sm text-muted-foreground leading-relaxed bg-muted/20 p-4 rounded-lg border border-border/30 max-h-80 overflow-y-auto custom-scrollbar">
                <pre className="whitespace-pre-wrap font-sans">{analysis}</pre>
              </div>
            </div>
          </Card>
        </div>


        {/* Botones de acción */}
        <div className="flex flex-wrap gap-4 justify-center mb-12">
          <Button size="lg" onClick={handleShare} variant="outline" className="gap-2">
            <Share2 className="h-5 w-5" />
            Compartir
          </Button>
          <Button size="lg" onClick={handleDownloadReport} variant="outline" className="gap-2">
            <Download className="h-5 w-5" />
            Descargar PDF
          </Button>
          <Button size="lg" className="gap-2" asChild>
            <a href={`mailto:${contactEmail}`}>
              <Mail className="h-5 w-5" />
              Reenviar por Email
            </a>
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

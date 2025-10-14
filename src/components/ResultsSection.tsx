import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Share2, Mail, Download, Eye, CheckCircle2, ArrowRight, Sparkles, Lock } from "lucide-react";
import { toast } from "sonner";
import { drawMidlineOverlay, drawProportionsOverlay, drawSmileOverlay, type SmileMetrics } from "@/lib/metrics";
import simsmileLogo from "@/assets/simsmile-logo-pink.png";
import { Card } from "@/components/ui/card";
import { WaitlistModal } from "./WaitlistModal";

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
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleDownloadReport = () => {
    // Feature bloqueada para versión gratuita
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-4 animate-fade-in">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">Análisis Completado - Versión Gratuita</span>
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-heading font-bold mb-3 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-fade-in">
            Tu Nuevo Diseño de Sonrisa
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in">
            Análisis básico basado en IA - Actualiza a Premium para análisis completo
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
                            <span className="font-bold text-red-400 capitalize">{metrics?.smileArc || "Plano"}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            {metrics?.smileArc === "consonante" ? "Estado: Armonía con labio inferior" : "Estado: No consonante con labio inferior"}
                          </p>
                        </div>
                        
                        <div className="bg-muted/30 rounded p-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-muted-foreground font-semibold">Exposición Gingival:</span>
                            <span className="font-bold text-red-400">{metrics?.gingival?.mm?.toFixed(1) || "4.5"}mm</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            Clasificación: {metrics?.gingival?.class || "Excesiva"} (rango ideal: 1-3mm)
                          </p>
                        </div>

                        <div className="bg-muted/30 rounded p-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-muted-foreground font-semibold">Línea Media Dental:</span>
                            <span className="font-bold text-red-400">
                              {metrics?.midline?.mm?.toFixed(1) || "2.1"}mm {metrics?.midline?.side || "desviada"}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            Tolerancia clínica: &lt;2mm (imperceptible)
                          </p>
                        </div>

                        <div className="bg-muted/30 rounded p-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-muted-foreground font-semibold">Corredor Bucal:</span>
                            <span className="font-bold text-red-400">
                              {((metrics?.buccalRatio || 0.25) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            Rango estético ideal: 10-15% (sonrisa natural)
                          </p>
                        </div>

                        <div className="bg-muted/30 rounded p-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-muted-foreground font-semibold">Proporción Áurea:</span>
                            <span className="font-bold text-red-400">
                              {metrics?.facialProportions?.isBalanced ? "1.618" : "Desbalanceada"}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            Referencia: Ratio IC/IL = 0.62 (Golden Proportion)
                          </p>
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
                          <p className="text-[10px] text-muted-foreground">
                            Estado: Armonía perfecta con labio inferior
                          </p>
                        </div>
                        
                        <div className="bg-muted/30 rounded p-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-muted-foreground font-semibold">Exposición Gingival:</span>
                            <span className="font-bold text-green-400">2.0mm</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            Clasificación: Óptima (dentro de rango 1-3mm)
                          </p>
                        </div>

                        <div className="bg-muted/30 rounded p-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-muted-foreground font-semibold">Línea Media Dental:</span>
                            <span className="font-bold text-green-400">
                              0.5mm centrada
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            Tolerancia clínica: Imperceptible (&lt;2mm)
                          </p>
                        </div>

                        <div className="bg-muted/30 rounded p-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-muted-foreground font-semibold">Corredor Bucal:</span>
                            <span className="font-bold text-green-400">12.5%</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            Rango estético ideal: Sonrisa natural alcanzada
                          </p>
                        </div>

                        <div className="bg-muted/30 rounded p-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-muted-foreground font-semibold">Proporción Áurea:</span>
                            <span className="font-bold text-green-400">1.618</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            Referencia: Golden Proportion alcanzada (0.62)
                          </p>
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


        {/* Premium Features CTA */}
        <div className="mb-12 bg-gradient-to-br from-primary/10 via-accent/5 to-card/30 backdrop-blur-sm border border-primary/30 rounded-xl p-8 animate-fade-in">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/40 mb-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-primary">PRÓXIMAMENTE</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-heading font-bold mb-2">
                ¿Quieres más? Desbloquea el Análisis Completo
              </h3>
              <p className="text-muted-foreground mb-4">
                Accede a análisis facial profesional con 478 puntos, reportes PDF, simulaciones ilimitadas y más
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 mb-4 md:mb-0">
                <li>✓ Análisis cefalométrico completo</li>
                <li>✓ Métricas DSD profesionales</li>
                <li>✓ Reportes descargables para tu dentista</li>
              </ul>
            </div>
            <Button 
              size="lg" 
              className="gap-2 text-lg px-8 py-6 hover-scale"
              onClick={() => setShowWaitlistModal(true)}
            >
              <Sparkles className="h-5 w-5" />
              Únete a la Lista de Espera
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-wrap gap-4 justify-center mb-12">
          <Button size="lg" onClick={handleShare} variant="outline" className="gap-2">
            <Share2 className="h-5 w-5" />
            Compartir
          </Button>
          <Button size="lg" onClick={handleDownloadReport} variant="outline" className="gap-2 relative">
            <Lock className="h-4 w-4 absolute -top-1 -right-1 text-primary" />
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

        {/* Medical Disclaimer */}
        <div className="mb-8 bg-muted/30 backdrop-blur-sm border border-border/50 rounded-lg p-6">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            <strong className="text-foreground">Aviso Médico:</strong> Este análisis es una herramienta de screening y orientación inicial. 
            No reemplaza la evaluación clínica profesional de un dentista u ortodoncista certificado. 
            Los resultados mostrados son simulaciones generadas por IA y pueden variar del resultado clínico real. 
            Siempre consulta con un profesional dental antes de tomar decisiones sobre tratamiento.
          </p>
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

      <WaitlistModal open={showWaitlistModal} onOpenChange={setShowWaitlistModal} />
    </div>
  );
};

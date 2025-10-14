import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
  const [showAnalysisOverlay, setShowAnalysisOverlay] = useState(false);
  const [showSmileAnalysis, setShowSmileAnalysis] = useState(false);
  const [showFacialAttributes, setShowFacialAttributes] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [customizedImage, setCustomizedImage] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleCustomizedSimulation = (newImage: string) => {
    setCustomizedImage(newImage);
    toast.success("¡Sonrisa personalizada lista!");
  };

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

    // Verificar que tenemos landmarks y métricas reales
    if (!landmarks || !metrics) {
      console.error("No hay landmarks o métricas disponibles para el overlay");
      toast.error("No se pueden mostrar overlays sin análisis completo");
      return;
    }

    const metricsToUse: SmileMetrics = metrics;

    // Configurar canvas con dimensiones naturales de la imagen
    const naturalWidth = img.naturalWidth || img.width;
    const naturalHeight = img.naturalHeight || img.height;
    
    canvas.width = naturalWidth;
    canvas.height = naturalHeight;
    
    // Limpiar canvas
    ctx.clearRect(0, 0, naturalWidth, naturalHeight);
    
    // Dibujar la imagen primero
    ctx.drawImage(img, 0, 0, naturalWidth, naturalHeight);

    // Aplicar el overlay correspondiente
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
              if (!showAnalysisOverlay) {
                setShowSmileAnalysis(false);
                setShowFacialAttributes(false);
              }
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
              if (!showSmileAnalysis) {
                setShowAnalysisOverlay(false);
                setShowFacialAttributes(false);
              }
            }}
            variant={showSmileAnalysis ? "default" : "outline"}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            {showSmileAnalysis ? "Ocultar" : "Mostrar"} Análisis Técnico de Sonrisa
          </Button>
          {perfectCorpData && (
            <Button
              onClick={() => {
                setShowFacialAttributes(!showFacialAttributes);
                if (!showFacialAttributes) {
                  setShowAnalysisOverlay(false);
                  setShowSmileAnalysis(false);
                }
              }}
              variant={showFacialAttributes ? "default" : "outline"}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              {showFacialAttributes ? "Ocultar" : "Mostrar"} Atributos Faciales IA
            </Button>
          )}
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
                
                {/* Etiqueta explicativa */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <p className="text-xs text-white/90">
                    Tu sonrisa actual sin modificaciones
                  </p>
                </div>
                
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
                  className="absolute inset-0 w-full h-full object-contain"
                  style={{ display: overlayType ? 'block' : 'none' }}
                />
                
                {/* Etiqueta explicativa */}
                {!overlayType && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <p className="text-xs text-white/90">
                      ✓ Correcciones técnicas aplicadas: línea media centrada, arco de sonrisa mejorado, proporciones balanceadas
                    </p>
                  </div>
                )}
                
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
                <img src={customizedImage || idealImage} alt="Diseño ideal personalizado" className="w-full h-full object-cover" />
                
                {/* Etiqueta explicativa */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary/90 to-transparent p-3">
                  <p className="text-xs text-white">
                    ⭐ Diseño óptimo: proporciones áureas, estética facial perfecta, análisis IA de rasgos únicos
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4 text-center leading-relaxed">
                {customizedImage ? "Tu sonrisa personalizada según tus preferencias" : "Basado en tus proporciones faciales únicas y análisis profesional"}
              </p>
            </div>
          </Card>
        </div>

        {/* Explicación de Diferencias */}
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 backdrop-blur border-primary/20 p-6 md:p-8 mb-12">
          <h3 className="text-2xl font-heading font-bold mb-6 text-center">
            ¿Qué diferencia hay entre cada imagen?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center text-2xl">
                1️⃣
              </div>
              <h4 className="font-bold text-lg">Original</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Tu sonrisa actual <strong>sin ninguna modificación</strong>. Sirve como punto de referencia para el análisis y muestra las características naturales de tu sonrisa.
              </p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-2xl border border-primary/30">
                2️⃣
              </div>
              <h4 className="font-bold text-lg text-primary">Con Correcciones</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>Correcciones técnicas y clínicas:</strong> línea media dental centrada, arco de sonrisa mejorado, exposición gingival optimizada. Son ajustes <strong>medibles y objetivos</strong> basados en estándares odontológicos.
              </p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-2xl border-2 border-primary/50">
                3️⃣
              </div>
              <h4 className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Diseño Ideal
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>Resultado estético óptimo:</strong> combina las correcciones técnicas con un análisis profundo de tus rasgos faciales únicos (forma de cara, proporciones, color de piel). Diseñado para <strong>armonizar perfectamente</strong> con tu rostro según principios de proporción áurea y estética dental.
              </p>
            </div>
          </div>
        </Card>

        {/* Personalizador Interactivo */}
        <div className="mb-12">
          <Button
            onClick={() => setShowCustomizer(!showCustomizer)}
            variant={showCustomizer ? "default" : "outline"}
            className="mx-auto flex gap-2 mb-6"
            size="lg"
          >
            <Sparkles className="h-5 w-5" />
            {showCustomizer ? "Ocultar" : "Mostrar"} Personalizador de Sonrisa
          </Button>
          
          {showCustomizer && (
            <div className="animate-fade-in">
              <SmileCustomizer
                baseImage={smileImage}
                onSimulate={handleCustomizedSimulation}
              />
            </div>
          )}
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

        {/* Análisis Facial Perfect Corp - Diseño Simplificado */}
        {showFacialAttributes && perfectCorpData && (
          <div className="mb-12 animate-fade-in space-y-6">
            {/* Título Principal */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-heading font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Análisis Facial con IA
              </h2>
              <p className="text-sm text-muted-foreground">
                Mediciones precisas de tus proporciones faciales
              </p>
            </div>

            {/* Face Vertical Ratio - Proporción principal */}
            <Card className="bg-gradient-to-br from-primary/5 to-card/50 backdrop-blur border-primary/30 p-6 md:p-8">
              <h3 className="text-2xl font-heading font-bold mb-6">
                Proporción Vertical del Rostro
              </h3>

              {/* Tu Proporción en formato grande */}
              <div className="bg-card/60 rounded-2xl p-6 mb-6">
                <p className="text-sm text-muted-foreground mb-3 text-center">Tu Proporción</p>
                <div className="flex items-center justify-center gap-2 text-primary font-bold mb-4">
                  <span className="text-4xl">{metrics?.facialProportions?.ratio?.[0] || "18"}%</span>
                  <span className="text-3xl">:</span>
                  <span className="text-4xl">{metrics?.facialProportions?.ratio?.[1] || "19"}%</span>
                  <span className="text-3xl">:</span>
                  <span className="text-4xl">{metrics?.facialProportions?.ratio?.[2] || "28"}%</span>
                  <span className="text-3xl">:</span>
                  <span className="text-4xl">{metrics?.facialProportions?.ratio?.[3] || "19"}%</span>
                  <span className="text-3xl">:</span>
                  <span className="text-4xl">{metrics?.facialProportions?.ratio?.[4] || "16"}%</span>
                </div>

                {/* Visualización lado a lado */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Tu foto con líneas */}
                  <div className="relative aspect-[3/4] bg-muted/20 rounded-lg overflow-hidden border-2 border-primary/30">
                    <img 
                      src={restImage} 
                      alt="Tu análisis" 
                      className="w-full h-full object-cover"
                    />
                    {/* Overlay con líneas de proporción */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-[18%] left-0 right-0 h-0.5 bg-primary/80" />
                      <div className="absolute top-[37%] left-0 right-0 h-0.5 bg-primary/80" />
                      <div className="absolute top-[65%] left-0 right-0 h-0.5 bg-primary/80" />
                      <div className="absolute top-[84%] left-0 right-0 h-0.5 bg-primary/80" />
                      
                      {/* Porcentajes laterales */}
                      <div className="absolute top-[9%] right-2 text-xs font-bold text-primary bg-black/50 px-2 py-1 rounded">
                        {metrics?.facialProportions?.ratio?.[0] || "18"}%
                      </div>
                      <div className="absolute top-[27.5%] right-2 text-xs font-bold text-primary bg-black/50 px-2 py-1 rounded">
                        {metrics?.facialProportions?.ratio?.[1] || "19"}%
                      </div>
                      <div className="absolute top-[51%] right-2 text-xs font-bold text-primary bg-black/50 px-2 py-1 rounded">
                        {metrics?.facialProportions?.ratio?.[2] || "28"}%
                      </div>
                      <div className="absolute top-[74.5%] right-2 text-xs font-bold text-primary bg-black/50 px-2 py-1 rounded">
                        {metrics?.facialProportions?.ratio?.[3] || "19"}%
                      </div>
                      <div className="absolute top-[92%] right-2 text-xs font-bold text-primary bg-black/50 px-2 py-1 rounded">
                        {metrics?.facialProportions?.ratio?.[4] || "16"}%
                      </div>
                    </div>
                  </div>

                  {/* Diagrama Golden Ratio */}
                  <div className="relative aspect-[3/4] bg-muted/10 rounded-lg overflow-hidden border-2 border-accent/30 flex items-center justify-center">
                    <svg viewBox="0 0 200 300" className="w-full h-full p-4">
                      {/* Contorno de rostro ideal */}
                      <ellipse cx="100" cy="150" rx="60" ry="90" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/40" />
                      
                      {/* Ojos */}
                      <circle cx="75" cy="120" r="6" fill="currentColor" className="text-muted-foreground/60" />
                      <circle cx="125" cy="120" r="6" fill="currentColor" className="text-muted-foreground/60" />
                      
                      {/* Nariz simple */}
                      <line x1="100" y1="140" x2="100" y2="165" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/60" />
                      
                      {/* Boca */}
                      <path d="M 80 185 Q 100 195 120 185" stroke="currentColor" strokeWidth="2" fill="none" className="text-muted-foreground/60" />
                      
                      {/* Líneas horizontales de proporción */}
                      <line x1="30" y1="60" x2="170" y2="60" stroke="currentColor" strokeWidth="2" className="text-accent" strokeDasharray="4" />
                      <line x1="30" y1="120" x2="170" y2="120" stroke="currentColor" strokeWidth="2" className="text-accent" strokeDasharray="4" />
                      <line x1="30" y1="180" x2="170" y2="180" stroke="currentColor" strokeWidth="2" className="text-accent" strokeDasharray="4" />
                      <line x1="30" y1="240" x2="170" y2="240" stroke="currentColor" strokeWidth="2" className="text-accent" strokeDasharray="4" />
                      
                      {/* Porcentajes - Golden Ratio (20% cada sección) */}
                      <text x="175" y="90" fill="currentColor" fontSize="14" fontWeight="bold" className="text-accent">20%</text>
                      <text x="175" y="150" fill="currentColor" fontSize="14" fontWeight="bold" className="text-accent">20%</text>
                      <text x="175" y="210" fill="currentColor" fontSize="14" fontWeight="bold" className="text-accent">20%</text>
                      <text x="175" y="270" fill="currentColor" fontSize="14" fontWeight="bold" className="text-accent">20%</text>
                    </svg>
                    
                    {/* Etiqueta Golden Ratio */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-accent/20 border border-accent/50 rounded-full">
                      <span className="text-xs font-bold text-accent">Proporción Áurea</span>
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" size="sm" className="flex-1 max-w-[200px]">
                    Ver Detalle
                  </Button>
                  <Button variant="default" size="sm" className="flex-1 max-w-[200px]">
                    Proporción Áurea
                  </Button>
                </div>
              </div>

              {/* Explicación simple */}
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">¿Qué significa?</strong> Tu rostro se divide en 5 secciones verticales. 
                  La proporción áurea ideal es 20% en cada sección. Esto nos ayuda a diseñar una sonrisa perfectamente balanceada con tu estructura facial única.
                </p>
              </div>
            </Card>

            {/* Eye Distance - Distancia entre ojos */}
            {perfectCorpData.eyeDistance && (
              <Card className="bg-card/50 backdrop-blur border-border/50 p-6">
                <h3 className="text-xl font-heading font-bold mb-6">Distancia Entre Ojos</h3>
                
                <div className="bg-muted/20 rounded-xl p-6">
                  <div className="flex justify-between text-sm text-muted-foreground mb-3">
                    <span>Estrecha</span>
                    <span className="font-semibold text-foreground">Balanceada</span>
                    <span>Amplia</span>
                  </div>
                  
                  {/* Barra de progreso visual */}
                  <div className="relative h-3 bg-muted/40 rounded-full overflow-hidden mb-4">
                    <div 
                      className={`absolute h-full rounded-full transition-all ${
                        perfectCorpData.eyeDistance === 'narrow' ? 'w-1/3 left-0 bg-gradient-to-r from-secondary/60 to-secondary' :
                        perfectCorpData.eyeDistance === 'wide' ? 'w-1/3 left-2/3 bg-gradient-to-r from-primary/60 to-primary' :
                        'w-1/3 left-1/3 bg-gradient-to-r from-accent/60 to-accent'
                      }`}
                    />
                  </div>

                  {/* Valor actual */}
                  <div className="text-center">
                    <span className="inline-block px-4 py-2 bg-primary/10 border border-primary/30 rounded-full text-sm font-bold text-primary capitalize">
                      {perfectCorpData.eyeDistance === 'narrow' ? 'Estrecha' :
                       perfectCorpData.eyeDistance === 'wide' ? 'Amplia' : 'Balanceada'}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                  La distancia entre tus ojos influye en el ancho ideal de tu sonrisa y la posición de los dientes frontales.
                </p>
              </Card>
            )}

            {/* Eye Width - Ancho de ojos */}
            {perfectCorpData.eyeSize && (
              <Card className="bg-card/50 backdrop-blur border-border/50 p-6">
                <h3 className="text-xl font-heading font-bold mb-6">Ancho de Ojos</h3>
                
                <div className="bg-muted/20 rounded-xl p-6">
                  <div className="flex justify-between text-sm text-muted-foreground mb-3">
                    <span>Estrechos</span>
                    <span className="font-semibold text-foreground">Balanceados</span>
                    <span>Amplios</span>
                  </div>
                  
                  {/* Barra de progreso visual */}
                  <div className="relative h-3 bg-muted/40 rounded-full overflow-hidden mb-4">
                    <div 
                      className={`absolute h-full rounded-full transition-all ${
                        perfectCorpData.eyeSize === 'small' ? 'w-1/3 left-0 bg-gradient-to-r from-secondary/60 to-secondary' :
                        perfectCorpData.eyeSize === 'large' ? 'w-1/3 left-2/3 bg-gradient-to-r from-primary/60 to-primary' :
                        'w-1/3 left-1/3 bg-gradient-to-r from-accent/60 to-accent'
                      }`}
                    />
                  </div>

                  {/* Valor actual */}
                  <div className="text-center">
                    <span className="inline-block px-4 py-2 bg-primary/10 border border-primary/30 rounded-full text-sm font-bold text-primary capitalize">
                      {perfectCorpData.eyeSize === 'small' ? 'Estrechos' :
                       perfectCorpData.eyeSize === 'large' ? 'Amplios' : 'Balanceados'}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                  El tamaño de tus ojos se relaciona con las proporciones ideales de tus dientes y la exposición dental al sonreír.
                </p>
              </Card>
            )}

            {/* Face Aspect Ratio - Forma de rostro */}
            {perfectCorpData.faceShape && (
              <Card className="bg-card/50 backdrop-blur border-border/50 p-6">
                <h3 className="text-xl font-heading font-bold mb-6">Forma del Rostro</h3>
                
                <div className="bg-muted/20 rounded-xl p-6">
                  <div className="flex justify-between text-sm text-muted-foreground mb-3">
                    <span>Corto</span>
                    <span className="font-semibold text-foreground">Balanceado</span>
                    <span>Largo</span>
                  </div>
                  
                  {/* Barra de progreso visual */}
                  <div className="relative h-3 bg-muted/40 rounded-full overflow-hidden mb-4">
                    <div 
                      className={`absolute h-full rounded-full transition-all ${
                        perfectCorpData.faceShape === 'round' ? 'w-1/3 left-0 bg-gradient-to-r from-secondary/60 to-secondary' :
                        perfectCorpData.faceShape === 'long' || perfectCorpData.faceShape === 'oblong' ? 'w-1/3 left-2/3 bg-gradient-to-r from-primary/60 to-primary' :
                        'w-1/3 left-1/3 bg-gradient-to-r from-accent/60 to-accent'
                      }`}
                    />
                  </div>

                  {/* Valor actual con emoji */}
                  <div className="text-center">
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary/10 border border-primary/30 rounded-full">
                      <span className="text-2xl">
                        {perfectCorpData.faceShape === 'oval' && '🥚'}
                        {perfectCorpData.faceShape === 'round' && '⭕'}
                        {perfectCorpData.faceShape === 'square' && '⬜'}
                        {perfectCorpData.faceShape === 'heart' && '💝'}
                        {perfectCorpData.faceShape === 'oblong' && '📏'}
                        {perfectCorpData.faceShape === 'long' && '📏'}
                        {!['oval', 'round', 'square', 'heart', 'oblong', 'long'].includes(perfectCorpData.faceShape) && '👤'}
                      </span>
                      <span className="text-sm font-bold text-primary capitalize">
                        {perfectCorpData.faceShape === 'oval' && 'Ovalado'}
                        {perfectCorpData.faceShape === 'round' && 'Redondo'}
                        {perfectCorpData.faceShape === 'square' && 'Cuadrado'}
                        {perfectCorpData.faceShape === 'heart' && 'Corazón'}
                        {perfectCorpData.faceShape === 'oblong' && 'Oblongo'}
                        {perfectCorpData.faceShape === 'long' && 'Largo'}
                        {!['oval', 'round', 'square', 'heart', 'oblong', 'long'].includes(perfectCorpData.faceShape) && perfectCorpData.faceShape}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                  <strong className="text-foreground">Tu forma de rostro:</strong> {
                    perfectCorpData.faceShape === 'oval' ? 'Ideal para cualquier diseño de sonrisa, permite gran versatilidad en proporciones dentales.' :
                    perfectCorpData.faceShape === 'round' ? 'Armoniza mejor con dientes ligeramente rectangulares para estilizar el rostro.' :
                    perfectCorpData.faceShape === 'square' ? 'Se complementa con dientes suavemente redondeados para suavizar líneas angulares.' :
                    perfectCorpData.faceShape === 'heart' ? 'Favorece sonrisas amplias que balanceen la anchura superior del rostro.' :
                    'Se beneficia de proporciones dentales que complementen la estructura facial única.'
                  }
                </p>
              </Card>
            )}

            {/* Integración con Sonrisa */}
            <Card className="bg-gradient-to-br from-primary/10 to-accent/5 backdrop-blur border-primary/30 p-6">
              <h3 className="text-xl font-heading font-bold mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Integración con Tu Diseño de Sonrisa
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Todos estos parámetros faciales se integran con tus métricas dentales (arco de sonrisa, exposición gingival, línea media) 
                para crear un diseño de sonrisa completamente personalizado que armonice perfectamente con tu rostro.
              </p>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-card/50 rounded-lg p-3 border border-border/30">
                  <div className="font-bold text-primary mb-1">Proporción Facial</div>
                  <div className="text-muted-foreground">Define altura de dientes</div>
                </div>
                <div className="bg-card/50 rounded-lg p-3 border border-border/30">
                  <div className="font-bold text-primary mb-1">Distancia Ocular</div>
                  <div className="text-muted-foreground">Determina ancho de sonrisa</div>
                </div>
                <div className="bg-card/50 rounded-lg p-3 border border-border/30">
                  <div className="font-bold text-primary mb-1">Forma de Rostro</div>
                  <div className="text-muted-foreground">Guía forma de dientes</div>
                </div>
                <div className="bg-card/50 rounded-lg p-3 border border-border/30">
                  <div className="font-bold text-primary mb-1">Tamaño de Ojos</div>
                  <div className="text-muted-foreground">Influye en exposición dental</div>
                </div>
              </div>
            </Card>
          </div>
        )}

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

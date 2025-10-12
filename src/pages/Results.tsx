import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSmileAnalysis } from "@/contexts/SmileAnalysisContext";
import { Button } from "@/components/ui/button";
import { ImageComparison } from "@/components/ia-lab/ImageComparison";
import { SimulationControls } from "@/components/ia-lab/SimulationControls";
import { toast } from "sonner";
import { drawMidlineOverlay, drawProportionsOverlay, drawSmileOverlay, type SmileMetrics } from "@/lib/metrics";

export default function Results() {
  const navigate = useNavigate();
  const { smileImage, simulatedImage, contactData, contactSubmitted, metrics } = useSmileAnalysis();
  
  const [adjustments, setAdjustments] = useState({
    toothLength: 0,
    toothWidth: 0,
    whiteness: 0
  });
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [currentSimulation, setCurrentSimulation] = useState(simulatedImage);
  
  const canvasRef1 = useRef<HTMLCanvasElement>(null);
  const canvasRef2 = useRef<HTMLCanvasElement>(null);
  const canvasRef3 = useRef<HTMLCanvasElement>(null);
  
  const [overlayImages, setOverlayImages] = useState<{
    midline: string;
    proportions: string;
    smile: string;
  } | null>(null);

  // Proteger ruta
  useEffect(() => {
    if (!contactSubmitted || !smileImage || !simulatedImage) {
      navigate("/captura-reposo");
    }
  }, [contactSubmitted, smileImage, simulatedImage, navigate]);
  
  // Generar overlays cuando se carga la página
  useEffect(() => {
    if (smileImage && metrics) {
      generateOverlays();
    }
  }, [smileImage, metrics]);
  
  // Actualizar simulación actual cuando cambia la imagen simulada
  useEffect(() => {
    if (simulatedImage) {
      setCurrentSimulation(simulatedImage);
    }
  }, [simulatedImage]);
  
  const generateOverlays = async () => {
    if (!smileImage || !metrics) return;
    
    try {
      // Cargar imagen
      const img = await loadImage(smileImage);
      
      // Crear landmarks mock (necesitaríamos guardarlos en el contexto idealmente)
      // Por ahora generamos overlays sin landmarks precisos
      const canvas1 = canvasRef1.current;
      const canvas2 = canvasRef2.current;
      const canvas3 = canvasRef3.current;
      
      if (!canvas1 || !canvas2 || !canvas3) return;
      
      // Aquí necesitaríamos los landmarks reales, pero como no los tenemos guardados
      // creamos una versión simplificada mostrando solo las métricas
      
      const midlineUrl = await createMetricsOverlay(img, 'midline', metrics);
      const proportionsUrl = await createMetricsOverlay(img, 'proportions', metrics);
      const smileUrl = await createMetricsOverlay(img, 'smile', metrics);
      
      setOverlayImages({
        midline: midlineUrl,
        proportions: proportionsUrl,
        smile: smileUrl
      });
    } catch (error) {
      console.error('Error generating overlays:', error);
    }
  };
  
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };
  
  const createMetricsOverlay = async (
    img: HTMLImageElement, 
    type: 'midline' | 'proportions' | 'smile',
    metrics: any
  ): Promise<string> => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No context');
    
    ctx.drawImage(img, 0, 0);
    
    // Dibujar overlay simplificado basado en métricas
    if (type === 'midline') {
      drawSimplifiedMidlineOverlay(ctx, canvas.width, canvas.height, metrics);
    } else if (type === 'proportions') {
      drawSimplifiedProportionsOverlay(ctx, canvas.width, canvas.height, metrics);
    } else {
      drawSimplifiedSmileOverlay(ctx, canvas.width, canvas.height, metrics);
    }
    
    return canvas.toDataURL('image/png');
  };
  
  const drawSimplifiedMidlineOverlay = (ctx: CanvasRenderingContext2D, w: number, h: number, m: any) => {
    // Panel de información
    ctx.fillStyle = "rgba(0,0,0,0.75)";
    ctx.fillRect(10, 10, 320, 140);
    
    ctx.font = "bold 16px system-ui";
    ctx.fillStyle = "white";
    ctx.fillText("📏 LÍNEAS MEDIAS", 20, 40);
    
    ctx.font = "13px system-ui";
    ctx.fillStyle = "rgba(34,197,94,1)";
    ctx.fillText(`Línea Media Facial: ${m.facialMidline?.side || 'centrado'}`, 20, 70);
    
    ctx.fillStyle = "rgba(249,115,22,1)";
    ctx.fillText(`Línea Media Dental: ${m.midline.side}`, 20, 95);
    ctx.fillText(`Desviación: ${m.midline.mm.toFixed(1)}mm`, 20, 115);
    
    const statusColor = m.midlineCoincidence?.status === "coincidente" ? "rgba(34,197,94,1)" :
                        m.midlineCoincidence?.status === "leve" ? "rgba(250,204,21,1)" : "rgba(239,68,68,1)";
    ctx.fillStyle = statusColor;
    ctx.fillText(`Estado: ${m.midlineCoincidence?.status || 'N/A'}`, 20, 140);
  };
  
  const drawSimplifiedProportionsOverlay = (ctx: CanvasRenderingContext2D, w: number, h: number, m: any) => {
    // Panel de información
    ctx.fillStyle = "rgba(0,0,0,0.75)";
    ctx.fillRect(10, 10, 320, 160);
    
    ctx.font = "bold 16px system-ui";
    ctx.fillStyle = "white";
    ctx.fillText("📐 PROPORCIONES FACIALES", 20, 40);
    
    ctx.font = "13px system-ui";
    ctx.fillStyle = "rgba(59,130,246,1)";
    ctx.fillText(`Tercio Superior: ${m.facialProportions?.upperThird.toFixed(1)}%`, 20, 70);
    ctx.fillText(`Tercio Medio: ${m.facialProportions?.middleThird.toFixed(1)}%`, 20, 95);
    ctx.fillText(`Tercio Inferior: ${m.facialProportions?.lowerThird.toFixed(1)}%`, 20, 120);
    
    const balanceColor = m.facialProportions?.isBalanced ? "rgba(34,197,94,1)" : "rgba(250,204,21,1)";
    ctx.fillStyle = balanceColor;
    ctx.fillText(m.facialProportions?.isBalanced ? "✓ Equilibradas" : "⚠ Desbalanceadas", 20, 145);
  };
  
  const drawSimplifiedSmileOverlay = (ctx: CanvasRenderingContext2D, w: number, h: number, m: any) => {
    // Panel de información
    ctx.fillStyle = "rgba(0,0,0,0.75)";
    ctx.fillRect(10, 10, 320, 180);
    
    ctx.font = "bold 16px system-ui";
    ctx.fillStyle = "white";
    ctx.fillText("😊 ANÁLISIS DE SONRISA", 20, 40);
    
    ctx.font = "13px system-ui";
    const arcColor = m.smileArc === 'consonante' ? "rgba(34,197,94,1)" : 
                     m.smileArc === 'plano' ? "rgba(250,204,21,1)" : "rgba(239,68,68,1)";
    ctx.fillStyle = arcColor;
    ctx.fillText(`Arco: ${m.smileArc}`, 20, 70);
    
    ctx.fillStyle = "white";
    ctx.fillText(`Ancho: ${m.smileWidth?.mm.toFixed(1)}mm (${m.smileWidth?.status})`, 20, 95);
    ctx.fillText(`Exposición gingival: ${m.gingival.mm.toFixed(1)}mm`, 20, 120);
    ctx.fillText(`Corredor bucal: ${Math.round(m.buccalRatio*100)}%`, 20, 145);
    ctx.fillText(`Simetría: ${m.symmetry?.horizontal.toFixed(0)}%`, 20, 170);
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `¡Hola! Acabo de realizar mi análisis de sonrisa con IA y me gustaría agendar una consulta. Mi nombre es ${contactData?.name}`
    );
    window.open(`https://wa.me/56912345678?text=${message}`, "_blank");
  };

  const handleRegenerate = async () => {
    if (!smileImage || !metrics) return;
    
    setIsRegenerating(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/simulate-smile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          imageBase64: smileImage,
          metrics,
          adjustments
        }),
      });

      if (!response.ok) {
        throw new Error('Error en simulación');
      }

      const data = await response.json();
      setCurrentSimulation(data.simulatedImage);
      toast.success('Simulación actualizada con tus ajustes');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al regenerar. Intenta de nuevo.');
    } finally {
      setIsRegenerating(false);
    }
  };
  
  const resetAdjustments = () => {
    setAdjustments({ toothLength: 0, toothWidth: 0, whiteness: 0 });
    setCurrentSimulation(simulatedImage);
  };
  
  const handleShare = async () => {
    try {
      // Crear un canvas con la comparación
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Cargar imágenes
      const beforeImg = await loadImage(smileImage!);
      const afterImg = await loadImage(currentSimulation!);
      
      // Configurar canvas
      const padding = 40;
      const spacing = 20;
      canvas.width = beforeImg.width * 2 + spacing + padding * 2;
      canvas.height = beforeImg.height + padding * 2 + 60;
      
      // Fondo
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Título
      ctx.fillStyle = 'white';
      ctx.font = 'bold 24px system-ui';
      ctx.fillText('Mi Transformación con Sonríe.AI', padding, 35);
      
      // Imágenes
      ctx.drawImage(beforeImg, padding, padding + 60, beforeImg.width, beforeImg.height);
      ctx.drawImage(afterImg, padding + beforeImg.width + spacing, padding + 60, afterImg.width, afterImg.height);
      
      // Etiquetas
      ctx.font = 'bold 18px system-ui';
      ctx.fillText('Antes', padding + beforeImg.width/2 - 30, padding + 50);
      ctx.fillText('Después', padding + beforeImg.width + spacing + afterImg.width/2 - 35, padding + 50);
      
      // Convertir a blob
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        
        const file = new File([blob], 'mi-sonrisa.png', { type: 'image/png' });
        
        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Mi nueva sonrisa con Sonríe.AI',
            text: 'Mira mi simulación de sonrisa transformada con IA',
            files: [file]
          });
        } else {
          // Fallback: descargar imagen
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'mi-sonrisa-sonrie-ai.png';
          a.click();
          URL.revokeObjectURL(url);
          toast.success('Imagen descargada');
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error al compartir:', error);
      toast.error('Error al compartir');
    }
  };
  
  const downloadOverlays = async () => {
    if (!overlayImages) {
      toast.error('Generando overlays, espera un momento...');
      return;
    }
    
    // Descargar las tres imágenes con overlay
    const downloads = [
      { url: overlayImages.midline, name: 'analisis-lineas-medias.png' },
      { url: overlayImages.proportions, name: 'analisis-proporciones-faciales.png' },
      { url: overlayImages.smile, name: 'analisis-sonrisa.png' }
    ];
    
    for (const download of downloads) {
      const a = document.createElement('a');
      a.href = download.url;
      a.download = download.name;
      a.click();
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    toast.success('Análisis descargados (3 imágenes)');
  };

  const handleRestart = () => {
    navigate("/");
  };

  if (!smileImage || !simulatedImage) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Paso 6 de 6</span>
            <span className="text-sm font-display font-bold text-primary">100%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div className="bg-primary h-3 rounded-full transition-all shadow-sm shadow-primary/50" style={{ width: '100%' }} />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-green-500/10 border-2 border-green-500/30 rounded-full mb-6">
            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-700 dark:text-green-300 font-display font-bold text-sm tracking-wide">ANÁLISIS COMPLETADO</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-foreground mb-4 leading-tight">
            ¡Así podrías verte con<br />
            <span className="text-primary">tu nueva sonrisa</span>!
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Descubre la transformación que podrías lograr con tratamiento dental profesional
          </p>
        </div>

        {/* Comparison */}
        <div className="mb-10">
          <ImageComparison 
            beforeImage={smileImage}
            afterImage={currentSimulation}
          />
        </div>
        
        {/* Controles de ajuste */}
        <div className="mb-10">
          <SimulationControls
            adjustments={adjustments}
            onAdjustmentChange={setAdjustments}
            onReset={resetAdjustments}
            onRegenerate={handleRegenerate}
            isSimulating={isRegenerating}
          />
        </div>

        {/* Share & Download Buttons */}
        <div className="flex justify-center gap-4 mb-10 flex-wrap">
          <Button
            onClick={handleShare}
            className="font-display font-bold rounded-xl px-8 py-6 text-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Compartir en Redes Sociales
          </Button>
          
          <Button
            variant="outline"
            onClick={downloadOverlays}
            className="font-display font-bold border-2 rounded-xl px-8 py-6 text-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Descargar Análisis Detallado
          </Button>
        </div>
        
        {/* Overlay Images Preview */}
        {overlayImages && (
          <div className="mb-10">
            <h3 className="text-2xl font-display font-black text-foreground mb-6 text-center">
              📊 Análisis Visual Detallado
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-card rounded-2xl border-2 border-border p-4 shadow-lg">
                <img src={overlayImages.midline} alt="Análisis de líneas medias" className="w-full rounded-lg mb-3" />
                <p className="text-sm font-display font-bold text-center text-foreground">Líneas Medias</p>
              </div>
              <div className="bg-card rounded-2xl border-2 border-border p-4 shadow-lg">
                <img src={overlayImages.proportions} alt="Proporciones faciales" className="w-full rounded-lg mb-3" />
                <p className="text-sm font-display font-bold text-center text-foreground">Proporciones Faciales</p>
              </div>
              <div className="bg-card rounded-2xl border-2 border-border p-4 shadow-lg">
                <img src={overlayImages.smile} alt="Análisis de sonrisa" className="w-full rounded-lg mb-3" />
                <p className="text-sm font-display font-bold text-center text-foreground">Análisis de Sonrisa</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Canvas ocultos para generar overlays */}
        <div className="hidden">
          <canvas ref={canvasRef1} />
          <canvas ref={canvasRef2} />
          <canvas ref={canvasRef3} />
        </div>

        {/* Summary Card */}
        <div className="bg-card rounded-3xl border-2 border-border p-8 mb-10 shadow-lg">
          <h3 className="text-2xl font-display font-black text-foreground mb-6 flex items-center gap-3">
            <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Análisis Detallado de Tu Sonrisa
          </h3>
          
          <div className="grid md:grid-cols-2 gap-5">
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-6 rounded-2xl border-2 border-primary/20">
              <p className="text-sm text-muted-foreground mb-2 font-display font-bold uppercase tracking-wide">Arco de Sonrisa</p>
              <p className="text-2xl font-display font-black text-foreground capitalize">{metrics?.smileArc || "N/A"}</p>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-6 rounded-2xl border-2 border-primary/20">
              <p className="text-sm text-muted-foreground mb-2 font-display font-bold uppercase tracking-wide">Ancho de Sonrisa</p>
              <p className="text-2xl font-display font-black text-foreground">{metrics?.smileWidth.mm.toFixed(1)}mm</p>
              <p className="text-sm text-muted-foreground capitalize">{metrics?.smileWidth.status}</p>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-6 rounded-2xl border-2 border-primary/20">
              <p className="text-sm text-muted-foreground mb-2 font-display font-bold uppercase tracking-wide">Exposición Gingival</p>
              <p className="text-2xl font-display font-black text-foreground">{metrics?.gingival.mm.toFixed(1)}mm</p>
              <p className="text-sm text-muted-foreground capitalize">{metrics?.gingival.class}</p>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-6 rounded-2xl border-2 border-primary/20">
              <p className="text-sm text-muted-foreground mb-2 font-display font-bold uppercase tracking-wide">Línea Media Dental</p>
              <p className="text-2xl font-display font-black text-foreground">{metrics?.midline.mm.toFixed(1)}mm</p>
              <p className="text-sm text-muted-foreground capitalize">{metrics?.midline.side}</p>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-6 rounded-2xl border-2 border-primary/20">
              <p className="text-sm text-muted-foreground mb-2 font-display font-bold uppercase tracking-wide">Corredor Bucal</p>
              <p className="text-2xl font-display font-black text-foreground">{metrics ? Math.round(metrics.buccalRatio * 100) : 0}%</p>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-6 rounded-2xl border-2 border-primary/20">
              <p className="text-sm text-muted-foreground mb-2 font-display font-bold uppercase tracking-wide">Proporción Dental</p>
              <p className="text-2xl font-display font-black text-foreground">{metrics?.toothProportions.goldenRatio.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">{metrics?.toothProportions.isIdeal ? "✓ Proporción áurea" : "Mejorable"}</p>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-6 rounded-2xl border-2 border-primary/20">
              <p className="text-sm text-muted-foreground mb-2 font-display font-bold uppercase tracking-wide">Simetría Facial</p>
              <p className="text-2xl font-display font-black text-foreground">{metrics?.symmetry.horizontal.toFixed(0)}%</p>
              <p className="text-sm text-muted-foreground">{metrics?.symmetry.isSymmetric ? "✓ Simétrica" : "Asimétrica"}</p>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-6 rounded-2xl border-2 border-primary/20">
              <p className="text-sm text-muted-foreground mb-2 font-display font-bold uppercase tracking-wide">Alineación Dental</p>
              <p className="text-2xl font-display font-black text-foreground capitalize">{metrics?.toothAlignment.status}</p>
              <p className="text-sm text-muted-foreground">{metrics?.toothAlignment.score.toFixed(0)}% score</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20 rounded-3xl border-2 border-primary/30 p-10 mb-10 shadow-xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-display font-black text-foreground mb-4">
              🎉 ¡Da el Siguiente Paso!
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Agenda tu consulta <strong className="text-foreground">100% gratuita</strong> y transforma tu sonrisa con un plan personalizado
            </p>
          </div>

          {/* Buttons */}
          <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto mb-8">
            <Button
              size="lg"
              onClick={handleWhatsApp}
              className="w-full py-7 text-lg font-display font-bold rounded-2xl bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all"
            >
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Agendar por WhatsApp
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => window.open("https://calendly.com", "_blank")}
              className="w-full py-7 text-lg font-display font-bold rounded-2xl border-2 shadow-lg hover:shadow-xl transition-all"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Agendar Online
            </Button>
          </div>

          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Consulta gratis
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Sin compromiso
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Plan personalizado
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-center mb-12">
          <Button
            variant="outline"
            onClick={handleRestart}
            className="font-display font-bold border-2 rounded-xl px-8 py-6"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Hacer Nuevo Análisis
          </Button>
        </div>

        {/* Footer */}
        <footer className="text-center pt-8 border-t-2 border-border">
          <p className="text-sm font-display font-bold text-foreground mb-1">
            Desarrollado por <span className="text-primary">Clínica Miró</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Equipo liderado por Dr. Carlos Montoya
          </p>
        </footer>
      </div>
    </div>
  );
}

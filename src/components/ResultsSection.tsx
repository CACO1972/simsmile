import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Mail, Download, CheckCircle2, Sparkles, X, Phone, MessageCircle, Instagram } from "lucide-react";
import { toast } from "sonner";
import simsmileLogo from "@/assets/simsmile-logo-pink.png";
import { Card } from "@/components/ui/card";
import { WaitlistModal } from "./WaitlistModal";
import { SmileCustomizer } from "./SmileCustomizer";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FacialAnalysisOverlay } from "./FacialAnalysisOverlay";
import { logger } from "@/lib/logger";
import type { Landmark } from "@/types/mediapipe";

interface ResultsSectionProps {
  restImage: string;
  smileImage: string;
  idealImage: string;
  analysis: string;
  metrics: Record<string, unknown> | null;
  landmarks: Landmark[] | null;
  contactEmail: string;
  facialAnalysis?: Record<string, unknown>;
  qualityScore?: number;
}

export const ResultsSection = ({
  restImage,
  smileImage,
  idealImage,
  analysis,
  metrics,
  landmarks,
  contactEmail,
  facialAnalysis,
  qualityScore,
}: ResultsSectionProps) => {
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [customizedImage, setCustomizedImage] = useState<string | null>(null);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);
  const [beforeAfterPosition, setBeforeAfterPosition] = useState(50);
  const [showFloatingCTA, setShowFloatingCTA] = useState(false);

  // Detectar scroll para mostrar CTA flotante
  useEffect(() => {
    const handleScroll = () => {
      // Mostrar después de 300px de scroll
      setShowFloatingCTA(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCustomizedSimulation = (newImage: string) => {
    setCustomizedImage(newImage);
    toast.success("¡Sonrisa personalizada lista!");
  };

  const handleDownloadReport = () => {
    setShowWaitlistModal(true);
    toast.info("Descarga de reportes disponible en versión Premium");
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `¡Mira mi análisis de sonrisa con SimSmile! 😁\n\nDescubrí cómo se vería mi sonrisa ideal. Tú también puedes hacerlo en: ${window.location.origin}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
    toast.success("Abriendo WhatsApp...");
  };

  const handleShareInstagram = () => {
    toast.info("Instagram se abrirá. Comparte tu experiencia en tu historia o feed!", { duration: 4000 });
    // Instagram no permite compartir directamente con texto, pero podemos abrir la app
    window.open('instagram://story-camera', '_blank');
    // Fallback para web
    setTimeout(() => {
      window.open('https://www.instagram.com/', '_blank');
    }, 1000);
  };

  const handleSendEmail = () => {
    const subject = encodeURIComponent("Mi Análisis de Sonrisa SimSmile");
    const body = encodeURIComponent(
      `Hola,\n\nQuiero compartir contigo mi análisis de sonrisa realizado con SimSmile.\n\nLos resultados incluyen un análisis detallado de proporciones faciales y recomendaciones personalizadas.\n\nPuedes hacer tu propio análisis en: ${window.location.origin}\n\n¡Saludos!`
    );
    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
    toast.success("Abriendo tu cliente de correo...");
  };


  return (
    <div className="min-h-screen flex flex-col px-4 py-8 md:py-12 relative overflow-hidden bg-background">
      {/* CTA Flotante - aparece al hacer scroll */}
      {showFloatingCTA && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-gradient-to-r from-primary via-accent to-primary text-white rounded-full shadow-2xl px-6 py-3 flex items-center gap-4 hover:shadow-primary/50 transition-all hover:scale-105">
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 animate-pulse" />
              <span className="font-bold text-sm md:text-base">¡Agenda tu Consulta GRATIS!</span>
            </div>
            <Button 
              size="sm"
              className="bg-white text-primary hover:bg-white/90 font-bold shadow-lg"
              asChild
            >
              <a href="https://wa.me/56988085850?text=Hola,%20quiero%20agendar%20mi%20consulta%20de%20SimSmile" target="_blank" rel="noopener noreferrer">
                Contactar Ahora
              </a>
            </Button>
            <button 
              onClick={() => setShowFloatingCTA(false)}
              className="ml-2 hover:bg-white/20 rounded-full p-1 transition-colors"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

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
          <p className="text-base md:text-lg text-muted-foreground mb-6">
            Resultado con correcciones aplicadas por IA
          </p>
          
          {/* Botones de acción principales */}
          <div className="flex flex-col gap-4 max-w-lg mx-auto">
            <Button
              size="lg"
              className="w-full bg-[#25D366] hover:bg-[#20BA59] text-white gap-2 h-14 text-lg font-semibold shadow-lg hover:shadow-xl"
              asChild
            >
              <a href="https://wa.me/56988085850?text=Hola,%20quiero%20agendar%20mi%20consulta%20de%20SimSmile" target="_blank" rel="noopener noreferrer">
                <Phone className="h-5 w-5" />
                Agendar Consulta GRATIS
              </a>
            </Button>
            
            <div className="grid grid-cols-3 gap-3">
              <Button
                onClick={handleShareWhatsApp}
                variant="outline"
                className="flex-col h-20 gap-2 border-2"
              >
                <MessageCircle className="h-5 w-5" />
                <span className="text-xs font-semibold">WhatsApp</span>
              </Button>
              <Button
                onClick={handleShareInstagram}
                variant="outline"
                className="flex-col h-20 gap-2 border-2"
              >
                <Instagram className="h-5 w-5" />
                <span className="text-xs font-semibold">Instagram</span>
              </Button>
              <Button
                onClick={handleSendEmail}
                variant="outline"
                className="flex-col h-20 gap-2 border-2"
              >
                <Mail className="h-5 w-5" />
                <span className="text-xs font-semibold">Email</span>
              </Button>
            </div>
          </div>
        </div>

        {/* 1. IMAGEN Y PERSONALIZACIÓN INTEGRADA */}
        <Card className="bg-gradient-to-br from-primary/5 to-card/50 backdrop-blur border-primary/30 p-6 md:p-8 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-heading font-bold mb-2">
              ✨ Tu Sonrisa Mejorada
            </h2>
            <p className="text-sm text-muted-foreground">
              {customizedImage ? 'Sonrisa personalizada generada' : 'Correcciones aplicadas por IA'}
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Imagen Principal */}
            <div 
              className="aspect-square relative rounded-xl overflow-hidden border-2 border-primary/30 shadow-xl cursor-pointer hover:border-primary/60 transition-all"
              onClick={() => setShowFullscreen(true)}
            >
              <img 
                src={customizedImage || smileImage} 
                alt="Sonrisa mejorada" 
                className="w-full h-full object-cover"
              />
              {customizedImage && (
                <div className="absolute top-4 right-4 bg-accent text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg animate-pulse">
                  Personalizada ✨
                </div>
              )}
            </div>

            {/* Botón Comparar Antes/Después */}
            <Button
              onClick={() => setShowBeforeAfter(!showBeforeAfter)}
              variant="outline"
              className="w-full gap-2"
            >
              <Sparkles className="h-4 w-4" />
              {showBeforeAfter ? "Ocultar" : "Ver"} Antes / Después
            </Button>

            {/* Comparación Antes/Después */}
            {showBeforeAfter && (
              <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-accent/30 shadow-xl">
                {/* Imagen Después */}
                <img 
                  src={customizedImage || smileImage}
                  alt="Después"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                
                {/* Imagen Antes con clip */}
                <div 
                  className="absolute inset-0 overflow-hidden"
                  style={{ clipPath: `inset(0 ${100 - beforeAfterPosition}% 0 0)` }}
                >
                  <img 
                    src={restImage}
                    alt="Antes"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Divisor deslizante */}
                <div 
                  className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-10"
                  style={{ left: `${beforeAfterPosition}%` }}
                  onMouseDown={(e) => {
                    const container = e.currentTarget.parentElement!;
                    const rect = container.getBoundingClientRect();
                    const handleMouseMove = (moveEvent: MouseEvent) => {
                      const x = moveEvent.clientX - rect.left;
                      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
                      setBeforeAfterPosition(percentage);
                    };
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                  onTouchStart={(e) => {
                    const container = e.currentTarget.parentElement!;
                    const rect = container.getBoundingClientRect();
                    const handleTouchMove = (moveEvent: TouchEvent) => {
                      const x = moveEvent.touches[0].clientX - rect.left;
                      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
                      setBeforeAfterPosition(percentage);
                    };
                    const handleTouchEnd = () => {
                      document.removeEventListener('touchmove', handleTouchMove);
                      document.removeEventListener('touchend', handleTouchEnd);
                    };
                    document.addEventListener('touchmove', handleTouchMove);
                    document.addEventListener('touchend', handleTouchEnd);
                  }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center">
                    <div className="flex gap-1">
                      <div className="w-0.5 h-6 bg-primary"></div>
                      <div className="w-0.5 h-6 bg-primary"></div>
                    </div>
                  </div>
                </div>

                {/* Etiquetas */}
                <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  ANTES
                </div>
                <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  DESPUÉS
                </div>
              </div>
            )}

            {/* Personalizador Interactivo */}
            <div className="border-t border-border/50 pt-6">
              <SmileCustomizer
                baseImage={smileImage}
                onSimulate={handleCustomizedSimulation}
              />
            </div>
          </div>
        </Card>

        {/* 2. ANÁLISIS FACIAL CON OVERLAY VISUAL */}
        {facialAnalysis && (
          <div className="mb-8">
            <FacialAnalysisOverlay 
              data={facialAnalysis}
              imageUrl={restImage}
            />
          </div>
        )}

        {/* CTA Intermedio - aparece después del análisis */}
        <Card className="mb-8 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-2 border-primary/30 overflow-hidden">
          <div className="p-6 md:p-8 text-center relative">
            {/* Efecto de brillo animado */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[slide-in-right_3s_ease-in-out_infinite]" />
            
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-heading font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                ¿Te gustó tu simulación?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Da el siguiente paso hacia tu sonrisa ideal. Primera consulta <span className="font-bold text-primary">completamente GRATIS</span>.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  size="lg" 
                  className="gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl text-lg px-8"
                  asChild
                >
                  <a href="https://wa.me/56988085850?text=Hola,%20vi%20mi%20simulación%20de%20SimSmile%20y%20quiero%20agendar%20una%20consulta" target="_blank" rel="noopener noreferrer">
                    <Phone className="h-5 w-5" />
                    Agendar por WhatsApp
                  </a>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="gap-2 border-2 border-primary/50 hover:bg-primary/5 text-lg px-8"
                  asChild
                >
                  <a href="tel:+56988085850">
                    <Phone className="h-5 w-5" />
                    Llamar: +56 9 8808 5850
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Botones de acción secundarios */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          <Button size="default" onClick={handleDownloadReport} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Descargar PDF
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">Premium</span>
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

        {/* Contact CTA Final */}
        <div className="text-center bg-gradient-to-br from-card/80 to-muted/50 backdrop-blur-sm border-2 border-primary/30 rounded-2xl p-8 shadow-xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Último Paso</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-heading font-bold mb-3">
            ¿Listo para tu Transformación?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Nuestros especialistas están listos para diseñar tu sonrisa perfecta
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-base md:text-lg px-8 py-6 bg-gradient-to-r from-primary to-accent shadow-lg hover:shadow-xl" asChild>
              <a href="https://www.clinicamiro.cl" target="_blank" rel="noopener noreferrer">
                Visitar Clínica Miro
              </a>
            </Button>
            <Button size="lg" variant="outline" className="text-base md:text-lg px-8 py-6 border-2" asChild>
              <a href="https://wa.me/56988085850?text=Quiero%20más%20información%20sobre%20SimSmile" target="_blank" rel="noopener noreferrer">
                Hacer una Pregunta
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* CTA Sticky Bottom - aparece cuando el usuario scrollea hacia abajo */}
      {showFloatingCTA && (
        <div className="fixed bottom-0 left-0 right-0 z-40 animate-slide-in-right">
          <div className="bg-gradient-to-r from-primary via-accent to-primary text-white px-4 py-4 shadow-2xl backdrop-blur-sm border-t-2 border-white/20">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="font-bold text-lg mb-1">💎 Primera Consulta GRATIS</p>
                <p className="text-sm text-white/90">Transforma tu sonrisa hoy mismo</p>
              </div>
              <div className="flex gap-3">
                <Button 
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 font-bold shadow-lg"
                  asChild
                >
                  <a href="https://wa.me/56988085850?text=Hola,%20quiero%20agendar%20mi%20consulta%20de%20SimSmile" target="_blank" rel="noopener noreferrer">
                    <Phone className="h-5 w-5 mr-2" />
                    Agendar Ahora
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <WaitlistModal open={showWaitlistModal} onOpenChange={setShowWaitlistModal} />

      {/* Modal Fullscreen */}
      <Dialog open={showFullscreen} onOpenChange={setShowFullscreen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
            onClick={() => setShowFullscreen(false)}
          >
            <X className="h-6 w-6" />
          </Button>
          <div className="w-full h-[95vh] flex items-center justify-center p-8">
            <img 
              src={customizedImage || smileImage}
              alt="Sonrisa ampliada"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

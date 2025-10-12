import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSmileAnalysis } from "@/contexts/SmileAnalysisContext";
import { BeforeAfterSection } from "@/components/results/BeforeAfterSection";
import { AnalysisSection } from "@/components/results/AnalysisSection";
import { InteractiveSection } from "@/components/results/InteractiveSection";
import { CTASection } from "@/components/results/CTASection";

export default function Results() {
  const navigate = useNavigate();
  const { smileImage, simulatedImage, contactData, contactSubmitted, metrics } = useSmileAnalysis();

  // Proteger ruta
  useEffect(() => {
    if (!contactSubmitted || !smileImage || !simulatedImage) {
      navigate("/captura");
    }
  }, [contactSubmitted, smileImage, simulatedImage, navigate]);

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `¡Hola! Acabo de realizar mi análisis de sonrisa con IA y me gustaría agendar una consulta. Mi nombre es ${contactData?.name}`
    );
    window.open(`https://wa.me/56912345678?text=${message}`, "_blank");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Mi nueva sonrisa con Sonríe.AI',
        text: 'Mira mi simulación de sonrisa transformada con IA',
        url: window.location.href
      });
    }
  };

  const handleRestart = () => {
    navigate("/");
  };

  if (!smileImage || !simulatedImage) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Progress */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-display font-bold text-muted-foreground">Paso 5 de 5</span>
            <span className="text-sm font-display font-bold text-primary">100%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-4">
            <div className="bg-gradient-to-r from-primary to-accent h-4 rounded-full transition-all shadow-lg shadow-primary/50" style={{ width: '100%' }} />
          </div>
        </div>

        {/* Before/After Section */}
        <BeforeAfterSection beforeImage={smileImage} afterImage={simulatedImage} />

        {/* Analysis Section */}
        <AnalysisSection metrics={metrics} smileImage={smileImage} />

        {/* Interactive Section */}
        <InteractiveSection simulatedImage={simulatedImage} />

        {/* CTA Section */}
        <CTASection 
          contactData={contactData}
          onWhatsApp={handleWhatsApp}
          onShare={handleShare}
          onRestart={handleRestart}
        />

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

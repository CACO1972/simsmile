import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSmileAnalysis } from "@/contexts/SmileAnalysisContext";
import { Button } from "@/components/ui/button";
import { ImageComparison } from "@/components/ia-lab/ImageComparison";

export default function Results() {
  const navigate = useNavigate();
  const { smileImage, simulatedImage, contactData, contactSubmitted, metrics } = useSmileAnalysis();

  // Proteger ruta
  useEffect(() => {
    if (!contactSubmitted || !smileImage || !simulatedImage) {
      navigate("/captura-reposo");
    }
  }, [contactSubmitted, smileImage, simulatedImage, navigate]);

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `¡Hola! Acabo de realizar mi análisis de sonrisa con IA y me gustaría agendar una consulta. Mi nombre es ${contactData?.name}`
    );
    window.open(`https://wa.me/56912345678?text=${message}`, "_blank");
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
            <span className="text-sm font-medium text-primary">100%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-primary h-2 rounded-full transition-all" style={{ width: '100%' }} />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full mb-4">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-700 dark:text-green-400 font-semibold text-sm">ANÁLISIS COMPLETADO</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">
            ¡Tu Sonrisa <span className="text-primary">Transformada</span>!
          </h1>
          <p className="text-lg text-muted-foreground">
            Así luciría tu sonrisa con nuestro tratamiento dental
          </p>
        </div>

        {/* Comparison */}
        <div className="mb-8">
          <ImageComparison 
            beforeImage={smileImage}
            afterImage={simulatedImage}
          />
        </div>

        {/* Summary Card */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-8">
          <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Resumen de Tu Análisis
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-primary/5 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Arco de Sonrisa</p>
              <p className="text-lg font-semibold text-foreground capitalize">{metrics?.smileArc || "N/A"}</p>
            </div>
            <div className="bg-primary/5 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Exposición Gingival</p>
              <p className="text-lg font-semibold text-foreground">{metrics?.gingival.mm.toFixed(1)}mm - {metrics?.gingival.class}</p>
            </div>
            <div className="bg-primary/5 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Línea Media</p>
              <p className="text-lg font-semibold text-foreground">{metrics?.midline.mm.toFixed(1)}mm - {metrics?.midline.side}</p>
            </div>
            <div className="bg-primary/5 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Corredor Bucal</p>
              <p className="text-lg font-semibold text-foreground">{metrics ? Math.round(metrics.buccalRatio * 100) : 0}%</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-primary/10 rounded-2xl border border-primary/20 p-8 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              🎉 ¡El Siguiente Paso es Tuyo!
            </h2>
            <p className="text-muted-foreground">
              Agenda tu consulta gratuita y comienza tu transformación hoy
            </p>
          </div>

          {/* Buttons */}
          <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <Button
              size="lg"
              onClick={handleWhatsApp}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Agendar por WhatsApp
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => window.open("https://calendly.com", "_blank")}
              className="w-full"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Agendar Cita Online
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              ✓ Consulta inicial gratis • ✓ Sin compromiso • ✓ Plan personalizado
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            onClick={handleRestart}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Hacer Nuevo Análisis
          </Button>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-sm font-medium text-foreground mb-1">
            Desarrollado por <span className="text-primary font-semibold">Clínica Miró</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Equipo liderado por Dr. Carlos Montoya
          </p>
        </footer>
      </div>
    </div>
  );
}

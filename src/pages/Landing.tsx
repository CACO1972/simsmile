import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useSmileAnalysis } from "@/contexts/SmileAnalysisContext";

export default function Landing() {
  const navigate = useNavigate();
  const { resetAnalysis } = useSmileAnalysis();

  const handleStart = () => {
    resetAnalysis();
    navigate("/instrucciones");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
              <span className="text-primary font-semibold text-sm">🤖 POWERED BY AI</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
              Transforma tu <span className="text-primary">Sonrisa</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Análisis dental avanzado con Inteligencia Artificial
            </p>
          </header>

          {/* Hero Image/Animation Area */}
          <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl overflow-hidden mb-12 border border-primary/20">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4 p-8">
                <div className="w-32 h-32 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <svg className="w-16 h-16 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-foreground">
                  Descubre tu Sonrisa Ideal
                </h3>
                <p className="text-muted-foreground max-w-md">
                  Nuestro sistema de IA analiza más de 15 parámetros dentales y faciales para crear una simulación personalizada de tu sonrisa perfecta
                </p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-card p-6 rounded-2xl border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Análisis Instantáneo</h3>
              <p className="text-sm text-muted-foreground">Toma dos fotos y obtén un análisis completo en segundos</p>
            </div>

            <div className="bg-card p-6 rounded-2xl border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-2">IA Avanzada</h3>
              <p className="text-sm text-muted-foreground">Tecnología de detección facial de última generación</p>
            </div>

            <div className="bg-card p-6 rounded-2xl border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Simulación Realista</h3>
              <p className="text-sm text-muted-foreground">Visualiza tu sonrisa transformada de forma natural</p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button 
              size="lg" 
              className="text-lg px-12 py-6 h-auto"
              onClick={handleStart}
            >
              Comenzar Análisis Gratuito
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              ✓ Sin registro • ✓ 100% gratis • ✓ Resultados en 2 minutos
            </p>
          </div>

          {/* Footer */}
          <footer className="mt-16 pt-8 border-t border-border text-center">
            <p className="text-sm font-medium text-foreground mb-1">
              Desarrollado por <span className="text-primary font-semibold">Clínica Miró</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Equipo liderado por Dr. Carlos Montoya
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-3">
              🔒 Prohibida su reproducción - Protegido por propiedad intelectual
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}

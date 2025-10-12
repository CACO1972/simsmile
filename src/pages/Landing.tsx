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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 lg:py-16">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <header className="text-center mb-12 lg:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6 border border-primary/20">
              <span className="text-primary font-display font-bold text-sm tracking-wide">🤖 POWERED BY AI</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-black text-foreground mb-6 leading-tight">
              Tu nueva sonrisa<br />
              <span className="text-primary">en segundos</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Descubre cómo luciría tu sonrisa perfecta con análisis dental impulsado por IA
            </p>
          </header>

          {/* Hero Visual */}
          <div className="relative mb-16 lg:mb-20">
            <div className="aspect-video bg-gradient-to-br from-accent/30 via-primary/20 to-accent/30 rounded-3xl overflow-hidden border-2 border-primary/20 shadow-2xl">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-6 p-8">
                  <div className="w-40 h-40 mx-auto bg-primary/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-primary/30">
                    <svg className="w-20 h-20 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-3xl font-display font-bold text-foreground">
                      Tecnología IA Dental Avanzada
                    </h3>
                    <p className="text-muted-foreground max-w-lg mx-auto text-lg">
                      Análisis facial completo en tiempo real con más de 15 parámetros dentales
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Principal */}
          <div className="text-center mb-20">
            <Button 
              size="lg" 
              className="text-xl px-16 py-8 h-auto font-display font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
              onClick={handleStart}
            >
              Iniciar Simulación Gratis
              <svg className="w-6 h-6 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                100% Gratis
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Sin Registro
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                2 Minutos
              </span>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <div className="bg-card p-8 rounded-3xl border-2 border-border hover:border-primary/50 transition-all hover:shadow-lg">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
              </div>
              <h3 className="font-display font-bold text-foreground mb-3 text-xl">Análisis Instantáneo</h3>
              <p className="text-muted-foreground">Toma dos fotos simples y obtén resultados profesionales al instante</p>
            </div>

            <div className="bg-card p-8 rounded-3xl border-2 border-border hover:border-primary/50 transition-all hover:shadow-lg">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="font-display font-bold text-foreground mb-3 text-xl">Inteligencia Artificial</h3>
              <p className="text-muted-foreground">Tecnología de detección facial y análisis dental de última generación</p>
            </div>

            <div className="bg-card p-8 rounded-3xl border-2 border-border hover:border-primary/50 transition-all hover:shadow-lg">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="font-display font-bold text-foreground mb-3 text-xl">Visualización Realista</h3>
              <p className="text-muted-foreground">Ve tu transformación dental con simulaciones hiperrealistas</p>
            </div>
          </div>

          {/* Legal Notice */}
          <div className="bg-accent/20 p-6 rounded-2xl border border-accent/40 max-w-3xl mx-auto mb-12">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-primary flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <div>
                <p className="text-sm text-foreground leading-relaxed">
                  <strong className="font-display">Nota importante:</strong> Esta simulación no reemplaza un diagnóstico odontológico profesional. Es una herramienta orientativa que te ayuda a visualizar posibles resultados.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="text-center pt-12 border-t border-border">
            <p className="text-sm font-display font-bold text-foreground mb-1">
              Desarrollado por <span className="text-primary">Clínica Miró</span>
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              Equipo liderado por Dr. Carlos Montoya
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              🔒 Protegido por propiedad intelectual - Prohibida su reproducción
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}

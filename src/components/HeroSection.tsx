import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Camera, Brain, Wand2, FileText } from "lucide-react";
import logoSimSmile from "@/assets/simsmile-logo-transparent.png";
import { SmileTransformationAnimation } from "@/components/SmileTransformationAnimation";
import logoAnimation from "@/assets/simsmile-logo-animation.mp4";

interface HeroSectionProps {
  onStart: () => void;
}

export const HeroSection = ({ onStart }: HeroSectionProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 py-8 md:py-16 relative overflow-hidden bg-background">
      
      {/* Animated gradient background with glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-secondary/15 rounded-full blur-[140px]" />
      </div>

      {/* Navigation bar */}
      <nav className="w-full max-w-7xl mb-12 z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img 
            src={logoSimSmile} 
            alt="SimSmile" 
            className="w-32 md:w-40 animate-fade-in"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-primary/30 hover:bg-primary/10 text-foreground"
          onClick={onStart}
        >
          Empezar
        </Button>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-col lg:grid lg:grid-cols-2 items-center gap-12 md:gap-16 text-center lg:text-left z-10 max-w-7xl w-full mb-20">
        
        {/* Left side - 3D Visual Element */}
        <div className="relative w-full max-w-lg lg:max-w-none flex items-center justify-center min-h-[400px] md:min-h-[500px] order-2 lg:order-1">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 rounded-full blur-3xl" />
          <SmileTransformationAnimation />
        </div>

        {/* Right side - Text content */}
        <div className="flex flex-col items-center lg:items-start justify-center space-y-6 order-1 lg:order-2">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            100% GRATIS | SIMULACIÓN | TECNOLOGÍA
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-foreground leading-tight tracking-tight">
            Simulador{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Profesional
            </span>
            <br />
            de Sonrisa con IA
          </h1>
          
          <p className="text-base md:text-lg text-muted-foreground font-normal max-w-xl leading-relaxed">
            <span className="font-semibold text-primary">100% Gratis.</span> Tecnología de IA profesional para simular tu sonrisa perfecta + análisis facial estético completo. Visualiza tu transformación dental con precisión avanzada antes de cualquier tratamiento.
          </p>

          {/* Process Flow - Professional Version */}
          <div className="w-full max-w-2xl mt-8">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-8 text-center lg:text-left">
              Cómo Funciona
            </h3>
            
            <div className="grid grid-cols-4 gap-2 md:gap-4 mb-10">
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-3 md:p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white mb-2 md:mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300 mx-auto">
                    <Camera className="w-5 h-5 md:w-7 md:h-7" />
                  </div>
                  <p className="text-xs md:text-sm font-semibold text-foreground text-center">Captura</p>
                  <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1 text-center">Tu foto</p>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-3 md:p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white mb-2 md:mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300 mx-auto">
                    <Brain className="w-5 h-5 md:w-7 md:h-7" />
                  </div>
                  <p className="text-xs md:text-sm font-semibold text-foreground text-center">Análisis IA</p>
                  <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1 text-center">Evaluación</p>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-3 md:p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white mb-2 md:mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300 mx-auto">
                    <Wand2 className="w-5 h-5 md:w-7 md:h-7" />
                  </div>
                  <p className="text-xs md:text-sm font-semibold text-foreground text-center">Simulación</p>
                  <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1 text-center">Transformación</p>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-3 md:p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white mb-2 md:mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300 mx-auto">
                    <FileText className="w-5 h-5 md:w-7 md:h-7" />
                  </div>
                  <p className="text-xs md:text-sm font-semibold text-foreground text-center">Reporte</p>
                  <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1 text-center">Resultados</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center lg:justify-start">
              <Button
                size="lg"
                onClick={onStart}
                className="group relative bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] hover:bg-[position:100%_0] text-white font-semibold rounded-2xl px-10 py-7 text-lg transition-all duration-500 hover:scale-[1.02] shadow-[0_8px_30px_rgb(168,85,247,0.3)] hover:shadow-[0_12px_40px_rgb(168,85,247,0.5)] border border-white/10"
              >
                <span className="relative z-10 flex items-center gap-3">
                  Empezar Ahora
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Technology Section */}
      <div className="w-full max-w-7xl z-10 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          <div>
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Tecnología{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Que Impulsa
              </span>
              <br />
              Resultados
            </h2>
          </div>

          <div className="flex flex-col gap-6">
            {/* Card 1 */}
            <div className="group relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 hover:border-primary/50 transition-all overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-bl-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
                  40%
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Custom Software Development
                </h3>
                <p className="text-sm text-muted-foreground">
                  Soluciones personalizadas de software que se adaptan perfectamente a tus necesidades específicas.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 hover:border-primary/50 transition-all overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent/20 to-secondary/20 rounded-bl-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center justify-between">
                <div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
                    5.5x
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Data Analytics & Business Intelligence
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Análisis avanzado de datos para decisiones más informadas.
                  </p>
                </div>
                <div className="hidden lg:block w-32 h-32 bg-gradient-to-br from-primary/30 to-accent/30 rounded-3xl" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA Section */}
      <div className="w-full max-w-7xl z-10 mb-12">
        <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px]" />
          
          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                El Futuro{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  de tu Sonrisa
                </span>
                <br />
                Hoy Mismo
              </h2>
              <p className="text-muted-foreground mb-6">
                Transforma tu sonrisa con la tecnología más avanzada del mercado. Resultados instantáneos y precisos.
              </p>
              <Button
                size="lg"
                onClick={onStart}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-semibold rounded-full px-8"
              >
                Comenzar
                <Sparkles className="ml-2 h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex items-center justify-center">
              <div className="relative w-64 h-64 rounded-[3rem] overflow-hidden transform hover:scale-105 transition-transform duration-500 shadow-2xl shadow-primary/30">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                >
                  <source src={logoAnimation} type="video/mp4" />
                </video>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clínica Miró Badge */}
      <div className="text-center text-xs text-muted-foreground/50 z-10">
        Desarrollado por Clínica Miró
      </div>
    </div>
  );
};

import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Camera, Brain, Wand2, FileText } from "lucide-react";
import logoSimSmileBy from "@/assets/simsmile-by-logo.png";
import { SmileTransformationAnimation } from "@/components/SmileTransformationAnimation";
import logoAnimation from "@/assets/simsmile-logo-animation.mp4";

interface HeroSectionProps {
  onStart: () => void;
}

export const HeroSection = ({ onStart }: HeroSectionProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 py-6 md:py-12 relative overflow-hidden bg-background">
      
      {/* Animated gradient background with glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-secondary/15 rounded-full blur-[140px]" />
      </div>

      {/* Logo principal SimSmile By */}
      <nav className="w-full max-w-7xl mb-6 md:mb-8 z-10 flex flex-col items-center justify-center">
        <img 
          src={logoSimSmileBy} 
          alt="SimSmile By" 
          className="w-64 sm:w-80 md:w-96 lg:w-[420px] animate-fade-in"
          width="500"
          height="500"
        />
      </nav>

      {/* Hero Section */}
      <div className="flex flex-col lg:grid lg:grid-cols-2 items-center gap-6 md:gap-8 lg:gap-12 text-center lg:text-left z-10 max-w-7xl w-full mb-10 md:mb-16">
        
        {/* Left side - 3D Visual Element */}
        <div className="relative w-full max-w-lg lg:max-w-none flex items-center justify-center min-h-[250px] sm:min-h-[350px] md:min-h-[500px] order-2 lg:order-1">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 rounded-full blur-3xl" />
          <SmileTransformationAnimation />
        </div>

        {/* Right side - Text content */}
        <div className="flex flex-col items-center lg:items-start justify-center space-y-3 md:space-y-5 order-1 lg:order-2">
          
          <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-primary/10 border border-primary/20 text-xs md:text-sm text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            100% GRATIS | SIMULACIÓN | TECNOLOGÍA
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold text-foreground leading-tight tracking-tight px-2">
            Simulador{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Profesional
            </span>
            <br />
            de Sonrisa con IA
          </h1>
          
          <p className="text-sm md:text-base lg:text-lg text-muted-foreground font-normal max-w-xl leading-relaxed px-4">
            <span className="font-semibold text-primary">100% Gratis.</span> Tecnología de IA profesional para simular tu sonrisa perfecta + análisis facial estético completo. Visualiza tu transformación dental con precisión avanzada antes de cualquier tratamiento.
          </p>

          {/* Process Flow - Professional Version */}
          <div className="w-full max-w-2xl mt-6 md:mt-10 px-2">
            <h3 className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 md:mb-8 text-center lg:text-left">
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

            <div className="flex justify-center lg:justify-start mt-4 md:mt-0">
              <Button
                size="lg"
                onClick={onStart}
                className="group relative bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] hover:bg-[position:100%_0] text-white font-semibold rounded-2xl px-6 md:px-10 py-5 md:py-7 text-base md:text-lg transition-all duration-500 hover:scale-[1.02] shadow-[0_8px_30px_rgb(168,85,247,0.3)] hover:shadow-[0_12px_40px_rgb(168,85,247,0.5)] border border-white/10"
              >
                <span className="relative z-10 flex items-center gap-2 md:gap-3">
                  Empezar Ahora
                  <ArrowRight className="h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Stories & Testimonials Section */}
      <div className="w-full max-w-7xl z-10 mb-16 md:mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          <div>
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Casos de{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Éxito Reales
              </span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Miles de personas ya han transformado su sonrisa con nuestra tecnología de Inteligencia Artificial desarrollada en Chile por <span className="font-bold text-foreground">HumanaIA.cl</span> en colaboración con <span className="font-bold text-foreground">Clínica Miró</span>. SimSmile cuenta con <span className="font-bold text-foreground">Registro de Propiedad Intelectual</span> y patente pending en USA.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {/* Testimonial 1 */}
            <div className="group relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 hover:border-primary/50 transition-all overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-bl-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg">
                    MC
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">María C.</h3>
                    <p className="text-sm text-muted-foreground">Paciente Clínica Miró</p>
                  </div>
                </div>
                <p className="text-foreground/80 mb-3">
                  "Ver mi sonrisa simulada antes del tratamiento me dio total confianza. El resultado final fue exactamente como la simulación."
                </p>
                <div className="flex items-center gap-2 text-accent">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm font-medium">Tratamiento: Diseño de Sonrisa Digital</span>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="group relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 hover:border-primary/50 transition-all overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent/20 to-secondary/20 rounded-bl-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-secondary flex items-center justify-center text-white font-bold text-lg">
                    JR
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Jorge R.</h3>
                    <p className="text-sm text-muted-foreground">Paciente Clínica Miró</p>
                  </div>
                </div>
                <p className="text-foreground/80 mb-3">
                  "El análisis facial con IA me ayudó a entender qué necesitaba realmente. Los doctores usaron la simulación para explicarme todo paso a paso."
                </p>
                <div className="flex items-center gap-2 text-accent">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm font-medium">Tratamiento: Ortodoncia + Blanqueamiento</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA Section */}
      <div className="w-full max-w-7xl z-10 mb-16 md:mb-20">
        <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px]" />
          
          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                Visualiza tu{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Sonrisa Perfecta
                </span>
                <br />
                Antes del Tratamiento
              </h2>
              <p className="text-muted-foreground mb-6">
                Nuestra tecnología de IA te permite <span className="font-semibold text-foreground">previsualizar tu sonrisa transformada antes de iniciar cualquier tratamiento dental</span>. Toma decisiones informadas con confianza y visualiza tu resultado final desde el primer día.
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
      <div className="text-center z-10 space-y-4">
        <div className="text-base font-medium text-foreground/80">
          Desarrollado por Clínica Miró
        </div>
        <div className="text-xs text-muted-foreground max-w-3xl mx-auto px-4">
          <p className="mb-2 font-semibold">Disclaimer:</p>
          <p>
            Las simulaciones generadas por SimSmile son representaciones visuales aproximadas con fines informativos y educativos. Los resultados reales pueden variar según la condición dental individual, el tipo de tratamiento y otros factores clínicos. Esta herramienta no constituye un diagnóstico médico ni reemplaza la consulta profesional con un odontólogo certificado. Siempre consulte con un profesional de la salud dental antes de tomar decisiones sobre tratamientos dentales.
          </p>
        </div>
      </div>
    </div>
  );
};

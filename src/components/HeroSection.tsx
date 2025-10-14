import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import logoSimSmile from "@/assets/simsmile-logo-transparent.png";
import { SmileTransformationAnimation } from "@/components/SmileTransformationAnimation";


interface HeroSectionProps {
  onStart: () => void;
}

export const HeroSection = ({ onStart }: HeroSectionProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 pt-8 md:pt-12 relative overflow-hidden bg-background">
      
      {/* Animated gradient background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-accent/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-secondary/10 rounded-full blur-[140px]" />
      </div>

      {/* Logo oficial */}
      <div className="w-full max-w-6xl mb-4 md:mb-6 z-10 flex flex-col items-center gap-3">
        <img 
          src={logoSimSmile} 
          alt="SimSmile" 
          className="w-64 md:w-80 lg:w-96 animate-fade-in"
        />
        <p className="text-base md:text-lg text-muted-foreground font-medium tracking-wide">
          Desarrollado por Clínica Miró
        </p>
      </div>

      {/* Main content grid */}
      <div className="flex flex-col lg:grid lg:grid-cols-2 items-center gap-8 md:gap-12 text-center lg:text-left z-10 max-w-7xl w-full mb-12">
        
        {/* Left side - Text content */}
        <div className="flex flex-col items-center lg:items-start justify-center space-y-8 md:space-y-12">
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight tracking-tight">
            Visualiza tu
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Sonrisa Perfecta
            </span>
          </h1>
          
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground font-normal max-w-xl leading-relaxed">
            Descubre cómo podrías lucir con una sonrisa perfecta. Nuestra tecnología de simulación avanzada te permite ver tu transformación antes de comenzar cualquier tratamiento.
          </p>

          <div className="flex flex-col items-center lg:items-start gap-3 mt-4">
            <div className="flex items-center gap-4 text-sm md:text-base text-muted-foreground">
              <span className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                <Sparkles className="h-4 w-4 text-primary" />
                100% Gratis
              </span>
              <span className="flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full border border-accent/20">
                📸 Solo una selfie
              </span>
            </div>
          </div>

          <Button
            size="lg"
            onClick={onStart}
            className="text-base md:text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-all hover:scale-105 shadow-lg shadow-primary/50 hover:shadow-primary/70 mt-6"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Empezar Ahora
          </Button>
        </div>

        {/* Right side - Smile Transformation Video */}
        <div className="relative w-full max-w-lg lg:max-w-none flex items-center justify-center min-h-[400px] md:min-h-[500px]">
          <SmileTransformationAnimation />
        </div>
      </div>

      {/* Bottom section with value props */}
      <div className="w-full max-w-6xl z-10 mb-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Tecnología Avanzada de
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Simulación Dental
            </span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
            Utilizamos inteligencia artificial avanzada para crear simulaciones precisas de tu sonrisa ideal. 
            Visualiza tu transformación de forma instantánea y realista.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 text-center hover:border-primary/50 transition-all hover:scale-105">
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              95%+
            </div>
            <div className="text-xs md:text-sm text-muted-foreground uppercase tracking-wide">
              Precisión
            </div>
          </div>
          
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 text-center hover:border-primary/50 transition-all hover:scale-105">
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              Instantáneo
            </div>
            <div className="text-xs md:text-sm text-muted-foreground uppercase tracking-wide">
              Resultados
            </div>
          </div>
          
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 text-center hover:border-primary/50 transition-all hover:scale-105">
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              100%
            </div>
            <div className="text-xs md:text-sm text-muted-foreground uppercase tracking-wide">
              Seguro
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

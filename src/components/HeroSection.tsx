import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import logoMain from "@/assets/clinica-miro-logo-white.png";


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

      {/* Logo at top - larger and centered */}
      <div className="w-full max-w-6xl mb-12 md:mb-16 z-10 flex justify-center">
        <img 
          src={logoMain} 
          alt="Clínica Miró" 
          className="w-80 md:w-96 lg:w-[500px] animate-fade-in"
        />
      </div>

      {/* Main content grid */}
      <div className="flex flex-col lg:grid lg:grid-cols-2 items-center gap-8 md:gap-12 text-center lg:text-left z-10 max-w-7xl w-full mb-12">
        
        {/* Left side - Text content */}
        <div className="flex flex-col items-center lg:items-start justify-center space-y-6 md:space-y-8">
          
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

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-8">
            <Button
              size="lg"
              onClick={onStart}
              className="text-base md:text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-all hover:scale-105 shadow-lg shadow-primary/50 hover:shadow-primary/70"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Empezar Ahora
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base md:text-lg px-8 py-6 border-border hover:bg-card/50 text-foreground font-medium rounded-lg transition-all"
            >
              Contáctanos
            </Button>
          </div>
        </div>

        {/* Right side - Visual accent */}
        <div className="relative w-full max-w-lg lg:max-w-none flex items-center justify-center">
          <div className="relative w-80 h-80 md:w-96 md:h-96">
            {/* Animated gradient orbs */}
            <div className="absolute inset-0 bg-primary/30 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute top-1/4 right-1/4 w-40 h-40 bg-accent/40 blur-[80px] rounded-full" />
            <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-secondary/30 blur-[90px] rounded-full animate-pulse" />
          </div>
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

      <p className="text-xs md:text-sm text-muted-foreground/40 font-light italic z-10 mb-8">
        Powered by Clínica Miró
      </p>
    </div>
  );
};

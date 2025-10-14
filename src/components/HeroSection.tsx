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
      <div className="w-full max-w-6xl mb-12 md:mb-16 z-10 flex flex-col items-center gap-4">
        <img 
          src={logoSimSmile} 
          alt="SimSmile" 
          className="w-72 md:w-96 lg:w-[28rem] animate-fade-in drop-shadow-2xl"
        />
        <div className="flex flex-col items-center gap-1">
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground font-medium tracking-wide">
            Desarrollado por
          </p>
          <p className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-fade-in">
            Clínica Miró
          </p>
        </div>
      </div>

      {/* Main content grid */}
      <div className="flex flex-col lg:grid lg:grid-cols-2 items-center gap-12 md:gap-16 text-center lg:text-left z-10 max-w-7xl w-full mb-16">
        
        {/* Left side - Text content */}
        <div className="flex flex-col items-center lg:items-start justify-center space-y-10 md:space-y-14">
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-foreground leading-[1.1] tracking-tight animate-fade-in">
            Visualiza tu
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent drop-shadow-lg animate-[fade-in_0.8s_ease-out]">
              Sonrisa Perfecta
            </span>
          </h1>
          
          <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground font-normal max-w-xl leading-relaxed animate-[fade-in_0.6s_ease-out_0.2s_both]">
            Descubre cómo podrías lucir con una sonrisa perfecta. Nuestra tecnología de simulación avanzada te permite ver tu transformación antes de comenzar cualquier tratamiento.
          </p>

          <div className="flex flex-col items-center lg:items-start gap-4 mt-2 animate-[fade-in_0.6s_ease-out_0.4s_both]">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-base md:text-lg">
              <span className="flex items-center gap-2 bg-primary/15 px-5 py-3 rounded-full border-2 border-primary/30 backdrop-blur-sm hover:scale-105 transition-transform">
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                <span className="font-semibold">100% Gratis</span>
              </span>
              <span className="flex items-center gap-2 bg-accent/15 px-5 py-3 rounded-full border-2 border-accent/30 backdrop-blur-sm hover:scale-105 transition-transform">
                <span className="text-2xl">📸</span>
                <span className="font-semibold">Solo una selfie</span>
              </span>
            </div>
          </div>

          <Button
            size="lg"
            onClick={onStart}
            className="text-lg md:text-xl px-10 py-7 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-bold rounded-xl transition-all hover:scale-110 shadow-2xl shadow-primary/60 hover:shadow-primary/80 mt-8 animate-[fade-in_0.6s_ease-out_0.6s_both] border-2 border-primary/20"
          >
            <Sparkles className="mr-3 h-6 w-6 animate-pulse" />
            Empezar Ahora
          </Button>
        </div>

        {/* Right side - Smile Transformation Video */}
        <div className="relative w-full max-w-lg lg:max-w-none flex items-center justify-center min-h-[450px] md:min-h-[550px] animate-[fade-in_0.8s_ease-out_0.3s_both]">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-3xl animate-pulse" />
          <SmileTransformationAnimation />
        </div>
      </div>

      {/* Bottom section with value props */}
      <div className="w-full max-w-6xl z-10 mb-16 animate-[fade-in_0.8s_ease-out_0.8s_both]">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 leading-tight">
            Tecnología Avanzada de
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent drop-shadow-lg">
              Simulación Dental
            </span>
          </h2>
          <p className="text-muted-foreground text-base md:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
            Utilizamos inteligencia artificial avanzada para crear simulaciones precisas de tu sonrisa ideal. 
            Visualiza tu transformación de forma instantánea y realista.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
          <div className="bg-gradient-to-br from-card/80 to-card/50 backdrop-blur-md border-2 border-primary/30 rounded-2xl p-8 text-center hover:border-primary/60 transition-all hover:scale-110 hover:shadow-2xl hover:shadow-primary/30 group">
            <div className="text-4xl md:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform">
              95%+
            </div>
            <div className="text-sm md:text-base lg:text-lg text-muted-foreground uppercase tracking-wider font-semibold">
              Precisión
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-card/80 to-card/50 backdrop-blur-md border-2 border-accent/30 rounded-2xl p-8 text-center hover:border-accent/60 transition-all hover:scale-110 hover:shadow-2xl hover:shadow-accent/30 group">
            <div className="text-4xl md:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform">
              Instantáneo
            </div>
            <div className="text-sm md:text-base lg:text-lg text-muted-foreground uppercase tracking-wider font-semibold">
              Resultados
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-card/80 to-card/50 backdrop-blur-md border-2 border-secondary/30 rounded-2xl p-8 text-center hover:border-secondary/60 transition-all hover:scale-110 hover:shadow-2xl hover:shadow-secondary/30 group">
            <div className="text-4xl md:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform">
              100%
            </div>
            <div className="text-sm md:text-base lg:text-lg text-muted-foreground uppercase tracking-wider font-semibold">
              Seguro
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

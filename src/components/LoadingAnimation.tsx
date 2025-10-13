import { Logo } from "./Logo";
import { OrbitalAnimation } from "./OrbitalAnimation";

export const LoadingAnimation = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="w-full mb-6 md:mb-0 md:absolute md:top-8 md:left-8 flex justify-center md:justify-start">
        <Logo size="md" className="opacity-50" />
      </div>

      {/* Orbital circles animation with connecting lines */}
      <div className="relative mt-4 md:mt-0">
        <OrbitalAnimation size="large" />
        
        {/* Center logo */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 3 }}>
          <Logo size="xl" />
        </div>
      </div>

      <div className="mt-8 md:mt-12 text-center">
        <h2 className="text-xl md:text-2xl font-heading font-bold mb-2">
          Analizando tu Sonrisa
        </h2>
        <p className="text-sm md:text-base text-muted-foreground">
          Nuestro sistema de IA está procesando tus imágenes...
        </p>
      </div>
    </div>
  );
};

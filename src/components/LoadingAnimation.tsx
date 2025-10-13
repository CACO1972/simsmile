import { Logo } from "./Logo";
import { OrbitalAnimation } from "./OrbitalAnimation";

export const LoadingAnimation = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-8 left-8">
        <Logo size="md" className="opacity-50" />
      </div>

      {/* Orbital circles animation with connecting lines */}
      <div className="relative">
        <OrbitalAnimation size="large" />
        
        {/* Center logo */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 3 }}>
          <Logo size="xl" />
        </div>
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-2xl font-heading font-bold mb-2">
          Analizando tu Sonrisa
        </h2>
        <p className="text-muted-foreground">
          Nuestro sistema de IA está procesando tus imágenes...
        </p>
      </div>
    </div>
  );
};

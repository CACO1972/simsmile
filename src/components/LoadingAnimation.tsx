import { Logo } from "./Logo";

export const LoadingAnimation = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-8 left-8">
        <Logo size="sm" className="opacity-50" />
      </div>

      {/* Orbital circles animation */}
      <div className="relative">
        <div className="w-64 h-64 relative">
          {/* Center logo */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Logo size="lg" />
          </div>

          {/* Orbiting circles */}
          <div className="absolute inset-0 animate-[spin_3s_linear_infinite]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gold" />
          </div>
          <div className="absolute inset-4 animate-[spin_4s_linear_infinite_reverse]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-lavender" />
          </div>
          <div className="absolute inset-8 animate-[spin_5s_linear_infinite]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary" />
          </div>
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

import { Logo } from "./Logo";

export const LoadingAnimation = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-8 left-8">
        <Logo size="md" className="opacity-50" />
      </div>

      {/* Orbital circles animation */}
      <div className="relative">
        <div className="w-80 h-80 relative">
          {/* Center logo */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Logo size="xl" />
          </div>

          {/* Orbiting circles with SimSmile colors and glow */}
          <div className="absolute inset-0 animate-[spin_3s_linear_infinite]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[#3DD6B4] shadow-[0_0_20px_rgba(61,214,180,0.8)] animate-pulse" />
          </div>
          <div className="absolute inset-4 animate-[spin_4s_linear_infinite_reverse]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[#FDB913] shadow-[0_0_20px_rgba(253,185,19,0.8)] animate-pulse" />
          </div>
          <div className="absolute inset-8 animate-[spin_5s_linear_infinite]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[#E91E84] shadow-[0_0_20px_rgba(233,30,132,0.8)] animate-pulse" />
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

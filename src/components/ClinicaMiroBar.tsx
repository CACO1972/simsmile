import miroLogo from "@/assets/clinica-miro-logo.png";

export const ClinicaMiroBar = () => (
  <div className="sticky top-0 z-50 w-full bg-background/85 backdrop-blur-md border-b border-border/50">
    <div className="max-w-5xl mx-auto px-4 py-1.5 flex items-center justify-center gap-2">
      <span className="text-[10px] sm:text-xs uppercase tracking-[0.18em] text-muted-foreground font-medium">
        Desarrollo exclusivo de
      </span>
      <img
        src={miroLogo}
        alt="Clínica Miró"
        className="h-5 sm:h-6 w-auto object-contain"
        loading="eager"
      />
    </div>
  </div>
);

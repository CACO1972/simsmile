import miroLogo from "@/assets/clinica-miro-logo.png";

export const ClinicaMiroBar = () => (
  <div className="sticky top-0 z-50 w-full bg-background/85 backdrop-blur-md border-b border-border/50">
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-0">
      <span className="text-[10px] sm:text-xs uppercase tracking-[0.18em] text-muted-foreground font-medium whitespace-nowrap">
        Desarrollo exclusivo de
      </span>
      <img
        src={miroLogo}
        alt="Clínica Miró"
        className="h-10 sm:h-12 md:h-14 w-auto max-w-[55%] object-contain shrink-0"
        loading="eager"
        decoding="async"
      />
    </div>
  </div>
);

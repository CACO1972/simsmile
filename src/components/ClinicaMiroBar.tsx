import miroLogo from "@/assets/clinica-miro-logo.png";

export const ClinicaMiroBar = () => (
  <div className="sticky top-0 z-50 w-full bg-background/85 backdrop-blur-md border-b border-border/50">
    <div className="mx-auto flex h-16 max-w-5xl items-center justify-center gap-3 px-4 py-2">
      <span className="text-[10px] sm:text-xs uppercase tracking-[0.18em] text-muted-foreground font-medium whitespace-nowrap">
        Desarrollo exclusivo de
      </span>
      <div className="flex h-full items-center justify-center overflow-hidden">
        <img
          src={miroLogo}
          alt="Clínica Miró"
          className="h-full w-auto max-h-full object-contain scale-[2.2] origin-center"
          loading="eager"
          decoding="async"
        />
      </div>
    </div>
  </div>
);

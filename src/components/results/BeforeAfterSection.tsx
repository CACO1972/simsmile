import { ImageComparison } from "@/components/ia-lab/ImageComparison";

interface BeforeAfterSectionProps {
  beforeImage: string;
  afterImage: string;
}

export function BeforeAfterSection({ beforeImage, afterImage }: BeforeAfterSectionProps) {
  return (
    <section className="mb-16">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-5 py-2 bg-green-500/10 border-2 border-green-500/30 rounded-full mb-6">
          <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-green-700 dark:text-green-300 font-display font-bold text-sm tracking-wide">ANÁLISIS COMPLETADO</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-display font-black text-foreground mb-4">
          Tu <span className="text-primary">Transformación</span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Compara tu sonrisa actual con el resultado simulado
        </p>
      </div>

      <ImageComparison 
        beforeImage={beforeImage}
        afterImage={afterImage}
      />
    </section>
  );
}

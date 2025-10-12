interface AnalysisSectionProps {
  metrics: any;
  smileImage: string;
}

export function AnalysisSection({ metrics, smileImage }: AnalysisSectionProps) {
  return (
    <section className="mb-16">
      <div className="text-center mb-10">
        <h2 className="text-4xl md:text-5xl font-display font-black text-foreground mb-4">
          Análisis <span className="text-primary">Detallado</span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Parámetros faciales y proporciones analizadas
        </p>
      </div>

      {/* Image with overlays */}
      <div className="bg-card rounded-3xl border-2 border-border p-6 mb-8 shadow-xl">
        <div className="aspect-video bg-muted rounded-2xl overflow-hidden mb-6 relative">
          <img src={smileImage} alt="Análisis facial" className="w-full h-full object-cover" />
          {/* Overlays simulados - aquí irían tus overlays reales */}
          <div className="absolute inset-0 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <line x1="50" y1="20" x2="50" y2="80" stroke="hsl(var(--primary))" strokeWidth="0.5" strokeDasharray="2,2" />
              <line x1="30" y1="50" x2="70" y2="50" stroke="hsl(var(--accent))" strokeWidth="0.5" strokeDasharray="2,2" />
            </svg>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-6 rounded-2xl border-2 border-primary/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">😊</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1 font-display font-bold uppercase tracking-wide">Arco de Sonrisa</p>
                <p className="text-2xl font-display font-black text-foreground capitalize mb-2">{metrics?.smileArc || "N/A"}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Mide la curvatura de los bordes de tus dientes superiores. Un arco ideal sigue la curvatura del labio inferior.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-6 rounded-2xl border-2 border-primary/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">👄</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1 font-display font-bold uppercase tracking-wide">Exposición Gingival</p>
                <p className="text-2xl font-display font-black text-foreground mb-2">{metrics?.gingival.mm.toFixed(1)}mm</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Cantidad de encía visible al sonreír. Lo ideal es mostrar 2-3mm de encía para una sonrisa armoniosa.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-6 rounded-2xl border-2 border-primary/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">📏</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1 font-display font-bold uppercase tracking-wide">Línea Media Dental</p>
                <p className="text-2xl font-display font-black text-foreground mb-2">{metrics?.midline.mm.toFixed(1)}mm</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Alineación entre el centro de tus dientes y el centro de tu rostro. Menos de 2mm es imperceptible.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-6 rounded-2xl border-2 border-primary/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">↔️</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1 font-display font-bold uppercase tracking-wide">Corredor Bucal</p>
                <p className="text-2xl font-display font-black text-foreground mb-2">{metrics ? Math.round(metrics.buccalRatio * 100) : 0}%</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Espacio entre los dientes y las comisuras de la boca. Influye en la amplitud y naturalidad de tu sonrisa.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

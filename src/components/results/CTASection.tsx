import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";

interface CTASectionProps {
  contactData: any;
  onWhatsApp: () => void;
  onShare: () => void;
  onRestart: () => void;
}

export function CTASection({ contactData, onWhatsApp, onShare, onRestart }: CTASectionProps) {
  return (
    <>
      {/* Share Button */}
      <section className="mb-16">
        <div className="flex justify-center">
          <Button
            size="lg"
            variant="outline"
            onClick={onShare}
            className="font-display font-bold border-2 rounded-2xl px-10 py-7 text-lg shadow-lg hover:shadow-xl transition-all"
          >
            <Share2 className="w-5 h-5 mr-2" />
            Compartir en Redes Sociales
          </Button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mb-16">
        <div className="bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20 rounded-3xl border-2 border-primary/30 p-10 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-display font-black text-foreground mb-4">
              🎉 ¡Da el Siguiente Paso!
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Agenda tu consulta <strong className="text-foreground">100% gratuita</strong> y transforma tu sonrisa con un plan personalizado
            </p>
          </div>

          {/* Buttons */}
          <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto mb-8">
            <Button
              size="lg"
              onClick={onWhatsApp}
              className="w-full py-7 text-lg font-display font-bold rounded-2xl bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all"
            >
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Agendar por WhatsApp
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => window.open("https://calendly.com", "_blank")}
              className="w-full py-7 text-lg font-display font-bold rounded-2xl border-2 shadow-lg hover:shadow-xl transition-all"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Agendar Online
            </Button>
          </div>

          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Consulta gratis
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Sin compromiso
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Plan personalizado
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Restart Button */}
      <section className="mb-12">
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={onRestart}
            className="font-display font-bold border-2 rounded-xl px-8 py-6"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Hacer Nuevo Análisis
          </Button>
        </div>
      </section>
    </>
  );
}

import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import faceFrame from "@/assets/face-frame.png";

export default function Instructions() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Paso 1 de 6</span>
            <span className="text-sm font-medium text-primary">16%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-primary h-2 rounded-full transition-all" style={{ width: '16%' }} />
          </div>
        </div>

        {/* Content */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-lg">
          <div className="bg-primary/10 p-6 border-b border-border">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              📸 Preparación para las Fotos
            </h1>
            <p className="text-muted-foreground">
              Sigue estas indicaciones para obtener los mejores resultados
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Imagen de ejemplo */}
            <div className="relative aspect-[3/4] bg-muted rounded-lg overflow-hidden">
              <img 
                src={faceFrame}
                alt="Ejemplo de posición correcta"
                className="w-full h-full object-cover opacity-70"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[70%] h-[80%] border-2 border-white rounded-full opacity-80" />
              </div>
            </div>

            {/* Instrucciones */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground text-lg">Condiciones Ideales:</h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg">
                  <svg className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Buena iluminación</h4>
                    <p className="text-sm text-muted-foreground">Asegúrate de estar en un lugar con luz natural o artificial uniforme</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg">
                  <svg className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Vista frontal</h4>
                    <p className="text-sm text-muted-foreground">Mantén tu rostro de frente a la cámara, sin inclinaciones</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg">
                  <svg className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Distancia adecuada</h4>
                    <p className="text-sm text-muted-foreground">Ajusta tu cara dentro del marco oval que aparecerá en pantalla</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg">
                  <svg className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Sin accesorios</h4>
                    <p className="text-sm text-muted-foreground">Retira gafas, gorras y cualquier objeto que cubra tu rostro</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Advertencia */}
            <div className="bg-accent/30 p-4 rounded-lg border border-accent">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-foreground">
                  <strong>Importante:</strong> Tomaremos dos fotos: una con expresión neutral y otra sonriendo naturalmente. Ambas son necesarias para el análisis completo.
                </p>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="flex-1"
              >
                Volver
              </Button>
              <Button
                onClick={() => navigate("/captura-reposo")}
                className="flex-1"
              >
                Entendí, Continuar
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
            <span className="text-sm font-display font-bold text-primary">16%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div className="bg-primary h-3 rounded-full transition-all shadow-sm shadow-primary/50" style={{ width: '16%' }} />
          </div>
        </div>

        {/* Content */}
        <div className="bg-card rounded-3xl border-2 border-border overflow-hidden shadow-xl">
          <div className="bg-gradient-to-br from-accent/30 to-primary/20 p-8 border-b-2 border-border">
            <h1 className="text-3xl font-display font-black text-foreground mb-3">
              📸 Guía para las Fotos
            </h1>
            <p className="text-muted-foreground text-lg">
              Puedes tomar las fotos con tu cámara, subirlas desde tu galería, o pedirle a alguien que te ayude
            </p>
          </div>

          <div className="p-8 space-y-8">
            {/* Formas de captura */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-primary/5 rounded-2xl border border-primary/20">
                <div className="text-4xl mb-2">📱</div>
                <p className="text-xs font-display font-bold text-foreground">Selfie</p>
              </div>
              <div className="text-center p-4 bg-primary/5 rounded-2xl border border-primary/20">
                <div className="text-4xl mb-2">👤</div>
                <p className="text-xs font-display font-bold text-foreground">Con ayuda</p>
              </div>
              <div className="text-center p-4 bg-primary/5 rounded-2xl border border-primary/20">
                <div className="text-4xl mb-2">🖼️</div>
                <p className="text-xs font-display font-bold text-foreground">Subir foto</p>
              </div>
            </div>

            {/* Ejemplos visuales */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Ejemplo correcto */}
              <div className="space-y-3">
                <div className="relative aspect-[3/4] bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-2xl overflow-hidden border-2 border-green-500/30">
                  <img 
                    src={faceFrame}
                    alt="Ejemplo correcto"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-[70%] h-[80%] border-4 border-green-500 rounded-full opacity-90 shadow-lg" />
                  </div>
                  <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    CORRECTO
                  </div>
                </div>
                <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                  <p className="text-sm text-foreground font-medium">✓ Rostro centrado y frontal</p>
                  <p className="text-sm text-foreground font-medium">✓ Buena iluminación</p>
                  <p className="text-sm text-foreground font-medium">✓ Distancia adecuada</p>
                </div>
              </div>

              {/* Ejemplo incorrecto */}
              <div className="space-y-3">
                <div className="relative aspect-[3/4] bg-gradient-to-br from-red-500/10 to-red-600/5 rounded-2xl overflow-hidden border-2 border-red-500/30">
                  <img 
                    src={faceFrame}
                    alt="Ejemplo incorrecto"
                    className="w-full h-full object-cover opacity-40 transform rotate-12 scale-75"
                  />
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    INCORRECTO
                  </div>
                </div>
                <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                  <p className="text-sm text-foreground font-medium">✗ Rostro girado o ladeado</p>
                  <p className="text-sm text-foreground font-medium">✗ Muy oscuro o con sombras</p>
                  <p className="text-sm text-foreground font-medium">✗ Muy cerca o muy lejos</p>
                </div>
              </div>
            </div>

            {/* Instrucciones */}
            <div className="space-y-5">
              <h3 className="font-display font-bold text-foreground text-2xl">Condiciones Ideales:</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-5 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl border-2 border-primary/20">
                  <svg className="w-7 h-7 text-primary flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-display font-bold text-foreground mb-2 text-lg">Buena iluminación</h4>
                    <p className="text-muted-foreground">Asegúrate de estar en un lugar con luz natural o artificial uniforme, sin sombras en el rostro</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl border-2 border-primary/20">
                  <svg className="w-7 h-7 text-primary flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-display font-bold text-foreground mb-2 text-lg">Vista frontal perfecta</h4>
                    <p className="text-muted-foreground">Mantén tu rostro completamente de frente a la cámara, sin girar la cabeza</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl border-2 border-primary/20">
                  <svg className="w-7 h-7 text-primary flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-display font-bold text-foreground mb-2 text-lg">Distancia correcta</h4>
                    <p className="text-muted-foreground">Ajusta tu cara dentro del marco oval que aparecerá en pantalla</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl border-2 border-primary/20">
                  <svg className="w-7 h-7 text-primary flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-display font-bold text-foreground mb-2 text-lg">Sin obstrucciones</h4>
                    <p className="text-muted-foreground">Retira gafas, gorras, mascarillas y cualquier accesorio que cubra tu rostro</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Advertencia */}
            <div className="bg-gradient-to-br from-accent/30 to-accent/20 p-6 rounded-2xl border-2 border-accent">
              <div className="flex items-start gap-4">
                <svg className="w-7 h-7 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-foreground">
                  <strong className="font-display">Importante:</strong> Tomaremos <strong>dos fotos</strong>: una con expresión neutral (en reposo) y otra sonriendo naturalmente. Ambas son necesarias para el análisis completo.
                </p>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-4">
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="flex-1 py-6 text-lg font-display font-bold rounded-xl border-2"
              >
                Volver
              </Button>
              <Button
                onClick={() => navigate("/captura-reposo")}
                className="flex-1 py-6 text-lg font-display font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Entendido, Continuar
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

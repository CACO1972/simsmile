import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Camera, Upload, Users, Sun, Eye, Ruler, Shield, Check, X, AlertTriangle, ArrowRight, ChevronLeft } from "lucide-react";
import faceFrame from "@/assets/face-frame.png";

export default function Instructions() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Paso 1 de 6</span>
            <span className="text-sm font-display font-bold text-primary">16%</span>
          </div>
          <div className="w-full bg-muted/50 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-primary to-accent h-full rounded-full transition-all duration-500 shadow-lg shadow-primary/30" 
              style={{ width: '16%' }} 
            />
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-card/95 backdrop-blur-sm rounded-3xl border border-border overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="relative bg-gradient-to-br from-primary via-primary to-accent p-8 text-primary-foreground overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-primary-foreground/20 rounded-xl backdrop-blur-sm">
                  <Camera className="w-7 h-7" />
                </div>
                <h1 className="text-3xl font-display font-black">
                  Guía de Fotografía
                </h1>
              </div>
              <p className="text-primary-foreground/90 text-base">
                Sigue estas indicaciones para obtener los mejores resultados en tu análisis
              </p>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            {/* Métodos de Captura */}
            <div>
              <h2 className="text-xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-primary to-accent rounded-full" />
                Métodos de Captura
              </h2>
              <div className="grid grid-cols-3 gap-3">
                <div className="group relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5 rounded-2xl border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="p-3 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform">
                      <Camera className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-sm font-display font-bold text-foreground">Selfie</p>
                    <p className="text-xs text-muted-foreground">Toma directa</p>
                  </div>
                </div>
                
                <div className="group relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5 rounded-2xl border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="p-3 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-sm font-display font-bold text-foreground">Asistida</p>
                    <p className="text-xs text-muted-foreground">Con ayuda</p>
                  </div>
                </div>
                
                <div className="group relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5 rounded-2xl border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="p-3 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-sm font-display font-bold text-foreground">Galería</p>
                    <p className="text-xs text-muted-foreground">Subir archivo</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ejemplos Visuales - Lado a Lado */}
            <div>
              <h2 className="text-xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-primary to-accent rounded-full" />
                Ejemplos de Captura
              </h2>
              <div className="grid md:grid-cols-2 gap-5">
                {/* Correcto */}
                <div className="space-y-3">
                  <div className="relative aspect-[3/4] bg-gradient-to-br from-emerald-500/5 to-emerald-600/10 rounded-2xl overflow-hidden border-2 border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                    <img 
                      src={faceFrame}
                      alt="Ejemplo correcto"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-[65%] h-[75%] border-[3px] border-emerald-500 rounded-full opacity-80" />
                    </div>
                    <div className="absolute top-3 right-3 bg-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg">
                      <Check className="w-3.5 h-3.5" />
                      CORRECTO
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 p-4 rounded-xl border border-emerald-500/20">
                    <div className="space-y-2">
                      {['Rostro centrado y frontal', 'Iluminación uniforme', 'Distancia adecuada', 'Sin accesorios'].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                          <span className="text-sm text-foreground font-medium">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Incorrecto */}
                <div className="space-y-3">
                  <div className="relative aspect-[3/4] bg-gradient-to-br from-red-500/5 to-red-600/10 rounded-2xl overflow-hidden border-2 border-red-500/30 shadow-lg shadow-red-500/10">
                    <img 
                      src={faceFrame}
                      alt="Ejemplo incorrecto"
                      className="w-full h-full object-cover opacity-30 transform rotate-12 scale-75"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative">
                        <div className="absolute inset-0 bg-red-500/20 blur-xl" />
                        <X className="relative w-24 h-24 text-red-500" strokeWidth={3} />
                      </div>
                    </div>
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg">
                      <X className="w-3.5 h-3.5" />
                      INCORRECTO
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 p-4 rounded-xl border border-red-500/20">
                    <div className="space-y-2">
                      {['Rostro girado o inclinado', 'Sombras o poca luz', 'Muy cerca o muy lejos', 'Gafas u obstrucciones'].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <X className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                          <span className="text-sm text-foreground font-medium">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Requisitos Técnicos */}
            <div>
              <h2 className="text-xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-primary to-accent rounded-full" />
                Requisitos de Calidad
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { icon: Sun, title: 'Iluminación', desc: 'Luz natural o artificial uniforme' },
                  { icon: Eye, title: 'Vista Frontal', desc: 'Rostro completamente de frente' },
                  { icon: Ruler, title: 'Distancia', desc: 'Ajustar al marco en pantalla' },
                  { icon: Shield, title: 'Sin Obstáculos', desc: 'Retira gafas y accesorios' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 bg-gradient-to-br from-primary/5 to-transparent rounded-xl border border-primary/10 hover:border-primary/20 transition-colors">
                    <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-foreground mb-0.5">{item.title}</h4>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Aviso Importante */}
            <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-5 rounded-2xl border-2 border-amber-500/30">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-amber-500/20 rounded-lg flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground mb-2 flex items-center gap-2">
                    Importante: Dos Fotografías Requeridas
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Para realizar un análisis completo, necesitaremos <strong className="text-foreground">dos imágenes</strong>: una con tu <strong className="text-foreground">expresión neutral</strong> (en reposo) y otra con tu <strong className="text-foreground">sonrisa natural</strong>. Ambas son esenciales para evaluar tu perfil dentofacial.
                  </p>
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="flex-1 py-6 text-base font-display font-bold rounded-xl border-2 hover:bg-accent/50 transition-all group"
              >
                <ChevronLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                Volver
              </Button>
              <Button
                onClick={() => navigate("/captura-reposo")}
                className="flex-1 py-6 text-base font-display font-bold rounded-xl shadow-lg hover:shadow-xl transition-all group bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                Entendido, Continuar
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

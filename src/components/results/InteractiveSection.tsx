import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface InteractiveSectionProps {
  simulatedImage: string;
}

export function InteractiveSection({ simulatedImage }: InteractiveSectionProps) {
  const [toothSize, setToothSize] = useState([100]);
  const [whiteness, setWhiteness] = useState([100]);

  return (
    <section className="mb-16">
      <div className="text-center mb-10">
        <h2 className="text-4xl md:text-5xl font-display font-black text-foreground mb-4">
          Personaliza tu <span className="text-primary">Sonrisa</span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Ajusta el tamaño y color de los dientes para ver diferentes opciones
        </p>
      </div>

      <div className="bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20 rounded-3xl border-2 border-primary/30 p-8 shadow-xl">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Preview */}
          <div className="aspect-square bg-muted rounded-2xl overflow-hidden border-2 border-border shadow-lg">
            <img 
              src={simulatedImage} 
              alt="Vista previa interactiva" 
              className="w-full h-full object-cover transition-all"
              style={{
                filter: `brightness(${whiteness[0] / 100 + 0.2}) contrast(${1 + (whiteness[0] - 100) / 200})`,
                transform: `scale(${toothSize[0] / 100})`,
              }}
            />
          </div>

          {/* Controls */}
          <div className="space-y-8">
            <div className="bg-card rounded-2xl border-2 border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground text-lg">Tamaño de Dientes</h3>
                  <p className="text-sm text-muted-foreground">Ajusta la proporción de tus dientes</p>
                </div>
              </div>
              <Slider 
                value={toothSize} 
                onValueChange={setToothSize} 
                min={80} 
                max={120} 
                step={1}
                className="mb-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Más pequeño</span>
                <span className="font-bold text-foreground">{toothSize[0]}%</span>
                <span>Más grande</span>
              </div>
            </div>

            <div className="bg-card rounded-2xl border-2 border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground text-lg">Blancura Dental</h3>
                  <p className="text-sm text-muted-foreground">Modifica la intensidad del blanco</p>
                </div>
              </div>
              <Slider 
                value={whiteness} 
                onValueChange={setWhiteness} 
                min={80} 
                max={140} 
                step={1}
                className="mb-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Natural</span>
                <span className="font-bold text-foreground">{whiteness[0]}%</span>
                <span>Más blanco</span>
              </div>
            </div>

            <Button 
              onClick={() => {
                setToothSize([100]);
                setWhiteness([100]);
              }}
              variant="outline"
              className="w-full font-display font-bold py-6 text-lg rounded-xl border-2"
            >
              🔄 Restablecer Valores
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

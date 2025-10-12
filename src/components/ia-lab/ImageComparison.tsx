import { useState, useRef, useEffect } from "react";

interface ImageComparisonProps {
  beforeImage: string;
  afterImage: string;
}

export function ImageComparison({ beforeImage, afterImage }: ImageComparisonProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseDown = () => setIsDragging(true);
  
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="space-y-6">
      {/* Comparador interactivo */}
      <div className="relative">
        <div 
          ref={containerRef}
          className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden cursor-ew-resize select-none shadow-2xl"
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
        >
          {/* Imagen DESPUÉS (fondo completo) */}
          <div className="absolute inset-0">
            <img 
              src={afterImage} 
              alt="Después" 
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 right-4 px-4 py-2 bg-primary text-primary-foreground rounded-full font-semibold text-sm shadow-lg backdrop-blur-sm">
              Después
            </div>
          </div>

          {/* Imagen ANTES (recortada por el slider) */}
          <div 
            className="absolute inset-0 transition-all duration-75"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          >
            <img 
              src={beforeImage} 
              alt="Antes" 
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 px-4 py-2 bg-muted text-foreground rounded-full font-semibold text-sm shadow-lg backdrop-blur-sm">
              Antes
            </div>
          </div>

          {/* Línea divisoria con handle */}
          <div 
            className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl"
            style={{ left: `${sliderPosition}%` }}
          >
            {/* Handle del slider */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform hover:scale-110">
              <div className="flex gap-1">
                <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                </svg>
                <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
                </svg>
              </div>
            </div>

            {/* Líneas punteadas superiores e inferiores */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-12 w-0.5 bg-white/50 border-l-2 border-dashed border-white"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-12 w-0.5 bg-white/50 border-l-2 border-dashed border-white"></div>
          </div>
        </div>

        {/* Instrucción animada */}
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground animate-pulse">
            ← Arrastra el slider para comparar →
          </p>
        </div>
      </div>

      {/* Mensaje de impacto */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 p-6 rounded-2xl border border-primary/20">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <h4 className="font-semibold text-foreground mb-1">
              ✨ Transformación visualizada
            </h4>
            <p className="text-sm text-muted-foreground">
              Compara interactivamente el resultado de las correcciones dentales aplicadas con IA
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

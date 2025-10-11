import { useRef } from "react";
import type { SmileMetrics } from "@/lib/metrics";

interface MetricsDisplayProps {
  metrics: SmileMetrics;
  canvas1Ref: React.RefObject<HTMLCanvasElement>;
  canvas2Ref: React.RefObject<HTMLCanvasElement>;
  canvas3Ref: React.RefObject<HTMLCanvasElement>;
}

export function MetricsDisplay({ metrics, canvas1Ref, canvas2Ref, canvas3Ref }: MetricsDisplayProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="rounded-xl overflow-hidden border border-border bg-muted/30">
          <canvas 
            ref={canvas1Ref} 
            className="w-full h-auto" 
            aria-label="análisis líneas medias"
          />
        </div>
        <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
          <p className="text-xs text-foreground">
            <strong>Líneas Medias:</strong> Compara la simetría facial (verde) con la dental (naranja). Una buena coincidencia es clave para una sonrisa armoniosa.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="rounded-xl overflow-hidden border border-border bg-muted/30">
          <canvas 
            ref={canvas2Ref} 
            className="w-full h-auto" 
            aria-label="proporciones faciales"
          />
        </div>
        <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
          <p className="text-xs text-foreground">
            <strong>Proporciones Faciales:</strong> El rostro se divide en tres tercios idealmente iguales (33% cada uno). Esto indica balance y armonía facial.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="rounded-xl overflow-hidden border border-border bg-muted/30">
          <canvas 
            ref={canvas3Ref} 
            className="w-full h-auto" 
            aria-label="análisis de sonrisa"
          />
        </div>
        <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
          <p className="text-xs text-foreground">
            <strong>Análisis de Sonrisa:</strong> Evalúa el arco de la sonrisa, exposición de encías y amplitud. Una sonrisa consonante y equilibrada es el ideal estético.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-lg text-foreground">Resultados detallados</h3>
        
        <div className="p-3 bg-primary/10 rounded-lg border border-primary/30">
          <h4 className="text-sm font-semibold mb-2 text-foreground">Líneas Medias</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Dental:</span>
              <span className={`font-bold ${
                Math.abs(metrics.midline.mm) < 1 ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {metrics.midline.mm.toFixed(1)}mm {metrics.midline.side}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Facial:</span>
              <span className="font-bold text-green-600">{metrics.facialMidline.side}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Coincidencia:</span>
              <span className={`font-bold capitalize ${
                metrics.midlineCoincidence.status === 'coincidente' ? 'text-green-600' : 
                metrics.midlineCoincidence.status === 'leve' ? 'text-yellow-600' :
                metrics.midlineCoincidence.status === 'moderada' ? 'text-orange-600' : 'text-red-600'
              }`}>
                {metrics.midlineCoincidence.status} ({metrics.midlineCoincidence.deviation.toFixed(1)}mm)
              </span>
            </div>
          </div>
        </div>

        <div className="p-3 bg-accent/10 rounded-lg border border-accent/30">
          <h4 className="text-sm font-semibold mb-2 text-foreground">Proporciones Faciales</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Tercio Superior:</span>
              <span className="font-bold">{metrics.facialProportions.upperThird.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Tercio Medio:</span>
              <span className="font-bold">{metrics.facialProportions.middleThird.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Tercio Inferior:</span>
              <span className="font-bold">{metrics.facialProportions.lowerThird.toFixed(1)}%</span>
            </div>
            <div className="pt-2 border-t border-accent/30">
              <span className={`text-sm font-bold ${
                metrics.facialProportions.isBalanced ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {metrics.facialProportions.isBalanced ? '✓ Equilibradas' : '⚠ Desbalanceadas'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-2">
          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium">Arco de sonrisa:</span>
            <span className={`text-sm font-bold capitalize ${
              metrics.smileArc === 'consonante' ? 'text-green-600' : 
              metrics.smileArc === 'plano' ? 'text-yellow-600' : 'text-red-600'
            }`}>{metrics.smileArc}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium">Exposición gingival:</span>
            <span className={`text-sm font-bold capitalize ${
              metrics.gingival.class === 'baja' ? 'text-green-600' : 
              metrics.gingival.class === 'media' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {metrics.gingival.class} ({metrics.gingival.mm.toFixed(1)} mm)
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium">Corredor bucal:</span>
            <span className={`text-sm font-bold ${
              metrics.buccalRatio >= 0.1 && metrics.buccalRatio <= 0.3 ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {Math.round(metrics.buccalRatio*100)}%
            </span>
          </div>
        </div>

        {metrics.toothMeasurements && (
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Dimensiones Dentales
              </h4>
              <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                metrics.toothMeasurements.calibrated 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
              }`}>
                {metrics.toothMeasurements.calibrated ? '✓ Calibrado' : '≈ Estimado'}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 p-2 bg-white/50 dark:bg-black/20 rounded">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Incisivo Central</p>
                  <p className="text-sm font-bold text-foreground">
                    Ancho: {metrics.toothMeasurements.centralIncisor.width.toFixed(1)}mm
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    Alto: {metrics.toothMeasurements.centralIncisor.height.toFixed(1)}mm
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Incisivo Lateral</p>
                  <p className="text-sm font-bold text-foreground">
                    Ancho: {metrics.toothMeasurements.lateralIncisor.width.toFixed(1)}mm
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    Alto: {metrics.toothMeasurements.lateralIncisor.height.toFixed(1)}mm
                  </p>
                </div>
              </div>
              
              <div className="p-2 bg-white/50 dark:bg-black/20 rounded">
                <p className="text-xs text-muted-foreground mb-1">Canino</p>
                <p className="text-sm font-bold text-foreground">
                  Ancho: {metrics.toothMeasurements.canine.width.toFixed(1)}mm
                </p>
                <p className="text-sm font-bold text-foreground">
                  Alto: {metrics.toothMeasurements.canine.height.toFixed(1)}mm
                </p>
              </div>
              
              {!metrics.toothMeasurements.calibrated && (
                <p className="text-xs text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                  💡 Para mediciones precisas, usa el marco de calibración al capturar la foto
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

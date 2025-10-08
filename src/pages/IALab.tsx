import { useRef, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import { computeMetrics, drawOverlay, type SmileMetrics } from "@/lib/metrics";

// Carga dinámica de MediaPipe Tasks desde CDN (sin tocar package.json)
async function loadFaceTask() {
  const vision = await (window as any).FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );
  // @ts-ignore - Dynamic CDN import
  const { FaceLandmarker } = await import("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/vision_bundle.mjs");
  const landmarker = await (FaceLandmarker as any).createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: "https://storage.googleapis.com/mediapipe-assets/face_landmarker.task"
    },
    numFaces: 1,
    runningMode: "IMAGE",
    outputFaceBlendshapes: true
  });
  return landmarker;
}

// Carga del FilesetResolver global (necesario para vision_bundle.mjs)
async function ensureFilesetResolver() {
  if ((window as any).FilesetResolver) return;
  // @ts-ignore - Dynamic CDN import
  const mod = await import("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/vision_bundle.mjs");
  (window as any).FilesetResolver = mod.FilesetResolver;
}

function loadImage(b64: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = b64;
  });
}

export default function IALab() {
  const [restB64, setRestB64] = useState<string>("");
  const [smileB64, setSmileB64] = useState<string>("");
  const [metrics, setMetrics] = useState<SmileMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [whiten, setWhiten] = useState(0);     // 0..150
  const [align, setAlign] = useState(0);       // -15..15 (px visual)
  const [contrast, setContrast] = useState(100);// 50..150%
  const [brightness, setBrightness] = useState(100); // 50..150%
  const [saturation, setSaturation] = useState(100); // 0..200%
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onFile = (e: any, kind: "rest" | "smile") => {
    const f = e.target.files?.[0]; 
    if (!f) return;
    const r = new FileReader();
    r.onload = () => (kind === "rest" ? setRestB64 : setSmileB64)(r.result as string);
    r.readAsDataURL(f);
  };

  const analyze = async () => {
    if (!restB64 || !smileB64) return alert("Sube ambas fotos: reposo y sonrisa.");
    setLoading(true);
    try {
      await ensureFilesetResolver();
      const landmarker = await loadFaceTask();

      // Crear imágenes
      const restImg = await loadImage(restB64);
      const smileImg = await loadImage(smileB64);

      // Detectar
      const restRes = await (landmarker as any).detect(restImg);
      const smileRes = await (landmarker as any).detect(smileImg);

      if (!restRes?.faceLandmarks?.length || !smileRes?.faceLandmarks?.length) {
        alert("No se detectó rostro en alguna de las fotos.");
        return;
      }
      const restLm = restRes.faceLandmarks[0];
      const smileLm = smileRes.faceLandmarks[0];

      // Calcular métricas
      const m = computeMetrics({ restLm, smileLm, imgW: smileImg.width, imgH: smileImg.height });
      setMetrics(m);
      track({ name: "analyze_ok", data: { arc: m.smileArc, gingivalClass: m.gingival.class } });

      // Pintar overlay
      const canvas = canvasRef.current!;
      canvas.width = smileImg.width;
      canvas.height = smileImg.height;
      const ctx = canvas.getContext("2d")!;
      drawOverlay(ctx, smileImg, smileLm, m);

    } catch (e) {
      console.error(e);
      alert("Falló el análisis. Prueba con otra foto (frontal, buena luz).");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-foreground">
            <span className="text-primary">IA Lab</span> — Análisis Dental Avanzado
          </h1>
          <p className="text-muted-foreground mt-2">
            Tecnología de detección facial con inteligencia artificial on-device
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 grid gap-6 max-w-7xl">
        <Card className="bg-card/80 backdrop-blur-sm border-border shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Análisis Facial y Sonrisa
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Foto en reposo</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => onFile(e, "rest")} 
                  className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                />
                {restB64 && (
                  <div className="rounded-xl overflow-hidden border border-border bg-muted/30">
                    <img src={restB64} alt="reposo" className="w-full h-64 object-contain" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Foto sonriendo</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => onFile(e, "smile")} 
                  className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                />
                {smileB64 && (
                  <div className="rounded-xl overflow-hidden border border-border bg-muted/30">
                    <img src={smileB64} alt="sonrisa" className="w-full h-64 object-contain" />
                  </div>
                )}
              </div>

              <Button 
                className="mt-4 w-full" 
                onClick={analyze} 
                disabled={loading || !restB64 || !smileB64}
                size="lg"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analizando…
                  </>
                ) : (
                  "Analizar ahora"
                )}
              </Button>
            </div>

            <div className="grid gap-4">
              <div className="rounded-xl overflow-hidden border border-border bg-muted/30">
                <canvas 
                  ref={canvasRef} 
                  className="w-full h-auto" 
                  aria-label="overlay análisis"
                />
              </div>
              
              {!metrics && (
                <div className="text-muted-foreground text-sm text-center p-8">
                  Sube fotos y presiona "Analizar" para ver resultados.
                </div>
              )}
              
              {metrics && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg text-foreground">Resultados del análisis</h3>
                  <div className="grid gap-2">
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium">Arco de sonrisa:</span>
                      <span className="text-sm font-bold text-primary capitalize">{metrics.smileArc}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium">Exposición gingival:</span>
                      <span className="text-sm font-bold text-primary capitalize">
                        {metrics.gingival.class} ({metrics.gingival.mm.toFixed(1)} mm)
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium">Midline:</span>
                      <span className="text-sm font-bold text-primary capitalize">
                        {metrics.midline.mm.toFixed(1)} mm {metrics.midline.side}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium">Corredor bucal:</span>
                      <span className="text-sm font-bold text-primary">
                        {Math.round(metrics.buccalRatio*100)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm border-border shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Simulación Visual
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex justify-between">
                  <span>Blanqueamiento dental</span>
                  <span className="text-primary font-mono">{whiten}%</span>
                </label>
                <input 
                  type="range" 
                  min={0} 
                  max={150} 
                  value={whiten} 
                  onChange={(e) => setWhiten(Number(e.target.value))} 
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium flex justify-between">
                  <span>Brillo general</span>
                  <span className="text-primary font-mono">{brightness}%</span>
                </label>
                <input 
                  type="range" 
                  min={50} 
                  max={150} 
                  value={brightness} 
                  onChange={(e) => setBrightness(Number(e.target.value))} 
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium flex justify-between">
                  <span>Contraste</span>
                  <span className="text-primary font-mono">{contrast}%</span>
                </label>
                <input 
                  type="range" 
                  min={50} 
                  max={150} 
                  value={contrast} 
                  onChange={(e) => setContrast(Number(e.target.value))} 
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium flex justify-between">
                  <span>Saturación</span>
                  <span className="text-primary font-mono">{saturation}%</span>
                </label>
                <input 
                  type="range" 
                  min={0} 
                  max={200} 
                  value={saturation} 
                  onChange={(e) => setSaturation(Number(e.target.value))} 
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium flex justify-between">
                  <span>Alineación horizontal</span>
                  <span className="text-primary font-mono">{align}px</span>
                </label>
                <input 
                  type="range" 
                  min={-15} 
                  max={15} 
                  value={align} 
                  onChange={(e) => setAlign(Number(e.target.value))} 
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
              
              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground">
                  * Simulación orientativa. La evaluación clínica puede diferir.
                </p>
              </div>
            </div>
            
            <div className="rounded-xl overflow-hidden border border-border bg-muted/30">
              {smileB64 ? (
                <img
                  src={smileB64}
                  alt="simulación"
                  className="w-full h-auto"
                  style={{
                    filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${whiten * 0.1}deg)`,
                    transform: `translateX(${align}px)`,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground p-6 text-center">
                  Sube una foto de sonrisa para simular cambios visuales
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

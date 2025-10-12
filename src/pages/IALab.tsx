import { useRef, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { track } from "@/lib/analytics";
import { computeMetrics, drawMidlineOverlay, drawProportionsOverlay, drawSmileOverlay, type SmileMetrics } from "@/lib/metrics";
import { CameraCapture } from "@/components/ia-lab/CameraCapture";
import { ImageUpload } from "@/components/ia-lab/ImageUpload";
import { MetricsDisplay } from "@/components/ia-lab/MetricsDisplay";
import { SimulationControls } from "@/components/ia-lab/SimulationControls";
import { ImageComparison } from "@/components/ia-lab/ImageComparison";
import { LogoCorner } from "@/components/LogoCorner";
import { loadFaceTask, ensureFilesetResolver, loadImage } from "@/lib/mediapipe";

export default function IALab() {
  const [restB64, setRestB64] = useState<string>("");
  const [smileB64, setSmileB64] = useState<string>("");
  const [metrics, setMetrics] = useState<SmileMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [simulatedB64, setSimulatedB64] = useState<string>("");
  const [simulating, setSimulating] = useState(false);
  
  const [adjustments, setAdjustments] = useState({
    toothLength: 0,
    toothWidth: 0,
    whiteness: 0
  });
  const [showAdjustments, setShowAdjustments] = useState(false);
  
  const [showCamera, setShowCamera] = useState(false);
  const [cameraMode, setCameraMode] = useState<"rest" | "smile" | null>(null);
  
  const canvasRef1 = useRef<HTMLCanvasElement>(null);
  const canvasRef2 = useRef<HTMLCanvasElement>(null);
  const canvasRef3 = useRef<HTMLCanvasElement>(null);

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

      const restImg = await loadImage(restB64);
      const smileImg = await loadImage(smileB64);

      const restRes = await (landmarker as any).detect(restImg);
      const smileRes = await (landmarker as any).detect(smileImg);

      if (!restRes?.faceLandmarks?.length || !smileRes?.faceLandmarks?.length) {
        alert("No se detectó rostro en alguna de las fotos.");
        return;
      }
      const restLm = restRes.faceLandmarks[0];
      const smileLm = smileRes.faceLandmarks[0];

      const m = computeMetrics({ restLm, smileLm, imgW: smileImg.width, imgH: smileImg.height });
      setMetrics(m);
      track({ name: "analyze_ok", data: { arc: m.smileArc, gingivalClass: m.gingival.class } });

      setTimeout(() => {
        [canvasRef1, canvasRef2, canvasRef3].forEach((ref, idx) => {
          const canvas = ref.current;
          if (!canvas) return;
          
          canvas.width = smileImg.width;
          canvas.height = smileImg.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          
          if (idx === 0) drawMidlineOverlay(ctx, smileImg, smileLm, m);
          else if (idx === 1) drawProportionsOverlay(ctx, smileImg, smileLm, m);
          else drawSmileOverlay(ctx, smileImg, smileLm, m);
        });
      }, 0);

    } catch (e) {
      console.error(e);
      alert("Falló el análisis. Prueba con otra foto (frontal, buena luz).");
    } finally {
      setLoading(false);
    }
  };

  const simulateCorrections = async (withAdjustments = false) => {
    if (!smileB64 || !metrics) return alert("Primero analiza una foto de sonrisa.");
    setSimulating(true);
    try {
      const body: any = { imageBase64: smileB64, metrics };
      
      if (withAdjustments) {
        body.adjustments = adjustments;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/simulate-smile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error en simulación');
      }

      const data = await response.json();
      setSimulatedB64(data.simulatedImage);
      
      if (!withAdjustments) {
        setShowAdjustments(true);
        toast.success('Simulación completada. Ahora puedes ajustar parámetros.');
      } else {
        toast.success('Simulación actualizada con tus ajustes');
      }
      
      track({ name: "simulation_success", data: { corrections: true, withAdjustments } });
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Error al simular. Intenta de nuevo.");
    } finally {
      setSimulating(false);
    }
  };

  const resetAdjustments = () => {
    setAdjustments({ toothLength: 0, toothWidth: 0, whiteness: 0 });
  };

  const startCamera = (mode: "rest" | "smile") => {
    setCameraMode(mode);
    setShowCamera(true);
  };

  const handleCameraCapture = (imageData: string) => {
    if (cameraMode === 'rest') {
      setRestB64(imageData);
    } else {
      setSmileB64(imageData);
    }
    setShowCamera(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <LogoCorner />
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-foreground">
                  <span className="text-primary">IA Lab</span> — Análisis Dental Avanzado
                </h1>
                <span className="px-2 py-1 text-xs font-semibold bg-primary/20 text-primary rounded-full border border-primary/30">
                  VERSIÓN BETA
                </span>
              </div>
              <p className="text-muted-foreground mt-1">
                Tecnología de detección facial con inteligencia artificial on-device
              </p>
              <div className="mt-3 space-y-1">
                <p className="text-sm font-medium text-foreground">
                  Desarrollado por <span className="text-primary font-semibold">Clínica Miró</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Equipo liderado por Dr. Carlos Montoya
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-2 flex items-start gap-1">
                  <svg className="w-3 h-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
                  </svg>
                  Prohibida su reproducción - Protegido por propiedad intelectual
                </p>
              </div>
            </div>
          </div>
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
              <ImageUpload
                label="Foto en reposo"
                imageData={restB64}
                onFileChange={(e) => onFile(e, "rest")}
                onCameraClick={() => startCamera('rest')}
              />

              <ImageUpload
                label="Foto sonriendo"
                imageData={smileB64}
                onFileChange={(e) => onFile(e, "smile")}
                onCameraClick={() => startCamera('smile')}
              />

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
              {!metrics && (
                <div className="text-muted-foreground text-sm text-center p-8 bg-muted/30 rounded-xl border border-border">
                  Sube fotos y presiona "Analizar" para ver resultados.
                </div>
              )}
              
              {metrics && (
                <>
                  <MetricsDisplay
                    metrics={metrics}
                    canvas1Ref={canvasRef1}
                    canvas2Ref={canvasRef2}
                    canvas3Ref={canvasRef3}
                  />
                  
                  <Button 
                    className="w-full mt-4" 
                    onClick={() => simulateCorrections(false)} 
                    disabled={simulating}
                    size="lg"
                    variant="default"
                  >
                    {simulating ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Simulando correcciones...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Simular correcciones con IA
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {simulatedB64 && (
          <Card className="bg-card/80 backdrop-blur-sm border-border shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Simulación con IA — Resultado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ImageComparison 
                beforeImage={smileB64}
                afterImage={simulatedB64}
              />

              {showAdjustments && (
                <SimulationControls
                  adjustments={adjustments}
                  onAdjustmentChange={setAdjustments}
                  onReset={resetAdjustments}
                  onRegenerate={() => simulateCorrections(true)}
                  isSimulating={simulating}
                />
              )}
            </CardContent>
          </Card>
        )}
      </main>

      {showCamera && cameraMode && (
        <CameraCapture
          mode={cameraMode}
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}

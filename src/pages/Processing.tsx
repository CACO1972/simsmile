import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSmileAnalysis } from "@/contexts/SmileAnalysisContext";
import { computeMetrics } from "@/lib/metrics";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
    outputFaceBlendshapes: false
  });
  return landmarker;
}

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

export default function Processing() {
  const navigate = useNavigate();
  const {
    restImage,
    smileImage,
    setMetrics,
    setSimulatedImage,
    setAnalysisId,
  } = useSmileAnalysis();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState(false);

  const steps = [
    { text: "Cargando modelos de IA...", duration: 2000 },
    { text: "Detectando puntos faciales...", duration: 3000 },
    { text: "Analizando métricas dentales...", duration: 2500 },
    { text: "Generando simulación con IA...", duration: 4000 },
    { text: "Finalizando análisis...", duration: 1500 },
  ];

  useEffect(() => {
    // Proteger ruta
    if (!restImage || !smileImage) {
      navigate("/captura-reposo");
      return;
    }

    let mounted = true;

    const processAnalysis = async () => {
      try {
        // Paso 1: Cargar modelos
        setCurrentStep(0);
        await new Promise(resolve => setTimeout(resolve, steps[0].duration));
        if (!mounted) return;

        await ensureFilesetResolver();
        const landmarker = await loadFaceTask();
        
        // Paso 2: Detectar rostros
        setCurrentStep(1);
        await new Promise(resolve => setTimeout(resolve, steps[1].duration));
        if (!mounted) return;

        const restImg = await loadImage(restImage);
        const smileImg = await loadImage(smileImage);

        const restRes = await (landmarker as any).detect(restImg);
        const smileRes = await (landmarker as any).detect(smileImg);

        if (!restRes?.faceLandmarks?.length || !smileRes?.faceLandmarks?.length) {
          throw new Error("No se detectó rostro en las fotos");
        }

        // Paso 3: Calcular métricas
        setCurrentStep(2);
        await new Promise(resolve => setTimeout(resolve, steps[2].duration));
        if (!mounted) return;

        const restLm = restRes.faceLandmarks[0];
        const smileLm = smileRes.faceLandmarks[0];

        const calculatedMetrics = computeMetrics({
          restLm,
          smileLm,
          imgW: smileImg.width,
          imgH: smileImg.height,
        });

        setMetrics(calculatedMetrics);

        // Paso 4: Generar simulación con IA
        setCurrentStep(3);
        
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/simulate-smile`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({
              imageBase64: smileImage,
              metrics: calculatedMetrics,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Error al generar simulación");
        }

        const data = await response.json();
        setSimulatedImage(data.simulatedImage);

        // Paso 5: Guardar en base de datos
        setCurrentStep(4);
        await new Promise(resolve => setTimeout(resolve, steps[4].duration));
        if (!mounted) return;

        const { data: analysisData, error: dbError } = await supabase
          .from("smile_analyses")
          .insert({
            rest_image_url: restImage,
            smile_image_url: smileImage,
            simulated_image_url: data.simulatedImage,
            metrics: calculatedMetrics,
          })
          .select()
          .single();

        if (dbError) throw dbError;

        setAnalysisId(analysisData.id);

        // Navegar a contacto
        toast.success("¡Análisis completado!");
        navigate("/contacto");
        
      } catch (err) {
        console.error("Error en análisis:", err);
        setError(true);
        toast.error(err instanceof Error ? err.message : "Error al procesar el análisis");
      }
    };

    processAnalysis();

    return () => {
      mounted = false;
    };
  }, [restImage, smileImage]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card rounded-2xl border border-border p-8 text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Error en el Análisis</h2>
          <p className="text-muted-foreground mb-6">
            No pudimos procesar tu análisis. Por favor, intenta nuevamente.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/captura-reposo")}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
            >
              Volver a Intentar
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex-1 px-4 py-2 border border-border rounded-lg font-medium hover:bg-accent"
            >
              Inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Paso 4 de 6</span>
            <span className="text-sm font-medium text-primary">67%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-primary h-2 rounded-full transition-all" style={{ width: '67%' }} />
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-card rounded-3xl border border-border p-8 shadow-2xl">
          {/* Animated Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
                <svg className="w-12 h-12 text-primary animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div className="absolute inset-0 w-24 h-24 bg-primary/20 rounded-full animate-ping"></div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-center text-foreground mb-3">
            Analizando tu Sonrisa
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            Nuestra IA está procesando tus fotos...
          </p>

          {/* Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                  index === currentStep
                    ? "bg-primary/10 border border-primary/20"
                    : index < currentStep
                    ? "bg-green-500/10 border border-green-500/20"
                    : "bg-muted/30 border border-transparent"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    index === currentStep
                      ? "bg-primary text-primary-foreground"
                      : index < currentStep
                      ? "bg-green-600 dark:bg-green-500 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index < currentStep ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-sm font-bold">{index + 1}</span>
                  )}
                </div>
                <span
                  className={`text-sm font-medium ${
                    index === currentStep
                      ? "text-foreground"
                      : index < currentStep
                      ? "text-green-700 dark:text-green-400"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.text}
                </span>
                {index === currentStep && (
                  <div className="ml-auto">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Fun Fact */}
          <div className="mt-8 p-4 bg-accent/20 rounded-lg border border-accent">
            <p className="text-sm text-center text-foreground">
              <strong>💡 Sabías que...</strong> Una sonrisa saludable puede mejorar tu confianza hasta en un 80%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

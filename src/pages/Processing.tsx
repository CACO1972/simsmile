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
      navigate("/captura");
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
              onClick={() => navigate("/captura")}
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
    <div className="min-h-screen bg-background overflow-hidden relative flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" 
             style={{ top: '10%', left: '10%', animationDuration: '3s' }} />
        <div className="absolute w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" 
             style={{ bottom: '10%', right: '10%', animationDuration: '4s', animationDelay: '1s' }} />
        <div className="absolute w-64 h-64 bg-primary/30 rounded-full blur-2xl animate-pulse" 
             style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', animationDuration: '5s' }} />
      </div>

      <div className="relative z-10 max-w-2xl w-full">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-display font-bold text-muted-foreground">Paso 3 de 5</span>
            <span className="text-sm font-display font-bold text-primary">{Math.round((currentStep + 1) / steps.length * 100)}%</span>
          </div>
          <div className="w-full bg-muted/50 backdrop-blur-sm rounded-full h-4 overflow-hidden border-2 border-border">
            <div 
              className="bg-gradient-to-r from-primary via-accent to-primary h-full rounded-full transition-all duration-1000 shadow-lg shadow-primary/50 animate-pulse" 
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} 
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="text-center space-y-8">
          {/* Animated Icon - Disruptive design */}
          <div className="flex justify-center">
            <div className="relative w-40 h-40">
              {/* Orbiting circles */}
              <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
                <div className="w-4 h-4 bg-primary rounded-full absolute top-0 left-1/2 -translate-x-1/2" />
              </div>
              <div className="absolute inset-0 animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }}>
                <div className="w-4 h-4 bg-accent rounded-full absolute bottom-0 left-1/2 -translate-x-1/2" />
              </div>
              <div className="absolute inset-0 animate-spin" style={{ animationDuration: '5s' }}>
                <div className="w-4 h-4 bg-primary rounded-full absolute top-1/2 right-0 -translate-y-1/2" />
              </div>
              
              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/50 animate-pulse transform rotate-12">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>

              {/* Pulsing rings */}
              <div className="absolute inset-0 border-4 border-primary/30 rounded-full animate-ping" />
              <div className="absolute inset-4 border-4 border-accent/30 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
            </div>
          </div>

          {/* Title with gradient */}
          <div>
            <h1 className="text-5xl md:text-6xl font-display font-black mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-pulse">
              Analizando tu Sonrisa
            </h1>
            <p className="text-xl text-muted-foreground font-medium">
              {steps[currentStep]?.text || "Procesando..."}
            </p>
          </div>

          {/* Step indicators - Minimal dots */}
          <div className="flex justify-center gap-3 py-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`rounded-full transition-all duration-500 ${
                  index === currentStep
                    ? "w-12 h-3 bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/50"
                    : index < currentStep
                    ? "w-3 h-3 bg-green-500 shadow-md"
                    : "w-3 h-3 bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Fun messages rotating */}
          <div className="bg-card/50 backdrop-blur-lg rounded-2xl border-2 border-border p-6 shadow-xl">
            <p className="text-lg text-foreground font-medium">
              {currentStep === 0 && "🤖 Cargando inteligencia artificial..."}
              {currentStep === 1 && "👁️ Detectando características faciales..."}
              {currentStep === 2 && "📊 Calculando parámetros dentales..."}
              {currentStep === 3 && "✨ Creando tu nueva sonrisa..."}
              {currentStep === 4 && "🎉 Casi listo..."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

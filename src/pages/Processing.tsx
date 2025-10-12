import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSmileAnalysis } from "@/contexts/SmileAnalysisContext";
import { computeMetrics } from "@/lib/metrics";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import simsmileLogo from "@/assets/simsmile-logo.png";

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

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-primary/10"
            style={{
              width: `${Math.random() * 80 + 20}px`,
              height: `${Math.random() * 80 + 20}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 15}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Logo sutil en esquina */}
      <div className="fixed top-4 left-4 z-10">
        <img src={simsmileLogo} alt="SimSmile" className="h-12 w-12 opacity-60 hover:opacity-100 transition-opacity" />
      </div>
      
      <div className="max-w-2xl w-full relative z-10">
        {/* Main Card */}
        <div className="bg-card/80 backdrop-blur-xl rounded-3xl border border-border/50 p-8 shadow-2xl">
          {/* Spectacular animated center */}
          <div className="flex justify-center mb-8">
            <div className="relative w-40 h-40">
              {/* Rotating gradient rings */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary via-primary/50 to-primary animate-spin opacity-20" style={{ animationDuration: '3s' }} />
              <div className="absolute inset-2 rounded-full bg-gradient-to-l from-primary via-primary/50 to-primary animate-spin opacity-30" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
              <div className="absolute inset-4 rounded-full bg-gradient-to-r from-primary via-primary/50 to-primary animate-spin opacity-40" style={{ animationDuration: '4s' }} />
              
              {/* Center smile animation */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Animated smile face */}
                  <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
                    {/* Face circle with glow */}
                    <circle cx="50" cy="50" r="45" fill="hsl(var(--primary))" className="animate-pulse" opacity="0.2" />
                    <circle cx="50" cy="50" r="40" fill="hsl(var(--primary))" opacity="0.1" />
                    
                    {/* Eyes */}
                    <circle cx="35" cy="40" r="3" fill="hsl(var(--primary-foreground))" className="animate-bounce" style={{ animationDuration: '2s' }} />
                    <circle cx="65" cy="40" r="3" fill="hsl(var(--primary-foreground))" className="animate-bounce" style={{ animationDuration: '2s', animationDelay: '0.1s' }} />
                    
                    {/* Animated smile - teeth showing */}
                    <path
                      d="M 30 55 Q 50 70 70 55"
                      stroke="hsl(var(--primary-foreground))"
                      strokeWidth="3"
                      strokeLinecap="round"
                      fill="none"
                      className="animate-pulse"
                    />
                    {/* Teeth sparkles */}
                    {[0, 1, 2, 3].map((i) => (
                      <circle
                        key={i}
                        cx={35 + i * 10}
                        cy="58"
                        r="1.5"
                        fill="hsl(var(--primary-foreground))"
                        className="animate-ping"
                        style={{ animationDelay: `${i * 0.2}s`, animationDuration: '1.5s' }}
                      />
                    ))}
                  </svg>
                  
                  {/* Sparkle effects */}
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 bg-primary rounded-full animate-ping"
                      style={{
                        top: `${Math.sin(i * 1.2) * 50 + 50}%`,
                        left: `${Math.cos(i * 1.2) * 50 + 50}%`,
                        animationDelay: `${i * 0.3}s`,
                        animationDuration: '2s'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Title with gradient */}
          <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent mb-3 animate-fade-in">
            Analizando tu Sonrisa
          </h1>
          <p className="text-center text-muted-foreground mb-6">
            Nuestra IA está procesando tus fotos...
          </p>

          {/* Animated progress bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">Paso {currentStep + 1} de {steps.length}</span>
              <span className="text-sm font-bold text-primary">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="relative w-full h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="absolute inset-0 bg-gradient-to-r from-primary/50 via-primary to-primary/50 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
              </div>
            </div>
          </div>

          {/* Steps with improved design */}
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`relative flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                  index === currentStep
                    ? "bg-gradient-to-r from-primary/20 to-primary/10 border-2 border-primary/30 scale-105"
                    : index < currentStep
                    ? "bg-gradient-to-r from-green-500/20 to-green-500/10 border border-green-500/30"
                    : "bg-muted/30 border border-transparent opacity-60"
                }`}
              >
                {/* Step number/icon */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    index === currentStep
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/50 scale-110"
                      : index < currentStep
                      ? "bg-gradient-to-br from-green-600 to-green-500 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index < currentStep ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-sm font-bold">{index + 1}</span>
                  )}
                </div>
                
                {/* Step text */}
                <span
                  className={`text-sm font-medium flex-grow ${
                    index === currentStep
                      ? "text-foreground font-semibold"
                      : index < currentStep
                      ? "text-green-700 dark:text-green-400"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.text}
                </span>
                
                {/* Animated indicator for current step */}
                {index === currentStep && (
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Fun motivational message */}
          <div className="mt-8 p-5 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-xl border border-primary/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            <p className="text-sm text-center text-foreground relative z-10">
              <span className="text-2xl mr-2">✨</span>
              <strong>Tu nueva sonrisa está a punto de revelarse...</strong>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-40px) translateX(-10px); }
          75% { transform: translateY(-20px) translateX(5px); }
        }
      `}</style>
    </div>
  );
}

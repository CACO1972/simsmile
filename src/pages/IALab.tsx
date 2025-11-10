import { useState, useEffect, useRef } from "react";
import { HeroSection } from "@/components/HeroSection";
import { CaptureSection } from "@/components/CaptureSection";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { ContactSection } from "@/components/ContactSection";
import { ResultsSection } from "@/components/ResultsSection";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";
import { track } from "@/lib/analytics";
import { supabase } from "@/integrations/supabase/client";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { logger } from "@/lib/logger";
import type { Landmark } from "@/types/mediapipe";

type Step = "hero" | "capture" | "loading" | "contact" | "results";

const IALab = () => {
  const [step, setStep] = useState<Step>("hero");
  const [restImage, setRestImage] = useState<string>("");
  const [smileImage, setSmileImage] = useState<string>("");
  const [idealImage, setIdealImage] = useState<string>("");
  const [analysis, setAnalysis] = useState<string>("");
  const [metrics, setMetrics] = useState<Record<string, unknown> | null>(null);
  const [landmarks, setLandmarks] = useState<Landmark[] | null>(null);
  const [contactData, setContactData] = useState<Record<string, unknown> | null>(null);
  const [simulationData, setSimulationData] = useState<{
    facialAnalysis?: Record<string, unknown>;
    qualityScore?: number;
    warnings?: string[];
  } | null>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);

  // Initialize MediaPipe Face Landmarker
  useEffect(() => {
    const initializeFaceLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        
        const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "IMAGE",
          numFaces: 1
        });
        
        faceLandmarkerRef.current = faceLandmarker;
        logger.log("MediaPipe Face Landmarker initialized successfully");
      } catch (error) {
        logger.error("Error initializing Face Landmarker:", error);
        toast.error("Error al inicializar el sistema de análisis facial");
      }
    };

    initializeFaceLandmarker();
  }, []);

  // Scroll to top whenever step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [step]);

  const handleCapture = async (rest: string, smile: string) => {
    setRestImage(rest);
    setSmileImage(smile);
    setStep("loading");
    track({ name: "photos_captured" });

    try {
      if (!faceLandmarkerRef.current) {
        throw new Error("Face Landmarker not initialized");
      }

      // Importar funciones de análisis
      const { computeMetrics, analyzeFaceCharacteristics, generateSmileRecommendations, generateAnalysisText } = await import("@/lib/metrics");
      
      // Convertir base64 a HTMLImageElement para análisis
      const smileImg = new Image();
      await new Promise((resolve, reject) => {
        smileImg.onload = resolve;
        smileImg.onerror = reject;
        smileImg.src = smile;
      });

      const restImg = new Image();
      await new Promise((resolve, reject) => {
        restImg.onload = resolve;
        restImg.onerror = reject;
        restImg.src = rest;
      });

      // Detectar landmarks REALES con MediaPipe
      const smileResults = faceLandmarkerRef.current.detect(smileImg);
      const restResults = faceLandmarkerRef.current.detect(restImg);

      if (!smileResults.faceLandmarks || smileResults.faceLandmarks.length === 0) {
        throw new Error("No se detectó rostro en la imagen de sonrisa");
      }

      if (!restResults.faceLandmarks || restResults.faceLandmarks.length === 0) {
        throw new Error("No se detectó rostro en la imagen de reposo");
      }

      // Convertir landmarks de MediaPipe al formato esperado
      const smileLandmarks = smileResults.faceLandmarks[0];
      const restLandmarks = restResults.faceLandmarks[0];
      
      // Calcular métricas REALES
      const calculatedMetrics = computeMetrics({
        restLm: restLandmarks,
        smileLm: smileLandmarks,
        imgW: smileImg.width,
        imgH: smileImg.height
      });

      logger.log("Métricas calculadas:", calculatedMetrics);

      // Analizar características faciales
      const faceAnalysis = analyzeFaceCharacteristics(calculatedMetrics);
      
      // Generar recomendaciones
      const recommendations = generateSmileRecommendations(faceAnalysis, calculatedMetrics);
      
      // Generar texto de análisis completo
      const analysisText = generateAnalysisText(faceAnalysis, calculatedMetrics, recommendations);

      // Llamar a la edge function para simular la sonrisa
      const { data, error } = await supabase.functions.invoke("simulate-smile", {
        body: {
          imageBase64: smile,
          metrics: calculatedMetrics,
          faceAnalysis,
          recommendations
        }
      });

      if (error) {
        logger.error("Edge function error:", error);
        const errorObj = error as { message?: string };
        const msg = errorObj.message || "";

        // Si es un error de calidad de imagen, continuamos con fallback
        if (typeof msg === "string" && msg.includes("Calidad de imagen insuficiente")) {
          toast.info("Tu foto no cumple el umbral de calidad óptimo, pero continuaremos con una simulación básica.", { duration: 5000 });
          setSmileImage(smile);
          setIdealImage(smile);
          setAnalysis(analysisText);
          setMetrics(calculatedMetrics);
          setLandmarks(smileLandmarks);
          setSimulationData({ warnings: ["low_quality"] });
          setStep("contact");
          return;
        }

        // Para otros errores, mostrar mensaje y NO devolver a capture
        logger.error("Simulación falló pero continuamos con foto original:", msg);
        toast.info("No pudimos generar la simulación ideal, pero continuaremos con tu análisis facial.", { duration: 5000 });
        setSmileImage(smile);
        setIdealImage(smile);
        setAnalysis(analysisText);
        setMetrics(calculatedMetrics);
        setLandmarks(smileLandmarks);
        setSimulationData({ warnings: ["simulation_error"] });
        setStep("contact");
        return;
      }

      // Verificar si hay datos válidos
      if (!data || !data.simulatedImage) {
        toast.info("No se pudo generar la simulación automáticamente. Continuaremos con tu foto original.", { duration: 5000 });
        setSmileImage(smile);
        setIdealImage(smile);
        setAnalysis(analysisText);
        setMetrics(calculatedMetrics);
        setLandmarks(smileLandmarks);
        setSimulationData({ warnings: ["no_simulation"] });
        setStep("contact");
        return;
      }

      // Actualizar con las imágenes simuladas, métricas y landmarks
      setSmileImage(data.simulatedImage);
      setIdealImage(data.idealImage);
      setAnalysis(analysisText);
      setMetrics(calculatedMetrics);
      setLandmarks(smileLandmarks);
      setSimulationData(data);
      setStep("contact");
      
    } catch (error) {
      logger.error("Error processing smile:", error);
      toast.error(error instanceof Error ? error.message : "Error al procesar la imagen. Por favor intenta de nuevo con mejor iluminación.");
      setStep("capture");
    }
  };

  const handleContactSubmit = async (data: Record<string, unknown>) => {
    setContactData(data);
    setStep("results");
    track({ name: "contact_submitted", data: { email: data.email as string } });
    toast.success("¡Análisis completado!");
  };

  return (
    <div className="min-h-screen bg-background">
      {step === "hero" && <HeroSection onStart={() => setStep("capture")} />}
      
      {step === "capture" && <CaptureSection onCapture={handleCapture} />}
      
      {step === "loading" && <LoadingAnimation />}
      
      {step === "contact" && <ContactSection onSubmit={handleContactSubmit} />}
      
      {step === "results" && (
        <ResultsSection
          restImage={restImage}
          smileImage={smileImage}
          idealImage={idealImage}
          analysis={analysis}
          metrics={metrics}
          landmarks={landmarks}
          contactEmail={(contactData?.email as string) || ""}
          facialAnalysis={simulationData?.facialAnalysis}
          qualityScore={simulationData?.qualityScore}
        />
      )}

      <Footer />
    </div>
  );
};

export default IALab;

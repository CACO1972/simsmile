import { useState, useEffect, useRef } from "react";
import { HeroSection } from "@/components/HeroSection";
import { CaptureSection } from "@/components/CaptureSection";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { ResultsSection } from "@/components/ResultsSection";
import { Footer } from "@/components/Footer";
import { PaymentModal } from "@/components/PaymentModal";
import { BlurredSimulation } from "@/components/BlurredSimulation";
import { SkinAnalysisUpsell } from "@/components/SkinAnalysisUpsell";
import { toast } from "sonner";
import { track } from "@/lib/analytics";
import { getSupabase } from "@/integrations/supabase/safeClient";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { logger } from "@/lib/logger";
import type { Landmark } from "@/types/mediapipe";

type Step = "hero" | "capture" | "loading" | "preview" | "results";

const IALab = () => {
  const [step, setStep] = useState<Step>("hero");
  const [smileImage, setSmileImage] = useState<string>("");
  const [originalImage, setOriginalImage] = useState<string>("");
  const [idealImage, setIdealImage] = useState<string>("");
  const [analysis, setAnalysis] = useState<string>("");
  const [metrics, setMetrics] = useState<Record<string, unknown> | null>(null);
  const [landmarks, setLandmarks] = useState<Landmark[] | null>(null);
  
  const [simulationData, setSimulationData] = useState<{
    facialAnalysis?: Record<string, unknown>;
    qualityScore?: number;
    warnings?: string[];
  } | null>(null);
  const [perfectCorpAnalysis, setPerfectCorpAnalysis] = useState<any>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [remainingCredits, setRemainingCredits] = useState<number>(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSkinUpsell, setShowSkinUpsell] = useState(false);
  const [skinAnalysisData, setSkinAnalysisData] = useState<any>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
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

  // Check for payment success from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const orderId = urlParams.get('order');
    const packageType = urlParams.get('package');

    if (paymentStatus === 'success' && orderId) {
      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname);
      
      const savedEmail = localStorage.getItem('simsmile_email');
      
      if (packageType === 'skin_analysis') {
        toast.success('¡Análisis de piel desbloqueado!');
        // Trigger skin analysis
        if (savedEmail) {
          setUserEmail(savedEmail);
        }
      } else {
        toast.success('¡Pago exitoso! Tu simulación ha sido desbloqueada.');
        if (savedEmail) {
          setUserEmail(savedEmail);
          checkCredits(savedEmail);
        }
        // Go directly to results with unlocked simulation
        setStep("results");
        // Show skin upsell after payment
        setTimeout(() => {
          setShowSkinUpsell(true);
        }, 1500);
      }
    }
  }, []);

  const checkCredits = async (email: string) => {
    try {
      const { data, error } = await getSupabase().functions.invoke('flow-payment/check-credits', {
        body: { email }
      });
      if (!error && data) {
        setRemainingCredits(data.remainingCredits || 0);
      }
    } catch (e) {
      console.error('Error checking credits:', e);
    }
  };

  const handleStartFromHero = () => {
    // Ir directo a captura, sin pago previo
    setStep("capture");
  };

  const handleUnlockSimulation = async () => {
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (email: string) => {
    setUserEmail(email);
    localStorage.setItem('simsmile_email', email);
    checkCredits(email);
    setShowPaymentModal(false);
    setStep("results");
    
    // Mostrar upsell de skin después del pago exitoso
    setTimeout(() => {
      setShowSkinUpsell(true);
    }, 1000);
  };

  const handleCapture = async (smile: string) => {
    setOriginalImage(smile);
    setSmileImage(smile);
    setStep("loading");
    track({ name: "photos_captured" });

    try {
      // 1. Perfect Corp API Analysis (World-Class)
      console.log('🌟 Calling Perfect Corp API for professional analysis...');
      const { data: perfectCorpData, error: perfectCorpError } = await getSupabase().functions.invoke("perfect-corp-analysis", {
        body: { imageBase64: smile }
      });
      
      console.log('Perfect Corp response:', { data: perfectCorpData, error: perfectCorpError });

      if (perfectCorpError) {
        logger.error("Perfect Corp API error:", perfectCorpError);
        toast.info("Usando análisis estándar. Perfect Corp no disponible.", { duration: 3000 });
      } else if (perfectCorpData?.success) {
        setPerfectCorpAnalysis(perfectCorpData.data);
        logger.log("✅ Perfect Corp analysis completed:", perfectCorpData.data);
      } else if (perfectCorpData?.useFallback) {
        setPerfectCorpAnalysis(perfectCorpData.data);
        logger.log("⚠️ Using Perfect Corp fallback data");
      }

      // 2. Continue with existing MediaPipe + smile simulation
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

      // Detectar landmarks REALES con MediaPipe
      const smileResults = faceLandmarkerRef.current.detect(smileImg);

      if (!smileResults.faceLandmarks || smileResults.faceLandmarks.length === 0) {
        throw new Error("No se detectó rostro en la imagen");
      }

      // Convertir landmarks de MediaPipe al formato esperado
      const smileLandmarks = smileResults.faceLandmarks[0];
      
      // Calcular métricas REALES usando los mismos landmarks para rest y smile
      const calculatedMetrics = computeMetrics({
        restLm: smileLandmarks,
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
      const { data, error } = await getSupabase().functions.invoke("simulate-smile", {
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
          setStep("preview"); // Ir a preview con blur
          return;
        }

        // Para otros errores, mostrar mensaje y continuar
        logger.error("Simulación falló pero continuamos con foto original:", msg);
        toast.info("No pudimos generar la simulación ideal, pero continuaremos con tu análisis facial.", { duration: 5000 });
        setSmileImage(smile);
        setIdealImage(smile);
        setAnalysis(analysisText);
        setMetrics(calculatedMetrics);
        setLandmarks(smileLandmarks);
        setSimulationData({ warnings: ["simulation_error"] });
        setStep("preview");
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
        setStep("preview");
        return;
      }

      // Actualizar con las imágenes simuladas, métricas y landmarks
      setSmileImage(data.simulatedImage);
      setIdealImage(data.idealImage || data.simulatedImage);
      setAnalysis(analysisText);
      setMetrics(calculatedMetrics);
      setLandmarks(smileLandmarks);
      setSimulationData(data);
      setStep("preview"); // Ir a preview con blur para pedir pago
      
    } catch (error) {
      logger.error("Error processing smile:", error);
      toast.error(error instanceof Error ? error.message : "Error al procesar la imagen. Por favor intenta de nuevo con mejor iluminación.");
      setStep("capture");
    }
  };


  const handleSkinAnalysisComplete = (skinData: any) => {
    setSkinAnalysisData(skinData);
    setShowSkinUpsell(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {step === "hero" && <HeroSection onStart={handleStartFromHero} />}
      
      {step === "capture" && <CaptureSection onCapture={handleCapture} />}
      
      {step === "loading" && <LoadingAnimation userImage={originalImage} />}
      
      {step === "preview" && (
        <BlurredSimulation
          originalImage={originalImage}
          simulatedImage={smileImage}
          onUnlock={handleUnlockSimulation}
          loading={paymentLoading}
        />
      )}
      
      {step === "results" && (
        <ResultsSection
          restImage={originalImage}
          smileImage={smileImage}
          idealImage={idealImage}
          analysis={analysis}
          metrics={metrics}
          landmarks={landmarks}
          contactEmail={userEmail}
          facialAnalysis={simulationData?.facialAnalysis}
          qualityScore={simulationData?.qualityScore}
          perfectCorpAnalysis={perfectCorpAnalysis}
          skinAnalysisData={skinAnalysisData}
        />
      )}

      {/* Payment Modal */}
      <PaymentModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        onPaymentSuccess={handlePaymentSuccess}
        defaultPackage="basic"
      />

      {/* Skin Analysis Upsell - Post Payment */}
      <SkinAnalysisUpsell
        open={showSkinUpsell}
        onOpenChange={setShowSkinUpsell}
        imageBase64={originalImage}
        userEmail={userEmail}
        onComplete={handleSkinAnalysisComplete}
      />

      <Footer />
    </div>
  );
};

export default IALab;

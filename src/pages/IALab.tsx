import { useState, useEffect, useRef } from "react";
import { HeroSection } from "@/components/HeroSection";
import { CaptureSection } from "@/components/CaptureSection";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { ResultsSection } from "@/components/ResultsSection";
import { Footer } from "@/components/Footer";
import { PaymentModal } from "@/components/PaymentModal";
import { BlurredSimulation } from "@/components/BlurredSimulation";
import { SkinAnalysisUpsell } from "@/components/SkinAnalysisUpsell";
import { ConsentModal } from "@/components/ConsentModal";
import { toast } from "sonner";
import { track } from "@/lib/analytics";
import { getSupabase } from "@/integrations/supabase/safeClient";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { logger } from "@/lib/logger";
import { detectGender } from "@/lib/genderDetection";
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
  const [userEmail, setUserEmail] = useState<string>("");
  const [remainingCredits, setRemainingCredits] = useState<number>(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSkinUpsell, setShowSkinUpsell] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [skinAnalysisData, setSkinAnalysisData] = useState<any>(null);
  const [detectedGender, setDetectedGender] = useState<'male' | 'female' | 'neutral'>('neutral');
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

      // Restore session data saved before Flow.cl redirect
      const rawSession = sessionStorage.getItem('simsmile_session');
      if (rawSession) {
        try {
          const s = JSON.parse(rawSession);
          if (s.smileImage)          setSmileImage(s.smileImage);
          if (s.originalImage)       setOriginalImage(s.originalImage);
          if (s.idealImage)          setIdealImage(s.idealImage);
          if (s.analysis)            setAnalysis(s.analysis);
          if (s.metrics)             setMetrics(JSON.parse(s.metrics));
          if (s.simulationData)      setSimulationData(JSON.parse(s.simulationData));
          if (s.detectedGender)      setDetectedGender(s.detectedGender);
          sessionStorage.removeItem('simsmile_session');
        } catch (e) {
          console.error('Error restoring session:', e);
        }
      }

      const savedEmail = localStorage.getItem('simsmile_email');

      if (packageType === 'skin_analysis') {
        toast.success('¡Análisis de piel desbloqueado!');
        if (savedEmail) {
          setUserEmail(savedEmail);
          setShowSkinUpsell(true);
        }
      } else {
        toast.success('¡Pago exitoso! Tu simulación ha sido desbloqueada.');
        if (savedEmail) {
          setUserEmail(savedEmail);
          checkCredits(savedEmail);
        }
        setStep("results");
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
    // Check if already consented in this session
    const existing = localStorage.getItem('simsmile_consent');
    if (existing) {
      setStep("capture");
    } else {
      setShowConsentModal(true);
    }
  };

  const handleUnlockSimulation = async () => {
    // Upsell ANTES del pago: mostrar escaneo gratis de piel primero
    setShowSkinUpsell(true);
  };

  const handleSkinUpsellClose = (open: boolean) => {
    setShowSkinUpsell(open);
    // Cuando el usuario cierra el upsell sin comprar bundle/skin → ir al pago de simulación
    if (!open) {
      setPaymentLoading(true);
      setShowPaymentModal(true);
    }
  };

  const handlePaymentSuccess = (email: string) => {
    setUserEmail(email);
    localStorage.setItem('simsmile_email', email);
    checkCredits(email);
    setShowPaymentModal(false);
    setPaymentLoading(false);
    setStep("results");
  };

  const handleCapture = async (smile: string) => {
    setOriginalImage(smile);
    setSmileImage(smile);
    setStep("loading");
    track({ name: "photos_captured" });

    try {
      // 1. Detectar género para personalizar upsell (en paralelo)
      const genderPromise = detectGender(smile).then(gender => {
        setDetectedGender(gender);
        logger.log("🧑 Gender detected:", gender);
      }).catch(() => {
        setDetectedGender('neutral');
      });

      // Esperar a que termine la detección de género
      await genderPromise;

      // Continue with MediaPipe + smile simulation
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

      // Persist session before potential Flow.cl redirect
      // Compress images to avoid sessionStorage 5MB limit on iOS Safari
      const compressImage = (dataUrl: string, quality = 0.4): Promise<string> =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            // Cap at 600px to reduce size
            const maxDim = 600;
            const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
            canvas.width  = Math.round(img.width  * scale);
            canvas.height = Math.round(img.height * scale);
            canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', quality));
          };
          img.onerror = () => resolve(dataUrl); // fallback: use original
          img.src = dataUrl;
        });

      try {
        const [compressedSmile, compressedOriginal] = await Promise.all([
          compressImage(data.simulatedImage),
          compressImage(smile),
        ]);
        sessionStorage.setItem('simsmile_session', JSON.stringify({
          smileImage:     compressedSmile,
          originalImage:  compressedOriginal,
          idealImage:     compressedSmile,
          analysis:       analysisText,
          metrics:        JSON.stringify(calculatedMetrics),
          simulationData: JSON.stringify({ ...data, simulatedImage: undefined, idealImage: undefined }),
          detectedGender: detectedGender
        }));
      } catch (e) {
        // sessionStorage full or unavailable — non-critical, flow still works
        console.warn('Could not persist session:', e);
      }

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
    setStep("results");
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
          onRetake={() => {
            sessionStorage.removeItem('simsmile_session');
            setStep("capture");
          }}
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
          skinAnalysisData={skinAnalysisData}
        />
      )}

      {/* Consent Modal — Ley 19.628 */}
      <ConsentModal
        open={showConsentModal}
        onAccept={() => { setShowConsentModal(false); setStep("capture"); }}
        onReject={() => setShowConsentModal(false)}
      />

      {/* Payment Modal */}
      <PaymentModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        onPaymentSuccess={handlePaymentSuccess}
        defaultPackage="basic"
      />

      {/* Skin Analysis Upsell - ANTES del pago como "dulce" */}
      <SkinAnalysisUpsell
        open={showSkinUpsell}
        onOpenChange={handleSkinUpsellClose}
        imageBase64={originalImage}
        userEmail={userEmail}
        detectedGender={detectedGender}
        onComplete={handleSkinAnalysisComplete}
      />

      <Footer />
    </div>
  );
};

export default IALab;

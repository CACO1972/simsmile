import { useState } from "react";
import { HeroSection } from "@/components/HeroSection";
import { InstructionsSection } from "@/components/InstructionsSection";
import { CaptureSection } from "@/components/CaptureSection";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { ContactSection } from "@/components/ContactSection";
import { ResultsSection } from "@/components/ResultsSection";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";
import { track } from "@/lib/analytics";
import { supabase } from "@/integrations/supabase/client";

type Step = "hero" | "instructions" | "capture" | "loading" | "contact" | "results";

const IALab = () => {
  const [step, setStep] = useState<Step>("hero");
  const [restImage, setRestImage] = useState<string>("");
  const [smileImage, setSmileImage] = useState<string>("");
  const [idealImage, setIdealImage] = useState<string>("");
  const [analysis, setAnalysis] = useState<string>("");
  const [metrics, setMetrics] = useState<any>(null);
  const [contactData, setContactData] = useState<any>(null);

  const handleCapture = async (rest: string, smile: string) => {
    setRestImage(rest);
    setSmileImage(smile);
    setStep("loading");
    track({ name: "photos_captured" });

    try {
      // Importar funciones de análisis
      const { computeMetrics, analyzeFaceCharacteristics, generateSmileRecommendations, generateAnalysisText } = await import("@/lib/metrics");
      
      // Calcular métricas reales (aquí usamos datos simulados, pero deberían venir del análisis real de landmarks)
      const mockRestLandmarks = Array(478).fill(null).map(() => ({ x: Math.random(), y: Math.random() }));
      const mockSmileLandmarks = Array(478).fill(null).map(() => ({ x: Math.random(), y: Math.random() }));
      
      const calculatedMetrics = computeMetrics({
        restLm: mockRestLandmarks,
        smileLm: mockSmileLandmarks,
        imgW: 800,
        imgH: 800
      });

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

      if (error) throw error;

      // Actualizar con las imágenes simuladas y métricas
      setSmileImage(data.simulatedImage);
      setIdealImage(data.idealImage);
      setAnalysis(analysisText);
      setMetrics(calculatedMetrics);
      setStep("contact");
      
    } catch (error) {
      console.error("Error processing smile:", error);
      toast.error("Error al procesar la imagen. Por favor intenta de nuevo.");
      setStep("capture");
    }
  };

  const handleContactSubmit = (data: any) => {
    setContactData(data);
    setStep("results");
    track({ name: "contact_submitted", data: { email: data.email } });
    toast.success("¡Análisis completado!");
  };

  return (
    <div className="min-h-screen bg-background">
      {step === "hero" && <HeroSection onStart={() => setStep("instructions")} />}
      
      {step === "instructions" && <InstructionsSection onContinue={() => setStep("capture")} />}
      
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
          contactEmail={contactData?.email || ""}
        />
      )}

      <Footer />
    </div>
  );
};

export default IALab;

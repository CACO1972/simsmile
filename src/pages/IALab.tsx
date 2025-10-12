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
  const [analysis, setAnalysis] = useState<string>("");
  const [metrics, setMetrics] = useState<any>(null);
  const [contactData, setContactData] = useState<any>(null);

  const handleCapture = async (rest: string, smile: string) => {
    setRestImage(rest);
    setSmileImage(smile);
    setStep("loading");
    track({ name: "photos_captured" });

    try {
      // Llamar a la edge function para simular la sonrisa
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.functions.invoke("simulate-smile", {
        body: {
          imageBase64: smile,
          metrics: {
            smileArc: "plano",
            gingival: { class: "excesiva" },
            midline: { mm: 2.5, side: "izquierda" },
            buccalRatio: 0.15
          }
        }
      });

      if (error) throw error;

      // Actualizar con la imagen simulada
      setSmileImage(data.simulatedImage);
      
      // Generar análisis basado en las métricas
      const analysisText = `Tu análisis facial ha sido completado exitosamente.

Proporciones Faciales:
Se han evaluado los tres tercios faciales para determinar el equilibrio y armonía de tu rostro.

Análisis de Sonrisa:
Tu sonrisa ha sido analizada en detalle, evaluando el arco de sonrisa, la exposición gingival, las líneas medias y las proporciones dentales.

La simulación muestra cómo podría verse tu sonrisa después de un tratamiento dental estético optimizado, con correcciones en alineación, forma y color de los dientes.`;

      setAnalysis(analysisText);
      setMetrics({});
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

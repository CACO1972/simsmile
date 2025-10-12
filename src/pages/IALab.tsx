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

    // Simulate processing
    setTimeout(() => {
      setStep("contact");
      const mockAnalysis = `Tu análisis facial ha sido completado exitosamente.

Proporciones Faciales:
- Tercio Superior: 33%
- Tercio Medio: 34%
- Tercio Inferior: 33%

Análisis de Sonrisa:
- Arco de sonrisa: Consonante
- Exposición gingival: 2mm (ideal)
- Línea media dental: Coincidente con línea media facial
- Proporción bucal: 1.6:1 (armónica)

Tu sonrisa presenta proporciones equilibradas y armónicas. Los dientes presentan un tamaño adecuado en relación con las proporciones faciales.`;
      
      setAnalysis(mockAnalysis);
      setMetrics({ /* mock metrics */ });
    }, 3000);
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

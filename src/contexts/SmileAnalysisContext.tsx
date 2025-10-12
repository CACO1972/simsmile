import { createContext, useContext, useState, ReactNode } from "react";
import { SmileMetrics } from "@/lib/metrics";

interface SmileAnalysisState {
  // Datos del análisis
  analysisId: string | null;
  restImage: string | null;
  smileImage: string | null;
  metrics: SmileMetrics | null;
  simulatedImage: string | null;
  
  // Contacto
  contactSubmitted: boolean;
  contactData: {
    name: string;
    email: string;
    phone: string;
  } | null;
  
  // Navegación
  currentStep: number; // 1-7
  
  // Acciones
  setAnalysisId: (id: string) => void;
  setRestImage: (image: string) => void;
  setSmileImage: (image: string) => void;
  setMetrics: (metrics: SmileMetrics) => void;
  setSimulatedImage: (image: string) => void;
  setContactData: (data: { name: string; email: string; phone: string }) => void;
  setContactSubmitted: (submitted: boolean) => void;
  goToStep: (step: number) => void;
  resetAnalysis: () => void;
}

const SmileAnalysisContext = createContext<SmileAnalysisState | undefined>(undefined);

export function SmileAnalysisProvider({ children }: { children: ReactNode }) {
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [restImage, setRestImage] = useState<string | null>(null);
  const [smileImage, setSmileImage] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<SmileMetrics | null>(null);
  const [simulatedImage, setSimulatedImage] = useState<string | null>(null);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactData, setContactData] = useState<{ name: string; email: string; phone: string } | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const goToStep = (step: number) => {
    if (step >= 1 && step <= 7) {
      setCurrentStep(step);
    }
  };

  const resetAnalysis = () => {
    setAnalysisId(null);
    setRestImage(null);
    setSmileImage(null);
    setMetrics(null);
    setSimulatedImage(null);
    setContactSubmitted(false);
    setContactData(null);
    setCurrentStep(1);
  };

  return (
    <SmileAnalysisContext.Provider
      value={{
        analysisId,
        restImage,
        smileImage,
        metrics,
        simulatedImage,
        contactSubmitted,
        contactData,
        currentStep,
        setAnalysisId,
        setRestImage,
        setSmileImage,
        setMetrics,
        setSimulatedImage,
        setContactData,
        setContactSubmitted,
        goToStep,
        resetAnalysis,
      }}
    >
      {children}
    </SmileAnalysisContext.Provider>
  );
}

export function useSmileAnalysis() {
  const context = useContext(SmileAnalysisContext);
  if (context === undefined) {
    throw new Error("useSmileAnalysis must be used within SmileAnalysisProvider");
  }
  return context;
}

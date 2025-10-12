import { useState } from "react";
import CameraCapture from "./CameraCapture";
import { Logo } from "./Logo";

interface CaptureSectionProps {
  onCapture: (restImage: string, smileImage: string) => void;
}

export const CaptureSection = ({ onCapture }: CaptureSectionProps) => {
  const [restImage, setRestImage] = useState<string>("");
  const [step, setStep] = useState<"rest" | "smile">("rest");

  const handleRestCapture = (image: string) => {
    setRestImage(image);
    setStep("smile");
  };

  const handleSmileCapture = (image: string) => {
    onCapture(restImage, image);
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-8">
      <div className="absolute top-8 left-8">
        <Logo size="sm" className="opacity-50" />
      </div>

      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col justify-center">
        {step === "rest" ? (
          <CameraCapture
            onCapture={handleRestCapture}
            title="Foto en Reposo"
            description="Toma una foto de tu rostro con expresión neutral, labios cerrados"
          />
        ) : (
          <CameraCapture
            onCapture={handleSmileCapture}
            title="Foto Sonriendo"
            description="Ahora sonríe naturalmente mostrando tus dientes"
          />
        )}
      </div>
    </div>
  );
};

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload, RotateCcw } from "lucide-react";
import FaceGuideOverlay from "./FaceGuideOverlay";

interface CameraCaptureProps {
  onCapture: (imageBase64: string) => void;
  title: string;
  description?: string;
}

export default function CameraCapture({ onCapture, title, description }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string>("");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  const startCamera = async (mode: "user" | "environment" = facingMode) => {
    try {
      // Stop any existing stream before starting a new one
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        console.error("getUserMedia not supported in this browser");
        alert("Tu navegador no soporta acceso a la cámara. Intenta con otro navegador o actualiza.");
        return;
      }

      const constraintsPrimary: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const constraintsFallback: MediaStreamConstraints = {
        video: true,
        audio: false,
      };

      let mediaStream: MediaStream | null = null;

      try {
        mediaStream = await navigator.mediaDevices.getUserMedia(constraintsPrimary);
      } catch (err) {
        console.warn("Primary constraints failed, trying fallback", err);
        mediaStream = await navigator.mediaDevices.getUserMedia(constraintsFallback);
      }

      if (videoRef.current && mediaStream) {
        videoRef.current.srcObject = mediaStream;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn("Video play() was prevented by the browser", playErr);
        }
      }

      setFacingMode(mode);
      setStream(mediaStream);
      setIsCameraActive(true);
    } catch (error: any) {
      console.error("Error accessing camera:", error);
      const msg =
        error?.name === "NotAllowedError"
          ? "Permiso denegado. Activa el acceso a la cámara en los ajustes del navegador."
          : error?.name === "NotFoundError"
          ? "No se encontró una cámara disponible en este dispositivo."
          : "No se pudo acceder a la cámara. Verifica permisos o intenta con otro navegador.";
      alert(msg);
    }
  };

  const handleStartCamera = () => startCamera();

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL("image/jpeg", 0.9);
    
    stopCamera();
    setCapturedImage(imageData);
    onCapture(imageData);
  };

  const switchCamera = async () => {
    const newMode = facingMode === "user" ? "environment" : "user";
    await startCamera(newMode);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setCapturedImage(result);
      onCapture(result);
    };
    reader.readAsDataURL(file);
  };

  const retake = () => {
    setCapturedImage("");
    startCamera();
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      {!capturedImage ? (
        <>
          {!isCameraActive ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={handleStartCamera}
                  size="lg"
                  className="w-full h-28 bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl shadow-primary/30 hover:shadow-primary/40 transition-all hover:scale-105 border border-primary/20"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Camera className="h-7 w-7" />
                    <span className="text-lg font-semibold">Usar Cámara</span>
                  </div>
                </Button>
                
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  size="lg"
                  className="w-full h-28 bg-gradient-to-br from-accent/10 to-accent/5 hover:from-accent/20 hover:to-accent/10 border-2 border-accent/30 hover:border-accent/50 shadow-md hover:shadow-lg transition-all hover:scale-105"
                  variant="outline"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-7 w-7 text-accent" />
                    <span className="text-lg font-semibold">Subir desde Galería</span>
                  </div>
                </Button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden border-4 border-primary bg-black aspect-[3/4] max-w-md mx-auto">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                
                {/* Marco de guía superpuesto */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
                  <FaceGuideOverlay />
                </div>

                {/* Instrucciones overlay */}
                <div className="absolute top-4 left-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-3">
                  <p className="text-white text-sm font-medium text-center">
                    Alinea tu rostro con el óvalo y tu boca con la zona inferior
                  </p>
                </div>
              </div>

              <canvas ref={canvasRef} className="hidden" />

              <div className="flex gap-3 max-w-md mx-auto">
                <Button
                  onClick={switchCamera}
                  variant="outline"
                  size="lg"
                  className="flex-1 border-2 hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                  <RotateCcw className="mr-2 h-5 w-5" />
                  Cambiar Cámara
                </Button>
                
                <Button
                  onClick={capturePhoto}
                  size="lg"
                  className="flex-[2] bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all hover:scale-105"
                >
                  <Camera className="mr-2 h-5 w-5" />
                  Capturar Foto
                </Button>
              </div>

              <Button
                onClick={stopCamera}
                variant="ghost"
                className="w-full max-w-md mx-auto"
              >
                Cancelar
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl overflow-hidden border border-border bg-muted/30 max-w-md mx-auto">
            <img src={capturedImage} alt="Captured" className="w-full h-auto object-contain" />
          </div>
          
          <div className="flex gap-3 max-w-md mx-auto">
            <Button
              onClick={retake}
              variant="outline"
              size="lg"
              className="flex-1 border-2 hover:border-accent/50 hover:bg-accent/5 transition-all hover:scale-105"
            >
              <RotateCcw className="mr-2 h-5 w-5" />
              Tomar de Nuevo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

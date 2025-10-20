import { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload, RotateCcw, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { logger } from "@/lib/logger";

interface CameraCaptureProps {
  onCapture: (imageBase64: string) => void;
  title: string;
  description?: string;
  showGuide?: boolean;
}

export default function CameraCapture({ onCapture, title, description, showGuide = true }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string>("");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user"); // Always starts in selfie mode
  const [cameraError, setCameraError] = useState<string>("");

  const startCamera = async (mode: "user" | "environment" = "user") => {
    try {
      setCameraError(""); // Clear any previous errors
      
      // Stop any existing stream before starting a new one
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        logger.error("getUserMedia not supported in this browser");
        const errorMsg = "Tu navegador no soporta acceso a la cámara. Intenta con Chrome, Firefox o Safari actualizado.";
        setCameraError(errorMsg);
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
        logger.warn("Primary constraints failed, trying fallback", err);
        mediaStream = await navigator.mediaDevices.getUserMedia(constraintsFallback);
      }

      if (videoRef.current && mediaStream) {
        videoRef.current.srcObject = mediaStream;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          logger.warn("Video play() was prevented by the browser", playErr);
        }
      }

      setFacingMode(mode);
      setStream(mediaStream);
      setIsCameraActive(true);
    } catch (error) {
      logger.error("Error accessing camera:", error);
      
      let errorMsg = "";
      let instructions = "";
      
      if (error && typeof error === 'object' && 'name' in error) {
        const err = error as { name: string };
        
        if (err.name === "NotAllowedError") {
          errorMsg = "Permiso denegado para acceder a la cámara";
          instructions = "En Android Chrome:\n1. Toca el icono de candado/info en la barra de direcciones\n2. Activa los permisos de Cámara\n3. Recarga la página\n\nEn iOS Safari:\n1. Ve a Ajustes > Safari > Cámara\n2. Cambia a 'Permitir'\n3. Recarga la página";
        } else if (err.name === "NotFoundError") {
          errorMsg = "No se encontró cámara disponible";
          instructions = "Verifica que tu dispositivo tenga una cámara funcional y que no esté siendo usada por otra aplicación.";
        } else if (err.name === "NotReadableError") {
          errorMsg = "La cámara está siendo usada por otra aplicación";
          instructions = "Cierra otras aplicaciones que puedan estar usando la cámara e intenta de nuevo.";
        } else if (err.name === "SecurityError") {
          errorMsg = "Error de seguridad al acceder a la cámara";
          instructions = "Asegúrate de estar accediendo desde una conexión segura (HTTPS). También puedes intentar usar 'Subir desde Galería' como alternativa.";
        } else {
          errorMsg = "No se pudo acceder a la cámara";
          instructions = "Verifica los permisos del navegador o intenta usar 'Subir desde Galería' como alternativa.";
        }
      } else {
        errorMsg = "No se pudo acceder a la cámara";
        instructions = "Verifica los permisos del navegador o intenta usar 'Subir desde Galería' como alternativa.";
      }
      
      setCameraError(`${errorMsg}. ${instructions}`);
    }
  };

  const handleStartCamera = () => startCamera();

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  }, [stream]);

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
    setCameraError("");
    startCamera();
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-heading font-bold text-center text-foreground mb-6">{title}</h3>
        {description && (
          <p className="text-muted-foreground text-center max-w-lg mx-auto text-lg font-medium mb-6">{description}</p>
        )}
      </div>

      {!capturedImage ? (
        <>
          {!isCameraActive ? (
            <div className="space-y-6">
              {/* Error Alert */}
              {cameraError && (
                <Alert variant="destructive" className="max-w-2xl mx-auto">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error de Cámara</AlertTitle>
                  <AlertDescription className="whitespace-pre-line text-sm">
                    {cameraError}
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Instructions list */}
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-6 max-w-2xl mx-auto">
                <ul className="space-y-3 text-left">
                  <li className="flex items-start gap-3">
                    <span className="text-primary text-xl mt-0.5">✓</span>
                    <span className="text-foreground">Toma una foto de rostro completo con sonrisa natural.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary text-xl mt-0.5">✓</span>
                    <span className="text-foreground">Asegúrate de estar en primer plano y centrado.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary text-xl mt-0.5">✓</span>
                    <span className="text-foreground">Sonríe con los dientes en <span className="text-primary font-semibold">posición de mordida natural</span>, sin protruir.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary text-xl mt-0.5">✓</span>
                    <span className="text-foreground">Es necesaria una iluminación adecuada.</span>
                  </li>
                </ul>
              </div>
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
              <div className="relative rounded-xl overflow-hidden bg-black aspect-[3/4] max-w-md mx-auto">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                
                {/* Marco rectangular tipo retrato */}
                {showGuide && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[75%] aspect-[3/4] border-4 border-primary/60 rounded-lg" />
                  </div>
                )}
              </div>

              <canvas ref={canvasRef} className="hidden" />

              <div className="grid grid-cols-1 sm:flex gap-3 max-w-md mx-auto px-4">
                <Button
                  onClick={switchCamera}
                  variant="outline"
                  size="lg"
                  className="w-full sm:flex-1 border-2 hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                  <RotateCcw className="mr-2 h-5 w-5" />
                  Cambiar Cámara
                </Button>
                
                <Button
                  onClick={capturePhoto}
                  size="lg"
                  className="w-full sm:flex-[2] bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all hover:scale-105"
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

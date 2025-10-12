import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload, RotateCcw } from "lucide-react";
import faceGuideFrame from "@/assets/face-guide-frame.png";

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

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      
      setStream(mediaStream);
      setIsCameraActive(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("No se pudo acceder a la cámara. Por favor, verifica los permisos.");
    }
  };

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
    
    setCapturedImage(imageData);
    onCapture(imageData);
    stopCamera();
  };

  const switchCamera = async () => {
    stopCamera();
    setFacingMode(prev => prev === "user" ? "environment" : "user");
    await startCamera();
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
                  onClick={startCamera}
                  size="lg"
                  className="w-full h-24"
                  variant="default"
                >
                  <Camera className="mr-2 h-6 w-6" />
                  <span className="text-lg">Usar Cámara</span>
                </Button>
                
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  size="lg"
                  className="w-full h-24"
                  variant="outline"
                >
                  <Upload className="mr-2 h-6 w-6" />
                  <span className="text-lg">Subir desde Galería</span>
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
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <img
                    src={faceGuideFrame}
                    alt="Face guide"
                    className="w-[80%] h-[80%] object-contain opacity-60"
                  />
                </div>

                {/* Instrucciones overlay */}
                <div className="absolute top-4 left-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-3">
                  <p className="text-white text-sm font-medium text-center">
                    Alinea tu rostro con el marco guía
                  </p>
                </div>
              </div>

              <canvas ref={canvasRef} className="hidden" />

              <div className="flex gap-3 max-w-md mx-auto">
                <Button
                  onClick={switchCamera}
                  variant="outline"
                  size="lg"
                  className="flex-1"
                >
                  <RotateCcw className="mr-2 h-5 w-5" />
                  Cambiar Cámara
                </Button>
                
                <Button
                  onClick={capturePhoto}
                  size="lg"
                  className="flex-[2]"
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
              className="flex-1"
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

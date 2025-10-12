import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import cameraFrame from "@/assets/camera-frame.png";

interface CameraCaptureProps {
  mode: "rest" | "smile";
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

export function CameraCapture({ mode, onCapture, onClose }: CameraCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const shotTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 420, height: 560 }
      });
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
    } catch (error) {
      console.error('Error al acceder a la cámara:', error);
      toast.error('No se pudo acceder a la cámara');
      onClose();
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (shotTimeoutRef.current) {
      clearTimeout(shotTimeoutRef.current);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Voltear horizontal (la vista está espejada)
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = canvas.toDataURL('image/png', 0.95);
    onCapture(imageData);
    toast.success(`Foto ${mode === 'rest' ? 'en reposo' : 'sonriendo'} capturada`);
    stopCamera();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className="bg-card rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-primary/10 border-b border-border p-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Cara frontal
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {mode === 'rest' ? 'Foto en reposo' : 'Foto sonriendo'}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
          
          <div className="relative bg-black aspect-[3/4]">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ transform: 'scaleX(-1)' }}
              className="w-full h-full object-cover"
            />
            
            {/* Overlay con marco de rostro */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <img 
                src={cameraFrame}
                alt="Marco de captura"
                className="w-full h-full max-w-none max-h-none object-contain origin-center scale-[1.6] md:scale-[1.35]"
              />
            </div>
              
            </div>
          
          <div className="p-4 bg-card/50 border-t border-border">
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground bg-accent/20 p-3 rounded-lg leading-relaxed">
                <p>
                  Centra tu rostro en el marco y alinea tu cara con las guías. 
                  {mode === 'rest' ? ' Expresión neutral.' : ' Sonríe naturalmente.'}
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={capturePhoto}
                  size="lg"
                  variant="outline"
                  className="flex-1"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Tomar foto
                </Button>
                <Button
                  variant="outline"
                  onClick={onClose}
                  size="lg"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

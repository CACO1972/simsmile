import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import faceFrame from "@/assets/face-frame.png";

interface CameraReadiness {
  faceDetected: boolean;
  rollOK: boolean;
  yawOK: boolean;
  sizeOK: boolean;
  centerOK: boolean;
}

interface CameraCaptureProps {
  mode: "rest" | "smile";
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

async function loadMediaPipeScripts() {
  if ((window as any).FaceMesh) return;
  
  const scripts = [
    'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
    'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js'
  ];
  
  for (const src of scripts) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
}

export function CameraCapture({ mode, onCapture, onClose }: CameraCaptureProps) {
  const [showInstructions, setShowInstructions] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captureReadiness, setCaptureReadiness] = useState<CameraReadiness>({
    faceDetected: false,
    rollOK: false,
    yawOK: false,
    sizeOK: false,
    centerOK: false
  });
  const [autoCapturing, setAutoCapturing] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const faceMeshRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
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

      updateOverlay();
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
    if (cameraRef.current) {
      cameraRef.current.stop();
    }
  };

  const onFaceMeshResults = (_results: any) => {
    // Detección automática deshabilitada en la versión simple.
    setCaptureReadiness({
      faceDetected: false,
      rollOK: false,
      yawOK: false,
      sizeOK: false,
      centerOK: false
    });
  };

  const scheduleAutoShot = () => {
    if (shotTimeoutRef.current) {
      clearTimeout(shotTimeoutRef.current);
    }
    shotTimeoutRef.current = window.setTimeout(() => {
      if (!autoCapturing) {
        setAutoCapturing(true);
        capturePhoto();
      }
    }, 700);
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

  const drawCalibrationFrame = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Limpiar canvas
    ctx.clearRect(0, 0, width, height);
    
    // Marco del rostro centrado (80% del alto de la imagen)
    const frameHeight = height * 0.8;
    const frameWidth = frameHeight * 0.7; // Proporción aproximada de un rostro
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Dibujar contorno de la cabeza (forma ovalada)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    // Parte superior de la cabeza (semicírculo)
    const topRadius = frameWidth / 2;
    const headTop = centerY - frameHeight / 2;
    ctx.arc(centerX, headTop + topRadius, topRadius, Math.PI, 0, false);
    
    // Lados de la cara
    const jawWidth = frameWidth * 0.85;
    const jawHeight = frameHeight - topRadius;
    ctx.lineTo(centerX + jawWidth / 2, headTop + topRadius + jawHeight * 0.6);
    
    // Mandíbula (curva suave)
    ctx.quadraticCurveTo(
      centerX + jawWidth / 2, 
      centerY + frameHeight / 2,
      centerX, 
      centerY + frameHeight / 2
    );
    ctx.quadraticCurveTo(
      centerX - jawWidth / 2,
      centerY + frameHeight / 2,
      centerX - jawWidth / 2,
      headTop + topRadius + jawHeight * 0.6
    );
    
    ctx.lineTo(centerX - topRadius, headTop + topRadius);
    ctx.stroke();
    
    // Línea guía vertical (centro)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - frameHeight / 2);
    ctx.lineTo(centerX, centerY + frameHeight / 2);
    ctx.stroke();
    
    // Línea guía horizontal (ojos)
    ctx.beginPath();
    ctx.moveTo(centerX - frameWidth / 2, centerY - frameHeight * 0.1);
    ctx.lineTo(centerX + frameWidth / 2, centerY - frameHeight * 0.1);
    ctx.stroke();
    
    ctx.setLineDash([]);
  };

  const updateOverlay = () => {
    if (!videoRef.current || !overlayCanvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = overlayCanvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx || video.readyState < 2) {
      requestAnimationFrame(updateOverlay);
      return;
    }
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCalibrationFrame(ctx, canvas.width, canvas.height);
    
    requestAnimationFrame(updateOverlay);
  };

  // Pantalla de instrucciones
  if (showInstructions) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md">
          <div className="bg-card rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-primary/10 border-b border-border p-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Cara frontal
                </h3>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Imagen de ejemplo */}
              <div className="relative aspect-[3/4] bg-muted rounded-lg overflow-hidden">
                <img 
                  src={faceFrame}
                  alt="Ejemplo de posición"
                  className="w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[70%] h-[80%] border-2 border-white rounded-full opacity-80" />
                </div>
              </div>
              
              {/* Consejo */}
              <div className="bg-accent/30 p-4 rounded-lg">
                <p className="text-sm text-center leading-relaxed text-foreground">
                  <strong>Consejo:</strong> Ajusta la zona de la cara en el marco elegido para asegurar una distancia adecuada y estandarizar tus fotos.
                  {mode === 'rest' ? ' Mantén una expresión neutral.' : ' Sonríe naturalmente.'}
                </p>
              </div>
              
              {/* Botón entendí */}
              <Button
                onClick={() => {
                  setShowInstructions(false);
                  startCamera();
                }}
                size="lg"
                className="w-full"
              >
                Entendí
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <div className="absolute inset-0 pointer-events-none">
              <canvas
                ref={overlayCanvasRef}
                className="absolute inset-0 w-full h-full"
              />
            </div>
              
            </div>
          
          <div className="p-4 bg-card/50 border-t border-border">
            <div className="space-y-3">
              {autoCapturing && (
                <div className="bg-green-500/20 text-green-700 dark:text-green-400 p-3 rounded-lg text-center font-semibold animate-pulse">
                  ¡Capturando en breve!
                </div>
              )}
              
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
                  disabled={autoCapturing}
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

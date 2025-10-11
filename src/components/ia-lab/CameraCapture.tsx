import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CameraReadiness {
  frameDetected: boolean;
  faceDetected: boolean;
  goodLighting: boolean;
  centered: boolean;
}

interface CameraCaptureProps {
  mode: "rest" | "smile";
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

async function ensureFilesetResolver() {
  if ((window as any).FilesetResolver) return;
  // @ts-ignore - Dynamic CDN import
  const mod = await import("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/vision_bundle.mjs");
  (window as any).FilesetResolver = mod.FilesetResolver;
}

export function CameraCapture({ mode, onCapture, onClose }: CameraCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captureReadiness, setCaptureReadiness] = useState<CameraReadiness>({
    frameDetected: false,
    faceDetected: false,
    goodLighting: false,
    centered: false
  });
  const [autoCapturing, setAutoCapturing] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const detectionIntervalRef = useRef<number | null>(null);
  const landmarkerRef = useRef<any>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 1280, height: 720 }
      });
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }

      await ensureFilesetResolver();
      const vision = await (window as any).FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      // @ts-ignore - Dynamic CDN import
      const { FaceLandmarker } = await import("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/vision_bundle.mjs");
      landmarkerRef.current = await (FaceLandmarker as any).createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-assets/face_landmarker.task"
        },
        numFaces: 1,
        runningMode: "VIDEO",
        outputFaceBlendshapes: false
      });

      startAutoDetection();
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
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
  };

  const startAutoDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
    detectionIntervalRef.current = window.setInterval(() => {
      checkCaptureQuality();
    }, 500);
  };

  const checkCaptureQuality = async () => {
    if (!videoRef.current || !landmarkerRef.current || autoCapturing) return;

    const video = videoRef.current;
    if (video.readyState < 2) return;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.drawImage(video, 0, 0);
      
      const frameDetected = detectGreenFrame(ctx, canvas.width, canvas.height);
      const timestamp = performance.now();
      const results = await landmarkerRef.current.detectForVideo(video, timestamp);
      const faceDetected = results?.faceLandmarks?.length > 0;
      const goodLighting = checkLighting(ctx, canvas.width, canvas.height);
      const centered = faceDetected && checkFaceCentered(results.faceLandmarks[0], canvas.width, canvas.height);
      
      const readiness = { frameDetected, faceDetected, goodLighting, centered };
      setCaptureReadiness(readiness);
      
      if (frameDetected && faceDetected && goodLighting && centered) {
        setAutoCapturing(true);
        setTimeout(() => {
          capturePhoto();
        }, 300);
      }
    } catch (error) {
      console.error('Error en detección automática:', error);
    }
  };

  const detectGreenFrame = (ctx: CanvasRenderingContext2D, width: number, height: number): boolean => {
    const frameSize = Math.min(width, height) * 0.15;
    const centerX = width / 2;
    const centerY = height * 0.75;
    
    const samplePoints = [
      [centerX - frameSize/2, centerY - frameSize/2],
      [centerX + frameSize/2, centerY - frameSize/2],
      [centerX - frameSize/2, centerY + frameSize/2],
      [centerX + frameSize/2, centerY + frameSize/2],
    ];
    
    let greenPixels = 0;
    samplePoints.forEach(([x, y]) => {
      const imageData = ctx.getImageData(x, y, 10, 10);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        if (g > 150 && g > r * 1.5 && g > b * 1.5) {
          greenPixels++;
        }
      }
    });
    
    return greenPixels > 20;
  };

  const checkLighting = (ctx: CanvasRenderingContext2D, width: number, height: number): boolean => {
    const centerX = width / 2;
    const centerY = height / 2;
    const sampleSize = 100;
    
    const imageData = ctx.getImageData(
      centerX - sampleSize/2,
      centerY - sampleSize/2,
      sampleSize,
      sampleSize
    );
    
    let brightness = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
      brightness += (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
    }
    brightness /= (sampleSize * sampleSize);
    
    return brightness > 80 && brightness < 220;
  };

  const checkFaceCentered = (landmarks: any[], width: number, height: number): boolean => {
    const nose = landmarks[1];
    const centerX = width / 2;
    const centerY = height / 2;
    
    const noseX = nose.x * width;
    const noseY = nose.y * height;
    
    const marginX = width * 0.2;
    const marginY = height * 0.2;
    
    return Math.abs(noseX - centerX) < marginX && Math.abs(noseY - centerY) < marginY;
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0);
    drawCalibrationFrame(ctx, canvas.width, canvas.height);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.95);
    onCapture(imageData);
    toast.success(`✓ Foto de ${mode === 'rest' ? 'reposo' : 'sonrisa'} capturada automáticamente`);
    stopCamera();
    onClose();
  };

  const drawCalibrationFrame = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Marco facial ovalado en el centro superior
    const frameWidth = width * 0.7;
    const frameHeight = height * 0.8;
    const frameX = width / 2;
    const frameY = height * 0.1 + frameHeight / 2;
    
    // Dibujar marco ovalado
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(frameX, frameY, frameWidth / 2, frameHeight / 2, 0, 0, Math.PI * 2);
    ctx.stroke();
    
    // Reglas milimétricas laterales
    const rulerWidth = 20;
    const rulerHeight = height;
    const tickSpacing = 10; // Espacio entre marcas (simula 10mm)
    
    // Regla izquierda
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(0, 0, rulerWidth, rulerHeight);
    
    // Marcas de la regla izquierda
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.lineWidth = 1;
    for (let y = 0; y < rulerHeight; y += tickSpacing) {
      ctx.beginPath();
      ctx.moveTo(rulerWidth, y);
      ctx.lineTo(rulerWidth - (y % 50 === 0 ? 15 : 8), y);
      ctx.stroke();
      
      // Números cada 50 unidades
      if (y % 50 === 0 && y > 0) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.font = '10px monospace';
        ctx.textAlign = 'right';
        ctx.save();
        ctx.translate(rulerWidth - 18, y);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(String(y / 10), 0, 0);
        ctx.restore();
      }
    }
    
    // Regla derecha
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(width - rulerWidth, 0, rulerWidth, rulerHeight);
    
    // Marcas de la regla derecha
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
    for (let y = 0; y < rulerHeight; y += tickSpacing) {
      ctx.beginPath();
      ctx.moveTo(width - rulerWidth, y);
      ctx.lineTo(width - rulerWidth + (y % 50 === 0 ? 15 : 8), y);
      ctx.stroke();
      
      // Números cada 50 unidades
      if (y % 50 === 0 && y > 0) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.font = '10px monospace';
        ctx.textAlign = 'left';
        ctx.save();
        ctx.translate(width - rulerWidth + 18, y);
        ctx.rotate(Math.PI / 2);
        ctx.fillText(String(y / 10), 0, 0);
        ctx.restore();
      }
    }
    
    // Indicador inferior
    const indicatorY = height - 30;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(width / 2 - 150, indicatorY - 10, 300, 30);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Coloca tu rostro dentro del marco...', width / 2, indicatorY + 8);
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

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl">
        <div className="bg-card rounded-xl overflow-hidden shadow-2xl">
          <div className="bg-primary/10 border-b border-border p-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Captura con Marco Calibrado
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {mode === 'rest' ? 'Foto en reposo' : 'Foto sonriendo'} - Coloca una tarjeta en el marco verde
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
          
          <div className="relative bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-auto"
            />
            <canvas
              ref={overlayCanvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
            />
          </div>
          
          <div className="p-4 bg-card/50 border-t border-border">
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Detección Automática
                  </h4>
                  {autoCapturing && (
                    <span className="text-xs font-bold text-green-600 dark:text-green-400 animate-pulse">
                      ¡Capturando!
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className={`flex items-center gap-2 p-2 rounded ${
                    captureReadiness.frameDetected ? 'bg-green-500/20 text-green-700 dark:text-green-400' : 'bg-muted text-muted-foreground'
                  }`}>
                    {captureReadiness.frameDetected ? '✓' : '○'} Marco detectado
                  </div>
                  <div className={`flex items-center gap-2 p-2 rounded ${
                    captureReadiness.faceDetected ? 'bg-green-500/20 text-green-700 dark:text-green-400' : 'bg-muted text-muted-foreground'
                  }`}>
                    {captureReadiness.faceDetected ? '✓' : '○'} Rostro detectado
                  </div>
                  <div className={`flex items-center gap-2 p-2 rounded ${
                    captureReadiness.goodLighting ? 'bg-green-500/20 text-green-700 dark:text-green-400' : 'bg-muted text-muted-foreground'
                  }`}>
                    {captureReadiness.goodLighting ? '✓' : '○'} Buena iluminación
                  </div>
                  <div className={`flex items-center gap-2 p-2 rounded ${
                    captureReadiness.centered ? 'bg-green-500/20 text-green-700 dark:text-green-400' : 'bg-muted text-muted-foreground'
                  }`}>
                    {captureReadiness.centered ? '✓' : '○'} Bien centrado
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm text-muted-foreground bg-accent/20 p-3 rounded-lg">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-medium text-foreground mb-1">Instrucciones:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Coloca una tarjeta de crédito en el marco verde (ancho: 85.6mm)</li>
                    <li>• Mantén el rostro centrado y bien iluminado</li>
                    <li>• {mode === 'rest' ? 'Mantén una expresión neutral' : 'Sonríe naturalmente'}</li>
                    <li>• <strong>La foto se capturará automáticamente</strong> cuando todo esté perfecto</li>
                  </ul>
                </div>
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
                  Capturar Manual
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

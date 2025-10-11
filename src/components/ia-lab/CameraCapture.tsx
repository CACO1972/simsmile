import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
      await loadMediaPipeScripts();
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 420, height: 560 }
      });
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }

      const FaceMesh = (window as any).FaceMesh;
      faceMeshRef.current = new FaceMesh({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
      });
      
      faceMeshRef.current.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.6
      });
      
      faceMeshRef.current.onResults(onFaceMeshResults);

      const Camera = (window as any).Camera;
      cameraRef.current = new Camera(videoRef.current, {
        onFrame: async () => {
          if (faceMeshRef.current && !autoCapturing) {
            await faceMeshRef.current.send({ image: videoRef.current });
          }
        },
        width: 420,
        height: 560
      });
      cameraRef.current.start();

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

  const onFaceMeshResults = (results: any) => {
    const hasFace = results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0;
    
    if (!hasFace || autoCapturing) {
      setCaptureReadiness({
        faceDetected: false,
        rollOK: false,
        yawOK: false,
        sizeOK: false,
        centerOK: false
      });
      return;
    }

    const lm = results.multiFaceLandmarks[0]; // 468 landmarks normalizados [0..1]
    
    // Ojos (puntos aproximados)
    const L = lm[33];   // ojo derecho (imagen espejada)
    const R = lm[263];  // ojo izquierdo
    const nose = lm[1]; // nariz
    
    // Ángulo roll (inclinación) usando ojos
    const dx = R.x - L.x;
    const dy = R.y - L.y;
    const rollDeg = Math.atan2(dy, dx) * 180 / Math.PI;
    const rollOK = Math.abs(rollDeg) < 5; // ±5°
    
    // Estimar yaw (giro Y) por simetría nariz vs línea ojos
    const midX = (R.x + L.x) / 2;
    const yawDeg = (nose.x - midX) * 200; // factor empírico
    const yawOK = Math.abs(yawDeg) < 6;   // ±6°
    
    // Tamaño (distancia): distancia interpupilar normalizada
    const ipd = Math.hypot(dx, dy);
    const sizeOK = ipd > 0.08 && ipd < 0.14; // rango "3/4" típico a ~35–40 cm
    
    // Centrado (nariz cerca del centro del cuadro 0.5,0.5)
    const centerOK = Math.abs(nose.x - 0.5) < 0.08 && Math.abs(nose.y - 0.52) < 0.10;
    
    const readiness = {
      faceDetected: true,
      rollOK,
      yawOK,
      sizeOK,
      centerOK
    };
    
    setCaptureReadiness(readiness);
    
    // Si todo OK durante 700 ms → capturar
    const allOK = rollOK && yawOK && sizeOK && centerOK;
    if (allOK) {
      scheduleAutoShot();
    }
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
    toast.success(`✓ Foto de ${mode === 'rest' ? 'reposo' : 'sonrisa'} capturada automáticamente`);
    stopCamera();
    onClose();
  };

  const drawCalibrationFrame = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Limpiar canvas
    ctx.clearRect(0, 0, width, height);
    
    const rulerWidth = 22;
    const rulerHeight = height;
    
    // Reglas laterales con marcas cada 3px (simula mm)
    ctx.fillStyle = 'rgba(40, 40, 40, 0.4)';
    ctx.fillRect(0, 0, rulerWidth, rulerHeight);
    ctx.fillRect(width - rulerWidth, 0, rulerWidth, rulerHeight);
    
    // Marcas de regla
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 1;
    for (let y = 0; y < rulerHeight; y += 3) {
      const isMajor = y % 15 === 0;
      const len = isMajor ? 12 : 6;
      
      // Izquierda
      ctx.beginPath();
      ctx.moveTo(rulerWidth, y);
      ctx.lineTo(rulerWidth - len, y);
      ctx.stroke();
      
      // Derecha
      ctx.beginPath();
      ctx.moveTo(width - rulerWidth, y);
      ctx.lineTo(width - rulerWidth + len, y);
      ctx.stroke();
      
      // Números cada 15px (5mm)
      if (isMajor && y > 0) {
        ctx.fillStyle = 'rgba(220, 220, 220, 0.9)';
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(String(Math.floor(y / 3)), rulerWidth / 2, y + 3);
        ctx.fillText(String(Math.floor(y / 3)), width - rulerWidth / 2, y + 3);
      }
    }
    
    // Esquinas de encuadre
    const cornerSize = 26;
    const cornerOffset = 6;
    const cornerThickness = 3;
    ctx.strokeStyle = 'rgba(220, 220, 220, 0.9)';
    ctx.lineWidth = cornerThickness;
    
    // Top-left
    ctx.beginPath();
    ctx.moveTo(cornerOffset + cornerSize, cornerOffset);
    ctx.lineTo(cornerOffset, cornerOffset);
    ctx.lineTo(cornerOffset, cornerOffset + cornerSize);
    ctx.stroke();
    
    // Top-right
    ctx.beginPath();
    ctx.moveTo(width - cornerOffset - cornerSize, cornerOffset);
    ctx.lineTo(width - cornerOffset, cornerOffset);
    ctx.lineTo(width - cornerOffset, cornerOffset + cornerSize);
    ctx.stroke();
    
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(cornerOffset, height - cornerOffset - cornerSize);
    ctx.lineTo(cornerOffset, height - cornerOffset);
    ctx.lineTo(cornerOffset + cornerSize, height - cornerOffset);
    ctx.stroke();
    
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(width - cornerOffset - cornerSize, height - cornerOffset);
    ctx.lineTo(width - cornerOffset, height - cornerOffset);
    ctx.lineTo(width - cornerOffset, height - cornerOffset - cornerSize);
    ctx.stroke();
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
      <div className="relative w-full max-w-md">
        <div className="bg-card rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-primary/10 border-b border-border p-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Marco Antropométrico
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
            
            {/* Overlay con reglas, esquinas y marco SVG */}
            <div className="absolute inset-0 pointer-events-none">
              <canvas
                ref={overlayCanvasRef}
                className="absolute inset-0 w-full h-full"
              />
              
              {/* Marco antropométrico SVG */}
              <svg 
                className="absolute inset-0 w-full h-full" 
                viewBox="0 0 100 133" 
                preserveAspectRatio="xMidYMid slice"
              >
                {/* Contorno cabeza */}
                <path 
                  className="face-outline"
                  d="M20,30 Q20,15 34,10 Q50,4 66,10 Q80,15 80,30 Q84,52 75,78 Q66,104 50,112 Q34,104 25,78 Q16,52 20,30 Z"
                  fill="none"
                  stroke="rgb(0, 229, 255)"
                  strokeWidth="2.4"
                  opacity="0.95"
                />
                
                {/* Línea bipupilar */}
                <line 
                  x1="28" y1="52" x2="72" y2="52"
                  stroke="rgb(0, 229, 255)"
                  strokeWidth="1.4"
                  opacity="0.7"
                />
                
                {/* Línea media */}
                <line 
                  x1="50" y1="24" x2="50" y2="110"
                  stroke="rgb(0, 229, 255)"
                  strokeWidth="1.4"
                  opacity="0.7"
                />
                
                {/* Plano de Frankfort */}
                <line 
                  x1="24" y1="58" x2="76" y2="56"
                  stroke="rgb(0, 229, 255)"
                  strokeWidth="1.4"
                  opacity="0.7"
                />
                
                {/* Mentón */}
                <ellipse 
                  cx="50" cy="108" rx="14" ry="7"
                  fill="none"
                  stroke="rgb(0, 229, 255)"
                  strokeWidth="1.4"
                  opacity="0.7"
                />
                
                {/* Malla facial */}
                <path 
                  d="M35,50 L50,46 L65,50 L60,62 L50,66 L40,62 Z M35,50 L40,62 L35,74 L50,86 L65,74 L60,62 L65,50"
                  fill="none"
                  stroke="rgb(189, 189, 189)"
                  strokeWidth="1"
                  opacity="0.45"
                />
                
                {/* Marcas comisuras */}
                <circle cx="40" cy="74" r="0.9" fill="rgb(0, 229, 255)" />
                <circle cx="60" cy="74" r="0.9" fill="rgb(0, 229, 255)" />
              </svg>
              
              {/* Estado inferior */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/55 backdrop-blur-sm rounded-lg px-3 py-2">
                <div className="flex flex-wrap gap-1.5 justify-center text-[10px]">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border ${
                    captureReadiness.faceDetected 
                      ? 'border-green-500/30 text-green-400' 
                      : 'border-amber-500/35 text-amber-400'
                  }`}>
                    {captureReadiness.faceDetected ? '✓' : '○'} Rostro
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border ${
                    captureReadiness.rollOK 
                      ? 'border-green-500/30 text-green-400' 
                      : 'border-amber-500/35 text-amber-400'
                  }`}>
                    {captureReadiness.rollOK ? '✓' : '○'} Nivel
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border ${
                    captureReadiness.yawOK 
                      ? 'border-green-500/30 text-green-400' 
                      : 'border-amber-500/35 text-amber-400'
                  }`}>
                    {captureReadiness.yawOK ? '✓' : '○'} Frente
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border ${
                    captureReadiness.sizeOK 
                      ? 'border-green-500/30 text-green-400' 
                      : 'border-amber-500/35 text-amber-400'
                  }`}>
                    {captureReadiness.sizeOK ? '✓' : '○'} Distancia
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border ${
                    captureReadiness.centerOK 
                      ? 'border-green-500/30 text-green-400' 
                      : 'border-amber-500/35 text-amber-400'
                  }`}>
                    {captureReadiness.centerOK ? '✓' : '○'} Centrado
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-card/50 border-t border-border">
            <div className="space-y-3">
              {autoCapturing && (
                <div className="bg-green-500/20 text-green-700 dark:text-green-400 p-3 rounded-lg text-center font-semibold animate-pulse">
                  ¡Capturando en breve!
                </div>
              )}
              
              <div className="text-xs text-muted-foreground bg-accent/20 p-3 rounded-lg">
                <p className="leading-relaxed">
                  Mantén el teléfono a ~35–40 cm. Mira al frente con los ojos a la altura de la línea cian. 
                  {mode === 'rest' ? ' Expresión neutral.' : ' Sonríe naturalmente.'}
                  <strong> La foto se tomará automáticamente</strong> cuando todos los indicadores estén en verde.
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
                  Manual
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

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
    ctx.clearRect(0, 0, width, height);
    
    const rulerWidth = 32;
    
    // Reglas laterales con fondo semi-transparente
    ctx.fillStyle = 'rgba(50, 50, 50, 0.6)';
    ctx.fillRect(0, 0, rulerWidth, height);
    ctx.fillRect(width - rulerWidth, 0, rulerWidth, height);
    
    // Marcas de regla cada 2px (simula mm)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 1;
    
    for (let y = 0; y < height; y += 2) {
      const isMajor = y % 20 === 0; // Cada 10mm
      const isMedium = y % 10 === 0; // Cada 5mm
      const len = isMajor ? 16 : isMedium ? 10 : 6;
      
      // Regla izquierda
      ctx.beginPath();
      ctx.moveTo(rulerWidth, y);
      ctx.lineTo(rulerWidth - len, y);
      ctx.stroke();
      
      // Regla derecha
      ctx.beginPath();
      ctx.moveTo(width - rulerWidth, y);
      ctx.lineTo(width - rulerWidth + len, y);
      ctx.stroke();
      
      // Números cada 10mm
      if (isMajor && y > 0 && y < height - 20) {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.font = 'bold 10px monospace';
        
        // Izquierda - números rotados
        ctx.translate(8, y);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillText(String(Math.floor(y / 2)), 0, 0);
        ctx.restore();
        
        // Derecha - números rotados
        ctx.save();
        ctx.translate(width - 8, y);
        ctx.rotate(Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillText(String(Math.floor(y / 2)), 0, 0);
        ctx.restore();
      }
    }
    
    // Esquinas de encuadre (más gruesas y visibles)
    const cornerSize = 40;
    const cornerOffset = rulerWidth + 4;
    const cornerThickness = 5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
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
                viewBox="0 0 100 140" 
                preserveAspectRatio="xMidYMid slice"
              >
                {/* Contorno facial principal - ovalado grande cian brillante */}
                <path 
                  d="M22,38 Q22,20 32,12 Q50,3 68,12 Q78,20 78,38 Q80,58 75,78 Q68,100 50,115 Q32,100 25,78 Q20,58 22,38 Z"
                  fill="none"
                  stroke="rgb(0, 229, 255)"
                  strokeWidth="3.5"
                  opacity="1"
                />
                
                {/* Líneas horizontales superiores (bipupilar y área de ojos) */}
                <line 
                  x1="25" y1="50" x2="75" y2="50"
                  stroke="rgb(0, 229, 255)"
                  strokeWidth="2.2"
                  opacity="0.9"
                />
                <line 
                  x1="25" y1="58" x2="75" y2="58"
                  stroke="rgb(0, 229, 255)"
                  strokeWidth="2.2"
                  opacity="0.9"
                />
                
                {/* Línea media vertical */}
                <line 
                  x1="50" y1="20" x2="50" y2="115"
                  stroke="rgb(0, 229, 255)"
                  strokeWidth="2.2"
                  opacity="0.9"
                />
                
                {/* Malla facial detallada (gris tenue) */}
                {/* Triángulos superiores (frente y cejas) */}
                <path 
                  d="M32,40 L50,35 L68,40 L50,50 Z"
                  fill="none"
                  stroke="rgba(200, 200, 200, 0.5)"
                  strokeWidth="1"
                />
                
                {/* Área de ojos */}
                <path 
                  d="M28,48 L38,46 L50,50 L38,54 Z M72,48 L62,46 L50,50 L62,54 Z"
                  fill="none"
                  stroke="rgba(200, 200, 200, 0.5)"
                  strokeWidth="1"
                />
                
                {/* Nariz */}
                <path 
                  d="M42,58 L50,65 L58,58 L50,72 Z"
                  fill="none"
                  stroke="rgba(200, 200, 200, 0.5)"
                  strokeWidth="1"
                />
                
                {/* Boca y mentón */}
                <path 
                  d="M35,75 L42,78 L50,80 L58,78 L65,75 L58,85 L50,88 L42,85 Z"
                  fill="none"
                  stroke="rgba(200, 200, 200, 0.5)"
                  strokeWidth="1"
                />
                
                {/* Contorno inferior (mandíbula) */}
                <path 
                  d="M35,75 L30,90 L35,105 L50,115 L65,105 L70,90 L65,75"
                  fill="none"
                  stroke="rgba(200, 200, 200, 0.5)"
                  strokeWidth="1"
                />
                
                {/* Líneas de conexión vertical */}
                <line x1="35" y1="50" x2="35" y2="75" stroke="rgba(200, 200, 200, 0.5)" strokeWidth="1" />
                <line x1="65" y1="50" x2="65" y2="75" stroke="rgba(200, 200, 200, 0.5)" strokeWidth="1" />
                <line x1="42" y1="58" x2="42" y2="85" stroke="rgba(200, 200, 200, 0.5)" strokeWidth="1" />
                <line x1="58" y1="58" x2="58" y2="85" stroke="rgba(200, 200, 200, 0.5)" strokeWidth="1" />
                
                {/* Puntos de referencia cian (comisuras) */}
                <circle cx="42" cy="78" r="1.5" fill="rgb(0, 229, 255)" />
                <circle cx="58" cy="78" r="1.5" fill="rgb(0, 229, 255)" />
              </svg>
              
              {/* Estado inferior - estilo idéntico al ejemplo */}
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md rounded-2xl px-4 py-3 min-w-[280px]">
                <div className="grid grid-cols-2 gap-2">
                  <span className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-medium ${
                    captureReadiness.faceDetected 
                      ? 'border-green-500/50 bg-green-500/10 text-green-400' 
                      : 'border-gray-600/50 bg-gray-800/30 text-gray-400'
                  }`}>
                    {captureReadiness.faceDetected ? '✓' : '○'} Rostro
                  </span>
                  <span className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-medium ${
                    captureReadiness.rollOK 
                      ? 'border-green-500/50 bg-green-500/10 text-green-400' 
                      : 'border-gray-600/50 bg-gray-800/30 text-gray-400'
                  }`}>
                    {captureReadiness.rollOK ? '✓' : '○'} Nivel
                  </span>
                  <span className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-medium ${
                    captureReadiness.yawOK 
                      ? 'border-green-500/50 bg-green-500/10 text-green-400' 
                      : 'border-gray-600/50 bg-gray-800/30 text-gray-400'
                  }`}>
                    {captureReadiness.yawOK ? '✓' : '○'} Frente
                  </span>
                  <span className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-medium ${
                    captureReadiness.sizeOK 
                      ? 'border-amber-500/50 bg-amber-500/10 text-amber-400' 
                      : 'border-gray-600/50 bg-gray-800/30 text-gray-400'
                  }`}>
                    {captureReadiness.sizeOK ? '✓' : '○'} Distancia
                  </span>
                  <span className={`col-span-2 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-medium ${
                    captureReadiness.centerOK 
                      ? 'border-amber-500/50 bg-amber-500/10 text-amber-400' 
                      : 'border-gray-600/50 bg-gray-800/30 text-gray-400'
                  }`}>
                    {captureReadiness.centerOK ? '✓' : '○'} Centrado
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-b from-cyan-50 to-cyan-100 dark:from-gray-800 dark:to-gray-900 border-t border-border">
            <div className="space-y-3">
              {autoCapturing && (
                <div className="bg-green-500/20 text-green-700 dark:text-green-400 p-3 rounded-lg text-center font-semibold animate-pulse">
                  ¡Capturando en breve!
                </div>
              )}
              
              <div className="text-sm text-gray-700 dark:text-gray-300 bg-cyan-100/80 dark:bg-gray-800/80 p-3 rounded-xl border border-cyan-200 dark:border-gray-700">
                <p className="leading-relaxed">
                  Mantén el teléfono a ~35–40 cm. Mira al frente con los ojos a la altura de la línea cian. 
                  {mode === 'rest' ? ' Expresión neutral.' : ' Sonríe naturalmente.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

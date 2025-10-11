import { useRef, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { track } from "@/lib/analytics";
import { computeMetrics, drawMidlineOverlay, drawProportionsOverlay, drawSmileOverlay, type SmileMetrics } from "@/lib/metrics";

// Carga dinámica de MediaPipe Tasks desde CDN (sin tocar package.json)
async function loadFaceTask() {
  const vision = await (window as any).FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );
  // @ts-ignore - Dynamic CDN import
  const { FaceLandmarker } = await import("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/vision_bundle.mjs");
  const landmarker = await (FaceLandmarker as any).createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: "https://storage.googleapis.com/mediapipe-assets/face_landmarker.task"
    },
    numFaces: 1,
    runningMode: "IMAGE",
    outputFaceBlendshapes: false
  });
  return landmarker;
}

// Carga del FilesetResolver global (necesario para vision_bundle.mjs)
async function ensureFilesetResolver() {
  if ((window as any).FilesetResolver) return;
  // @ts-ignore - Dynamic CDN import
  const mod = await import("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/vision_bundle.mjs");
  (window as any).FilesetResolver = mod.FilesetResolver;
}

function loadImage(b64: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = b64;
  });
}

export default function IALab() {
  const [restB64, setRestB64] = useState<string>("");
  const [smileB64, setSmileB64] = useState<string>("");
  const [metrics, setMetrics] = useState<SmileMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [simulatedB64, setSimulatedB64] = useState<string>("");
  const [simulating, setSimulating] = useState(false);
  
  // Ajustes sutiles post-simulación (±5% máximo)
  const [adjustments, setAdjustments] = useState({
    toothLength: 0,    // -5 a +5
    toothWidth: 0,     // -5 a +5
    whiteness: 0       // 0=natural, 1=moderado, 2=intenso
  });
  const [showAdjustments, setShowAdjustments] = useState(false);
  
  // Estado para captura con cámara
  const [showCamera, setShowCamera] = useState(false);
  const [cameraMode, setCameraMode] = useState<"rest" | "smile" | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [calibrationScale, setCalibrationScale] = useState<number | null>(null); // píxeles por mm
  
  // Estado para captura automática
  const [captureReadiness, setCaptureReadiness] = useState({
    frameDetected: false,
    faceDetected: false,
    goodLighting: false,
    centered: false
  });
  const [autoCapturing, setAutoCapturing] = useState(false);
  const detectionIntervalRef = useRef<number | null>(null);
  const landmarkerRef = useRef<any>(null);
  
  const canvasRef1 = useRef<HTMLCanvasElement>(null);
  const canvasRef2 = useRef<HTMLCanvasElement>(null);
  const canvasRef3 = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);

  const onFile = (e: any, kind: "rest" | "smile") => {
    const f = e.target.files?.[0]; 
    if (!f) return;
    const r = new FileReader();
    r.onload = () => (kind === "rest" ? setRestB64 : setSmileB64)(r.result as string);
    r.readAsDataURL(f);
  };

  const analyze = async () => {
    if (!restB64 || !smileB64) return alert("Sube ambas fotos: reposo y sonrisa.");
    setLoading(true);
    try {
      await ensureFilesetResolver();
      const landmarker = await loadFaceTask();

      // Crear imágenes
      const restImg = await loadImage(restB64);
      const smileImg = await loadImage(smileB64);

      // Detectar
      const restRes = await (landmarker as any).detect(restImg);
      const smileRes = await (landmarker as any).detect(smileImg);

      if (!restRes?.faceLandmarks?.length || !smileRes?.faceLandmarks?.length) {
        alert("No se detectó rostro en alguna de las fotos.");
        return;
      }
      const restLm = restRes.faceLandmarks[0];
      const smileLm = smileRes.faceLandmarks[0];

      // Calcular métricas
      const m = computeMetrics({ restLm, smileLm, imgW: smileImg.width, imgH: smileImg.height });
      setMetrics(m);
      track({ name: "analyze_ok", data: { arc: m.smileArc, gingivalClass: m.gingival.class } });

      // Pintar overlays en 3 canvas separados con manejo seguro de refs
      setTimeout(() => {
        [canvasRef1, canvasRef2, canvasRef3].forEach((ref, idx) => {
          const canvas = ref.current;
          if (!canvas) return;
          
          canvas.width = smileImg.width;
          canvas.height = smileImg.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          
          if (idx === 0) drawMidlineOverlay(ctx, smileImg, smileLm, m);
          else if (idx === 1) drawProportionsOverlay(ctx, smileImg, smileLm, m);
          else drawSmileOverlay(ctx, smileImg, smileLm, m);
        });
      }, 0);

    } catch (e) {
      console.error(e);
      alert("Falló el análisis. Prueba con otra foto (frontal, buena luz).");
    } finally {
      setLoading(false);
    }
  };

  const simulateCorrections = async (withAdjustments = false) => {
    if (!smileB64 || !metrics) return alert("Primero analiza una foto de sonrisa.");
    setSimulating(true);
    try {
      const body: any = { imageBase64: smileB64, metrics };
      
      // Agregar ajustes si se especifica
      if (withAdjustments) {
        body.adjustments = adjustments;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/simulate-smile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error en simulación');
      }

      const data = await response.json();
      setSimulatedB64(data.simulatedImage);
      
      // Mostrar controles de ajuste después de la primera simulación
      if (!withAdjustments) {
        setShowAdjustments(true);
        toast.success('Simulación completada. Ahora puedes ajustar parámetros.');
      } else {
        toast.success('Simulación actualizada con tus ajustes');
      }
      
      track({ name: "simulation_success", data: { corrections: true, withAdjustments } });
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Error al simular. Intenta de nuevo.");
    } finally {
      setSimulating(false);
    }
  };

  const resetAdjustments = () => {
    setAdjustments({ toothLength: 0, toothWidth: 0, whiteness: 0 });
  };

  // Activar cámara con marco calibrado y detección automática
  const startCamera = async (mode: "rest" | "smile") => {
    setCameraMode(mode);
    setShowCamera(true);
    setAutoCapturing(false);
    setCaptureReadiness({
      frameDetected: false,
      faceDetected: false,
      goodLighting: false,
      centered: false
    });
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 1280, height: 720 }
      });
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }

      // Inicializar MediaPipe para detección facial
      await ensureFilesetResolver();
      const landmarker = await loadFaceTask();
      // Cambiar a modo VIDEO
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

      // Iniciar detección automática
      startAutoDetection();
    } catch (error) {
      console.error('Error al acceder a la cámara:', error);
      toast.error('No se pudo acceder a la cámara');
      setShowCamera(false);
    }
  };

  // Detener cámara
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    setShowCamera(false);
    setCameraMode(null);
    setAutoCapturing(false);
    landmarkerRef.current = null;
  };

  // Detección automática de calidad
  const startAutoDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }

    detectionIntervalRef.current = window.setInterval(() => {
      checkCaptureQuality();
    }, 500); // Verificar cada 500ms
  };

  const checkCaptureQuality = async () => {
    if (!videoRef.current || !landmarkerRef.current || autoCapturing) return;

    const video = videoRef.current;
    if (video.readyState < 2) return;

    try {
      // Crear canvas temporal para análisis
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.drawImage(video, 0, 0);
      
      // 1. Detectar marco verde (calibración)
      const frameDetected = detectGreenFrame(ctx, canvas.width, canvas.height);
      
      // 2. Detectar rostro con MediaPipe
      const timestamp = performance.now();
      const results = await landmarkerRef.current.detectForVideo(video, timestamp);
      const faceDetected = results?.faceLandmarks?.length > 0;
      
      // 3. Verificar iluminación
      const goodLighting = checkLighting(ctx, canvas.width, canvas.height);
      
      // 4. Verificar centrado del rostro
      const centered = faceDetected && checkFaceCentered(results.faceLandmarks[0], canvas.width, canvas.height);
      
      // Actualizar estado
      const readiness = {
        frameDetected,
        faceDetected,
        goodLighting,
        centered
      };
      
      setCaptureReadiness(readiness);
      
      // Si todo está perfecto, capturar automáticamente
      if (frameDetected && faceDetected && goodLighting && centered) {
        setAutoCapturing(true);
        // Pequeña pausa para mostrar feedback
        setTimeout(() => {
          capturePhoto();
        }, 300);
      }
    } catch (error) {
      console.error('Error en detección automática:', error);
    }
  };

  // Detectar marco verde de calibración
  const detectGreenFrame = (ctx: CanvasRenderingContext2D, width: number, height: number): boolean => {
    const frameSize = Math.min(width, height) * 0.15;
    const centerX = width / 2;
    const centerY = height * 0.75;
    
    // Muestrear píxeles en el área del marco
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
        
        // Detectar verde brillante (del marco)
        if (g > 150 && g > r * 1.5 && g > b * 1.5) {
          greenPixels++;
        }
      }
    });
    
    return greenPixels > 20; // Umbral ajustable
  };

  // Verificar iluminación adecuada
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
    
    // Rango óptimo de brillo (ni muy oscuro ni sobreexpuesto)
    return brightness > 80 && brightness < 220;
  };

  // Verificar que el rostro esté centrado
  const checkFaceCentered = (landmarks: any[], width: number, height: number): boolean => {
    // Punto de la nariz (landmark 1)
    const nose = landmarks[1];
    const centerX = width / 2;
    const centerY = height / 2;
    
    const noseX = nose.x * width;
    const noseY = nose.y * height;
    
    // Verificar que esté en el tercio central
    const marginX = width * 0.2;
    const marginY = height * 0.2;
    
    return Math.abs(noseX - centerX) < marginX && Math.abs(noseY - centerY) < marginY;
  };

  // Capturar foto con marco de calibración
  const capturePhoto = () => {
    if (!videoRef.current || !overlayCanvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Dibujar video
    ctx.drawImage(video, 0, 0);
    
    // Dibujar marco de calibración sobre la foto
    drawCalibrationFrame(ctx, canvas.width, canvas.height);
    
    // Convertir a base64
    const imageData = canvas.toDataURL('image/jpeg', 0.95);
    
    if (cameraMode === 'rest') {
      setRestB64(imageData);
    } else {
      setSmileB64(imageData);
    }
    
    toast.success(`✓ Foto de ${cameraMode === 'rest' ? 'reposo' : 'sonrisa'} capturada automáticamente`);
    stopCamera();
  };

  // Dibujar marco de calibración (50mm de referencia)
  const drawCalibrationFrame = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const frameSize = Math.min(width, height) * 0.15; // Marco de referencia
    const centerX = width / 2;
    const centerY = height * 0.75; // Parte inferior para que no tape la boca
    
    // Fondo semitransparente
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(centerX - frameSize/2 - 10, centerY - frameSize/2 - 40, frameSize + 20, frameSize + 80);
    
    // Marco de calibración (50mm x 50mm)
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.strokeRect(centerX - frameSize/2, centerY - frameSize/2, frameSize, frameSize);
    
    // Marcadores en las esquinas
    const markerSize = 15;
    [[0,0], [frameSize,0], [0,frameSize], [frameSize,frameSize]].forEach(([dx, dy]) => {
      const x = centerX - frameSize/2 + dx;
      const y = centerY - frameSize/2 + dy;
      ctx.fillStyle = '#10b981';
      ctx.fillRect(x - markerSize/2, y - markerSize/2, markerSize, markerSize);
    });
    
    // Texto de referencia
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Marco de Calibración: 50mm', centerX, centerY - frameSize/2 - 20);
    ctx.font = '14px sans-serif';
    ctx.fillText('Coloca una tarjeta de crédito aquí', centerX, centerY + frameSize/2 + 25);
    ctx.fillText('(Ancho estándar: 85.6mm)', centerX, centerY + frameSize/2 + 45);
  };

  // Actualizar overlay en tiempo real
  const updateOverlay = () => {
    if (!videoRef.current || !overlayCanvasRef.current || !showCamera) return;
    
    const video = videoRef.current;
    const canvas = overlayCanvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCalibrationFrame(ctx, canvas.width, canvas.height);
    
    requestAnimationFrame(updateOverlay);
  };

  // Iniciar overlay cuando se active la cámara
  if (showCamera && videoRef.current && videoRef.current.readyState >= 2) {
    requestAnimationFrame(updateOverlay);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-foreground">
                  <span className="text-primary">IA Lab</span> — Análisis Dental Avanzado
                </h1>
                <span className="px-2 py-1 text-xs font-semibold bg-primary/20 text-primary rounded-full border border-primary/30">
                  VERSIÓN BETA
                </span>
              </div>
              <p className="text-muted-foreground mt-1">
                Tecnología de detección facial con inteligencia artificial on-device
              </p>
              <div className="mt-3 space-y-1">
                <p className="text-sm font-medium text-foreground">
                  Desarrollado por <span className="text-primary font-semibold">Clínica Miró</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Equipo liderado por Dr. Carlos Montoya
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-2 flex items-start gap-1">
                  <svg className="w-3 h-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
                  </svg>
                  Prohibida su reproducción - Protegido por propiedad intelectual
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 grid gap-6 max-w-7xl">
        <Card className="bg-card/80 backdrop-blur-sm border-border shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Análisis Facial y Sonrisa
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Foto en reposo</label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => startCamera('rest')}
                    className="flex-1"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Capturar con Cámara
                  </Button>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => onFile(e, "rest")} 
                  className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                />
                {restB64 && (
                  <div className="rounded-xl overflow-hidden border border-border bg-muted/30">
                    <img src={restB64} alt="reposo" className="w-full h-64 object-contain" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Foto sonriendo</label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => startCamera('smile')}
                    className="flex-1"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Capturar con Cámara
                  </Button>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => onFile(e, "smile")} 
                  className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                />
                {smileB64 && (
                  <div className="rounded-xl overflow-hidden border border-border bg-muted/30">
                    <img src={smileB64} alt="sonrisa" className="w-full h-64 object-contain" />
                  </div>
                )}
              </div>

              <Button 
                className="mt-4 w-full" 
                onClick={analyze} 
                disabled={loading || !restB64 || !smileB64}
                size="lg"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analizando…
                  </>
                ) : (
                  "Analizar ahora"
                )}
              </Button>
            </div>

            <div className="grid gap-4">
              {!metrics && (
                <div className="text-muted-foreground text-sm text-center p-8 bg-muted/30 rounded-xl border border-border">
                  Sube fotos y presiona "Analizar" para ver resultados.
                </div>
              )}
              
              {metrics && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="rounded-xl overflow-hidden border border-border bg-muted/30">
                      <canvas 
                        ref={canvasRef1} 
                        className="w-full h-auto" 
                        aria-label="análisis líneas medias"
                      />
                    </div>
                    <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
                      <p className="text-xs text-foreground">
                        <strong>Líneas Medias:</strong> Compara la simetría facial (verde) con la dental (naranja). Una buena coincidencia es clave para una sonrisa armoniosa.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="rounded-xl overflow-hidden border border-border bg-muted/30">
                      <canvas 
                        ref={canvasRef2} 
                        className="w-full h-auto" 
                        aria-label="proporciones faciales"
                      />
                    </div>
                    <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
                      <p className="text-xs text-foreground">
                        <strong>Proporciones Faciales:</strong> El rostro se divide en tres tercios idealmente iguales (33% cada uno). Esto indica balance y armonía facial.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="rounded-xl overflow-hidden border border-border bg-muted/30">
                      <canvas 
                        ref={canvasRef3} 
                        className="w-full h-auto" 
                        aria-label="análisis de sonrisa"
                      />
                    </div>
                    <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
                      <p className="text-xs text-foreground">
                        <strong>Análisis de Sonrisa:</strong> Evalúa el arco de la sonrisa, exposición de encías y amplitud. Una sonrisa consonante y equilibrada es el ideal estético.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {metrics && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg text-foreground">Resultados detallados</h3>
                  
                  <div className="p-3 bg-primary/10 rounded-lg border border-primary/30">
                    <h4 className="text-sm font-semibold mb-2 text-foreground">Líneas Medias</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Dental:</span>
                        <span className={`font-bold ${
                          Math.abs(metrics.midline.mm) < 1 ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {metrics.midline.mm.toFixed(1)}mm {metrics.midline.side}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Facial:</span>
                        <span className="font-bold text-green-600">{metrics.facialMidline.side}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Coincidencia:</span>
                        <span className={`font-bold capitalize ${
                          metrics.midlineCoincidence.status === 'coincidente' ? 'text-green-600' : 
                          metrics.midlineCoincidence.status === 'leve' ? 'text-yellow-600' :
                          metrics.midlineCoincidence.status === 'moderada' ? 'text-orange-600' : 'text-red-600'
                        }`}>
                          {metrics.midlineCoincidence.status} ({metrics.midlineCoincidence.deviation.toFixed(1)}mm)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-accent/10 rounded-lg border border-accent/30">
                    <h4 className="text-sm font-semibold mb-2 text-foreground">Proporciones Faciales</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Tercio Superior:</span>
                        <span className="font-bold">{metrics.facialProportions.upperThird.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Tercio Medio:</span>
                        <span className="font-bold">{metrics.facialProportions.middleThird.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Tercio Inferior:</span>
                        <span className="font-bold">{metrics.facialProportions.lowerThird.toFixed(1)}%</span>
                      </div>
                      <div className="pt-2 border-t border-accent/30">
                        <span className={`text-sm font-bold ${
                          metrics.facialProportions.isBalanced ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {metrics.facialProportions.isBalanced ? '✓ Equilibradas' : '⚠ Desbalanceadas'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium">Arco de sonrisa:</span>
                      <span className={`text-sm font-bold capitalize ${
                        metrics.smileArc === 'consonante' ? 'text-green-600' : 
                        metrics.smileArc === 'plano' ? 'text-yellow-600' : 'text-red-600'
                      }`}>{metrics.smileArc}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium">Exposición gingival:</span>
                      <span className={`text-sm font-bold capitalize ${
                        metrics.gingival.class === 'baja' ? 'text-green-600' : 
                        metrics.gingival.class === 'media' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {metrics.gingival.class} ({metrics.gingival.mm.toFixed(1)} mm)
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium">Corredor bucal:</span>
                      <span className={`text-sm font-bold ${
                        metrics.buccalRatio >= 0.1 && metrics.buccalRatio <= 0.3 ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {Math.round(metrics.buccalRatio*100)}%
                      </span>
                    </div>
                  </div>

                  {/* Mediciones de Dientes */}
                  {metrics.toothMeasurements && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          Dimensiones Dentales
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                          metrics.toothMeasurements.calibrated 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {metrics.toothMeasurements.calibrated ? '✓ Calibrado' : '≈ Estimado'}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 p-2 bg-white/50 dark:bg-black/20 rounded">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Incisivo Central</p>
                            <p className="text-sm font-bold text-foreground">
                              Ancho: {metrics.toothMeasurements.centralIncisor.width.toFixed(1)}mm
                            </p>
                            <p className="text-sm font-bold text-foreground">
                              Alto: {metrics.toothMeasurements.centralIncisor.height.toFixed(1)}mm
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Incisivo Lateral</p>
                            <p className="text-sm font-bold text-foreground">
                              Ancho: {metrics.toothMeasurements.lateralIncisor.width.toFixed(1)}mm
                            </p>
                            <p className="text-sm font-bold text-foreground">
                              Alto: {metrics.toothMeasurements.lateralIncisor.height.toFixed(1)}mm
                            </p>
                          </div>
                        </div>
                        
                        <div className="p-2 bg-white/50 dark:bg-black/20 rounded">
                          <p className="text-xs text-muted-foreground mb-1">Canino</p>
                          <p className="text-sm font-bold text-foreground">
                            Ancho: {metrics.toothMeasurements.canine.width.toFixed(1)}mm
                          </p>
                          <p className="text-sm font-bold text-foreground">
                            Alto: {metrics.toothMeasurements.canine.height.toFixed(1)}mm
                          </p>
                        </div>
                        
                        {!metrics.toothMeasurements.calibrated && (
                          <p className="text-xs text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                            💡 Para mediciones precisas, usa el marco de calibración al capturar la foto
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    className="w-full mt-4" 
                    onClick={() => simulateCorrections(false)} 
                    disabled={simulating}
                    size="lg"
                    variant="default"
                  >
                    {simulating ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Simulando correcciones...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Simular correcciones con IA
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {simulatedB64 && (
          <Card className="bg-card/80 backdrop-blur-sm border-border shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Simulación con IA — Resultado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Foto original</h3>
                  <div className="rounded-xl overflow-hidden border border-border bg-muted/30">
                    <img src={smileB64} alt="original" className="w-full h-auto" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Simulación corregida</h3>
                  <div className="rounded-xl overflow-hidden border border-border bg-muted/30">
                    <img src={simulatedB64} alt="simulada" className="w-full h-auto" />
                  </div>
                  <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <p className="text-sm text-foreground">
                      ✨ Correcciones aplicadas con IA basadas en los patrones estéticos detectados
                    </p>
                  </div>
                </div>
              </div>

              {showAdjustments && (
                <div className="border-t border-border pt-6">
                  <div className="bg-accent/10 rounded-xl p-6 border border-accent/30">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                        Ajustes sutiles (±5% máximo)
                      </h3>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={resetAdjustments}
                      >
                        Restablecer
                      </Button>
                    </div>
                    
                    <div className="space-y-6">
                      {/* Longitud de dientes */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium flex items-center justify-between">
                          <span>Longitud de dientes</span>
                          <span className="text-xs font-mono text-muted-foreground">
                            {adjustments.toothLength > 0 ? '+' : ''}{adjustments.toothLength}%
                          </span>
                        </Label>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground w-16">Más cortos</span>
                          <Slider
                            value={[adjustments.toothLength]}
                            onValueChange={(val) => setAdjustments(prev => ({ ...prev, toothLength: val[0] }))}
                            min={-5}
                            max={5}
                            step={1}
                            className="flex-1"
                          />
                          <span className="text-xs text-muted-foreground w-16 text-right">Más largos</span>
                        </div>
                      </div>

                      {/* Anchura de dientes */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium flex items-center justify-between">
                          <span>Anchura de dientes</span>
                          <span className="text-xs font-mono text-muted-foreground">
                            {adjustments.toothWidth > 0 ? '+' : ''}{adjustments.toothWidth}%
                          </span>
                        </Label>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground w-16">Más estrechos</span>
                          <Slider
                            value={[adjustments.toothWidth]}
                            onValueChange={(val) => setAdjustments(prev => ({ ...prev, toothWidth: val[0] }))}
                            min={-5}
                            max={5}
                            step={1}
                            className="flex-1"
                          />
                          <span className="text-xs text-muted-foreground w-16 text-right">Más anchos</span>
                        </div>
                      </div>

                      {/* Blancura */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Blancura de dientes</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['Natural', 'Moderado', 'Intenso'] as const).map((level, idx) => (
                            <button
                              key={level}
                              onClick={() => setAdjustments(prev => ({ ...prev, whiteness: idx }))}
                              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                                adjustments.whiteness === idx
                                  ? 'bg-primary text-primary-foreground border-primary'
                                  : 'bg-background text-foreground border-border hover:border-primary/50'
                              }`}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Botón regenerar */}
                      <Button 
                        className="w-full mt-4" 
                        onClick={() => simulateCorrections(true)}
                        disabled={simulating || (adjustments.toothLength === 0 && adjustments.toothWidth === 0 && adjustments.whiteness === 0)}
                        size="lg"
                      >
                        {simulating ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Regenerando...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Regenerar con ajustes
                          </>
                        )}
                      </Button>

                      <p className="text-xs text-muted-foreground text-center mt-2">
                        Los cambios se mantienen sutiles para preservar la armonía facial
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      {/* Modal de Cámara con Marco Calibrado */}
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl">
            <div className="bg-card rounded-xl overflow-hidden shadow-2xl">
              <div className="bg-primary/10 border-b border-border p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Captura con Marco Calibrado
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {cameraMode === 'rest' ? 'Foto en reposo' : 'Foto sonriendo'} - Coloca una tarjeta en el marco verde
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={stopCamera}>
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
                  {/* Indicadores de calidad para captura automática */}
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
                        <li>• {cameraMode === 'rest' ? 'Mantén una expresión neutral' : 'Sonríe naturalmente'}</li>
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
                      onClick={stopCamera}
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
      )}
    </div>
  );
}

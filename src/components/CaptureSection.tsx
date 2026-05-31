import { useState, useRef, useEffect, useCallback } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import simsmileLogo from "@/assets/simsmile-logo-white-bg.png";
import { ArrowRight, RefreshCw, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface CaptureSectionProps {
  onCapture: (smileImage: string) => void;
}

type CameraState = "init" | "ready" | "detecting" | "countdown" | "captured" | "confirm" | "error";

// Face position feedback
type FeedbackType = "no_face" | "too_far" | "too_close" | "off_center" | "good";

const FEEDBACK_MESSAGES: Record<FeedbackType, string> = {
  no_face:    "Posiciona tu cara en el óvalo",
  too_far:    "Acércate un poco más",
  too_close:  "Aléjate un poco",
  off_center: "Centra tu cara",
  good:       "¡Perfecto! Mantén la posición",
};

const FEEDBACK_COLORS: Record<FeedbackType, string> = {
  no_face:    "#666",
  too_far:    "#F59E0B",
  too_close:  "#F59E0B",
  off_center: "#F59E0B",
  good:       "#10B981",
};

export const CaptureSection = ({ onCapture }: CaptureSectionProps) => {
  const videoRef    = useRef<HTMLVideoElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const detectorRef = useRef<FaceLandmarker | null>(null);
  const streamRef   = useRef<MediaStream | null>(null);
  const rafRef      = useRef<number>(0);
  const countdownRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const goodFramesRef = useRef(0);

  const [cameraState, setCameraState] = useState<CameraState>("init");
  const [feedback, setFeedback]       = useState<FeedbackType>("no_face");
  const [countdown, setCountdown]     = useState(3);
  const [capturedImage, setCapturedImage] = useState<string>("");
  const [camReady, setCamReady]       = useState(false);
  const [accepted, setAccepted]       = useState(false);
  const acceptedRef = useRef(false);
  useEffect(() => { acceptedRef.current = accepted; }, [accepted]);


  // ── Init MediaPipe detector (VIDEO mode) ──────────────────────────────────
  const initDetector = useCallback(async () => {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      detectorRef.current = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numFaces: 1,
      });
    } catch (e) {
      console.error("MediaPipe init error:", e);
      setCameraState("error");
    }
  }, []);

  // ── Start camera ──────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCamReady(true);
        setCameraState("detecting");
      }
    } catch (e) {
      console.error("Camera error:", e);
      toast.error("No se pudo acceder a la cámara. Verifica los permisos.");
      setCameraState("error");
    }
  }, []);

  // ── Analyze face position ──────────────────────────────────────────────────
  const analyzeFace = useCallback((landmarks: { x: number; y: number }[]): FeedbackType => {
    if (!landmarks.length) return "no_face";

    // Key landmarks: nose tip (1), left cheek (234), right cheek (454), chin (152), forehead (10)
    const noseTip  = landmarks[1];
    const leftEdge = landmarks[234];
    const rightEdge= landmarks[454];
    const chin     = landmarks[152];
    const forehead = landmarks[10];

    if (!noseTip || !leftEdge || !rightEdge || !chin || !forehead) return "no_face";

    const faceWidth  = Math.abs(rightEdge.x - leftEdge.x);
    const faceHeight = Math.abs(chin.y - forehead.y);
    const faceCenterX = (leftEdge.x + rightEdge.x) / 2;
    const faceCenterY = (chin.y + forehead.y) / 2;

    // Size check (normalized coords 0-1)
    if (faceWidth < 0.25 || faceHeight < 0.3) return "too_far";
    if (faceWidth > 0.72 || faceHeight > 0.85) return "too_close";

    // Center check
    const offsetX = Math.abs(faceCenterX - 0.5);
    const offsetY = Math.abs(faceCenterY - 0.5);
    if (offsetX > 0.12 || offsetY > 0.12) return "off_center";

    return "good";
  }, []);

  // ── Detection loop ────────────────────────────────────────────────────────
  const detect = useCallback(() => {
    const video    = videoRef.current;
    const detector = detectorRef.current;
    if (!video || !detector || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(detect);
      return;
    }

    const results = detector.detectForVideo(video, performance.now());
    const lm = results.faceLandmarks?.[0] ?? [];
    const fb = analyzeFace(lm);
    setFeedback(fb);

    if (fb === "good") {
      goodFramesRef.current += 1;
    } else {
      goodFramesRef.current = 0;
    }

    // After 20 good frames (~0.5s) start countdown — but only if user accepted disclaimers
    if (goodFramesRef.current >= 20 && cameraState === "detecting" && acceptedRef.current) {
      setCameraState("countdown");
      return; // stop loop here — countdown takes over
    }


    rafRef.current = requestAnimationFrame(detect);
  }, [analyzeFace, cameraState]);

  // ── Countdown logic ───────────────────────────────────────────────────────
  useEffect(() => {
    if (cameraState !== "countdown") return;

    setCountdown(3);
    let count = 3;

    const tick = () => {
      count -= 1;
      setCountdown(count);
      if (count <= 0) {
        capturePhoto();
      } else {
        countdownRef.current = setTimeout(tick, 1000);
      }
    };

    countdownRef.current = setTimeout(tick, 1000);
    return () => { if (countdownRef.current) clearTimeout(countdownRef.current); };
  }, [cameraState]);

  // ── Capture photo ─────────────────────────────────────────────────────────
  const capturePhoto = useCallback(() => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width  = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    // Mirror + crop to square
    ctx.save();
    ctx.translate(size, 0);
    ctx.scale(-1, 1);
    const offsetX = (video.videoWidth - size) / 2;
    const offsetY = (video.videoHeight - size) / 2;
    ctx.drawImage(video, offsetX, offsetY, size, size, 0, 0, size, size);
    ctx.restore();

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setCapturedImage(dataUrl);
    setCameraState("confirm");

    // Stop camera
    streamRef.current?.getTracks().forEach(t => t.stop());
    cancelAnimationFrame(rafRef.current);
  }, []);

  // ── Retry ─────────────────────────────────────────────────────────────────
  const handleRetry = useCallback(async () => {
    goodFramesRef.current = 0;
    setCapturedImage("");
    setCameraState("detecting");
    setCamReady(false);
    await startCamera();
  }, [startCamera]);

  // ── Upload fallback (subir foto en su lugar) ──────────────────────────────
  const handleFileSelected = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor selecciona una imagen");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const size = Math.min(img.naturalWidth, img.naturalHeight);
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d")!;
        const offsetX = (img.naturalWidth - size) / 2;
        const offsetY = (img.naturalHeight - size) / 2;
        ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, size, size);
        const squareDataUrl = canvas.toDataURL("image/jpeg", 0.92);
        // Stop camera if running
        streamRef.current?.getTracks().forEach(t => t.stop());
        cancelAnimationFrame(rafRef.current);
        if (countdownRef.current) clearTimeout(countdownRef.current);
        setCapturedImage(squareDataUrl);
        setCameraState("confirm");
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    // reset so same file can be reselected
    e.target.value = "";
  }, []);

  const openFilePicker = useCallback(() => {
    if (!acceptedRef.current) {
      toast.error("Debes aceptar los términos para continuar");
      return;
    }
    fileInputRef.current?.click();
  }, []);



  // ── Boot sequence ─────────────────────────────────────────────────────────
  useEffect(() => {
    initDetector().then(startCamera);
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      cancelAnimationFrame(rafRef.current);
      if (countdownRef.current) clearTimeout(countdownRef.current);
    };
  }, []);

  // ── Start detection loop when camera is ready ─────────────────────────────
  useEffect(() => {
    if (cameraState === "detecting" && camReady) {
      rafRef.current = requestAnimationFrame(detect);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [cameraState, camReady, detect]);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  const isLive = cameraState === "detecting" || cameraState === "countdown";
  const ovalColor = feedback === "good" ? "#10B981" : feedback === "no_face" ? "rgba(255,255,255,0.4)" : "#F59E0B";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden bg-background">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-primary/20 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/15 rounded-full blur-[120px]" />
      </div>

      {/* Logo */}
      <div className="mb-6 z-10">
        <img src={simsmileLogo} alt="SimSmile by Clínica Miró" className="w-36 md:w-44 opacity-60" />
      </div>

      <div className="z-10 w-full max-w-sm flex flex-col items-center gap-6">

        {/* Title */}
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1">
            {cameraState === "confirm" ? "¿Usamos esta foto?" : "Posiciona tu rostro"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {cameraState === "confirm"
              ? "Revisa que tu sonrisa se vea bien"
              : "Centra tu cara en el óvalo y sonríe"}
          </p>
        </div>

        {/* Legal disclaimer pre-captura + checkbox obligatorio */}
        {cameraState !== "confirm" && (
          <div className="w-full rounded-xl border border-border/60 bg-muted/30 px-3 py-3 space-y-3">
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              <strong className="text-foreground">Simulación estética, no diagnóstico médico.</strong>{" "}
              Tu imagen se procesa para generar una previsualización referencial de tu sonrisa y no se almacena sin tu autorización.
              Procesamiento conforme a la <strong className="text-foreground">Ley 19.628</strong> de Chile.
              Resultados solo informativos; cualquier tratamiento requiere evaluación profesional en Clínica Miró.
            </p>
            <label className="flex items-start gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="sr-only"
              />
              <span
                className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  accepted ? "bg-primary border-primary" : "border-border group-hover:border-primary/60"
                }`}
                aria-hidden
              >
                {accepted && (
                  <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span className="text-[11px] leading-relaxed text-foreground">
                Acepto los términos anteriores y autorizo el procesamiento de mi imagen facial para generar la simulación.
              </span>
            </label>
          </div>
        )}



        {/* Camera / Confirm view */}
        <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-black shadow-2xl shadow-primary/20 border-2 border-primary/20">

          {/* Live video */}
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              transform: "scaleX(-1)",
              display: cameraState === "confirm" ? "none" : "block",
            }}
            playsInline
            muted
          />

          {/* Captured image */}
          {cameraState === "confirm" && capturedImage && (
            <img src={capturedImage} alt="Foto de tu rostro capturada" className="absolute inset-0 w-full h-full object-cover" />
          )}

          {/* Oval guide overlay */}
          {isLive && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {/* Dark mask outside oval */}
              <defs>
                <mask id="oval-mask">
                  <rect width="100" height="100" fill="white" />
                  <ellipse cx="50" cy="47" rx="33" ry="42" fill="black" />
                </mask>
              </defs>
              <rect width="100" height="100" fill="rgba(0,0,0,0.45)" mask="url(#oval-mask)" />
              {/* Oval border */}
              <ellipse
                cx="50" cy="47" rx="33" ry="42"
                fill="none"
                stroke={ovalColor}
                strokeWidth="1.2"
                style={{ transition: "stroke 0.3s ease" }}
              />
              {/* Corner ticks */}
              {[
                [50, 5],   // top
                [50, 89],  // bottom
                [17, 47],  // left
                [83, 47],  // right
              ].map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r="1.2" fill={ovalColor} style={{ transition: "fill 0.3s ease" }} />
              ))}
            </svg>
          )}

          {/* Feedback label */}
          {isLive && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
              <motion.div
                key={feedback}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-md"
                style={{
                  background: "rgba(0,0,0,0.6)",
                  color: FEEDBACK_COLORS[feedback],
                  border: `1px solid ${FEEDBACK_COLORS[feedback]}40`,
                }}
              >
                {FEEDBACK_MESSAGES[feedback]}
              </motion.div>
            </div>
          )}

          {/* Countdown overlay */}
          <AnimatePresence>
            {cameraState === "countdown" && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center bg-black/30 z-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  key={countdown}
                  initial={{ scale: 2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="text-8xl font-bold text-white drop-shadow-2xl"
                  style={{ textShadow: "0 0 40px rgba(168,85,247,0.8)" }}
                >
                  {countdown}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Init loading */}
          {cameraState === "init" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-white/60 text-sm">Iniciando cámara…</p>
            </div>
          )}

          {/* Error state */}
          {cameraState === "error" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3 p-6 text-center">
              <p className="text-red-400 text-sm font-medium">No se pudo acceder a la cámara</p>
              <p className="text-white/40 text-xs">Verifica los permisos o sube una foto desde tu galería</p>
              <Button
                onClick={openFilePicker}
                size="sm"
                className="mt-2 gap-2 bg-gradient-to-r from-primary to-accent text-white"
              >
                <Upload className="w-4 h-4" />
                Subir foto en su lugar
              </Button>
            </div>
          )}
        </div>

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Hidden file input for upload fallback */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelected}
        />

        {/* Upload fallback button (visible while camera is live or initializing) */}
        {cameraState !== "confirm" && cameraState !== "error" && (
          <button
            type="button"
            onClick={openFilePicker}
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 inline-flex items-center gap-1.5 self-center"
          >
            <Upload className="w-3 h-3" />
            Subir foto en su lugar
          </button>
        )}


        {/* Confirm buttons */}
        {cameraState === "confirm" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 w-full"
          >
            <Button
              onClick={handleRetry}
              variant="outline"
              size="lg"
              className="flex-1 gap-2 border-2"
            >
              <RefreshCw className="w-4 h-4" />
              Repetir
            </Button>
            <Button
              onClick={() => onCapture(capturedImage)}
              size="lg"
              className="flex-1 gap-2 bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/30"
            >
              Analizar
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}

        {/* Tips */}
        {isLive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center text-xs text-muted-foreground space-y-1"
          >
            <p>💡 Buena iluminación frontal · Sonríe mostrando dientes · Fondo neutro</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

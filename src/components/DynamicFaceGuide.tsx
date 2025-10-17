import { useEffect, useRef, useState } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

interface DynamicFaceGuideProps {
  videoRef: React.RefObject<HTMLVideoElement>;
}

export default function DynamicFaceGuide({ videoRef }: DynamicFaceGuideProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const animationFrameRef = useRef<number>();
  const [_faceDetected, setFaceDetected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeFaceLandmarker = async () => {
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm"
        );

        const faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numFaces: 1,
          minFaceDetectionConfidence: 0.5,
          minFacePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        if (mounted) {
          faceLandmarkerRef.current = faceLandmarker;
          setIsInitialized(true);
        }
      } catch (error) {
        console.error("Error initializing face landmarker:", error);
      }
    };

    initializeFaceLandmarker();

    return () => {
      mounted = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (faceLandmarkerRef.current) {
        faceLandmarkerRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (!isInitialized || !videoRef.current || !canvasRef.current || !faceLandmarkerRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const detectFace = () => {
      if (!video.videoWidth || !video.videoHeight) {
        animationFrameRef.current = requestAnimationFrame(detectFace);
        return;
      }

      // Set canvas size to match video
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      try {
        const results = faceLandmarkerRef.current?.detectForVideo(video, performance.now());

        if (results && results.faceLandmarks && results.faceLandmarks.length > 0) {
          setFaceDetected(true);
          const landmarks = results.faceLandmarks[0];

          // Get face bounds from landmarks
          const xCoords = landmarks.map(l => l.x * canvas.width);
          const yCoords = landmarks.map(l => l.y * canvas.height);
          
          const minX = Math.min(...xCoords);
          const maxX = Math.max(...xCoords);
          const minY = Math.min(...yCoords);
          const maxY = Math.max(...yCoords);
          
          const centerX = (minX + maxX) / 2;
          const centerY = (minY + maxY) / 2;
          const width = maxX - minX;
          const height = maxY - minY;

          // Draw larger oval guide around face with padding
          const padding = 40;
          const ovalWidth = width + padding * 2;
          const ovalHeight = height + padding * 2;

          // Draw pulsing glow effect
          ctx.save();
          ctx.shadowColor = "hsl(var(--primary))";
          ctx.shadowBlur = 20;
          
          // Main oval
          ctx.beginPath();
          ctx.ellipse(centerX, centerY, ovalWidth / 2, ovalHeight / 2, 0, 0, Math.PI * 2);
          ctx.strokeStyle = "hsl(var(--primary))";
          ctx.lineWidth = 4;
          ctx.stroke();
          
          ctx.restore();

          // Draw alignment indicators at corners
          const drawCornerIndicator = (x: number, y: number, angle: number) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            ctx.strokeStyle = "hsl(var(--primary))";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(30, 0);
            ctx.moveTo(0, 0);
            ctx.lineTo(0, 30);
            ctx.stroke();
            ctx.restore();
          };

          const margin = 20;
          drawCornerIndicator(centerX - ovalWidth/2 + margin, centerY - ovalHeight/2 + margin, 0);
          drawCornerIndicator(centerX + ovalWidth/2 - margin, centerY - ovalHeight/2 + margin, Math.PI / 2);
          drawCornerIndicator(centerX + ovalWidth/2 - margin, centerY + ovalHeight/2 - margin, Math.PI);
          drawCornerIndicator(centerX - ovalWidth/2 + margin, centerY + ovalHeight/2 - margin, -Math.PI / 2);

          // Success indicator
          ctx.fillStyle = "hsl(var(--primary))";
          ctx.font = "bold 18px Inter";
          ctx.textAlign = "center";
          ctx.fillText("✓ Rostro detectado", centerX, centerY - ovalHeight/2 - 40);
        } else {
          setFaceDetected(false);
          
          // Draw static guide when no face detected
          const guideWidth = canvas.width * 0.6;
          const guideHeight = canvas.height * 0.7;
          const guideCenterX = canvas.width / 2;
          const guideCenterY = canvas.height / 2;

          ctx.beginPath();
          ctx.ellipse(guideCenterX, guideCenterY, guideWidth / 2, guideHeight / 2, 0, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
          ctx.lineWidth = 3;
          ctx.setLineDash([10, 5]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Instruction text
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
          ctx.font = "bold 20px Inter";
          ctx.textAlign = "center";
          ctx.fillText("Posiciona tu rostro en el óvalo", guideCenterX, guideCenterY - guideHeight/2 - 40);
        }
      } catch (error) {
        console.error("Error detecting face:", error);
      }

      animationFrameRef.current = requestAnimationFrame(detectFace);
    };

    detectFace();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isInitialized, videoRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ mixBlendMode: "screen" }}
    />
  );
}

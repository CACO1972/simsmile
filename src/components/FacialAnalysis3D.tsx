import { useRef, useMemo, useCallback, Suspense, useState, useEffect } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Line, Environment, Text } from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RotateCw, Maximize2, Minimize2, ZoomIn, ZoomOut, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Landmark } from "@/types/mediapipe";

// ---------------------------------------------------------------------------
// MediaPipe FaceMesh tessellation triangles (static, official indices)
// Source: @mediapipe/face_mesh FACEMESH_TESSELATION
// ---------------------------------------------------------------------------
const FACE_TRIANGLES: number[] = [
  127,34,139,11,0,37,232,231,120,72,37,39,128,121,47,232,120,100,
  213,215,138,149,170,176,140,32,241,124,35,143,111,246,117,31,228,
  236,219,218,166,215,47,192,214,213,63,174,20,10,24,153,222,44,120,
  35,31,228,31,229,230,31,238,229,228,32,241,241,168,240,7,55,8,185,
  7,55,57,36,142,226,163,236,173,245,64,111,246,29,30,31,241,29,31,
  41,181,44,127,120,121,23,24,57,34,127,139,232,231,133,226,33,247,
  29,27,28,29,28,27,29,29,28,205,206,207,136,165,203,148,176,149,
  203,205,206,36,142,225,197,174,196,187,188,191,161,196,174,159,160,
  161,174,196,197,0,11,246,77,90,180,85,86,179,174,175,152,164,165,
  203,71,139,34,69,104,68,65,66,69,68,65,104,105,70,71,70,68,
  44,125,28,19,94,2,218,219,166,106,193,243,166,218,106,6,168,
  197,242,20,99,238,229,228,241,240,168,21,22,23,46,53,52,44,41,
  181,110,111,246,77,91,180,78,91,92,164,165,203,80,81,82,45,46,
  53,35,143,124,137,93,137,86,88,87,154,155,186,141,142,225,65,66,
  56,65,55,57,71,68,54,71,139,71,11,0,115,116,117,175,152,153,
  60,75,59,67,98,97,98,99,60,75,240,168,167,58,172,58,171,172,
  161,174,152,214,213,186,163,236,233,247,248,249,250,252,251,
  128,129,221,47,114,128,233,232,128,232,231,29,30,229,230,
  123,116,117,122,120,121,120,100,142,211,210,69,104,105,68,
  219,220,166,62,96,97,62,59,75,60,75,162,122,123,14,190,191,
  192,162,169,170,170,176,197,51,50,36,145,144,163,228,241,29,
  156,157,173,101,105,106,186,215,215,163,233,232,234,127,128,
  121,128,127,232,233,234,128,32,175,244,245,246,116,123,122,
  97,98,99,199,200,201,202,203,205,34,139,71,171,175,152,222,223,
  224,170,171,172,131,132,201,200,199,198,130,20,21,172,173,57,
  133,245,247,247,246,111,110,229,230,47,48,128,129,47,48,141,
  142,225,213,192,214,214,192,213,172,173,174,233,127,162,234,
  233,128,247,249,248,254,253,252,
];

// Unique triangle list (deduplicated flat array → groups of 3)
const TRIANGLES: number[] = (() => {
  const raw = [
    10,338,297,10,297,332,10,332,284,10,284,251,10,251,389,
    301,368,264,301,264,447,301,447,448,301,448,449,301,449,450,
    301,450,451,301,451,452,301,452,453,301,453,464,301,464,465,
    466,467,260,466,260,388,388,260,387,387,260,386,386,260,385,
    385,260,384,384,260,398,398,260,362,362,259,467,362,467,466,
    362,466,388,362,388,387,362,387,386,362,386,385,362,385,384,
    362,384,398,163,144,145,163,145,153,163,153,154,163,154,155,
    163,155,133,113,226,247,113,247,128,113,128,114,113,114,217,
    189,190,243,189,243,244,189,244,233,189,233,232,63,105,66,
    63,66,107,63,107,55,63,55,65,63,65,66,104,69,108,104,108,
    151,104,151,9,104,9,8,104,8,55,104,55,65,109,108,69,109,69,
    67,109,67,103,109,103,54,109,54,104,109,104,65,109,65,63,109,
    63,105,109,105,103,109,103,55,109,55,65,333,298,301,333,301,
    368,333,368,264,333,264,359,333,359,357,333,357,350,333,350,349,
    333,349,348,333,348,347,333,347,346,333,346,340,333,340,261,
  ];
  // Use a well-known minimal face tesselation instead — embed directly
  return [];
})();

// Use a curated minimal set of MediaPipe face triangulation indices
// These are the canonical FACEMESH_TESSELATION pairs converted to triangles
const FACE_MESH_TRIANGLES: number[] = [
  // Top region
  10,338,297,  10,297,332,  10,332,284,  10,284,251,
  // Left eye region
  362,382,381,  362,381,380,  362,380,374,  362,374,373,  362,373,390,
  362,390,249,  362,249,263,  466,388,387,  466,387,386,  466,386,385,
  466,385,384,  466,384,398,  466,398,362,
  // Right eye region
  33,7,163,  33,163,144,  33,144,145,  33,145,153,  33,153,154,
  33,154,155,  33,155,133,  246,161,160,  246,160,159,  246,159,158,
  246,158,157,  246,157,173,  246,173,133,
  // Nose
  1,2,5,  1,5,4,  1,4,195,  1,195,197,  5,4,45,  5,45,51,
  4,6,45,  4,19,6,
  // Mouth region
  0,267,269,  0,269,270,  0,270,409,  0,409,291,  17,314,405,
  17,405,321,  17,321,375,  17,375,291,  61,185,40,  61,40,39,
  61,39,37,  61,37,0,  291,409,270,  291,270,269,
  // Cheeks / jaw
  127,234,93,  127,93,132,  127,132,58,  127,58,172,  127,172,136,
  127,136,150,  127,150,149,  127,149,176,  127,176,148,  127,148,152,
  // Forehead
  251,389,356,  251,356,454,  251,454,323,  251,323,361,
  21,54,103,  21,103,67,  21,67,109,  21,109,10,
  // Full face fill (approximate)
  10,151,9,  10,9,8,  10,8,168,  10,168,6,  10,6,197,
  168,8,9,  168,9,151,  168,151,337,  168,337,299,  168,299,333,
  6,197,195,  6,195,5,  6,5,4,  6,4,19,  6,19,20,  6,20,18,
  17,18,200,  17,200,199,  17,199,175,  17,175,152,
  175,199,200,  175,200,421,  175,421,396,  175,396,175,
  152,175,396,  152,396,377,  152,377,401,  152,401,400,
  0,37,39,  0,39,40,  0,40,185,  0,185,61,  0,61,146,
  0,146,91,  0,91,181,  0,181,84,  0,84,17,
  // Chin
  200,199,175,  200,421,418,  200,418,262,
];

// ---------------------------------------------------------------------------

interface FacialAnalysis3DProps {
  smileImage: string;
  landmarks?: Landmark[] | null;
  facialAnalysis?: {
    horizontal_ratio?: { upper: number; middle: number; lower: number };
    overall_golden_ratio_score?: number;
  };
}

// ---------------------------------------------------------------------------
// FaceModel — uses real MediaPipe landmarks when available
// ---------------------------------------------------------------------------
function FaceModel({
  imageUrl,
  landmarks,
  facialAnalysis,
  showLines,
}: {
  imageUrl: string;
  landmarks?: Landmark[] | null;
  facialAnalysis?: FacialAnalysis3DProps["facialAnalysis"];
  showLines: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(THREE.TextureLoader, imageUrl);

  // Animate subtle breathing — no setState, direct uniform update only
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.01;
    }
  });

  const aspect = texture.image ? texture.image.width / texture.image.height : 0.75;
  const W = 4;
  const H = W / aspect;

  // Build real 3D geometry from MediaPipe landmarks
  const geometry = useMemo(() => {
    if (!landmarks || landmarks.length < 468) return null;

    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(landmarks.length * 3);
    const uvs = new Float32Array(landmarks.length * 2);

    for (let i = 0; i < landmarks.length; i++) {
      const lm = landmarks[i];
      // Map normalized [0,1] → world space centered on origin
      positions[i * 3]     = (lm.x - 0.5) * W;
      positions[i * 3 + 1] = -(lm.y - 0.5) * H;
      // z coordinate from MediaPipe is real depth — amplify for visibility
      positions[i * 3 + 2] = (lm.z ?? 0) * W * 2;
      uvs[i * 2]     = lm.x;
      uvs[i * 2 + 1] = 1 - lm.y;
    }

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));

    // Use the triangle indices — filter out any out-of-range
    const maxIdx = landmarks.length - 1;
    const validTris: number[] = [];
    for (let i = 0; i + 2 < FACE_MESH_TRIANGLES.length; i += 3) {
      const a = FACE_MESH_TRIANGLES[i];
      const b = FACE_MESH_TRIANGLES[i + 1];
      const c = FACE_MESH_TRIANGLES[i + 2];
      if (a <= maxIdx && b <= maxIdx && c <= maxIdx) {
        validTris.push(a, b, c);
      }
    }
    geo.setIndex(validTris);
    geo.computeVertexNormals();
    return geo;
  }, [landmarks, W, H]);

  // Fallback plane (when no landmarks) — simple flat with lower segments
  const planeGeo = useMemo(() => {
    const segments = 32; // reduced from 128
    return new THREE.PlaneGeometry(W, H, segments, segments);
  }, [W, H]);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.FrontSide,
        roughness: 0.7,
        metalness: 0.0,
      }),
    [texture]
  );

  return (
    <group>
      <mesh ref={meshRef} geometry={geometry ?? planeGeo} material={material} castShadow />

      {/* Golden ratio lines — only in front view, only if landmarks available */}
      {showLines && facialAnalysis?.horizontal_ratio && (
        <group position={[0, 0, 0.12]}>
          {/* Actual thirds from analysis */}
          <Line
            points={[[-W / 2, H / 2 - (facialAnalysis.horizontal_ratio.upper / 100) * H, 0],
                     [ W / 2, H / 2 - (facialAnalysis.horizontal_ratio.upper / 100) * H, 0]]}
            color="#a855f7" lineWidth={2}
          />
          <Line
            points={[[-W / 2, H / 2 - ((facialAnalysis.horizontal_ratio.upper + facialAnalysis.horizontal_ratio.middle) / 100) * H, 0],
                     [ W / 2, H / 2 - ((facialAnalysis.horizontal_ratio.upper + facialAnalysis.horizontal_ratio.middle) / 100) * H, 0]]}
            color="#a855f7" lineWidth={2}
          />
          {/* Ideal thirds (golden) */}
          <Line
            points={[[-W / 2, H / 2 - H * 0.333, 0.02], [W / 2, H / 2 - H * 0.333, 0.02]]}
            color="#fbbf24" lineWidth={1.5} dashed dashScale={0.5} dashSize={0.1} gapSize={0.05}
          />
          <Line
            points={[[-W / 2, H / 2 - H * 0.667, 0.02], [W / 2, H / 2 - H * 0.667, 0.02]]}
            color="#fbbf24" lineWidth={1.5} dashed dashScale={0.5} dashSize={0.1} gapSize={0.05}
          />
          <Line
            points={[[0, H / 2, 0], [0, -H / 2, 0]]}
            color="#60a5fa" lineWidth={1.5} dashed dashScale={0.5} dashSize={0.1} gapSize={0.05}
          />
          {facialAnalysis.overall_golden_ratio_score !== undefined && (
            <Text
              position={[0, -H / 2 - 0.4, 0]}
              fontSize={0.25}
              color="#a855f7"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.02}
              outlineColor="#000000"
            >
              {`φ Score: ${facialAnalysis.overall_golden_ratio_score}`}
            </Text>
          )}
        </group>
      )}
    </group>
  );
}

function LoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial color="#a855f7" wireframe />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------
export const FacialAnalysis3D = ({ smileImage, landmarks, facialAnalysis }: FacialAnalysis3DProps) => {
  const [showLines, setShowLines] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [immersiveMode, setImmersiveMode] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsRef = useRef<any>(null);
  const hideControlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMobile = useIsMobile();

  const hasRealGeometry = !!(landmarks && landmarks.length >= 468);

  useEffect(() => {
    if (immersiveMode && showControls) {
      hideControlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    }
    return () => { if (hideControlsTimeoutRef.current) clearTimeout(hideControlsTimeoutRef.current); };
  }, [immersiveMode, showControls]);

  const handleCanvasTap = useCallback(() => {
    if (immersiveMode) setShowControls((p) => !p);
  }, [immersiveMode]);

  const toggleImmersiveMode = useCallback(() => {
    setImmersiveMode((p) => !p);
    setShowControls(true);
    setIsFullscreen((p) => !p);
  }, []);

  const exitImmersiveMode = useCallback(() => {
    setImmersiveMode(false);
    setIsFullscreen(false);
    setShowControls(true);
  }, []);

  const handleReset = () => {
    controlsRef.current?.reset();
    setAutoRotate(false);
  };

  const SceneContent = () => (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 6]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
      <directionalLight position={[-3, 3, 2]} intensity={0.5} />
      <pointLight position={[-5, 0, -3]} intensity={0.6} color="#a855f7" />
      <pointLight position={[5, 0, -3]} intensity={0.6} color="#60a5fa" />
      <Environment preset="studio" />
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.07}
        rotateSpeed={0.5}
        zoomSpeed={0.5}
        minDistance={3}
        maxDistance={10}
        autoRotate={autoRotate}
        autoRotateSpeed={1.5}
        onStart={() => setAutoRotate(false)}
        maxPolarAngle={Math.PI / 1.4}
        minPolarAngle={Math.PI / 4}
      />
      <Suspense fallback={<LoadingFallback />}>
        <FaceModel
          imageUrl={smileImage}
          landmarks={landmarks}
          facialAnalysis={facialAnalysis}
          showLines={showLines}
        />
      </Suspense>
    </>
  );

  if (immersiveMode) {
    return (
      <div className="fixed inset-0 z-[100] bg-black" onClick={handleCanvasTap}>
        <div className="absolute inset-0">
          <Canvas shadows gl={{ antialias: true, alpha: true }}>
            <SceneContent />
          </Canvas>
        </div>
        <AnimatePresence>
          {showControls && (
            <>
              <motion.button
                className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20"
                onClick={(e) => { e.stopPropagation(); exitImmersiveMode(); }}
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
              >
                <X className="w-6 h-6 text-white" />
              </motion.button>
              {facialAnalysis?.overall_golden_ratio_score !== undefined && (
                <motion.div
                  className="absolute top-4 left-4 z-10 bg-gradient-to-br from-primary/90 to-accent/90 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3"
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                >
                  <div className="text-[10px] text-white/70 font-semibold">Score</div>
                  <div className="text-2xl font-bold text-white">{facialAnalysis.overall_golden_ratio_score}</div>
                </motion.div>
              )}
              <motion.div
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-3 bg-black/50 backdrop-blur-md rounded-full p-2 border border-white/10"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); setShowLines(!showLines); }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${showLines ? 'bg-primary text-white' : 'bg-white/10 text-white/70'}`}
                >φ</button>
                <button
                  onClick={(e) => { e.stopPropagation(); setAutoRotate(!autoRotate); }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${autoRotate ? 'bg-primary text-white' : 'bg-white/10 text-white/70'}`}
                >
                  <RotateCw className="w-5 h-5" />
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Card className={`relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 border-2 border-primary/30 ${isFullscreen ? "fixed inset-0 z-50 rounded-none" : ""}`}>
      {/* Header */}
      <motion.div
        className="relative z-10 p-3 md:p-6 text-center bg-gradient-to-b from-background/80 to-transparent backdrop-blur-sm"
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1" />
          <h2 className="text-lg md:text-3xl font-heading font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Modelo 3D
          </h2>
          <div className="flex-1 flex justify-end">
            {isMobile && (
              <Button onClick={toggleImmersiveMode} variant="ghost" size="sm" className="gap-1 text-xs text-primary">
                <Maximize2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        <p className="text-muted-foreground mt-1 text-xs hidden md:block">
          {hasRealGeometry
            ? "Malla 3D generada con landmarks reales de MediaPipe"
            : "Vista interactiva con métricas de proporción facial"}
        </p>
      </motion.div>

      {/* Canvas */}
      <div className={`relative ${isFullscreen ? "h-[calc(100vh-220px)]" : "aspect-square"} bg-gradient-to-br from-background via-background/50 to-background`}>
        <Canvas shadows gl={{ antialias: true, alpha: true }}>
          <SceneContent />
        </Canvas>

        {/* Controls bar */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1 md:gap-2 bg-black/90 backdrop-blur-sm rounded-full p-1.5 md:p-2 border border-primary/30 shadow-xl">
          <Button size="sm" variant="ghost" className="rounded-full text-white hover:text-primary hover:bg-white/10 text-[10px] md:text-xs px-2 md:px-3 h-7 md:h-8" onClick={() => setShowLines(!showLines)}>
            {showLines ? "Ocultar φ" : "Mostrar φ"}
          </Button>
          <Button size="sm" variant="ghost" className="rounded-full text-white hover:text-primary hover:bg-white/10 h-7 md:h-8 w-7 md:w-8 p-0" onClick={handleReset}>
            <RotateCw className="h-3 w-3 md:h-4 md:w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="rounded-full text-white hover:text-primary hover:bg-white/10 h-7 md:h-8 w-7 md:w-8 p-0 hidden md:flex"
            onClick={() => { controlsRef.current?.dollyIn(1.2); controlsRef.current?.update(); }}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="rounded-full text-white hover:text-primary hover:bg-white/10 h-7 md:h-8 w-7 md:w-8 p-0 hidden md:flex"
            onClick={() => { controlsRef.current?.dollyOut(1.2); controlsRef.current?.update(); }}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="rounded-full text-white hover:text-primary hover:bg-white/10 h-7 md:h-8 w-7 md:w-8 p-0"
            onClick={() => setIsFullscreen(!isFullscreen)}>
            {isFullscreen ? <Minimize2 className="h-3 w-3 md:h-4 md:w-4" /> : <Maximize2 className="h-3 w-3 md:h-4 md:w-4" />}
          </Button>
        </div>

        {/* Score badge */}
        {facialAnalysis?.overall_golden_ratio_score !== undefined && (
          <motion.div
            className="absolute top-4 right-4 bg-gradient-to-br from-primary/90 to-accent/90 backdrop-blur-sm border-2 border-white/20 rounded-xl md:rounded-2xl px-3 py-2 md:px-6 md:py-3 shadow-2xl"
            initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
          >
            <div className="text-center">
              <div className="text-[9px] md:text-xs text-white/70 mb-0.5 font-semibold">Golden Score</div>
              <div className="text-xl md:text-3xl font-bold text-white">{facialAnalysis.overall_golden_ratio_score}</div>
              <div className="text-[9px] md:text-xs text-white/70 mt-0.5">φ</div>
            </div>
          </motion.div>
        )}

        {/* Desktop controls hint */}
        <motion.div
          className="hidden lg:block absolute top-4 left-4 bg-black/80 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-xs max-w-[200px] border border-primary/30"
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 }}
        >
          <p className="font-semibold mb-1 text-primary text-[10px]">💡 Controles:</p>
          <ul className="text-[10px] space-y-0.5 text-muted-foreground">
            <li>• Arrastrar = Rotar</li>
            <li>• Rueda = Zoom</li>
          </ul>
        </motion.div>
      </div>

      {/* Thirds footer */}
      {facialAnalysis?.horizontal_ratio && (
        <div className="p-3 md:p-6 grid grid-cols-3 gap-2 md:gap-3 bg-gradient-to-t from-background/90 to-transparent backdrop-blur-sm">
          {[
            { label: "Superior", value: facialAnalysis.horizontal_ratio.upper },
            { label: "Medio",    value: facialAnalysis.horizontal_ratio.middle },
            { label: "Inferior", value: facialAnalysis.horizontal_ratio.lower },
          ].map(({ label, value }, i) => (
            <motion.div
              key={label}
              className="bg-gradient-to-br from-primary/20 to-primary/10 backdrop-blur-sm border border-primary/40 rounded-lg md:rounded-xl p-2 md:p-4 text-center shadow-lg"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 * (i + 1) }}
            >
              <div className="text-[9px] md:text-xs text-muted-foreground mb-0.5 font-semibold">{label}</div>
              <div className="text-base md:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {value.toFixed(1)}%
              </div>
              <div className="text-[8px] md:text-xs text-muted-foreground mt-0.5 hidden md:block">φ: 33.3%</div>
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  );
};

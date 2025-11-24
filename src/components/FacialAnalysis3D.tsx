import { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Text, Line } from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RotateCw, Maximize2, Minimize2, ZoomIn, ZoomOut } from "lucide-react";
import { motion } from "framer-motion";

interface FacialAnalysis3DProps {
  smileImage: string;
  facialAnalysis: {
    horizontal_ratio?: { upper: number; middle: number; lower: number };
    overall_golden_ratio_score?: number;
  };
}

type ViewAngle = 'front' | 'left' | 'right';

// Componente que renderiza la cara como un plano 3D con textura
function FaceModel({ imageUrl, facialAnalysis, showLines, viewAngle }: { 
  imageUrl: string; 
  facialAnalysis: FacialAnalysis3DProps['facialAnalysis'];
  showLines: boolean;
  viewAngle: ViewAngle;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const texture = useLoader(THREE.TextureLoader, imageUrl);
  
  // Animación sutil de respiración
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  // Rotar automáticamente al ángulo seleccionado
  useEffect(() => {
    if (groupRef.current) {
      let targetRotation = 0;
      switch (viewAngle) {
        case 'left':
          targetRotation = Math.PI * 0.3; // 54 grados
          break;
        case 'right':
          targetRotation = -Math.PI * 0.3; // -54 grados
          break;
        default:
          targetRotation = 0;
      }
      
      // Animación suave de rotación
      const duration = 1000;
      const startRotation = groupRef.current.rotation.y;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        
        if (groupRef.current) {
          groupRef.current.rotation.y = startRotation + (targetRotation - startRotation) * eased;
        }
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      animate();
    }
  }, [viewAngle]);

  const aspect = texture.image ? texture.image.width / texture.image.height : 1;
  const width = 4;
  const height = width / aspect;

  return (
    <group ref={groupRef}>
      {/* Plano principal con la imagen */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <planeGeometry args={[width, height, 32, 32]} />
        <meshStandardMaterial 
          map={texture} 
          side={THREE.DoubleSide}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* Líneas del Golden Ratio en 3D */}
      {showLines && facialAnalysis.horizontal_ratio && viewAngle === 'front' && (
        <group position={[0, 0, 0.1]}>
          {/* Línea superior */}
          <Line
            points={[
              [-width / 2, height / 2 - (facialAnalysis.horizontal_ratio.upper / 100) * height, 0],
              [width / 2, height / 2 - (facialAnalysis.horizontal_ratio.upper / 100) * height, 0]
            ]}
            color="#a855f7"
            lineWidth={3}
            dashed={false}
          />

          {/* Línea media */}
          <Line
            points={[
              [-width / 2, height / 2 - ((facialAnalysis.horizontal_ratio.upper + facialAnalysis.horizontal_ratio.middle) / 100) * height, 0],
              [width / 2, height / 2 - ((facialAnalysis.horizontal_ratio.upper + facialAnalysis.horizontal_ratio.middle) / 100) * height, 0]
            ]}
            color="#a855f7"
            lineWidth={3}
            dashed={false}
          />

          {/* Líneas del Golden Ratio ideal (punteadas) */}
          <Line
            points={[
              [-width / 2, height / 2 - height * 0.333, 0.05],
              [width / 2, height / 2 - height * 0.333, 0.05]
            ]}
            color="#fbbf24"
            lineWidth={2}
            dashed
            dashScale={0.5}
            dashSize={0.1}
            gapSize={0.05}
          />

          <Line
            points={[
              [-width / 2, height / 2 - height * 0.667, 0.05],
              [width / 2, height / 2 - height * 0.667, 0.05]
            ]}
            color="#fbbf24"
            lineWidth={2}
            dashed
            dashScale={0.5}
            dashSize={0.1}
            gapSize={0.05}
          />

          {/* Línea vertical central */}
          <Line
            points={[
              [0, height / 2, 0],
              [0, -height / 2, 0]
            ]}
            color="#60a5fa"
            lineWidth={2}
            dashed
            dashScale={0.5}
            dashSize={0.1}
            gapSize={0.05}
          />

          {/* Texto flotante con el score */}
          {facialAnalysis.overall_golden_ratio_score !== undefined && (
            <Text
              position={[0, -height / 2 - 0.5, 0]}
              fontSize={0.3}
              color="#a855f7"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.02}
              outlineColor="#000000"
            >
              {`φ Score: ${facialAnalysis.overall_golden_ratio_score}`}
            </Text>
          )}

          {/* Etiquetas de tercios */}
          <Text
            position={[-width / 2 - 0.5, height / 2 - (facialAnalysis.horizontal_ratio.upper / 200) * height, 0]}
            fontSize={0.15}
            color="#ffffff"
            anchorX="right"
            anchorY="middle"
            outlineWidth={0.01}
            outlineColor="#000000"
          >
            {`Superior\n${facialAnalysis.horizontal_ratio.upper.toFixed(1)}%`}
          </Text>

          <Text
            position={[-width / 2 - 0.5, height / 2 - (facialAnalysis.horizontal_ratio.upper + facialAnalysis.horizontal_ratio.middle / 2) / 100 * height, 0]}
            fontSize={0.15}
            color="#ffffff"
            anchorX="right"
            anchorY="middle"
            outlineWidth={0.01}
            outlineColor="#000000"
          >
            {`Medio\n${facialAnalysis.horizontal_ratio.middle.toFixed(1)}%`}
          </Text>

          <Text
            position={[-width / 2 - 0.5, -height / 2 + (facialAnalysis.horizontal_ratio.lower / 200) * height, 0]}
            fontSize={0.15}
            color="#ffffff"
            anchorX="right"
            anchorY="middle"
            outlineWidth={0.01}
            outlineColor="#000000"
          >
            {`Inferior\n${facialAnalysis.horizontal_ratio.lower.toFixed(1)}%`}
          </Text>
        </group>
      )}
    </group>
  );
}

// Componente de loading
function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#a855f7" wireframe />
    </mesh>
  );
}

export const FacialAnalysis3D = ({ smileImage, facialAnalysis }: FacialAnalysis3DProps) => {
  const [showLines, setShowLines] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [viewAngle, setViewAngle] = useState<ViewAngle>('front');
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    // Reset camera cuando cambia fullscreen
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  }, [isFullscreen]);

  const handleZoomIn = () => {
    if (controlsRef.current) {
      controlsRef.current.dollyIn(1.2);
      controlsRef.current.update();
    }
  };

  const handleZoomOut = () => {
    if (controlsRef.current) {
      controlsRef.current.dollyOut(1.2);
      controlsRef.current.update();
    }
  };

  const handleReset = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
      setAutoRotate(false);
      setViewAngle('front');
    }
  };

  return (
    <Card className={`relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 border-2 border-primary/30 ${
      isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
    }`}>
      {/* Header */}
      <motion.div 
        className="relative z-10 p-6 text-center bg-gradient-to-b from-background/80 to-transparent backdrop-blur-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-3xl md:text-4xl font-heading font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          Vista 3D Interactiva
        </h2>
        <p className="text-muted-foreground mt-2">
          Explora tu análisis desde múltiples ángulos
        </p>
      </motion.div>

      {/* Selector de ángulos de vista */}
      <div className="relative z-10 flex justify-center gap-2 px-6 pb-4">
        <Button
          onClick={() => setViewAngle('left')}
          variant={viewAngle === 'left' ? 'default' : 'outline'}
          size="sm"
          className="gap-2"
        >
          Perfil Izquierdo
        </Button>
        <Button
          onClick={() => setViewAngle('front')}
          variant={viewAngle === 'front' ? 'default' : 'outline'}
          size="sm"
          className="gap-2"
        >
          Frontal
        </Button>
        <Button
          onClick={() => setViewAngle('right')}
          variant={viewAngle === 'right' ? 'default' : 'outline'}
          size="sm"
          className="gap-2"
        >
          Perfil Derecho
        </Button>
      </div>

      {/* Canvas 3D */}
      <div className={`relative ${isFullscreen ? 'h-[calc(100vh-250px)]' : 'aspect-square'} bg-gradient-to-br from-background via-background/50 to-background`}>
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[0, 0, 6]} />
          
          {/* Iluminación mejorada */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow />
          <directionalLight position={[-10, 10, 5]} intensity={0.8} />
          <pointLight position={[-10, -10, -5]} intensity={0.6} color="#a855f7" />
          <spotLight position={[0, 5, 5]} angle={0.3} intensity={0.7} color="#fbbf24" />

          {/* Controles de órbita */}
          <OrbitControls
            ref={controlsRef}
            enableDamping
            dampingFactor={0.05}
            rotateSpeed={0.5}
            zoomSpeed={0.5}
            minDistance={3}
            maxDistance={10}
            autoRotate={autoRotate}
            autoRotateSpeed={2}
            onStart={() => setAutoRotate(false)}
          />

          {/* Modelo de la cara */}
          <Suspense fallback={<LoadingFallback />}>
            <FaceModel 
              imageUrl={smileImage} 
              facialAnalysis={facialAnalysis}
              showLines={showLines}
              viewAngle={viewAngle}
            />
          </Suspense>

          {/* Grid de referencia */}
          <gridHelper args={[10, 10, '#333333', '#222222']} position={[0, -2.5, 0]} />
        </Canvas>

        {/* Controles flotantes */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/80 backdrop-blur-sm rounded-full p-2 border border-primary/30">
          <Button
            size="sm"
            variant="ghost"
            className="rounded-full text-white hover:text-primary hover:bg-white/10"
            onClick={() => setShowLines(!showLines)}
          >
            {showLines ? 'Ocultar Líneas' : 'Mostrar Líneas'}
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            className="rounded-full text-white hover:text-primary hover:bg-white/10"
            onClick={handleReset}
          >
            <RotateCw className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            className="rounded-full text-white hover:text-primary hover:bg-white/10"
            onClick={handleZoomIn}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            className="rounded-full text-white hover:text-primary hover:bg-white/10"
            onClick={handleZoomOut}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            className="rounded-full text-white hover:text-primary hover:bg-white/10"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>

        {/* Instrucciones flotantes */}
        <motion.div
          className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm max-w-xs"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 }}
        >
          <p className="font-semibold mb-1">💡 Controles:</p>
          <ul className="text-xs space-y-1 text-muted-foreground">
            <li>• Clic + Arrastrar = Rotar</li>
            <li>• Clic derecho + Arrastrar = Mover</li>
            <li>• Rueda = Zoom</li>
            <li>• Usa los botones para cambiar vista</li>
          </ul>
        </motion.div>

        {/* Badge de score flotante */}
        {facialAnalysis.overall_golden_ratio_score !== undefined && (
          <motion.div
            className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm border-2 border-primary rounded-2xl px-6 py-3 shadow-2xl"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.5
            }}
          >
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Golden Score</div>
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {facialAnalysis.overall_golden_ratio_score}
              </div>
              <div className="text-xs text-primary">φ 3D</div>
            </div>
          </motion.div>
        )}

        {/* Indicador de ángulo actual */}
        <motion.div
          className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-primary/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          key={viewAngle}
        >
          {viewAngle === 'front' && '👤 Vista Frontal'}
          {viewAngle === 'left' && '◀️ Perfil Izquierdo'}
          {viewAngle === 'right' && '▶️ Perfil Derecho'}
        </motion.div>
      </div>

      {/* Footer con información de tercios */}
      {facialAnalysis.horizontal_ratio && (
        <div className="p-6 grid grid-cols-3 gap-3 bg-gradient-to-t from-background/80 to-transparent backdrop-blur-sm">
          <motion.div 
            className="bg-primary/10 backdrop-blur-sm border border-primary/30 rounded-lg p-3 text-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-xs text-muted-foreground mb-1">Superior</div>
            <div className="text-xl font-bold text-primary">
              {facialAnalysis.horizontal_ratio.upper.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">φ: 33.3%</div>
          </motion.div>
          
          <motion.div 
            className="bg-primary/10 backdrop-blur-sm border border-primary/30 rounded-lg p-3 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="text-xs text-muted-foreground mb-1">Medio</div>
            <div className="text-xl font-bold text-primary">
              {facialAnalysis.horizontal_ratio.middle.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">φ: 33.3%</div>
          </motion.div>
          
          <motion.div 
            className="bg-primary/10 backdrop-blur-sm border border-primary/30 rounded-lg p-3 text-center"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="text-xs text-muted-foreground mb-1">Inferior</div>
            <div className="text-xl font-bold text-primary">
              {facialAnalysis.horizontal_ratio.lower.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">φ: 33.3%</div>
          </motion.div>
        </div>
      )}
    </Card>
  );
};
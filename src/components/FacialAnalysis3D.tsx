import { useRef, useState, useEffect, Suspense, useMemo } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Text, Line, Environment } from "@react-three/drei";
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

// Shader personalizado para efecto de profundidad y relieve
const depthMaterialVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  uniform float time;
  
  // Simular depth map basado en la posición
  float getDepth(vec2 uv) {
    // Centro de la cara tiene más profundidad (nariz)
    float centerDist = distance(uv, vec2(0.5, 0.5));
    float noseBridge = smoothstep(0.4, 0.2, distance(uv, vec2(0.5, 0.45)));
    float cheeks = smoothstep(0.5, 0.3, distance(uv, vec2(0.3, 0.6))) * 0.3;
    float cheeksRight = smoothstep(0.5, 0.3, distance(uv, vec2(0.7, 0.6))) * 0.3;
    float forehead = smoothstep(0.5, 0.2, distance(uv, vec2(0.5, 0.2))) * 0.2;
    float chin = smoothstep(0.4, 0.2, distance(uv, vec2(0.5, 0.85))) * 0.15;
    
    return (noseBridge * 0.3 + cheeks + cheeksRight + forehead + chin);
  }
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    
    // Aplicar desplazamiento basado en depth map
    float depth = getDepth(uv);
    vec3 newPosition = position + normal * depth * 0.5;
    
    // Añadir respiración sutil
    newPosition.z += sin(time * 0.5) * 0.02;
    
    vPosition = newPosition;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const depthMaterialFragmentShader = `
  uniform sampler2D map;
  uniform float time;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vec4 texColor = texture2D(map, vUv);
    
    // Calcular iluminación mejorada
    vec3 lightDir = normalize(vec3(1.0, 1.0, 2.0));
    float diffuse = max(dot(vNormal, lightDir), 0.0);
    
    // Ambient occlusion simulado
    float ao = 1.0 - (length(vPosition) * 0.05);
    
    // Rim lighting para contornos
    vec3 viewDir = normalize(cameraPosition - vPosition);
    float rim = 1.0 - max(dot(viewDir, vNormal), 0.0);
    rim = pow(rim, 3.0) * 0.5;
    
    // Subsurface scattering simulado (efecto de piel)
    float sss = pow(max(dot(vNormal, lightDir), 0.0), 2.0) * 0.3;
    
    // Combinar efectos
    vec3 lighting = vec3(0.4 + diffuse * 0.6 + sss);
    lighting *= ao;
    vec3 finalColor = texColor.rgb * lighting + vec3(rim);
    
    gl_FragColor = vec4(finalColor, texColor.a);
  }
`;

// Componente que renderiza la cara con geometría 3D realista
function FaceModel({ imageUrl, facialAnalysis, showLines, viewAngle }: { 
  imageUrl: string; 
  facialAnalysis: FacialAnalysis3DProps['facialAnalysis'];
  showLines: boolean;
  viewAngle: ViewAngle;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const texture = useLoader(THREE.TextureLoader, imageUrl);
  const [time, setTime] = useState(0);
  
  // Material personalizado con shader
  const customMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        map: { value: texture },
        time: { value: 0 }
      },
      vertexShader: depthMaterialVertexShader,
      fragmentShader: depthMaterialFragmentShader,
      side: THREE.DoubleSide,
      transparent: true
    });
  }, [texture]);
  
  // Actualizar tiempo para animación
  useFrame((state) => {
    setTime(state.clock.elapsedTime);
    if (customMaterial) {
      customMaterial.uniforms.time.value = state.clock.elapsedTime;
    }
    
    // Rotación suave de grupo
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.02;
    }
  });

  // Rotar automáticamente al ángulo seleccionado
  useEffect(() => {
    if (groupRef.current) {
      let targetRotation = 0;
      switch (viewAngle) {
        case 'left':
          targetRotation = Math.PI * 0.35;
          break;
        case 'right':
          targetRotation = -Math.PI * 0.35;
          break;
        default:
          targetRotation = 0;
      }
      
      const duration = 1200;
      const startRotation = groupRef.current.rotation.y;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        
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
  const segments = 128; // Mayor resolución para mejor deformación

  return (
    <group ref={groupRef}>
      {/* Plano principal con geometría deformable y shader personalizado */}
      <mesh ref={meshRef} position={[0, 0, 0]} castShadow receiveShadow>
        <planeGeometry args={[width, height, segments, segments]} />
        <primitive object={customMaterial} attach="material" />
      </mesh>

      {/* Sombra proyectada */}
      <mesh position={[0, -2.8, -0.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 8]} />
        <shadowMaterial opacity={0.3} />
      </mesh>

      {/* Líneas del Golden Ratio en 3D */}
      {showLines && facialAnalysis.horizontal_ratio && viewAngle === 'front' && (
        <group position={[0, 0, 0.15]}>
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
          Modelo 3D Realista
        </h2>
        <p className="text-muted-foreground mt-2">
          Reconstrucción con profundidad y geometría avanzada
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
          ◀ Perfil Izquierdo
        </Button>
        <Button
          onClick={() => setViewAngle('front')}
          variant={viewAngle === 'front' ? 'default' : 'outline'}
          size="sm"
          className="gap-2"
        >
          👤 Frontal
        </Button>
        <Button
          onClick={() => setViewAngle('right')}
          variant={viewAngle === 'right' ? 'default' : 'outline'}
          size="sm"
          className="gap-2"
        >
          Perfil Derecho ▶
        </Button>
      </div>

      {/* Canvas 3D */}
      <div className={`relative ${isFullscreen ? 'h-[calc(100vh-250px)]' : 'aspect-square'} bg-gradient-to-br from-background via-background/50 to-background`}>
        <Canvas shadows gl={{ antialias: true, alpha: true }}>
          <PerspectiveCamera makeDefault position={[0, 0, 6]} />
          
          {/* Iluminación cinematográfica mejorada */}
          <ambientLight intensity={0.4} />
          
          {/* Key light - luz principal */}
          <directionalLight 
            position={[5, 5, 5]} 
            intensity={1.5} 
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          
          {/* Fill light - luz de relleno */}
          <directionalLight position={[-3, 3, 2]} intensity={0.6} />
          
          {/* Rim light - luz de contorno */}
          <pointLight position={[-5, 0, -3]} intensity={0.8} color="#a855f7" />
          <pointLight position={[5, 0, -3]} intensity={0.8} color="#60a5fa" />
          
          {/* Back light */}
          <spotLight 
            position={[0, 3, -3]} 
            angle={0.4} 
            intensity={0.7} 
            color="#fbbf24"
            castShadow
          />

          {/* Environment para reflejos realistas */}
          <Environment preset="studio" />

          {/* Niebla sutil */}
          <fog attach="fog" args={['#000000', 8, 15]} />

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
            maxPolarAngle={Math.PI / 1.5}
            minPolarAngle={Math.PI / 3}
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

          {/* Grid de referencia con mejor estilo */}
          <gridHelper 
            args={[10, 20, '#444444', '#222222']} 
            position={[0, -2.5, 0]} 
          />
        </Canvas>

        {/* Controles flotantes */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/90 backdrop-blur-sm rounded-full p-2 border border-primary/30 shadow-xl">
          <Button
            size="sm"
            variant="ghost"
            className="rounded-full text-white hover:text-primary hover:bg-white/10 text-xs"
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

        {/* Instrucciones flotantes mejoradas */}
        <motion.div
          className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm text-white px-4 py-3 rounded-xl text-sm max-w-xs border border-primary/30"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 }}
        >
          <p className="font-semibold mb-2 text-primary">💡 Controles 3D:</p>
          <ul className="text-xs space-y-1 text-muted-foreground">
            <li>• Clic + Arrastrar = Rotar</li>
            <li>• Clic derecho + Arrastrar = Mover</li>
            <li>• Rueda = Zoom</li>
            <li>• Usa botones para vistas predefinidas</li>
          </ul>
          <div className="mt-2 pt-2 border-t border-primary/20">
            <p className="text-xs text-accent">✨ Con geometría deformable y efectos de profundidad</p>
          </div>
        </motion.div>

        {/* Badge de score flotante mejorado */}
        {facialAnalysis.overall_golden_ratio_score !== undefined && (
          <motion.div
            className="absolute top-4 right-4 bg-gradient-to-br from-primary/90 to-accent/90 backdrop-blur-sm border-2 border-white/20 rounded-2xl px-6 py-3 shadow-2xl"
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
              <div className="text-xs text-white/70 mb-1 font-semibold">Golden Score 3D</div>
              <div className="text-3xl font-bold text-white">
                {facialAnalysis.overall_golden_ratio_score}
              </div>
              <div className="text-xs text-white/70 mt-1">φ Realista</div>
            </div>
          </motion.div>
        )}

        {/* Indicador de ángulo actual mejorado */}
        <motion.div
          className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-accent backdrop-blur-sm text-white px-5 py-2 rounded-full text-sm font-bold shadow-xl border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          key={viewAngle}
        >
          {viewAngle === 'front' && '👤 Vista Frontal'}
          {viewAngle === 'left' && '◀️ Perfil Izquierdo'}
          {viewAngle === 'right' && '▶️ Perfil Derecho'}
        </motion.div>

        {/* Badge de tecnología */}
        <motion.div
          className="absolute top-20 left-4 bg-black/80 backdrop-blur-sm border border-accent/30 rounded-lg px-3 py-2 text-xs"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.5 }}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span className="text-accent font-semibold">WebGL + Shaders</span>
          </div>
          <div className="text-muted-foreground mt-1">Geometría deformable</div>
        </motion.div>
      </div>

      {/* Footer con información de tercios mejorado */}
      {facialAnalysis.horizontal_ratio && (
        <div className="p-6 grid grid-cols-3 gap-3 bg-gradient-to-t from-background/90 to-transparent backdrop-blur-sm">
          <motion.div 
            className="bg-gradient-to-br from-primary/20 to-primary/10 backdrop-blur-sm border-2 border-primary/40 rounded-xl p-4 text-center shadow-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-xs text-muted-foreground mb-1 font-semibold">Superior</div>
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {facialAnalysis.horizontal_ratio.upper.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">φ: 33.3%</div>
          </motion.div>
          
          <motion.div 
            className="bg-gradient-to-br from-accent/20 to-accent/10 backdrop-blur-sm border-2 border-accent/40 rounded-xl p-4 text-center shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="text-xs text-muted-foreground mb-1 font-semibold">Medio</div>
            <div className="text-2xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              {facialAnalysis.horizontal_ratio.middle.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">φ: 33.3%</div>
          </motion.div>
          
          <motion.div 
            className="bg-gradient-to-br from-primary/20 to-accent/10 backdrop-blur-sm border-2 border-primary/40 rounded-xl p-4 text-center shadow-lg"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="text-xs text-muted-foreground mb-1 font-semibold">Inferior</div>
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {facialAnalysis.horizontal_ratio.lower.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">φ: 33.3%</div>
          </motion.div>
        </div>
      )}
    </Card>
  );
};
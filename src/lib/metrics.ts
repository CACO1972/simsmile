export type SmileMetrics = {
  smileArc: "consonante" | "plano" | "inverso";
  gingival: { mm: number; class: "baja" | "media" | "alta" | "excesiva" };
  midline: { mm: number; side: "izquierda" | "derecha" | "centrado" };
  buccalRatio: number; // 0..1
  facialMidline: { mm: number; side: "izquierda" | "derecha" | "centrado" };
  midlineCoincidence: { deviation: number; status: "coincidente" | "leve" | "moderada" | "severa" };
  facialProportions: {
    upperThird: number;    // frente a cejas
    middleThird: number;   // cejas a base nariz
    lowerThird: number;    // base nariz a mentón
    isBalanced: boolean;
  };
};

// Re-export recommendation functions
export { analyzeFaceCharacteristics, generateSmileRecommendations, generateAnalysisText, type FaceAnalysis, type SmileRecommendation } from "./recommendations";

// Distancia euclidiana
const d = (a: any, b: any) => Math.hypot(a.x - b.x, a.y - b.y);

// mm estimados: normalizamos por distancia interpupilar (IPD) ~ 63 mm
function toMM(normalizedDistance: number, ipdPixels: number, imageWidth: number) {
  const IPD_MM = 63; // Distancia interpupilar promedio en mm
  const pixelDistance = normalizedDistance * imageWidth;
  return (pixelDistance / ipdPixels) * IPD_MM;
}

export function computeMetrics(params: {
  restLm: any[]; smileLm: any[]; imgW: number; imgH: number;
}): SmileMetrics {
  const { smileLm, imgW } = params;
  // Indices aproximados (MediaPipe Face Landmarker 468 pts):
  const LEFT_EYE_OUT = 33, RIGHT_EYE_OUT = 263;     // externos
  const MOUTH_LEFT = 61, MOUTH_RIGHT = 291;
  const UPPER_LIP = 13;  // labio sup. medio aprox.
  const LOWER_LIP = 14;  // labio inf. medio aprox.
  const NOSE_TIP = 1;    // nariz
  const FOREHEAD = 10;   // punto superior frente
  const CHIN = 152;      // mentón
  const LEFT_EYEBROW = 70, RIGHT_EYEBROW = 300;  // cejas
  const NOSE_BRIDGE = 168; // puente nasal

  const eyeL = smileLm[LEFT_EYE_OUT], eyeR = smileLm[RIGHT_EYE_OUT];
  const mouthL = smileLm[MOUTH_LEFT], mouthR = smileLm[MOUTH_RIGHT];
  const upper = smileLm[UPPER_LIP], lower = smileLm[LOWER_LIP];
  const nose = smileLm[NOSE_TIP];
  const forehead = smileLm[FOREHEAD];
  const chin = smileLm[CHIN];
  const browL = smileLm[LEFT_EYEBROW], browR = smileLm[RIGHT_EYEBROW];
  const noseBridge = smileLm[NOSE_BRIDGE];

  const ipdNormalized = d(eyeL, eyeR);
  const ipdPixels = ipdNormalized * imgW;

  // === LÍNEA MEDIA FACIAL ===
  // Calculamos la línea media facial usando puntos centrales: frente, puente nasal, nariz, mentón
  const facialCenterX = (forehead.x + noseBridge.x + nose.x + chin.x) / 4;
  
  // === LÍNEA MEDIA DENTAL ===
  // Centro de la boca (entre comisuras)
  const dentalCenterX = (mouthL.x + mouthR.x) / 2;
  
  // Desviación de la línea dental respecto a la nariz
  const dentalDeviationNorm = Math.abs(nose.x - dentalCenterX);
  const midlineMM = toMM(dentalDeviationNorm, ipdPixels, imgW);
  const dentalSide = Math.abs(nose.x - dentalCenterX) < 0.005 ? "centrado" : 
                     (nose.x > dentalCenterX ? "derecha" : "izquierda");

  // === COINCIDENCIA ENTRE LÍNEA MEDIA FACIAL Y DENTAL ===
  const facialDentalDeviationNorm = Math.abs(facialCenterX - dentalCenterX);
  const deviationMM = toMM(facialDentalDeviationNorm, ipdPixels, imgW);
  const facialSide = Math.abs(facialCenterX - dentalCenterX) < 0.005 ? "centrado" : 
                     (facialCenterX > dentalCenterX ? "izquierda" : "derecha");
  
  let coincidenceStatus: "coincidente" | "leve" | "moderada" | "severa";
  if (deviationMM < 1) coincidenceStatus = "coincidente";
  else if (deviationMM < 2) coincidenceStatus = "leve";
  else if (deviationMM < 4) coincidenceStatus = "moderada";
  else coincidenceStatus = "severa";

  // === PROPORCIONES FACIALES (Tercios) ===
  const browY = (browL.y + browR.y) / 2;
  const noseBaseY = nose.y;
  const chinY = chin.y;
  const foreheadY = forehead.y;
  
  const totalHeight = chinY - foreheadY;
  const upperThird = (browY - foreheadY) / totalHeight;
  const middleThird = (noseBaseY - browY) / totalHeight;
  const lowerThird = (chinY - noseBaseY) / totalHeight;
  
  // Proporción ideal: cada tercio ~33.3%
  const isBalanced = Math.abs(upperThird - 0.333) < 0.05 && 
                     Math.abs(middleThird - 0.333) < 0.05 && 
                     Math.abs(lowerThird - 0.333) < 0.05;

  // Arco de sonrisa: relación y de comisuras vs labio sup. centro
  const yCorners = (mouthL.y + mouthR.y) / 2;
  const delta = (upper.y - yCorners) / (1/ipdNormalized);
  let smileArc: SmileMetrics["smileArc"];
  if (delta > 0.5) smileArc = "consonante";
  else if (delta < -0.2) smileArc = "inverso";
  else smileArc = "plano";

  // Exposición gingival - calculada en píxeles y convertida a mm
  const lipOpenNormalized = d(upper, lower);
  const gingMM = Math.max(0, toMM(lipOpenNormalized, ipdPixels, imgW) - 2); // Restamos 2mm del grosor labial base
  const gingClass = gingMM < 1 ? "baja" : gingMM < 3 ? "media" : gingMM < 5 ? "alta" : "excesiva";

  // Corredor bucal - ratio más preciso
  const mouthW = d(mouthL, mouthR);
  const faceW = d(eyeL, eyeR) * 2.5; // Ancho facial estimado
  const buccalRatio = Math.min(1, Math.max(0, 1 - (mouthW / faceW)));

  return {
    smileArc,
    gingival: { mm: gingMM, class: gingClass },
    midline: { mm: midlineMM, side: dentalSide },
    buccalRatio,
    facialMidline: { mm: toMM(Math.abs(facialCenterX - 0.5), ipdPixels, imgW), side: facialSide },
    midlineCoincidence: { deviation: deviationMM, status: coincidenceStatus },
    facialProportions: {
      upperThird: upperThird * 100,
      middleThird: middleThird * 100,
      lowerThird: lowerThird * 100,
      isBalanced
    }
  };
}

// Overlay 1: Líneas Medias (Facial y Dental) - GRÁFICO MEJORADO
export function drawMidlineOverlay(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  lm: any[],
  m: SmileMetrics
) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;

  const forehead = lm[10];
  const chin = lm[152];
  const nose = lm[1];
  const noseBridge = lm[168];
  const mouthL = lm[61], mouthR = lm[291];
  const upperLip = lm[13];
  
  // Calcular línea media facial (centro de la cara)
  const facialCenterX = ((forehead.x + noseBridge.x + nose.x + chin.x) / 4) * w;
  
  // Calcular línea media dental (centro entre incisivos centrales, estimado por centro de labio superior)
  const dentalCenterX = upperLip.x * w;
  
  // Línea Media Facial (Rosa brillante con sombra - vertical completa)
  ctx.shadowColor = "rgba(236, 72, 153, 0.8)";
  ctx.shadowBlur = 10;
  ctx.strokeStyle = "#ec4899";
  ctx.lineWidth = 5;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(facialCenterX, Math.max(0, forehead.y * h - 30));
  ctx.lineTo(facialCenterX, Math.min(h, chin.y * h + 30));
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Línea Media Dental (Azul brillante con sombra - desde nariz hasta mentón)
  ctx.shadowColor = "rgba(59, 130, 246, 0.8)";
  ctx.shadowBlur = 10;
  ctx.strokeStyle = "#3b82f6";
  ctx.lineWidth = 5;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(dentalCenterX, nose.y * h);
  ctx.lineTo(dentalCenterX, chin.y * h);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Etiquetas con mayor visibilidad
  const deviation = m.midlineCoincidence.deviation;
  const statusColor = deviation < 1 ? "#22c55e" : deviation < 2 ? "#facc15" : "#ef4444";
  
  // Etiqueta de desviación
  ctx.fillStyle = "rgba(0,0,0,0.85)";
  ctx.fillRect(w - 180, 15, 165, 80);
  
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 12px system-ui";
  ctx.fillText("Línea Media", w - 170, 35);
  
  ctx.fillStyle = statusColor;
  ctx.font = "bold 18px system-ui";
  ctx.fillText(`${deviation.toFixed(1)}mm`, w - 170, 60);
  
  ctx.fillStyle = "#cccccc";
  ctx.font = "11px system-ui";
  ctx.fillText(deviation < 1 ? "Centrada" : deviation < 2 ? "Leve desv." : "Desviada", w - 170, 80);
  
  // Leyenda de colores
  ctx.fillStyle = "rgba(0,0,0,0.85)";
  ctx.fillRect(15, 15, 160, 80);
  
  // Rosa = Facial
  ctx.fillStyle = "#ec4899";
  ctx.fillRect(25, 25, 30, 4);
  ctx.fillStyle = "#ffffff";
  ctx.font = "12px system-ui";
  ctx.fillText("Línea Facial", 60, 30);
  
  // Azul = Dental
  ctx.fillStyle = "#3b82f6";
  ctx.fillRect(25, 50, 30, 4);
  ctx.fillStyle = "#ffffff";
  ctx.fillText("Línea Dental", 60, 55);
  
  ctx.fillStyle = "#cccccc";
  ctx.font = "10px system-ui";
  ctx.fillText("Idealmente coinciden", 25, 75);
}

// Overlay 2: Proporciones Faciales (Tercios) - GRÁFICO MEJORADO
export function drawProportionsOverlay(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  lm: any[],
  m: SmileMetrics
) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;

  const forehead = lm[10];
  const chin = lm[152];
  const browL = lm[70], browR = lm[300];
  const nose = lm[1];
  
  const browY = ((browL.y + browR.y) / 2) * h;
  const noseBaseY = nose.y * h;
  const foreheadY = forehead.y * h;
  const chinY = chin.y * h;
  
  // Líneas horizontales con sombra para mayor visibilidad
  ctx.shadowColor = "rgba(59, 130, 246, 0.8)";
  ctx.shadowBlur = 8;
  ctx.strokeStyle = "#3b82f6";
  ctx.lineWidth = 4;
  ctx.setLineDash([]);
  
  const leftX = w * 0.05;
  const rightX = w * 0.95;
  
  [foreheadY, browY, noseBaseY, chinY].forEach(y => {
    ctx.beginPath();
    ctx.moveTo(leftX, y);
    ctx.lineTo(rightX, y);
    ctx.stroke();
  });
  ctx.shadowBlur = 0;

  // Etiquetas mejoradas con descripciones
  const labels = [
    { y: (foreheadY + browY) / 2, text: `${m.facialProportions.upperThird.toFixed(0)}%`, label: "Tercio Superior" },
    { y: (browY + noseBaseY) / 2, text: `${m.facialProportions.middleThird.toFixed(0)}%`, label: "Tercio Medio" },
    { y: (noseBaseY + chinY) / 2, text: `${m.facialProportions.lowerThird.toFixed(0)}%`, label: "Tercio Inferior" }
  ];

  labels.forEach(label => {
    ctx.fillStyle = "rgba(0,0,0,0.85)";
    ctx.fillRect(w - 140, label.y - 25, 130, 50);
    
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px system-ui";
    ctx.fillText(label.label, w - 130, label.y - 8);
    
    ctx.fillStyle = "#3b82f6";
    ctx.font = "bold 20px system-ui";
    ctx.fillText(label.text, w - 130, label.y + 15);
  });
  
  // Información de balance
  const isBalanced = m.facialProportions.isBalanced;
  ctx.fillStyle = "rgba(0,0,0,0.85)";
  ctx.fillRect(15, h - 95, 180, 80);
  
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 13px system-ui";
  ctx.fillText("Proporciones Faciales", 25, h - 70);
  
  ctx.fillStyle = isBalanced ? "#22c55e" : "#facc15";
  ctx.font = "bold 16px system-ui";
  ctx.fillText(isBalanced ? "Balanceadas" : "Analizadas", 25, h - 45);
  
  ctx.fillStyle = "#cccccc";
  ctx.font = "10px system-ui";
  ctx.fillText("Ideal: 33% cada tercio", 25, h - 25);
}

// Overlay 3: Análisis de Sonrisa - GRÁFICO MEJORADO
export function drawSmileOverlay(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  lm: any[],
  m: SmileMetrics
) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;

  const mouthL = lm[61], mouthR = lm[291];
  const upperLip = lm[13], lowerLip = lm[14];
  
  // Puntos clave de la sonrisa con sombra (comisuras y centro)
  ctx.shadowColor = "rgba(236, 72, 153, 0.8)";
  ctx.shadowBlur = 10;
  ctx.fillStyle = "#ec4899";
  [61, 291, 13].forEach(i => {
    const p = lm[i];
    ctx.beginPath();
    ctx.arc(p.x * w, p.y * h, 8, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.shadowBlur = 0;

  // Línea horizontal del arco de sonrisa (conectando comisuras) - más gruesa
  ctx.shadowColor = "rgba(236, 72, 153, 0.8)";
  ctx.shadowBlur = 8;
  ctx.strokeStyle = "#ec4899";
  ctx.lineWidth = 5;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(mouthL.x * w, mouthL.y * h);
  ctx.lineTo(mouthR.x * w, mouthR.y * h);
  ctx.stroke();

  // Curva de arco de sonrisa (parabólica desde comisuras pasando por labio superior)
  const midY = upperLip.y * h;
  const cornerY = (mouthL.y + mouthR.y) / 2 * h;
  const arcHeight = midY - cornerY;
  
  ctx.strokeStyle = "#facc15";
  ctx.lineWidth = 4;
  ctx.setLineDash([8, 5]);
  ctx.beginPath();
  ctx.moveTo(mouthL.x * w, mouthL.y * h);
  ctx.quadraticCurveTo(
    (mouthL.x + mouthR.x) / 2 * w, midY - Math.abs(arcHeight) * 0.3,
    mouthR.x * w, mouthR.y * h
  );
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.shadowBlur = 0;

  // Panel de información mejorado
  ctx.fillStyle = "rgba(0,0,0,0.85)";
  ctx.fillRect(15, 15, 190, 120);
  
  // Título
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 14px system-ui";
  ctx.fillText("Análisis de Sonrisa", 25, 35);
  
  // Exposición gingival
  const gingColor = m.gingival.mm < 3 ? "#22c55e" : "#facc15";
  ctx.fillStyle = "#ffffff";
  ctx.font = "11px system-ui";
  ctx.fillText("Exposición Gingival:", 25, 60);
  
  ctx.fillStyle = gingColor;
  ctx.font = "bold 18px system-ui";
  ctx.fillText(`${m.gingival.mm.toFixed(1)}mm`, 25, 82);
  
  ctx.fillStyle = "#cccccc";
  ctx.font = "10px system-ui";
  ctx.fillText(m.gingival.class === "media" ? "Óptima" : m.gingival.class === "baja" ? "Reducida" : "Elevada", 25, 98);
  
  // Arco de sonrisa
  ctx.fillStyle = "#ffffff";
  ctx.font = "11px system-ui";
  ctx.fillText("Arco:", 110, 60);
  
  ctx.fillStyle = "#facc15";
  ctx.font = "bold 12px system-ui";
  ctx.fillText(
    m.smileArc === "consonante" ? "Consonante" : 
    m.smileArc === "plano" ? "Plano" : "Inverso", 
    110, 78
  );
  
  // Descripción
  ctx.fillStyle = "#cccccc";
  ctx.font = "9px system-ui";
  ctx.fillText("Ideal: 2-4mm encía", 25, 118);
  ctx.fillText("Arco consonante", 25, 130);
}

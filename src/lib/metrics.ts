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

// Overlay 1: Líneas Medias (Facial y Dental) - GRÁFICO SIMPLIFICADO
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
  
  // Línea Media Facial (Rosa brillante - vertical completa)
  ctx.strokeStyle = "#ec4899";
  ctx.lineWidth = 3;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(facialCenterX, Math.max(0, forehead.y * h - 30));
  ctx.lineTo(facialCenterX, Math.min(h, chin.y * h + 30));
  ctx.stroke();

  // Línea Media Dental (Azul brillante - desde nariz hasta mentón)
  ctx.strokeStyle = "#3b82f6";
  ctx.lineWidth = 3;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(dentalCenterX, nose.y * h);
  ctx.lineTo(dentalCenterX, chin.y * h);
  ctx.stroke();

  // Etiqueta compacta
  const deviation = m.midlineCoincidence.deviation;
  const statusColor = deviation < 1 ? "#22c55e" : deviation < 2 ? "#facc15" : "#ef4444";
  
  ctx.fillStyle = "rgba(0,0,0,0.75)";
  ctx.fillRect(w - 160, 15, 145, 35);
  ctx.fillStyle = statusColor;
  ctx.font = "bold 14px system-ui";
  ctx.fillText(`Desv: ${deviation.toFixed(1)}mm`, w - 150, 38);
}

// Overlay 2: Proporciones Faciales (Tercios) - GRÁFICO SIMPLIFICADO
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
  
  // Líneas horizontales más visibles y completas
  ctx.strokeStyle = "#3b82f6";
  ctx.lineWidth = 2;
  ctx.setLineDash([]);
  
  const leftX = w * 0.1;
  const rightX = w * 0.9;
  
  [foreheadY, browY, noseBaseY, chinY].forEach(y => {
    ctx.beginPath();
    ctx.moveTo(leftX, y);
    ctx.lineTo(rightX, y);
    ctx.stroke();
  });

  // Etiquetas en el lateral derecho
  const labels = [
    { y: (foreheadY + browY) / 2, text: `${m.facialProportions.upperThird.toFixed(0)}%` },
    { y: (browY + noseBaseY) / 2, text: `${m.facialProportions.middleThird.toFixed(0)}%` },
    { y: (noseBaseY + chinY) / 2, text: `${m.facialProportions.lowerThird.toFixed(0)}%` }
  ];

  labels.forEach(label => {
    ctx.fillStyle = "rgba(59,130,246,0.9)";
    ctx.fillRect(w - 85, label.y - 15, 70, 30);
    ctx.fillStyle = "white";
    ctx.font = "bold 16px system-ui";
    ctx.fillText(label.text, w - 75, label.y + 5);
  });
}

// Overlay 3: Análisis de Sonrisa - GRÁFICO SIMPLIFICADO
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
  const upperGum = lm[12]; // Punto superior encima del labio
  
  // Puntos clave de la sonrisa (comisuras y centro)
  ctx.fillStyle = "#ec4899";
  [61, 291, 13].forEach(i => {
    const p = lm[i];
    ctx.beginPath();
    ctx.arc(p.x * w, p.y * h, 6, 0, Math.PI * 2);
    ctx.fill();
  });

  // Línea horizontal del arco de sonrisa (conectando comisuras)
  ctx.strokeStyle = "#ec4899";
  ctx.lineWidth = 3;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(mouthL.x * w, mouthL.y * h);
  ctx.lineTo(mouthR.x * w, mouthR.y * h);
  ctx.stroke();

  // Curva de arco de sonrisa (parabólica desde comisuras pasando por labio superior)
  const midY = upperLip.y * h;
  const cornerY = (mouthL.y + mouthR.y) / 2 * h;
  const arcHeight = midY - cornerY;
  
  ctx.strokeStyle = "#ec4899";
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 3]);
  ctx.beginPath();
  ctx.moveTo(mouthL.x * w, mouthL.y * h);
  ctx.quadraticCurveTo(
    (mouthL.x + mouthR.x) / 2 * w, midY - Math.abs(arcHeight) * 0.3,
    mouthR.x * w, mouthR.y * h
  );
  ctx.stroke();
  ctx.setLineDash([]);

  // Etiqueta de exposición gingival
  ctx.fillStyle = "rgba(0,0,0,0.75)";
  ctx.fillRect(15, 15, 150, 35);
  const gingColor = m.gingival.mm < 3 ? "#22c55e" : "#facc15";
  ctx.fillStyle = gingColor;
  ctx.font = "bold 14px system-ui";
  ctx.fillText(`Ging: ${m.gingival.mm.toFixed(1)}mm`, 25, 38);
}

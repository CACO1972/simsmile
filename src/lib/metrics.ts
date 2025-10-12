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
function toMM(norm: number, ipdNorm: number) {
  const IPD_MM = 63;
  return (norm / ipdNorm) * IPD_MM;
}

export function computeMetrics(params: {
  restLm: any[]; smileLm: any[]; imgW: number; imgH: number;
}): SmileMetrics {
  const { smileLm } = params;
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

  const ipd = d(eyeL, eyeR) || 1e-6;

  // === LÍNEA MEDIA FACIAL ===
  // Calculamos la línea media facial usando puntos centrales: frente, puente nasal, nariz, mentón
  const facialCenterX = (forehead.x + noseBridge.x + nose.x + chin.x) / 4;
  
  // === LÍNEA MEDIA DENTAL ===
  // Centro de la boca (entre comisuras)
  const dentalCenterX = (mouthL.x + mouthR.x) / 2;
  
  // Desviación de la línea dental respecto a la nariz
  const dentalDx = nose.x - dentalCenterX;
  const midlineMM = Math.abs(toMM(Math.abs(dentalDx), ipd));
  const dentalSide = Math.abs(dentalDx) < 0.003 ? "centrado" : (dentalDx > 0 ? "derecha" : "izquierda");

  // === COINCIDENCIA ENTRE LÍNEA MEDIA FACIAL Y DENTAL ===
  const facialDentalDeviation = Math.abs(facialCenterX - dentalCenterX);
  const deviationMM = toMM(facialDentalDeviation, ipd);
  const facialSide = Math.abs(facialCenterX - dentalCenterX) < 0.003 ? "centrado" : 
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
  const delta = (upper.y - yCorners) / (1/ipd);
  let smileArc: SmileMetrics["smileArc"];
  if (delta > 0.5) smileArc = "consonante";
  else if (delta < -0.2) smileArc = "inverso";
  else smileArc = "plano";

  // Exposición gingival
  const lipOpen = d(upper, lower);
  const gingMM = Math.max(0, toMM(lipOpen - 0.012, ipd));
  const gingClass = gingMM < 1 ? "baja" : gingMM < 3 ? "media" : gingMM < 5 ? "alta" : "excesiva";

  // Corredor bucal
  const mouthW = d(mouthL, mouthR);
  const faceW = d(eyeL, eyeR) * 2.8;
  const buccalRatio = Math.min(1, mouthW / faceW);

  return {
    smileArc,
    gingival: { mm: gingMM, class: gingClass },
    midline: { mm: midlineMM, side: dentalSide },
    buccalRatio,
    facialMidline: { mm: Math.abs(toMM(Math.abs(facialCenterX - 0.5), ipd)), side: facialSide },
    midlineCoincidence: { deviation: deviationMM, status: coincidenceStatus },
    facialProportions: {
      upperThird: upperThird * 100,
      middleThird: middleThird * 100,
      lowerThird: lowerThird * 100,
      isBalanced
    }
  };
}

// Overlay 1: Líneas Medias (Facial y Dental)
export function drawMidlineOverlay(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  lm: any[],
  m: SmileMetrics
) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.drawImage(image, 0, 0, ctx.canvas.width, ctx.canvas.height);

  const w = ctx.canvas.width;
  const h = ctx.canvas.height;

  const forehead = lm[10];
  const chin = lm[152];
  const nose = lm[1];
  const noseBridge = lm[168];
  const mouthL = lm[61], mouthR = lm[291];
  const upperLip = lm[13];
  
  // Línea Media Facial (Rosa fuerte)
  const facialCenterX = ((forehead.x + noseBridge.x + nose.x + chin.x) / 4) * w;
  ctx.strokeStyle = "rgba(236,72,153,1)";
  ctx.lineWidth = 4;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(facialCenterX, forehead.y * h);
  ctx.lineTo(facialCenterX, chin.y * h);
  ctx.stroke();

  // Línea Media Dental (Azul punteado)
  const dentalCenterX = ((mouthL.x + mouthR.x) / 2) * w;
  ctx.strokeStyle = "rgba(59,130,246,1)";
  ctx.lineWidth = 4;
  ctx.setLineDash([12, 8]);
  ctx.beginPath();
  ctx.moveTo(dentalCenterX, (nose.y - 0.03) * h);
  ctx.lineTo(dentalCenterX, (upperLip.y + 0.08) * h);
  ctx.stroke();
  ctx.setLineDash([]);

  // Panel de información (más grande y visible)
  ctx.fillStyle = "rgba(0,0,0,0.85)";
  ctx.fillRect(10, 10, 360, 120);
  
  ctx.font = "bold 16px system-ui";
  ctx.fillStyle = "white";
  ctx.fillText("📏 ANÁLISIS DE LÍNEAS MEDIAS", 20, 40);
  
  ctx.font = "13px system-ui";
  ctx.fillStyle = "rgba(236,72,153,1)";
  ctx.fillText("━ Línea Media Facial (rosa)", 20, 65);
  
  ctx.fillStyle = "rgba(59,130,246,1)";
  ctx.fillText("━ Línea Media Dental (azul)", 20, 85);
  
  const statusColor = m.midlineCoincidence.status === "coincidente" ? "rgba(34,197,94,1)" :
                      m.midlineCoincidence.status === "leve" ? "rgba(250,204,21,1)" :
                      "rgba(239,68,68,1)";
  ctx.fillStyle = statusColor;
  ctx.font = "bold 13px system-ui";
  ctx.fillText(`Coincidencia: ${m.midlineCoincidence.status} (${m.midlineCoincidence.deviation.toFixed(1)}mm)`, 20, 110);
}

// Overlay 2: Proporciones Faciales (Tercios)
export function drawProportionsOverlay(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  lm: any[],
  m: SmileMetrics
) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.drawImage(image, 0, 0, ctx.canvas.width, ctx.canvas.height);

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
  
  // Líneas horizontales de tercios (más visibles)
  ctx.strokeStyle = "rgba(59,130,246,1)";
  ctx.lineWidth = 4;
  
  // Línea superior (frente)
  ctx.beginPath();
  ctx.moveTo(0, foreheadY);
  ctx.lineTo(w, foreheadY);
  ctx.stroke();
  
  // Línea de cejas
  ctx.beginPath();
  ctx.moveTo(0, browY);
  ctx.lineTo(w, browY);
  ctx.stroke();
  
  // Línea base de nariz
  ctx.beginPath();
  ctx.moveTo(0, noseBaseY);
  ctx.lineTo(w, noseBaseY);
  ctx.stroke();
  
  // Línea de mentón
  ctx.beginPath();
  ctx.moveTo(0, chinY);
  ctx.lineTo(w, chinY);
  ctx.stroke();

  // Etiquetas de tercios con fondo (más grandes y visibles)
  const labelX = 15;
  
  // Tercio superior
  const upper1Y = (foreheadY + browY) / 2;
  ctx.fillStyle = "rgba(59,130,246,0.95)";
  ctx.fillRect(labelX - 5, upper1Y - 18, 180, 32);
  ctx.fillStyle = "white";
  ctx.font = "bold 14px system-ui";
  ctx.fillText(`Superior: ${m.facialProportions.upperThird.toFixed(0)}%`, labelX + 5, upper1Y + 3);
  
  // Tercio medio
  const middle1Y = (browY + noseBaseY) / 2;
  ctx.fillStyle = "rgba(59,130,246,0.95)";
  ctx.fillRect(labelX - 5, middle1Y - 18, 180, 32);
  ctx.fillStyle = "white";
  ctx.fillText(`Medio: ${m.facialProportions.middleThird.toFixed(0)}%`, labelX + 5, middle1Y + 3);
  
  // Tercio inferior
  const lower1Y = (noseBaseY + chinY) / 2;
  ctx.fillStyle = "rgba(59,130,246,0.95)";
  ctx.fillRect(labelX - 5, lower1Y - 18, 180, 32);
  ctx.fillStyle = "white";
  ctx.fillText(`Inferior: ${m.facialProportions.lowerThird.toFixed(0)}%`, labelX + 5, lower1Y + 3);

  // Panel de información (más grande y visible)
  ctx.fillStyle = "rgba(0,0,0,0.85)";
  ctx.fillRect(10, 10, 320, 95);
  
  ctx.font = "bold 16px system-ui";
  ctx.fillStyle = "white";
  ctx.fillText("📐 PROPORCIONES FACIALES", 20, 40);
  
  ctx.font = "13px system-ui";
  ctx.fillText("Ideal: 33% - 33% - 33%", 20, 63);
  
  const balanceColor = m.facialProportions.isBalanced ? "rgba(34,197,94,1)" : "rgba(250,204,21,1)";
  ctx.fillStyle = balanceColor;
  ctx.font = "bold 13px system-ui";
  ctx.fillText(m.facialProportions.isBalanced ? "✓ Equilibradas" : "⚠ Desbalanceadas", 20, 83);
}

// Overlay 3: Análisis de Sonrisa
export function drawSmileOverlay(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  lm: any[],
  m: SmileMetrics
) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.drawImage(image, 0, 0, ctx.canvas.width, ctx.canvas.height);

  const w = ctx.canvas.width;
  const h = ctx.canvas.height;

  const mouthL = lm[61], mouthR = lm[291];
  const upperLip = lm[13], lowerLip = lm[14];
  const nose = lm[1];
  
  // Puntos clave de la sonrisa (más grandes)
  ctx.fillStyle = "rgba(236,72,153,1)";
  [61, 291, 13, 14].forEach(i => {
    const p = lm[i];
    ctx.beginPath();
    ctx.arc(p.x * w, p.y * h, 7, 0, Math.PI * 2);
    ctx.fill();
  });

  // Línea de arco de sonrisa (más visible)
  ctx.strokeStyle = "rgba(236,72,153,1)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(mouthL.x * w, mouthL.y * h);
  ctx.quadraticCurveTo(
    upperLip.x * w, upperLip.y * h,
    mouthR.x * w, mouthR.y * h
  );
  ctx.stroke();

  // Línea intercomisural (más visible)
  ctx.strokeStyle = "rgba(168,85,247,0.9)";
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(mouthL.x * w, mouthL.y * h);
  ctx.lineTo(mouthR.x * w, mouthR.y * h);
  ctx.stroke();
  ctx.setLineDash([]);

  // Panel de información (más grande y visible)
  ctx.fillStyle = "rgba(0,0,0,0.85)";
  ctx.fillRect(10, 10, 350, 130);
  
  ctx.font = "bold 16px system-ui";
  ctx.fillStyle = "white";
  ctx.fillText("😊 ANÁLISIS DE SONRISA", 20, 40);
  
  ctx.font = "13px system-ui";
  
  const arcColor = m.smileArc === 'consonante' ? "rgba(34,197,94,1)" : 
                   m.smileArc === 'plano' ? "rgba(250,204,21,1)" : "rgba(239,68,68,1)";
  ctx.fillStyle = arcColor;
  ctx.font = "bold 13px system-ui";
  ctx.fillText(`Arco: ${m.smileArc}`, 20, 65);
  
  const gingColor = m.gingival.class === 'baja' ? "rgba(34,197,94,1)" : 
                    m.gingival.class === 'media' ? "rgba(250,204,21,1)" : "rgba(239,68,68,1)";
  ctx.fillStyle = gingColor;
  ctx.fillText(`Exposición gingival: ${m.gingival.mm.toFixed(1)}mm (${m.gingival.class})`, 20, 87);
  
  ctx.fillStyle = "white";
  ctx.fillText(`Corredor bucal: ${Math.round(m.buccalRatio*100)}%`, 20, 109);
  
  const buccalColor = (m.buccalRatio >= 0.1 && m.buccalRatio <= 0.3) ? "rgba(34,197,94,1)" : "rgba(250,204,21,1)";
  ctx.fillStyle = buccalColor;
  ctx.fillText(m.buccalRatio >= 0.1 && m.buccalRatio <= 0.3 ? "✓ Ideal" : "⚠ Revisar", 200, 109);
}

export type SmileMetrics = {
  smileArc: "consonante" | "plano" | "inverso";
  gingival: { mm: number; class: "baja" | "media" | "alta" };
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
  const gingClass = gingMM < 1 ? "baja" : gingMM < 3 ? "media" : "alta";

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

export function drawOverlay(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  lm: any[],
  m: SmileMetrics
) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.drawImage(image, 0, 0, ctx.canvas.width, ctx.canvas.height);

  const w = ctx.canvas.width;
  const h = ctx.canvas.height;

  // Puntos clave
  const forehead = lm[10];
  const chin = lm[152];
  const nose = lm[1];
  const noseBridge = lm[168];
  const browL = lm[70], browR = lm[300];
  const mouthL = lm[61], mouthR = lm[291];
  const upperLip = lm[13];
  
  // === LÍNEA MEDIA FACIAL (Verde) ===
  const facialCenterX = ((forehead.x + noseBridge.x + nose.x + chin.x) / 4) * w;
  ctx.strokeStyle = "rgba(34,197,94,0.8)"; // green
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(facialCenterX, forehead.y * h);
  ctx.lineTo(facialCenterX, chin.y * h);
  ctx.stroke();
  ctx.setLineDash([]);

  // === LÍNEA MEDIA DENTAL (Naranja) ===
  const dentalCenterX = ((mouthL.x + mouthR.x) / 2) * w;
  ctx.strokeStyle = "rgba(249,115,22,0.8)"; // orange
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(dentalCenterX, (nose.y - 0.02) * h);
  ctx.lineTo(dentalCenterX, (upperLip.y + 0.05) * h);
  ctx.stroke();
  ctx.setLineDash([]);

  // === TERCIOS FACIALES (Líneas horizontales azules) ===
  const browY = ((browL.y + browR.y) / 2) * h;
  const noseBaseY = nose.y * h;
  
  ctx.strokeStyle = "rgba(59,130,246,0.6)"; // blue
  ctx.lineWidth = 1.5;
  
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

  // === PUNTOS CLAVE ===
  const keyPoints = [1, 10, 152, 168, 70, 300, 61, 291, 13, 14];
  ctx.fillStyle = "rgba(0,200,255,0.9)";
  keyPoints.forEach(i => {
    const p = lm[i];
    ctx.beginPath();
    ctx.arc(p.x * w, p.y * h, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  // === PANEL DE INFORMACIÓN ===
  const panelX = 10;
  const panelY = 10;
  const lineHeight = 20;
  
  // Fondo semi-transparente
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(panelX - 5, panelY - 5, 280, 170);
  
  // Textos
  ctx.font = "bold 13px system-ui";
  ctx.fillStyle = "white";
  
  let currentY = panelY + 12;
  
  // Título
  ctx.fillText("📊 ANÁLISIS FACIAL Y DENTAL", panelX, currentY);
  currentY += lineHeight + 5;
  
  // Línea media dental
  ctx.font = "12px system-ui";
  ctx.fillStyle = "rgba(249,115,22,1)";
  ctx.fillText(`● Línea media dental: ${m.midline.mm.toFixed(1)}mm ${m.midline.side}`, panelX, currentY);
  currentY += lineHeight;
  
  // Línea media facial
  ctx.fillStyle = "rgba(34,197,94,1)";
  ctx.fillText(`● Línea media facial: ${m.facialMidline.side}`, panelX, currentY);
  currentY += lineHeight;
  
  // Coincidencia
  const statusColor = m.midlineCoincidence.status === "coincidente" ? "rgba(34,197,94,1)" :
                      m.midlineCoincidence.status === "leve" ? "rgba(250,204,21,1)" :
                      m.midlineCoincidence.status === "moderada" ? "rgba(249,115,22,1)" :
                      "rgba(239,68,68,1)";
  ctx.fillStyle = statusColor;
  ctx.fillText(`● Coincidencia: ${m.midlineCoincidence.status} (${m.midlineCoincidence.deviation.toFixed(1)}mm)`, panelX, currentY);
  currentY += lineHeight + 5;
  
  // Proporciones faciales
  ctx.fillStyle = "rgba(59,130,246,1)";
  ctx.fillText(`● Tercios: ${m.facialProportions.upperThird.toFixed(0)}% | ${m.facialProportions.middleThird.toFixed(0)}% | ${m.facialProportions.lowerThird.toFixed(0)}%`, panelX, currentY);
  currentY += lineHeight;
  
  ctx.fillStyle = m.facialProportions.isBalanced ? "rgba(34,197,94,1)" : "rgba(250,204,21,1)";
  ctx.fillText(`  ${m.facialProportions.isBalanced ? "✓ Equilibradas" : "⚠ Desbalanceadas"}`, panelX, currentY);
  currentY += lineHeight + 5;
  
  // Arco y gingival
  ctx.fillStyle = "white";
  ctx.fillText(`Arco: ${m.smileArc} | Ging: ${m.gingival.mm.toFixed(1)}mm (${m.gingival.class})`, panelX, currentY);
}

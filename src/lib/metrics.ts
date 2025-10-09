export type DentalMetrics = {
  smileWidth: number; // mm
  centralIncisorWidth: number; // mm
  centralIncisorHeight: number; // mm
  lateralIncisorWidth: number; // mm
  interdentalProportions: number[]; // ratios
  incisorProportion: number; // width/height ratio
};

export type SmileMetrics = {
  smileArc: "consonante" | "plano" | "inverso";
  gingival: { mm: number; class: "ninguna" | "baja" | "media" | "excesiva" };
  midline: { mm: number; side: "izquierda" | "derecha" | "centrado" };
  buccalRatio: number; // 0..1
  dentalMetrics: DentalMetrics;
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
  const { restLm, smileLm } = params;
  
  // Indices MediaPipe Face Landmarker 468 pts
  const LEFT_EYE_OUT = 33, RIGHT_EYE_OUT = 263;
  const LEFT_EYE_IN = 133, RIGHT_EYE_IN = 362;
  const LEFT_EYE_TOP = 159, LEFT_EYE_BOT = 145;
  const MOUTH_LEFT = 61, MOUTH_RIGHT = 291;
  const UPPER_LIP = 13, LOWER_LIP = 14;
  const UPPER_LIP_TOP = 0, LOWER_LIP_BOT = 17; // Aproximados para gingival
  const NOSE_TIP = 1, NOSE_BRIDGE = 6;
  const CHIN = 152, FOREHEAD = 10;
  const LEFT_CHEEK = 234, RIGHT_CHEEK = 454;

  const smileEyeL = smileLm[LEFT_EYE_OUT], smileEyeR = smileLm[RIGHT_EYE_OUT];
  const smileEyeInL = smileLm[LEFT_EYE_IN], smileEyeInR = smileLm[RIGHT_EYE_IN];
  const smileMouthL = smileLm[MOUTH_LEFT], smileMouthR = smileLm[MOUTH_RIGHT];
  const smileUpper = smileLm[UPPER_LIP], smileLower = smileLm[LOWER_LIP];
  const smileNose = smileLm[NOSE_TIP], smileNoseBridge = smileLm[NOSE_BRIDGE];
  const smileChin = smileLm[CHIN], smileForehead = smileLm[FOREHEAD];
  
  const restUpper = restLm[UPPER_LIP];
  const smileUpperTop = smileLm[UPPER_LIP_TOP];

  const ipd = d(smileEyeL, smileEyeR) || 1e-6;

  // === ANÁLISIS DE SONRISA ===
  
  // Midline dental
  const centerX = (smileMouthL.x + smileMouthR.x) / 2;
  const dx = smileNose.x - centerX;
  const midlineMM = Math.abs(toMM(Math.abs(dx), ipd));
  const side = Math.abs(dx) < 0.003 ? "centrado" : (dx > 0 ? "derecha" : "izquierda");

  // Arco de sonrisa
  const yCorners = (smileMouthL.y + smileMouthR.y) / 2;
  const delta = (smileUpper.y - yCorners) / (1/ipd);
  let smileArc: SmileMetrics["smileArc"];
  if (delta > 0.5) smileArc = "consonante";
  else if (delta < -0.2) smileArc = "inverso";
  else smileArc = "plano";

  // Exposición gingival CORREGIDA: comparar labio superior en reposo vs sonrisa
  // Solo hay exposición si el borde de la encía es visible por encima de los dientes
  const restUpperY = restUpper.y;
  const smileUpperY = smileUpperTop.y;
  const lipMovement = restUpperY - smileUpperY; // Positivo = labio subió
  
  // Threshold más estricto: solo considerar exposición si hay movimiento significativo
  const gingMM = lipMovement > 0.015 ? toMM(lipMovement - 0.015, ipd) : 0;
  const gingClass = gingMM < 0.5 ? "ninguna" : gingMM < 2 ? "baja" : gingMM < 4 ? "media" : "excesiva";

  // Corredor bucal
  const mouthW = d(smileMouthL, smileMouthR);
  const faceW = d(smileEyeL, smileEyeR) * 2.8;
  const buccalRatio = Math.min(1, mouthW / faceW);

  // === ANÁLISIS DENTAL DETALLADO ===
  
  // Ancho de sonrisa
  const smileWidthMM = toMM(mouthW, ipd);
  
  // Estimación de anchos dentales (basado en proporciones faciales)
  // El incisivo central típicamente es ~10-12mm, usamos la distancia de boca como referencia
  const teethSegment = mouthW / 6; // Dividimos en 6 dientes visibles aprox
  const centralIncisorWidth = toMM(teethSegment * 1.1, ipd); // Central más ancho
  const lateralIncisorWidth = toMM(teethSegment * 0.85, ipd); // Lateral más estrecho
  
  // Altura del incisivo central (estimación desde borde incisal al borde gingival)
  const incisorHeight = toMM(d(smileUpper, smileLower) * 1.8, ipd);
  
  // Proporción ancho/alto del incisivo central (ideal ~0.8)
  const incisorProportion = Number((centralIncisorWidth / incisorHeight).toFixed(2));
  
  // Proporciones interdentales (golden proportion: 0.618)
  const interdentalProportions = [
    Number((lateralIncisorWidth / centralIncisorWidth).toFixed(2)), // Lateral/Central
    0.62, // Canino/Lateral (valor típico)
  ];

  const dentalMetrics: DentalMetrics = {
    smileWidth: Number(smileWidthMM.toFixed(1)),
    centralIncisorWidth: Number(centralIncisorWidth.toFixed(1)),
    centralIncisorHeight: Number(incisorHeight.toFixed(1)),
    lateralIncisorWidth: Number(lateralIncisorWidth.toFixed(1)),
    interdentalProportions,
    incisorProportion
  };

  return {
    smileArc,
    gingival: { mm: Number(gingMM.toFixed(1)), class: gingClass },
    midline: { mm: midlineMM, side },
    buccalRatio,
    dentalMetrics
  };
}

export function drawOverlay(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  lm: any[],
  m: SmileMetrics
) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(image, 0, 0, w, h);

  const toScreen = (p: any) => ({ x: p.x * w, y: p.y * h });

  // Puntos clave
  const nose = toScreen(lm[1]);
  const mouthL = toScreen(lm[61]);
  const mouthR = toScreen(lm[291]);
  const upperLip = toScreen(lm[13]);
  const lowerLip = toScreen(lm[14]);
  const forehead = toScreen(lm[10]);
  const eyeL = toScreen(lm[33]);
  const eyeR = toScreen(lm[263]);

  // === CUADRÍCULA FACIAL ===
  ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
  ctx.lineWidth = 1;
  
  // Líneas verticales
  const faceCenter = (eyeL.x + eyeR.x) / 2;
  const gridWidth = Math.abs(eyeR.x - eyeL.x) * 1.8;
  const cols = 5;
  for (let i = 0; i <= cols; i++) {
    const x = faceCenter - gridWidth / 2 + (gridWidth / cols) * i;
    ctx.beginPath();
    ctx.moveTo(x, forehead.y);
    ctx.lineTo(x, upperLip.y + 100);
    ctx.stroke();
  }
  
  // Líneas horizontales
  const rows = 4;
  const gridHeight = upperLip.y + 100 - forehead.y;
  for (let i = 0; i <= rows; i++) {
    const y = forehead.y + (gridHeight / rows) * i;
    ctx.beginPath();
    ctx.moveTo(faceCenter - gridWidth / 2, y);
    ctx.lineTo(faceCenter + gridWidth / 2, y);
    ctx.stroke();
  }

  // === LÍNEA MEDIA DENTAL ===
  ctx.strokeStyle = "rgba(255, 215, 0, 0.9)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(nose.x, nose.y);
  ctx.lineTo(nose.x, upperLip.y + 50);
  ctx.stroke();

  // === LÍNEA INTERCOMISURAL (SMILE WIDTH) ===
  ctx.strokeStyle = "rgba(0, 200, 255, 0.9)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(mouthL.x, mouthL.y);
  ctx.lineTo(mouthR.x, mouthR.y);
  ctx.stroke();
  
  // Puntos en comisuras
  ctx.fillStyle = "rgba(0, 200, 255, 0.9)";
  ctx.beginPath();
  ctx.arc(mouthL.x, mouthL.y, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(mouthR.x, mouthR.y, 5, 0, Math.PI * 2);
  ctx.fill();

  // === LÍNEA DE SONRISA (SMILE LINE/CURVE) ===
  ctx.strokeStyle = "rgba(255, 105, 180, 0.9)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  // Curva siguiendo el borde de los dientes superiores
  const smileY = upperLip.y + 10;
  ctx.moveTo(mouthL.x, mouthL.y);
  ctx.quadraticCurveTo(
    (mouthL.x + mouthR.x) / 2, 
    smileY - 15, 
    mouthR.x, 
    mouthR.y
  );
  ctx.stroke();

  // === SEGMENTACIÓN DENTAL (INTERDENTAL WIDTH) ===
  ctx.strokeStyle = "rgba(150, 255, 150, 0.7)";
  ctx.lineWidth = 2;
  const mouthWidth = Math.abs(mouthR.x - mouthL.x);
  const teethSegments = 6; // 6 dientes visibles frontalmente
  
  for (let i = 1; i < teethSegments; i++) {
    const x = mouthL.x + (mouthWidth / teethSegments) * i;
    ctx.beginPath();
    ctx.moveTo(x, upperLip.y);
    ctx.lineTo(x, upperLip.y + 35);
    ctx.stroke();
  }

  // === PLANO INCISAL ===
  ctx.strokeStyle = "rgba(255, 150, 150, 0.8)";
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  const incisorY = upperLip.y + 25;
  ctx.beginPath();
  ctx.moveTo(mouthL.x, incisorY);
  ctx.lineTo(mouthR.x, incisorY);
  ctx.stroke();
  ctx.setLineDash([]);

  // === PROPORCIÓN INCISIVO CENTRAL ===
  const centerX = (mouthL.x + mouthR.x) / 2;
  const incisorWidth = mouthWidth / 6;
  ctx.strokeStyle = "rgba(255, 255, 100, 0.9)";
  ctx.lineWidth = 3;
  ctx.strokeRect(
    centerX - incisorWidth / 2,
    upperLip.y + 5,
    incisorWidth,
    35
  );

  // === ETIQUETAS CON MÉTRICAS ===
  ctx.font = "bold 14px system-ui";
  
  const labels = [
    `Ancho de sonrisa: ${m.dentalMetrics.smileWidth} mm`,
    `Incisivo Central: ${m.dentalMetrics.centralIncisorWidth} × ${m.dentalMetrics.centralIncisorHeight} mm`,
    `Proporción IC: ${m.dentalMetrics.incisorProportion}`,
    `Arco: ${m.smileArc}`,
    `Línea media: ${m.midline.side} (${m.midline.mm.toFixed(1)} mm)`
  ];

  let yPos = 20;
  labels.forEach(text => {
    const metrics = ctx.measureText(text);
    ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    ctx.fillRect(10, yPos - 15, metrics.width + 15, 22);
    ctx.fillStyle = "white";
    ctx.fillText(text, 17, yPos);
    yPos += 28;
  });
}

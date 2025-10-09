export type FacialRatios = {
  faceHorizontal: { upper: number; middle: number; lower: number };
  faceVertical: number[]; // 5 sections
  faceAspect: number;
  eyeAspect: number;
  noseAspect: number;
  noseToMouth: number;
  noseLipChin: number;
  upperToLowerLip: number;
  eyeDistance: "narrow" | "balanced" | "wide";
  eyeWidth: "narrow" | "balanced" | "wide";
};

export type SmileMetrics = {
  smileArc: "consonante" | "plano" | "inverso";
  gingival: { mm: number; class: "ninguna" | "baja" | "media" | "excesiva" };
  midline: { mm: number; side: "izquierda" | "derecha" | "centrado" };
  buccalRatio: number; // 0..1
  facialRatios: FacialRatios;
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
  // La encía se expone cuando el labio superior SUBE al sonreír
  const restUpperY = restUpper.y;
  const smileUpperY = smileUpperTop.y;
  const lipMovement = restUpperY - smileUpperY; // Positivo = labio subió
  const gingMM = Math.max(0, toMM(Math.max(0, lipMovement - 0.008), ipd));
  const gingClass = gingMM < 0.5 ? "ninguna" : gingMM < 2 ? "baja" : gingMM < 4 ? "media" : "excesiva";

  // Corredor bucal
  const mouthW = d(smileMouthL, smileMouthR);
  const faceW = d(smileEyeL, smileEyeR) * 2.8;
  const buccalRatio = Math.min(1, mouthW / faceW);

  // === ANÁLISIS DE PROPORCIONES FACIALES ===
  
  // Face Horizontal (thirds): forehead-to-nose, nose-to-upperLip, upperLip-to-chin
  const faceHeight = d(smileForehead, smileChin);
  const upperThird = d(smileForehead, smileNoseBridge);
  const middleThird = d(smileNoseBridge, smileUpper);
  const lowerThird = d(smileUpper, smileChin);
  const totalThirds = upperThird + middleThird + lowerThird || 1;
  
  const faceHorizontal = {
    upper: Math.round((upperThird / totalThirds) * 100),
    middle: Math.round((middleThird / totalThirds) * 100),
    lower: Math.round((lowerThird / totalThirds) * 100)
  };

  // Face Vertical (5 sections) - aproximación
  const faceVertical = [15, 19, 27, 19, 20]; // Valores estándar de referencia
  
  // Face Aspect Ratio (width:height)
  const faceWidth = d(smileLm[LEFT_CHEEK], smileLm[RIGHT_CHEEK]);
  const faceAspect = Number((faceHeight / faceWidth).toFixed(2));
  
  // Eye measurements
  const eyeWidth = d(smileLm[LEFT_EYE_TOP], smileLm[LEFT_EYE_BOT]);
  const eyeDistInner = d(smileEyeInL, smileEyeInR);
  const eyeAspect = Number((eyeDistInner / eyeWidth).toFixed(3));
  
  const eyeDistanceRatio = eyeDistInner / ipd;
  const eyeDistance = eyeDistanceRatio < 0.9 ? "narrow" : eyeDistanceRatio > 1.1 ? "wide" : "balanced";
  const eyeWidth2 = eyeWidth / ipd;
  const eyeWidthClass = eyeWidth2 < 0.35 ? "narrow" : eyeWidth2 > 0.45 ? "wide" : "balanced";
  
  // Nose measurements
  const noseHeight = d(smileNoseBridge, smileNose);
  const noseWidth = d(smileLm[234], smileLm[454]) * 0.6; // Aproximación ancho nasal
  const noseAspect = Number((noseHeight / noseWidth).toFixed(3));
  
  // Nose to mouth width
  const mouthWidth = d(smileMouthL, smileMouthR);
  const noseToMouth = Number((noseWidth / mouthWidth).toFixed(3));
  
  // Nose-Lip-Chin ratio
  const noseLipDist = d(smileNose, smileUpper);
  const lipChinDist = d(smileUpper, smileChin);
  const noseLipChin = Number((lipChinDist / noseLipDist).toFixed(3));
  
  // Upper to Lower Lip
  const upperLipHeight = d(smileUpper, smileLm[0]);
  const lowerLipHeight = d(smileLower, smileLm[17]);
  const upperToLowerLip = Number((lowerLipHeight / upperLipHeight).toFixed(3));

  const facialRatios: FacialRatios = {
    faceHorizontal,
    faceVertical,
    faceAspect,
    eyeAspect,
    noseAspect,
    noseToMouth,
    noseLipChin,
    upperToLowerLip,
    eyeDistance,
    eyeWidth: eyeWidthClass
  };

  return {
    smileArc,
    gingival: { mm: gingMM, class: gingClass },
    midline: { mm: midlineMM, side },
    buccalRatio,
    facialRatios
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
  const eyeL = toScreen(lm[33]);
  const eyeR = toScreen(lm[263]);
  const eyeInL = toScreen(lm[133]);
  const eyeInR = toScreen(lm[362]);
  const nose = toScreen(lm[1]);
  const noseBridge = toScreen(lm[6]);
  const mouthL = toScreen(lm[61]);
  const mouthR = toScreen(lm[291]);
  const upperLip = toScreen(lm[13]);
  const lowerLip = toScreen(lm[14]);
  const chin = toScreen(lm[152]);
  const forehead = toScreen(lm[10]);
  const cheekL = toScreen(lm[234]);
  const cheekR = toScreen(lm[454]);

  // Estilo de líneas
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(255, 105, 180, 0.8)"; // Rosa
  ctx.fillStyle = "rgba(255, 105, 180, 0.8)";

  // === FACE HORIZONTAL THIRDS ===
  ctx.strokeRect(cheekL.x, forehead.y, cheekR.x - cheekL.x, noseBridge.y - forehead.y);
  ctx.strokeRect(cheekL.x, noseBridge.y, cheekR.x - cheekL.x, upperLip.y - noseBridge.y);
  ctx.strokeRect(cheekL.x, upperLip.y, cheekR.x - cheekL.x, chin.y - upperLip.y);

  // Líneas horizontales divisorias
  ctx.beginPath();
  ctx.moveTo(cheekL.x - 20, noseBridge.y);
  ctx.lineTo(cheekR.x + 20, noseBridge.y);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(cheekL.x - 20, upperLip.y);
  ctx.lineTo(cheekR.x + 20, upperLip.y);
  ctx.stroke();

  // === MIDLINE DENTAL ===
  ctx.strokeStyle = "rgba(255, 215, 0, 0.9)"; // Dorado
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(nose.x, nose.y);
  const centerMouthX = (mouthL.x + mouthR.x) / 2;
  ctx.lineTo(centerMouthX, upperLip.y);
  ctx.stroke();

  // === EYE MEASUREMENTS ===
  ctx.strokeStyle = "rgba(0, 200, 255, 0.8)"; // Cian
  ctx.lineWidth = 2;
  
  // Distancia entre ojos
  ctx.beginPath();
  ctx.moveTo(eyeInL.x, eyeInL.y);
  ctx.lineTo(eyeInR.x, eyeInR.y);
  ctx.stroke();
  
  // Ancho interpupilar
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(eyeL.x, eyeL.y);
  ctx.lineTo(eyeR.x, eyeR.y);
  ctx.stroke();
  ctx.setLineDash([]);

  // === NOSE MEASUREMENTS ===
  ctx.strokeStyle = "rgba(255, 150, 150, 0.8)";
  ctx.beginPath();
  ctx.moveTo(noseBridge.x, noseBridge.y);
  ctx.lineTo(nose.x, nose.y);
  ctx.stroke();

  // Ancho nasal aproximado
  const noseWidthL = toScreen(lm[234]);
  const noseWidthR = toScreen(lm[454]);
  ctx.beginPath();
  ctx.moveTo(noseWidthL.x, nose.y);
  ctx.lineTo(noseWidthR.x, nose.y);
  ctx.stroke();

  // === MOUTH MEASUREMENTS ===
  ctx.strokeStyle = "rgba(150, 255, 150, 0.8)"; // Verde claro
  
  // Ancho de boca
  ctx.beginPath();
  ctx.moveTo(mouthL.x, mouthL.y);
  ctx.lineTo(mouthR.x, mouthR.y);
  ctx.stroke();

  // Altura labios
  ctx.beginPath();
  ctx.moveTo(upperLip.x, upperLip.y);
  ctx.lineTo(lowerLip.x, lowerLip.y);
  ctx.stroke();

  // === PUNTOS DE REFERENCIA ===
  const keyPoints = [eyeL, eyeR, eyeInL, eyeInR, nose, noseBridge, mouthL, mouthR, upperLip, lowerLip, chin, forehead];
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  keyPoints.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  // === ETIQUETAS CON FONDO ===
  ctx.font = "bold 13px system-ui";
  const labels = [
    `Horizontal: ${m.facialRatios.faceHorizontal.upper}% : ${m.facialRatios.faceHorizontal.middle}% : ${m.facialRatios.faceHorizontal.lower}%`,
    `Aspecto Facial: 1 : ${m.facialRatios.faceAspect}`,
    `Aspecto Ojos: 1 : ${m.facialRatios.eyeAspect}`,
    `Nariz: 1 : ${m.facialRatios.noseAspect}`,
    `Golden Ratio: ${m.facialRatios.noseLipChin > 1.5 && m.facialRatios.noseLipChin < 1.7 ? '✓' : '○'} 1.618`
  ];

  let yPos = 20;
  labels.forEach(text => {
    const metrics = ctx.measureText(text);
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(5, yPos - 15, metrics.width + 10, 20);
    ctx.fillStyle = "white";
    ctx.fillText(text, 10, yPos);
    yPos += 25;
  });
}

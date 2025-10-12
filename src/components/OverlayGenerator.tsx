import { SmileMetrics } from "@/lib/metrics";

export function drawSimplifiedMidlineOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  m: SmileMetrics
) {
  ctx.fillStyle = "rgba(0,0,0,0.75)";
  ctx.fillRect(10, 10, 320, 140);
  
  ctx.font = "bold 16px system-ui";
  ctx.fillStyle = "white";
  ctx.fillText("📏 LÍNEAS MEDIAS", 20, 40);
  
  ctx.font = "13px system-ui";
  ctx.fillStyle = "rgba(34,197,94,1)";
  ctx.fillText(`Línea Media Facial: ${m.facialMidline?.side || 'centrado'}`, 20, 70);
  
  ctx.fillStyle = "rgba(249,115,22,1)";
  ctx.fillText(`Línea Media Dental: ${m.midline.side}`, 20, 95);
  ctx.fillText(`Desviación: ${m.midline.mm.toFixed(1)}mm`, 20, 115);
  
  const statusColor = m.midlineCoincidence?.status === "coincidente" ? "rgba(34,197,94,1)" :
                      m.midlineCoincidence?.status === "leve" ? "rgba(250,204,21,1)" : "rgba(239,68,68,1)";
  ctx.fillStyle = statusColor;
  ctx.fillText(`Estado: ${m.midlineCoincidence?.status || 'N/A'}`, 20, 140);
}

export function drawSimplifiedProportionsOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  m: SmileMetrics
) {
  ctx.fillStyle = "rgba(0,0,0,0.75)";
  ctx.fillRect(10, 10, 320, 160);
  
  ctx.font = "bold 16px system-ui";
  ctx.fillStyle = "white";
  ctx.fillText("📐 PROPORCIONES FACIALES", 20, 40);
  
  ctx.font = "13px system-ui";
  ctx.fillStyle = "rgba(59,130,246,1)";
  ctx.fillText(`Tercio Superior: ${m.facialProportions?.upperThird.toFixed(1)}%`, 20, 70);
  ctx.fillText(`Tercio Medio: ${m.facialProportions?.middleThird.toFixed(1)}%`, 20, 95);
  ctx.fillText(`Tercio Inferior: ${m.facialProportions?.lowerThird.toFixed(1)}%`, 20, 120);
  
  const balanceColor = m.facialProportions?.isBalanced ? "rgba(34,197,94,1)" : "rgba(250,204,21,1)";
  ctx.fillStyle = balanceColor;
  ctx.fillText(m.facialProportions?.isBalanced ? "✓ Equilibradas" : "⚠ Desbalanceadas", 20, 145);
}

export function drawSimplifiedSmileOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  m: SmileMetrics
) {
  ctx.fillStyle = "rgba(0,0,0,0.75)";
  ctx.fillRect(10, 10, 320, 180);
  
  ctx.font = "bold 16px system-ui";
  ctx.fillStyle = "white";
  ctx.fillText("😊 ANÁLISIS DE SONRISA", 20, 40);
  
  ctx.font = "13px system-ui";
  const arcColor = m.smileArc === 'consonante' ? "rgba(34,197,94,1)" : 
                   m.smileArc === 'plano' ? "rgba(250,204,21,1)" : "rgba(239,68,68,1)";
  ctx.fillStyle = arcColor;
  ctx.fillText(`Arco: ${m.smileArc}`, 20, 70);
  
  ctx.fillStyle = "white";
  ctx.fillText(`Ancho: ${m.smileWidth?.mm.toFixed(1)}mm (${m.smileWidth?.status})`, 20, 95);
  ctx.fillText(`Exposición gingival: ${m.gingival.mm.toFixed(1)}mm`, 20, 120);
  ctx.fillText(`Corredor bucal: ${Math.round(m.buccalRatio*100)}%`, 20, 145);
  ctx.fillText(`Simetría: ${m.symmetry?.horizontal.toFixed(0)}%`, 20, 170);
}

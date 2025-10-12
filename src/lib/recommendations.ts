import { SmileMetrics } from "./metrics";

export interface FaceAnalysis {
  faceShape: "ovalada" | "cuadrada" | "triangular" | "rectangular" | "redonda";
  gender: "masculino" | "femenino" | "neutro";
  verticalDimension: "adecuada" | "aumentada" | "disminuida";
  facialBalance: "equilibrado" | "tercio_superior_largo" | "tercio_inferior_corto";
}

export interface SmileRecommendation {
  teethShape: string;
  teethSize: string;
  smileWidth: string;
  gingivalDisplay: string;
  rationale: string;
}

export function analyzeFaceCharacteristics(metrics: SmileMetrics): FaceAnalysis {
  const { facialProportions } = metrics;
  
  // Determinar forma de cara basada en proporciones
  let faceShape: FaceAnalysis["faceShape"] = "ovalada";
  
  if (facialProportions.upperThird > 35 && facialProportions.lowerThird < 31) {
    faceShape = "triangular";
  } else if (facialProportions.upperThird < 31 && facialProportions.lowerThird > 35) {
    faceShape = "cuadrada";
  } else if (facialProportions.isBalanced) {
    faceShape = "ovalada";
  } else if (Math.abs(facialProportions.upperThird - facialProportions.lowerThird) < 3) {
    faceShape = "redonda";
  } else {
    faceShape = "rectangular";
  }

  // Determinar dimensión vertical
  let verticalDimension: FaceAnalysis["verticalDimension"] = "adecuada";
  if (facialProportions.lowerThird < 31) {
    verticalDimension = "disminuida";
  } else if (facialProportions.lowerThird > 35) {
    verticalDimension = "aumentada";
  }

  // Determinar balance facial
  let facialBalance: FaceAnalysis["facialBalance"] = "equilibrado";
  if (facialProportions.upperThird > 36) {
    facialBalance = "tercio_superior_largo";
  } else if (facialProportions.lowerThird < 31) {
    facialBalance = "tercio_inferior_corto";
  }

  return {
    faceShape,
    gender: "neutro", // Se podría mejorar con análisis más avanzado
    verticalDimension,
    facialBalance,
  };
}

export function generateSmileRecommendations(
  faceAnalysis: FaceAnalysis,
  metrics: SmileMetrics
): SmileRecommendation {
  let teethShape = "";
  let teethSize = "";
  let smileWidth = "";
  let gingivalDisplay = "";
  let rationale = "";

  // Recomendaciones basadas en forma de cara
  switch (faceAnalysis.faceShape) {
    case "ovalada":
      teethShape = "Forma redondeada con ángulos suaves";
      teethSize = "Proporción estándar (ancho:largo 0.8:1)";
      smileWidth = "Sonrisa amplia que siga la curva de los labios";
      rationale = "La cara ovalada es considerada la forma ideal. Permite flexibilidad en el diseño, priorizando naturalidad y armonía.";
      break;
    
    case "cuadrada":
      teethShape = "Forma cuadrada con ángulos marcados en incisivos";
      teethSize = "Dientes ligeramente más anchos (ancho:largo 0.85:1)";
      smileWidth = "Sonrisa amplia con corredores bucales moderados";
      rationale = "Para rostros cuadrados, los dientes con ángulos más definidos complementan la estructura angular de la mandíbula, creando coherencia estética.";
      break;
    
    case "triangular":
      teethShape = "Forma ovalada con bordes redondeados";
      teethSize = "Dientes de tamaño medio a grande";
      smileWidth = "Sonrisa amplia para equilibrar la frente más ancha";
      rationale = "En rostros triangulares con frente amplia y mentón estrecho, una sonrisa amplia con dientes redondeados ayuda a balancear las proporciones.";
      break;
    
    case "rectangular":
      teethShape = "Forma cuadrada alargada";
      teethSize = "Proporción alargada (ancho:largo 0.75:1)";
      smileWidth = "Sonrisa de ancho moderado";
      rationale = "Los rostros rectangulares se benefician de dientes proporcionalmente alargados que sigan la verticalidad natural del rostro.";
      break;
    
    case "redonda":
      teethShape = "Forma rectangular con ángulos suaves";
      teethSize = "Dientes ligeramente alargados (ancho:largo 0.75:1)";
      smileWidth = "Sonrisa de ancho medio con exposición dental vertical";
      rationale = "Para rostros redondos, dientes con forma más rectangular ayudan a crear líneas verticales que estilizan el rostro.";
      break;
  }

  // Ajustes basados en dimensión vertical
  if (faceAnalysis.verticalDimension === "disminuida") {
    teethSize += " - IMPORTANTE: Considerar aumentar longitud de coronas para recuperar dimensión vertical perdida";
    gingivalDisplay = "Mínima exposición gingival (0-2mm). Evitar diseños que acorten visualmente los dientes.";
    rationale += " Se detectó disminución del tercio inferior facial, por lo que es crucial recuperar altura con coronas de longitud adecuada.";
  } else if (faceAnalysis.verticalDimension === "aumentada") {
    gingivalDisplay = "Exposición gingival controlada (2-4mm) para no aumentar más el tercio inferior.";
    rationale += " El tercio inferior está aumentado, por lo que debe evitarse exposición gingival excesiva.";
  } else {
    gingivalDisplay = "Exposición gingival ideal de 2-3mm al sonreír (sonrisa media).";
  }

  // Ajustes basados en línea media
  if (Math.abs(metrics.midline.mm) > 2) {
    rationale += ` Se detectó desviación de línea media dental de ${metrics.midline.mm.toFixed(1)}mm. Se recomienda corrección ortodóncica o resolutiva antes del diseño protésico final.`;
  }

  // Ajustes basados en arco de sonrisa
  if (metrics.smileArc === "inverso" || metrics.smileArc === "plano") {
    rationale += " El arco de sonrisa debe ser consonante (paralelo al labio inferior) para lograr estética óptima.";
  }

  return {
    teethShape,
    teethSize,
    smileWidth,
    gingivalDisplay,
    rationale,
  };
}

export function generateAnalysisText(
  faceAnalysis: FaceAnalysis,
  metrics: SmileMetrics,
  recommendations: SmileRecommendation
): string {
  const faceShapeText = {
    ovalada: "ovalada (ideal)",
    cuadrada: "cuadrada",
    triangular: "triangular",
    rectangular: "rectangular",
    redonda: "redonda"
  }[faceAnalysis.faceShape];

  const verticalText = {
    adecuada: "adecuada",
    aumentada: "aumentada",
    disminuida: "disminuida (requiere atención)"
  }[faceAnalysis.verticalDimension];

  return `ANÁLISIS FACIAL Y RECOMENDACIONES DE DISEÑO DE SONRISA

📊 PROPORCIONES FACIALES
• Tercio Superior: ${metrics.facialProportions.upperThird.toFixed(1)}%
• Tercio Medio: ${metrics.facialProportions.middleThird.toFixed(1)}%
• Tercio Inferior: ${metrics.facialProportions.lowerThird.toFixed(1)}%
• Balance: ${metrics.facialProportions.isBalanced ? "✓ Equilibrado" : "⚠ Desequilibrado"}

📐 CARACTERÍSTICAS FACIALES
• Forma de cara: ${faceShapeText}
• Dimensión vertical: ${verticalText}

😊 ANÁLISIS DE SONRISA ACTUAL
• Arco de sonrisa: ${metrics.smileArc}
• Exposición gingival: ${metrics.gingival.mm.toFixed(1)}mm (${metrics.gingival.class})
• Desviación línea media dental: ${metrics.midline.mm.toFixed(1)}mm hacia ${metrics.midline.side}
• Corredor bucal: ${(metrics.buccalRatio * 100).toFixed(0)}%

💡 RECOMENDACIONES PARA DISEÑO DE SONRISA

Forma de Dientes Sugerida:
${recommendations.teethShape}

Tamaño y Proporciones:
${recommendations.teethSize}

Ancho de Sonrisa:
${recommendations.smileWidth}

Exposición Gingival:
${recommendations.gingivalDisplay}

🎯 FUNDAMENTO CLÍNICO:
${recommendations.rationale}

---
NOTA IMPORTANTE: Este análisis es una herramienta de apoyo para la toma de decisiones clínicas. El diseño final debe ser realizado por un profesional dental considerando factores adicionales como oclusión, función masticatoria, expectativas del paciente y viabilidad técnica.`;
}
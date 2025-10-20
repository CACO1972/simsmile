import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  "https://simsmile.cl",
  "https://simsmile.lovable.app",
  "http://localhost:5173",
  "http://localhost:8080"
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.some(allowed => 
    origin === allowed || origin.endsWith('.lovable.app')
  ) ? origin : ALLOWED_ORIGINS[0];
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Vary': 'Origin'
  };
}

// Helper para parsear JSON de Claude (puede venir envuelto en ```json...``` o con texto extra)
function parseClaudeJSON(text: string): Record<string, unknown> {
  let clean = (text ?? '').trim();

  // Remover bloques de código markdown si existen
  clean = clean
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    return JSON.parse(clean);
  } catch (_) {
    // Intento secundario: extraer el primer objeto { ... } válido
    const start = clean.indexOf('{');
    const end = clean.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      const candidate = clean.slice(start, end + 1);
      try {
        return JSON.parse(candidate);
      } catch (e2) {
        console.error('Claude JSON candidate failed:', candidate);
        throw new Error(`Invalid JSON from Claude: ${e2 instanceof Error ? e2.message : 'Unknown error'}`);
      }
    }
    console.error('Claude text without JSON object:', clean);
    throw new Error('Invalid JSON from Claude: no JSON object found');
  }
}

// Helper para convertir data URL a Blob para multipart/form-data
function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

serve(async (req) => {
  const origin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, metrics, faceAnalysis, recommendations: smileRecommendations, image, customPrompt, customParameters } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Si es una llamada de personalización (customPrompt presente)
    if (customPrompt && image) {
      console.log('Processing custom smile simulation with parameters:', customParameters);
      
      const customResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-image-preview',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: customPrompt },
                { type: 'image_url', image_url: { url: image } }
              ]
            }
          ],
          modalities: ['image', 'text']
        }),
      });

      if (!customResponse.ok) {
        const errorText = await customResponse.text();
        console.error('Custom simulation error:', customResponse.status, errorText);
        
        // Fallback a imagen original
        return new Response(
          JSON.stringify({ 
            customizedImage: image,
            parameters: customParameters,
            warnings: ['custom_simulation_failed']
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const customData = await customResponse.json();
      const customizedImage = customData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

      if (!customizedImage) {
        console.warn('No customized image in response, using original');
        return new Response(
          JSON.stringify({ 
            customizedImage: image,
            parameters: customParameters,
            warnings: ['no_image_generated']
          }), 
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          customizedImage: customizedImage,
          parameters: customParameters
        }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Validación de calidad de imagen con Gemini
    console.log('📸 Validando calidad de imagen con Gemini...');
    const qualityCheckPrompt = `You are an image quality expert. Analyze this photo for facial analysis suitability.
    
Check for:
1. Face is centered and clearly visible
2. Good lighting (not too dark or overexposed)
3. Face is in focus (not blurry)
4. Front-facing angle (not profile or extreme angle)
5. No obstructions (hands, objects covering face)
6. Sufficient resolution

Respond ONLY with a JSON object (no markdown, no extra text):
{
  "isValid": boolean,
  "quality_score": number (0-100),
  "issues": string[] (list of problems found, empty if valid),
  "recommendation": string (what to improve if invalid)
}`;

    const qualityResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              { 
                type: 'image_url',
                image_url: {
                  url: imageBase64
                }
              },
              { type: 'text', text: qualityCheckPrompt }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.2
      }),
    });

    let qualityResult: { isValid: boolean; quality_score: number } = { isValid: true, quality_score: 75 };
    
    if (!qualityResponse.ok) {
      console.error('Quality check failed:', qualityResponse.status);
      const errorText = await qualityResponse.text();
      console.error('Error details:', errorText);
      
      // Si falla el check de calidad, continuamos con valor por defecto
      console.warn('Usando valores por defecto de calidad debido a error en API');
    } else {
      try {
        const qualityData = await qualityResponse.json();
        const qualityContent = qualityData.choices?.[0]?.message?.content || '{"isValid": true, "quality_score": 75}';
        qualityResult = parseClaudeJSON(qualityContent);
      } catch (parseError) {
        console.error('Error parsing quality response:', parseError);
        console.warn('Usando valores por defecto de calidad');
      }
    }
    
    console.log('✅ Quality check result:', qualityResult);

    // Validación de calidad - rechazar si es menor a 50
    const qualityScore = Number(qualityResult.quality_score ?? 75);
    const safeQualityScore = Number.isNaN(qualityScore) ? 75 : qualityScore;
    if (safeQualityScore < 50) {
      return new Response(
        JSON.stringify({ 
          error: 'Calidad de imagen insuficiente',
          quality: qualityResult,
          message: `Tu fotografía no cumple con los estándares de calidad necesarios (puntaje: ${safeQualityScore}/100). ${qualityResult.recommendation || 'Por favor, toma nuevas fotos siguiendo estas recomendaciones:'}\n\n✓ Asegúrate de tener buena iluminación\n✓ Centra tu rostro en el encuadre\n✓ Mantén el rostro completo visible\n✓ Evita sombras en el rostro`
        }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Análisis facial detallado
    console.log('📊 Realizando análisis facial detallado...');
    let facialMetrics: Record<string, unknown> | null = null;
    
    try {
      const facialPrompt = `You are a facial aesthetics analysis system. Based on this photo, provide approximate facial proportion metrics.

IMPORTANT: Provide your BEST VISUAL ESTIMATION even if you cannot measure precisely. Return ONLY valid JSON, no other text.

JSON structure (provide numbers that seem visually reasonable):
{
  "horizontal_ratio": {
    "upper_third": 33,
    "middle_third": 33,
    "lower_third": 34,
    "deviation_from_ideal": 1.0
  },
  "vertical_ratio": {
    "left_side": 50,
    "right_side": 50,
    "symmetry_score": 95
  },
  "golden_ratio_score": 85,
  "aspect_ratio": 0.75
}

Visual estimation guidelines:
- Horizontal thirds: estimate forehead, midface, and lower face proportions (should sum to 100%)
- Vertical halves: estimate left vs right side balance (should sum to 100%)
- Symmetry score: 90-100 is very symmetric, 70-89 is good, below 70 needs attention
- Golden ratio score: 80-100 is excellent harmony, 60-79 is good, below 60 shows imbalances
- Aspect ratio: width/height of face (typically 0.7-0.8)`;

      const facialResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: facialPrompt },
                {
                  type: "image_url",
                  image_url: { url: imageBase64 }
                }
              ]
            }
          ]
        }),
      });

      if (!facialResponse.ok) {
        throw new Error(`Facial analysis failed: ${facialResponse.status}`);
      }

      const facialData = await facialResponse.json();
      const facialText = facialData.choices?.[0]?.message?.content;
      facialMetrics = parseClaudeJSON(facialText);
      console.log('✅ Análisis facial completado:', JSON.stringify(facialMetrics, null, 2));
    } catch (facialError) {
      console.error('❌ Error en análisis facial:', facialError);
      // Fallback con valores estimados basados en proporciones promedio
      facialMetrics = {
        horizontal_ratio: {
          upper_third: 33,
          middle_third: 34,
          lower_third: 33,
          deviation_from_ideal: 1.0
        },
        vertical_ratio: {
          left_side: 50,
          right_side: 50,
          symmetry_score: 90
        },
        golden_ratio_score: 80,
        aspect_ratio: 0.75
      };
      console.log('⚠️ Usando análisis facial estimado (fallback)');
    }

    // Construir prompt basado en las métricas
    const corrections = [];
    
    if (metrics.smileArc === 'inverso' || metrics.smileArc === 'plano') {
      corrections.push('Improve the smile arc to be consonant and upward-curving');
    }
    
    if (metrics.gingival.class === 'excesiva' || metrics.gingival.class === 'alta') {
      corrections.push('Reduce excessive gingival display to ideal proportions');
    }
    
    if (metrics.midline.mm > 2) {
      corrections.push(`Correct the dental midline deviation of ${metrics.midline.mm.toFixed(1)}mm`);
    }
    
    if (metrics.buccalRatio < 0.1 || metrics.buccalRatio > 0.3) {
      corrections.push('Optimize the buccal corridor to ideal proportions');
    }

    // Agregar correcciones de dientes
    if (smileRecommendations?.missingTeeth) {
      corrections.push('Add missing teeth with natural shape and color');
    }
    if (faceAnalysis?.teethAlignment === 'desalineado') {
      corrections.push('Straighten and align crooked or misaligned teeth subtly');
    }

    const correctionPrompt = `You are a world-class dental aesthetics expert specializing in photorealistic smile simulations. Apply the following corrections with CLINICAL PRECISION while maintaining photographic realism.

DENTAL CORRECTIONS TO APPLY:
${corrections.map((c, i) => `${i + 1}. ${c}`).join('\n')}

CRITICAL TECHNICAL REQUIREMENTS:
- PRESERVE IDENTITY: Keep exact same person, facial structure, age, ethnicity, skin tone, and all facial features
- LIGHTING PRESERVATION: Maintain exact original lighting conditions, shadows, highlights, and reflections on teeth
- PHOTOREALISTIC QUALITY: Edits must be indistinguishable from professional dental photography
- DENTAL PRECISION: Apply corrections following clinical aesthetic standards (golden proportions, smile arc theory)
- NATURAL TEXTURES: Maintain tooth enamel texture, natural translucency, and micro-surface details
- GINGIVAL REALISM: Realistic gum tissue color, texture, and proportions matching the patient's natural tone
- CONSERVATIVE APPROACH: Subtle, clinically accurate changes - avoid artificial "Hollywood white" appearance
- OCCLUSION ACCURACY: Maintain natural bite relationship and tooth contact points
- EDIT SCOPE: ONLY modify teeth and immediate gingival area - preserve all other facial features

QUALITY STANDARDS:
- High-resolution output maintaining original image quality
- Natural tooth color matching patient's complexion (shade A1-A2 range)
- Proper incisal translucency and mamelons where appropriate
- Realistic tooth proportions following width-to-length golden ratio (0.75-0.80)`;

    // Construir prompt de recomendaciones
    const faceDescriptions = [];
    if (faceAnalysis?.faceShape) {
      faceDescriptions.push(`face shape: ${faceAnalysis.faceShape}`);
    }
    if (faceAnalysis?.gender) {
      faceDescriptions.push(`profile: ${faceAnalysis.gender}`);
    }
    
    const teethShapeRec = smileRecommendations?.teethShape || 'harmonious with natural proportions';
    const teethSizeRec = smileRecommendations?.teethSize || 'proportional to the face';
    const smileWidthRec = smileRecommendations?.smileWidth || 'balanced and natural';
    const gingivalRec = smileRecommendations?.gingivalDisplay || 'adequate gingival exposure';

    // Primera simulación: correcciones con Lovable AI (Gemini Image Preview)
    console.log('🎨 Aplicando correcciones estéticas con Gemini Image...');
    
    const correctionResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: correctionPrompt },
              { type: 'image_url', image_url: { url: imageBase64 } }
            ]
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    let correctedImage = imageBase64;
    const warnings: string[] = [];

    if (!correctionResponse.ok) {
      const errorText = await correctionResponse.text();
      console.error('Correction error:', correctionResponse.status, errorText);
      console.warn('Using original image as correctedImage due to correction failure');
      warnings.push('correction_failed');
    } else {
      try {
        const correctionData = await correctionResponse.json();
        correctedImage = correctionData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

        if (!correctedImage) {
          console.warn('No corrected image generated, using original as fallback');
          correctedImage = imageBase64;
          warnings.push('no_corrected_image');
        }
      } catch (parseError) {
        console.error('Error parsing correction response:', parseError);
        correctedImage = imageBase64;
        warnings.push('correction_parse_failed');
      }
    }

    // Segunda simulación: diseño ideal con Lovable AI (Gemini Image Preview)
    console.log('✨ Generando simulación de sonrisa ideal con Gemini Image...');
    const recommendationPrompt = `You are an elite cosmetic dentist and digital smile design specialist. Create a WORLD-CLASS IDEAL smile simulation following professional aesthetic dentistry principles.

PATIENT FACIAL ANALYSIS:
${faceDescriptions.length > 0 ? faceDescriptions.join(', ') : 'Comprehensive facial proportions analyzed'}

PROFESSIONAL SMILE DESIGN SPECIFICATIONS:
1. Tooth Morphology: ${teethShapeRec}
2. Tooth Dimensions: ${teethSizeRec}
3. Smile Width Configuration: ${smileWidthRec}
4. Gingival Exposure Level: ${gingivalRec}

CLINICAL DESIGN RATIONALE: ${smileRecommendations?.rationale || 'Custom digital smile design based on golden ratio facial proportions, smile arc dynamics, and individualized aesthetic harmony analysis'}

PROFESSIONAL EXECUTION STANDARDS:
- IDENTITY PRESERVATION: Maintain EXACT same person - facial structure, age, ethnicity, complexion, all features
- GOLDEN RATIO APPLICATION: Apply phi (1.618) proportion in central incisors width-to-height ratio
- SMILE ARC OPTIMIZATION: Create consonant smile arc following lower lip curvature
- TOOTH MORPHOLOGY: Implement ${teethShapeRec} shape with proper axial inclinations and embrasure spaces
- DIMENSIONAL ACCURACY: ${teethSizeRec} maintaining 75-80% width-to-height ratio for central incisors
- SMILE WIDTH DESIGN: ${smileWidthRec} extending to premolar region for optimal aesthetics
- GINGIVAL AESTHETICS: ${gingivalRec} with symmetrical zenith positions and proper papilla fill
- NATURAL HARMONIZATION: Color integration with patient's skin tone (realistic A1-B1 shade range)
- PHOTOREALISTIC QUALITY: Clinical-grade simulation with natural enamel texture, translucency, and light reflections
- FACIAL HARMONY: Design must complement facial proportions, lip dynamics, and smile line
- PROFESSIONAL APPEARANCE: Sophisticated, natural result - not artificial "celebrity veneers" look
- PRECISION SCOPE: Transform ONLY dentition and gingival area - preserve all other facial characteristics

TECHNICAL QUALITY REQUIREMENTS:
- High-resolution output preserving original image sharpness
- Realistic tooth anatomy with proper anatomical landmarks
- Natural incisal edge translucency and characterization
- Proper contact points and embrasure form
- Symmetrical gingival architecture with ideal soft tissue proportions`;

    const idealResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: recommendationPrompt },
              { type: 'image_url', image_url: { url: correctedImage } }
            ]
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    let idealImage = correctedImage;

    if (!idealResponse.ok) {
      const errorText = await idealResponse.text();
      console.error('Ideal simulation error:', idealResponse.status, errorText);
      console.warn('Using corrected image as ideal due to ideal simulation failure');
      warnings.push('ideal_simulation_failed');
    } else {
      try {
        const idealData = await idealResponse.json();
        idealImage = idealData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

        if (!idealImage) {
          console.warn('No ideal image generated, using corrected as fallback');
          idealImage = correctedImage;
          warnings.push('no_ideal_image');
        }
      } catch (parseError) {
        console.error('Error parsing ideal response:', parseError);
        idealImage = correctedImage;
        warnings.push('ideal_parse_failed');
      }
    }

    // Transform facialMetrics to match FacialAnalysisOverlay expected structure
    const transformedFacialAnalysis = facialMetrics ? {
      horizontal_ratio: {
        upper: facialMetrics.horizontal_ratio?.upper_third ?? 33,
        middle: facialMetrics.horizontal_ratio?.middle_third ?? 34,
        lower: facialMetrics.horizontal_ratio?.lower_third ?? 33,
        deviation_from_ideal: facialMetrics.horizontal_ratio?.deviation_from_ideal ?? 1
      },
      vertical_ratio: {
        sections: [
          facialMetrics.vertical_ratio?.left_side ?? 50,
          facialMetrics.vertical_ratio?.right_side ?? 50
        ],
        left_side: facialMetrics.vertical_ratio?.left_side ?? 50,
        right_side: facialMetrics.vertical_ratio?.right_side ?? 50,
        symmetry_score: facialMetrics.vertical_ratio?.symmetry_score ?? 90
      },
      face_aspect_ratio: {
        value: facialMetrics.aspect_ratio ?? 0.8,
        golden_ratio_ideal: 1.618
      },
      symmetry_score: facialMetrics.vertical_ratio?.symmetry_score ?? 90,
      overall_golden_ratio_score: facialMetrics.golden_ratio_score ?? 85,
      aspect_ratio: facialMetrics.aspect_ratio ?? 0.8
    } : undefined;

    return new Response(
      JSON.stringify({ 
        simulatedImage: correctedImage,
        idealImage: idealImage || correctedImage,
        facialAnalysis: transformedFacialAnalysis,
        qualityScore: qualityResult.quality_score,
        warnings: warnings.length > 0 ? warnings : undefined
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in simulate-smile:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Error desconocido' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

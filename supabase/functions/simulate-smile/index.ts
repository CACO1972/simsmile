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
function parseClaudeJSON(text: string): any {
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
      console.log('Processing custom smile simulation with Lovable AI (Gemini):', customParameters);
      
      try {
        const customImagePrompt = `Transform this smile: ${customPrompt}. Maintain the person's identity, facial features, skin tone, and overall appearance. Only modify the smile and teeth as requested while keeping natural photorealistic quality and original lighting.`;
        
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
                  {
                    type: 'text',
                    text: customImagePrompt
                  },
                  {
                    type: 'image_url',
                    image_url: {
                      url: image
                    }
                  }
                ]
              }
            ],
            modalities: ['image', 'text']
          })
        });

        if (!customResponse.ok) {
          throw new Error(`Lovable AI error: ${customResponse.status}`);
        }

        const customData = await customResponse.json();
        const customizedImage = customData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        
        if (customizedImage) {
          return new Response(
            JSON.stringify({ 
              customizedImage: customizedImage,
              parameters: customParameters
            }), 
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          console.warn('No customized image in Lovable AI response, using original');
          return new Response(
            JSON.stringify({ 
              customizedImage: image,
              parameters: customParameters,
              warnings: ['no_image_generated']
            }), 
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (customError) {
        console.error('Custom Lovable AI simulation error:', customError);
        
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

    let qualityResult: any = { isValid: true, quality_score: 75 };
    
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

    // 2. Análisis facial detallado según formato Perfect Corp
    console.log('📊 Realizando análisis facial detallado...');
    let facialMetrics: any = null;
    
    try {
      const facialPrompt = `You are a professional facial aesthetics analysis system similar to Perfect Corp. Analyze this face and provide precise measurements.

IMPORTANT: Return ONLY valid JSON, no other text.

JSON structure (provide accurate visual estimations):
{
  "horizontal_ratio": {
    "upper": 32,
    "middle": 33,
    "lower": 35
  },
  "vertical_ratio": {
    "sections": [17, 19, 29, 19, 16]
  },
  "eye_distance": {
    "category": "wide"
  },
  "eye_width": {
    "category": "balanced"
  },
  "nose_aspect_ratio": {
    "ratio": 1.256,
    "category": "wide"
  },
  "nose_to_mouth_ratio": {
    "ratio": 1.32
  },
  "nose_to_chin_ratio": {
    "ratio": 2.63,
    "lower_face_category": "long"
  },
  "lip_ratio": {
    "ratio": 1.521,
    "category": "balanced"
  }
}

Guidelines:
- horizontal_ratio: % for upper (hairline to brows), middle (brows to nose), lower (nose to chin) facial thirds - must sum to 100
- vertical_ratio.sections: 5 values in % representing facial fifths from left to right - must sum to 100
- eye_distance.category: "narrow" if eyes are close, "wide" if far apart, "balanced" if ideal
- eye_width.category: "narrow" for small eyes, "wide" for large eyes, "balanced" for proportionate
- nose_aspect_ratio: width to height ratio of nose (typically 1.0-1.5), category: "wide" if >1.3, "narrow" if <1.1, "balanced" between
- nose_to_mouth_ratio: ratio of nose width to mouth width (typically 1.0-1.5)
- nose_to_chin_ratio: distance from nose base to upper lip vs upper lip to chin (typically 1.5-3.0), lower_face_category: "short" if <2.0, "long" if >2.5, "balanced" between
- lip_ratio: upper lip height to lower lip height ratio (typically 1.3-1.6), category: "full_upper" if <1.3, "full_lower" if >1.6, "balanced" between`;

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
          upper: 32,
          middle: 33,
          lower: 35
        },
        vertical_ratio: {
          sections: [17, 19, 29, 19, 16]
        },
        eye_distance: {
          category: "balanced"
        },
        eye_width: {
          category: "balanced"
        },
        nose_aspect_ratio: {
          ratio: 1.25,
          category: "balanced"
        },
        nose_to_mouth_ratio: {
          ratio: 1.32
        },
        nose_to_chin_ratio: {
          ratio: 2.5,
          lower_face_category: "balanced"
        },
        lip_ratio: {
          ratio: 1.5,
          category: "balanced"
        }
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

    // Primera simulación: correcciones con Lovable AI (Gemini)
    console.log('🎨 Aplicando correcciones estéticas con Lovable AI (Gemini)...');
    
    let correctedImage = imageBase64;
    const warnings: string[] = [];

    try {
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
                {
                  type: 'text',
                  text: correctionPrompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageBase64
                  }
                }
              ]
            }
          ],
          modalities: ['image', 'text']
        })
      });

      if (!correctionResponse.ok) {
        throw new Error(`Lovable AI error: ${correctionResponse.status}`);
      }

      const correctionData = await correctionResponse.json();
      const generatedImage = correctionData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      
      if (generatedImage) {
        correctedImage = generatedImage;
        console.log('✅ Corrected image generated with Lovable AI (Gemini)');
      } else {
        console.warn('No corrected image generated, using original as fallback');
        warnings.push('no_corrected_image');
      }
    } catch (correctionError) {
      console.error('Lovable AI correction error:', correctionError);
      console.warn('Using original image as correctedImage due to correction failure');
      warnings.push('correction_failed');
    }

    // Segunda simulación: diseño ideal con Lovable AI (Gemini)
    console.log('✨ Generando simulación de sonrisa ideal con Lovable AI (Gemini)...');
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

    let idealImage = correctedImage;

    try {
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
                {
                  type: 'text',
                  text: recommendationPrompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: correctedImage
                  }
                }
              ]
            }
          ],
          modalities: ['image', 'text']
        })
      });

      if (!idealResponse.ok) {
        throw new Error(`Lovable AI error: ${idealResponse.status}`);
      }

      const idealData = await idealResponse.json();
      const generatedIdeal = idealData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      
      if (generatedIdeal) {
        idealImage = generatedIdeal;
        console.log('✅ Ideal image generated with Lovable AI (Gemini)');
      } else {
        console.warn('No ideal image generated, using corrected as fallback');
        warnings.push('no_ideal_image');
      }
    } catch (idealError) {
      console.error('Lovable AI ideal simulation error:', idealError);
      console.warn('Using corrected image as ideal due to ideal simulation failure');
      warnings.push('ideal_simulation_failed');
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

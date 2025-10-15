import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, metrics, faceAnalysis, recommendations: smileRecommendations, image, customPrompt, customParameters } = await req.json();
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    // Si es una llamada de personalización (customPrompt presente)
    if (customPrompt && image) {
      console.log('Processing custom smile simulation with parameters:', customParameters);
      
      const customResponse = await fetch('https://api.openai.com/v1/images/edits', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-image-1',
          prompt: customPrompt,
          image: image,
          size: 'auto',
          quality: 'high',
          output_format: 'png'
        }),
      });

      if (!customResponse.ok) {
        const errorText = await customResponse.text();
        console.error('Custom simulation error:', errorText);
        throw new Error(`Custom simulation failed: ${customResponse.status} ${errorText}`);
      }

      const customData = await customResponse.json();
      const customizedImage = customData.data?.[0]?.b64_json ? 
        `data:image/png;base64,${customData.data[0].b64_json}` : 
        customData.data?.[0]?.url;

      if (!customizedImage) {
        throw new Error('No customized image received from AI');
      }

      return new Response(
        JSON.stringify({ 
          customizedImage: customizedImage,
          parameters: customParameters
        }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Validación de calidad de imagen con Claude Opus 4
    console.log('📸 Validando calidad de imagen con Claude Opus 4...');
    const qualityCheckPrompt = `You are an image quality expert. Analyze this photo for facial analysis suitability.
    
Check for:
1. Face is centered and clearly visible
2. Good lighting (not too dark or overexposed)
3. Face is in focus (not blurry)
4. Front-facing angle (not profile or extreme angle)
5. No obstructions (hands, objects covering face)
6. Sufficient resolution

Respond with a JSON object:
{
  "isValid": boolean,
  "quality_score": number (0-100),
  "issues": string[] (list of problems found, empty if valid),
  "recommendation": string (what to improve if invalid)
}`;

    const qualityResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-1-20250805',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              { 
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: imageBase64.startsWith('data:image/png') ? 'image/png' : 
                              imageBase64.startsWith('data:image/jpeg') ? 'image/jpeg' : 'image/webp',
                  data: imageBase64.split(',')[1]
                }
              },
              { type: 'text', text: qualityCheckPrompt }
            ]
          }
        ],
      }),
    });

    if (!qualityResponse.ok) {
      console.error('Quality check failed:', qualityResponse.status);
      const errorText = await qualityResponse.text();
      console.error('Error details:', errorText);
      if (qualityResponse.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: 'Límite de solicitudes excedido',
            message: 'Demasiadas solicitudes. Por favor, espera unos momentos e intenta de nuevo.'
          }), 
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`Quality check failed: ${errorText}`);
    }

    const qualityData = await qualityResponse.json();
    const qualityContent = qualityData.content?.[0]?.text || '{"isValid": true, "quality_score": 75}';
    const qualityResult = JSON.parse(qualityContent);
    
    console.log('✅ Quality check result:', qualityResult);

    // Validación de calidad - rechazar si es menor a 50
    if (qualityResult.quality_score < 50) {
      return new Response(
        JSON.stringify({ 
          error: 'Calidad de imagen insuficiente',
          quality: qualityResult,
          message: `Tu fotografía no cumple con los estándares de calidad necesarios (puntaje: ${qualityResult.quality_score}/100). ${qualityResult.recommendation || 'Por favor, toma nuevas fotos siguiendo estas recomendaciones:'}\n\n✓ Asegúrate de tener buena iluminación\n✓ Centra tu rostro en el encuadre\n✓ Mantén el rostro completo visible\n✓ Evita sombras en el rostro`
        }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Análisis facial REAL con mediciones sobre la imagen con Claude Opus 4
    console.log('🔍 Realizando análisis facial profesional con Claude Opus 4...');
    const facialAnalysisPrompt = `You are a professional facial analysis expert with clinical training. Analyze this photo by taking REAL MEASUREMENTS on the image.

CRITICAL INSTRUCTIONS:
- Use actual pixel measurements and proportions from THIS specific image
- DO NOT give generic or average values
- Measure the ACTUAL distances and ratios visible in the photo
- Compare EACH measurement with the Golden Ratio (1.618) and aesthetic ideals
- Provide a professional clinical explanation for each measurement

MEASUREMENTS TO TAKE:

1. FACE HORIZONTAL RATIO (Face Thirds Rule):
   - Measure: hairline to eyebrows (upper), eyebrows to nose tip (middle), nose tip to chin (lower)
   - Ideal: 33.3% each (equal thirds)
   - Golden Ratio comparison: should be harmonious
   - Explain: if balanced or which section is longer/shorter

2. FACE VERTICAL RATIO (Fifths Rule):
   - Measure: divide face width into 5 equal sections
   - Ideal: each section should be 20% of face width
   - Explain: spacing between features

3. FACE ASPECT RATIO:
   - Measure: face height ÷ face width
   - Golden Ratio ideal: 1.618
   - Explain: how close to golden ratio

4. EYE DISTANCE:
   - Measure: distance between inner eye corners
   - Ideal: should equal one eye width
   - Explain: if eyes are close-set, ideal, or wide-set

5. EYE ASPECT RATIO:
   - Measure: eye height ÷ eye width for each eye
   - Ideal: approximately 0.35-0.40
   - Explain: eye shape (almond, round, narrow)

6. NOSE TO MOUTH WIDTH RATIO:
   - Measure: nose width at base ÷ mouth width
   - Golden Ratio ideal: 0.618 (nose should be 61.8% of mouth width)
   - Explain: proportion balance

Respond with JSON including measurements AND professional explanations:
{
  "horizontal_ratio": {
    "upper": number (percentage),
    "middle": number (percentage),
    "lower": number (percentage),
    "explanation": "professional explanation comparing to 33% ideal",
    "golden_ratio_comparison": "how it relates to golden ratio"
  },
  "vertical_ratio": {
    "sections": [number, number, number, number, number],
    "explanation": "professional explanation about facial width balance"
  },
  "face_aspect_ratio": {
    "value": number,
    "golden_ratio_ideal": 1.618,
    "difference": number (how far from golden ratio),
    "explanation": "professional explanation if face is more oval/round/long"
  },
  "eye_distance": {
    "value": number,
    "category": "narrow|ideal|wide",
    "explanation": "professional explanation about eye spacing"
  },
  "eye_aspect_ratio": {
    "value": number,
    "explanation": "professional explanation about eye shape"
  },
  "nose_to_mouth_ratio": {
    "value": number,
    "golden_ratio_ideal": 0.618,
    "difference": number,
    "explanation": "professional explanation about nose-mouth proportion"
  },
  "symmetry_score": number (0-100),
  "overall_golden_ratio_score": number (0-100, how close overall proportions are to golden ratio),
  "overall_assessment": "comprehensive professional clinical summary"
}`;

    const facialResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-1-20250805',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: [
              { 
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: imageBase64.startsWith('data:image/png') ? 'image/png' : 
                              imageBase64.startsWith('data:image/jpeg') ? 'image/jpeg' : 'image/webp',
                  data: imageBase64.split(',')[1]
                }
              },
              { type: 'text', text: facialAnalysisPrompt }
            ]
          }
        ],
      }),
    });

    if (!facialResponse.ok) {
      console.error('Facial analysis failed:', facialResponse.status);
      const errorText = await facialResponse.text();
      console.error('Error details:', errorText);
      if (facialResponse.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: 'Límite de solicitudes excedido',
            message: 'Demasiadas solicitudes. Por favor, espera unos momentos e intenta de nuevo.'
          }), 
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`Facial analysis failed: ${errorText}`);
    }

    const facialData = await facialResponse.json();
    const facialContent = facialData.content?.[0]?.text || '{}';
    const facialMetrics = JSON.parse(facialContent);
    
    console.log('✅ Facial analysis complete:', facialMetrics);

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

    const correctionPrompt = `Professional dental photo editing. Apply these aesthetic corrections naturally and realistically. CRITICAL: Maintain the SAME PERSON - do not change the face, age, or identity.

Corrections:
${corrections.map((c, i) => `${i + 1}. ${c}`).join('\n')}

REQUIREMENTS:
- Keep EXACT SAME person, face structure, and facial features
- Maintain original lighting, shadows, and background
- Changes should be subtle but clinically visible
- Use natural tooth tones (not artificial white)
- Healthy proportionate gums
- DO NOT change person's age, gender, or facial features
- ONLY edit teeth and smile area`;

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

    // Primera simulación: correcciones con OpenAI GPT Image
    console.log('🎨 Aplicando correcciones estéticas con OpenAI GPT Image...');
    const correctionResponse = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: correctionPrompt,
        image: imageBase64,
        size: 'auto',
        quality: 'high',
        output_format: 'png'
      }),
    });

    if (!correctionResponse.ok) {
      const errorText = await correctionResponse.text();
      console.error('Correction error:', correctionResponse.status, errorText);
      if (correctionResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Límite de uso excedido, intenta más tarde.' }), 
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({ error: 'Error en generación de imagen corregida' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const correctionData = await correctionResponse.json();
    let correctedImage = correctionData.data?.[0]?.b64_json ? 
      `data:image/png;base64,${correctionData.data[0].b64_json}` : 
      correctionData.data?.[0]?.url;

    if (!correctedImage) {
      console.warn('No corrected image generated, using original as fallback');
      correctedImage = imageBase64;
    }

    // Segunda simulación: diseño ideal con OpenAI GPT Image
    console.log('✨ Generando simulación de sonrisa ideal con OpenAI GPT Image...');
    const recommendationPrompt = `Expert smile design. Create an IDEAL smile simulation based on professional recommendations. CRITICAL: Maintain the SAME PERSON.

FACIAL ANALYSIS:
${faceDescriptions.length > 0 ? faceDescriptions.join(', ') : 'Analyzed facial profile'}

PROFESSIONAL DESIGN RECOMMENDATIONS:
1. Tooth shape: ${teethShapeRec}
2. Tooth size: ${teethSizeRec}
3. Smile width: ${smileWidthRec}
4. Gingival exposure: ${gingivalRec}

CLINICAL RATIONALE: ${smileRecommendations?.rationale || 'Custom design based on facial proportions and golden ratio analysis'}

REQUIREMENTS:
- Keep EXACT SAME person, face structure, and facial features
- Apply recommended tooth shape: ${teethShapeRec}
- Adjust size per recommendation: ${teethSizeRec}
- Configure ideal smile width: ${smileWidthRec}
- Maintain naturalness and facial harmony
- Professional but natural appearance
- Natural white color harmonizing with skin tone
- DO NOT change person's age, gender, or facial features
- ONLY enhance teeth and smile area`;

    const idealResponse = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: recommendationPrompt,
        image: correctedImage,
        size: 'auto',
        quality: 'high',
        output_format: 'png'
      }),
    });

    if (!idealResponse.ok) {
      console.error('Ideal simulation error:', idealResponse.status);
      // Si falla la segunda simulación, devolvemos solo la corregida
      return new Response(
        JSON.stringify({ 
          simulatedImage: correctedImage, 
          idealImage: correctedImage,
          facialAnalysis: facialMetrics,
          qualityScore: qualityResult.quality_score
        }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const idealData = await idealResponse.json();
    const idealImage = idealData.data?.[0]?.b64_json ? 
      `data:image/png;base64,${idealData.data[0].b64_json}` : 
      idealData.data?.[0]?.url;

    return new Response(
      JSON.stringify({ 
        simulatedImage: correctedImage,
        idealImage: idealImage || correctedImage,
        facialAnalysis: facialMetrics,
        qualityScore: qualityResult.quality_score
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

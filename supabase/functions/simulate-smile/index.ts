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
                {
                  type: 'image_url',
                  image_url: { url: image }
                }
              ]
            }
          ],
          modalities: ['image', 'text']
        }),
      });

      if (!customResponse.ok) {
        const errorText = await customResponse.text();
        console.error('Custom simulation error:', errorText);
        throw new Error(`Custom simulation failed: ${customResponse.status} ${errorText}`);
      }

      const customData = await customResponse.json();
      const customizedImage = customData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

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

    // 1. Validación de calidad de imagen con Lovable AI
    console.log('📸 Validando calidad de imagen...');
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
              { type: 'text', text: qualityCheckPrompt },
              {
                type: 'image_url',
                image_url: { url: imageBase64 }
              }
            ]
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!qualityResponse.ok) {
      console.error('Quality check failed:', qualityResponse.status);
      if (qualityResponse.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: 'Sin créditos de IA',
            message: 'Los créditos de Lovable AI se han agotado. Por favor, recarga créditos en Settings → Workspace → Usage.'
          }), 
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (qualityResponse.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: 'Límite de solicitudes excedido',
            message: 'Demasiadas solicitudes. Por favor, espera unos momentos e intenta de nuevo.'
          }), 
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const qualityData = await qualityResponse.json();
    const qualityResult = JSON.parse(qualityData.choices?.[0]?.message?.content || '{"isValid": true, "quality_score": 75}');
    
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

    // 2. Análisis facial REAL con mediciones sobre la imagen
    console.log('🔍 Realizando análisis facial con mediciones reales...');
    const facialAnalysisPrompt = `You are a professional facial analysis expert. Analyze this photo by taking REAL MEASUREMENTS on the image.

CRITICAL INSTRUCTIONS:
- Use actual pixel measurements and proportions from THIS specific image
- DO NOT give generic or average values
- Measure the ACTUAL distances and ratios visible in the photo
- Compare EACH measurement with the Golden Ratio (1.618) and aesthetic ideals
- Provide a simple explanation for each measurement

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

Respond with JSON including measurements AND simple explanations:
{
  "horizontal_ratio": {
    "upper": number (percentage),
    "middle": number (percentage),
    "lower": number (percentage),
    "explanation": "simple explanation comparing to 33% ideal",
    "golden_ratio_comparison": "how it relates to golden ratio"
  },
  "vertical_ratio": {
    "sections": [number, number, number, number, number],
    "explanation": "simple explanation about facial width balance"
  },
  "face_aspect_ratio": {
    "value": number,
    "golden_ratio_ideal": 1.618,
    "difference": number (how far from golden ratio),
    "explanation": "simple explanation if face is more oval/round/long"
  },
  "eye_distance": {
    "value": number,
    "category": "narrow|ideal|wide",
    "explanation": "simple explanation about eye spacing"
  },
  "eye_aspect_ratio": {
    "value": number,
    "explanation": "simple explanation about eye shape"
  },
  "nose_to_mouth_ratio": {
    "value": number,
    "golden_ratio_ideal": 0.618,
    "difference": number,
    "explanation": "simple explanation about nose-mouth proportion"
  },
  "symmetry_score": number (0-100),
  "overall_golden_ratio_score": number (0-100, how close overall proportions are to golden ratio),
  "overall_assessment": "brief simple summary"
}`;

    const facialResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
              { type: 'text', text: facialAnalysisPrompt },
              {
                type: 'image_url',
                image_url: { url: imageBase64 }
              }
            ]
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!facialResponse.ok) {
      console.error('Facial analysis failed:', facialResponse.status);
      if (facialResponse.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: 'Sin créditos de IA',
            message: 'Los créditos de Lovable AI se han agotado. Por favor, recarga créditos en Settings → Workspace → Usage.'
          }), 
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (facialResponse.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: 'Límite de solicitudes excedido',
            message: 'Demasiadas solicitudes. Por favor, espera unos momentos e intenta de nuevo.'
          }), 
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error('Facial analysis failed');
    }

    const facialData = await facialResponse.json();
    const facialMetrics = JSON.parse(facialData.choices?.[0]?.message?.content || '{}');
    
    console.log('✅ Facial analysis complete:', facialMetrics);

    // Construir prompt basado en las métricas
    const corrections = [];
    
    if (metrics.smileArc === 'inverso' || metrics.smileArc === 'plano') {
      corrections.push('mejorar el arco de sonrisa para que sea consonante');
    }
    
    if (metrics.gingival.class === 'excesiva' || metrics.gingival.class === 'alta') {
      corrections.push('reducir la exposición gingival excesiva');
    }
    
    if (metrics.midline.mm > 2) {
      corrections.push(`corregir la línea media dental desviada ${metrics.midline.mm.toFixed(1)}mm`);
    }
    
    if (metrics.buccalRatio < 0.1 || metrics.buccalRatio > 0.3) {
      corrections.push('optimizar el corredor bucal');
    }

    // Agregar correcciones de dientes
    if (smileRecommendations?.missingTeeth) {
      corrections.push('agregar dientes faltantes con forma y color natural');
    }
    if (faceAnalysis?.teethAlignment === 'desalineado') {
      corrections.push('enderezar y alinear dientes torcidos o desalineados sutilmente');
    }

    const correctionPrompt = `You are an expert in dental photo editing. Edit this smile photo to apply these aesthetic corrections naturally and realistically. CRITICAL: You must maintain the SAME PERSON - do not change the face, age, or identity.

Corrections to apply:
${corrections.map((c, i) => `${i + 1}. ${c}`).join('\n')}

IMPORTANT: 
- Keep the EXACT SAME person, face structure, and facial features
- Maintain the original lighting, shadows, and background
- Changes should be subtle but visible
- Use natural tooth tones (not artificial white)
- The gums should look healthy and proportionate
- DO NOT change the person's age, gender, or facial features
- ONLY edit the teeth and smile area`;

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
    
    const recommendationPrompt = `You are an expert in smile design. Based on the corrected image, create an IDEAL smile simulation. CRITICAL: You must maintain the SAME PERSON - do not change the face, age, or identity.

FACIAL ANALYSIS:
${faceDescriptions.length > 0 ? faceDescriptions.join(', ') : 'Analyzed facial profile'}

DESIGN RECOMMENDATIONS:
1. Tooth shape: ${teethShapeRec}
2. Tooth size: ${teethSizeRec}
3. Smile width: ${smileWidthRec}
4. Gingival exposure: ${gingivalRec}

RATIONALE: ${smileRecommendations?.rationale || 'Custom design based on facial proportions'}

IMPORTANT:
- Keep the EXACT SAME person, face structure, and facial features
- Apply the recommended tooth shape: ${teethShapeRec}
- Adjust size according to recommendation: ${teethSizeRec}
- Configure ideal smile width: ${smileWidthRec}
- Maintain naturalness and facial harmony
- Teeth should look professional but natural
- Natural white color, not artificial
- DO NOT change the person's age, gender, or facial features
- ONLY enhance the teeth and smile area`;

    // Primera simulación: correcciones con Lovable AI
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
              {
                type: 'image_url',
                image_url: { url: imageBase64 }
              }
            ]
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!correctionResponse.ok) {
      if (correctionResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Límite de uso excedido, intenta más tarde.' }), 
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (correctionResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos agotados. Recarga tu cuenta.' }), 
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await correctionResponse.text();
      console.error('AI Gateway error (correction):', correctionResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Error en IA' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const correctionData = await correctionResponse.json();
    let correctedImage = correctionData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!correctedImage) {
      console.warn('No se generó imagen corregida desde IA, uso imagen original como fallback');
      correctedImage = imageBase64;
    }

    // Segunda simulación: diseño ideal con Lovable AI
    const enhancedRecommendationPrompt = `You are an expert in smile design. Based on the corrected image, create an IDEAL smile simulation. CRITICAL: You must maintain the SAME PERSON - do not change the face, age, or identity.

FACIAL ANALYSIS:
${faceDescriptions.length > 0 ? faceDescriptions.join(', ') : 'Analyzed facial profile'}

DESIGN RECOMMENDATIONS:
1. Tooth shape: ${teethShapeRec}
2. Tooth size: ${teethSizeRec}
3. Smile width: ${smileWidthRec}
4. Gingival exposure: ${gingivalRec}

RATIONALE: ${smileRecommendations?.rationale || 'Custom design based on facial proportions'}

IMPORTANT:
- Keep the EXACT SAME person, face structure, and facial features
- Apply the recommended tooth shape: ${teethShapeRec}
- Adjust size according to recommendation: ${teethSizeRec}
- Configure ideal smile width: ${smileWidthRec}
- Use natural tooth color that harmonizes with skin tone and lip color
- Maintain naturalness and facial harmony
- Teeth should look professional but natural
- DO NOT change the person's age, gender, or facial features
- ONLY enhance the teeth and smile area`;

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
              { type: 'text', text: enhancedRecommendationPrompt },
              {
                type: 'image_url',
                image_url: { url: correctedImage }
              }
            ]
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!idealResponse.ok) {
      console.error('AI Gateway error (ideal):', idealResponse.status);
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
    const idealImage = idealData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

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

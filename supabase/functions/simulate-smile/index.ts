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
    const { imageBase64, metrics, faceAnalysis, recommendations: smileRecommendations } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

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

    // Primera simulación: correcciones
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

    // Segunda simulación: diseño ideal basado en recomendaciones
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
        JSON.stringify({ simulatedImage: correctedImage, idealImage: correctedImage }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const idealData = await idealResponse.json();
    const idealImage = idealData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    return new Response(
      JSON.stringify({ 
        simulatedImage: correctedImage,
        idealImage: idealImage || correctedImage
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

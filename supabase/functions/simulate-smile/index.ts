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
    
    if (metrics.smileArc === 'invertido' || metrics.smileArc === 'plano') {
      corrections.push('mejorar el arco de sonrisa para que sea consonante');
    }
    
    if (metrics.gingival.class === 'excesiva') {
      corrections.push('reducir la exposición gingival excesiva');
    }
    
    if (Math.abs(metrics.midline.mm) > 2) {
      corrections.push(`corregir la línea media dental desviada ${metrics.midline.mm.toFixed(1)}mm hacia ${metrics.midline.side}`);
    }
    
    if (metrics.buccalRatio < 0.1 || metrics.buccalRatio > 0.3) {
      corrections.push('optimizar el corredor bucal');
    }

    // Agregar correcciones de dientes faltantes/desalineados
    corrections.push('agregar dientes faltantes con forma y color natural');
    corrections.push('enderezar y alinear dientes torcidos o desalineados');
    corrections.push('blanquear dientes manteniendo apariencia natural');
    corrections.push('igualar tamaños y proporciones de dientes según estándares estéticos');

    const correctionPrompt = `Eres un experto en simulación dental. Edita esta fotografía de sonrisa aplicando las siguientes correcciones estéticas de forma natural y realista:

${corrections.map((c, i) => `${i + 1}. ${c}`).join('\n')}

IMPORTANTE: 
- Mantén la naturalidad de la imagen
- Los cambios deben ser sutiles pero visibles
- Respeta la estructura facial original
- Usa tonos de dientes naturales (no blanco artificial)
- La encía debe verse saludable y proporcionada
- Mantén la iluminación y sombras originales`;

    // Construir prompt de recomendaciones
    const faceDescriptions = [];
    if (faceAnalysis?.faceShape) {
      faceDescriptions.push(`forma facial ${faceAnalysis.faceShape}`);
    }
    if (faceAnalysis?.gender) {
      faceDescriptions.push(`perfil ${faceAnalysis.gender}`);
    }
    
    const teethShapeRec = smileRecommendations?.teethShape || 'armónica con proporciones naturales';
    const teethSizeRec = smileRecommendations?.teethSize || 'proporcional al rostro';
    const smileWidthRec = smileRecommendations?.smileWidth || 'equilibrado y natural';
    const gingivalRec = smileRecommendations?.gingivalDisplay || 'exposición gingival adecuada';
    
    const recommendationPrompt = `Eres un experto en diseño de sonrisa. Basándote en la imagen corregida anterior, crea una simulación de sonrisa IDEAL considerando:

ANÁLISIS FACIAL:
${faceDescriptions.length > 0 ? faceDescriptions.map((r, i) => `${i + 1}. ${r}`).join('\n') : 'Perfil facial analizado'}

RECOMENDACIONES DE DISEÑO:
1. Forma de dientes: ${teethShapeRec}
2. Tamaño de dientes: ${teethSizeRec}
3. Ancho de sonrisa: ${smileWidthRec}
4. Exposición gingival: ${gingivalRec}

RATIONALE: ${smileRecommendations?.rationale || 'Diseño personalizado según proporciones faciales'}

IMPORTANTE:
- Aplica la forma de dientes recomendada: ${teethShapeRec}
- Ajusta el tamaño según recomendación: ${teethSizeRec}
- Configura el ancho de sonrisa ideal: ${smileWidthRec}
- Mantén naturalidad y armonía facial
- Los dientes deben verse profesionales pero naturales
- Color blanco natural, no artificial`;

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
    const correctedImage = correctionData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!correctedImage) {
      throw new Error('No se generó imagen corregida');
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

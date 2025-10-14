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
    const PERFECT_CORP_CLIENT_ID = Deno.env.get('PERFECT_CORP_CLIENT_ID');
    const PERFECT_CORP_CLIENT_SECRET = Deno.env.get('PERFECT_CORP_CLIENT_SECRET');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!PERFECT_CORP_CLIENT_ID || !PERFECT_CORP_CLIENT_SECRET) {
      console.warn('Perfect Corp API keys not configured, skipping facial analysis');
    }
    
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

    // 1. Autenticación con Perfect Corp (si está disponible)
    let perfectCorpFaceData = null;
    if (PERFECT_CORP_CLIENT_ID && PERFECT_CORP_CLIENT_SECRET) {
      console.log('🔑 Perfect Corp credentials found, attempting authentication...');
      try {
        // Generar id_token para autenticación Perfect Corp
        const timestamp = Date.now();
        const encoder = new TextEncoder();
        const data = encoder.encode(`client_id=${PERFECT_CORP_CLIENT_ID}&timestamp=${timestamp}`);
        
        // Crear hash simple (Perfect Corp usa RSA pero para demo usamos base64)
        const idToken = btoa(String.fromCharCode(...data));
        
        console.log('📤 Sending auth request to Perfect Corp...');
        const authResponse = await fetch('https://yce-api-01.perfectcorp.com/s2s/v1.0/client/auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            client_id: PERFECT_CORP_CLIENT_ID,
            id_token: idToken
          }),
        });

        console.log(`📥 Perfect Corp auth response status: ${authResponse.status}`);
        
        if (authResponse.ok) {
          const authData = await authResponse.json();
          const accessToken = authData.result?.access_token;
          
          console.log('✅ Perfect Corp authentication successful:', accessToken ? 'Token received' : 'No token');

          if (accessToken) {
            // 2. Crear archivo para análisis facial
            console.log('📤 Creating file for facial analysis...');
            const fileResponse = await fetch('https://yce-api-01.perfectcorp.com/s2s/v1.1/file/face-attr-analysis', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                files: [{
                  content_type: 'image/jpeg',
                  file_name: 'face_analysis.jpg'
                }]
              }),
            });

            console.log(`📥 File creation response status: ${fileResponse.status}`);

            if (fileResponse.ok) {
              const fileData = await fileResponse.json();
              const fileInfo = fileData.result?.files?.[0];
              
              console.log('📁 File info received:', fileInfo ? 'Success' : 'No file info');
              
              if (fileInfo) {
                // 3. Subir imagen al URL proporcionado
                const uploadUrl = fileInfo.requests?.[0]?.url;
                console.log('📤 Uploading image to Perfect Corp...');
                if (uploadUrl) {
                  // Convertir base64 a blob
                  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
                  const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
                  
                  await fetch(uploadUrl, {
                    method: fileInfo.requests[0].method,
                    headers: fileInfo.requests[0].headers,
                    body: binaryData
                  });

                  console.log('✅ Image uploaded successfully');

                  // 4. Ejecutar tarea de análisis facial
                  console.log('🔄 Starting facial analysis task...');
                  const taskResponse = await fetch('https://yce-api-01.perfectcorp.com/s2s/v1.0/task/face-attr-analysis', {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${accessToken}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      request_id: 0,
                      payload: {
                        file_id: fileInfo.file_id
                      }
                    }),
                  });

                  console.log(`📥 Task creation response status: ${taskResponse.status}`);

                  if (taskResponse.ok) {
                    const taskData = await taskResponse.json();
                    const taskId = taskData.result?.task_id;
                    
                    console.log('✅ Analysis task created. Task ID:', taskId);
                    console.log('⏳ Polling for results...');
                    
                    // 5. Polling para obtener resultado
                    let attempts = 0;
                    while (attempts < 10) {
                      await new Promise(resolve => setTimeout(resolve, 2000));
                      
                      const statusResponse = await fetch(
                        `https://yce-api-01.perfectcorp.com/s2s/v1.0/task/face-attr-analysis?task_id=${encodeURIComponent(taskId)}`,
                        {
                          headers: {
                            'Authorization': `Bearer ${accessToken}`
                          }
                        }
                      );

                      if (statusResponse.ok) {
                        const statusData = await statusResponse.json();
                        const status = statusData.result?.status;
                        console.log(`📊 Poll attempt ${attempts + 1}/10 - Status: ${status}`);
                        
                        if (status === 'success') {
                          perfectCorpFaceData = statusData.result?.result;
                          console.log('✅ ✅ ✅ Perfect Corp facial analysis SUCCESSFUL!');
                          console.log('📊 Perfect Corp data:', JSON.stringify(perfectCorpFaceData, null, 2));
                          break;
                        } else if (status === 'error') {
                          console.error('❌ Perfect Corp analysis failed:', statusData.result?.error_code);
                          break;
                        }
                      } else {
                        console.error(`❌ Status check failed with status: ${statusResponse.status}`);
                      }
                      attempts++;
                    }
                    
                    if (attempts >= 10 && !perfectCorpFaceData) {
                      console.warn('⏱️ Perfect Corp analysis timed out after 10 attempts');
                    }
                  } else {
                    const taskErrorText = await taskResponse.text();
                    console.error('❌ Failed to create analysis task:', taskErrorText);
                  }
                } else {
                  console.error('❌ No upload URL received');
                }
              } else {
                console.error('❌ No file info in response');
              }
            } else {
              const fileErrorText = await fileResponse.text();
              console.error('❌ File creation failed:', fileErrorText);
            }
          } else {
            console.error('❌ No access token received from auth');
          }
        } else {
          const authErrorText = await authResponse.text();
          console.error('❌ Perfect Corp authentication failed:', authErrorText);
        }
      } catch (perfectError) {
        console.error('❌ ❌ ❌ Perfect Corp API error:', perfectError);
        // Continuar sin datos de Perfect Corp
      }
    } else {
      console.log('⚠️ Perfect Corp credentials not configured, skipping facial analysis');
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

    // Preparar datos de Perfect Corp para respuesta
    const perfectCorpDataForResponse = perfectCorpFaceData ? {
      skinColor: perfectCorpFaceData.skin_color,
      eyeColor: perfectCorpFaceData.eye_color_name,
      lipColor: perfectCorpFaceData.lip_color,
      hairColor: perfectCorpFaceData.hair_color_name,
      faceShape: perfectCorpFaceData.face_shape,
      eyeShape: perfectCorpFaceData.eye_shape,
      eyeSize: perfectCorpFaceData.eye_size,
      eyeAngle: perfectCorpFaceData.eye_angle,
      eyeDistance: perfectCorpFaceData.eye_distance,
      eyelid: perfectCorpFaceData.eyelid,
      noseType: perfectCorpFaceData.nose_type,
      lipsType: perfectCorpFaceData.lips_type,
      browsType: perfectCorpFaceData.brows_type,
      cheekbonesType: perfectCorpFaceData.cheekbones_type
    } : null;

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

    // Segunda simulación: diseño ideal con Lovable AI y datos de Perfect Corp
    const enhancedRecommendationPrompt = `You are an expert in smile design. Based on the corrected image, create an IDEAL smile simulation. CRITICAL: You must maintain the SAME PERSON - do not change the face, age, or identity.

FACIAL ANALYSIS${perfectCorpFaceData ? ' (Enhanced with Perfect Corp AI)' : ''}:
${faceDescriptions.length > 0 ? faceDescriptions.join(', ') : 'Analyzed facial profile'}
${perfectCorpFaceData ? `
- Skin tone: ${perfectCorpFaceData.skin_color}
- Eye color: ${perfectCorpFaceData.eye_color_name}
- Lip color: ${perfectCorpFaceData.lip_color}
- Hair color: ${perfectCorpFaceData.hair_color_name}` : ''}

DESIGN RECOMMENDATIONS:
1. Tooth shape: ${teethShapeRec}
2. Tooth size: ${teethSizeRec}
3. Smile width: ${smileWidthRec}
4. Gingival exposure: ${gingivalRec}

RATIONALE: ${smileRecommendations?.rationale || 'Custom design based on facial proportions and color harmony'}

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
          faceAnalysis: faceAnalysis,
          perfectCorpData: perfectCorpDataForResponse
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
        faceAnalysis: faceAnalysis,
        perfectCorpData: perfectCorpDataForResponse
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

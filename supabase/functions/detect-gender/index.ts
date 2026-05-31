import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();
    if (!imageBase64) {
      return new Response(JSON.stringify({ gender: 'neutral' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      console.warn('LOVABLE_API_KEY not configured');
      return new Response(JSON.stringify({ gender: 'neutral' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this face photo and determine if the person appears to be male or female. Respond with ONLY one word: 'male' or 'female'. If you cannot determine, respond 'neutral'."
              },
              { type: "image_url", image_url: { url: imageBase64 } }
            ]
          }
        ],
        max_tokens: 10
      })
    });

    if (!response.ok) {
      console.warn('AI gateway error:', response.status, await response.text());
      return new Response(JSON.stringify({ gender: 'neutral' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content?.toLowerCase().trim() || '';
    const gender = raw === 'male' || raw === 'female' ? raw : 'neutral';

    return new Response(JSON.stringify({ gender }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('detect-gender error:', error);
    return new Response(JSON.stringify({ gender: 'neutral' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

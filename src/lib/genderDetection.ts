/**
 * Detecta el género aparente de una persona en una foto usando Gemini Vision
 * Retorna 'male', 'female', o 'neutral' si no puede determinarlo
 */
export async function detectGender(imageBase64: string): Promise<'male' | 'female' | 'neutral'> {
  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
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
              {
                type: "image_url",
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
        max_tokens: 10
      })
    });

    if (!response.ok) {
      console.warn("Gender detection API error:", response.status);
      return 'neutral';
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content?.toLowerCase().trim();

    if (result === 'male' || result === 'female') {
      return result;
    }

    return 'neutral';
  } catch (error) {
    console.warn("Gender detection failed:", error);
    return 'neutral';
  }
}

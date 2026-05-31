import { getSupabase } from "@/integrations/supabase/safeClient";

/**
 * Detecta el género aparente vía edge function (usa LOVABLE_API_KEY server-side).
 */
export async function detectGender(imageBase64: string): Promise<'male' | 'female' | 'neutral'> {
  try {
    const { data, error } = await getSupabase().functions.invoke('detect-gender', {
      body: { imageBase64 },
    });
    if (error) {
      console.warn('Gender detection error:', error);
      return 'neutral';
    }
    const g = data?.gender;
    return g === 'male' || g === 'female' ? g : 'neutral';
  } catch (e) {
    console.warn('Gender detection failed:', e);
    return 'neutral';
  }
}

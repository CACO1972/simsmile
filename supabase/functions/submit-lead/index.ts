import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const LeadSchema = z.object({
  name: z.string().trim().min(2, "Nombre muy corto").max(100),
  email: z.string().trim().email("Email inválido").max(255),
  whatsapp: z.string().trim().min(8, "WhatsApp inválido").max(20),
  detectedGender: z.enum(['male', 'female', 'neutral']).optional(),
  idealImage: z.string().optional(),
});

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const body = await req.json();
    const parsed = LeadSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { name, email, whatsapp, detectedGender, idealImage } = parsed.data;

    // Insertar lead
    const { data: lead, error: insertError } = await supabase
      .from('leads')
      .insert({
        name,
        email,
        whatsapp,
        detected_gender: detectedGender || null,
        has_simulation: true,
        source: 'simulation_unlock',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting lead:', insertError);
      throw new Error('No se pudo guardar el lead');
    }

    // Notificar a la clínica (Resend) — no bloquea si falla
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (RESEND_API_KEY) {
      try {
        const safeName = escapeHtml(name);
        const safeEmail = escapeHtml(email);
        const safeWa = escapeHtml(whatsapp);
        const waLink = `https://wa.me/${whatsapp.replace(/\D/g, '')}`;

        await fetch("https://api.resend.com/emails", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'SimSmile <noreply@clinicamiro.cl>',
            to: ['administracion@clinicamiro.cl'],
            reply_to: email,
            subject: `🦷 Nuevo lead SimSmile - ${safeName}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #EC4899;">Nuevo interesado desde SimSmile</h2>
                <div style="background:#f5f5f5; padding:20px; border-radius:8px;">
                  <p><strong>Nombre:</strong> ${safeName}</p>
                  <p><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
                  <p><strong>WhatsApp:</strong> <a href="${waLink}">${safeWa}</a></p>
                  <p><strong>Género detectado:</strong> ${detectedGender || 'no detectado'}</p>
                </div>
                ${idealImage ? `<div style="margin-top:20px;"><h3>Simulación</h3><img src="${idealImage}" style="max-width:100%; border-radius:8px;" /></div>` : ''}
                <p style="margin-top:20px;">
                  <a href="${waLink}?text=Hola%20${encodeURIComponent(safeName)},%20vi%20tu%20simulación%20en%20SimSmile"
                     style="display:inline-block; background:#25D366; color:white; padding:12px 24px; text-decoration:none; border-radius:8px; font-weight:bold;">
                    Contactar por WhatsApp
                  </a>
                </p>
              </div>
            `,
          }),
        });

        await supabase.from('leads').update({ notified_at: new Date().toISOString() }).eq('id', lead.id);
      } catch (e) {
        console.warn('Notificación email falló (no bloqueante):', e);
      }
    }

    return new Response(
      JSON.stringify({ success: true, leadId: lead.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('submit-lead error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Error desconocido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

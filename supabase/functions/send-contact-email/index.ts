import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  "https://simsmile.cl",
  "https://simsmile.lovable.app",
  "http://localhost:5173",
  "http://localhost:8080"
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && (ALLOWED_ORIGINS.some(allowed => origin === allowed) ||
    origin.endsWith('.lovable.app') ||
    origin.endsWith('.lovableproject.com')
  ) ? origin : ALLOWED_ORIGINS[0];
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin'
  };
}

// Input validation schema
const ContactSchema = z.object({
  name: z.string().trim().min(1, "Name required").max(100, "Name too long"),
  email: z.string().trim().email("Invalid email").max(255, "Email too long"),
  phone: z.string().trim().max(20, "Phone too long").optional().default(""),
  message: z.string().trim().max(2000, "Message too long").optional().default(""),
  restImage: z.string().optional(),
  smileImage: z.string().optional(),
  idealImage: z.string().optional()
});

// HTML escaping to prevent XSS
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawBody = await req.json();
    
    // Validate and sanitize input
    const validatedData = ContactSchema.parse(rawBody);
    const { name, email, phone, message, restImage, smileImage, idealImage } = validatedData;

    // Escape HTML in user inputs
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone);
    const safeMessage = escapeHtml(message);

    // Email a la clínica
    const clinicEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Clínica Dental Miro <administracion@clinicamiro.cl>",
        to: ["administracion@clinicamiro.cl"],
        subject: `Nuevo contacto de SimSmile - ${safeName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Nuevo contacto desde SimSmile</h2>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Nombre:</strong> ${safeName}</p>
              <p><strong>Email:</strong> ${safeEmail}</p>
              <p><strong>Teléfono:</strong> ${safePhone || 'N/A'}</p>
              <p><strong>Mensaje:</strong></p>
              <p style="white-space: pre-wrap;">${safeMessage || 'N/A'}</p>
            </div>
          </div>
        `,
      }),
    });

    if (!clinicEmailResponse.ok) {
      const errorData = await clinicEmailResponse.text();
      console.error("Resend API error:", errorData);

      // Fallback: domain not verified -> use Resend sandbox to send to account email
      if (
        errorData.includes("domain is not verified") ||
        errorData.includes("only send testing emails")
      ) {
        const fallbackResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "SimSmile <onboarding@resend.dev>",
            to: ["admin@clinicamiro.cl"],
            reply_to: "administracion@clinicamiro.cl",
            subject: `[Fallback] Nuevo contacto de SimSmile - ${safeName}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Nuevo contacto desde SimSmile (Fallback Sandbox)</h2>
                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>Nombre:</strong> ${safeName}</p>
                  <p><strong>Email:</strong> ${safeEmail}</p>
                  <p><strong>Teléfono:</strong> ${safePhone || 'N/A'}</p>
                  <p><strong>Mensaje:</strong></p>
                  <p style="white-space: pre-wrap;">${safeMessage || 'N/A'}</p>
                </div>
                ${restImage ? `
                  <div style="margin: 20px 0;">
                    <h3 style="color: #333;">Foto Original</h3>
                    <img src="${restImage}" alt="Foto original" style="max-width: 100%; border-radius: 8px;" />
                  </div>
                ` : ''}
                ${idealImage ? `
                  <div style="margin: 20px 0;">
                    <h3 style="color: #333;">Simulación de Sonrisa</h3>
                    <img src="${idealImage}" alt="Simulación" style="max-width: 100%; border-radius: 8px;" />
                  </div>
                ` : ''}
                <p style="color:#666; font-size:12px">Motivo fallback: ${errorData}</p>
              </div>
            `,
          }),
        });

        if (!fallbackResponse.ok) {
          const fbText = await fallbackResponse.text();
          console.error("Resend fallback error:", fbText);
          throw new Error(`Error sending email via fallback: ${fbText}`);
        }

        console.warn("Email enviado con fallback a admin@clinicamiro.cl (sandbox)");
      } else {
        throw new Error(`Error sending email to clinic: ${errorData}`);
      }
    }

    // Delay para evitar rate limit de Resend (2 req/seg)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Email de confirmación al usuario
    const userEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Clínica Dental Miro <administracion@clinicamiro.cl>",
        to: [email],
        subject: "¡Hemos recibido tu mensaje!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #333; margin-bottom: 20px;">¡Gracias por contactarnos, ${safeName}!</h1>
            
            <p style="font-size: 16px; line-height: 1.6; color: #555;">
              Hemos recibido tu análisis de sonrisa. Nuestro equipo de especialistas está listo para ayudarte a lograr la sonrisa que deseas.
            </p>

            ${idealImage ? `
              <div style="margin: 30px 0; text-align: center;">
                <h2 style="color: #333; margin-bottom: 15px;">Tu Simulación de Sonrisa</h2>
                <img src="${idealImage}" alt="Simulación de sonrisa" style="max-width: 100%; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" />
              </div>
            ` : ''}

            <!-- CTA Principal -->
            <div style="background: linear-gradient(135deg, #EC4899 0%, #F97316 100%); border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center;">
              <h2 style="color: white; margin: 0 0 15px 0; font-size: 24px;">
                🎉 ¡Agenda tu Consulta GRATIS!
              </h2>
              <p style="color: white; margin: 0 0 20px 0; font-size: 16px; opacity: 0.95;">
                Primera evaluación sin costo. Hablemos de tu sonrisa ideal.
              </p>
              <a href="https://wa.me/56988085850?text=Hola,%20quiero%20agendar%20mi%20consulta%20de%20SimSmile" 
                 style="display: inline-block; background: white; color: #EC4899; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                Agendar por WhatsApp
              </a>
            </div>

            <div style="background: #f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">📞 Otras formas de contacto:</h3>
              <p style="margin: 5px 0; color: #666;">
                <strong>Email:</strong> <a href="mailto:administracion@clinicamiro.cl" style="color: #EC4899;">administracion@clinicamiro.cl</a>
              </p>
              <p style="margin: 5px 0; color: #666;">
                <strong>Teléfono:</strong> +56 9 8808 5850
              </p>
              <p style="margin: 5px 0; color: #666;">
                <strong>Web:</strong> <a href="https://www.clinicamiro.cl" style="color: #EC4899;">www.clinicamiro.cl</a>
              </p>
            </div>

            <p style="font-size: 16px; line-height: 1.6; color: #555; margin-top: 30px;">
              Nuestros especialistas revisarán tu caso y estarán encantados de diseñar un plan personalizado para ti.
            </p>

            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
              <p style="color: #999; font-size: 13px; margin: 5px 0;">
                Clínica Dental Miro
              </p>
              <p style="color: #999; font-size: 13px; margin: 5px 0;">
                Tu sonrisa es nuestra prioridad ✨
              </p>
            </div>
          </div>
        `,
      }),
    });

    if (!userEmailResponse.ok) {
      const errorData = await userEmailResponse.text();
      console.warn("Resend API error (confirmation, non-blocking):", errorData);
      // No lanzar error para no bloquear el flujo cuando Resend está en modo prueba
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.errors);
      return new Response(
        JSON.stringify({ 
          error: "Invalid input data", 
          details: error.errors 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.error("Error in send-contact-email:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

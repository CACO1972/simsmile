import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  phone: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, phone, message }: ContactEmailRequest = await req.json();

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
        subject: `Nuevo contacto de SimSmile - ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Nuevo contacto desde SimSmile</h2>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Nombre:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Teléfono:</strong> ${phone}</p>
              <p><strong>Mensaje:</strong></p>
              <p style="white-space: pre-wrap;">${message}</p>
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
            subject: `[Fallback] Nuevo contacto de SimSmile - ${name}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Nuevo contacto desde SimSmile (Fallback Sandbox)</h2>
                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>Nombre:</strong> ${name}</p>
                  <p><strong>Email:</strong> ${email}</p>
                  <p><strong>Teléfono:</strong> ${phone}</p>
                  <p><strong>Mensaje:</strong></p>
                  <p style="white-space: pre-wrap;">${message}</p>
                </div>
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
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">¡Gracias por contactarnos, ${name}!</h1>
            <p style="font-size: 16px; line-height: 1.6;">
              Hemos recibido tu mensaje y nos pondremos en contacto contigo lo antes posible.
            </p>
            <p style="font-size: 16px; line-height: 1.6;">
              Nuestro equipo revisará tu consulta y te responderemos pronto.
            </p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 14px;">
                Clínica Dental Miro<br>
                Tu sonrisa es nuestra prioridad
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
  } catch (error: any) {
    console.error("Error in send-contact-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

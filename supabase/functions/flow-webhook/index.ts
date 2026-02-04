import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper para crear firma HMAC-SHA256
async function createFlowSignature(params: Record<string, string>, secretKey: string): Promise<string> {
  const sortedKeys = Object.keys(params).sort();
  const signString = sortedKeys.map(key => `${key}${params[key]}`).join('');
  
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretKey);
  const msgData = encoder.encode(signString);
  
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, msgData);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // Flow envía POST con token
    const formData = await req.formData();
    const token = formData.get('token') as string;

    if (!token) {
      console.error('No token received from Flow');
      return new Response('Token required', { status: 400 });
    }

    console.log('Received Flow webhook with token:', token);

    // Consultar estado del pago a Flow
    const apiKey = Deno.env.get('FLOW_API_KEY');
    const secretKey = Deno.env.get('FLOW_SECRET_KEY');

    if (!apiKey || !secretKey) {
      throw new Error('Flow API credentials not configured');
    }

    const params: Record<string, string> = {
      apiKey,
      token
    };

    const signature = await createFlowSignature(params, secretKey);

    const flowResponse = await fetch(
      `https://www.flow.cl/api/payment/getStatus?apiKey=${apiKey}&token=${token}&s=${signature}`,
      { method: 'GET' }
    );

    const paymentData = await flowResponse.json();
    console.log('Flow payment status:', paymentData);

    if (!flowResponse.ok) {
      console.error('Error fetching payment status:', paymentData);
      return new Response('Error fetching status', { status: 500 });
    }

    // Status: 1 = pendiente, 2 = pagado, 3 = rechazado, 4 = anulado
    const commerceOrder = paymentData.commerceOrder;
    let newStatus = 'pending';

    if (paymentData.status === 2) {
      newStatus = 'completed';
    } else if (paymentData.status === 3) {
      newStatus = 'rejected';
    } else if (paymentData.status === 4) {
      newStatus = 'cancelled';
    }

    // Actualizar registro en BD
    const { error: updateError } = await supabase
      .from('simulation_credits')
      .update({
        flow_payment_status: newStatus,
        paid_at: newStatus === 'completed' ? new Date().toISOString() : null
      })
      .eq('flow_order_id', commerceOrder);

    if (updateError) {
      console.error('Error updating payment status:', updateError);
      throw updateError;
    }

    console.log(`Payment ${commerceOrder} updated to status: ${newStatus}`);

    // Flow espera respuesta 200 para confirmar recepción
    return new Response('OK', { status: 200 });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Internal error', { status: 500 });
  }
});
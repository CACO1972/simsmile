import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Flow API endpoints
const FLOW_API_URL = "https://www.flow.cl/api";

// Helper para crear firma HMAC-SHA256
async function createFlowSignature(params: Record<string, string>, secretKey: string): Promise<string> {
  // Ordenar parámetros alfabéticamente
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
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();

    // Iniciar pago
    if (req.method === 'POST' && path === 'flow-payment') {
      const { email, phone, packageType = 'basic' } = await req.json();

      if (!email) {
        return new Response(
          JSON.stringify({ error: 'Email requerido' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Definir precios por paquete
      const packages: Record<string, { amount: number; credits: number; name: string; includesSkinAnalysis?: boolean }> = {
        basic: { amount: 5990, credits: 3, name: 'Pack 3 Simulaciones' },
        bundle: { amount: 7990, credits: 3, name: 'Pack Completo: Simulación + Análisis de Piel', includesSkinAnalysis: true },
        premium: { amount: 9990, credits: 10, name: 'Pack 10 Simulaciones + Análisis de Piel', includesSkinAnalysis: true },
        unlimited: { amount: 14990, credits: 999, name: 'Pack Ilimitado (30 días)', includesSkinAnalysis: true },
        skin_analysis: { amount: 2990, credits: 0, name: 'Análisis de Piel Premium' }
      };

      const selectedPackage = packages[packageType] || packages.basic;
      
      // Generar ID único para el pedido
      const commerceOrder = `SIM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Crear registro en BD
      const { data: creditRecord, error: insertError } = await supabase
        .from('simulation_credits')
        .insert({
          email,
          phone,
          credits_total: selectedPackage.credits,
          amount_paid: selectedPackage.amount,
          package_type: packageType,
          flow_order_id: commerceOrder,
          flow_payment_status: 'pending'
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating credit record:', insertError);
        throw new Error('Error al crear registro de pago');
      }

      // Preparar parámetros para Flow
      const apiKey = Deno.env.get('FLOW_API_KEY');
      const secretKey = Deno.env.get('FLOW_SECRET_KEY');

      if (!apiKey || !secretKey) {
        throw new Error('Flow API credentials not configured');
      }

      const baseUrl = Deno.env.get('SUPABASE_URL') || '';
      const urlConfirmation = `${baseUrl}/functions/v1/flow-webhook`;
      const urlReturn = `https://simsmile.lovable.app/?payment=success&order=${commerceOrder}&package=${packageType}`;

      const params: Record<string, string> = {
        apiKey,
        commerceOrder,
        subject: selectedPackage.name,
        currency: 'CLP',
        amount: selectedPackage.amount.toString(),
        email,
        urlConfirmation,
        urlReturn
      };

      // Crear firma
      const signature = await createFlowSignature(params, secretKey);
      params.s = signature;

      // Llamar a Flow API
      const formData = new URLSearchParams(params);
      const flowResponse = await fetch(`${FLOW_API_URL}/payment/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      });

      const flowData = await flowResponse.json();

      if (!flowResponse.ok || flowData.code) {
        console.error('Flow API error:', flowData);
        throw new Error(flowData.message || 'Error al crear pago en Flow');
      }

      // Flow retorna URL de pago
      const paymentUrl = `${flowData.url}?token=${flowData.token}`;

      return new Response(
        JSON.stringify({
          success: true,
          paymentUrl,
          orderId: commerceOrder,
          creditId: creditRecord.id
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar créditos disponibles
    if (req.method === 'POST' && path === 'check-credits') {
      const { email } = await req.json();

      const { data: credits, error } = await supabase
        .from('simulation_credits')
        .select('*')
        .eq('email', email)
        .eq('flow_payment_status', 'completed')
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Calcular créditos totales disponibles
      const totalCredits = credits?.reduce((sum, c) => sum + (c.credits_total - c.credits_used), 0) || 0;

      return new Response(
        JSON.stringify({
          hasCredits: totalCredits > 0,
          remainingCredits: totalCredits,
          packages: credits
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Usar un crédito
    if (req.method === 'POST' && path === 'use-credit') {
      const { email } = await req.json();

      // Buscar paquete con créditos disponibles
      const { data: credits, error: fetchError } = await supabase
        .from('simulation_credits')
        .select('*')
        .eq('email', email)
        .eq('flow_payment_status', 'completed')
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      const availablePackage = credits?.find(c => c.credits_used < c.credits_total);

      if (!availablePackage) {
        return new Response(
          JSON.stringify({ error: 'No tienes créditos disponibles', needsPayment: true }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Decrementar crédito
      const { error: updateError } = await supabase
        .from('simulation_credits')
        .update({ credits_used: availablePackage.credits_used + 1 })
        .eq('id', availablePackage.id);

      if (updateError) throw updateError;

      const remaining = (availablePackage.credits_total - availablePackage.credits_used - 1);

      return new Response(
        JSON.stringify({
          success: true,
          remainingCredits: remaining,
          message: remaining === 0 ? '¡Última simulación! Considera comprar más créditos.' : `Te quedan ${remaining} simulaciones.`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Endpoint no encontrado' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Flow payment error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error procesando pago';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
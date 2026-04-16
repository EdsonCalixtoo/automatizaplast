import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const mpAccessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    console.log("Webhook received:", JSON.stringify(body));

    const paymentId = body.data?.id || body.resource?.split('/').pop();
    
    // Suporte ao simulador do Mercado Pago (ID 123456)
    if (paymentId === "123456" || !paymentId) {
      return new Response(JSON.stringify({ success: true, message: "Simulated test received" }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      });
    }

    // 1. Buscar detalhes do pagamento no Mercado Pago
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${mpAccessToken}` }
    });

    if (!mpResponse.ok) {
       const errorText = await mpResponse.text();
       console.error(`MP Error for ID ${paymentId}:`, errorText);
       // Retornamos 200 mesmo com erro de busca para evitar que o MP fique reenviando se for um ID inválido
       return new Response(JSON.stringify({ error: "Payment not found in MP" }), { status: 200 });
    }
    
    const paymentData = await mpResponse.json();
    const status = paymentData.status; 
    const externalReference = paymentData.external_reference; 
    
    const statusMap: Record<string, string> = {
      'pending': 'Confirmando pagamento',
      'approved': 'Pagamento aprovado',
      'rejected': 'Pagamento recusado',
      'cancelled': 'Pagamento cancelado',
      'in_process': 'Confirmando pagamento'
    };

    const friendlyStatus = statusMap[status] || status;

    const updateData: any = {
      status: friendlyStatus,
      payment_status: status,
      mercadopago_payment_id: paymentId.toString()
    };

    if (status === 'approved') {
      updateData.payment_confirmed_at = new Date().toISOString();
    }

    if (paymentData.payment_method_id && paymentData.card) {
      updateData.card_brand = paymentData.payment_method_id;
      updateData.card_last_4 = paymentData.card.last_four_digits;
    }

    // Atualizar no banco
    const { data: order, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', externalReference)
      .select()
      .single();

    if (updateError) console.error("Database Update Error:", updateError);

    // Se aprovado, enviar e-mail (apenas uma vez)
    if (status === 'approved' && order) {
       await supabase.functions.invoke('send-order-email', {
         body: { order, items: [] } // Itens podem ser buscados via DB na função de email
       });
    }

    return new Response(JSON.stringify({ success: true }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200 
    });

  } catch (error) {
    console.error("Webhook error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200 // Sempre retornar 200 para o MP parar de tentar se for erro de lógica
    });
  }
})

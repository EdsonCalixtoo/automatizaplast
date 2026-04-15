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
    const action = body.action || body.type;

    if (!paymentId || (action !== 'payment.created' && action !== 'payment.updated' && action !== 'payment')) {
      return new Response(JSON.stringify({ received: true, ignored: true }), { status: 200 });
    }

    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${mpAccessToken}` }
    });

    if (!mpResponse.ok) throw new Error(`Erro ao buscar pagamento no MP: ${paymentId}`);
    
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

    const { data: order, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', externalReference)
      .select()
      .single();

    if (updateError) {
      console.error("Erro ao atualizar pedido:", updateError);
      throw updateError;
    }

    if (status === 'approved' && order) {
       await sendConfirmationEmail(order, mpAccessToken);
    }

    return new Response(JSON.stringify({ success: true }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200 
    });

  } catch (error) {
    console.error("Webhook error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400 
    });
  }
})

async function sendConfirmationEmail(order: any, mpAccessToken: string) {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) return;

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', order.id);

  const logoUrl = "https://raw.githubusercontent.com/EdsonCalixtoo/automatizaplast/main/public/logo.png";

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Automatiza Plast <contato@automatizaplast.com.br>',
      to: [order.client_email],
      subject: `✅ Pagamento Confirmado: Pedido ${order.id}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: sans-serif;">
          <table width="100%" cellspacing="0" cellpadding="0" style="padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" style="background-color: #ffffff; border-radius: 40px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.05);">
                  <tr>
                    <td align="center" style="padding: 40px; background-color: #0a1e36;">
                      <img src="${logoUrl}" width="200">
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding: 40px;">
                      <h1 style="color: #0a1e36; font-size: 28px; font-weight: 900; margin: 0; text-transform: uppercase;">Pagamento Aprovado!</h1>
                      <p style="color: #64748b; margin-top: 12px;">Olá, ${order.client_name}! Seu pagamento foi confirmado e seu pedido já está em nossa linha de produção.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 40px;">
                      <div style="background-color: #f1f5f9; border-radius: 24px; padding: 24px;">
                        <p style="font-size: 10px; font-weight: 700; color: #ef4444; margin: 0 0 16px 0;">INFORMAÇÕES DO PAGAMENTO</p>
                        <p style="margin: 4px 0; font-size: 14px;"><strong>Pedido:</strong> ${order.id}</p>
                        <p style="margin: 4px 0; font-size: 14px;"><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
                        <p style="margin: 4px 0; font-size: 14px;"><strong>Valor:</strong> R$ ${Number(order.total_price).toFixed(2)}</p>
                        <p style="margin: 4px 0; font-size: 14px;"><strong>Status:</strong> Pago</p>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding: 40px;">
                      <a href="https://automatizaplast.com.br/rastreio?orderId=${order.id.replace('#', '')}" style="background-color: #0a1e36; color: #ffffff; padding: 18px 36px; border-radius: 16px; text-decoration: none; font-size: 12px; font-weight: 900; text-transform: uppercase;">Ver Status da Produção</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    })
  });
}

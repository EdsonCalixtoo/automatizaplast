import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { items, orderId, clientData, paymentMethod, cardData } = body
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    const webhookUrl = "https://cjyqxjykbpbocjcbrsem.supabase.co/functions/v1/mercadopago-webhook";

    if (!accessToken) throw new Error('MERCADOPAGO_ACCESS_TOKEN não está configurado no Supabase');
    if (!orderId) throw new Error('ID do pedido (orderId) ausente');

    const totalPrice = items.reduce((sum: number, item: any) => {
      const price = typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace(/[^\d.,]/g, '').replace('.', '').replace(',', '.'));
      return sum + (isNaN(price) ? 0 : price) * item.quantity;
    }, 0);

    // 1. Caso seja Cartão de Crédito
    if (paymentMethod === 'cartao' && cardData) {
      const response = await fetch('https://api.mercadopago.com/v1/payments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Idempotency-Key': orderId
        },
        body: JSON.stringify({
          transaction_amount: Number(cardData.transaction_amount || totalPrice),
          token: cardData.token,
          description: `Pedido ${orderId} - Automatiza Plast`,
          installments: Number(cardData.installments),
          payment_method_id: cardData.payment_method_id,
          issuer_id: cardData.issuer_id,
          payer: {
            email: cardData.payer.email,
            identification: cardData.payer.identification,
          },
          external_reference: orderId,
          notification_url: webhookUrl,
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(`Erro Mercado Pago (Cartão): ${data.message || JSON.stringify(data)}`);

      return new Response(JSON.stringify({ status: data.status, id: data.id }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
      });
    }

    // 2. Caso seja PIX
    if (paymentMethod === 'pix') {
      const response = await fetch('https://api.mercadopago.com/v1/payments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Idempotency-Key': orderId
        },
        body: JSON.stringify({
          transaction_amount: totalPrice,
          description: `Pedido ${orderId} - Automatiza Plast`,
          payment_method_id: 'pix',
          payer: {
            email: clientData.email,
            first_name: clientData.nome.split(' ')[0],
            identification: {
              type: 'CPF',
              number: clientData.cpf.replace(/\D/g, '')
            }
          },
          external_reference: orderId,
          notification_url: webhookUrl,
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(`Erro Mercado Pago (PIX): ${data.message || JSON.stringify(data)}`);

      return new Response(JSON.stringify({ 
        qr_code: data.point_of_interaction.transaction_data.qr_code,
        qr_code_base64: data.point_of_interaction.transaction_data.qr_code_base64,
        id: data.id
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
      });
    } 
    
    throw new Error('Método de pagamento não reconhecido');

  } catch (error) {
    console.error("Erro na função mercadopago-payment:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

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
    const { items, orderId, clientData, paymentMethod } = await req.json()
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');

    if (!accessToken) throw new Error('MERCADOPAGO_ACCESS_TOKEN is not set');

    const totalPrice = items.reduce((sum: number, item: any) => sum + (Number(item.price) * item.quantity), 0);

    // Se o usuário escolheu PIX direto, geramos um pagamento PIX via API
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
            last_name: clientData.nome.split(' ').slice(1).join(' ') || 'Cliente',
            identification: {
              type: 'CPF',
              number: clientData.cpf.replace(/\D/g, '')
            }
          },
          external_reference: orderId,
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erro ao gerar PIX');

      return new Response(
        JSON.stringify({ 
          payment_type: 'pix',
          qr_code: data.point_of_interaction.transaction_data.qr_code,
          qr_code_base64: data.point_of_interaction.transaction_data.qr_code_base64,
          id: data.id
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    } 
    
    // Caso contrário (Mercado Pago Normal), geramos uma preferência (Checkout Pro)
    else {
      const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map((item: any) => ({
            id: item.id,
            title: item.name,
            quantity: item.quantity,
            unit_price: Number(item.price),
            currency_id: 'BRL',
          })),
          payer: {
            name: clientData.nome,
            email: clientData.email,
            identification: { type: 'CPF', number: clientData.cpf.replace(/\D/g, '') },
          },
          back_urls: {
            success: `${req.headers.get('origin')}/rastreio?orderId=${orderId}`,
            failure: `${req.headers.get('origin')}/checkout`,
            pending: `${req.headers.get('origin')}/rastreio?orderId=${orderId}`,
          },
          auto_return: 'approved',
          external_reference: orderId,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erro ao gerar preferência');

      return new Response(
        JSON.stringify({ payment_type: 'preference', id: data.id, init_point: data.init_point }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})

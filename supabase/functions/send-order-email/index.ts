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
    const { order, items } = await req.json()
    const resendApiKey = Deno.env.get('RESEND_API_KEY')

    if (!resendApiKey) throw new Error('RESEND_API_KEY is not set')

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Automatiza Plast <contato@automatizaplast.com.br>',
        to: [order.client_email],
        subject: `🛒 Pedido Recebido: ${order.id}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #0a1e36; margin-bottom: 5px;">PEDIDO RECEBIDO!</h1>
              <p style="color: #666;">Olá, ${order.client_name.split(' ')[0]}! Seu pedido foi registrado com sucesso.</p>
            </div>

            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
              <h3 style="color: #0a1e36; margin-top: 0; border-bottom: 2px solid #ef4444; display: inline-block;">Detalhes do Pedido</h3>
              <p><strong>ID do Pedido:</strong> ${order.id}</p>
              <p><strong>Método de Pagamento:</strong> ${order.payment_method}</p>
              <p><strong>Endereço:</strong> ${order.address}</p>
            </div>

            <div style="margin-bottom: 30px;">
              <h3 style="color: #0a1e36;">Itens:</h3>
              <ul style="list-style: none; padding: 0;">
                ${items.map((item: any) => `
                  <li style="padding: 10px 0; border-bottom: 1px solid #eee; display: flex; justify-content: space-between;">
                    <span>${item.product_name || item.name} (x${item.quantity})</span>
                    <span style="font-weight: bold;">R$ ${Number(item.price).toFixed(2)}</span>
                  </li>
                `).join('')}
              </ul>
            </div>

            <div style="text-align: center; background-color: #0a1e36; color: white; padding: 20px; border-radius: 10px;">
              <p style="margin: 0; font-size: 14px;"><strong>Total: R$ ${Number(order.total_price).toFixed(2)}</strong></p>
            </div>

            <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #999;">
              <p>Acompanhe seu pedido em nosso site.</p>
              <p>Automatiza Plast - Campinas/SP</p>
            </div>
          </div>
        `,
      }),
    })

    const data = await response.json()
    if (!response.ok) throw new Error(JSON.stringify(data))

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

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
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            </style>
          </head>
          <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Inter', sans-serif;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table role="presentation" width="100%" maxWidth="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 40px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.05);">
                    
                    <!-- Header with Logo -->
                    <tr>
                      <td align="center" style="padding: 40px; background-color: #0a1e36;">
                        <img src="https://cjyqxjykbpbocjcbrsem.supabase.co/storage/v1/object/public/assets/logo.png" alt="Automatiza Plast" width="180" style="display: block;">
                      </td>
                    </tr>

                    <!-- Success Icon & Title -->
                    <tr>
                      <td align="center" style="padding: 40px 40px 20px 40px;">
                        <div style="width: 64px; height: 64px; background-color: #25D3661a; border-radius: 50%; display: inline-block; text-align: center; line-height: 64px; margin-bottom: 24px;">
                           <img src="https://img.icons8.com/color/96/ok--v1.png" width="40" style="vertical-align: middle; padding-bottom: 4px;">
                        </div>
                        <h1 style="color: #0a1e36; font-size: 32px; font-weight: 900; margin: 0; letter-spacing: -1px; text-transform: uppercase;">Pedido Recebido!</h1>
                        <p style="color: #64748b; font-size: 16px; margin: 12px 0 0 0; font-weight: 500;">Olá, ${order.client_name.split(' ')[0]}! Tudo pronto com o seu pedido.</p>
                      </td>
                    </tr>

                    <!-- Order Summary Box -->
                    <tr>
                      <td style="padding: 20px 40px;">
                        <div style="background-color: #f1f5f9; border-radius: 32px; padding: 32px; border: 1px solid #e2e8f0;">
                          <p style="font-size: 10px; font-weight: 900; color: #ef4444; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 16px 0;">Resumo do Pedido</p>
                          
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="font-size: 14px; color: #64748b; padding-bottom: 8px;">Número do Pedido:</td>
                              <td align="right" style="font-size: 14px; color: #0a1e36; font-weight: 700; padding-bottom: 8px;">${order.id}</td>
                            </tr>
                            <tr>
                              <td style="font-size: 14px; color: #64748b;">Status:</td>
                              <td align="right" style="font-size: 10px; color: #f97316; font-weight: 900; background-color: #fff7ed; padding: 2px 8px; border-radius: 99px; text-transform: uppercase;">Aguardando Pagamento</td>
                            </tr>
                          </table>
                        </div>
                      </td>
                    </tr>

                    <!-- Items List -->
                    <tr>
                      <td style="padding: 20px 40px;">
                         <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            ${items.map((item: any) => `
                              <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9;">
                                  <p style="margin: 0; font-size: 14px; font-weight: 700; color: #0a1e36; text-transform: uppercase;">${item.product_name || item.name}</p>
                                  <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">Quantidade: ${item.quantity}</p>
                                </td>
                                <td align="right" style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; font-weight: 900; color: #0a1e36;">
                                  R$ ${Number(item.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </td>
                              </tr>
                            `).join('')}
                            <tr>
                              <td style="padding-top: 24px; font-size: 14px; font-weight: 700; color: #0a1e36; text-transform: uppercase;">Total</td>
                              <td align="right" style="padding-top: 24px; font-size: 24px; font-weight: 900; color: #0a1e36;">
                                R$ ${Number(order.total_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                         </table>
                      </td>
                    </tr>

                    <!-- Action Button -->
                    <tr>
                      <td align="center" style="padding: 40px;">
                        <p style="font-size: 14px; color: #64748b; line-height: 1.6; margin-bottom: 24px; font-weight: 500;">
                          Seu kit em <strong>Plástico ABS de Alta Resistência</strong> entrará no cronograma após a confirmação do pagamento.
                        </p>
                        <a href="${req.headers.get('origin')}/rastreio?orderId=${order.id.replace('#', '')}" style="background-color: #ef4444; color: #ffffff; padding: 20px 40px; border-radius: 20px; text-decoration: none; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; display: inline-block; box-shadow: 0 10px 20px rgba(239, 68, 68, 0.2);">
                          Acompanhar Etapas do Meu Pedido
                        </a>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td align="center" style="padding: 40px; background-color: #f8fafc; border-top: 1px solid #f1f5f9;">
                         <p style="margin: 0; font-size: 12px; color: #94a3b8; font-weight: 500;">Automatiza Plast - Tecnologia Industrial em ABS</p>
                         <p style="margin: 8px 0 0 0; font-size: 12px; color: #94a3b8; font-weight: 500;">Campinas - SP</p>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
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

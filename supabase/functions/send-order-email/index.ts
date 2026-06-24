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
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json()
    const { order, items: initialItems } = body
    
    if (!order) throw new Error("Order data missing");

    // Se itens não vierem no payload, buscamos no banco
    let orderItems = initialItems || [];
    if (orderItems.length === 0) {
      const { data } = await supabase.from('order_items').select('*').eq('order_id', order.id);
      orderItems = data || [];
    }

    const itemsHtml = orderItems.map((item: any) => {
      const rawPrice = item.price || 0;
      const price = typeof rawPrice === 'number' ? rawPrice : parseFloat(String(rawPrice).replace(/[^\d.,]/g, '').replace('.', '').replace(',', '.'));
      const formattedPrice = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(isNaN(price) ? 0 : price);
      
      return `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 12px 0; color: #0a1e36;"><strong>${item.product_name || item.name}</strong> x${item.quantity}</td>
          <td style="padding: 12px 0; text-align: right; color: #0a1e36;">${formattedPrice}</td>
        </tr>
      `;
    }).join('');

    const isPix = order.payment_method?.toLowerCase().includes('pix');
    const paymentDetail = isPix ? 'PIX' : `Cartão final ${order.card_last_4 || '****'}`;

    const vendorEmail = "calixtodossantosedson@gmail.com";
    const customerEmail = order.client_email;

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; border-radius: 24px; overflow: hidden; color: #0a1e36;">
        <!-- Header -->
        <div style="background-color: #0a1e36; padding: 40px; text-align: center;">
          <img src="https://automatizaplast.com.br/logo.png" alt="Automatiza Plast" style="height: 60px; margin-bottom: 20px;" onerror="this.style.display='none'">
          <h1 style="color: #00BAF2; margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 4px; font-weight: 900;">Automatiza Plast</h1>
          <p style="color: #fff; margin-top: 10px; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.8;">Tecnologia Industrial em ABS</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px;">
          <h2 style="font-size: 20px; margin-bottom: 8px;">Olá, ${order.client_name}!</h2>
          <p style="color: #64748b; font-size: 16px; line-height: 1.6;">Recebemos seu pedido <strong>${order.id}</strong>. Abaixo estão os detalhes da sua compra.</p>

          <!-- Status Card -->
          <div style="background-color: #fff; padding: 24px; border-radius: 16px; margin: 32px 0; border: 1px solid #e2e8f0;">
             <p style="text-transform: uppercase; font-size: 10px; font-weight: 900; color: #00BAF2; margin-bottom: 4px; letter-spacing: 1px;">Status Atual</p>
             <p style="font-size: 18px; font-weight: bold; margin: 0;">${order.status || 'Pagamento Aprovado'}</p>
          </div>

          <!-- Items Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <thead>
              <tr style="border-bottom: 2px solid #0a1e36;">
                <th style="padding-bottom: 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: #64748b;">Item</th>
                <th style="padding-bottom: 12px; text-align: right; font-size: 12px; text-transform: uppercase; color: #64748b;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td style="padding-top: 24px; font-size: 14px; text-transform: uppercase; color: #64748b;">Total do Pedido</td>
                <td style="padding-top: 24px; text-align: right; font-size: 24px; font-weight: 900; color: #0a1e36;">${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total_price)}</td>
              </tr>
            </tfoot>
          </table>

          <!-- Details Grid -->
          <div style="background-color: #f1f5f9; padding: 24px; border-radius: 16px; display: grid; gap: 16px;">
            <div>
              <p style="text-transform: uppercase; font-size: 10px; font-weight: 900; color: #64748b; margin-bottom: 4px;">Forma de Pagamento</p>
              <p style="font-size: 14px; font-weight: bold; margin: 0;">${paymentDetail}</p>
            </div>
            <div style="margin-top: 16px;">
              <p style="text-transform: uppercase; font-size: 10px; font-weight: 900; color: #64748b; margin-bottom: 4px;">Entrega para</p>
              <p style="font-size: 14px; font-weight: medium; margin: 0;">${order.address}</p>
            </div>
          </div>

          <!-- Call to Action -->
          <div style="text-align: center; margin-top: 40px;">
            <a href="https://automatizaplast.com.br/rastreio?orderId=${order.id}" style="background-color: #00BAF2; color: #fff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: bold; text-transform: uppercase; font-size: 12px; display: inline-block;">Acompanhar Pedido</a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f1f5f9; padding: 32px; text-align: center; font-size: 12px; color: #94a3b8;">
          <p>Automatiza Plast - Kits em Plástico ABS de Alta Resistência</p>
          <p>Este é um e-mail automático, por favor não responda.</p>
        </div>
      </div>
    `;

    // Destinatários: Cliente e Vendedor (apenas se forem emails válidos)
    const blockedDomains = ['teste.com', 'email.com', 'exemplo.com', 'abc.com', 'test.com'];
    const recipients = [customerEmail, vendorEmail].filter(e => {
      if (!e || typeof e !== 'string' || !e.includes('@')) return false;
      if (e.includes('erro@email.com')) return false;
      const domain = e.split('@')[1]?.toLowerCase();
      if (blockedDomains.includes(domain)) return false;
      return true;
    });

    console.log(`Enviando pedido ${order.id} para destinatários:`, recipients);

    const emailPayload = {
      from: 'Automatiza Plast <contato@automatizaplast.com.br>',
      to: recipients,
      subject: `Novo Pedido: ${order.id} - ${order.client_name || 'Cliente'}`,
      html: htmlContent,
    };

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    })

    const resData = await emailResponse.json()

    return new Response(JSON.stringify({ 
      success: emailResponse.ok, 
      resendResponse: resData 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: emailResponse.ok ? 200 : 400,
    })

  } catch (error: any) {
    console.error("Erro no envio de e-mail:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})


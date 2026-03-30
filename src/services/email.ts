import { Resend } from 'resend';

const resendKey = import.meta.env.VITE_RESEND_API_KEY || '';

export const sendOrderEmail = async (order: any) => {
  if (!resendKey) {
    console.warn("Resend API Key missing. Skipping email.");
    return { success: false, message: "API Key missing" };
  }

  const resend = new Resend(resendKey);

  try {
    const { data, error } = await resend.emails.send({
      from: 'Automatiza Plast <onboarding@resend.dev>',
      to: [order.client_email],
      subject: `Pagamento Aprovado! - Pedido #${order.id.replace('#','')}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #0a1e36; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; border: 1px solid #e2e8f0; border-radius: 40px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
            .header { background-color: #f8fafc; padding: 40px; text-align: center; border-bottom: 1px solid #f1f5f9; }
            .content { padding: 40px; text-align: center; }
            .footer { background-color: #0a1e36; color: white; padding: 30px; text-align: center; font-size: 11px; }
            .status-badge { background-color: #25D36620; color: #25D366; padding: 8px 20px; rounded-radius: 20px; font-weight: 900; text-transform: uppercase; font-size: 10px; border-radius: 100px; display: inline-block; margin-bottom: 20px; }
            .button { background-color: #00BAF2; color: white; padding: 20px 40px; text-decoration: none; border-radius: 16px; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-top: 30px; box-shadow: 0 10px 15px -3px rgba(0, 186, 242, 0.3); }
            .order-info { background-color: #f8fafc; padding: 30px; border-radius: 30px; margin: 30px 0; border: 1px solid #f1f5f9; }
            h1 { font-size: 28px; font-weight: 900; text-transform: uppercase; margin: 0 0 10px 0; color: #0a1e36; }
            p { margin: 10px 0; color: #64748b; font-weight: 500; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://automatizaplast.vercel.app/logo.png" alt="Automatiza Plast" style="height: 60px;">
            </div>
            <div class="content">
              <div class="status-badge">Pagamento Aprovado</div>
              <h1>Olá, ${order.client_name.split(' ')[0]}!</h1>
              <p>Tudo pronto com o seu pedido. Ele já foi recebido e está seguindo para a produção.</p>
              
              <div class="order-info">
                <table style="width: 100%; text-align: left;">
                  <tr>
                    <td style="color: #64748b; font-size: 12px; font-weight: bold; text-transform: uppercase;">Número do Pedido:</td>
                    <td style="text-align: right; font-weight: bold; color: #0a1e36;">${order.id}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; font-size: 12px; font-weight: bold; text-transform: uppercase; padding-top: 10px;">Valor Total:</td>
                    <td style="text-align: right; font-weight: bold; color: #00BAF2; font-size: 18px; padding-top: 10px;">${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total_price)}</td>
                  </tr>
                </table>
              </div>

              <p style="font-size: 14px; line-height: 1.8;">
                Seu kit em <strong>Fibra RTM Industrial</strong> já entrou no nosso cronograma. Você pode acompanhar cada etapa do seu pedido pelo nosso portal.
              </p>

              <a href="https://automatizaplast.vercel.app/rastreio" class="button">Acompanhar Etapas do Meu Pedido</a>
            </div>
            <div class="footer">
              <p style="color: #94a3b8; margin-bottom: 5px;">Automatiza Plast - Kits em Fibra RTM Industrial</p>
              <p style="color: #64748b;">R. Dr. Élton César, 910 – Campinas – SP</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) return { success: false, error };
    return { success: true, data };
  } catch (err) {
    console.error("Resend error:", err);
    return { success: false, error: err };
  }
};

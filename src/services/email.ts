import { Resend } from 'resend';

// NOTE: Sending emails directly from the frontend is NOT recommended for production (security)
// But for MVP/Vercel demonstration, we will use it with an API Key.
// Ideal: Use a Supabase Edge Function to handle this.

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
      subject: `Pedido Confirmado #${order.id} - Automatiza Plast`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #eee;">
          <h1 style="color: #00BAF2; text-transform: uppercase;">Pagamento Aprovado!</h1>
          <p>Olá, <strong>${order.client_name}</strong>!</p>
          <p>Recebemos o pagamento do seu pedido <strong>#${order.id}</strong> com sucesso.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 40px 0;">
          <h3>Detalhes da Entrega</h3>
          <p>${order.address}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 40px 0;">
          <p>Você pode acompanhar o seu pedido clicando no link abaixo:</p>
          <a href="https://automatizaplast.vercel.app/rastreio" style="background: #00BAF2; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Acompanhar Pedido</a>
          <p style="margin-top: 40px; color: #94a3b8; font-size: 12px;">Automatiza Plast - Kits em Fibra RTM Industrial</p>
        </div>
      `,
    });

    if (error) return { success: false, error };
    return { success: true, data };
  } catch (err) {
    console.error("Resend error:", err);
    return { success: false, error: err };
  }
};

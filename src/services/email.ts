export const sendOrderEmail = async (order: any) => {
  // Agora o envio é automático pelo Banco de Dados (Postgres Trigger)
  // Não precisamos mais chamar nada pelo Front-end para evitar erros de CORS.
  console.log("Pedido registrado! O Banco de Dados (Supabase) enviará o e-mail automaticamente via SQL Trigger.");
  return { success: true, message: "E-mail será enviado pelo Gatilho SQL" };
};

import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ShoppingBag, CreditCard, Truck, Send, ShieldCheck, MapPin, Phone, CheckCircle2, Copy, Check, Loader2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";

declare global {
  interface Window {
    MercadoPago: any;
  }
}

interface OrderData {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  client_cpf: string;
  address: string;
  total_price: number;
  payment_method: string;
  transaction_id: string;
  card_last_4?: string;
  status: string;
}

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const [loadingCep, setLoadingCep] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [orderDetails, setOrderDetails] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState<{ qr_code: string; qr_code_base64: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [mp, setMp] = useState<any>(null);
  const [cardBrickController, setCardBrickController] = useState<any>(null);
  const [emailError, setEmailError] = useState("");
  
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    cpf: "",
    telefone: "",
    cep: "",
    rua: "",
    numero: "",
    bairro: "",
    cidade: "",
    uf: "",
    entrega: "entrega",
    pagamento: "cartao"
  });

  // Initialize Mercado Pago
  useEffect(() => {
    const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;
    if (publicKey && window.MercadoPago) {
      const mpInstance = new window.MercadoPago(publicKey, { locale: 'pt-BR' });
      setMp(mpInstance);
    }
  }, []);

  // Initialize Card Brick
  useEffect(() => {
    if (mp && formData.pagamento === 'cartao' && !cardBrickController && !orderPlaced && formData.email) {
      const renderCardBrick = async () => {
        // Pequeno delay para garantir que a Div do container ja foi renderizada pelo React
        const checkExist = setInterval(async () => {
          const container = document.getElementById('cardPaymentBrick_container');
          if (container) {
            clearInterval(checkExist);
            try {
              const bricksBuilder = mp.bricks();
              const settings = {
                initialization: {
                  amount: safeTotalPrice,
                  payer: { email: formData.email },
                },
                customization: {
                  visual: {
                    hideFormSubheadings: true,
                    hidePayerEmail: true,
                    style: {
                      theme: 'flat',
                      customVariables: {
                        borderRadius: '20px',
                        inputBackgroundColor: '#f8fafc',
                      }
                    }
                  },
                  inputs: {
                    payerEmail: {
                      hidden: true
                    }
                  },
                  paymentMethods: { maxInstallments: 12 }
                },
                callbacks: {
                  onReady: () => console.log('Brick ready'),
                  onSubmit: (cardFormData: any) => processCardPayment(cardFormData),
                  onError: (error: any) => console.error('Brick error', error),
                },
              };
              const controller = await bricksBuilder.create('cardPayment', 'cardPaymentBrick_container', settings);
              setCardBrickController(controller);
            } catch (err) {
              console.error("Erro ao criar Brick:", err);
            }
          }
        }, 100);

        // Limpa o intervalo após 5 segundos se não encontrar (timeout de segurança)
        setTimeout(() => clearInterval(checkExist), 5000);
      };
      renderCardBrick();
    }
  }, [mp, formData.pagamento, orderPlaced, formData.email]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setFormData(prev => ({
          ...prev,
          nome: session.user.user_metadata?.full_name || "",
          email: session.user.email || ""
        }));
      }
    };
    fetchUser();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  };

  const safeTotalPrice = useMemo(() => {
    return cart.reduce((sum, item) => {
      let price = 0;
      if (typeof item.price === 'number') price = item.price;
      else price = parseFloat(String(item.price).replace(/[^\d.,]/g, '').replace('.', '').replace(',', '.'));
      return sum + (isNaN(price) ? 0 : price) * item.quantity;
    }, 0);
  }, [cart]);

  const validateEmail = (email: string) => {
    if (!email) {
      setEmailError("E-mail é obrigatório");
      return false;
    }
    
    // Regex completo para validação de formato
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setEmailError("Digite um e-mail válido (ex: nome@dominio.com)");
      return false;
    }

    // Bloqueio de domínios inválidos ou genéricos de teste
    const blockedDomains = ['teste.com', 'email.com', 'example.com', 'abc.com', '123.com', 'test.com', 'mail.com'];
    const domain = email.split('@')[1]?.toLowerCase();
    if (blockedDomains.includes(domain)) {
      setEmailError("Este domínio de e-mail não é aceito. Use um e-mail real.");
      return false;
    }

    // Bloqueio de e-mails específicos conhecidos por testes
    if (email.toLowerCase().includes('erro@email.com') || email.toLowerCase().startsWith('teste@')) {
      setEmailError("Este e-mail é inválido para compras.");
      return false;
    }

    setEmailError("");
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'email') {
      validateEmail(value);
    }
  };

  const handleCepBlur = async () => {
    const cep = formData.cep.replace(/\D/g, '');
    if (cep.length !== 8) return;

    setLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          rua: data.logradouro,
          bairro: data.bairro,
          cidade: data.localidade,
          uf: data.uf
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    } finally {
      setLoadingCep(false);
    }
  };

   const processCardPayment = async (cardFormData: any) => {
    if (!validateEmail(formData.email)) {
      toast.error("Por favor, corrija seu e-mail antes de continuar.");
      return;
    }
    setLoading(true);
    const orderId = `#${Math.floor(100000 + Math.random() * 900000)}`;
    const fullAddress = formData.entrega === 'retirada' 
      ? "Retirada em Loja - Campinas/SP" 
      : `${formData.rua}, ${formData.numero} - ${formData.bairro}, ${formData.cidade} - ${formData.uf}`;

    const orderData: OrderData = {
      id: orderId,
      client_name: formData.nome,
      client_email: formData.email,
      client_phone: formData.telefone,
      client_cpf: formData.cpf,
      address: fullAddress,
      total_price: safeTotalPrice,
      payment_method: 'Cartão de Crédito',
      transaction_id: `AUTO-CARD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      status: 'Aguardando Pagamento'
    };

    try {
      // 1. Salvar no Banco
      await supabase.from('orders').insert([orderData]);
      const itemsToInsert = cart.map(item => ({
        order_id: orderId,
        product_name: item.name,
        quantity: item.quantity,
        price: typeof item.price === 'number' ? item.price : 3300
      }));
      await supabase.from('order_items').insert(itemsToInsert);

      // Enviar e-mail de confirmação (Não bloqueia o fluxo se falhar)
      try {
        await supabase.functions.invoke('send-order-email', {
          body: { order: orderData, items: cart }
        });
      } catch (e) {
        console.warn("Falha no envio do e-mail de confirmação:", e);
      }

      // 2. Processar Pagamento Real
      const { data, error } = await supabase.functions.invoke('mercadopago-payment', {
        body: {
          items: cart,
          orderId: orderId,
          clientData: formData,
          paymentMethod: 'cartao',
          cardData: cardFormData
        }
      });

      if (error || (data && data.error)) throw new Error(error?.message || data?.error || "Erro no pagamento");

      // No Checkout Transparente, tratamos approved e in_process (pending)
      if (data.status === 'approved' || data.status === 'in_process' || data.status === 'pending') {
         // O status amigável será atualizado pelo Webhook, mas aqui já damos um feedback
         const finalStatus = data.status === 'approved' ? 'Pagamento Aprovado' : 'Confirmando Pagamento';
         
         const { error: updateError } = await supabase
           .from('orders')
           .update({ status: finalStatus, mercadopago_payment_id: String(data.id) })
           .eq('id', orderId);

         setOrderDetails({ ...orderData, status: finalStatus });
         setOrderPlaced(true);
         clearCart();
         
         if (data.status === 'approved') {
           toast.success("Pagamento aprovado!");
         } else {
           toast.info("Pagamento em análise pelo Mercado Pago.");
         }
      } else {
         throw new Error("O pagamento foi recusado ou cancelado. Verifique os dados.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message);
      throw err; // Necessário para o Brick mostrar o erro
    } finally {
      setLoading(false);
    }
  }

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.pagamento === 'cartao') {
      // O Brick cuida do submit via callback
      return;
    }
    
    if (!validateEmail(formData.email)) {
      toast.error("Por favor, insira um e-mail válido.");
      return;
    }
    
    setLoading(true);

    const orderId = `#${Math.floor(100000 + Math.random() * 900000)}`;
    const fullAddress = formData.entrega === 'retirada' 
      ? "Retirada em Loja - Campinas/SP" 
      : `${formData.rua}, ${formData.numero} - ${formData.bairro}, ${formData.cidade} - ${formData.uf}`;
    
    const orderData: OrderData = {
      id: orderId,
      client_name: formData.nome,
      client_email: formData.email,
      client_phone: formData.telefone,
      client_cpf: formData.cpf,
      address: fullAddress,
      total_price: safeTotalPrice,
      payment_method: 'PIX Mercado Pago',
      transaction_id: `AUTO-PIX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      status: 'Aguardando Pagamento'
    };

    try {
      await supabase.from('orders').insert([orderData]);
      const itemsToInsert = cart.map(item => ({
        order_id: orderId,
        product_name: item.name,
        quantity: item.quantity,
        price: typeof item.price === 'number' ? item.price : 3300
      }));
      await supabase.from('order_items').insert(itemsToInsert);

      // Enviar e-mail de confirmação (Não bloqueia o fluxo se falhar)
      try {
        await supabase.functions.invoke('send-order-email', {
          body: { order: orderData, items: cart }
        });
      } catch (e) {
        console.warn("Falha no envio do e-mail de confirmação:", e);
      }

      const { data, error } = await supabase.functions.invoke('mercadopago-payment', {
        body: {
          items: cart,
          orderId: orderId,
          clientData: formData,
          paymentMethod: 'pix'
        }
      });

      if (error) throw error;

      if (data?.qr_code) {
        // Salvar o ID do pagamento para o webhook identificar depois
        await supabase
          .from('orders')
           .update({ mercadopago_payment_id: String(data.id) })
           .eq('id', orderId);

        setPixData({ qr_code: data.qr_code, qr_code_base64: data.qr_code_base64 });
        setOrderDetails(orderData);
        setOrderPlaced(true);
        clearCart();
      }

    } catch (error: any) {
      console.error(error);
      alert("Erro ao processar pedido: " + (error.message || "Verifique sua conexão"));
    } finally {
      setLoading(false);
    }
  };

  const copyPix = () => {
    if (pixData?.qr_code) {
      navigator.clipboard.writeText(pixData.qr_code);
      setCopied(true);
      toast.success("Código PIX copiado!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const EmailPreview = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0a1e36]/90 backdrop-blur-md animate-in fade-in duration-500">
      <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center justify-between">
           <div className="flex items-center gap-2">
             <div className="w-3 h-3 rounded-full bg-red-400"></div>
             <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
             <div className="w-3 h-3 rounded-full bg-green-400"></div>
           </div>
           <span className="text-[10px] font-black uppercase text-slate-400">Preview: E-mail de Confirmação</span>
           <button onClick={() => setShowEmailPreview(false)} className="text-slate-400 hover:text-primary">✕</button>
        </div>
        
        <div className="p-12 overflow-y-auto text-[#0a1e36]">
           <div className="text-center mb-12">
              <div className="bg-[#0a1e36] p-6 rounded-2xl inline-block mb-8">
                 <img src="/logo.png" className="h-12 mx-auto" />
              </div>
              <div className="w-16 h-16 bg-[#25D366]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-[#25D366]" />
              </div>
              <h2 className="text-3xl font-black uppercase" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>PEDIDO RECEBIDO!</h2>
              <p className="text-muted-foreground mt-2 font-medium">Olá, {formData.nome.split(' ')[0]}! Tudo pronto com o seu pedido.</p>
           </div>

           <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 mb-10">
              <h4 className="text-[10px] font-black uppercase text-primary tracking-widest mb-4">Resumo do Pedido</h4>
              <div className="space-y-4">
                 <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Número do Pedido:</span>
                    <span className="font-bold">{orderDetails?.id || "#884210"}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Status:</span>
                    <span className="text-orange-500 font-black uppercase text-[10px] bg-orange-50 px-2 py-0.5 rounded-full">Aguardando Pagamento</span>
                 </div>
              </div>
           </div>

           <div className="space-y-6 text-center">
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                Seu kit em **Plástico ABS de Alta Resistência** entrará no cronograma após a confirmação do pagamento.
                Você pode acompanhar cada etapa pelo nosso portal do cliente.
              </p>
              <Link to="/rastreio" className="inline-block bg-primary text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-primary/20 hover:scale-105 transition-all">
                Acompanhar Etapas do Meu Pedido
              </Link>
           </div>
        </div>
      </div>
    </div>
  );

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        {showEmailPreview && <EmailPreview />}
        
        <div className="max-w-2xl w-full bg-white p-16 rounded-[50px] shadow-2xl border border-slate-100 relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
          
          <div className="w-24 h-24 bg-[#25D366]/10 rounded-full flex items-center justify-center mb-10 mx-auto">
            <CheckCircle2 className="w-12 h-12 text-[#25D366] animate-in zoom-in duration-500" />
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-black uppercase mb-4 tracking-tighter text-[#0a1e36]" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
            MUITO <span className="text-primary">OBRIGADO!</span>
          </h1>
          
          <p className="text-slate-500 font-medium text-lg mb-10 max-w-md mx-auto">
            Seu pedido <strong className="text-[#0a1e36]">{orderDetails?.id}</strong> foi registrado. 
            Acabamos de enviar uma confirmação detalhada para seu e-mail.
          </p>
          
          {pixData && (
            <div className="mb-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
               <div className="p-8 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
                  <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-6">Escaneie o QR Code abaixo</p>
                  <img src={`data:image/png;base64,${pixData.qr_code_base64}`} alt="QR Code PIX" className="w-48 h-48 mx-auto rounded-2xl shadow-lg bg-white p-2" />
                  
                  <div className="mt-8">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Pix Copia e Cola</p>
                    <button 
                      onClick={copyPix}
                      className="w-full h-16 bg-white border border-slate-100 rounded-2xl px-6 flex items-center justify-between hover:border-primary transition-all group shadow-sm"
                    >
                      <span className="text-xs font-bold truncate mr-4 text-slate-500">{pixData.qr_code}</span>
                      {copied ? <Check className="w-6 h-6 text-[#25D366]" /> : <Copy className="w-6 h-6 text-slate-300 group-hover:text-primary" />}
                    </button>
                  </div>
               </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4 pt-6">
             <button onClick={() => setShowEmailPreview(true)} className="bg-slate-50 text-[#0a1e36] h-20 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-all border border-slate-100 flex items-center justify-center gap-3">
               <Send className="w-4 h-4 text-primary" /> Preview do E-mail
             </button>
             <Link to={`/rastreio?orderId=${orderDetails?.id}`} className="bg-primary text-white h-20 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-primary/20 hover:scale-105 transition-all flex items-center justify-center gap-3">
               Acompanhar Etapas <ChevronLeft className="w-4 h-4 rotate-180" />
             </Link>
          </div>

          <p className="mt-12 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Automatiza Plast - Tecnologia Industrial em ABS
          </p>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mb-8">
          <ShoppingBag className="w-10 h-10 text-muted-foreground opacity-20" />
        </div>
        <h1 className="text-4xl font-black uppercase mb-4" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Seu carrinho está vazio</h1>
        <p className="text-muted-foreground mb-10 max-w-xs">Escolha suas saias laterais antes de finalizar o pedido.</p>
        <Link to="/" className="btn-primary">Ver Catálogo</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar />
      <Navbar />

      <main className="container mx-auto px-6 py-10 lg:py-16">
        <div className="max-w-6xl mx-auto">
          {/* Brand Header */}
          <div className="text-center mb-16 space-y-6">
            <Link to="/" className="inline-block transition-all hover:scale-105 duration-500 bg-[#0a1e36] p-8 rounded-[40px] shadow-2xl">
              <img src="/logo.png" alt="Automatiza Plast" className="h-32 md:h-48 w-auto object-contain" />
            </Link>
          </div>

          <div className="grid lg:grid-cols-12 gap-12 items-start">
            {/* Middle: Forms */}
            <div className="lg:col-span-7 space-y-12 bg-white p-10 lg:p-14 rounded-[40px] shadow-2xl shadow-slate-200 border border-border">
              <form onSubmit={handlePurchase} className="space-y-12">
                <section className="space-y-8">
                  <div className="flex items-center gap-4">
                    <span className="text-primary font-black text-2xl" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>01.</span>
                    <h3 className="font-black translate-y-[2px] uppercase text-2xl text-[#0a1e36]" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Seus Dados</h3>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2 space-y-2">
                       <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Nome Completo</Label>
                       <Input name="nome" value={formData.nome} onChange={handleInputChange} required className="h-16 rounded-2xl bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-primary transition-all text-lg font-medium" />
                    </div>
                     <div className="space-y-2">
                       <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">E-mail</Label>
                       <Input 
                         name="email" 
                         type="text" // Mudado para text para evitar validação nativa que às vezes conflita
                         value={formData.email} 
                         onChange={handleInputChange} 
                         onBlur={(e) => validateEmail(e.target.value)}
                         placeholder="exemplo@gmail.com"
                         required 
                         className={`h-16 rounded-2xl bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-primary transition-all text-lg font-medium ${emailError ? 'border-red-500 bg-red-50 focus-visible:ring-red-200' : ''}`} 
                       />
                       {emailError && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest ml-1 animate-in fade-in slide-in-from-top-1">{emailError}</p>}
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">WhatsApp / Telefone</Label>
                       <Input name="telefone" value={formData.telefone} onChange={handleInputChange} required className="h-16 rounded-2xl bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-primary transition-all text-lg font-medium" placeholder="(00) 00000-0000" />
                    </div>
                    <div className="sm:col-span-2 space-y-2">
                       <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">CPF ou CNPJ</Label>
                       <Input name="cpf" value={formData.cpf} onChange={handleInputChange} required className="h-16 rounded-2xl bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-primary transition-all text-lg font-medium" />
                    </div>
                  </div>
                </section>

                <section className="space-y-8">
                  <div className="flex items-center gap-4">
                    <span className="text-primary font-black text-2xl" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>02.</span>
                    <h3 className="font-black translate-y-[2px] uppercase text-2xl text-[#0a1e36]" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Entrega</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, entrega: 'entrega' }))}
                      className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${formData.entrega === 'entrega' ? 'border-primary bg-primary/5' : 'border-slate-100 bg-slate-50'}`}
                    >
                      <Truck className={`w-8 h-8 ${formData.entrega === 'entrega' ? 'text-primary' : 'text-slate-400'}`} />
                      <span className="font-black uppercase tracking-widest text-[10px]">Enviar por Transportadora</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, entrega: 'retirada' }))}
                      className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${formData.entrega === 'retirada' ? 'border-primary bg-primary/5' : 'border-slate-100 bg-slate-50'}`}
                    >
                      <MapPin className={`w-8 h-8 ${formData.entrega === 'retirada' ? 'text-primary' : 'text-slate-400'}`} />
                      <span className="font-black uppercase tracking-widest text-[10px]">Retirada em Loja</span>
                    </button>
                  </div>
                  
                  {formData.entrega === 'entrega' && (
                    <div className="space-y-6">
                      <div className="grid sm:grid-cols-3 gap-6">
                        <div className="sm:col-span-1 space-y-2">
                           <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">CEP</Label>
                           <Input name="cep" value={formData.cep} onChange={handleInputChange} onBlur={handleCepBlur} required className="h-16 rounded-2xl bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-primary transition-all text-lg font-bold text-center" />
                        </div>
                        <div className="sm:col-span-2 space-y-2">
                           <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Cidade / UF</Label>
                           <Input name="cidade" value={formData.cidade ? `${formData.cidade} - ${formData.uf}` : ''} readOnly className="h-16 rounded-2xl bg-slate-100 border-transparent text-lg font-medium" />
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-4 gap-6">
                        <div className="sm:col-span-3 space-y-2">
                             <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Rua / Logradouro</Label>
                             <Input name="rua" value={formData.rua} onChange={handleInputChange} required className="h-16 rounded-2xl bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-primary transition-all text-lg font-medium" />
                        </div>
                        <div className="sm:col-span-1 space-y-2">
                             <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Nº</Label>
                             <Input name="numero" value={formData.numero} onChange={handleInputChange} required className="h-16 rounded-2xl bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-primary transition-all text-lg font-medium" />
                        </div>
                      </div>
                      <div className="space-y-2">
                           <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Bairro</Label>
                           <Input name="bairro" value={formData.bairro} onChange={handleInputChange} required className="h-16 rounded-2xl bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-primary transition-all text-lg font-medium" />
                      </div>
                    </div>
                  )}
                </section>

                <section className="space-y-8">
                  <div className="flex items-center gap-4">
                    <span className="text-primary font-black text-2xl" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>03.</span>
                    <h3 className="font-black translate-y-[2px] uppercase text-2xl text-[#0a1e36]" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Pagamento</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, pagamento: 'cartao' }))}
                      className={`p-8 rounded-3xl border-2 transition-all flex flex-col items-center gap-4 ${formData.pagamento === 'cartao' ? 'border-primary bg-primary/5' : 'border-slate-100 bg-slate-50'}`}
                    >
                       <div className="flex flex-col items-center text-center">
                          <CreditCard className={`w-10 h-10 mb-2 ${formData.pagamento === 'cartao' ? 'text-primary' : 'text-slate-400'}`} />
                          <span className="font-black uppercase tracking-widest text-xs">Cartão de Crédito</span>
                          <span className="text-[10px] text-muted-foreground mt-1">Até 5x Sem Juros</span>
                       </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, pagamento: 'pix' }))}
                      className={`p-8 rounded-3xl border-2 transition-all flex flex-col items-center gap-4 ${formData.pagamento === 'pix' ? 'border-[#25D366] bg-[#25D366]/5' : 'border-slate-100 bg-slate-50'}`}
                    >
                       <div className="flex flex-col items-center text-center">
                          <div className={`font-black text-2xl mb-1 ${formData.pagamento === 'pix' ? 'text-[#25D366]' : 'text-slate-400'}`}>PIX</div>
                          <span className="font-black uppercase tracking-widest text-xs">PIX Instantâneo</span>
                          <span className="text-[10px] text-muted-foreground mt-1">Desconto Progressivo</span>
                       </div>
                    </button>
                  </div>

                  {formData.pagamento === 'cartao' && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                      {!formData.email ? (
                        <div className="bg-slate-50 p-8 rounded-3xl border border-dashed border-slate-200 text-center space-y-3">
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Aguardando dados de contato</p>
                          <p className="text-xs text-slate-500 font-medium">Por favor, preencha o seu **Nome** e **E-mail** acima para desbloquear o pagamento com cartão.</p>
                        </div>
                      ) : (
                        <div id="cardPaymentBrick_container" className="bg-slate-50 p-6 rounded-3xl border border-slate-100"></div>
                      )}
                      <p className="text-[10px] text-center text-muted-foreground mt-4 font-medium uppercase tracking-widest">
                        🛡️ Pagamento processado com segurança pelo Mercado Pago
                      </p>
                    </div>
                  )}
                </section>

                {formData.pagamento !== 'cartao' && (
                  <Button type="submit" disabled={loading} className="w-full h-24 text-2xl font-black uppercase tracking-widest rounded-3xl bg-primary hover:shadow-2xl hover:shadow-primary/30 transition-all">
                    {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : "Finalizar Pedido"}
                  </Button>
                )}
              </form>
            </div>

            {/* Right: Summary */}
            <div className="lg:col-span-5 lg:sticky lg:top-32 space-y-8">
              <div className="bg-[#0a1e36] text-white rounded-[40px] p-10 shadow-2xl">
                <h3 className="text-3xl font-black uppercase mb-10 pb-6 border-b border-white/5 flex justify-between items-center" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                  Seu Carrinho
                  <ShoppingBag className="w-6 h-6 text-primary" />
                </h3>

                <div className="space-y-6 mb-10">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4 items-center">
                       <div className="w-16 h-16 bg-white/5 rounded-xl border border-white/10 overflow-hidden shrink-0">
                          <img src={item.image} className="w-full h-full object-cover" />
                       </div>
                       <div className="flex-1">
                          <p className="font-bold text-sm uppercase truncate">{item.name}</p>
                          <p className="text-primary font-black">{formatPrice(typeof item.price === 'number' ? item.price : 0)}</p>
                       </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 pt-6 border-t border-white/5">
                   <div className="flex justify-between text-slate-400 text-[10px] uppercase font-black tracking-widest">
                      <span>Total dos itens</span>
                      <span>{formatPrice(safeTotalPrice)}</span>
                   </div>
                   <div className="flex justify-between text-3xl font-black pt-4 border-t border-white/10">
                      <span className="uppercase text-sm self-center">Total</span>
                      <span>{formatPrice(safeTotalPrice)}</span>
                   </div>
                   
                   {formData.pagamento === 'cartao' && (
                     <div className="bg-primary/10 p-4 rounded-xl mt-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary text-center">
                          Simulação de Parcelas: 5x de {formatPrice(safeTotalPrice / 5)} sem juros
                        </p>
                     </div>
                   )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;

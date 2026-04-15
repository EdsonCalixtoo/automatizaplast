import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ShoppingBag, CreditCard, Truck, Send, ShieldCheck, MapPin, Phone, CheckCircle2, Copy, Check } from "lucide-react";
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
    pagamento: "mercadopago"
  });

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const orderId = `#${Math.floor(100000 + Math.random() * 900000)}`;
    const fullAddress = formData.entrega === 'retirada' 
      ? "Retirada em Loja - Campinas/SP" 
      : `${formData.rua}, ${formData.numero} - ${formData.bairro}, ${formData.cidade} - ${formData.uf}`;
    
    const finalPrice = safeTotalPrice;

    const orderData: OrderData = {
      id: orderId,
      client_name: formData.nome,
      client_email: formData.email,
      client_phone: formData.telefone,
      client_cpf: formData.cpf,
      address: fullAddress,
      total_price: finalPrice,
      payment_method: formData.pagamento === 'mercadopago' ? 'Mercado Pago (Cartão/Outros)' : 'PIX Mercado Pago',
      transaction_id: `AUTO-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      status: 'Aguardando Pagamento'
    };


    try {
      // 1. Salvar Pedido no Supabase
      const { error: orderError } = await supabase
        .from('orders')
        .insert([orderData]);

      if (orderError) throw orderError;

      // 2. Salvar Itens do Pedido
      const itemsToInsert = cart.map(item => ({
        order_id: orderId,
        product_name: item.name,
        quantity: item.quantity,
        price: typeof item.price === 'number' ? item.price : 3300
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      // 3. Processar Pagamento via Edge Function
      const { data, error } = await supabase.functions.invoke('mercadopago-payment', {
        body: {
          items: cart,
          orderId: orderId,
          clientData: formData,
          paymentMethod: formData.pagamento
        }
      });

      if (error) throw error;

      if (formData.pagamento === 'pix' && data?.qr_code) {
        setPixData({
          qr_code: data.qr_code,
          qr_code_base64: data.qr_code_base64
        });
        setOrderDetails(orderData);
        setOrderPlaced(true);
        clearCart();
      } else if (data?.init_point) {
        window.location.href = data.init_point;
        return;
      } else {
        throw new Error("Falha ao gerar pagamento.");
      }

    } catch (error: any) {
      console.error("Erro no processamento:", error);
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
        
        <div className="p-12 overflow-y-auto">
           <div className="text-center mb-12">
              <div className="bg-[#0a1e36] p-6 rounded-2xl inline-block mb-8">
                 <img src="/logo.png" className="h-12 mx-auto" />
              </div>
              <div className="w-16 h-16 bg-[#25D366]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-[#25D366]" />
              </div>
              <h2 className="text-3xl font-black text-[#0a1e36]" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>PEDIDO RECEBIDO!</h2>
              <p className="text-muted-foreground mt-2 font-medium">Olá, {formData.nome.split(' ')[0]}! Tudo pronto com o seu pedido.</p>
           </div>

           <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 mb-10">
              <h4 className="text-[10px] font-black uppercase text-primary tracking-widest mb-4">Resumo do Pedido</h4>
              <div className="space-y-4">
                 <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Número do Pedido:</span>
                    <span className="font-bold text-[#0a1e36]">{orderDetails?.id || "#884210"}</span>
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
        
        <div className="max-w-xl w-full bg-white p-12 rounded-[40px] shadow-2xl border border-slate-100">
          <div className="w-24 h-24 bg-[#25D366]/10 rounded-full flex items-center justify-center mb-10 animate-bounce mx-auto">
            <CheckCircle2 className="w-12 h-12 text-[#25D366]" />
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-black uppercase mb-4 tracking-tighter text-[#0a1e36]" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
            Pedido <span className="text-[#25D366]">Registrado!</span>
          </h1>
          
          {pixData ? (
            <div className="mt-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
               <div className="p-8 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
                  <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-6">Escaneie o QR Code abaixo</p>
                  <img src={`data:image/png;base64,${pixData.qr_code_base64}`} alt="QR Code PIX" className="w-48 h-48 mx-auto rounded-xl shadow-lg bg-white p-2" />
                  
                  <div className="mt-8">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Pix Copia e Cola</p>
                    <button 
                      onClick={copyPix}
                      className="w-full h-14 bg-white border border-slate-200 rounded-xl px-4 flex items-center justify-between hover:bg-slate-50 transition-all group"
                    >
                      <span className="text-xs font-bold truncate mr-4 text-slate-500">{pixData.qr_code}</span>
                      {copied ? <Check className="w-5 h-5 text-[#25D366]" /> : <Copy className="w-5 h-5 text-slate-400 group-hover:text-primary" />}
                    </button>
                  </div>
               </div>
               
               <div className="space-y-4">
                 <p className="text-sm text-muted-foreground font-medium">Após o pagamento, o pedido será aprovado instantaneamente.</p>
                 <Link to={`/rastreio?orderId=${orderDetails?.id}`} className="block w-full bg-primary text-white py-6 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                   Ver Status do Pedido
                 </Link>
               </div>
            </div>
          ) : (
            <>
              <p className="text-muted-foreground mb-12 text-lg">Obrigado pela preferência! Acabamos de enviar uma confirmação para seu e-mail.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                 <button onClick={() => setShowEmailPreview(true)} className="bg-slate-100 text-[#0a1e36] px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all border border-slate-200">
                   Preview do E-mail
                 </button>
                 <Link to={`/rastreio?orderId=${orderDetails?.id}`} className="bg-primary text-white px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-primary/20 hover:scale-105 transition-all">
                   Acompanhar Pedido
                 </Link>
              </div>
            </>
          )}
          
          <Link to="/" className="mt-12 inline-block text-[10px] font-black uppercase text-slate-400 hover:text-primary tracking-widest transition-all">Sair para a Loja</Link>
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
                       <Input name="email" type="email" value={formData.email} onChange={handleInputChange} required className="h-16 rounded-2xl bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-primary transition-all text-lg font-medium" />
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
                      onClick={() => setFormData(prev => ({ ...prev, pagamento: 'mercadopago' }))}
                      className={`p-8 rounded-3xl border-2 transition-all flex flex-col items-center gap-4 ${formData.pagamento === 'mercadopago' ? 'border-primary bg-primary/5' : 'border-slate-100 bg-slate-50'}`}
                    >
                       <div className="flex flex-col items-center text-center">
                          <CreditCard className={`w-10 h-10 mb-2 ${formData.pagamento === 'mercadopago' ? 'text-primary' : 'text-slate-400'}`} />
                          <span className="font-black uppercase tracking-widest text-xs">Mercado Pago</span>
                          <span className="text-[10px] text-muted-foreground mt-1">Cartão ou Outros (via MP)</span>
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
                          <span className="text-[10px] text-muted-foreground mt-1">QR Code Gerado Agora</span>
                       </div>
                    </button>
                  </div>
                </section>

                <Button type="submit" disabled={loading} className="w-full h-24 text-2xl font-black uppercase tracking-widest rounded-3xl bg-primary hover:shadow-2xl hover:shadow-primary/30 transition-all">
                  {loading ? "Processando..." : "Finalizar Pedido"}
                </Button>
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

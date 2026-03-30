import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ShoppingBag, CreditCard, Truck, Send, ShieldCheck, MapPin, Phone, CheckCircle2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { supabase } from "@/lib/supabase";
import { sendOrderEmail } from "@/services/email";

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
    pagamento: "pix",
    cardNome: "",
    cardNumero: "",
    cardValidade: "",
    cardCVV: ""
  });

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
    
    const finalPrice = formData.pagamento === 'pix' ? safeTotalPrice * 0.95 : safeTotalPrice;

    const orderData: OrderData = {
      id: orderId,
      client_name: formData.nome,
      client_email: formData.email,
      client_phone: formData.telefone,
      client_cpf: formData.cpf,
      address: fullAddress,
      total_price: finalPrice,
      payment_method: formData.pagamento,
      transaction_id: `TRX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      card_last_4: formData.pagamento === 'cartao' ? formData.cardNumero.slice(-4) : undefined,
      status: 'Pagamento Aprovado'
    };

    try {
      const { error: orderError } = await supabase
        .from('orders')
        .insert([orderData]);

      if (orderError) throw orderError;

      const itemsToInsert = cart.map(item => ({
        order_id: orderId,
        product_name: item.name,
        quantity: item.quantity,
        price: typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace(/[^\d.,]/g, '').replace('.', '').replace(',', '.'))
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      // Real email attempt
      await sendOrderEmail(orderData);

      setOrderDetails(orderData);
      setOrderPlaced(true);
      clearCart();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      console.error("Erro ao processar pedido:", error);
      alert("Houve um erro ao processar seu pedido: " + (error.message || "Erro desconhecido"));
    } finally {
      setLoading(false);
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
              <img src="/logo.png" className="h-16 mx-auto mb-8" />
              <div className="w-16 h-16 bg-[#25D366]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-[#25D366]" />
              </div>
              <h2 className="text-3xl font-black text-[#0a1e36]" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>PAGAMENTO APROVADO!</h2>
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
                    <span className="text-[#25D366] font-black uppercase text-[10px] bg-[#25D366]/10 px-2 py-0.5 rounded-full">Aprovado</span>
                 </div>
              </div>
           </div>

           <div className="space-y-6 text-center">
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                Seu kit em **Fibra RTM Industrial** já entrou no nosso cronograma de produção.
                Você pode acompanhar cada etapa do seu pedido pelo nosso portal do cliente.
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
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        {showEmailPreview && <EmailPreview />}
        <div className="w-32 h-32 bg-[#25D366]/10 rounded-full flex items-center justify-center mb-10 animate-bounce">
          <CheckCircle2 className="w-16 h-16 text-[#25D366]" />
        </div>
        <h1 className="text-5xl lg:text-7xl font-black uppercase mb-6 tracking-tighter text-[#0a1e36]" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Pedido <span className="text-[#25D366]">Recebido!</span></h1>
        <p className="text-muted-foreground mb-12 max-w-md text-lg">Obrigado pela preferência! Acabamos de enviar uma confirmação para seu e-mail.</p>
        
        <div className="flex flex-col sm:flex-row gap-4">
           <button onClick={() => setShowEmailPreview(true)} className="bg-slate-100 text-[#0a1e36] px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all border border-slate-200">
             Simular Recebimento de E-mail
           </button>
           <Link to="/rastreio" className="bg-primary text-white px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-primary/20 hover:scale-105 transition-all">
             Acompanhar meu Pedido
           </Link>
        </div>
        <Link to="/" className="mt-10 text-[10px] font-black uppercase text-slate-400 hover:text-primary tracking-widest transition-all">Sair para a Loja</Link>
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
            <Link to="/" className="inline-block transition-all hover:scale-105 duration-500">
              <img src="/logo.png" alt="Automatiza Plast" className="h-40 md:h-56 w-auto object-contain" />
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
                      <span className="font-black uppercase tracking-widest text-[10px]">Envio / Entrega</span>
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

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, pagamento: 'pix' }))}
                      className={`p-8 rounded-3xl border-2 transition-all flex flex-col items-center gap-4 ${formData.pagamento === 'pix' ? 'border-[#25D366] bg-[#25D366]/5' : 'border-slate-100 bg-slate-50'}`}
                    >
                       <span className="font-black text-2xl text-[#25D366]">PIX</span>
                       <span className="font-black uppercase tracking-widest text-[10px]">Pague agora com 5% OFF</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, pagamento: 'cartao' }))}
                      className={`p-8 rounded-3xl border-2 transition-all flex flex-col items-center gap-4 ${formData.pagamento === 'cartao' ? 'border-primary bg-primary/5' : 'border-slate-100 bg-slate-50'}`}
                    >
                      <CreditCard className={`w-10 h-10 ${formData.pagamento === 'cartao' ? 'text-primary' : 'text-slate-400'}`} />
                      <span className="font-black uppercase tracking-widest text-[10px]">Cartão de Crédito</span>
                    </button>
                  </div>

                  {formData.pagamento === 'cartao' && (
                    <div className="space-y-6 pt-6">
                       <Input name="cardNome" placeholder="Nome no cartão" value={formData.cardNome} onChange={handleInputChange} required className="h-14" />
                       <Input name="cardNumero" placeholder="0000 0000 0000 0000" value={formData.cardNumero} onChange={handleInputChange} required className="h-14" />
                       <div className="grid grid-cols-2 gap-4">
                          <Input name="cardValidade" placeholder="MM/AA" value={formData.cardValidade} onChange={handleInputChange} required className="h-14" />
                          <Input name="cardCVV" placeholder="CVV" value={formData.cardCVV} onChange={handleInputChange} required className="h-14" />
                       </div>
                    </div>
                  )}
                </section>

                <Button type="submit" disabled={loading} className="w-full h-24 text-2xl font-black uppercase tracking-widest rounded-3xl bg-primary hover:shadow-2xl hover:shadow-primary/30 transition-all">
                  {loading ? "Processando..." : "Finalizar e Pagar Bruto"}
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
                      <span>{formatPrice(formData.pagamento === 'pix' ? safeTotalPrice * 0.95 : safeTotalPrice)}</span>
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

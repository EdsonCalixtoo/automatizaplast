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

const Checkout = () => {
  const { cart, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: "",
    whatsapp: "",
    cep: "",
    endereco: "",
    cidade: "",
    estado: "",
    modeloCaminhao: "",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct WhatsApp message
    const cartItems = cart.map(item => `- ${item.quantity}x ${item.name} (${formatPrice(Number(item.price))})`).join('\n');
    const message = `*PEDIDO OFICIAL - AUTOMATIZA PLAST*\n\n` +
      `*CLIENTE:* ${formData.nome}\n` +
      `*WHATSAPP:* ${formData.whatsapp}\n` +
      `*CAMINHÃO:* ${formData.modeloCaminhao}\n\n` +
      `*ENDEREÇO DE ENTREGA:*\n${formData.endereco}, ${formData.cidade}-${formData.estado}\nCEP: ${formData.cep}\n\n` +
      `*ITENS DO PEDIDO:*\n${cartItems}\n\n` +
      `*TOTAL:* ${formatPrice(safeTotalPrice)}\n\n` +
      `_Estou enviando este pedido para cálculo de frete e finalização do pagamento._`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/5519983986895?text=${encodedMessage}`, '_blank');
  };

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
            <div className="flex items-center justify-center gap-2 text-primary font-black uppercase tracking-[0.3em] text-[10px]">
              <div className="h-px w-10 bg-primary/20" />
              Finalização de Pedido
              <div className="h-px w-10 bg-primary/20" />
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-slate-200 pb-10">
            <div className="space-y-4">
              <Link to="/#produtos" className="inline-flex items-center gap-2 text-primary hover:gap-3 transition-all font-black uppercase tracking-widest text-[10px]">
                <ChevronLeft className="w-4 h-4" />
                Continuar Comprando
              </Link>
              <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter text-[#0a1e36]" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                Detalhes da <span className="text-primary italic">Entrega</span>
              </h1>
            </div>
            <div className="hidden md:flex gap-4">
              <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
                <ShieldCheck className="w-6 h-6 text-[#25D366]" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#0a1e36]">Segurança</span>
                  <span className="text-[9px] font-bold text-muted-foreground">Ambiente Protegido</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: Flow */}
            <div className="lg:col-span-1 hidden lg:flex flex-col items-center gap-4 py-8">
               <div className="w-10 h-10 rounded-full bg-[#0a1e36] text-white flex items-center justify-center font-black">1</div>
               <div className="w-px h-24 bg-border" />
               <div className="w-10 h-10 rounded-full bg-border text-muted-foreground flex items-center justify-center font-black">2</div>
               <div className="w-px h-24 bg-border" />
               <div className="w-10 h-10 rounded-full bg-border text-muted-foreground flex items-center justify-center font-black">3</div>
            </div>

            {/* Middle: Forms */}
            <div className="lg:col-span-6 space-y-12 bg-white p-10 lg:p-14 rounded-[40px] shadow-2xl shadow-slate-200 border border-border">
              <form onSubmit={handleSubmit} className="space-y-10">
                {/* Step 1 */}
                <section className="space-y-8">
                  <div className="flex items-center gap-4">
                    <span className="text-primary font-black text-2xl" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>01.</span>
                    <h3 className="font-black translate-y-[2px] uppercase text-2xl text-[#0a1e36]" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Seus Dados</h3>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Nome Completo</Label>
                       <Input name="nome" value={formData.nome} onChange={handleInputChange} required className="h-16 rounded-2xl bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-primary focus-visible:border-primary transition-all text-lg font-medium" />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">WhatsApp de Contato</Label>
                       <Input name="whatsapp" value={formData.whatsapp} onChange={handleInputChange} required className="h-16 rounded-2xl bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-primary focus-visible:border-primary transition-all text-lg font-medium" />
                    </div>
                  </div>
                </section>

                {/* Step 2 */}
                <section className="space-y-8">
                  <div className="flex items-center gap-4">
                    <span className="text-primary font-black text-2xl" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>02.</span>
                    <h3 className="font-black translate-y-[2px] uppercase text-2xl text-[#0a1e36]" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Localização do Bruto</h3>
                  </div>
                  
                  <div className="grid sm:grid-cols-3 gap-6">
                    <div className="sm:col-span-1 space-y-2">
                       <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">CEP</Label>
                       <Input name="cep" value={formData.cep} onChange={handleInputChange} required className="h-16 rounded-2xl bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-primary transition-all text-lg font-medium text-center" />
                    </div>
                    <div className="sm:col-span-2 space-y-2">
                       <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Cidade</Label>
                       <Input name="cidade" value={formData.cidade} onChange={handleInputChange} required className="h-16 rounded-2xl bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-primary transition-all text-lg font-medium" placeholder="Ex: Campinas" />
                    </div>
                  </div>
                  <div className="space-y-2">
                       <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Endereço Completo</Label>
                       <Input name="endereco" value={formData.endereco} onChange={handleInputChange} required className="h-16 rounded-2xl bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-primary transition-all text-lg font-medium" placeholder="Rua, número, bairro..." />
                  </div>
                </section>

                {/* Step 3 */}
                <section className="space-y-8">
                  <div className="flex items-center gap-4">
                    <span className="text-primary font-black text-2xl" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>03.</span>
                    <h3 className="font-black translate-y-[2px] uppercase text-2xl text-[#0a1e36]" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Caminhão</h3>
                  </div>
                  <div className="space-y-2">
                       <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Modelo do Caminhão para Encaixe</Label>
                       <select name="modeloCaminhao" value={formData.modeloCaminhao} onChange={handleInputChange} required className="w-full h-16 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all text-lg font-medium px-6">
                         <option value="">Selecione seu bruto...</option>
                         <option value="Scania NTG">Scania NTG</option>
                         <option value="Volvo FH">Volvo FH 2022+</option>
                         <option value="Mercedes Actros">Mercedes Actros</option>
                         <option value="Iveco S-Way">Iveco S-Way</option>
                         <option value="DAF XF">DAF XF</option>
                         <option value="VW Constellation">VW Constellation</option>
                         <option value="Outro">Outro Modelo</option>
                       </select>
                  </div>
                </section>

                <div className="pt-10 border-t border-border mt-10">
                  <Button type="submit" className="w-full h-24 text-2xl font-black uppercase tracking-widest shadow-2x shadow-primary/30 rounded-3xl transition-all hover:scale-[1.02] flex flex-col items-center justify-center p-0 outline-none">
                    <span className="flex items-center gap-3">Confirmar no WhatsApp <Send className="w-6 h-6" /></span>
                    <span className="text-[10px] opacity-80 font-bold mt-1">Cálculo de frete e pagamento no próximo passo</span>
                  </Button>
                </div>
              </form>
            </div>

            {/* Right: Summary */}
            <div className="lg:col-span-5 lg:sticky lg:top-32 space-y-8">
              {/* Review Card */}
              <div className="bg-[#0a1e36] text-white rounded-[40px] p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                
                <h3 className="text-3xl font-black uppercase mb-10 border-b border-white/5 pb-6 flex items-center justify-between" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                  Sua <span className="text-primary italic">Compra</span>
                  <ShoppingBag className="w-6 h-6 text-primary" />
                </h3>

                <ScrollArea className="max-h-[400px] mb-10 pr-6">
                  <div className="space-y-8">
                    {cart.map((item) => {
                      const itemPrice = typeof item.price === 'number' 
                        ? item.price 
                        : parseFloat(String(item.price).replace(/[^\d.,]/g, '').replace('.', '').replace(',', '.'));
                      const finalItemPrice = isNaN(itemPrice) ? 0 : itemPrice;
                      
                      return (
                        <div key={item.id} className="flex gap-6 items-center group">
                          <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 overflow-hidden shrink-0 group-hover:border-primary transition-all duration-500 shadow-xl group-hover:scale-110">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-black text-lg uppercase leading-tight mb-2 truncate text-white" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{item.name}</h4>
                            <div className="flex items-center justify-between">
                               <div className="flex items-center gap-2">
                                 <span className="text-[10px] font-black uppercase text-primary bg-primary/10 px-3 py-1 rounded-full">{item.quantity}x</span>
                               </div>
                               <p className="font-black text-2xl text-primary" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{formatPrice(finalItemPrice)}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>

                <div className="space-y-4 pt-4 border-t border-white/10">
                   <div className="flex justify-between text-slate-400 text-xs uppercase tracking-widest font-black">
                     <span>Subtotal</span>
                     <span className="text-white">{formatPrice(safeTotalPrice)}</span>
                   </div>
                   <div className="flex justify-between text-slate-400 text-xs uppercase tracking-widest font-black">
                     <span>Frete Bruto</span>
                     <span className="text-primary italic">A combinar</span>
                   </div>
                   <div className="flex justify-between items-end pt-6 border-t border-white/5">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#25D366]">Total Estimado</span>
                        <span className="text-5xl font-black uppercase" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{formatPrice(safeTotalPrice)}</span>
                      </div>
                      <Link to="/" className="text-[10px] font-black uppercase text-primary hover:underline pb-2">Editar Itens</Link>
                   </div>
                </div>
              </div>

              {/* Trust Card */}
              <div className="bg-white p-8 rounded-[40px] shadow-xl border border-border">
                <div className="grid grid-cols-2 gap-4">
                   <div className="flex flex-col items-center text-center p-4">
                      <CheckCircle2 className="w-8 h-8 text-[#25D366] mb-2" />
                      <p className="text-[9px] font-black uppercase tracking-widest text-[#0a1e36]">Produto de Fábrica</p>
                   </div>
                   <div className="flex flex-col items-center text-center p-4 border-l border-border">
                      <CreditCard className="w-8 h-8 text-primary mb-2" />
                      <p className="text-[9px] font-black uppercase tracking-widest text-[#0a1e36]">Parcelamento 12x</p>
                   </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border text-center">
                  <p className="text-[10px] font-medium text-muted-foreground leading-relaxed">
                    A **Automatiza Plast** garante a qualidade em fibra RTM industrial para todos os kits vendidos. Suporte pós-venda garantido.
                  </p>
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

import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { 
  CheckCircle2, 
  Package, 
  Truck, 
  ShoppingBag, 
  ChevronRight, 
  Clock, 
  MapPin,
  Calendar,
  Loader2
} from "lucide-react";
import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

const Tracking = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(!!orderId);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      // Normaliza o ID: se não começar com #, adiciona o #
      const normalizedId = orderId?.startsWith('#') ? orderId : `#${orderId}`;

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', normalizedId)
        .single();
      
      if (data) setOrder(data);
    } catch (err) {
      console.error("Erro ao buscar pedido:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStages = (status: string) => {
    // Mapeamento de status profissional
    const isApproved = status === 'Pagamento Aprovado' || status === 'approved';
    const isPending = status?.includes('Aguardando') || status?.includes('pendente') || status === 'pending';
    const isRejected = status?.includes('Recusado') || status === 'rejected';
    const isCancelled = status?.includes('Cancelado') || status === 'cancelled';

    const isProcessing = status?.includes('Produção') || status?.includes('processamento');
    const isShipped = status?.includes('Enviado') || status?.includes('Transporte');
    const isDelivered = status === 'Entregue';

    return [
      { id: 1, title: "Pedido Recebido", date: order ? new Date(order.created_at).toLocaleDateString() : "---", status: "completed", icon: ShoppingBag },
      { 
        id: 2, 
        title: isRejected ? "Pagamento Recusado" : isCancelled ? "Pagamento Cancelado" : "Pagamento Aprovado", 
        date: isApproved ? "Confirmado" : isPending ? "Confirmando..." : "---", 
        status: isApproved ? "completed" : isPending ? "current" : (isRejected || isCancelled ? "upcoming" : "upcoming"), 
        icon: CheckCircle2 
      },
      { id: 3, title: "Em Produção", date: isProcessing ? "Iniciado" : "---", status: isProcessing ? "current" : (isApproved ? "upcoming" : "upcoming"), icon: Package },
      { id: 4, title: "Expedição / Transporte", date: "---", status: isShipped ? "current" : "upcoming", icon: Truck },
      { id: 5, title: "Entregue", date: "---", status: isDelivered ? "completed" : "upcoming", icon: MapPin },
    ];
  };

  const stages = getStages(order?.status);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="font-bold uppercase tracking-widest text-[#0a1e36]">Localizando seu Bruto...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar />
      <Navbar />

      <main className="container mx-auto px-6 py-10 lg:py-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
             <div>
                <p className="text-[10px] font-black uppercase text-primary tracking-[0.3em] mb-2">Acompanhamento em Tempo Real</p>
                <h1 className="text-4xl lg:text-5xl font-black text-[#0a1e36] uppercase" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                  Status do seu <span className="text-primary italic">Bruto</span>
                </h1>
             </div>
             <div className="bg-slate-50 px-8 py-4 rounded-2xl border border-slate-100 text-right">
                <p className="text-[10px] font-black uppercase text-slate-400">Pedido</p>
                <p className="text-xl font-black text-[#0a1e36]">{orderId || "#------"}</p>
             </div>
          </div>

          {!orderId ? (
            <div className="bg-white p-16 rounded-[40px] text-center shadow-sm border border-slate-100">
               <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
                  <ShoppingBag className="w-8 h-8 text-slate-300" />
               </div>
               <h3 className="text-2xl font-black uppercase text-[#0a1e36] mb-4">Acompanhe seu Pedido</h3>
               <p className="text-muted-foreground mb-10 max-w-sm mx-auto">Insira o número do seu pedido enviado por e-mail para ver o status da produção.</p>
               <div className="max-w-xs mx-auto flex gap-2">
                 <input type="text" placeholder="#000000" id="trackingInput" className="flex-1 h-14 bg-slate-50 border-none rounded-xl px-6 font-bold" />
                 <button 
                  onClick={() => {
                    const val = (document.getElementById('trackingInput') as HTMLInputElement).value;
                    if(val) window.location.href = `/rastreio?orderId=${val}`;
                  }}
                  className="bg-primary text-white h-14 px-8 rounded-xl font-black uppercase text-[10px] tracking-widest"
                 >Ver</button>
               </div>
            </div>
          ) : !order ? (
            <div className="bg-white p-16 rounded-[40px] text-center shadow-sm border border-slate-100">
              <h3 className="text-2xl font-black uppercase text-red-500 mb-4">Pedido não encontrado</h3>
              <p className="text-muted-foreground mb-8">Verifique o número e tente novamente.</p>
              <Link to="/rastreio" className="text-primary font-black uppercase text-xs tracking-widest">Voltar</Link>
            </div>
          ) : (
            <div className="bg-white p-10 lg:p-16 rounded-[40px] shadow-2xl shadow-slate-200 border border-border overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative space-y-12">
                {stages.map((stage, i) => (
                  <div key={stage.id} className="flex gap-8 relative">
                    {/* Line */}
                    {i !== stages.length - 1 && (
                      <div className={`absolute left-7 top-14 w-px h-[calc(100%+16px)] ${stage.status === 'completed' ? 'bg-primary' : 'bg-slate-100'}`} />
                    )}
                    
                    {/* Icon Node */}
                    <div className={`w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center relative z-10 transition-all duration-500 ${
                      stage.status === 'completed' ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/20' :
                      stage.status === 'current' ? 'bg-white border-4 border-primary text-primary animate-pulse' :
                      'bg-slate-50 text-slate-300 border border-slate-100'
                    }`}>
                       <stage.icon className="w-6 h-6" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-2">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                         <h3 className={`text-xl font-black uppercase ${
                           stage.status === 'upcoming' ? 'text-slate-300' : 'text-[#0a1e36]'
                         }`} style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                           {stage.title}
                         </h3>
                         {stage.status !== 'upcoming' && (
                           <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                              <Calendar className="w-3 h-3" />
                              {stage.date}
                           </div>
                         )}
                      </div>
                      <p className={`text-sm mt-1 font-medium ${
                        stage.status === 'upcoming' ? 'text-slate-200' : 'text-muted-foreground'
                      }`}>
                        {stage.id === 1 && "Recebemos sua solicitação com sucesso."}
                        {stage.id === 2 && (order?.status === 'Aguardando Pagamento PIX' ? "Aguardando confirmação do PIX." : "Sua transação foi confirmada. Estamos preparando a documentação.")}
                        {stage.id === 3 && "O molde industrial está sendo preparado com Plástico ABS."}
                        {stage.id === 4 && "Seu kit será embalado com proteção reforçada para viagem."}
                        {stage.id === 5 && "O bruto já está de cara nova! Aproveite seu kit."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Help Card */}
          <div className="mt-12 bg-[#0a1e36] p-10 rounded-[40px] text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
             <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
             <div className="relative">
                <h4 className="text-2xl font-black uppercase mb-2" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Dúvidas sobre o envio?</h4>
                <p className="text-slate-400 text-sm font-medium">Nosso time de expedição está online para te ajudar.</p>
             </div>
             <a href="https://wa.me/5519983986895" target="_blank" rel="noopener noreferrer" className="bg-[#25D366] text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-xl shadow-[#25D366]/20 flex items-center gap-3">
                Chamar no WhatsApp
             </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Tracking;

import { useEffect, useState } from "react";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Users, 
  TrendingUp, 
  Search, 
  Bell, 
  Filter,
  MoreVertical,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Trash2,
  Pencil
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from "recharts";
import { products as localProducts } from "@/data/products";
import { supabase } from "@/lib/supabase";

const data = [
  { name: "Seg", vendas: 4000 },
  { name: "Ter", vendas: 3000 },
  { name: "Qua", vendas: 2000 },
  { name: "Qui", vendas: 2780 },
  { name: "Sex", vendas: 1890 },
  { name: "Sab", vendas: 2390 },
  { name: "Dom", vendas: 3490 },
];

const Admin = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [currentProducts, setCurrentProducts] = useState(localProducts);
  const [orders, setOrders] = useState<any[]>([]);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: dbProducts, error: pError } = await supabase.from('products').select('*');
      if (dbProducts && dbProducts.length > 0) setCurrentProducts(dbProducts);
      
      const { data: dbOrders, error: oError } = await supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
      if (dbOrders) setOrders(dbOrders);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product: any) => {
    setSelectedProduct({ ...product });
    setProductModalOpen(true);
  };

  const handleAddProduct = () => {
    setSelectedProduct({
      id: "sk-" + Math.random().toString(36).substr(2, 9),
      name: "",
      price: 0,
      tag: "",
      desc: "",
      image: "/product-skirt.png"
    });
    setProductModalOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este produto?")) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) {
        setCurrentProducts(prev => prev.filter(p => p.id !== id));
      }
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('products').upsert([selectedProduct]);
    
    if (!error) {
      const index = currentProducts.findIndex(p => p.id === selectedProduct.id);
      if (index > -1) {
        const newProducts = [...currentProducts];
        newProducts[index] = selectedProduct;
        setCurrentProducts(newProducts);
      } else {
        setCurrentProducts([selectedProduct, ...currentProducts]);
      }
      setProductModalOpen(false);
    } else {
      alert("Erro ao salvar produto.");
    }
  };

  const handlePrintNota = (order: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const itemsHtml = (order.order_items || []).map((item: any) => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px 0;">${item.product_name}</td>
        <td style="padding: 12px 0; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px 0; text-align: right;">${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}</td>
      </tr>
    `).join('');

    const paymentInfo = order.payment_method === 'pix' 
      ? `PIX - Transação: ${order.transaction_id}`
      : `Cartão de Crédito (Final: ${order.card_last_4 || '****'})`;

    printWindow.document.write(`
      <html>
        <head>
          <title>Nota de Pedido - ${order.id}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #0a1e36; line-height: 1.6; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #00BAF2; padding-bottom: 20px; margin-bottom: 40px; }
            .logo { height: 60px; }
            .info-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
            .info-box h4 { margin-bottom: 8px; color: #64748b; text-transform: uppercase; font-size: 10px; letter-spacing: 1px; }
            .info-box p { margin: 0; font-weight: bold; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            th { text-align: left; border-bottom: 1px solid #0a1e36; padding-bottom: 10px; font-size: 12px; text-transform: uppercase; }
            .total { text-align: right; font-size: 24px; font-weight: 900; }
            .footer { margin-top: 100px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #eee; padding-top: 20px; }
            .payment-badge { border: 1px solid #0a1e36; padding: 10px 20px; display: inline-block; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="/logo.png" class="logo" />
            <div style="text-align: right">
              <h2 style="margin: 0">PEDIDO DE COMPRA</h2>
              <p style="margin: 0; color: #00BAF2; font-weight: bold;">Nº ${order.id.replace('#','')}</p>
            </div>
          </div>
          
          <div class="info-grid">
            <div class="info-box">
              <h4>Dados do Cliente</h4>
              <p>${order.client_name}</p>
              <p>${order.client_email}</p>
              <p>${order.client_phone}</p>
              <p>CPF/CNPJ: ${order.client_cpf}</p>
            </div>
            <div class="info-box">
              <h4>Informações do Pedido</h4>
              <p>Data da Compra: ${new Date(order.created_at).toLocaleDateString()}</p>
              <p>Status: ${order.status || 'Pagamento Aprovado'}</p>
            </div>
          </div>

          <div class="info-box" style="margin-bottom: 20px;">
            <h4>Endereço de Entrega</h4>
            <p>${order.address}</p>
          </div>

          <div class="payment-badge">
            Forma de Pagamento: ${paymentInfo}
          </div>

          <div style="margin-top: 40px;">
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th style="text-align: center;">Qtd</th>
                  <th style="text-align: right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <div class="total">
            <span style="font-size: 12px; color: #64748b; font-weight: normal; margin-right: 20px;">VALOR TOTAL DO PEDIDO</span>
            ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total_price)}
          </div>

          <div class="footer">
            <p>Automatiza Plast - Kits em Fibra RTM Industrial</p>
            <p>R. Dr. Élton César, 910 – Chácaras Campos dos Amarais, Campinas – SP</p>
            <p style="margin-top: 10px;">Este documento é apenas um comprovante de pedido interno.</p>
          </div>

          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-[#0a1e36] text-white flex flex-col fixed inset-y-0 hidden lg:flex">
        <div className="p-8 border-b border-white/5">
          <img src="/logo.png" alt="Logo" className="h-16 w-auto" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mt-4">Painel Administrativo</p>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {[
            { id: "dashboard", icon: LayoutDashboard, label: "Visão Geral" },
            { id: "orders", icon: ShoppingBag, label: "Pedidos" },
            { id: "products", icon: Package, label: "Produtos" },
            { id: "clients", icon: Users, label: "Clientes" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all font-bold text-sm uppercase tracking-widest ${
                activeTab === item.id 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-white/5">
           <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold">A</div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs truncate">Administrador</p>
                <p className="text-[10px] text-slate-500 truncate">Sair do Sistema</p>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 bg-slate-50 p-6 lg:p-12 overflow-x-hidden">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black uppercase text-[#0a1e36]" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              {activeTab === "dashboard" && "Boas-vindas, Admin"}
              {activeTab === "orders" && "Central de Pedidos"}
              {activeTab === "products" && "Gerenciar Produtos"}
              {activeTab === "clients" && "Base de Clientes"}
            </h1>
            <p className="text-muted-foreground text-sm font-medium">Controle total da Automatiza Plast.</p>
          </div>
        </header>

        {(activeTab === "dashboard" || activeTab === "orders") && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === "dashboard" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Vendas Totais", value: "R$ 42.500", trend: "+12.5%", icon: TrendingUp, color: "text-primary" },
                  { label: "Pedidos Ativos", value: "14", trend: "Normal", icon: ShoppingBag, color: "text-orange-500" },
                  { label: "Clientes Novos", value: "28", trend: "+5.2%", icon: Users, color: "text-blue-500" },
                  { label: "Acessos Hoje", value: "842", trend: "+18%", icon: LayoutDashboard, color: "text-purple-500" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300">
                     <div className="flex items-center justify-between mb-4">
                        <div className={`p-4 rounded-2xl bg-slate-50 ${stat.color}`}>
                          <stat.icon className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-black bg-slate-50 px-3 py-1 rounded-full text-emerald-600">{stat.trend}</span>
                     </div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                     <h3 className="text-3xl font-black text-[#0a1e36]" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{stat.value}</h3>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "dashboard" && (
              <div className="grid lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-2 bg-[#0a1e36] text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <TrendingUp className="w-32 h-32" />
                    </div>
                    <h3 className="text-2xl font-black uppercase mb-8 flex items-center gap-3" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Performance de Vendas</h3>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                          <defs>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#00BAF2" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#00BAF2" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 10}} />
                          <Tooltip contentStyle={{backgroundColor: '#0a1e36', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '12px'}} />
                          <Area type="monotone" dataKey="vendas" stroke="#00BAF2" strokeWidth={3} fill="url(#colorSales)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                 </div>
                 <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                    <h3 className="text-2xl font-black uppercase mb-6 text-[#0a1e36]" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Status</h3>
                    <div className="space-y-6">
                      {[{status: "Concluído", value: 38, col: "bg-emerald-500"}, {status: "Processando", value: 24, col: "bg-primary"}, {status: "Pendentes", value: 12, col: "bg-orange-500"}].map(item => (
                        <div key={item.status} className="space-y-2">
                           <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                              <span>{item.status}</span>
                              <span className="text-[#0a1e36]">{item.value}</span>
                           </div>
                           <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                              <div className={`h-full ${item.col}`} style={{width: `${(item.value/74)*100}%`}}></div>
                           </div>
                        </div>
                      ))}
                    </div>
                 </div>
              </div>
            )}

            {/* Orders Table */}
            <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
               <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                  <h3 className="text-2xl font-black uppercase text-[#0a1e36]" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                    {activeTab === "dashboard" ? "Pedidos Recentes" : "Todos os Pedidos"}
                  </h3>
                  <div className="flex items-center gap-4">
                     <button className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-400 hover:text-primary transition-colors">
                        <Filter className="w-5 h-5" />
                     </button>
                  </div>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead>
                     <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                       <th className="px-8 py-6">ID</th>
                       <th className="px-8 py-6">Cliente</th>
                       <th className="px-8 py-6">Produto</th>
                       <th className="px-8 py-6">Status</th>
                       <th className="px-8 py-6">Valor</th>
                       <th className="px-8 py-6">Ações</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                     {(activeTab === "dashboard" ? orders.slice(0, 5) : orders).map((order) => (
                       <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                         <td className="px-8 py-6 font-bold text-sm">{order.id}</td>
                         <td className="px-8 py-6">
                           <div className="flex flex-col">
                             <span className="font-bold text-sm">{order.client_name}</span>
                             <span className="text-[10px] text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</span>
                           </div>
                         </td>
                         <td className="px-8 py-6 text-sm text-slate-600 truncate max-w-[200px]">
                            {order.order_items?.[0]?.product_name || "Kit Personalizado"}
                         </td>
                         <td className="px-8 py-6">
                            <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${
                              order.status === 'Concluído' ? 'bg-emerald-100 text-emerald-600' : 
                              order.status === 'Em processamento' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
                            }`}>
                              {order.status || 'Pagamento Aprovado'}
                            </span>
                         </td>
                         <td className="px-8 py-6 font-black">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total_price)}</td>
                         <td className="px-8 py-6">
                            <button 
                              onClick={() => setSelectedOrder(order)}
                              className="bg-primary/10 text-primary p-3 rounded-xl hover:bg-primary hover:text-white transition-all"
                            >
                               <ExternalLink className="w-4 h-4" />
                            </button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="flex justify-between items-center bg-white p-8 rounded-3xl border border-slate-100">
                <div>
                   <h2 className="text-2xl font-black text-[#0a1e36] uppercase" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Gestão de Estoque</h2>
                   <p className="text-xs text-muted-foreground font-medium">Total de {currentProducts.length} itens ativos no sistema.</p>
                </div>
                <button 
                  onClick={handleAddProduct}
                  className="bg-primary text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                >
                   Adicionar Produto
                </button>
             </div>

             <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                   <thead>
                     <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                       <th className="px-8 py-6">Imagem</th>
                       <th className="px-8 py-6">Nome / Descrição</th>
                       <th className="px-8 py-6">Preço</th>
                       <th className="px-8 py-6">Destaque</th>
                       <th className="px-8 py-6 text-right">Ações</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                     {currentProducts.map((p) => (
                       <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                         <td className="px-8 py-6">
                            <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                               <img src={p.image} className="w-full h-full object-cover" />
                            </div>
                         </td>
                         <td className="px-8 py-6">
                           <div className="flex flex-col max-w-sm">
                             <span className="font-bold text-sm text-[#0a1e36]">{p.name}</span>
                             <span className="text-[10px] text-muted-foreground truncate">{p.desc}</span>
                           </div>
                         </td>
                         <td className="px-8 py-6 font-black text-primary">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.price)}</td>
                         <td className="px-8 py-6">
                            {p.tag ? (
                              <span className="text-[9px] font-black bg-orange-100 text-orange-600 px-2 py-1 rounded uppercase tracking-widest">{p.tag}</span>
                            ) : (
                              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">Nenhum</span>
                            )}
                         </td>
                         <td className="px-8 py-6">
                            <div className="flex items-center justify-end gap-3">
                               <button 
                                 onClick={() => handleEditProduct(p)}
                                 className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all text-slate-400"
                               >
                                  <Pencil className="w-4 h-4" />
                               </button>
                               <button 
                                 onClick={() => handleDeleteProduct(p.id)}
                                 className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all text-slate-400"
                               >
                                  <Trash2 className="w-4 h-4" />
                               </button>
                            </div>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                </table>
             </div>
          </div>
        )}

        {/* Product Modal */}
        {productModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#0a1e36]/80 backdrop-blur-sm animate-in fade-in duration-300">
             <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl relative overflow-hidden">
                <div className="p-10 border-b border-slate-100 flex items-center justify-between">
                   <h3 className="text-3xl font-black uppercase text-[#0a1e36]" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                      {currentProducts.find(p => p.id === selectedProduct?.id) ? "Editar Produto" : "Novo Produto"}
                   </h3>
                   <button onClick={() => setProductModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">✕</button>
                </div>

                <form onSubmit={handleSaveProduct} className="p-10 space-y-8 overflow-y-auto max-h-[70vh]">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Nome do Produto</label>
                      <input 
                        required
                        className="w-full bg-slate-50 border-none h-14 rounded-2xl px-6 focus:ring-2 focus:ring-primary/20 text-sm font-bold"
                        value={selectedProduct?.name}
                        onChange={(e) => setSelectedProduct({...selectedProduct, name: e.target.value})}
                      />
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Preço (R$)</label>
                         <input 
                           type="number"
                           required
                           className="w-full bg-slate-50 border-none h-14 rounded-2xl px-6 focus:ring-2 focus:ring-primary/20 text-sm font-bold"
                           value={selectedProduct?.price}
                           onChange={(e) => setSelectedProduct({...selectedProduct, price: Number(e.target.value)})}
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Destaque / Tag</label>
                         <input 
                           placeholder="Ex: Lançamento, Oferta..."
                           className="w-full bg-slate-50 border-none h-14 rounded-2xl px-6 focus:ring-2 focus:ring-primary/20 text-sm font-bold"
                           value={selectedProduct?.tag || ""}
                           onChange={(e) => setSelectedProduct({...selectedProduct, tag: e.target.value})}
                         />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Descrição</label>
                      <textarea 
                        required
                        rows={4}
                        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                        value={selectedProduct?.desc}
                        onChange={(e) => setSelectedProduct({...selectedProduct, desc: e.target.value})}
                      />
                   </div>

                   <div className="bg-[#0a1e36] p-8 rounded-[40px] mt-4">
                      <button type="submit" className="w-full bg-primary text-white h-16 rounded-2xl font-black uppercase text-sm tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/30">
                        Salvar Alterações
                      </button>
                   </div>
                </form>
             </div>
          </div>
        )}

        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#0a1e36]/80 backdrop-blur-sm animate-in fade-in duration-300">
             <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="absolute top-8 right-8 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black hover:bg-red-50 hover:text-red-500 transition-colors"
                >✕</button>

                <div className="p-12 overflow-y-auto">
                   <div className="flex items-center gap-4 mb-10">
                      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                         <ShoppingBag className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">Detalhes do Pedido</p>
                         <h2 className="text-3xl font-black text-[#0a1e36]" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{selectedOrder.id}</h2>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-10 mb-10 border-b border-slate-100 pb-10">
                      <div className="space-y-6">
                         <div className="space-y-1">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Cliente</h4>
                            <p className="font-bold text-sm text-[#0a1e36]">{selectedOrder.client_name}</p>
                            <p className="text-xs text-slate-500">{selectedOrder.client_email}</p>
                            <p className="text-xs text-slate-500">{selectedOrder.client_phone}</p>
                         </div>
                         <div className="space-y-1">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Documento</h4>
                            <p className="font-bold text-sm text-[#0a1e36]">{selectedOrder.client_cpf}</p>
                         </div>
                      </div>
                      <div className="space-y-6 text-right">
                         <div className="space-y-1 text-right">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Transação / Pagamento</h4>
                            <p className="font-bold text-sm text-[#0a1e36]">{selectedOrder.transaction_id}</p>
                            <div className="mt-2 flex flex-col items-end gap-1">
                               <div className="flex items-center gap-2">
                                  <span className={`text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest ${selectedOrder.payment_method === 'pix' ? 'bg-[#25D366]/10 text-[#25D366]' : 'bg-primary/10 text-primary'}`}>
                                    {selectedOrder.payment_method === 'pix' ? 'PIX' : 'Cartão'}
                                  </span>
                                  {selectedOrder.payment_method === 'cartao' && (
                                    <span className="text-xs font-bold text-slate-400">•••• {selectedOrder.card_last_4}</span>
                                  )}
                               </div>
                               <p className="text-[10px] text-slate-400 font-medium">Data: {new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                            </div>
                         </div>
                         <div className="space-y-1">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Status</h4>
                            <span className="text-[10px] font-black bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full uppercase">{selectedOrder.status || 'Pagamento Aprovado'}</span>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-6 mb-10 border-b border-slate-100 pb-10">
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Endereço de Entrega</h4>
                      <p className="font-medium text-sm text-[#0a1e36] leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">{selectedOrder.address}</p>
                   </div>

                   <div className="space-y-6 mb-10">
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Itens Comprados</h4>
                      <div className="space-y-4">
                        {(selectedOrder.order_items || []).map((item: any, i: number) => (
                          <div key={i} className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl">
                             <div className="flex items-center gap-4">
                                <span className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center font-bold text-xs">{item.quantity}x</span>
                                <span className="font-bold text-sm">{item.product_name}</span>
                             </div>
                             <span className="font-black text-sm">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}</span>
                          </div>
                        ))}
                      </div>
                   </div>

                   <div className="bg-[#0a1e36] p-8 rounded-[40px] text-white flex items-center justify-between">
                      <div className="flex flex-col">
                         <span className="text-[10px] font-black uppercase tracking-widest text-primary">Total Pago</span>
                         <span className="text-3xl font-black" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedOrder.total_price)}</span>
                      </div>
                      <button 
                        onClick={() => handlePrintNota(selectedOrder)}
                        className="bg-primary text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/20"
                      >
                         Gerar Nota Fiscal
                      </button>
                   </div>
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;

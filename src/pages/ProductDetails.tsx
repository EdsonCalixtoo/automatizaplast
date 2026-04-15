import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ShoppingCart, ShieldCheck, Truck, Wrench, MessageCircle, ChevronLeft, Star, Phone, CreditCard } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/components/ui/use-toast";
import { products } from "@/data/products";
import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [dbProduct, setDbProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (data) {
        setDbProduct(data);
        setActiveImage(data.image);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  const localProduct = products.find((p) => p.id === id);
  const product = dbProduct || localProduct;

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Carregando Detalhes...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-black mb-4">Produto não encontrado</h1>
        <Link to="/" className="btn-primary">Voltar para Início</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: "✓ Adicionado ao carrinho",
      description: product.name,
    });
  };

  const galleryImages = [product.image, ...(product.gallery || [])].filter(Boolean);

  const isVideo = (url: string) => {
    return url?.match(/\.(mp4|webm|ogg|mov)$/i);
  };

  return (
    <div className="min-h-screen bg-white">
      <TopBar />
      <Navbar />

      <main className="container mx-auto px-6 py-12 lg:py-20">
        {/* Breadcrumb / Back */}
        <Link to="/#produtos" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-10 font-bold uppercase tracking-widest text-xs">
          <ChevronLeft className="w-4 h-4" />
          Voltar para o Catálogo
        </Link>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Gallery */}
          <div className="space-y-6">
            <div className="aspect-square bg-secondary rounded-2xl overflow-hidden border border-border group relative">
              {isVideo(activeImage || product.image) ? (
                <video 
                  src={activeImage || product.image} 
                  controls 
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                />
              ) : (
                <img
                  src={activeImage || product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-all duration-500"
                />
              )}
              {product.tag && (
                <div className="absolute top-6 left-6 bg-primary text-primary-foreground text-xs font-black px-4 py-2 rounded uppercase tracking-widest shadow-xl">
                  {product.tag}
                </div>
              )}
            </div>
            
            {galleryImages.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all relative ${activeImage === img ? 'border-primary ring-2 ring-primary/20' : 'border-slate-100 opacity-60 hover:opacity-100'}`}
                  >
                    {isVideo(img) ? (
                      <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                        <video src={img} className="w-full h-full object-cover opacity-50" />
                        <div className="absolute inset-0 flex items-center justify-center">
                           <div className="w-6 h-6 bg-white/80 rounded-full flex items-center justify-center">
                              <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] border-l-primary border-b-[4px] border-b-transparent ml-0.5"></div>
                           </div>
                        </div>
                      </div>
                    ) : (
                      <img src={img} className="w-full h-full object-cover" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <div className="mb-8 p-1 bg-primary/5 border border-primary/10 rounded-full w-fit px-4 flex items-center gap-2">
              <Star className="w-3 h-3 text-primary fill-primary" />
              <span className="text-[10px] text-primary font-black uppercase tracking-widest">
                {product.badge || "Qualidade ABS Industrial"}
              </span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-black uppercase leading-none mb-6" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              {product.name}
            </h1>

            <div className="space-y-4 mb-10">
              {(product.old_price || product.oldPrice) && (
                <p className="text-muted-foreground line-through text-lg font-medium">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.old_price || product.oldPrice || 4500)}
                </p>
              )}
              <div className="flex flex-col">
                <p className="text-[#0a1e36] font-black text-5xl leading-tight" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(3300)}
                </p>
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-lg mt-1">
                   <span>R$ 3.100,00 no PIX</span>
                   <span className="text-[10px] bg-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-tighter">Economize R$ 200</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-1 mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Opções de Parcelamento:</span>
                <div className="flex flex-col gap-1">
                   <p className="text-sm font-black text-primary flex items-center gap-2">
                     <CreditCard className="w-4 h-4" />
                     5x de R$ 660,00 sem juros
                   </p>
                   <p className="text-[11px] font-bold text-slate-500">ou até 12x com juros no cartão</p>
                </div>
              </div>
            </div>

            <p className="text-muted-foreground text-lg leading-relaxed mb-12 max-w-xl">
              {product.description || product.desc}
            </p>

            {/* Benefits box */}
            <div className="grid sm:grid-cols-2 gap-4 mb-12 border-y border-border py-10">
              {[
                { icon: Truck, title: "Envio Seguro", desc: "Todo o Brasil" },
                { icon: Wrench, title: "Instalação", desc: "Campinas – SP" },
                { icon: ShieldCheck, title: "Garantia", desc: "Suporte Total" },
                { icon: Phone, title: "Pós-Venda", desc: "Time de Especialistas" },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-black text-sm uppercase tracking-wide leading-tight">{title}</p>
                    <p className="text-muted-foreground text-xs font-semibold">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => {
                    addToCart(product);
                    navigate('/checkout');
                  }}
                  className="btn-primary flex-1 flex items-center justify-center gap-3 text-lg"
                >
                  <CreditCard className="w-6 h-6" />
                  Comprar Agora
                </button>
                <button
                  onClick={handleAddToCart}
                  className="btn-outline flex-1 flex items-center justify-center gap-3 text-lg"
                >
                  <ShoppingCart className="w-6 h-6" />
                  Adicionar ao Carrinho
                </button>
              </div>
              <a
                href={`https://wa.me/5519983986895?text=Olá! Gostaria de saber mais sobre o produto: ${product.name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-secondary/50 p-6 rounded-2xl flex items-center justify-between group hover:bg-primary/5 transition-colors border border-border"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#25D366]/10 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-[#25D366]" />
                  </div>
                  <div>
                    <p className="font-black text-sm uppercase tracking-tight text-[#0a1e36]">Dúvidas Técnicas?</p>
                    <p className="text-xs text-muted-foreground">Fale com um consultor agora no WhatsApp</p>
                  </div>
                </div>
                <div className="w-10 h-10 bg-white border border-border rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                  <MessageCircle className="w-5 h-5" />
                </div>
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetails;

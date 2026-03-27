import { Link } from "react-router-dom";
import { ShoppingCart, Eye, Truck, Wrench } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/components/ui/use-toast";
import { products } from "@/data/products";

const ProductsSection = () => {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast({
      title: "✓ Adicionado ao carrinho",
      description: product.name,
    });
  };

  return (
    <section className="py-24 bg-white" id="produtos">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <p className="section-label mb-3">Catálogo Premium</p>
          <h2 className="section-title">
            Nossas <span className="text-primary">Saias Laterais</span>
          </h2>
          <div className="line-accent mx-auto mt-4 mb-6" />
          <p className="text-muted-foreground max-w-xl mx-auto">
            Qualidade industrial em fibra RTM. Escolha o modelo para ver detalhes e solicitar orçamento.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((p) => (
            <Link
              key={p.id}
              to={`/produto/${p.id}`}
              className="product-card group block"
            >
              <div className="relative overflow-hidden aspect-[4/3] bg-secondary">
                {p.tag && (
                  <span className="absolute top-4 left-4 z-10 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-sm">
                    {p.tag}
                  </span>
                )}
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
              </div>

              <div className="p-6">
                <h3 className="font-black text-lg uppercase leading-tight mb-4 line-clamp-2 h-12" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                  {p.name}
                </h3>

                <div className="space-y-1 mb-6">
                  {p.oldPrice && (
                    <p className="text-muted-foreground text-xs line-through">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.oldPrice)}</p>
                  )}
                  <p className="text-[#0a1e36] font-black text-2xl" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.price)}
                  </p>
                  <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">ou {p.installment} sem juros</p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={(e) => handleAddToCart(e, p)}
                    className="flex-1 bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest py-3.5 rounded flex items-center justify-center gap-2 hover:bg-[#0099cc] transition-colors"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Comprar
                  </button>
                  <div className="bg-secondary p-3 rounded group-hover:bg-primary group-hover:text-white transition-colors">
                    <Eye className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Info bar below products */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 p-6 bg-secondary/50 border border-border rounded-xl text-sm">
          <div className="flex items-center gap-2 text-muted-foreground font-medium">
            <Truck className="w-5 h-5 text-primary" />
            <span>Frete para todo o Brasil calculado no checkout</span>
          </div>
          <div className="w-px h-5 bg-border hidden sm:block" />
          <div className="flex items-center gap-2 text-muted-foreground font-medium">
            <Wrench className="w-5 h-5 text-primary" />
            <span>Instalação disponível em Campinas – SP</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;

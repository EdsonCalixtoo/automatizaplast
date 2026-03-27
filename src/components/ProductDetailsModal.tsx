import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ShieldCheck, Truck, Wrench, MessageCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ProductDetailsModalProps {
  product: any;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDetailsModal({ product, isOpen, onOpenChange }: ProductDetailsModalProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: "✓ Adicionado ao carrinho",
      description: product.name,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl overflow-y-auto max-h-[92vh] bg-card border-border p-0">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image side */}
          <div className="relative bg-secondary min-h-64 md:min-h-full">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.discount && (
              <div className="absolute top-4 left-4 bg-primary text-primary-foreground text-sm font-black px-3 py-1.5 rounded uppercase tracking-widest" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                -{product.discount} OFF
              </div>
            )}
          </div>

          {/* Info side */}
          <div className="p-8 flex flex-col">
            <DialogHeader className="mb-6">
              <p className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-2">Saia Lateral</p>
              <DialogTitle className="text-2xl font-black uppercase leading-tight" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                {product.name}
              </DialogTitle>
            </DialogHeader>

            <div className="flex-1 space-y-6">
              {/* Price */}
              <div>
                {product.oldPrice && (
                  <p className="text-muted-foreground line-through text-sm">{product.oldPrice}</p>
                )}
                <p className="text-primary font-black text-4xl leading-tight" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                  {product.price}
                </p>
                <p className="text-muted-foreground text-sm mt-1">ou {product.installment} sem juros no cartão</p>
              </div>

              {/* Description */}
              {product.desc && (
                <p className="text-muted-foreground text-sm leading-relaxed border-t border-border pt-4">
                  {product.desc}
                </p>
              )}

              {/* Benefits */}
              <div className="space-y-2.5 border-t border-border pt-4">
                {[
                  { icon: Truck, text: "Enviamos para todo o Brasil" },
                  { icon: Wrench, text: "Instalação disponível em Campinas–SP" },
                  { icon: ShieldCheck, text: "Garantia de fábrica contra defeitos" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2.5 text-sm">
                    <Icon className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-muted-foreground">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-3">
              <Button
                onClick={handleAddToCart}
                className="w-full h-12 font-black uppercase tracking-widest gap-2 text-sm"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                <ShoppingCart className="w-5 h-5" />
                Adicionar ao Carrinho
              </Button>
              <a
                href={`https://wa.me/5519983986895?text=Olá! Tenho interesse no produto: ${product.name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-12 border-2 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground flex items-center justify-center gap-2 rounded-md transition-all font-black uppercase text-sm tracking-widest"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                <MessageCircle className="w-4 h-4" />
                Pedir pelo WhatsApp
              </a>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

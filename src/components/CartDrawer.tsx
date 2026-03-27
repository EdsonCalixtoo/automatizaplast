import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export function CartDrawer() {
  const { cart, removeFromCart, updateQuantity, totalItems, totalPrice } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="relative p-2 text-[#0a1e36] hover:text-primary transition-colors">
          <ShoppingCart className="w-6 h-6" />
          {totalItems > 0 && (
            <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-black px-1.5 py-0.5 rounded-full ring-2 ring-white">
              {totalItems}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col bg-white border-l border-border">
        <SheetHeader className="border-b border-border pb-6">
          <SheetTitle className="flex items-center gap-3 font-black uppercase tracking-tight text-2xl h-8" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
            <ShoppingCart className="w-6 h-6 text-primary" />
            Meu Carrinho <span className="text-muted-foreground text-sm font-bold ml-auto">({totalItems} {totalItems === 1 ? 'item' : 'itens'})</span>
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-hidden mt-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-6 px-10 text-center">
              <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center">
                <ShoppingCart className="w-10 h-10 opacity-20" />
              </div>
              <div className="space-y-2">
                <p className="font-black uppercase tracking-widest text-[#0a1e36]">Seu carrinho está vazio</p>
                <p className="text-xs">Explore nosso catálogo e adicione saias laterais incríveis para seu bruto.</p>
              </div>
              <SheetClose asChild>
                <Button variant="outline" className="mt-4 uppercase font-black tracking-widest text-xs py-6">Continuar Comprando</Button>
              </SheetClose>
            </div>
          ) : (
            <ScrollArea className="h-full pr-4">
              <div className="space-y-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 p-2 rounded-xl hover:bg-secondary/30 transition-colors group">
                    <div className="w-24 h-24 rounded-lg bg-secondary overflow-hidden shrink-0 border border-border">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-black uppercase leading-tight mb-2 text-[#0a1e36]" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{item.name}</h4>
                        <p className="text-primary font-black text-lg" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{formatPrice(item.price)}</p>
                      </div>
                      <div className="flex items-center justify-between mt-auto pt-2">
                        <div className="flex items-center bg-white border border-border rounded-lg shadow-sm">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 hover:bg-secondary transition-colors text-muted-foreground"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-10 text-center text-xs font-black text-[#0a1e36]">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-secondary transition-colors text-muted-foreground"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-border pt-8 mt-auto space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-muted-foreground uppercase text-[10px] font-black tracking-[0.2em]">
                <span>Previsão de Frete</span>
                <span className="text-primary font-bold">Grátis para Campinas</span>
              </div>
              <div className="flex items-center justify-between text-2xl font-black uppercase text-[#0a1e36]" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                <span>Total</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
            </div>
            
            <SheetClose asChild>
              <Link to="/checkout" className="w-full">
                <Button className="w-full h-16 text-base uppercase tracking-widest font-black flex items-center justify-center gap-3 shadow-xl hover:shadow-primary/20 transition-all rounded-xl">
                  Finalizar Pedido
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </SheetClose>

            <div className="flex items-center justify-center gap-4 text-muted-foreground opacity-60">
              <div className="h-px bg-border flex-1" />
              <p className="text-[9px] font-black uppercase tracking-widest">Pagamento 100% Seguro</p>
              <div className="h-px bg-border flex-1" />
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

import { Phone, MessageCircle, MapPin, Truck } from "lucide-react";

const TopBar = () => (
  <div className="topbar">
    <div className="container mx-auto px-6 h-12 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em]">
      <div className="flex items-center gap-10">
        <a href="https://wa.me/5519983986895" className="flex items-center gap-2.5 hover:text-primary transition-colors text-white">
          <MessageCircle className="w-4 h-4 text-primary" />
          <span className="hidden sm:inline">(19) 98398-6895</span>
        </a>
        <div className="hidden xl:flex items-center gap-2.5 border-l border-white/10 pl-10 opacity-70">
          <MapPin className="w-4 h-4 text-primary" />
          <span>Campinas – SP</span>
        </div>
      </div>
      <div className="flex items-center gap-10 font-black">
        <div className="flex items-center gap-2.5">
          <Truck className="w-4 h-4 text-primary" />
          <span className="hidden md:inline">Instalamos · Enviamos para todo o Brasil</span>
        </div>
      </div>
    </div>
  </div>
);

export default TopBar;

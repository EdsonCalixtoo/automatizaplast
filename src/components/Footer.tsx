import { Phone, Mail, MapPin, MessageCircle, Truck, Wrench, ShieldCheck, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-white text-[#0a1e36] border-t border-border mt-20">
    <div className="container mx-auto px-6 pt-20 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">

        {/* Brand Info */}
        <div className="lg:col-span-1 space-y-12 pr-10 border-r border-slate-100">
          <Link to="/" className="inline-block transition-transform duration-300 hover:scale-105">
            <img src="/logo.png" alt="Automatiza Plast" className="h-40 md:h-48 w-auto object-contain scale-110" />
          </Link>
          <p className="text-muted-foreground text-base leading-relaxed font-medium">
            Líder nacional em saias laterais (**side skirts**) para caminhões. Tecnologia de ponta em fibra RTM para garantir o melhor acabamento do mercado.
          </p>
          <div className="flex gap-4">
            <div className="flex items-center gap-3 text-[10px] text-primary font-black uppercase tracking-widest bg-primary/5 border border-primary/20 rounded-full px-5 py-2">
              <Truck className="w-4 h-4" />
              Todo o Brasil
            </div>
            <div className="flex items-center gap-3 text-[10px] text-primary font-black uppercase tracking-widest bg-primary/5 border border-primary/20 rounded-full px-5 py-2">
              <Wrench className="w-4 h-4" />
              Instalamos
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="text-primary text-xs font-black uppercase tracking-[0.3em] mb-8" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Catálogo Digital</h4>
          <ul className="space-y-4 text-[#0a1e36] font-bold text-sm tracking-widest uppercase">
            {["Scania NTG", "Volvo FH", "Mercedes Actros", "Iveco S-Way", "DAF XF", "VW Constellations"].map(item => (
              <li key={item}><Link to="/#produtos" className="hover:text-primary transition-colors duration-200 block">{item}</Link></li>
            ))}
          </ul>
        </div>

        {/* Useful Links */}
        <div>
          <h4 className="text-primary text-xs font-black uppercase tracking-[0.3em] mb-8" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Institucional</h4>
          <ul className="space-y-4 text-[#0a1e36] font-bold text-sm tracking-widest uppercase">
            {["Sobre Nós", "Como Funciona", "Instalação em Campinas", "Política de Envio", "Termos e Garantia"].map(item => (
              <li key={item}><a href="#" className="hover:text-primary transition-colors duration-200 block">{item}</a></li>
            ))}
          </ul>
        </div>

        {/* Contact Details */}
        <div>
          <h4 className="text-primary text-xs font-black uppercase tracking-[0.3em] mb-8" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Contato Direto</h4>
          <ul className="space-y-6">
            <li>
              <a href="https://wa.me/5519983986895" className="flex items-start gap-4 text-muted-foreground hover:text-primary transition-colors duration-300 group">
                <div className="w-10 h-10 bg-secondary/50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                  <MessageCircle className="w-5 h-5 text-primary group-hover:text-white" />
                </div>
                <div>
                  <p className="font-black text-[#0a1e36] text-lg leading-tight uppercase tracking-tighter" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>(19) 98398-6895</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest">WhatsApp disponível</p>
                </div>
              </a>
            </li>
            <li>
              <a href="tel:19983986895" className="flex items-start gap-4 text-muted-foreground hover:text-primary transition-colors duration-300 group">
                <div className="w-10 h-10 bg-secondary/50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#0a1e36] group-hover:text-white transition-colors">
                  <Phone className="w-5 h-5 text-primary group-hover:text-white" />
                </div>
                <div>
                  <p className="font-black text-[#0a1e36] text-lg leading-tight uppercase tracking-tighter" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>(19) 98398-6895</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest">Atendimento Comercial</p>
                </div>
              </a>
            </li>
            <li>
              <div className="flex items-start gap-4 text-muted-foreground">
                <div className="w-10 h-10 bg-secondary/50 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div className="text-sm font-medium leading-relaxed">
                  R. Dr. Élton César, 910 – Chácaras Campos dos Amarais<br />Campinas – SP, 13082-025
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-border pt-10 flex flex-col md:flex-row items-center justify-between gap-6 text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] font-['Barlow_Condensed']">
        <p>© {new Date().getFullYear()} Automatiza Plast. Todos os direitos reservados.</p>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>Compra 100% Segura</span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-primary fill-primary" />
            <span>Fabricação Brasileira</span>
          </div>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;

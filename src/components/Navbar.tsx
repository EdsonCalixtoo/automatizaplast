import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { CartDrawer } from "./CartDrawer";
import { CustomerArea } from "./CustomerArea";

const links = [
  { label: "Produtos", href: "/#produtos" },
  { label: "Antes & Depois", href: "/#antes-depois" },
  { label: "Como Funciona", href: "/#como-funciona" },
  { label: "Instalação", href: "/#instalacao" },
  { label: "Contato", href: "/#contato" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const handleLinkClick = (href: string) => {
    setOpen(false);
    if (href.startsWith("/#") && location.pathname === "/") {
      const id = href.split("#")[1];
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <nav className="bg-white/98 backdrop-blur-md border-b border-border sticky top-0 z-40 transition-all duration-300">
      <div className="container mx-auto px-6 flex items-center justify-between h-24 md:h-32 py-4">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0 overflow-visible py-2">
          <img 
            src="/logo.png" 
            alt="Automatiza Plast" 
            className="h-16 md:h-24 w-auto object-contain transition-transform hover:scale-105" 
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-10">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => {
                if (l.href.startsWith("/#") && location.pathname === "/") {
                  e.preventDefault();
                  handleLinkClick(l.href);
                }
              }}
              className="nav-link text-[#0a1e36] text-sm md:text-base font-bold uppercase tracking-widest hover:text-primary transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Desktop Right */}
        <div className="hidden lg:flex items-center gap-6">
          <div className="flex items-center gap-4 border-r border-border pr-6 mr-2">
            <CartDrawer />
            <CustomerArea />
          </div>
          <a
            href="https://wa.me/5519983986895"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-xs py-4 px-8 rounded-xl font-black shadow-primary/20 shadow-xl uppercase tracking-widest"
          >
            Orçamento WhatsApp
          </a>
        </div>

        {/* Mobile */}
        <div className="flex lg:hidden items-center gap-4">
          <CartDrawer />
          <button onClick={() => setOpen(!open)} className="p-2 text-[#0a1e36] hover:text-primary transition-colors">
            {open ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="lg:hidden bg-white border-t border-border pb-10 animate-in fade-in slide-in-from-top-4 duration-300">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => {
                if (l.href.startsWith("/#") && location.pathname === "/") {
                  e.preventDefault();
                }
                handleLinkClick(l.href);
              }}
              className="block px-8 py-5 nav-link text-lg border-b border-border/50 text-[#0a1e36] font-bold uppercase tracking-widest"
            >
              {l.label}
            </a>
          ))}
          <div className="px-8 pt-8">
            <a
              href="https://wa.me/5519983986895"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full text-center block text-base py-5 rounded-2xl font-black uppercase tracking-widest"
            >
              Pedir Orçamento no WhatsApp
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

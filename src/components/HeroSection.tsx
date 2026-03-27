import { ArrowRight, Truck, Zap, Award } from "lucide-react";

const HeroSection = () => (
  <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-grid hero-gradient">
    {/* Decorative radial glows */}
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/3 blur-3xl opacity-50" />
    </div>

    <div className="container mx-auto px-6 py-20 relative z-10">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Content */}
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary rounded-full px-5 py-2 text-xs font-black uppercase tracking-widest animate-fade-in">
            <Zap className="w-4 h-4" />
            Especialistas em Side Skirts
          </div>

          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black uppercase leading-[0.85] tracking-tight text-[#0a1e36]">
              <span className="text-primary tracking-tighter">Estilo &</span>
              <br />
              <span className="text-[#0a1e36]">Performance</span>
            </h1>
            <p className="text-muted-foreground text-xl max-w-lg leading-relaxed font-medium">
              Transforme o visual do seu caminhão com saias laterais em <strong className="text-[#0a1e36]">fibra RTM premium</strong>. 
              Acabamento de fábrica com durabilidade industrial.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="flex gap-10 py-4">
            {[
              { num: "100%", label: "Encaixe" },
              { num: "RTM", label: "Fibra" },
              { num: "BR", label: "Entrega" },
            ].map(s => (
              <div key={s.label}>
                <p className="text-3xl font-black text-[#0a1e36] font-['Barlow_Condensed'] leading-none mb-1">{s.num}</p>
                <div className="w-6 h-1 bg-primary mb-2" />
                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 pt-4">
            <a href="#produtos" className="btn-primary flex items-center gap-3 shadow-lg">
              Ver Catálogo
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="https://wa.me/5519983986895"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline flex items-center gap-3"
            >
              Pedir Orçamento
            </a>
          </div>

          {/* Trust Badges Simple */}
          <div className="flex flex-wrap gap-8 pt-6 border-t border-border/50">
            {[
              { icon: Truck, text: "Envio para todo o Brasil" },
              { icon: Award, text: "Instalação em Campinas" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-[#0a1e36] text-xs font-black uppercase tracking-widest opacity-80">
                <Icon className="w-5 h-5 text-primary" />
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* Right Image Container */}
        <div className="relative">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl animate-float border-[12px] border-white ring-1 ring-border">
            <img
              src="/hero-truck.png"
              alt="Caminhão Scania com Saia Lateral Automatiza Plast"
              className="w-full object-cover"
            />
            {/* Overlay badge */}
            <div className="absolute top-6 right-6 bg-white/90 backdrop-blur border border-primary/20 rounded-2xl p-6 shadow-xl hidden sm:block">
              <p className="text-primary font-black text-3xl uppercase leading-none mb-1" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Premium</p>
              <p className="text-[#0a1e36] font-black text-sm uppercase tracking-[0.2em]">Side Skirts</p>
            </div>
          </div>
          
          {/* Decorative accents */}
          <div className="absolute -z-10 -bottom-10 -right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -left-8 -translate-y-1/2 w-16 h-16 bg-white border border-border rounded-2xl shadow-lg flex items-center justify-center animate-bounce duration-[3000ms]">
            <Award className="w-8 h-8 text-primary" />
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default HeroSection;

import { ArrowRight, Truck, Zap, Award } from "lucide-react";

const HeroSection = () => (
  <section className="relative min-h-[100svh] sm:min-h-[90vh] flex items-center overflow-hidden bg-grid hero-gradient">
    {/* Decorative radial glows */}
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[800px] h-[400px] sm:h-[800px] rounded-full bg-primary/3 blur-3xl opacity-50" />
    </div>

    <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-20 relative z-10 w-full">
      <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
        
        {/* Left Content */}
        <div className="space-y-5 sm:space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary rounded-full px-4 py-1.5 sm:px-5 sm:py-2 text-[10px] sm:text-xs font-black uppercase tracking-widest animate-fade-in">
            <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
            Especialistas em Side Skirts
          </div>

          <div className="space-y-3 sm:space-y-4">
            <h1
              className="font-black uppercase leading-[0.85] tracking-tight text-[#0a1e36]"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(3rem, 10vw, 6rem)" }}
            >
              <span className="text-primary tracking-tighter">Estilo &</span>
              <br />
              <span className="text-[#0a1e36]">Performance</span>
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg lg:text-xl max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium">
              Transforme o visual do seu caminhão com saias laterais em{" "}
              <strong className="text-[#0a1e36]">Plástico ABS Industrial</strong>.{" "}
              Acabamento de fábrica com durabilidade superior.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="flex gap-6 sm:gap-10 py-2 sm:py-4 justify-center lg:justify-start">
            {[
              { num: "100%", label: "Encaixe" },
              { num: "ABS", label: "Material" },
              { num: "BR", label: "Entrega" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl sm:text-3xl font-black text-[#0a1e36] font-['Barlow_Condensed'] leading-none mb-1">{s.num}</p>
                <div className="w-6 h-1 bg-primary mb-1.5 sm:mb-2" />
                <p className="text-muted-foreground text-[9px] sm:text-[10px] font-black uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-3 sm:gap-4 pt-2 sm:pt-4 justify-center lg:justify-start">
            <a href="#produtos" className="btn-primary flex items-center gap-2 sm:gap-3 shadow-lg">
              Ver Catálogo
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>
            <a
              href="https://wa.me/5519983986895"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline flex items-center gap-2 sm:gap-3"
            >
              Pedir Orçamento
            </a>
          </div>

          {/* Trust Badges Simple */}
          <div className="flex flex-wrap gap-4 sm:gap-8 pt-4 sm:pt-6 border-t border-border/50 justify-center lg:justify-start">
            {[
              { icon: Truck, text: "Envio para todo o Brasil" },
              { icon: Award, text: "Instalação em Campinas" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 sm:gap-3 text-[#0a1e36] text-[10px] sm:text-xs font-black uppercase tracking-widest opacity-80">
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* Right Image Container */}
        <div className="relative mt-4 sm:mt-0">
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl animate-float border-[6px] sm:border-[12px] border-white ring-1 ring-border">
            <img
              src="/WhatsApp Image 2026-06-22 at 16.43.37.jpeg"
              alt="Caminhão com Saia Lateral Automatiza Plast"
              className="w-full object-cover max-h-[280px] sm:max-h-[400px] lg:max-h-none"
            />
            {/* Overlay badge */}
            <div className="absolute top-3 right-3 sm:top-6 sm:right-6 bg-white/90 backdrop-blur border border-primary/20 rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-xl">
              <p className="text-primary font-black text-xl sm:text-3xl uppercase leading-none mb-0.5 sm:mb-1" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Premium</p>
              <p className="text-[#0a1e36] font-black text-[9px] sm:text-sm uppercase tracking-[0.2em]">Side Skirts</p>
            </div>
          </div>
          
          {/* Decorative accents */}
          <div className="absolute -z-10 -bottom-10 -right-10 w-48 sm:w-64 h-48 sm:h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -left-4 sm:-left-8 -translate-y-1/2 w-10 h-10 sm:w-16 sm:h-16 bg-white border border-border rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center animate-bounce [animation-duration:3000ms]">
            <Award className="w-5 h-5 sm:w-8 sm:h-8 text-primary" />
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default HeroSection;

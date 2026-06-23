import BeforeAfterSlider from "./BeforeAfterSlider";
import scaniaBefore from "@/assets/scania-before.png";
import scaniaAfter from "@/assets/scania-after.png";
import volvoBefore from "@/assets/volvo-before.png";
import volvoAfter from "@/assets/volvo-after.png";
import { MessageCircle, ArrowRight } from "lucide-react";

const comparisons = [
  {
    id: 1,
    model: "Scania NTG",
    label: "Saia Lateral Premium",
    before: scaniaBefore,
    after: scaniaAfter,
  },
  {
    id: 2,
    model: "Volvo FH",
    label: "Saia Lateral Aerodinâmica",
    before: volvoBefore,
    after: volvoAfter,
  },
];

const BeforeAfterSection = () => (
  <section className="py-14 sm:py-28 relative overflow-hidden" id="antes-depois" style={{ background: "#0d1829" }}>
    {/* Decorative */}
    <div className="absolute inset-0 bg-dots opacity-20" />
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00BAF2]/20 to-transparent" />
    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00BAF2]/20 to-transparent" />

    <div className="container mx-auto px-4 sm:px-6 relative z-10">
      {/* Header */}
      <div className="text-center mb-10 sm:mb-20">
        <span className="section-label mb-5 inline-flex">Comparativo Visual</span>
        <h2 className="section-title mt-5 mb-6" style={{ color: 'white' }}>
          Antes &amp; <span className="accent" style={{ color: '#00BAF2' }}>Depois</span>
        </h2>
        <div className="line-accent mx-auto mb-8" style={{ background: '#00BAF2' }} />
        <p className="text-white/40 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
          Arraste o divisor para ver a transformação que nossas saias laterais fazem no visual do seu caminhão.
        </p>
      </div>

      {/* Sliders Grid */}
      <div className="grid md:grid-cols-2 gap-5 sm:gap-8 xl:gap-12">
        {comparisons.map((c, i) => (
          <div key={c.id} className="group">
            {/* Label */}
            <div className="flex items-center gap-4 mb-5">
              <div
                className="px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest"
                style={{
                  background: "rgba(0,186,242,0.08)",
                  border: "1px solid rgba(0,186,242,0.2)",
                  color: "#00BAF2",
                  fontFamily: "'Barlow Condensed', sans-serif",
                }}
              >
                {c.label}
              </div>
            </div>

            <div className="flex items-start gap-4 mb-5">
              <div
                className="w-1 h-12 rounded-full"
                style={{ background: "linear-gradient(180deg, #00BAF2, rgba(0,186,242,0.1))" }}
              />
              <div>
                <p
                  className="font-black text-3xl uppercase tracking-tighter text-white"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  {c.model}
                </p>
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
                  Saia Lateral em Plástico ABS
                </p>
              </div>
            </div>

            {/* Slider */}
            <div
              className="rounded-2xl overflow-hidden transition-all duration-500 group-hover:-translate-y-1"
              style={{
                border: "1px solid rgba(0,186,242,0.15)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
              }}
            >
              <BeforeAfterSlider
                beforeSrc={c.before}
                afterSrc={c.after}
                beforeLabel="Sem Saia"
                afterLabel="Com Saia"
              />
            </div>
          </div>
        ))}
      </div>

      {/* CTA Banner */}
      <div
        className="mt-12 sm:mt-20 p-8 sm:p-10 md:p-16 rounded-2xl sm:rounded-3xl text-center relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(0,186,242,0.08) 0%, rgba(10,30,54,0.5) 50%, rgba(0,186,242,0.05) 100%)",
          border: "1px solid rgba(0,186,242,0.15)",
        }}
      >
        {/* Ambient glow */}
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, #00BAF2, transparent)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-8 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(0,186,242,0.5), transparent)" }}
        />

        <div className="relative z-10">
          <span className="section-label mb-5 inline-flex">Mude o visual do seu bruto hoje</span>
          <h3
            className="font-black uppercase leading-none text-white mt-5 mb-6"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
          >
            Seu Caminhão Merece{" "}
            <span style={{ color: "#00BAF2", textShadow: "0 0 40px rgba(0,186,242,0.3)" }}>
              Essa Transformação
            </span>
          </h3>
          <p className="text-white/40 mb-10 max-w-lg mx-auto text-base leading-relaxed font-medium">
            Peças em estoque para envio imediato para todo o Brasil. Fale com um consultor agora.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/5519983986895"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              <MessageCircle className="w-4 h-4" />
              Falar no WhatsApp
            </a>
            <a href="#produtos" className="btn-outline">
              Ver Catálogo
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default BeforeAfterSection;

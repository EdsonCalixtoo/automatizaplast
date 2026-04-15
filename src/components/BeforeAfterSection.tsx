import BeforeAfterSlider from "./BeforeAfterSlider";
import scaniaBefore from "@/assets/scania-before.png";
import scaniaAfter from "@/assets/scania-after.png";
import volvoBefore from "@/assets/volvo-before.png";
import volvoAfter from "@/assets/volvo-after.png";

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
  <section className="py-24 bg-white" id="antes-depois">
    <div className="container mx-auto px-6">
      <div className="text-center mb-16">
        <p className="section-label mb-3">Comparativo Visual</p>
        <h2 className="section-title">
          Antes &amp; <span className="text-primary">Depois</span>
        </h2>
        <div className="line-accent mx-auto mt-4 mb-6" />
        <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Arraste o divisor para ver a transformação que nossas saias laterais fazem no visual do seu caminhão.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        {comparisons.map((c) => (
          <div key={c.id} className="space-y-6">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-1 bg-primary rounded-full" />
              <div>
                <p className="font-black text-3xl uppercase tracking-tighter text-[#0a1e36]" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{c.model}</p>
                <p className="text-primary text-xs font-black uppercase tracking-[0.2em]">{c.label}</p>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-border">
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

      {/* CTA Section */}
      <div className="mt-20 p-12 bg-secondary/50 rounded-3xl text-center relative overflow-hidden group border border-border">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <p className="section-label mb-4">Mude o visual do seu bruto hoje</p>
          <h3 className="text-4xl md:text-5xl font-black uppercase mb-6 leading-tight text-[#0a1e36]" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
            Seu Caminhão Merece <span className="text-primary">Essa Transformação</span>
          </h3>
          <p className="text-muted-foreground mb-10 max-w-lg mx-auto font-medium text-lg">
            Peças em estoque para envio imediato para todo o Brasil. Fale com um consultor agora.
          </p>
          <a
            href="https://wa.me/5519983986895"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center gap-4 text-lg px-12"
          >
            Falar no WhatsApp
          </a>
        </div>
      </div>
    </div>
  </section>
);

export default BeforeAfterSection;

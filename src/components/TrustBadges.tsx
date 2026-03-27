import { Truck, ShieldCheck, Wrench, CreditCard, Package, Star } from "lucide-react";

const badges = [
  {
    icon: Truck,
    title: "Envio Nacional",
    desc: "Entregamos para qualquer estado do Brasil com segurança através das melhores transportadoras.",
  },
  {
    icon: Wrench,
    title: "Instalação Completa",
    desc: "Nossa equipe faz a instalação do kit no seu caminhão em Campinas - SP sob agendamento.",
  },
  {
    icon: ShieldCheck,
    title: "Garantia Total",
    desc: "Todos os nossos produtos em fibra RTM possuem garantia direta de fábrica contra defeitos.",
  },
  {
    icon: CreditCard,
    title: "12x Sem Juros",
    desc: "Parcele seu kit em até 12x no cartão. Oferecemos condições especiais para boleto e PIX.",
  },
  {
    icon: Package,
    title: "Fibra RTM Premium",
    desc: "Usamos tecnologia de fibra por RTM, garantindo peças leves, lisas e extremamente resistentes.",
  },
  {
    icon: Star,
    title: "Acabamento Original",
    desc: "As peças saem prontas para pintura ou já pintadas, seguindo os padrões originais de cada marca.",
  },
];

const TrustBadges = () => (
  <section className="py-24 bg-white" id="como-funciona">
    <div className="container mx-auto px-6">
      <div className="text-center mb-20">
        <p className="section-label mb-3">Compromisso Automatiza Plast</p>
        <h2 className="section-title">
          Nossa <span className="text-primary tracking-tight">Diferença</span>
        </h2>
        <div className="line-accent mx-auto mt-4 mb-8" />
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
          Unimos tecnologia industrial com cuidado artesanal para entregar o melhor visual e performance para o seu bruto.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {badges.map((b) => (
          <div key={b.title} className="flex flex-col items-center text-center group p-4 hover:translate-y-[-5px] transition-transform duration-300">
            <div className="w-20 h-20 rounded-2xl bg-secondary/50 flex items-center justify-center mb-8 rotate-3 transition-transform duration-300 group-hover:rotate-0 group-hover:bg-primary/20 shadow-sm ring-1 ring-border group-hover:ring-primary/40 relative">
              <b.icon className="w-9 h-9 text-primary" />
              <div className="absolute inset-0 bg-primary/10 rounded-2xl scale-0 group-hover:scale-100 transition-transform duration-500 -z-10" />
            </div>
            <div>
              <p className="font-black text-2xl uppercase tracking-tighter mb-4 text-[#0a1e36]" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                {b.title}
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-[280px] font-medium">{b.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TrustBadges;

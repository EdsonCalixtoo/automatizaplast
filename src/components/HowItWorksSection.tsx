import { Wrench, Package, CheckCircle, Truck, Zap } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: Package,
    title: "Escolha seu Modelo",
    desc: "Selecione o kit de saia lateral compatível com seu caminhão em nosso catálogo. Temos para Scania, Volvo, Mercedes, Iveco, DAF e VW.",
  },
  {
    num: "02",
    icon: CheckCircle,
    title: "Orçamento & Pedido",
    desc: "Confirme a cor e o modelo com nosso time pelo WhatsApp. Enviamos o orçamento detalhado e você faz o pedido rápido.",
  },
  {
    num: "03",
    icon: Truck,
    title: "Envio ou Instalação",
    desc: "Você pode receber o kit em qualquer estado do Brasil com frete seguro ou agendar a instalação em nossa oficina em Campinas - SP.",
  },
  {
    num: "04",
    icon: Wrench,
    title: "Caminhão de Visual Novo",
    desc: "Peças prontas para pintar ou já pintadas. Encaixe perfeito no chassi original, transformando o visual do seu bruto em poucas horas.",
  },
];

const HowItWorksSection = () => (
  <section className="py-24 bg-white" id="instalacao">
    <div className="container mx-auto px-6">
      <div className="text-center mb-16">
        <p className="section-label mb-3">Processo Automatiza Plast</p>
        <h2 className="section-title">
          Como <span className="text-primary tracking-tight">Funciona</span>
        </h2>
        <div className="line-accent mx-auto mt-4 mb-6" />
        <p className="text-muted-foreground max-w-xl mx-auto text-lg leading-relaxed font-medium">
          Simplicidade e agilidade, desde o primeiro contato até o caminhão com side skirts novos na estrada.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative">
        {/* Connecting Arrows (desktop only) placeholder */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent hidden lg:block -translate-y-[100px]" />

        {steps.map((step, i) => (
          <div key={step.num} className="relative flex flex-col items-center text-center group pb-10 border-b border-border/50 lg:border-none lg:pb-0">
            {/* Step Icon Container */}
            <div className="relative mb-10">
              <div className="w-24 h-24 rounded-3xl bg-secondary flex items-center justify-center ring-4 ring-white group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-xl group-hover:rotate-6">
                <step.icon className="w-10 h-10 text-[#0a1e36] group-hover:text-white" />
              </div>
              <span 
                className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-black text-xs shadow-lg ring-4 ring-white"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                {step.num}
              </span>
            </div>

            <h3 className="text-2xl font-black uppercase mb-4 leading-tight text-[#0a1e36]" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              {step.title}
            </h3>
            <p className="text-muted-foreground text-sm font-medium leading-relaxed max-w-[240px]">{step.desc}</p>
          </div>
        ))}
      </div>

      {/* Special Highlights */}
      <div className="mt-24 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          { icon: Truck, title: "Envio Seguro", desc: "Trabalhamos com as melhores transportadoras do país." },
          { icon: Zap, title: "Pronta Entrega", desc: "Grande estoque de peças em fibra RTM para envio rápido." },
          { icon: Wrench, title: "Expertise", desc: "Nossa equipe conhece cada curva dos modelos de caminhão." },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="p-8 bg-secondary/30 rounded-2xl flex items-center gap-6 border border-border/40 hover:bg-white hover:shadow-xl hover:border-primary/20 transition-all duration-300 group">
            <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
              <Icon className="w-6 h-6 text-primary group-hover:text-white" />
            </div>
            <div>
              <p className="font-black text-lg uppercase tracking-tight text-[#0a1e36]" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{title}</p>
              <p className="text-muted-foreground text-xs font-semibold leading-snug">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorksSection;

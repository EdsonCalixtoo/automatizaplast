import { useState } from "react";
import { MessageCircle, Phone, MapPin, Clock, Send, Star } from "lucide-react";
import { supabase } from "@/lib/supabase";

const ContactSection = () => {
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    email: "",
    modelo: "",
    mensagem: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Salvar Lead no Supabase
    try {
      await supabase.from('leads').insert([{
        name: formData.nome,
        email: formData.email,
        phone: formData.telefone,
        truck_model: formData.modelo,
        message: formData.mensagem
      }]);
    } catch (err) {
      console.error("Erro ao salvar lead:", err);
    }

    const message = `*Nova Solicitação de Orçamento - Automatiza Plast*%0A%0A` +
      `*Nome:* ${formData.nome}%0A` +
      `*Telefone:* ${formData.telefone}%0A` +
      `*Email:* ${formData.email || "Não informado"}%0A` +
      `*Modelo do Caminhão:* ${formData.modelo || "Não informado"}%0A` +
      `*Dúvida:* ${formData.mensagem}`;

    const whatsappUrl = `https://wa.me/5519983986895?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <section className="py-24 bg-white" id="contato">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <p className="section-label mb-3">Atendimento Customizado</p>
          <h2 className="section-title">
            Fale com <span className="text-primary">Especialistas</span>
          </h2>
          <div className="line-accent mx-auto mt-4 mb-6" />
          <p className="text-muted-foreground max-w-xl mx-auto text-lg leading-relaxed font-medium">
            Tire suas dúvidas sobre instalação, prazos de entrega e condições de pagamento. Estamos aqui para ajudar seu caminhão a se destacar.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left – Info */}
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                {
                  icon: MessageCircle,
                  title: "WhatsApp",
                  value: "(19) 98398-6895",
                  href: "https://wa.me/5519983986895",
                  sub: "Atendimento imediato",
                },
                {
                  icon: Phone,
                  title: "Televendas",
                  value: "(19) 98398-6895",
                  href: "tel:19983986895",
                  sub: "Segunda à Sexta",
                },
                {
                  icon: MapPin,
                  title: "Fábrica e Oficina",
                  value: "R. Dr. Élton César, 910",
                  href: "https://maps.google.com/?q=R.+Dr.+Élton+César,+910,+Campinas,+SP",
                  sub: "Campinas – SP, 13082-025",
                },
                {
                  icon: Clock,
                  title: "Horário",
                  value: "8h às 18h",
                  href: null,
                  sub: "Sábado até 12h",
                },
              ].map(({ icon: Icon, title, value, href, sub }) => (
                <div key={title} className="p-8 bg-secondary/50 border border-border rounded-2xl hover:translate-y-[-5px] transition-transform duration-300 group">
                  <div className="w-14 h-14 bg-white border border-border rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors relative">
                    <Icon className="w-6 h-6 text-primary group-hover:text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mb-2">{title}</p>
                    {href ? (
                      <a href={href} className="font-bold text-[#0a1e36] text-lg hover:text-primary transition-colors block leading-tight mb-2 tracking-tighter" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                        {value}
                      </a>
                    ) : (
                      <p className="font-bold text-[#0a1e36] text-lg leading-tight mb-2 tracking-tighter" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{value}</p>
                    )}
                    <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-widest">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[#0a1e36] p-10 rounded-3xl text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:rotate-12 transition-transform duration-700">
                <Star className="w-24 h-24 text-primary fill-primary" />
              </div>
              <p className="text-primary font-black uppercase tracking-widest text-xs mb-4">Suporte Técnico</p>
              <h3 className="text-3xl font-black uppercase mb-4 leading-none" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Precisando de ajuda com instalação?</h3>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed max-w-xs">Nossos técnicos estão disponíveis para vídeo-chamadas e suporte via WhatsApp.</p>
              <a href="https://wa.me/5519983986895" className="btn-primary inline-flex items-center gap-3">
                <MessageCircle className="w-5 h-5" />
                Chamar Agora
              </a>
            </div>
          </div>

          {/* Right – Form */}
          <div className="bg-white border-[10px] border-secondary/50 rounded-[40px] p-10 shadow-2xl relative">
            <div className="absolute -top-12 right-12 w-24 h-24 bg-primary rounded-full blur-[60px] opacity-20" />
            <h3 className="text-4xl font-black uppercase mb-8 leading-tight text-[#0a1e36]" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              Solicitar <span className="text-primary">Orçamento</span> Rápido
            </h3>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="nome"
                    placeholder="Seu nome"
                    value={formData.nome}
                    onChange={handleChange}
                    className="w-full bg-secondary border-none rounded-2xl px-6 py-4 text-sm text-[#0a1e36] placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40 transition-shadow outline-none font-medium"
                    required
                  />
                  <input
                    type="tel"
                    name="telefone"
                    placeholder="(00) 00000-0000"
                    value={formData.telefone}
                    onChange={handleChange}
                    className="w-full bg-secondary border-none rounded-2xl px-6 py-4 text-sm text-[#0a1e36] placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40 transition-shadow outline-none font-medium"
                    required
                  />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-secondary border-none rounded-2xl px-6 py-4 text-sm text-[#0a1e36] placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40 transition-shadow outline-none font-medium"
                />
                <select 
                  name="modelo"
                  value={formData.modelo}
                  onChange={handleChange}
                  className="w-full bg-secondary border-none rounded-2xl px-6 py-4 text-sm text-[#0a1e36] focus:ring-2 focus:ring-primary/40 transition-shadow outline-none font-medium text-muted-foreground"
                >
                  <option value="">Selecione seu modelo de caminhão...</option>
                  {["Scania NTG", "Volvo FH", "Mercedes Actros", "Iveco S-Way", "DAF XF", "Outro"].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <textarea
                  name="mensagem"
                  rows={4}
                  placeholder="Como podemos ajudar seu caminhão hoje? (ex: cotação de kit, dúvidas instalação)"
                  value={formData.mensagem}
                  onChange={handleChange}
                  className="w-full bg-secondary border-none rounded-2xl px-6 py-4 text-sm text-[#0a1e36] placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40 transition-shadow outline-none resize-none font-medium"
                />
              </div>
              <button
                type="submit"
                className="btn-primary w-full flex items-center justify-center gap-3 text-lg py-5 shadow-2xl rounded-2xl"
              >
                <Send className="w-5 h-5" />
                Enviar via WhatsApp
              </button>
              <p className="text-center text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">
                Respondemos em até 15 minutos em horário comercial
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;

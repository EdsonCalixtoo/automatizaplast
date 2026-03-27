import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => (
  <a
    href="https://wa.me/5519983986895"
    target="_blank"
    rel="noopener noreferrer"
    className="btn-whatsapp"
    aria-label="Falar no WhatsApp"
  >
    <MessageCircle className="w-7 h-7" />
  </a>
);

export default WhatsAppButton;

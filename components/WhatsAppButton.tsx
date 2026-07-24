'use client';

import { MessageCircle } from 'lucide-react';

export function WhatsAppButton() {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+51999888777';
  const text = encodeURIComponent('Hola Cryzan Sport, deseo consultar sobre productos y envíos.');

  return (
    <a
      href={`https://wa.me/${number.replace(/[^0-9]/g, '')}?text=${text}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-emerald-500 hover:bg-emerald-600 text-white p-3.5 rounded-full shadow-2xl transition transform hover:scale-110 flex items-center gap-2 font-bold text-xs"
      title="Contactar por WhatsApp Business"
    >
      <MessageCircle className="w-6 h-6 fill-current" />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}

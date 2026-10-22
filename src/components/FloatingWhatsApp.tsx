import React from 'react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { StoreSettings } from '../types';
import { toWhatsAppNumber, OFFICIAL_WHATSAPP_NUMBER } from '../lib/policy';

interface FloatingWhatsAppProps {
  settings: StoreSettings;
}

export function FloatingWhatsApp({ settings }: FloatingWhatsAppProps) {
  const number = toWhatsAppNumber(settings?.whatsappNumber || OFFICIAL_WHATSAPP_NUMBER);
  const message = 'Hello Zaplix Team! I would like to inquire about your products.';
  const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Zaplix on WhatsApp (03189869746)"
      className="fixed z-40 right-4 bottom-24 md:right-6 md:bottom-6 w-[60px] h-[60px] md:w-[54px] md:h-[54px] rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white shadow-[0_8px_22px_rgba(37,211,102,0.45)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer group"
    >
      <WhatsAppIcon className="w-8 h-8 md:w-7 md:h-7 fill-white text-white group-hover:scale-110 transition-transform" />
    </a>
  );
}

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { StoreSettings } from '../types';

interface FloatingWhatsAppProps {
  settings: StoreSettings;
}

export function FloatingWhatsApp({ settings }: FloatingWhatsAppProps) {
  const [showTooltip, setShowTooltip] = useState(true);
  const cleanWhatsApp = settings.whatsappNumber.replace(/^0/, '92').replace(/[^0-9]/g, '');

  const defaultMessage = 'Assalam-o-Alaikum Ali Electronic, I would like to inquire about your products.';
  const whatsappUrl = `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2 group">
      
      {/* Quick Tooltip banner (dismissible or auto) */}
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl text-xs text-slate-800 dark:text-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-semibold text-slate-800 dark:text-slate-100">Need help? Chat with Ali Electronic on WhatsApp</span>
          <button
            onClick={() => setShowTooltip(false)}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-1 cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Floating Button with proper WhatsApp Logo */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Ali Electronic on WhatsApp"
        className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white shadow-xl shadow-[#25D366]/40 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center relative focus:outline-none focus:ring-4 focus:ring-[#25D366]/40 cursor-pointer"
      >
        {/* Subtle pulsing glow */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366]/30 animate-pulse pointer-events-none" />
        <WhatsAppIcon className="w-7 h-7 fill-white text-white drop-shadow-sm" />
      </a>
    </div>
  );
}

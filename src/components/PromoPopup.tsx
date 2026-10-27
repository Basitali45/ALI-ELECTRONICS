import React, { useState, useEffect } from 'react';
import { X, Sparkles, ArrowRight, MessageCircle } from 'lucide-react';
import { PromoPopupConfig } from '../types';
import { OFFICIAL_WHATSAPP_NUMBER, getWhatsAppUrl } from '../lib/policy';

interface PromoPopupProps {
  config: PromoPopupConfig;
  whatsappNumber: string;
  onNavigate?: (sectionId: string) => void;
}

export function PromoPopup({ config, whatsappNumber, onNavigate }: PromoPopupProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!config.enabled) return;

    if (config.showOnce) {
      const shown = sessionStorage.getItem('zaplix_promo_shown');
      if (shown) return;
    }

    const timer = setTimeout(() => {
      setIsOpen(true);
      if (config.showOnce) {
        sessionStorage.setItem('zaplix_promo_shown', 'true');
      }
    }, (config.delaySeconds || 3) * 1000);

    return () => clearTimeout(timer);
  }, [config]);

  if (!isOpen || !config.enabled) return null;

  const handleAction = () => {
    setIsOpen(false);
    if (config.buttonLink) {
      if (config.buttonLink.startsWith('#') && onNavigate) {
        onNavigate(config.buttonLink.substring(1));
      } else {
        window.location.href = config.buttonLink;
      }
    }
  };

  const cleanPhone = (whatsappNumber || OFFICIAL_WHATSAPP_NUMBER).replace(/^0/, '92').replace(/[^0-9]/g, '');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 shadow-sm cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {config.image && (
          <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-slate-900">
            <img
              src={config.image}
              alt={config.title}
              className="w-full h-full object-cover object-center opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
          </div>
        )}

        <div className="p-6 sm:p-8 space-y-4 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Exclusive Promotion</span>
          </div>

          <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white leading-tight">
            {config.title}
          </h3>

          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
            {config.description}
          </p>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAction}
              className="flex-1 py-3 px-5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{config.buttonText || 'Shop Now'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href={getWhatsAppUrl(`Hello Zaplix Team! I saw your special promotion: "${config.title}". What offers are available?`)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="py-3 px-5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Ask on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

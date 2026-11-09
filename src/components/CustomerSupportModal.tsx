import React from 'react';
import { 
  X, 
  Headset, 
  Phone, 
  Clock, 
  Truck, 
  ShieldCheck, 
  RefreshCw, 
  MessageSquare, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { StoreSettings } from '../types';
import { 
  OFFICIAL_WHATSAPP_NUMBER, 
  OFFICIAL_WHATSAPP_LINK, 
  OFFICIAL_LOGO_IMAGE,
  getWhatsAppUrl 
} from '../lib/policy';

interface CustomerSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenVoiceAgent: () => void;
  settings?: StoreSettings;
}

export function CustomerSupportModal({
  isOpen,
  onClose,
  onOpenVoiceAgent,
  settings,
}: CustomerSupportModalProps) {
  if (!isOpen) return null;

  const phone = settings?.phone1 || OFFICIAL_WHATSAPP_NUMBER;
  const businessName = settings?.businessName || 'ZAPLIX';

  const handleStartAgent = () => {
    onClose();
    onOpenVoiceAgent();
  };

  const quickQuestions = [
    {
      title: 'Order Tracking & Status',
      desc: 'Ask about dispatch status & tracking number',
      action: () => {
        window.open(getWhatsAppUrl('Hello Zaplix Support, I want to track my order status. My phone number is: '), '_blank');
      },
    },
    {
      title: '7-Day Easy Returns & Exchanges',
      desc: 'Got a damaged or incorrect product? Get hassle-free replacement',
      action: () => {
        window.open(getWhatsAppUrl('Hello Zaplix Support, I would like to request an exchange/return for my order: '), '_blank');
      },
    },
    {
      title: 'Cash on Delivery & Delivery Time',
      desc: 'Free home delivery takes 2–4 working days nationwide',
      action: () => {
        window.open(getWhatsAppUrl('Hello Zaplix Support, what is the delivery time for my city?'), '_blank');
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0c1424] rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800/90 overflow-hidden text-slate-900 dark:text-slate-100 z-10 my-8">
        
        {/* Header with Zaplix Branding */}
        <div className="relative bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 border-b border-amber-500/30">
          <button
            onClick={onClose}
            aria-label="Close Customer Support Modal"
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5 pr-8">
            <div className="relative w-13 h-13 rounded-2xl overflow-hidden border-2 border-amber-400/90 ring-2 ring-amber-500/30 shadow-lg bg-black shrink-0">
              <img
                src={OFFICIAL_LOGO_IMAGE}
                alt={`${businessName} Official Logo`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-xs" />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-black text-lg sm:text-xl tracking-tight text-white">
                  ZAPLIX Customer Care
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live 24/7
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Official Help &amp; Instant Assistance Desk for Pakistan
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          
          {/* Primary Action: Launch Voice & Chat AI Agent */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-900/15 via-blue-900/10 to-amber-500/10 dark:from-indigo-950/40 dark:via-blue-950/30 dark:to-amber-950/20 border border-indigo-200/80 dark:border-indigo-800/60 shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-md shrink-0">
                  <Headset className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>AI Voice &amp; Chat Support</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Instant Urdu &amp; English replies on products, prices &amp; order queries
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleStartAgent}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-700 text-white shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Headset className="w-4 h-4" />
              <span>Launch Zaplix AI Agent (Voice &amp; Chat)</span>
            </button>
          </div>

          {/* Direct WhatsApp & Call Helpline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* WhatsApp */}
            <a
              href={getWhatsAppUrl('Hello Zaplix Customer Support! I need assistance with: ')}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/40 transition-all flex items-center gap-3 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                <WhatsAppIcon className="w-6 h-6 fill-white" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                  WhatsApp Support
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                  {phone}
                </div>
              </div>
            </a>

            {/* Direct Phone Call */}
            <a
              href={`tel:${phone}`}
              className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/60 hover:bg-blue-100/80 dark:hover:bg-blue-900/40 transition-all flex items-center gap-3 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                <Phone className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-blue-900 dark:text-cyan-300">
                  Helpline Call
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                  0318-9869746
                </div>
              </div>
            </a>
          </div>

          {/* Quick FAQ / Topics */}
          <div className="space-y-2">
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Quick Inquiries &amp; Help Topics
            </h5>
            <div className="space-y-2">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={q.action}
                  className="w-full text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200/70 dark:border-slate-800 transition-colors flex items-center justify-between gap-3 cursor-pointer group"
                >
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {q.title}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {q.desc}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Store Guarantees */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center text-[10px] text-slate-600 dark:text-slate-400">
            <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/40">
              <Truck className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              <span className="font-bold">Free Home Delivery</span>
              <span className="text-[9px] text-slate-400">Nationwide Rs. 0</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/40">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="font-bold">Cash on Delivery</span>
              <span className="text-[9px] text-slate-400">Pay at Doorstep</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/40">
              <RefreshCw className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="font-bold">7-Day Returns</span>
              <span className="text-[9px] text-slate-400">Easy Replacement</span>
            </div>
          </div>

          {/* Operating hours */}
          <div className="text-center text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5 pt-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Support Timings: 9:00 AM – 11:00 PM (Monday – Sunday)</span>
          </div>

        </div>

      </div>
    </div>
  );
}

export default CustomerSupportModal;

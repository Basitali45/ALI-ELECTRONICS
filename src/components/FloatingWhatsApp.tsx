import React, { useEffect, useState } from 'react';
import { Headset, Sparkles, Mic } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { StoreSettings } from '../types';
import { getWhatsAppUrl, OFFICIAL_WHATSAPP_LINK } from '../lib/policy';

interface FloatingWhatsAppProps {
  settings: StoreSettings;
}

function findVoicePilotHost(): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  const divs = Array.from(document.querySelectorAll('body > div'));
  for (const div of divs) {
    if (div.shadowRoot && (div.shadowRoot.querySelector('.fab') || div.shadowRoot.querySelector('.panel'))) {
      return div as HTMLElement;
    }
  }
  return null;
}

export function FloatingWhatsApp({ settings: _settings }: FloatingWhatsAppProps) {
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [agentReady, setAgentReady] = useState(false);
  const waUrl = getWhatsAppUrl('Hello Zaplix Team! I would like to inquire about your products.');

  useEffect(() => {
    // Style and seamlessly dock VoicePilot widget to work with our custom agent button
    const setupVoicePilot = () => {
      const host = findVoicePilotHost();
      if (host && host.shadowRoot) {
        setAgentReady(true);
        let customStyle = host.shadowRoot.getElementById('zaplix-vp-override');
        if (!customStyle) {
          customStyle = document.createElement('style');
          customStyle.id = 'zaplix-vp-override';
          customStyle.textContent = `
            .fab {
              display: none !important;
              opacity: 0 !important;
              pointer-events: none !important;
              visibility: hidden !important;
            }
            .panel {
              bottom: 206px !important;
              right: 16px !important;
              z-index: 2147483647 !important;
              box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35) !important;
              border: 1px solid rgba(255, 255, 255, 0.15) !important;
              border-radius: 20px !important;
            }
            @media (min-width: 768px) {
              .panel {
                bottom: 156px !important;
                right: 24px !important;
              }
            }
          `;
          host.shadowRoot.appendChild(customStyle);
        }

        // Track when panel opens or closes
        const panel = host.shadowRoot.querySelector('.panel');
        if (panel) {
          const checkOpen = () => {
            setIsAgentOpen(panel.classList.contains('open'));
          };
          const observer = new MutationObserver(checkOpen);
          observer.observe(panel, { attributes: true, attributeFilter: ['class'] });
          return () => observer.disconnect();
        }
      }
      return undefined;
    };

    let cleanup = setupVoicePilot();
    const interval = setInterval(() => {
      const c = setupVoicePilot();
      if (c) {
        cleanup = c;
        clearInterval(interval);
      }
    }, 300);

    const timeout = setTimeout(() => clearInterval(interval), 12000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      if (cleanup) cleanup();
    };
  }, []);

  const handleToggleAgent = () => {
    const host = findVoicePilotHost();
    if (host && host.shadowRoot) {
      const fab = host.shadowRoot.querySelector('.fab') as HTMLElement | null;
      const panel = host.shadowRoot.querySelector('.panel') as HTMLElement | null;
      if (fab) {
        fab.click();
      } else if (panel) {
        panel.classList.toggle('open');
      }
      if (panel) {
        setIsAgentOpen(panel.classList.contains('open'));
      }
    } else {
      // If script is still mounting
      setTimeout(() => {
        const h = findVoicePilotHost();
        const f = h?.shadowRoot?.querySelector('.fab') as HTMLElement | null;
        if (f) f.click();
      }, 400);
    }
  };

  return (
    <>
      {/* 1. PROFESSIONAL CUSTOMER AGENT BUTTON (Adjusted directly ABOVE WhatsApp) */}
      <div 
        className="fixed z-40 right-4 bottom-[140px] md:right-6 md:bottom-[92px] flex items-center group"
      >
        {/* Tooltip Pill (Desktop & Hover) */}
        <div className="hidden md:flex items-center gap-1.5 mr-3 px-3 py-1.5 rounded-full bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md text-white text-xs font-semibold shadow-xl border border-slate-700/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Customer AI Agent · Voice & Chat</span>
        </div>

        {/* Support Agent Button */}
        <button
          type="button"
          onClick={handleToggleAgent}
          aria-label="Customer Support Agent (Voice & Chat)"
          className={`relative w-[52px] h-[52px] md:w-[56px] md:h-[56px] rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 shadow-[0_8px_25px_rgba(30,58,138,0.45)] hover:shadow-[0_12px_30px_rgba(79,70,229,0.55)] hover:scale-105 active:scale-95 ${
            isAgentOpen
              ? 'bg-gradient-to-tr from-rose-600 to-indigo-600 text-white ring-4 ring-rose-400/40'
              : 'bg-gradient-to-tr from-slate-950 via-indigo-900 to-blue-600 text-white hover:from-slate-900 hover:to-indigo-500 ring-2 ring-indigo-400/30'
          }`}
        >
          {/* Subtle Ambient Pulse Ring */}
          <span className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping -z-10 opacity-75" />

          {/* Agent Avatar / Headset Icon */}
          <div className="relative flex items-center justify-center">
            <Headset className="w-6 h-6 md:w-7 md:h-7 text-white transition-transform group-hover:scale-110" />
            <Mic className="w-2.5 h-2.5 text-cyan-300 absolute -bottom-1 -right-1" />
          </div>

          {/* Active Online Status Badge */}
          <span 
            className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 shadow-xs flex items-center justify-center"
            title={agentReady ? 'Customer Agent Online' : 'Connecting...'}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          </span>
        </button>
      </div>

      {/* 2. OFFICIAL WHATSAPP BUTTON (Positioned below Customer Agent) */}
      <div 
        className="fixed z-40 right-4 bottom-[76px] md:right-6 md:bottom-6 flex items-center group"
      >
        {/* Tooltip Pill (Desktop & Hover) */}
        <div className="hidden md:flex items-center gap-1.5 mr-3 px-3 py-1.5 rounded-full bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md text-white text-xs font-semibold shadow-xl border border-slate-700/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Message Zaplix Store on WhatsApp</span>
        </div>

        {/* WhatsApp Button */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Message Zaplix Store on WhatsApp"
          className="w-[52px] h-[52px] md:w-[56px] md:h-[56px] rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white shadow-[0_8px_24px_rgba(37,211,102,0.45)] hover:shadow-[0_12px_28px_rgba(37,211,102,0.6)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer group"
        >
          <WhatsAppIcon className="w-7 h-7 md:w-8 md:h-8 fill-white text-white group-hover:scale-110 transition-transform" />
        </a>
      </div>
    </>
  );
}

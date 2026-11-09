import React, { useEffect, useState, useRef } from 'react';
import { Headset, Sparkles, X, MessageSquare, Phone, ShieldCheck } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { StoreSettings } from '../types';
import { 
  getWhatsAppUrl, 
  OFFICIAL_LOGO_IMAGE, 
  OFFICIAL_WHATSAPP_NUMBER 
} from '../lib/policy';

interface FloatingWhatsAppProps {
  settings: StoreSettings;
  onOpenSupportModal?: () => void;
}

function findVoicePilotHost(): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  const divs = Array.from(document.querySelectorAll('body > div'));
  for (const div of divs) {
    if (
      div.shadowRoot &&
      (div.shadowRoot.querySelector('.launcher') ||
        div.shadowRoot.querySelector('#launch') ||
        div.shadowRoot.querySelector('.panel') ||
        div.shadowRoot.querySelector('.fab'))
    ) {
      return div as HTMLElement;
    }
  }
  return null;
}

export function FloatingWhatsApp({ settings: _settings, onOpenSupportModal }: FloatingWhatsAppProps) {
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [agentReady, setAgentReady] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(true);
  const [showPromptBadge, setShowPromptBadge] = useState(true);
  const waUrl = getWhatsAppUrl('Hello Zaplix Customer Support! I would like to inquire about your products.');

  useEffect(() => {
    // Customize VoicePilot widget: hide default purple button, inject Zaplix branding and fullscreen rules
    const setupVoicePilot = () => {
      const host = findVoicePilotHost();
      if (host && host.shadowRoot) {
        setAgentReady(true);

        // 1. Hide external purple launcher button immediately
        const launcher = host.shadowRoot.querySelector('.launcher, #launch, .fab') as HTMLElement | null;
        if (launcher) {
          launcher.style.setProperty('display', 'none', 'important');
          launcher.style.setProperty('opacity', '0', 'important');
          launcher.style.setProperty('pointer-events', 'none', 'important');
          launcher.style.setProperty('visibility', 'hidden', 'important');
          launcher.style.setProperty('width', '0', 'important');
          launcher.style.setProperty('height', '0', 'important');
          launcher.style.setProperty('position', 'absolute', 'important');
          launcher.style.setProperty('top', '-9999px', 'important');
        }

        // 2. Inject Zaplix Custom Styles into ShadowRoot
        let customStyle = host.shadowRoot.getElementById('zaplix-vp-override');
        if (!customStyle) {
          customStyle = document.createElement('style');
          customStyle.id = 'zaplix-vp-override';
          customStyle.textContent = `
            /* 1. HIDE EXTERNAL PURPLE LAUNCHER COMPLETELY */
            .launcher,
            #launch,
            .fab,
            button[aria-label="Open chat"] {
              display: none !important;
              opacity: 0 !important;
              pointer-events: none !important;
              visibility: hidden !important;
              width: 0 !important;
              height: 0 !important;
              position: absolute !important;
              top: -9999px !important;
              left: -9999px !important;
              transform: scale(0) !important;
            }

            /* 2. BASE PANEL SPECIFICATION - NO TOP CROPPING */
            .panel {
              z-index: 2147483647 !important;
              box-shadow: 0 25px 60px -12px rgba(15, 23, 42, 0.45) !important;
              background: #ffffff !important;
              color: #0f172a !important;
              overflow: hidden !important;
              font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
            }

            /* MOBILE: 100% FULL SCREEN SUPPORT - NEVER CROPPED AT THE TOP */
            @media (max-width: 768px) {
              .panel {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                width: 100vw !important;
                max-width: 100vw !important;
                height: 100% !important;
                height: 100dvh !important;
                max-height: 100dvh !important;
                border-radius: 0 !important;
                margin: 0 !important;
                box-shadow: none !important;
                border: none !important;
              }

              .panel.open {
                display: flex !important;
                flex-direction: column !important;
              }

              .panel .head {
                padding-top: max(16px, env(safe-area-inset-top, 16px)) !important;
                padding-left: max(16px, env(safe-area-inset-left, 16px)) !important;
                padding-right: max(16px, env(safe-area-inset-right, 16px)) !important;
                min-height: 68px !important;
              }

              .panel .composer {
                padding-bottom: max(12px, env(safe-area-inset-bottom, 12px)) !important;
              }

              .panel .foot {
                padding-bottom: max(10px, env(safe-area-inset-bottom, 10px)) !important;
              }
            }

            /* LAPTOP / DESKTOP: PROPER VIEWPORT WITH SAFE TOP MARGIN & BORDER RADIUS */
            @media (min-width: 769px) {
              .panel {
                position: fixed !important;
                top: auto !important;
                bottom: 24px !important;
                right: 24px !important;
                left: auto !important;
                width: 440px !important;
                max-width: calc(100vw - 48px) !important;
                height: min(650px, calc(100vh - 48px)) !important;
                max-height: calc(100vh - 48px) !important;
                border-radius: 24px !important;
                border: 1px solid rgba(226, 232, 240, 0.9) !important;
                box-shadow: 0 25px 60px -12px rgba(15, 23, 42, 0.35), 0 0 0 1px rgba(0, 0, 0, 0.05) !important;
              }

              .panel.open {
                display: flex !important;
                flex-direction: column !important;
              }

              /* Fullscreen Mode on Laptop */
              .panel.vp-fullscreen {
                top: 20px !important;
                left: 20px !important;
                right: 20px !important;
                bottom: 20px !important;
                width: calc(100vw - 40px) !important;
                max-width: 1060px !important;
                margin: 0 auto !important;
                height: calc(100vh - 40px) !important;
                max-height: calc(100vh - 40px) !important;
                border-radius: 20px !important;
                box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5) !important;
              }
            }

            /* LUXURY ZAPLIX BRANDED HEADER */
            .panel .head {
              background: linear-gradient(135deg, #070e1b 0%, #0f172a 45%, #1e1b4b 100%) !important;
              border-bottom: 2px solid rgba(245, 158, 11, 0.35) !important;
              padding: 14px 18px !important;
            }

            .panel .head #avatar {
              width: 42px !important;
              height: 42px !important;
              border-radius: 50% !important;
              overflow: hidden !important;
              border: 2px solid #f59e0b !important;
              box-shadow: 0 2px 8px rgba(245, 158, 11, 0.35) !important;
              background: #000000 !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              flex-shrink: 0 !important;
            }

            .panel .head #avatar img {
              width: 100% !important;
              height: 100% !important;
              object-fit: cover !important;
            }

            .panel .head .who .name,
            .panel .head #title {
              font-weight: 800 !important;
              font-size: 15px !important;
              letter-spacing: -0.01em !important;
              color: #ffffff !important;
              display: flex !important;
              align-items: center !important;
              gap: 6px !important;
            }

            .panel .head .status {
              font-size: 11px !important;
              color: #93c5fd !important;
              display: flex !important;
              align-items: center !important;
              gap: 6px !important;
            }

            .panel .head .status .dot {
              background: #10b981 !important;
              box-shadow: 0 0 8px #10b981 !important;
            }

            /* HEADER ACTION BUTTONS */
            .panel .head .actions {
              display: flex !important;
              align-items: center !important;
              gap: 6px !important;
            }

            .panel .head .actions .icon {
              background: rgba(255, 255, 255, 0.16) !important;
              border-radius: 10px !important;
              min-width: 36px !important;
              height: 36px !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              cursor: pointer !important;
              color: #ffffff !important;
              transition: all 0.18s ease !important;
              border: 1px solid rgba(255, 255, 255, 0.15) !important;
            }

            .panel .head .actions .icon:hover {
              background: rgba(255, 255, 255, 0.3) !important;
              transform: scale(1.05) !important;
            }

            #min {
              background: rgba(255, 255, 255, 0.22) !important;
            }
          `;
          host.shadowRoot.appendChild(customStyle);
        }

        // 3. Customize Header Avatar & Title with Zaplix Official Logo & Branding
        const avatarEl = host.shadowRoot.querySelector('#avatar');
        if (avatarEl && !avatarEl.querySelector('img')) {
          avatarEl.innerHTML = `<img src="${OFFICIAL_LOGO_IMAGE}" alt="ZAPLIX Support" style="width:100%;height:100%;object-fit:cover;" onerror="this.src='/favicon.svg';" />`;
        }

        const titleEl = host.shadowRoot.querySelector('#title');
        if (titleEl && !titleEl.getAttribute('data-zaplix-branded')) {
          titleEl.textContent = 'ZAPLIX Customer Support';
          titleEl.setAttribute('data-zaplix-branded', 'true');
        }

        const statusEl = host.shadowRoot.querySelector('.head .status');
        if (statusEl && !statusEl.getAttribute('data-zaplix-branded')) {
          statusEl.innerHTML = `<span class="dot"></span> 24/7 Live Support · اردو & English`;
          statusEl.setAttribute('data-zaplix-branded', 'true');
        }

        // 4. Inject Fullscreen Toggle button on Desktop header actions if not already injected
        const actions = host.shadowRoot.querySelector('.head .actions');
        if (actions && !host.shadowRoot.getElementById('vp-expand-btn')) {
          const expandBtn = document.createElement('button');
          expandBtn.id = 'vp-expand-btn';
          expandBtn.className = 'icon';
          expandBtn.type = 'button';
          expandBtn.title = 'Full Screen';
          expandBtn.setAttribute('aria-label', 'Toggle full screen');
          expandBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>`;
          expandBtn.onclick = (e) => {
            e.stopPropagation();
            const p = host.shadowRoot?.querySelector('.panel');
            if (p) {
              const isFull = p.classList.toggle('vp-fullscreen');
              expandBtn.title = isFull ? 'Restore Size' : 'Full Screen';
              expandBtn.innerHTML = isFull
                ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7"/></svg>`
                : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>`;
            }
          };
          const minBtn = actions.querySelector('#min');
          if (minBtn) {
            actions.insertBefore(expandBtn, minBtn);
          } else {
            actions.appendChild(expandBtn);
          }
        }

        // 5. Track when panel opens or closes
        const panel = host.shadowRoot.querySelector('.panel');
        if (panel) {
          const checkOpen = () => {
            const open = panel.classList.contains('open');
            setIsAgentOpen(open);
            // Re-apply Zaplix avatar/title if VoicePilot re-rendered its header
            const currentTitle = host.shadowRoot?.querySelector('#title');
            if (currentTitle && currentTitle.textContent !== 'ZAPLIX Customer Support') {
              currentTitle.textContent = 'ZAPLIX Customer Support';
            }
            const currentAvatar = host.shadowRoot?.querySelector('#avatar');
            if (currentAvatar && !currentAvatar.querySelector('img')) {
              currentAvatar.innerHTML = `<img src="${OFFICIAL_LOGO_IMAGE}" alt="ZAPLIX Support" style="width:100%;height:100%;object-fit:cover;" onerror="this.src='/favicon.svg';" />`;
            }
          };
          const observer = new MutationObserver(checkOpen);
          observer.observe(panel, { attributes: true, attributeFilter: ['class', 'style'] });
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
    }, 250);

    const timeout = setTimeout(() => clearInterval(interval), 15000);

    const handleExternalOpen = () => {
      handleToggleAgent();
    };
    window.addEventListener('zaplix:open-voice-agent', handleExternalOpen);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      window.removeEventListener('zaplix:open-voice-agent', handleExternalOpen);
      if (cleanup) cleanup();
    };
  }, []);

  const handleToggleAgent = () => {
    const host = findVoicePilotHost();
    if (host && host.shadowRoot) {
      const launcher = (host.shadowRoot.querySelector('#launch') ||
        host.shadowRoot.querySelector('.launcher') ||
        host.shadowRoot.querySelector('.fab')) as HTMLElement | null;
      const panel = host.shadowRoot.querySelector('.panel') as HTMLElement | null;

      if (launcher) {
        launcher.click();
      } else if (panel) {
        panel.classList.toggle('open');
      }

      if (panel) {
        setIsAgentOpen(panel.classList.contains('open'));
      }
    } else {
      setTimeout(() => {
        const h = findVoicePilotHost();
        const f = (h?.shadowRoot?.querySelector('#launch') ||
          h?.shadowRoot?.querySelector('.launcher') ||
          h?.shadowRoot?.querySelector('.fab')) as HTMLElement | null;
        if (f) f.click();
      }, 350);
    }
  };

  return (
    <>
      {/* 1. PROFESSIONAL & ATTRACTIVE ZAPLIX CUSTOMER SUPPORT AGENT BUTTON */}
      <div
        className={`fixed z-40 right-3.5 bottom-[146px] md:right-6 md:bottom-[98px] items-center group transition-all duration-300 ${
          isAgentOpen ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Attractive Branded Floating Pill / Tooltip */}
        <div 
          onClick={handleToggleAgent}
          className="hidden md:flex items-center gap-2.5 mr-3 px-3.5 py-2 rounded-2xl bg-slate-900/95 dark:bg-[#070e1b]/95 backdrop-blur-md text-white shadow-xl border border-amber-500/30 hover:border-amber-400 cursor-pointer transition-all duration-200 select-none hover:scale-102"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <div className="flex flex-col text-left leading-tight">
            <span className="text-[11px] font-black tracking-wide text-amber-400 flex items-center gap-1">
              <span>ZAPLIX CUSTOMER CARE</span>
              <Sparkles className="w-3 h-3 text-amber-300 animate-spin-slow" />
            </span>
            <span className="text-[10px] text-slate-300 font-medium">
              AI Voice &amp; Chat · 24/7 Live
            </span>
          </div>
        </div>

        {/* The Branded Blinking Agent Button */}
        <button
          type="button"
          onClick={handleToggleAgent}
          aria-label="Open ZAPLIX Customer Support Agent"
          title="ZAPLIX Customer Support · AI Voice & Chat"
          className={`relative w-[58px] h-[58px] md:w-[62px] md:h-[62px] rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 shadow-[0_10px_30px_rgba(245,158,11,0.35),0_4px_12px_rgba(0,0,0,0.5)] hover:shadow-[0_14px_35px_rgba(245,158,11,0.5)] hover:scale-108 active:scale-95 ${
            isAgentOpen
              ? 'bg-gradient-to-tr from-rose-600 via-rose-700 to-indigo-800 text-white ring-4 ring-rose-400/50'
              : 'bg-gradient-to-tr from-slate-950 via-indigo-950 to-slate-900 text-white ring-2 ring-amber-400/80 hover:ring-amber-300'
          }`}
        >
          {/* Subtle Ambient Radar Pulse Rings (Blinking Effect) */}
          <span className="absolute inset-0 rounded-full bg-amber-400/40 animate-ping -z-10 opacity-75" />
          <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-500 via-cyan-400 to-indigo-500 -z-20 opacity-40 blur-xs animate-pulse" />

          {/* Button Content: Zaplix Official Logo + Support Headset Icon */}
          <div className="relative w-full h-full rounded-full overflow-hidden p-1 flex items-center justify-center">
            {isAgentOpen ? (
              <X className="w-7 h-7 text-white animate-in zoom-in-75" />
            ) : (
              <div className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-black">
                {/* Official Zaplix Logo Image */}
                {logoLoaded ? (
                  <img
                    src={OFFICIAL_LOGO_IMAGE}
                    alt="ZAPLIX Official Agent"
                    className="w-full h-full object-cover scale-105"
                    onError={() => setLogoLoaded(false)}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-slate-950 to-indigo-950 flex items-center justify-center font-black text-amber-400 text-sm">
                    Z
                  </div>
                )}

                {/* Glassmorphic Gradient Overlay for Depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

                {/* Professional Headset Badge at Bottom Right of Logo */}
                <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center shadow-md ring-1 ring-slate-950">
                  <Headset className="w-3 h-3 stroke-[2.5]" />
                </div>
              </div>
            )}
          </div>

          {/* Active Online Status Badge (Blinking green dot) */}
          <span
            className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950 shadow-md flex items-center justify-center"
            title={agentReady ? 'ZAPLIX Support Online' : 'Connecting to Zaplix Agent...'}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          </span>
        </button>
      </div>

      {/* 2. OFFICIAL WHATSAPP BUTTON (Positioned below Customer Support Agent) */}
      <div
        className={`fixed z-40 right-3.5 bottom-[80px] md:right-6 md:bottom-6 items-center group ${
          isAgentOpen ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Tooltip Pill (Desktop & Hover) */}
        <div className="hidden md:flex items-center gap-1.5 mr-3 px-3.5 py-1.5 rounded-full bg-slate-900/95 dark:bg-[#070e1b]/95 backdrop-blur-md text-white text-xs font-semibold shadow-xl border border-emerald-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
          <span>WhatsApp Helpline · {OFFICIAL_WHATSAPP_NUMBER}</span>
        </div>

        {/* WhatsApp Button */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Message Zaplix Support on WhatsApp"
          className="w-[52px] h-[52px] md:w-[56px] md:h-[56px] rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white shadow-[0_8px_24px_rgba(37,211,102,0.45)] hover:shadow-[0_12px_28px_rgba(37,211,102,0.6)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer group ring-2 ring-emerald-300/40"
        >
          <WhatsAppIcon className="w-7 h-7 md:w-8 md:h-8 fill-white text-white group-hover:scale-110 transition-transform" />
        </a>
      </div>
    </>
  );
}

export default FloatingWhatsApp;

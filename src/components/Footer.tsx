import React, { useState } from 'react';
import { StoreSettings } from '../types';
import { api } from '../services/api';
import { PolicyKey } from './PolicyModal';

interface FooterProps {
  settings: StoreSettings;
  onOpenPolicy: (p: PolicyKey) => void;
}

// Add real profile URLs here when available — entries with an empty URL render as plain text.
const SOCIAL_LINKS: { label: string; url: string }[] = [
  { label: 'Instagram', url: '' },
  { label: 'Pinterest', url: '' },
  { label: 'TikTok', url: '' },
];

export function Footer({ settings, onOpenPolicy }: FooterProps) {
  const brand = (settings.businessName || 'Zyvara').toUpperCase();
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setState('error');
      return;
    }
    setState('sending');
    try {
      await api.submitContact({ name: 'Newsletter Subscriber', phone: 'Newsletter', message: `Please add ${email.trim()} to the ${brand} style updates list.` });
      setState('done');
      setEmail('');
    } catch {
      setState('error');
    }
  };

  const linkBtn = 'hover:underline cursor-pointer';
  const Dot = () => <span className="mx-1.5 text-slate-400">•</span>;

  return (
    <footer id="footer" className="bg-white text-black pt-6 pb-24 md:pb-5">
      <div className="max-w-3xl mx-auto px-5 text-center space-y-5">
        <div className="space-y-2">
          <h3 className="text-[14px] font-semibold">Join {brand}</h3>
          <p className="text-[12px] text-black/80">Sign up for 10% off your first order and style updates.</p>
          <form onSubmit={subscribe} className="flex items-stretch justify-center gap-3 max-w-xl mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (state !== 'idle') setState('idle'); }}
              placeholder="Enter your email"
              aria-label="Email address"
              className="flex-1 min-w-0 px-3 py-2 rounded-md border border-slate-200 text-[12px] text-black placeholder:text-slate-500 focus:outline-none focus:border-black"
            />
            <button
              type="submit"
              disabled={state === 'sending'}
              className="px-8 py-2 rounded-md bg-black text-white text-[12px] font-semibold hover:bg-neutral-800 disabled:opacity-60 cursor-pointer"
            >
              {state === 'sending' ? '...' : 'Subscribe'}
            </button>
          </form>
          {state === 'done' && <p className="text-[12px] text-emerald-700 font-medium">Thank you for subscribing!</p>}
          {state === 'error' && <p className="text-[12px] text-rose-600 font-medium">Please enter a valid email address.</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-3 text-center sm:text-left pt-1">
          <div className="space-y-1">
            <p className="text-[13px] font-bold">{brand}</p>
            <p className="text-[10px] text-black/80">Minimal luxury for everyday living.</p>
          </div>
          <div className="space-y-1 sm:text-center">
            <p className="text-[13px] font-bold">Customer Care</p>
            <p className="text-[10px] text-black/80">
              <a href={`tel:${settings.phone1}`} className={linkBtn}>{settings.phone1}</a>
              <Dot />
              <a href={`tel:${settings.phone2}`} className={linkBtn}>{settings.phone2}</a>
            </p>
            <p className="text-[10px] text-black/80">
              <button onClick={() => onOpenPolicy('shipping')} className={linkBtn}>Shipping &amp; Returns</button>
              <Dot />
              <button onClick={() => onOpenPolicy('faqs')} className={linkBtn}>FAQs</button>
            </p>
          </div>
          <div className="space-y-1 sm:text-right">
            <p className="text-[13px] font-bold">Follow Us</p>
            <p className="text-[10px] text-black/80">
              {SOCIAL_LINKS.map((s, i) => (
                <React.Fragment key={s.label}>
                  {i > 0 && <Dot />}
                  {s.url ? <a href={s.url} target="_blank" rel="noopener noreferrer" className={linkBtn}>{s.label}</a> : <span>{s.label}</span>}
                </React.Fragment>
              ))}
            </p>
          </div>
        </div>

        <p className="text-[10px] text-black/80">
          {settings.footerText || `© 2026 ${brand}. All rights reserved.`}
          <Dot />
          <button onClick={() => onOpenPolicy('privacy')} className={linkBtn}>Privacy Policy</button>
          <Dot />
          <button onClick={() => onOpenPolicy('terms')} className={linkBtn}>Terms</button>
        </p>
      </div>
    </footer>
  );
}

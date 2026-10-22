import React, { useState } from 'react';
import { StoreSettings } from '../types';
import { api } from '../services/api';
import { PolicyKey } from './PolicyModal';
import ZaplixLogo from './ZaplixLogo';
import { Truck, ShieldCheck, RefreshCw, Instagram, QrCode, ExternalLink, Phone } from 'lucide-react';
import { OFFICIAL_WHATSAPP_NUMBER, INSTAGRAM_HANDLE, INSTAGRAM_URL } from '../lib/policy';

interface FooterProps {
  settings: StoreSettings;
  onOpenPolicy: (p: PolicyKey) => void;
  onOpenInstagram?: () => void;
}

export function Footer({ settings, onOpenPolicy, onOpenInstagram }: FooterProps) {
  const brand = settings.businessName || 'ZAPLIX';
  const phone = settings.phone1 || OFFICIAL_WHATSAPP_NUMBER;
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
      await api.submitContact({
        name: 'Newsletter Subscriber',
        phone: 'Newsletter',
        message: `Please add ${email.trim()} to the ${brand} VIP updates list.`,
      });
      setState('done');
      setEmail('');
    } catch {
      setState('error');
    }
  };

  const linkBtn = 'hover:underline cursor-pointer transition-colors text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white';
  const Dot = () => <span className="mx-1.5 text-slate-300 dark:text-slate-700">•</span>;

  return (
    <footer id="footer" className="bg-white dark:bg-[#070d18] text-slate-900 dark:text-slate-100 border-t border-slate-200/80 dark:border-slate-800 pt-12 pb-24 md:pb-10 transition-colors">
      <div className="max-w-5xl mx-auto px-5 text-center space-y-9">
        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center space-y-2">
          <ZaplixLogo variant="full" showTagline={true} size="lg" />
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg pt-1">
            Pakistan's premier multi-category online shopping store with 100% Free Home Delivery nationwide &amp; Cash on Delivery.
          </p>
        </div>

        {/* Official Instagram Featured Card */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-pink-500/10 to-purple-500/10 border border-pink-500/20 max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-left">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-md shrink-0">
              <Instagram className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400">
                Official Instagram Community
              </p>
              <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Follow <span className="bg-gradient-to-r from-amber-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">{INSTAGRAM_HANDLE}</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Exclusive unboxings, flash deals, and customer customer reviews
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-pink-500/20 transition-all cursor-pointer"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>Follow</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            {onOpenInstagram && (
              <button
                onClick={onOpenInstagram}
                aria-label="Scan Instagram QR Code"
                className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <QrCode className="w-3.5 h-3.5 text-pink-500" />
                <span className="hidden xs:inline">QR Code</span>
              </button>
            )}
          </div>
        </div>

        {/* Benefits bar */}
        <div className="py-3 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <span className="flex items-center gap-1.5 text-blue-700 dark:text-cyan-400">
            <Truck className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            FREE HOME DELIVERY ON ALL ORDERS
          </span>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
          <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Cash on Delivery Guaranteed
          </span>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
          <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <RefreshCw className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            7-Day Easy Returns
          </span>
        </div>

        {/* Newsletter */}
        <div className="space-y-2 max-w-md mx-auto">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Get Exclusive Deals &amp; New Arrival Updates
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sign up for special discounts delivered directly to your inbox.
          </p>
          <form onSubmit={subscribe} className="flex items-stretch justify-center gap-2 pt-1">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (state !== 'idle') setState('idle');
              }}
              placeholder="Enter your email"
              aria-label="Email address"
              className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="submit"
              disabled={state === 'sending'}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold disabled:opacity-60 transition-colors shadow-md shadow-amber-500/20 cursor-pointer"
            >
              {state === 'sending' ? '...' : 'Subscribe'}
            </button>
          </form>
          {state === 'done' && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              Thank you for subscribing to ZAPLIX!
            </p>
          )}
          {state === 'error' && (
            <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
              Please enter a valid email address.
            </p>
          )}
        </div>

        {/* Navigation columns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          <div className="space-y-1.5">
            <p className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              ZAPLIX Pakistan
            </p>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
              Shop Smarter. Live Better. Multi-category store providing quality fashion, electronics, beauty, and lifestyle essentials.
            </p>
          </div>
          <div className="space-y-1.5 sm:text-center">
            <p className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Customer Support
            </p>
            <p className="text-slate-600 dark:text-slate-300 text-[11px]">
              WhatsApp / Call:{' '}
              <a
                href={`https://wa.me/923189869746`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-amber-600 dark:text-amber-400 hover:underline"
              >
                {phone}
              </a>
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] space-x-1">
              <button onClick={() => onOpenPolicy('shipping')} className={linkBtn}>
                Shipping Policy
              </button>
              <Dot />
              <button onClick={() => onOpenPolicy('returns')} className={linkBtn}>
                Return Policy
              </button>
              <Dot />
              <button onClick={() => onOpenPolicy('faqs')} className={linkBtn}>
                FAQs
              </button>
            </p>
          </div>
          <div className="space-y-1.5 sm:text-right">
            <p className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Official Social Channels
            </p>
            <div className="flex items-center justify-center sm:justify-end gap-3 text-slate-600 dark:text-slate-400 text-[11px]">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-pink-600 dark:text-pink-400 hover:underline"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>Instagram {INSTAGRAM_HANDLE}</span>
              </a>
              <Dot />
              <a
                href={`https://wa.me/923189869746`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
            <p className="text-slate-400 dark:text-slate-500 text-[10px]">
              Customer Service: Available 7 Days a Week
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500">
          <p>
            {settings.footerText || `© 2026 ZAPLIX. All rights reserved.`}
            <Dot />
            <button onClick={() => onOpenPolicy('privacy')} className={linkBtn}>
              Privacy Policy
            </button>
            <Dot />
            <button onClick={() => onOpenPolicy('terms')} className={linkBtn}>
              Terms of Service
            </button>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

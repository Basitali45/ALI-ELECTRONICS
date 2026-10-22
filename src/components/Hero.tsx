import React from 'react';
import { StoreSettings, HomepageConfig, Product } from '../types';
import { Truck, ShieldCheck, ArrowRight, Instagram } from 'lucide-react';
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from '../lib/policy';

interface HeroProps {
  settings: StoreSettings;
  homepage: HomepageConfig;
  trendingProducts?: Product[];
  onBrowseClick: () => void;
  onOffersClick?: () => void;
  onContactClick?: () => void;
  onViewProduct?: (product: Product) => void;
}

export function Hero({ settings, homepage, onBrowseClick }: HeroProps) {
  const heading = homepage.heroHeading || 'Shop Smarter. Live Better.';
  const subtitle =
    homepage.heroSubtitle ||
    settings.supportingText ||
    "Pakistan's trusted online shopping destination. Free Home Delivery on all orders with guaranteed Cash on Delivery.";
  const image = homepage.heroBackgroundImage || '/images/zaplix/hero.jpg';

  return (
    <section
      id="home"
      className="hidden md:block bg-gradient-to-b from-[#F0F5FA] to-[#FAFBFD] dark:from-[#0a1120] dark:to-[#070d18] border-b border-slate-200/80 dark:border-slate-800 transition-colors"
    >
      <div className="max-w-6xl mx-auto px-8 py-10 grid grid-cols-[1fr_1.15fr] items-center gap-10">
        <div className="space-y-4">
          {/* Trust badges */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-[11px] font-bold tracking-wide">
              <Truck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>FREE HOME DELIVERY ON ALL ORDERS</span>
            </div>

            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-600 dark:text-pink-400 text-[11px] font-bold hover:bg-pink-500/20 transition-colors"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>{INSTAGRAM_HANDLE}</span>
            </a>
          </div>

          <h1 className="text-[44px] leading-[1.08] font-black tracking-tight text-[#0B192C] dark:text-white">
            {heading}
          </h1>

          <p className="text-[15px] leading-relaxed text-slate-600 dark:text-slate-300 max-w-[430px]">
            {subtitle}
          </p>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={onBrowseClick}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-slate-900 hover:bg-black dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-black active:scale-95 text-white text-[13px] font-bold shadow-lg shadow-slate-900/20 dark:shadow-amber-500/25 transition cursor-pointer"
            >
              <span>{homepage.heroCtaText || 'Shop Now'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Cash on Delivery</span>
            </div>
          </div>
        </div>

        <div className="relative rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 aspect-[2.6/1] shadow-xl shadow-slate-200/50 dark:shadow-black/60 border border-slate-200/60 dark:border-slate-800">
          <img
            src={image}
            alt={`${settings.businessName || 'ZAPLIX'} — ${heading}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-3 left-3 bg-[#0B192C]/90 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span>COD &bull; Free Delivery Nationwide</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;

import React from 'react';
import { StoreSettings, HomepageConfig, Product } from '../types';

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
  const heading = homepage.heroHeading || 'Elevate Your Everyday';
  const subtitle = homepage.heroSubtitle || settings.supportingText;
  const image = homepage.heroBackgroundImage || '/images/zyvara/hero.jpg';

  return (
    <section id="home" className="hidden md:block bg-[#fafaf9] border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-8 py-10 grid grid-cols-[1fr_1.15fr] items-center gap-10">
        <div className="space-y-3">
          <h1 className="text-[44px] leading-[1.08] font-bold tracking-tight text-black">{heading}</h1>
          <p className="text-[15px] leading-snug text-black/80 max-w-[420px]">{subtitle}</p>
          <button
            onClick={onBrowseClick}
            className="mt-3 inline-flex items-center justify-center px-6 py-2.5 rounded-md bg-black text-white text-[13px] font-semibold hover:bg-neutral-800 active:scale-95 transition cursor-pointer"
          >
            {homepage.heroCtaText || 'Shop Now'}
          </button>
        </div>

        <div className="rounded-2xl overflow-hidden bg-[#f1f0ee] aspect-[2.6/1]">
          <img src={image} alt={`${settings.businessName || 'Zyvara'} — ${heading}`} className="w-full h-full object-cover" />
        </div>
      </div>
    </section>
  );
}

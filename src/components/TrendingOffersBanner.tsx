import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Product, Offer, StoreSettings } from '../types';

interface TrendingOffersBannerProps {
  offers: Offer[];
  products?: Product[];
  settings?: StoreSettings;
  onNavigate: (sectionId: string) => void;
  onViewProduct?: (product: Product) => void;
  onDirectOrder?: (product: Product) => void;
}

// Slim promo strip — only shown when the admin has an active "banner" offer.
export function TrendingOffersBanner({ offers, onNavigate }: TrendingOffersBannerProps) {
  const offer = offers.find((o) => o.isActive && (o.displayLocation === 'banner' || o.displayLocation === 'hero'));
  if (!offer) return null;

  const go = () => {
    const link = offer.buttonLink || '#products';
    if (link.startsWith('#')) onNavigate(link.slice(1));
    else window.location.href = link;
  };

  return (
    <section id="trending-offers" className="py-3">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between gap-4 rounded-2xl bg-black text-white px-5 py-4">
          <div className="min-w-0">
            <p className="text-[14px] font-semibold truncate">{offer.title}</p>
            {offer.description && <p className="text-[12px] text-white/70 line-clamp-2">{offer.description}</p>}
          </div>
          <button onClick={go} className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-md bg-white text-black text-[12px] font-semibold cursor-pointer">
            {offer.buttonText || 'Shop Now'} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}

import React from 'react';
import { Tag, Sparkles, ArrowRight, Clock } from 'lucide-react';
import { Offer } from '../types';

interface OffersSectionProps {
  offers: Offer[];
  onNavigate: (sectionId: string) => void;
}

export function OffersSection({ offers, onNavigate }: OffersSectionProps) {
  const activeOffers = offers.filter((o) => o.isActive);

  if (activeOffers.length === 0) return null;

  return (
    <section id="offers" className="py-12 bg-slate-50 dark:bg-slate-950/70 border-t border-slate-200/60 dark:border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {activeOffers.map((offer) => (
          <div
            key={offer.id}
            className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl border border-blue-800/40"
          >
            {/* Background Image if available */}
            {offer.bannerImage && (
              <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <img
                  src={offer.bannerImage}
                  alt={offer.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="relative z-10 p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-3 text-center md:text-left max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  <Tag className="w-3.5 h-3.5" />
                  <span>
                    {offer.discountType === 'percentage'
                      ? `Special Discount · ${offer.discountValue}% OFF`
                      : `Special Discount · Save Rs. ${offer.discountValue.toLocaleString()}`}
                  </span>
                </div>

                <h3 className="font-heading font-extrabold text-2xl sm:text-4xl text-white tracking-tight">
                  {offer.title}
                </h3>

                <p className="text-sm text-slate-300 leading-relaxed">
                  {offer.description}
                </p>
              </div>

              <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => {
                    if (offer.buttonLink?.startsWith('#')) {
                      onNavigate(offer.buttonLink.substring(1));
                    } else if (offer.buttonLink) {
                      window.location.href = offer.buttonLink;
                    } else {
                      onNavigate('products');
                    }
                  }}
                  className="px-6 py-3.5 rounded-2xl font-bold text-xs bg-white text-blue-900 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group cursor-pointer"
                >
                  <span>{offer.buttonText || 'Shop Offer Now'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        ))}

      </div>
    </section>
  );
}

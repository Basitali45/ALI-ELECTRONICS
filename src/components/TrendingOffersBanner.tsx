import React, { useState, useMemo } from 'react';
import { 
  Flame, 
  Sparkles, 
  Tag, 
  ArrowRight, 
  Clock, 
  Zap, 
  CheckCircle2, 
  ShieldCheck, 
  Percent, 
  TrendingUp 
} from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { Product, Offer, StoreSettings } from '../types';
import { ProductCard } from './ProductCard';

interface TrendingOffersBannerProps {
  offers: Offer[];
  products: Product[];
  settings: StoreSettings;
  onNavigate: (sectionId: string) => void;
  onViewProduct: (product: Product) => void;
  onDirectOrder: (product: Product) => void;
}

export function TrendingOffersBanner({
  offers,
  products,
  settings,
  onNavigate,
  onViewProduct,
  onDirectOrder,
}: TrendingOffersBannerProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const cleanWhatsApp = settings.whatsappNumber.replace(/^0/, '92').replace(/[^0-9]/g, '');

  // Select active offer or default high-impact promotion
  const primaryOffer = offers.find((o) => o.isActive) || {
    id: 'mega-sale-default',
    title: 'MEGA ELECTRONICS SALE',
    description: 'Up to 30% OFF on Selected Earbuds, Fast Chargers, Heavy-Duty Cables & Accessories at Hassan Abdal shop.',
    discountType: 'percentage' as const,
    discountValue: 30,
    bannerImage: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1600&auto=format&fit=crop&q=80',
    buttonText: 'Claim Offer on WhatsApp',
    buttonLink: '#products',
    isActive: true,
    displayLocation: 'banner' as const,
  };

  // Curate trending products: products with discount, or marked as featured / new arrival, or top order
  const trendingProducts = useMemo(() => {
    let list = products.filter(
      (p) => p.featured || p.isNewArrival || (p.oldPrice && p.oldPrice > p.price) || p.badge
    );
    if (list.length < 4) {
      list = products.slice(0, 8);
    }
    return list;
  }, [products]);

  // Categories present in trending
  const categoriesInTrending = useMemo(() => {
    const cats = Array.from(new Set(trendingProducts.map((p) => p.category)));
    return ['all', ...cats];
  }, [trendingProducts]);

  const filteredTrending = useMemo(() => {
    if (selectedFilter === 'all') return trendingProducts.slice(0, 8);
    return trendingProducts.filter((p) => p.category === selectedFilter).slice(0, 8);
  }, [trendingProducts, selectedFilter]);

  const handleOfferWhatsApp = () => {
    const text = `Assalam-o-Alaikum Ali Electronics, I want to avail the "${primaryOffer.title}" (${primaryOffer.discountValue}% OFF deal). Please share the list of available items!`;
    const url = `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <section id="trending-offers" className="py-14 sm:py-20 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        
        {/* ================= 1. FULLPAGE AESTHETIC MEGA OFFER BANNER ================= */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 border border-blue-800/50 shadow-2xl shadow-blue-950/50">
          
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Background image overlay if available */}
          {primaryOffer.bannerImage && (
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-overlay">
              <img
                src={primaryOffer.bannerImage}
                alt={primaryOffer.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="relative z-10 p-6 sm:p-10 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
            
            {/* Offer Left Content */}
            <div className="space-y-4 text-center lg:text-left max-w-2xl">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-300 text-xs font-black tracking-widest uppercase">
                <Flame className="w-3.5 h-3.5 fill-rose-400" />
                <span>Limited Time Promotion · Hassan Abdal</span>
              </div>

              <div className="space-y-2">
                <h2 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight uppercase leading-tight">
                  {primaryOffer.title}
                </h2>

                <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
                  {primaryOffer.description}
                </p>
              </div>

              {/* Deal Perks Chips */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 pt-1">
                <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-200 flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Up to {primaryOffer.discountValue}% Price Drop</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Tested in Showroom</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-200 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Fast Hassan Abdal Pickup</span>
                </div>
              </div>

            </div>

            {/* Offer Right Call to Actions */}
            <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
              <button
                onClick={handleOfferWhatsApp}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-wider bg-[#25D366] hover:bg-[#20ba59] text-white shadow-xl shadow-[#25D366]/30 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <WhatsAppIcon className="w-4 h-4 fill-white text-white" />
                <span>Claim Offer on WhatsApp</span>
              </button>

              <button
                onClick={() => onNavigate('products')}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer backdrop-blur-md"
              >
                <span>Browse Discounted Items</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

        {/* ================= 2. TRENDING PRODUCTS SHOWCASE ================= */}
        <div className="space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-blue-600 dark:text-cyan-400 mb-1 font-mono">
                <TrendingUp className="w-4 h-4" />
                <span>Most In-Demand Gadgets</span>
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                Trending Products Now
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
                The most popular mobile accessories, chargers, and audio gadgets customers in Hassan Abdal are buying right now.
              </p>
            </div>

            {/* Category Filter Chips */}
            {categoriesInTrending.length > 2 && (
              <div className="flex flex-wrap items-center gap-2">
                {categoriesInTrending.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedFilter === cat
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-xs'
                    }`}
                  >
                    {cat === 'all' ? 'All Trending' : cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Cards Grid with Drop-Down Cascade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredTrending.map((product, index) => (
              <div
                key={`${product.id}-${selectedFilter}`}
                className="animate-product-drop"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <ProductCard
                  product={product}
                  whatsappNumber={settings.whatsappNumber}
                  whatsappButtonEnabled={settings.whatsappProductButtonEnabled !== false}
                  onViewDetails={onViewProduct}
                  onDirectOrder={onDirectOrder}
                />
              </div>
            ))}
          </div>

          {/* Bottom View All Link */}
          <div className="text-center pt-2">
            <button
              onClick={() => onNavigate('products')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 hover:text-white bg-blue-50 hover:bg-blue-600 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800/50 transition-all cursor-pointer"
            >
              <span>Explore All Products in Store Catalogue ({products.length})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}

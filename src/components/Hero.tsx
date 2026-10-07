import React, { useState } from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Flame, 
  Zap, 
  ShieldCheck, 
  ChevronRight 
} from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { StoreSettings, HomepageConfig, Product } from '../types';

interface HeroProps {
  settings: StoreSettings;
  homepage: HomepageConfig;
  trendingProducts?: Product[];
  onBrowseClick: () => void;
  onOffersClick: () => void;
  onViewProduct?: (product: Product) => void;
}

const sampleTrendingSpotlights = [
  {
    id: 'spot-1',
    name: 'Wireless Bluetooth Earbuds',
    category: 'Audio & Earphones',
    price: 2499,
    oldPrice: 2999,
    discount: '17% OFF',
    tag: 'Trending #1',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
    specs: ['Deep Bass ANC', '40-Hour Battery', 'Type-C Fast Charge'],
  },
  {
    id: 'spot-2',
    name: 'Super Fast 65W GaN Charger',
    category: 'Fast Chargers',
    price: 1850,
    oldPrice: 2200,
    discount: '16% OFF',
    tag: 'Hot Seller',
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
    specs: ['65W Quick PD', 'Dual USB-C Ports', 'Surge Protected'],
  },
  {
    id: 'spot-3',
    name: '20,000mAh Ultra Power Bank',
    category: 'Power Banks',
    price: 3499,
    oldPrice: 4200,
    discount: '17% OFF',
    tag: 'Popular',
    image: 'https://images.unsplash.com/photo-1609592424109-dd9892f1b177?w=800&auto=format&fit=crop&q=80',
    specs: ['22.5W Fast Charge', 'LED Battery Display', 'Flight Approved'],
  },
];

export function Hero({ 
  settings, 
  homepage, 
  trendingProducts,
  onBrowseClick, 
  onOffersClick,
  onViewProduct 
}: HeroProps) {
  if (homepage.heroEnabled === false) return null;

  const [activeSpotlightIdx, setActiveSpotlightIdx] = useState(0);

  const cleanWhatsApp = settings.whatsappNumber.replace(/^0/, '92').replace(/[^0-9]/g, '');

  const headingText = homepage.heroHeading || 'Next-Gen Electronics & Premium Gear';
  const subtitleText = homepage.heroSubtitle || settings.supportingText || 'Explore genuine electronics, high-speed charging accessories, studio-grade wireless sound, and smart tech with verified quality.';
  const bgImage = homepage.heroBackgroundImage || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1600&auto=format&fit=crop&q=80';
  const overlayOpacity = (homepage.heroOverlayOpacity ?? 80) / 100;

  // Use real products if passed and available, otherwise curated tech highlights
  const spotlightList = (trendingProducts && trendingProducts.length >= 3)
    ? trendingProducts.slice(0, 3).map((p, idx) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        oldPrice: p.oldPrice,
        discount: p.discount || (p.oldPrice ? `${Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)}% OFF` : 'SPECIAL'),
        tag: idx === 0 ? 'Trending #1' : idx === 1 ? 'Hot Deal' : 'Popular Choice',
        image: p.image,
        specs: (p.specifications && p.specifications.length > 0) 
          ? p.specifications.slice(0, 3) 
          : ['Tested Quality', 'Shop Warranty', 'Instant Stock'],
        rawProduct: p
      }))
    : sampleTrendingSpotlights;

  const activeSpotlight = spotlightList[activeSpotlightIdx] || spotlightList[0];

  const waSpotlightUrl = `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
    `Assalam-o-Alaikum Ali Electronics, I want to inquire/order trending product: ${activeSpotlight.name} (Rs. ${activeSpotlight.price.toLocaleString()}). Please confirm availability.`
  )}`;

  return (
    <section id="home" className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden">
      {/* Dynamic Background Image & Subtle Dark Tech Overlay */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <img
          src={bgImage}
          alt="Ali Electronics Storefront"
          className="w-full h-full object-cover object-center transform scale-105"
        />
        <div 
          className="absolute inset-0 bg-[#0B0F19]"
          style={{ opacity: overlayOpacity }}
        />
        {/* Aesthetic radial tech ambient glow */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-0 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Main Hero Copy (Left Column) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Aesthetic Tech Pill Tagline */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-cyan-300 text-xs font-bold tracking-wide backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="uppercase tracking-wider">Hassan Abdal · Trusted Electronics Hub</span>
            </div>

            {/* Aesthetic Large Headline */}
            <div className="space-y-4">
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
                {headingText}
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed font-normal">
                {subtitleText}
              </p>
            </div>

            {/* Action Buttons: Clean & Product Focused */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={onOffersClick}
                className="px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 group cursor-pointer"
              >
                <Flame className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>View Hot Offers</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onBrowseClick}
                className="px-5 py-3.5 rounded-xl font-semibold text-xs uppercase tracking-wider text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 transition-all shadow-xs backdrop-blur-md cursor-pointer"
              >
                {homepage.heroCtaText || 'Explore Catalogue'}
              </button>

              {settings.whatsappFloatingEnabled && (
                <a
                  href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent('Assalam-o-Alaikum Ali Electronics, I want to inquire about products.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#25D366] hover:bg-[#20ba59] text-white transition-all flex items-center gap-2 shadow-md shadow-[#25D366]/25 cursor-pointer"
                >
                  <WhatsAppIcon className="w-4 h-4 fill-white text-white" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </a>
              )}
            </div>

            {/* Professional Trust Badges */}
            <div className="flex flex-wrap items-center gap-y-2.5 gap-x-6 text-xs text-slate-300 pt-4 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Tested Genuine Products</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Competitive Pakistani Rupee Rates</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Instant WhatsApp Order Confirmation</span>
              </div>
            </div>

          </div>

          {/* Right Column: High-End Live Trending Spotlight Card */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Outer Glow container with Drop-Down entrance */}
              <div className="relative rounded-3xl overflow-hidden bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl animate-product-drop">
                
                {/* Spotlight Header Bar */}
                <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-rose-500/20 text-rose-400">
                      <Flame className="w-4 h-4 fill-rose-500" />
                    </span>
                    <span className="font-heading font-extrabold text-xs uppercase tracking-wider text-white">
                      Trending in Hassan Abdal
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black tracking-widest uppercase bg-blue-600/30 text-blue-300 border border-blue-500/40">
                    {activeSpotlight.tag}
                  </span>
                </div>

                {/* Spotlight Image & Visual */}
                <div className="relative aspect-video sm:aspect-4/3 w-full overflow-hidden bg-slate-950 group">
                  <img
                    src={activeSpotlight.image}
                    alt={activeSpotlight.name}
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  
                  {activeSpotlight.discount && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-black tracking-wider bg-rose-600 text-white shadow-lg">
                      {activeSpotlight.discount}
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">
                      {activeSpotlight.category}
                    </span>
                    <h3 className="font-heading font-extrabold text-lg sm:text-xl text-white truncate">
                      {activeSpotlight.name}
                    </h3>
                  </div>
                </div>

                {/* Specs Chips */}
                <div className="p-4 space-y-3.5 bg-slate-900/80">
                  <div className="flex flex-wrap gap-1.5">
                    {activeSpotlight.specs.map((spec, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>

                  {/* Pricing and Action */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">Special Price</div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono font-extrabold text-xl text-white">
                          Rs. {activeSpotlight.price.toLocaleString()}
                        </span>
                        {activeSpotlight.oldPrice && (
                          <span className="font-mono text-xs text-slate-500 line-through">
                            Rs. {activeSpotlight.oldPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <a
                      href={waSpotlightUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl font-bold text-xs bg-[#25D366] hover:bg-[#20ba59] text-white shadow-md shadow-[#25D366]/20 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5 fill-white text-white" />
                      <span>Order on WA</span>
                    </a>
                  </div>
                </div>

                {/* Quick Toggle Tabs */}
                <div className="grid grid-cols-3 border-t border-slate-800 bg-slate-950/60">
                  {spotlightList.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSpotlightIdx(idx)}
                      className={`p-2.5 text-center text-[11px] font-semibold transition-all border-b-2 cursor-pointer ${
                        activeSpotlightIdx === idx
                          ? 'border-blue-500 text-white bg-blue-500/10'
                          : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                      }`}
                    >
                      <span className="block truncate">{item.name.split(' ')[0]} {item.name.split(' ')[1] || ''}</span>
                    </button>
                  ))}
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

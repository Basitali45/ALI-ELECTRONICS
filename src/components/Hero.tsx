import React, { useState } from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  Flame, 
  Zap, 
  ShieldCheck, 
  PhoneCall, 
  CheckCircle2, 
  Layers, 
  Cpu, 
  Radio, 
  Volume2, 
  BatteryCharging 
} from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { StoreSettings, HomepageConfig, Product } from '../types';

interface HeroProps {
  settings: StoreSettings;
  homepage: HomepageConfig;
  trendingProducts?: Product[];
  onBrowseClick: () => void;
  onOffersClick: () => void;
  onContactClick?: () => void;
  onViewProduct?: (product: Product) => void;
}

interface SpotlightItem {
  id: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  discount?: string;
  badge: string;
  image: string;
  features: string[];
  specs: string;
}

const defaultSpotlights: SpotlightItem[] = [
  {
    id: 'spot-1',
    name: 'Pro Wireless ANC Earbuds',
    category: 'Audio & Wireless',
    price: 2499,
    oldPrice: 3200,
    discount: '22% OFF',
    badge: 'FLAGSHIP SOUND',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
    features: ['Active Noise Cancelling', '40h Total Playtime', 'Type-C Quick Sync'],
    specs: 'Bluetooth 5.3 · Deep Bass'
  },
  {
    id: 'spot-2',
    name: 'Super Fast 65W GaN Dual Charger',
    category: 'Fast Chargers',
    price: 1850,
    oldPrice: 2400,
    discount: '23% OFF',
    badge: 'SUPER CHARGE',
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
    features: ['65W Power Delivery', 'Dual Port Output', 'Surge & Heat Protection'],
    specs: 'Laptop & Mobile Compatible'
  },
  {
    id: 'spot-3',
    name: '20,000mAh Ultra Slim Power Bank',
    category: 'Power Banks',
    price: 3499,
    oldPrice: 4200,
    discount: '17% OFF',
    badge: 'HIGH CAPACITY',
    image: 'https://images.unsplash.com/photo-1609592424109-dd9892f1b177?w=800&auto=format&fit=crop&q=80',
    features: ['22.5W Two-Way Fast Charge', 'Smart LED Power Display', 'Aircraft Approved'],
    specs: 'Multi-Device Quick Charging'
  },
];

export function Hero({ 
  settings, 
  homepage, 
  trendingProducts,
  onBrowseClick, 
  onOffersClick,
  onContactClick,
  onViewProduct 
}: HeroProps) {
  if (homepage.heroEnabled === false) return null;

  const [activeIdx, setActiveIdx] = useState(0);

  const cleanWhatsApp = (settings.whatsappNumber || '03115321647')
    .replace(/^0/, '92')
    .replace(/[^0-9]/g, '');

  const headingText = homepage.heroHeading || 'Smart Technology. Better Living.';
  const subtitleText = homepage.heroSubtitle || 
    'Ali Electronic brings you premium, authentic electronics, high-speed charging accessories, studio-quality sound, and modern smart technology in Hassan Abdal.';

  // Map trending products if provided, otherwise fallback to high-end spotlights
  const spotlights: SpotlightItem[] = (trendingProducts && trendingProducts.length >= 3)
    ? trendingProducts.slice(0, 3).map((p, idx) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        oldPrice: p.oldPrice,
        discount: p.discount || (p.oldPrice ? `${Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)}% OFF` : 'SPECIAL'),
        badge: idx === 0 ? 'TOP SELLER' : idx === 1 ? 'HOT OFFER' : 'FEATURED',
        image: p.image,
        features: (p.specifications && p.specifications.length > 0)
          ? p.specifications.slice(0, 3)
          : ['Tested Genuine', 'Shop Warranty', 'Ready Stock'],
        specs: p.shortDescription || 'Verified Ali Electronic Stock'
      }))
    : defaultSpotlights;

  const currentItem = spotlights[activeIdx] || spotlights[0];

  const waOrderUrl = `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
    `Assalam-o-Alaikum Ali Electronic, I want to inquire about ${currentItem.name} (Rs. ${currentItem.price.toLocaleString()}). Please confirm stock and delivery in Hassan Abdal.`
  )}`;

  return (
    <section id="home" className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden hero-light-grid transition-colors duration-500">
      
      {/* 3D Ambient Lighting Spheres (Light & Dark Compatible) */}
      <div className="absolute top-10 left-1/4 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-blue-400/20 dark:bg-blue-600/20 blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute top-1/3 right-10 w-80 sm:w-[480px] h-80 sm:h-[480px] rounded-full bg-cyan-300/25 dark:bg-cyan-500/15 blur-3xl pointer-events-none animate-float-reverse" />
      <div className="absolute -bottom-10 left-10 w-64 h-64 rounded-full bg-indigo-300/20 dark:bg-purple-600/15 blur-3xl pointer-events-none" />

      {/* Floating 3D Geometric Accents */}
      <div className="hidden lg:block absolute top-28 left-8 text-blue-500/20 dark:text-cyan-400/20 animate-float-slow pointer-events-none">
        <Cpu className="w-16 h-16" />
      </div>
      <div className="hidden lg:block absolute bottom-20 left-1/3 text-indigo-400/20 dark:text-indigo-400/20 animate-float-reverse pointer-events-none">
        <Radio className="w-12 h-12" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* ================= LEFT COLUMN: HERO CONTENT ================= */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-7 text-left">
            
            {/* Brand Kicker with Soft Glow */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-blue-50/90 dark:bg-blue-950/70 border border-blue-200/80 dark:border-blue-800/80 shadow-xs backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-cyan-400 animate-ping" />
              <span className="text-[11px] sm:text-xs font-black tracking-widest uppercase text-blue-700 dark:text-cyan-300 font-mono">
                ALI ELECTRONICS · HASSAN ABDAL
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-3">
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.08]">
                {headingText.includes('Smart') ? (
                  <>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-600 dark:from-white dark:via-blue-200 dark:to-cyan-300">
                      Smart Technology.
                    </span>{' '}
                    <span>Better Living.</span>
                  </>
                ) : (
                  headingText
                )}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed font-normal">
                {subtitleText}
              </p>
            </div>

            {/* Primary Action Buttons: Explore Products, Contact Us, WhatsApp */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1">
              
              {/* Explore Products Button */}
              <button
                onClick={onBrowseClick}
                className="px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2 group cursor-pointer active:scale-95"
              >
                <span>Explore Products</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Contact Us Button */}
              <button
                onClick={onContactClick || onBrowseClick}
                className="px-5 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <PhoneCall className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Contact Us</span>
              </button>

              {/* WhatsApp Button */}
              <a
                href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent('Assalam-o-Alaikum Ali Electronic, I would like to inquire about your products.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#25D366] hover:bg-[#20ba59] text-white shadow-md shadow-[#25D366]/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <WhatsAppIcon className="w-4 h-4 fill-white text-white" />
                <span>WhatsApp Us</span>
              </a>
            </div>

            {/* Quality & Trust Badges */}
            <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="font-medium">100% Tested Authentic</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-cyan-400 shrink-0" />
                <span className="font-medium">Store Warranty Support</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="font-medium">Direct WhatsApp Orders</span>
              </div>
            </div>

          </div>

          {/* ================= RIGHT COLUMN: 3D CINEMATIC SHOWCASE STAGE ================= */}
          <div className="lg:col-span-5 relative perspective-1000">
            
            {/* 3D Floating Stage Container */}
            <div className="relative mx-auto max-w-md lg:max-w-none transform-style-3d">
              
              {/* Outer Decorative 3D Glass Layer Card */}
              <div className="relative rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800/90 shadow-2xl shadow-blue-500/10 dark:shadow-black/50 backdrop-blur-xl overflow-hidden card-3d-lift">
                
                {/* 3D Depth Header */}
                <div className="px-5 py-3.5 bg-gradient-to-r from-slate-50 via-blue-50/50 to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-b border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-cyan-400">
                      <Sparkles className="w-4 h-4" />
                    </span>
                    <span className="font-heading font-black text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                      Featured Technology Showcase
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-blue-600 text-white shadow-xs">
                    {currentItem.badge}
                  </span>
                </div>

                {/* 3D Visual Screen */}
                <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100 dark:bg-slate-950 group">
                  <img
                    src={currentItem.image}
                    alt={currentItem.name}
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  {/* Subtle Cinematic Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                  {/* Floating 3D Discount Badge */}
                  {currentItem.discount && (
                    <div className="absolute top-3.5 left-3.5 px-3 py-1 rounded-xl text-xs font-black tracking-wider bg-rose-600 text-white shadow-md animate-float-slow">
                      {currentItem.discount}
                    </div>
                  )}

                  {/* Floating Depth Specification Pill */}
                  <div className="absolute top-3.5 right-3.5 px-3 py-1 rounded-xl text-[10px] font-bold bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 shadow-md backdrop-blur-md">
                    {currentItem.category}
                  </div>

                  {/* Bottom Image Info Banner */}
                  <div className="absolute bottom-3.5 left-4 right-4 text-white">
                    <p className="text-[11px] font-mono font-medium text-cyan-300">
                      {currentItem.specs}
                    </p>
                    <h3 className="font-heading font-extrabold text-xl text-white truncate drop-shadow-md">
                      {currentItem.name}
                    </h3>
                  </div>
                </div>

                {/* Feature Specs */}
                <div className="p-5 space-y-4 bg-white/80 dark:bg-slate-900/80">
                  <div className="flex flex-wrap gap-2">
                    {currentItem.features.map((feat, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/70"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>

                  {/* Price & Direct Order Action */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-200/80 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                        Hassan Abdal Store Price
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono font-black text-2xl text-slate-900 dark:text-white">
                          Rs. {currentItem.price.toLocaleString()}
                        </span>
                        {currentItem.oldPrice && (
                          <span className="font-mono text-xs text-slate-400 dark:text-slate-500 line-through">
                            Rs. {currentItem.oldPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <a
                      href={waOrderUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl font-bold text-xs bg-[#25D366] hover:bg-[#20ba59] text-white shadow-md shadow-[#25D366]/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5 fill-white text-white" />
                      <span>Order on WA</span>
                    </a>
                  </div>
                </div>

                {/* Interactive Product Tabs */}
                <div className="grid grid-cols-3 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
                  {spotlights.map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveIdx(idx)}
                      className={`p-2.5 text-center text-[11px] font-bold transition-all border-b-2 cursor-pointer ${
                        activeIdx === idx
                          ? 'border-blue-600 text-blue-700 dark:text-white bg-blue-50/60 dark:bg-blue-600/20'
                          : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
                      }`}
                    >
                      <span className="block truncate">{item.name.split(' ')[0]} {item.name.split(' ')[1] || ''}</span>
                    </button>
                  ))}
                </div>

              </div>

              {/* 3D Perspective Floating Back Accent */}
              <div className="absolute -bottom-3 -right-3 -left-3 h-6 rounded-3xl bg-blue-600/10 dark:bg-blue-600/20 blur-md -z-10 pointer-events-none" />
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

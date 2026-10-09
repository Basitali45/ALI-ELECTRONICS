import React from 'react';
import { MapPin, Phone, ArrowUp } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { StoreSettings, Category } from '../types';

interface FooterProps {
  settings: StoreSettings;
  categories: Category[];
  onNavigate: (sectionId: string) => void;
  onSelectCategory: (categoryName: string) => void;
}

export function Footer({ settings, categories, onNavigate, onSelectCategory }: FooterProps) {
  const cleanWhatsApp = (settings?.whatsappNumber || '03115321647').replace(/^0/, '92').replace(/[^0-9]/g, '');

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Top Multi-column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Column 1: Brand Info (col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="space-y-1">
              <span className="font-heading font-black text-2xl sm:text-3xl tracking-tighter text-white uppercase block leading-none bg-gradient-to-r from-white via-blue-200 to-cyan-300 bg-clip-text text-transparent">
                {settings.businessName || 'ALI ELECTRONIC'}
              </span>
              <span className="text-[11px] font-extrabold text-blue-400 tracking-widest uppercase block font-mono">
                Hassan Abdal · Pakistan
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Your dependable electronics destination in Hassan Abdal. Specializing in high-speed chargers, heavy-duty cables, wireless audio, batteries, emergency lights, and smart technology.
            </p>

            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(settings.location || 'Main Bus Stop, Islam Shaheed Road, Opposite New Sethi Flour Mills, Hassan Abdal, Pakistan')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-blue-500/50 space-y-1 text-xs transition-colors group"
            >
              <div className="flex items-center justify-between text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <span>Store Location</span>
                <span className="text-blue-400 group-hover:underline text-[10px]">Open Google Maps ↗</span>
              </div>
              <div className="text-slate-200 group-hover:text-white transition-colors">
                {settings.location}
              </div>
            </a>
          </div>

          {/* Column 2: Quick Links (col-span-2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-heading font-bold text-sm text-white uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-blue-400 transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('products')}
                  className="hover:text-blue-400 transition-colors"
                >
                  Product Catalogue
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('categories')}
                  className="hover:text-blue-400 transition-colors"
                >
                  All Categories
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-blue-400 transition-colors"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-blue-400 transition-colors"
                >
                  Contact & Map
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Popular Categories (col-span-3) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-heading font-bold text-sm text-white uppercase tracking-wider">
              Top Categories
            </h4>
            <div className="flex flex-wrap gap-2 text-xs">
              {categories.slice(0, 8).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.name);
                    onNavigate('products');
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Column 4: Direct Contacts (col-span-3) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-heading font-bold text-sm text-white uppercase tracking-wider">
              Contact Us Directly
            </h4>
            
            <div className="space-y-2 text-xs">
              <a
                href={`tel:${settings.phone1}`}
                className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition-colors group"
              >
                <Phone className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
                <span>{settings.phone1Name || 'Arbaz Ahmed'}: <strong className="font-mono text-white">{settings.phone1}</strong></span>
              </a>

              <a
                href={`tel:${settings.phone2}`}
                className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition-colors group"
              >
                <Phone className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
                <span>{settings.phone2Name || 'Faraz Ahmed'}: <strong className="font-mono text-white">{settings.phone2}</strong></span>
              </a>

              <a
                href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent('Assalam-o-Alaikum Ali Electronic, I would like to inquire about your products.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-2 rounded-lg bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-emerald-300 transition-colors"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 fill-[#25D366] text-[#25D366]" />
                <span>WhatsApp: <strong className="font-mono text-white">{settings.whatsappNumber}</strong></span>
              </a>
            </div>

            <div className="text-[11px] text-slate-400 pt-1">
              Timings: {settings.businessHours}
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Location info */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            {settings.footerText || '© 2026 Ali Electronic. All Rights Reserved.'}
          </p>

          <div className="flex items-center gap-4">
            <span className="font-semibold text-slate-300">
              Hassan Abdal, Pakistan
            </span>

            <button
              onClick={scrollToTop}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              aria-label="Scroll back to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}

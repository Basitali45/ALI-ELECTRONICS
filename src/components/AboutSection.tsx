import React from 'react';
import { ShieldCheck, Award, Truck, RefreshCw, Phone } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { StoreSettings } from '../types';
import { OFFICIAL_WHATSAPP_NUMBER, getWhatsAppUrl } from '../lib/policy';

interface AboutSectionProps {
  settings: StoreSettings;
}

export function AboutSection({ settings }: AboutSectionProps) {
  const cleanWhatsApp = (settings?.whatsappNumber || OFFICIAL_WHATSAPP_NUMBER).replace(/^0/, '92').replace(/[^0-9]/g, '');

  return (
    <section id="about" className="py-16 md:py-24 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Visual Brand Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="relative rounded-3xl overflow-hidden bg-slate-900 shadow-xl border border-slate-800">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000&auto=format&fit=crop&q=80"
                alt="ZAPLIX Online Shopping Store"
                className="w-full h-80 object-cover object-center opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white space-y-2">
                <div className="text-xs uppercase tracking-wider text-cyan-300 font-semibold">
                  Shop Smarter &bull; Live Better
                </div>
                <div className="font-heading text-xl font-bold">
                  ZAPLIX Pakistan
                </div>
                <div className="text-xs text-slate-200">
                  Curated quality products delivered with zero delivery charges and complete peace of mind through Cash on Delivery.
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-center">
                <div className="font-mono text-2xl font-black text-blue-600 dark:text-cyan-400">Rs. 0</div>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">Free Home Delivery</div>
                <div className="text-[11px] text-slate-500">On every single order</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-center">
                <div className="font-mono text-2xl font-black text-emerald-600 dark:text-emerald-400">100%</div>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">Cash on Delivery</div>
                <div className="text-[11px] text-slate-500">Pay when you receive</div>
              </div>
            </div>
          </div>

          {/* Right Column: Narrative & Values */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold tracking-wider text-blue-600 dark:text-cyan-400 uppercase">
                About ZAPLIX
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
                Pakistan's Trusted Destination for Everyday Quality &amp; Value
              </h2>
            </div>

            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {settings.aboutText || (
                'ZAPLIX is Pakistan\'s premier multi-category online shopping brand. We bring you curated, top-grade fashion, beauty, electronics, home decor and lifestyle essentials with guaranteed Cash on Delivery, 100% Free Home Delivery on all orders, and 7-day hassle-free returns.'
              )}
            </p>

            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Our mission is simple: eliminate shipping fees and eliminate shopping friction. Whether you are ordering a single beauty serum or a collection of fashion items, you enjoy zero delivery fees and pay securely in cash upon doorstep delivery.
            </p>

            {/* Core Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60">
                <Truck className="w-5 h-5 text-blue-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                    Free Home Delivery Nationwide
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Zero shipping charges on all orders, with no minimum purchase requirement.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                    Cash on Delivery (COD)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Total financial safety. Pay for your parcel right at your doorstep.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60">
                <RefreshCw className="w-5 h-5 text-blue-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                    7-Day Easy Returns
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Receive your order with confidence. Simple replacement or return if needed.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60">
                <WhatsAppIcon className="w-5 h-5 fill-[#25D366] text-[#25D366] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                    Dedicated WhatsApp Desk
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Live customer support at 03189869746 for inquiries, tracking, and quick orders.
                  </p>
                </div>
              </div>
            </div>

            {/* Direct Connect Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <a
                href={`tel:${settings.phone1 || OFFICIAL_WHATSAPP_NUMBER}`}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors flex items-center gap-2"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Helpline: {settings.phone1 || OFFICIAL_WHATSAPP_NUMBER}</span>
              </a>

              <a
                href={getWhatsAppUrl('Hello Zaplix Team! I would like to inquire about your products.')}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#25D366] hover:bg-[#20ba59] text-white transition-all flex items-center gap-2 shadow-sm shadow-[#25D366]/20 cursor-pointer"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 fill-white text-white" />
                <span>Message Zaplix on WhatsApp</span>
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

import React from 'react';
import { ShieldCheck, Award, Users, MapPin, CheckCircle, Phone } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { StoreSettings } from '../types';

interface AboutSectionProps {
  settings: StoreSettings;
}

export function AboutSection({ settings }: AboutSectionProps) {
  const cleanWhatsApp = settings.whatsappNumber.replace(/^0/, '92').replace(/[^0-9]/g, '');

  return (
    <section id="about" className="py-16 md:py-24 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Visual Story Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="relative rounded-3xl overflow-hidden bg-slate-900 shadow-xl border border-slate-800">
              <img
                src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1000&auto=format&fit=crop&q=80"
                alt="Technology team Ali Electronics Hassan Abdal"
                className="w-full h-80 object-cover object-center opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white space-y-2">
                <div className="text-xs uppercase tracking-wider text-blue-300 font-semibold">
                  Hassan Abdal Electronics Partner
                </div>
                <div className="font-heading text-lg font-bold">
                  Arbaz Ahmed & Faraz Ahmed
                </div>
                <div className="text-xs text-slate-200">
                  Committed to delivering reliable electronics, verified specs, and honest advice to our community.
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-center">
                <div className="font-mono text-2xl font-extrabold text-blue-600 dark:text-blue-400">100%</div>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">Authentic Tested</div>
                <div className="text-[11px] text-slate-500">Every piece inspected</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-center">
                <div className="font-mono text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">PKR</div>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">Fair Pricing</div>
                <div className="text-[11px] text-slate-500">Competitive local rates</div>
              </div>
            </div>
          </div>

          {/* Right Column: Narrative & Values */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold tracking-wider text-blue-600 dark:text-blue-400 uppercase">
                About Ali Electronics
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
                Your Neighborhood Hub for Modern Electronics & Accessories
              </h2>
            </div>

            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {settings.aboutText || (
                'Ali Electronics is a local electronics business serving customers in Hassan Abdal with quality electronics products, competitive pricing and customer-focused service.'
              )}
            </p>

            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Located conveniently at the <strong>Main Bus Stop on Islam Shaheed Road, opposite New Sethi Flour Mills</strong>, we make it effortless for students, professionals, and households across Hassan Abdal and surrounding areas to get high-performance chargers, tough cables, immersive wireless audio, high-capacity power banks, and electronic essentials.
            </p>

            {/* Core Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60">
                <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                    Checked Before Handover
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    We test chargers, earbuds, cables, and power units in front of you so you take home zero hassle.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60">
                <Award className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                    Wholesale-Direct Value
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Competitive Pakistani Rupee rates directly sourced without middlemen markups.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60">
                <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                    Central Hassan Abdal Stop
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Prominent, easy-to-reach bus stop location with convenient customer parking nearby.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60">
                <WhatsAppIcon className="w-5 h-5 fill-[#25D366] text-[#25D366] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                    Instant WhatsApp Support
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Ask availability, request pictures, or reserve items directly on WhatsApp at any time.
                  </p>
                </div>
              </div>
            </div>

            {/* Direct Connect Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <a
                href={`tel:${settings.phone1}`}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors flex items-center gap-2"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call {settings.phone1Name}: {settings.phone1}</span>
              </a>

              <a
                href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent('Assalam-o-Alaikum Ali Electronics, I would like to inquire about your products.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#25D366] hover:bg-[#20ba59] text-white transition-all flex items-center gap-2 shadow-sm shadow-[#25D366]/20 cursor-pointer"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 fill-white text-white" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

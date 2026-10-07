import React from 'react';
import { 
  Smartphone, 
  BatteryCharging, 
  Cable, 
  Headphones, 
  Speaker, 
  Lightbulb, 
  BatteryMedium, 
  Monitor, 
  Wifi, 
  Watch, 
  Home, 
  Cpu, 
  Folder 
} from 'lucide-react';
import { Category, Product } from '../types';

interface CategoriesSectionProps {
  categories: Category[];
  products: Product[];
  onSelectCategory: (categoryName: string) => void;
}

export function CategoriesSection({ categories, products, onSelectCategory }: CategoriesSectionProps) {
  const visibleCategories = categories
    .filter((c) => c.isVisible !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const getCategoryIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('mobile') || lower.includes('phone') || lower.includes('case')) return <Smartphone className="w-5 h-5" />;
    if (lower.includes('charger')) return <BatteryCharging className="w-5 h-5" />;
    if (lower.includes('cable') || lower.includes('wire')) return <Cable className="w-5 h-5" />;
    if (lower.includes('earphone') || lower.includes('airpod') || lower.includes('neckband')) return <Headphones className="w-5 h-5" />;
    if (lower.includes('headphone')) return <Headphones className="w-5 h-5" />;
    if (lower.includes('speaker') || lower.includes('sound')) return <Speaker className="w-5 h-5" />;
    if (lower.includes('led') || lower.includes('light')) return <Lightbulb className="w-5 h-5" />;
    if (lower.includes('power bank')) return <BatteryMedium className="w-5 h-5" />;
    if (lower.includes('battery')) return <BatteryMedium className="w-5 h-5" />;
    if (lower.includes('computer') || lower.includes('mouse') || lower.includes('keyboard')) return <Monitor className="w-5 h-5" />;
    if (lower.includes('network') || lower.includes('router') || lower.includes('wifi')) return <Wifi className="w-5 h-5" />;
    if (lower.includes('smart') || lower.includes('watch')) return <Watch className="w-5 h-5" />;
    if (lower.includes('home')) return <Home className="w-5 h-5" />;
    return <Folder className="w-5 h-5" />;
  };

  return (
    <section id="categories" className="py-16 md:py-20 bg-slate-50 dark:bg-slate-950 border-t border-slate-200/60 dark:border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold tracking-wider text-blue-600 dark:text-blue-400 uppercase">
            Browse By Department
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Electronics Categories
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Click any department to view available items and wholesale-level retail prices in Hassan Abdal.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {visibleCategories.map((cat, idx) => {
            const count = products.filter(p => p.category.toLowerCase() === cat.name.toLowerCase()).length;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.name)}
                className="group p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-500/40 hover:shadow-md transition-all text-left flex flex-col justify-between space-y-3 cursor-pointer overflow-hidden relative animate-product-drop"
                style={{ animationDelay: `${(idx % 12) * 45}ms` }}
              >
                {cat.image ? (
                  <div className="w-full h-24 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white backdrop-blur-xs">
                      {getCategoryIcon(cat.name)}
                    </div>
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {getCategoryIcon(cat.name)}
                  </div>
                )}

                <div>
                  <h4 className="font-heading font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                    {cat.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {count} {count === 1 ? 'Product' : 'Products'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
}

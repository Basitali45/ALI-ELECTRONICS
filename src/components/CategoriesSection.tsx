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
  Tv, 
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
    if (lower.includes('charger') || lower.includes('adapter')) return <BatteryCharging className="w-5 h-5" />;
    if (lower.includes('cable') || lower.includes('wire')) return <Cable className="w-5 h-5" />;
    if (lower.includes('audio') || lower.includes('earphone') || lower.includes('airpod') || lower.includes('headphone')) return <Headphones className="w-5 h-5" />;
    if (lower.includes('speaker') || lower.includes('sound')) return <Speaker className="w-5 h-5" />;
    if (lower.includes('appliance') || lower.includes('home')) return <Home className="w-5 h-5" />;
    if (lower.includes('smart') || lower.includes('watch') || lower.includes('device')) return <Watch className="w-5 h-5" />;
    if (lower.includes('led') || lower.includes('light')) return <Lightbulb className="w-5 h-5" />;
    if (lower.includes('power bank') || lower.includes('battery')) return <BatteryMedium className="w-5 h-5" />;
    if (lower.includes('computer') || lower.includes('pc') || lower.includes('laptop')) return <Monitor className="w-5 h-5" />;
    if (lower.includes('network') || lower.includes('router') || lower.includes('wifi')) return <Wifi className="w-5 h-5" />;
    if (lower.includes('electronic') || lower.includes('tv')) return <Tv className="w-5 h-5" />;
    return <Cpu className="w-5 h-5" />;
  };

  return (
    <section id="categories" className="py-16 md:py-24 bg-white dark:bg-slate-950 border-t border-slate-200/70 dark:border-slate-800/70 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <span className="text-xs font-bold tracking-widest text-blue-600 dark:text-cyan-400 uppercase font-mono">
            Modern Electronics Departments
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
            Explore by Category
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Browse our wide selection of mobile accessories, audio gear, fast chargers, and smart technology at Hassan Abdal.
          </p>
        </div>

        {/* Categories Grid with 3D Depth Lift */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4.5">
          {visibleCategories.map((cat, idx) => {
            const count = products.filter(p => p.category.toLowerCase() === cat.name.toLowerCase()).length;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.name)}
                className="group p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 card-3d-lift hover:border-blue-500/60 dark:hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 text-left flex flex-col justify-between space-y-3 cursor-pointer overflow-hidden relative"
                style={{ animationDelay: `${(idx % 12) * 40}ms` }}
              >
                {cat.image ? (
                  <div className="w-full h-28 rounded-xl overflow-hidden bg-slate-200/70 dark:bg-slate-800 relative">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-950/60 text-white backdrop-blur-md">
                      {getCategoryIcon(cat.name)}
                    </div>
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {getCategoryIcon(cat.name)}
                  </div>
                )}

                <div>
                  <h4 className="font-heading font-black text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-1">
                    {cat.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                    {count} {count === 1 ? 'Item' : 'Items'} Available
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

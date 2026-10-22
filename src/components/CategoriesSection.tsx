import React from 'react';
import { Shirt, Droplet, Sofa, Glasses, Tag } from 'lucide-react';
import { Category, Product } from '../types';

interface CategoriesSectionProps {
  categories: Category[];
  products: Product[];
  onSelectCategory: (categoryName: string) => void;
}

export function getCategoryIcon(name: string, className = 'w-[22px] h-[22px]') {
  const n = name.toLowerCase();
  const props = { className, strokeWidth: 1.5 };
  if (n.includes('fashion') || n.includes('cloth') || n.includes('wear')) return <Shirt {...props} />;
  if (n.includes('beauty') || n.includes('skin') || n.includes('care')) return <Droplet {...props} />;
  if (n.includes('home') || n.includes('decor') || n.includes('living')) return <Sofa {...props} />;
  if (n.includes('access')) return <Glasses {...props} />;
  return <Tag {...props} />;
}

export function CategoriesSection({ categories, onSelectCategory }: CategoriesSectionProps) {
  const visible = categories
    .filter((c) => c.isVisible !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  if (visible.length === 0) return null;

  return (
    <section id="categories" className="py-7 md:py-9">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 space-y-4">
        <h2 className="text-center text-[18px] font-bold text-slate-900 dark:text-white">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {visible.slice(0, 8).map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.name)}
              className="flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-2xl bg-white dark:bg-[#0d1524] border border-slate-200/70 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] dark:hover:border-amber-500/50 transition-all text-slate-800 dark:text-slate-100 cursor-pointer group"
            >
              <div className="text-slate-700 dark:text-slate-300 group-hover:text-amber-500 transition-colors">
                {getCategoryIcon(cat.name)}
              </div>
              <span className="text-[13px] font-semibold text-center">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CategoriesSection;

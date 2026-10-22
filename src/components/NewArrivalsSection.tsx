import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface NewArrivalsSectionProps {
  products: Product[];
  whatsappNumber?: string;
  onViewDetails: (product: Product) => void;
  onDirectOrder?: (product: Product) => void;
  onViewAllClick: () => void;
}

export function NewArrivalsSection({
  products,
  whatsappNumber,
  onViewDetails,
  onDirectOrder,
  onViewAllClick,
}: NewArrivalsSectionProps) {
  const items = products.filter((p) => p.isNewArrival && p.active !== false).slice(0, 8);
  if (items.length === 0) return null;

  return (
    <section id="new-arrivals" className="py-5 md:py-7">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[22px] md:text-[18px] font-bold text-slate-900 dark:text-white">
            New Arrivals
          </h2>
          <button
            onClick={onViewAllClick}
            className="flex items-center gap-1.5 text-[14px] md:text-[13px] font-semibold text-slate-700 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 transition-colors cursor-pointer"
          >
            <span>See all</span>
            <ArrowRight className="w-4 h-4" strokeWidth={1.8} />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              whatsappNumber={whatsappNumber}
              onViewDetails={onViewDetails}
              onDirectOrder={onDirectOrder}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default NewArrivalsSection;

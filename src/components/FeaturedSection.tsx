import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface FeaturedSectionProps {
  products: Product[];
  whatsappNumber: string;
  whatsappButtonEnabled?: boolean;
  onViewDetails: (product: Product) => void;
  onDirectOrder: (product: Product) => void;
  onViewAllClick: () => void;
}

export function FeaturedSection({
  products,
  whatsappNumber,
  whatsappButtonEnabled = true,
  onViewDetails,
  onDirectOrder,
  onViewAllClick,
}: FeaturedSectionProps) {
  const featured = products.filter((p) => p.featured).slice(0, 4);

  if (featured.length === 0) return null;

  return (
    <section className="py-16 md:py-20 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Handpicked Selection</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Featured Electronics
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Our most popular gadgets and customer favorites in Hassan Abdal.
            </p>
          </div>

          <button
            onClick={onViewAllClick}
            className="self-start sm:self-auto text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 group"
          >
            <span>View All Products</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((product, index) => (
            <div
              key={product.id}
              className="animate-product-drop"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <ProductCard
                product={product}
                whatsappNumber={whatsappNumber}
                whatsappButtonEnabled={whatsappButtonEnabled}
                onViewDetails={onViewDetails}
                onDirectOrder={onDirectOrder}
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

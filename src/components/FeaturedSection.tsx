import React from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface FeaturedSectionProps {
  products: Product[];
  whatsappNumber?: string;
  whatsappButtonEnabled?: boolean;
  onViewDetails: (product: Product) => void;
  onDirectOrder?: (product: Product) => void;
  onViewAllClick: () => void;
}

export function FeaturedSection({
  products,
  whatsappNumber,
  whatsappButtonEnabled,
  onViewDetails,
  onDirectOrder,
}: FeaturedSectionProps) {
  const featured = products.filter((p) => p.featured && p.active !== false).slice(0, 8);
  if (featured.length === 0) return null;

  return (
    <section id="featured" className="py-5 md:py-7">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 space-y-4">
        <h2 className="text-[20px] md:text-[18px] font-bold text-slate-900 dark:text-white">
          Featured Products
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featured.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              whatsappNumber={whatsappNumber}
              whatsappButtonEnabled={whatsappButtonEnabled}
              onViewDetails={onViewDetails}
              onDirectOrder={onDirectOrder}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedSection;

import React from 'react';
import { Heart, Plus } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  whatsappNumber?: string;
  whatsappButtonEnabled?: boolean;
  onViewDetails: (product: Product) => void;
  onDirectOrder?: (product: Product) => void;
}

export function ProductCard({ product, onViewDetails }: ProductCardProps) {
  const { addToCart, isInWishlist, toggleWishlist } = useCart();
  const isOutOfStock = product.availability === 'Out of Stock';
  const inWishlist = isInWishlist(product.id);

  const discountPercent =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null;
  const tag = product.discount || (discountPercent ? `${discountPercent}% OFF` : product.badge || '');

  return (
    <div className="group flex flex-col bg-white dark:bg-[#0d1524] rounded-2xl p-2.5 md:p-3 border border-slate-200/70 dark:border-slate-800/80 shadow-[0_4px_18px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_22px_rgba(0,0,0,0.35)] hover:shadow-[0_8px_26px_rgba(0,0,0,0.08)] dark:hover:border-slate-700 transition-all">
      <div
        onClick={() => onViewDetails(product)}
        className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#f5f6f8] dark:bg-[#141e30] cursor-pointer"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="zaplix-img h-full w-full object-contain group-hover:scale-[1.05] transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).style.visibility = 'hidden';
          }}
        />

        {tag && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900 dark:bg-amber-500 text-white dark:text-black text-[9px] font-bold tracking-wider uppercase shadow-sm">
            {tag}
          </span>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm flex items-center justify-center text-slate-800 dark:text-slate-100 hover:scale-110 transition-transform cursor-pointer shadow-sm"
        >
          <Heart
            className={`w-3.5 h-3.5 ${
              inWishlist ? 'fill-rose-500 text-rose-500' : ''
            }`}
            strokeWidth={1.8}
          />
        </button>

        {!isOutOfStock && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product, 1);
            }}
            aria-label={`Add ${product.name} to bag`}
            className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-slate-900 dark:bg-amber-500 text-white dark:text-black flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-transform cursor-pointer"
          >
            <Plus className="w-4 h-4" strokeWidth={2.2} />
          </button>
        )}
      </div>

      <div className="pt-3 pb-1 text-center space-y-1">
        <h3
          onClick={() => onViewDetails(product)}
          title={product.name}
          className="text-[13px] md:text-[14px] font-medium text-slate-900 dark:text-slate-100 line-clamp-1 cursor-pointer hover:text-amber-500 transition-colors"
        >
          {product.name}
        </h3>
        {isOutOfStock ? (
          <p className="text-[12px] font-semibold text-rose-600 dark:text-rose-400">Sold out</p>
        ) : (
          <p className="text-[14px] md:text-[15px] font-bold text-slate-900 dark:text-white">
            Rs. {product.price.toLocaleString()}
            {product.oldPrice && product.oldPrice > product.price && (
              <span className="ml-1.5 text-[11px] font-medium text-slate-400 dark:text-slate-500 line-through">
                Rs. {product.oldPrice.toLocaleString()}
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}

export default ProductCard;

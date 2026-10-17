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
    <div className="group flex flex-col bg-white rounded-2xl p-2.5 md:p-3 shadow-[0_4px_18px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_26px_rgba(0,0,0,0.09)] transition-shadow">
      <div
        onClick={() => onViewDetails(product)}
        className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#f3f2ef] cursor-pointer"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="zv-img h-full w-full object-contain group-hover:scale-[1.04] transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).style.visibility = 'hidden';
          }}
        />

        {tag && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black text-white text-[9px] font-bold tracking-wider uppercase">
            {tag}
          </span>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-black hover:scale-110 transition-transform cursor-pointer"
        >
          <Heart className={`w-3.5 h-3.5 ${inWishlist ? 'fill-black' : ''}`} strokeWidth={1.7} />
        </button>

        {!isOutOfStock && (
          <button
            onClick={(e) => { e.stopPropagation(); addToCart(product, 1); }}
            aria-label={`Add ${product.name} to bag`}
            className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-transform cursor-pointer"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
          </button>
        )}
      </div>

      <div className="pt-3 pb-1.5 text-center space-y-1">
        <h3
          onClick={() => onViewDetails(product)}
          title={product.name}
          className="text-[13px] md:text-[14px] text-black line-clamp-1 cursor-pointer"
        >
          {product.name}
        </h3>
        {isOutOfStock ? (
          <p className="text-[12px] font-semibold text-rose-600">Sold out</p>
        ) : (
          <p className="text-[14px] md:text-[15px] font-bold text-black">
            Rs. {product.price.toLocaleString()}
            {product.oldPrice && product.oldPrice > product.price && (
              <span className="ml-1.5 text-[11px] font-medium text-slate-400 line-through">
                Rs. {product.oldPrice.toLocaleString()}
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}

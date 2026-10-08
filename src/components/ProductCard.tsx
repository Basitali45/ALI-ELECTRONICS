import React from 'react';
import { Eye, Check, AlertCircle, XCircle } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  whatsappNumber: string;
  whatsappButtonEnabled?: boolean;
  onViewDetails: (product: Product) => void;
  onDirectOrder?: (product: Product) => void;
}

export function ProductCard({ 
  product, 
  whatsappNumber, 
  whatsappButtonEnabled = true, 
  onViewDetails, 
  onDirectOrder 
}: ProductCardProps) {
  const isOutOfStock = product.availability === 'Out of Stock';
  const isLimited = product.availability === 'Limited Stock';

  const cleanPhone = (whatsappNumber || '03115321647').replace(/^0/, '92').replace(/[^0-9]/g, '');

  const waOrderUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Assalam-o-Alaikum Ali Electronics, I want to ${isOutOfStock ? 'inquire about stock for' : 'order'}: ${product.name} (Price: Rs. ${product.price.toLocaleString()}). Please confirm availability.`
  )}`;

  // Calculate discount percentage if oldPrice exists
  const discountPercent =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null;

  const displayDiscount = product.discount || (discountPercent ? `${discountPercent}% OFF` : null);

  const getBadgeStyle = (badge: string) => {
    switch (badge) {
      case 'SALE':
        return 'bg-rose-600 text-white';
      case 'HOT':
        return 'bg-amber-600 text-white';
      case 'NEW':
        return 'bg-emerald-600 text-white';
      case 'POPULAR':
        return 'bg-indigo-600 text-white';
      case 'LIMITED':
        return 'bg-purple-600 text-white';
      case 'BEST SELLER':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-blue-600 text-white';
    }
  };

  const showWhatsApp = whatsappButtonEnabled && (product.whatsappEnabled !== false);

  return (
    <div className="group relative flex flex-col bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden card-3d-lift shadow-xs hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-black/40 hover:border-blue-400/60 dark:hover:border-blue-500/50 transition-all duration-300">
      
      {/* Product Image Container with 3D Depth Zoom */}
      <div 
        className="relative aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-800/80 cursor-pointer" 
        onClick={() => onViewDetails(product)}
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover object-center group-hover:scale-106 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80';
          }}
        />

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.badge && (
            <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black tracking-wider uppercase shadow-xs ${getBadgeStyle(product.badge)}`}>
              {product.badge}
            </span>
          )}
          {displayDiscount && (
            <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black tracking-wider bg-rose-600 text-white shadow-xs">
              {displayDiscount}
            </span>
          )}
        </div>

        {/* Featured Tag */}
        {product.featured && (
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-lg text-[10px] font-bold tracking-wider bg-blue-600 text-white shadow-xs">
            Featured
          </div>
        )}

        {/* Quick View Hover Glass Overlay */}
        <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="px-3.5 py-1.5 rounded-xl bg-white/95 dark:bg-slate-900/95 text-xs font-bold text-slate-900 dark:text-white shadow-lg flex items-center gap-1.5 backdrop-blur-md transform group-hover:scale-100 scale-90 transition-transform">
            <Eye className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
            View Details
          </span>
        </div>
      </div>

      {/* Product Body */}
      <div className="flex flex-col flex-1 p-4 sm:p-5 space-y-3">
        
        {/* Category & Availability Status */}
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-blue-600 dark:text-cyan-400 truncate max-w-[130px]">
            {product.category}
          </span>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
          <span className="flex items-center gap-1 shrink-0">
            {isOutOfStock ? (
              <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                <XCircle className="w-3 h-3" /> Out of Stock
              </span>
            ) : isLimited ? (
              <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Limited
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-3 h-3" /> In Stock
              </span>
            )}
          </span>
        </div>

        {/* Title */}
        <h3
          onClick={() => onViewDetails(product)}
          className="font-heading font-black text-base text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-cyan-400 transition-colors line-clamp-2 cursor-pointer leading-snug"
          title={product.name}
        >
          {product.name}
        </h3>

        {/* Short Description */}
        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
          {product.shortDescription || product.description}
        </p>

        {/* Pricing */}
        <div className="pt-1 mt-auto flex items-baseline gap-2">
          <span className="text-lg font-black text-slate-950 dark:text-white font-mono tracking-tight">
            Rs. {product.price.toLocaleString()}
          </span>
          {product.oldPrice && (
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 line-through font-mono">
              Rs. {product.oldPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Actions: Direct WhatsApp & Details Buttons */}
        <div className={`grid gap-2 pt-2 ${showWhatsApp ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <button
            onClick={() => onViewDetails(product)}
            className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span>Details</span>
            <Eye className="w-3.5 h-3.5" />
          </button>

          {showWhatsApp && (
            <a
              href={waOrderUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Order ${product.name} on WhatsApp`}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-[#25D366]/20 active:scale-95 ${
                isOutOfStock
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-[#25D366] hover:bg-[#20ba59] text-white'
              }`}
            >
              <WhatsAppIcon className="w-3.5 h-3.5 fill-white text-white shrink-0" />
              <span className="truncate">{isOutOfStock ? 'Ask on WA' : 'Order on WA'}</span>
            </a>
          )}
        </div>

      </div>
    </div>
  );
}

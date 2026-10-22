import React, { useState, useEffect } from 'react';
import { 
  X, 
  Phone, 
  Check, 
  AlertCircle, 
  XCircle, 
  Minus, 
  Plus, 
  ShieldCheck, 
  Share2, 
  ShoppingBag,
  Zap,
  Truck
} from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { Product, StoreSettings } from '../types';
import { useCart } from '../context/CartContext';
import { toWhatsAppNumber } from '../lib/policy';

interface ProductDetailModalProps {
  product: Product | null;
  settings: StoreSettings;
  onClose: () => void;
}

export function ProductDetailModal({ product, settings, onClose }: ProductDetailModalProps) {
  const { addToCart, setIsCartOpen, setIsCheckoutOpen } = useCart();
  const [activeImage, setActiveImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (product) {
      setActiveImage(product.image);
      setQuantity(1);
      setCopiedLink(false);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product, onClose]);

  if (!product) return null;

  const isOutOfStock = product.availability === 'Out of Stock';
  const isLimited = product.availability === 'Limited Stock';

  const discountPercent =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null;

  const displayDiscount = product.discount || (discountPercent ? `${discountPercent}% OFF` : null);
  const allImages = [product.image, ...(product.additionalImages || [])].filter(Boolean);

  const cleanPhone = toWhatsAppNumber(settings.whatsappNumber);

  const handleWhatsAppOrder = () => {
    const qtyText = quantity > 1 ? ` (Quantity: ${quantity}, Total: Rs. ${(product.price * quantity).toLocaleString()})` : ` (Price: Rs. ${product.price.toLocaleString()})`;
    const text = `Hello Zaplix Team! I would like to ${isOutOfStock ? 'inquire about stock for' : 'order'}: ${product.name}${qtyText}. Delivery: Rs. 0 (Free Home Delivery). Payment: Cash on Delivery. Product Image: ${product.image}. Please confirm my order and availability.`;
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    setIsCartOpen(true);
    onClose();
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    onClose();
    setIsCheckoutOpen(true);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const showWhatsAppButton = settings.whatsappProductButtonEnabled !== false && product.whatsappEnabled !== false;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-white dark:bg-[#0d1524] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden mx-auto my-auto animate-modal-drop"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close product modal"
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
          {/* Left Column: Image & Thumbnails Gallery */}
          <div className="md:col-span-5 bg-slate-50 dark:bg-[#111927] p-6 flex flex-col items-center justify-start relative border-b md:border-b-0 md:border-r border-slate-200/80 dark:border-slate-800">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white dark:bg-[#070e1b] shadow-sm border border-slate-100 dark:border-slate-800">
              <img
                src={activeImage || product.image}
                alt={product.name}
                className="w-full h-full object-contain p-2"
              />

              {displayDiscount && (
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-black bg-rose-600 text-white shadow-sm">
                  {displayDiscount}
                </div>
              )}
            </div>

            {/* Thumbnail Carousel */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-2 mt-4 overflow-x-auto max-w-full pb-1">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      activeImage === img ? 'border-amber-500 scale-105 shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Shipping & returns badge */}
            <div className="mt-auto pt-6 w-full text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#070e1b] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold shadow-xs">
                <Truck className="w-4 h-4 text-amber-500" />
                <span>100% Free Home Delivery &bull; 7-day returns</span>
              </div>
            </div>
          </div>

          {/* Right Column: Product Specs & Ordering */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            {/* Category, Brand, Stock Status */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-600 dark:text-amber-400">
                {product.category} {product.brand ? `· ${product.brand}` : ''}
              </span>

              <span className="flex items-center gap-1.5">
                {isOutOfStock ? (
                  <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> Out of Stock
                  </span>
                ) : isLimited ? (
                  <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Limited Stock
                  </span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> In Stock ({product.stock || 15} units)
                  </span>
                )}
              </span>
            </div>

            {/* Title & SKU */}
            <div>
              <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
                {product.name}
              </h2>
              {product.sku && (
                <span className="text-xs text-slate-400 font-mono mt-1 block">
                  Product Code: {product.sku}
                </span>
              )}
            </div>

            {/* Pricing */}
            <div className="flex items-baseline gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
                Rs. {product.price.toLocaleString()}
              </span>
              {product.oldPrice && (
                <span className="text-sm font-medium text-slate-400 line-through font-mono">
                  Rs. {product.oldPrice.toLocaleString()}
                </span>
              )}
              {displayDiscount && (
                <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 ml-auto">
                  {displayDiscount}
                </span>
              )}
            </div>

            {/* Short & Full Description */}
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Product Details
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {product.description || product.shortDescription}
              </p>
            </div>

            {/* Specifications */}
            {product.specifications && product.specifications.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Key Specifications
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {product.specifications.map((spec, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div className="flex items-center gap-4 pt-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Quantity:
                </span>
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center font-mono font-bold text-sm text-slate-800 dark:text-slate-200">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-xs text-slate-500 font-mono">
                  Subtotal: Rs. {(product.price * quantity).toLocaleString()}
                </span>
              </div>
            )}

            {/* E-Commerce Buttons: Add to Cart & Buy Now */}
            <div className="space-y-2.5 pt-3 border-t border-slate-200/80 dark:border-slate-800/80">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-amber-500 hover:bg-amber-600 text-black shadow-md shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Zap className="w-4 h-4" />
                  <span>Buy Now</span>
                </button>
              </div>

              {/* WhatsApp direct order */}
              {showWhatsAppButton && (
                <button
                  onClick={handleWhatsAppOrder}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isOutOfStock
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-[#25D366] hover:bg-[#20ba59] shadow-[#25D366]/25'
                  }`}
                >
                  <WhatsAppIcon className="w-4 h-4 fill-white text-white" />
                  <span>
                    {isOutOfStock
                      ? 'Inquire Stock on WhatsApp'
                      : `Order Directly on WhatsApp (Rs. ${(product.price * quantity).toLocaleString()})`}
                  </span>
                </button>
              )}

              {/* Direct Call Section */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href={`tel:${settings.phone1}`}
                  className="py-2 px-3 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="truncate">Call Customer Care</span>
                </a>
                <a
                  href={`tel:${settings.phone2 || settings.phone1}`}
                  className="py-2 px-3 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="truncate">Helpline 2</span>
                </a>
              </div>
            </div>

            {/* Share link button */}
            <div className="pt-2 flex justify-between items-center text-xs text-slate-400">
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Share Product'}</span>
              </button>

              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                ZAPLIX &bull; Free Delivery &bull; COD
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailModal;

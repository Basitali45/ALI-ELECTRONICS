import React from 'react';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onViewDetails: (p: Product) => void;
}

export function WishlistDrawer({ isOpen, onClose, products, onViewDetails }: WishlistDrawerProps) {
  const { wishlist, toggleWishlist, addToCart } = useCart();
  if (!isOpen) return null;

  const items = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />
      <div className="relative w-full md:max-w-md max-h-[80vh] bg-white dark:bg-[#0d1524] rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col border border-slate-200/80 dark:border-slate-800 animate-modal-drop">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> Wishlist ({items.length})
          </h2>
          <button
            onClick={onClose}
            aria-label="Close wishlist"
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <Heart className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" strokeWidth={1.4} />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Your wishlist is empty. Tap the heart on any product to save it.
              </p>
            </div>
          ) : (
            items.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800"
              >
                <button
                  onClick={() => {
                    onClose();
                    onViewDetails(p);
                  }}
                  className="w-16 h-16 rounded-xl overflow-hidden bg-white dark:bg-slate-800 shrink-0 cursor-pointer p-1"
                >
                  <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{p.name}</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Rs. {p.price.toLocaleString()}</p>
                </div>
                <button
                  onClick={() => addToCart(p, 1)}
                  aria-label="Add to bag"
                  className="w-9 h-9 rounded-full bg-slate-900 hover:bg-black dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-black flex items-center justify-center transition-all cursor-pointer shadow-sm"
                >
                  <ShoppingBag className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleWishlist(p.id)}
                  aria-label="Remove"
                  className="p-2 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default WishlistDrawer;

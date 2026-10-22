import React from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck, 
  Truck,
  Sparkles 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { RETURN_DAYS, OFFICIAL_WHATSAPP_NUMBER } from '../lib/policy';
import { WhatsAppIcon } from './WhatsAppIcon';
import { StoreSettings } from '../types';

interface CartDrawerProps {
  settings: StoreSettings;
}

export function CartDrawer({ settings }: CartDrawerProps) {
  const { 
    items, 
    isCartOpen, 
    setIsCartOpen, 
    removeFromCart, 
    updateQuantity, 
    subtotal, 
    totalItems, 
    clearCart,
    setIsCheckoutOpen 
  } = useCart();

  if (!isCartOpen) return null;

  // PHASE 4: 100% Free Home Delivery on all orders
  const deliveryCharges = 0;
  const totalAmount = subtotal;

  const cleanAdminPhone = (settings.whatsappNumber || OFFICIAL_WHATSAPP_NUMBER)
    .replace(/^0/, '92')
    .replace(/[^0-9]/g, '');

  const handleQuickWhatsAppOrder = () => {
    if (items.length === 0) return;

    let text = `*ORDER INQUIRY — ZAPLIX*\n`;
    text += `Hello Zaplix Team! I would like to order the following items from your online store:\n\n`;

    items.forEach((item, idx) => {
      text += `${idx + 1}. *${item.product.name}*\n`;
      if (item.product.sku) text += `   SKU: ${item.product.sku}\n`;
      text += `   Qty: ${item.quantity} x Rs. ${item.product.price.toLocaleString()}\n`;
      text += `   Image: ${item.product.image}\n`;
    });

    text += `\n*Subtotal: Rs. ${subtotal.toLocaleString()}*\n`;
    text += `Delivery Charges: Rs. 0 — FREE HOME DELIVERY\n`;
    text += `Payment Method: Cash on Delivery\n`;
    text += `*Grand Total: Rs. ${totalAmount.toLocaleString()}*\n\n`;
    text += `Please confirm my order and delivery details. Thank you!`;

    window.open(`https://wa.me/${cleanAdminPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  Shopping Cart
                  {totalItems > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                      {totalItems}
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  ZAPLIX &bull; Shop Smarter. Live Better.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {items.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-rose-500 hover:text-rose-600 px-2 py-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Free Shipping Badge */}
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-100 dark:border-emerald-900/40 px-5 py-2.5 flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <Truck className="w-4 h-4 text-emerald-600" />
            <span>FREE HOME DELIVERY ON ALL ORDERS</span>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200">Your cart is empty</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                    Browse our products and add your favorites to enjoy Free Home Delivery nationwide!
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-md cursor-pointer"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div 
                  key={item.product.id}
                  className="flex gap-3.5 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-20 h-20 rounded-xl object-cover bg-slate-100 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shrink-0"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-slate-400 hover:text-rose-500 p-0.5 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {item.product.sku && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          SKU: {item.product.sku}
                        </span>
                      )}

                      <div className="text-xs font-bold text-blue-600 dark:text-cyan-400 mt-1">
                        Rs. {item.product.price.toLocaleString()}
                      </div>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="text-slate-500 hover:text-slate-800 dark:hover:text-white p-0.5 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-5 text-center text-slate-800 dark:text-slate-100">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="text-slate-500 hover:text-slate-800 dark:hover:text-white p-0.5 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-xs font-black text-slate-900 dark:text-white">
                        Rs. {(item.product.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Actions */}
          {items.length > 0 && (
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 space-y-3.5">
              
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Rs. {subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    <Truck className="w-3.5 h-3.5" />
                    Delivery Charges
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    Rs. 0 — FREE
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-sm">
                  <span className="font-bold text-slate-900 dark:text-white">Total Amount</span>
                  <span className="font-black text-base text-blue-600 dark:text-cyan-400">
                    Rs. {totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Checkout (COD)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleQuickWhatsAppOrder}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#25D366] hover:bg-[#20ba59] text-white shadow-lg shadow-[#25D366]/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <WhatsAppIcon className="w-4 h-4 fill-white" />
                  <span>WhatsApp (03189869746)</span>
                </button>
              </div>

              <p className="text-[11px] text-center text-slate-500 font-medium">
                Cash on Delivery &bull; Free Home Delivery on All Orders &bull; {RETURN_DAYS}-Day Returns
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

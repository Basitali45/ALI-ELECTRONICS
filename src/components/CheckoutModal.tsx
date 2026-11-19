import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  ArrowRight, 
  Printer, 
  MapPin, 
  Phone, 
  User, 
  AlertCircle,
  Truck,
  ShieldCheck,
  Gift,
  Copy,
  Check
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { WhatsAppIcon } from './WhatsAppIcon';
import { StoreSettings, Order } from '../types';
import { api } from '../services/api';
import { InvoiceModal } from './InvoiceModal';
import ZaplixLogo from './ZaplixLogo';

interface CheckoutModalProps {
  settings: StoreSettings;
  onOpenTrackOrder?: (order: Order) => void;
}

export function CheckoutModal({ settings, onOpenTrackOrder }: CheckoutModalProps) {
  const { 
    items, 
    subtotal, 
    clearCart, 
    isCheckoutOpen, 
    setIsCheckoutOpen 
  } = useCart();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');
  // PHASE 3: Only Cash on Delivery allowed
  const paymentMethod = 'Cash on Delivery';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  if (!isCheckoutOpen) return null;

  const handleCopyOrderId = async (orderIdText: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(orderIdText);
      } else {
        const ta = document.createElement('textarea');
        ta.value = orderIdText;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2500);
    } catch {
      // ignore
    }
  };

  // PHASE 4: 100% Free Home Delivery on all orders (PKR 0)
  const deliveryCharges = 0;
  const totalAmount = subtotal + deliveryCharges;

  const validateForm = () => {
    if (!fullName.trim()) return 'Please enter your full name.';
    if (!phone.trim()) return 'Please enter your contact phone number.';
    if (phone.replace(/[^0-9]/g, '').length < 10) return 'Please enter a valid 11-digit phone number.';
    if (!address.trim()) return 'Please enter your complete delivery address.';
    if (items.length === 0) return 'Your cart is empty. Please add items to order.';
    return null;
  };

  const handlePlaceOrder = async (isWhatsAppDirect = false) => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { order, whatsappUrl: waUrl } = await api.createOrder(
        {
          customerName: fullName.trim(),
          customerPhone: phone.trim(),
          customerWhatsapp: (whatsapp.trim() || phone.trim()),
          customerAddress: address.trim(),
          city: city.trim(),
          notes: notes.trim(),
          paymentMethod: 'Cash on Delivery', // Enforced trusted COD
        },
        items
      );

      setPlacedOrder(order);
      setWhatsappUrl(waUrl);
      clearCart();

      if (isWhatsAppDirect) {
        window.open(waUrl, '_blank');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit order. Please check your connection and retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setPlacedOrder(null);
    setError(null);
    setCopiedId(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm p-3 sm:p-6 flex animate-in fade-in duration-200">
        <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden mx-auto my-auto">
          
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/60">
            <div className="flex items-center gap-3">
              <ZaplixLogo variant="icon" />
              <div>
                <h2 className="font-heading font-black text-lg text-slate-900 dark:text-white">
                  {placedOrder ? 'Order Confirmed!' : 'Secure Checkout — ZAPLIX'}
                </h2>
                <p className="text-xs text-blue-600 dark:text-cyan-400 font-semibold flex items-center gap-1.5 mt-0.5">
                  <Truck className="w-3.5 h-3.5" />
                  <span>FREE HOME DELIVERY ON ALL ORDERS &bull; Cash on Delivery</span>
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ================= SUCCESS STATE ================= */}
          {placedOrder ? (
            <div className="p-6 sm:p-10 space-y-8 text-center">
              <div className="w-20 h-20 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="font-heading font-black text-2xl text-slate-900 dark:text-white">
                  Thank you, {placedOrder.customerName}!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Your order has been recorded in our system. Our team at <span className="font-bold text-slate-900 dark:text-white">ZAPLIX</span> will pack your items and dispatch them with <span className="font-bold text-emerald-600">Free Home Delivery</span>. You will pay via Cash on Delivery when your parcel arrives!
                </p>
              </div>

              {/* Copy Order ID for Future Order Tracking Card */}
              <div className="max-w-lg mx-auto p-4 sm:p-5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/25 border-2 border-amber-400/70 dark:border-amber-500/40 text-left space-y-2.5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 block">
                      Copy Your Order ID for Future Order Tracking
                    </span>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="font-mono text-xl sm:text-2xl font-black tracking-wide text-slate-900 dark:text-white select-all">
                        {placedOrder.orderNumber}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyOrderId(placedOrder.orderNumber)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-sm ${
                      copiedId
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950'
                    }`}
                  >
                    {copiedId ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Order ID Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Order ID</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[11px] sm:text-xs text-slate-700 dark:text-slate-300 leading-relaxed pt-1 border-t border-amber-200/70 dark:border-amber-700/40">
                  Please note or copy this Order ID (<strong className="font-mono">{placedOrder.orderNumber}</strong>). You can paste or share it with our <strong>ZAPLIX Support Agent</strong> anytime later to track your order!
                </p>
              </div>

              {/* Order Card Preview */}
              <div className="max-w-lg mx-auto p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-left space-y-3">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Delivery Address:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                    {placedOrder.customerAddress}, {placedOrder.city}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Contact Phone:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {placedOrder.customerPhone}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Payment Method:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Cash on Delivery (COD)
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Shipping Fee:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    Rs. 0 — FREE HOME DELIVERY
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-sm font-bold text-slate-900 dark:text-white">
                  <span>Total Amount (Pay on Delivery):</span>
                  <span className="text-blue-600 dark:text-cyan-400 font-black">
                    Rs. {placedOrder.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#25D366] hover:bg-[#20ba59] text-white shadow-lg shadow-[#25D366]/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <WhatsAppIcon className="w-4 h-4 fill-white" />
                    <span>Send Order to WhatsApp (03189869746)</span>
                  </a>
                )}

                <button
                  onClick={() => setShowInvoice(true)}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>View / Print Invoice</span>
                </button>

                {onOpenTrackOrder && (
                  <button
                    type="button"
                    onClick={() => {
                      const orderToTrack = placedOrder;
                      handleClose();
                      onOpenTrackOrder(orderToTrack);
                    }}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Track Order</span>
                  </button>
                )}

                <button
                  onClick={handleClose}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-blue-600 hover:bg-blue-700 text-white transition-all cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : (
            /* ================= CHECKOUT FORM ================= */
            <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Form inputs */}
              <div className="lg:col-span-7 space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                    1. Delivery Details
                  </h3>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="e.g. Muhammad Ali"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number (Call) *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        placeholder="0318-XXXXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      WhatsApp Number (Optional)
                    </label>
                    <div className="relative">
                      <WhatsAppIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        placeholder="Same as call phone or another"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      City / Area *
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="e.g. Lahore, Karachi, Islamabad..."
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Complete Street Address (House/Shop No., Street, Landmark) *
                  </label>
                  <textarea
                    rows={2}
                    placeholder="House/Shop no., Street name, Near landmark..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* PHASE 3: CASH ON DELIVERY ONLY UI */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Method
                  </label>
                  <div className="p-3.5 rounded-2xl border-2 border-emerald-500/80 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          Cash on Delivery (COD)
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                          Guaranteed
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                        Pay for your order when it arrives at your doorstep.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Special Notes / Delivery Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Call before delivery, deliver in afternoon..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Order Summary Column */}
              <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                    2. Order Summary ({items.length} items)
                  </h3>

                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {items.map((item) => (
                      <div 
                        key={item.product.id}
                        className="flex items-center gap-3 py-1.5 border-b border-slate-100 dark:border-slate-800 text-xs"
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-10 h-10 rounded-lg object-cover bg-white dark:bg-slate-900 shrink-0 border"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-white truncate">
                            {item.product.name}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Qty: {item.quantity} x Rs. {item.product.price.toLocaleString()}
                          </p>
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white shrink-0">
                          Rs. {(item.product.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Free Delivery Banner */}
                  <div className="mt-4 p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900 flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
                    <Gift className="w-4 h-4 shrink-0 text-blue-600 dark:text-cyan-400" />
                    <span className="font-semibold">FREE HOME DELIVERY ON ALL ORDERS</span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Subtotal</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        Rs. {subtotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Delivery Charges</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        Rs. 0 — FREE
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-sm font-bold text-slate-900 dark:text-white">
                      <span>Grand Total:</span>
                      <span className="font-black text-blue-600 dark:text-cyan-400 text-base">
                        Rs. {totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit buttons */}
                <div className="mt-6 space-y-2.5">
                  <button
                    type="button"
                    disabled={loading || items.length === 0}
                    onClick={() => handlePlaceOrder(false)}
                    className="w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {loading ? (
                      <span>Placing Order...</span>
                    ) : (
                      <>
                        <span>Confirm Order (Cash on Delivery)</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={loading || items.length === 0}
                    onClick={() => handlePlaceOrder(true)}
                    className="w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#25D366] hover:bg-[#20ba59] disabled:bg-slate-400 text-white shadow-lg shadow-[#25D366]/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <WhatsAppIcon className="w-4 h-4 fill-white" />
                    <span>Confirm via WhatsApp (03189869746)</span>
                  </button>

                  <p className="text-[11px] text-center text-slate-400 font-medium">
                    Cash on delivery available nationwide &bull; 7-day easy returns
                  </p>
                </div>

              </div>

            </div>
          )}

        </div>
      </div>

      {/* Invoice Modal for Printable Copy */}
      {placedOrder && showInvoice && (
        <InvoiceModal
          order={placedOrder}
          settings={settings}
          onClose={() => setShowInvoice(false)}
        />
      )}
    </>
  );
}

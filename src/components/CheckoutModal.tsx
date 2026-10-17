import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  ShoppingBag, 
  ArrowRight, 
  Printer, 
  MapPin, 
  Phone, 
  User, 
  FileText, 
  AlertCircle,
  Truck
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { WhatsAppIcon } from './WhatsAppIcon';
import { StoreSettings, Order } from '../types';
import { api } from '../services/api';
import { InvoiceModal } from './InvoiceModal';
import { getDeliveryCharges } from '../lib/policy';

interface CheckoutModalProps {
  settings: StoreSettings;
}

export function CheckoutModal({ settings }: CheckoutModalProps) {
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
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);

  if (!isCheckoutOpen) return null;

  const deliveryCharges = getDeliveryCharges(subtotal, settings.deliveryCharges);
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
          paymentMethod,
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
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm p-3 sm:p-6 flex animate-in fade-in duration-200">
        <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden mx-auto my-auto">
          
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-600/30">
                Z
              </div>
              <div>
                <h2 className="font-heading font-black text-lg text-slate-900 dark:text-white">
                  {placedOrder ? 'Order Confirmed!' : 'Checkout & Order Placement'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Zyvara · Free shipping above Rs. 3,000 · 7-day returns
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
                <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  Order #{placedOrder.orderNumber}
                </span>
                <h3 className="font-heading font-black text-2xl text-slate-900 dark:text-white">
                  Thank you, {placedOrder.customerName}!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Your order has been permanently recorded in our system. Our team at Zyvara will prepare your order and contact you shortly.
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
                  <span>Phone Number:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {placedOrder.customerPhone}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Payment Method:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {placedOrder.paymentMethod}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-sm font-bold text-slate-900 dark:text-white">
                  <span>Total Amount:</span>
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
                    <span>Open WhatsApp Confirmation</span>
                  </a>
                )}

                <button
                  onClick={() => setShowInvoice(true)}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>View / Print Invoice</span>
                </button>

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
                    1. Customer Information
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
                        placeholder="0311-XXXXXXX"
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
                        placeholder="Your city"
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
                    Complete Address (Street, Mohallah, Landmark) *
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

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Cash on Delivery')}
                      className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                        paymentMethod === 'Cash on Delivery'
                          ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Truck className="w-4 h-4 mb-1" />
                      Cash on Delivery
                    </button>

      

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Special Notes / Inquiries
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Call before delivery, urgent delivery request..."
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

                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Subtotal</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        Rs. {subtotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Shipping</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{deliveryCharges > 0 ? `Rs. ${deliveryCharges.toLocaleString()}` : 'FREE'}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-sm font-bold text-slate-900 dark:text-white">
                      <span>Final Total:</span>
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
                      <span>Recording Order...</span>
                    ) : (
                      <>
                        <span>Confirm & Place Order</span>
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
                    <span>Order via WhatsApp (with Image URLs)</span>
                  </button>

                  <p className="text-[11px] text-center text-slate-400">
                    Cash on delivery available. 7-day easy returns.
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

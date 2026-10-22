import React from 'react';
import { X, Instagram } from 'lucide-react';
import { RETURN_DAYS, OFFICIAL_WHATSAPP_NUMBER, INSTAGRAM_HANDLE, INSTAGRAM_URL } from '../lib/policy';
import { StoreSettings } from '../types';

export type PolicyKey = 'shipping' | 'returns' | 'faqs' | 'privacy' | 'terms';

interface PolicyModalProps {
  policy: PolicyKey | null;
  settings: StoreSettings;
  onClose: () => void;
}

export function PolicyModal({ policy, settings, onClose }: PolicyModalProps) {
  if (!policy) return null;
  const brand = settings.businessName || 'ZAPLIX';
  const whatsapp = settings.whatsappNumber || OFFICIAL_WHATSAPP_NUMBER;
  const phone = settings.phone1 || OFFICIAL_WHATSAPP_NUMBER;

  const content: Record<PolicyKey, { title: string; body: React.ReactNode }> = {
    shipping: {
      title: 'Free Shipping & Delivery Policy',
      body: (
        <>
          <p><strong>FREE HOME DELIVERY ON ALL ORDERS:</strong> We are proud to offer 100% Free Home Delivery nationwide across Pakistan on every order with zero minimum purchase requirement. No hidden delivery fees.</p>
          <p><strong>Cash on Delivery (COD):</strong> Pay conveniently in cash when your order arrives at your doorstep.</p>
          <p><strong>Delivery Time:</strong> Major cities (Lahore, Karachi, Islamabad, Rawalpindi) typically receive deliveries within 2–4 business days. Other cities and regions within 3–6 business days.</p>
        </>
      ),
    },
    returns: {
      title: '7-Day Return & Replacement Policy',
      body: (
        <>
          <p><strong>{RETURN_DAYS}-Day Hassle-Free Returns:</strong> If you receive a damaged, defective, or incorrect product, you can initiate a return or replacement within {RETURN_DAYS} days of receiving the package.</p>
          <p>Items must be unused, in their original condition and packaging. To initiate a return, simply contact us via WhatsApp ({whatsapp}) or call our support desk at {phone}.</p>
        </>
      ),
    },
    faqs: {
      title: 'Frequently Asked Questions (FAQs)',
      body: (
        <>
          <p><strong>How do I place an order?</strong> Add your favorite products to the cart and proceed to checkout, or click "Order via WhatsApp" on any product or cart page.</p>
          <p><strong>What payment methods are supported?</strong> We support Cash on Delivery (COD) for your complete security and peace of mind. Pay when your parcel arrives.</p>
          <p><strong>How much are delivery charges?</strong> Delivery is completely FREE on all orders across Pakistan with no minimum order required.</p>
          <p><strong>How can I connect on Instagram?</strong> Follow us on Instagram at <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-pink-500 font-bold hover:underline inline-flex items-center gap-1"><Instagram className="w-3.5 h-3.5" />{INSTAGRAM_HANDLE}</a>.</p>
          <p><strong>How can I track or inquire about my order?</strong> Message our dedicated WhatsApp support team at {whatsapp} or call {phone}.</p>
        </>
      ),
    },
    privacy: {
      title: 'Privacy Policy',
      body: (
        <>
          <p><strong>{brand}</strong> respects your privacy. We only collect the necessary information (name, delivery address, phone number) required to deliver your orders and provide customer support.</p>
          <p>We never sell or disclose your personal data to third parties. Your information is processed securely for order fulfillment.</p>
        </>
      ),
    },
    terms: {
      title: 'Terms of Service',
      body: (
        <>
          <p>By placing an order on {brand}, you agree to provide complete and accurate delivery details. Orders are delivered via reputable courier partners across Pakistan.</p>
          <p>All orders qualify for 100% Free Home Delivery with Cash on Delivery payment. Returns and exchanges are governed by our {RETURN_DAYS}-day return policy.</p>
        </>
      ),
    },
  };

  const current = content[policy] || content.shipping;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0d1524] rounded-3xl shadow-2xl p-6 sm:p-8 space-y-4 animate-modal-drop border border-slate-200 dark:border-slate-800">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
          {current.title}
        </h3>
        <div className="space-y-3.5 text-xs sm:text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">
          {current.body}
        </div>
      </div>
    </div>
  );
}

export default PolicyModal;

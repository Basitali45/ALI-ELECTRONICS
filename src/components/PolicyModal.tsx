import React from 'react';
import { X } from 'lucide-react';
import { FREE_SHIPPING_THRESHOLD, RETURN_DAYS } from '../lib/policy';
import { StoreSettings } from '../types';

export type PolicyKey = 'shipping' | 'faqs' | 'privacy' | 'terms';

interface PolicyModalProps {
  policy: PolicyKey | null;
  settings: StoreSettings;
  onClose: () => void;
}

export function PolicyModal({ policy, settings, onClose }: PolicyModalProps) {
  if (!policy) return null;
  const brand = settings.businessName || 'Zyvara';
  const th = `Rs. ${FREE_SHIPPING_THRESHOLD.toLocaleString()}`;

  const content: Record<PolicyKey, { title: string; body: React.ReactNode }> = {
    shipping: {
      title: 'Shipping & Returns',
      body: (
        <>
          <p><strong>Free shipping</strong> on all orders above {th}. Orders below {th} carry a small flat delivery fee shown at checkout.</p>
          <p><strong>{RETURN_DAYS}-day returns.</strong> If something isn't right, contact us within {RETURN_DAYS} days of delivery. Items must be unused and in original packaging.</p>
          <p>To start a return, message us on WhatsApp ({settings.whatsappNumber}) or call customer service on {settings.phone1} / {settings.phone2}.</p>
        </>
      ),
    },
    faqs: {
      title: 'FAQs',
      body: (
        <>
          <p><strong>How do I order?</strong> Add items to your bag and checkout, or message us directly on WhatsApp.</p>
          <p><strong>How much is shipping?</strong> Free above {th}.</p>
          <p><strong>Can I return an item?</strong> Yes — within {RETURN_DAYS} days of delivery.</p>
          <p><strong>How can I reach support?</strong> Call {settings.phone1} or {settings.phone2}, or WhatsApp {settings.whatsappNumber}.</p>
        </>
      ),
    },
    privacy: {
      title: 'Privacy Policy',
      body: (
        <>
          <p>{brand} only collects the details you give us (name, phone, address, email) to process orders and answer your messages.</p>
          <p>We never sell your personal information. You can ask us to delete your details at any time by contacting customer care.</p>
        </>
      ),
    },
    terms: {
      title: 'Terms',
      body: (
        <>
          <p>By placing an order with {brand} you agree to provide accurate details and to pay the listed price plus any delivery fee shown at checkout.</p>
          <p>Prices and availability may change without notice. Free shipping applies to orders above {th}; returns are accepted within {RETURN_DAYS} days of delivery.</p>
        </>
      ),
    },
  };

  const { title, body } = content[policy];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 space-y-3 animate-modal-drop">
        <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 p-1 text-slate-500 hover:text-black cursor-pointer"><X className="w-5 h-5" /></button>
        <h3 className="text-lg font-semibold text-black">{title}</h3>
        <div className="space-y-3 text-[13px] leading-relaxed text-slate-700">{body}</div>
      </div>
    </div>
  );
}

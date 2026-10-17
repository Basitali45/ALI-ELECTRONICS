import React from 'react';
import { FREE_SHIPPING_THRESHOLD, RETURN_DAYS } from '../lib/policy';

export function TrustStrip() {
  return (
    <div className="py-5 px-5 text-center text-[12px] md:text-[11px] font-medium text-black leading-relaxed">
      Free Shipping on Orders Above Rs. {FREE_SHIPPING_THRESHOLD.toLocaleString()}
      <span className="mx-2 text-slate-400">•</span>
      {RETURN_DAYS}-Day Returns
      <span className="mx-2 text-slate-400">•</span>
      Secure Checkout
    </div>
  );
}

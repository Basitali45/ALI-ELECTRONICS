import React from 'react';
import { RETURN_DAYS } from '../lib/policy';
import { Truck, ShieldCheck, RefreshCw } from 'lucide-react';

export function TrustStrip() {
  return (
    <div className="border-y border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#080d18] py-4 px-4 text-center transition-colors">
      <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-[12px] sm:text-[13px] font-semibold text-slate-800 dark:text-slate-200">
        <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
          <Truck className="w-4 h-4" />
          <span>FREE HOME DELIVERY ON ALL ORDERS</span>
        </div>
        <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>CASH ON DELIVERY NATIONWIDE</span>
        </div>
        <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
          <RefreshCw className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>{RETURN_DAYS}-DAY EASY RETURNS</span>
        </div>
      </div>
    </div>
  );
}

export default TrustStrip;

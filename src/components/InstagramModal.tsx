import React, { useState } from 'react';
import { X, ExternalLink, Copy, Check, Instagram, Sparkles } from 'lucide-react';
import { INSTAGRAM_HANDLE, INSTAGRAM_URL, INSTAGRAM_QR_IMAGE } from '../lib/policy';

interface InstagramModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InstagramModal({ isOpen, onClose }: InstagramModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(INSTAGRAM_HANDLE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-white dark:bg-[#0f172a] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 text-center animate-modal-drop">
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close Instagram modal"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Instagram Header badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/10 via-pink-500/10 to-purple-500/10 border border-pink-500/20 text-pink-600 dark:text-pink-400 text-xs font-bold mb-3">
          <Instagram className="w-4 h-4" />
          <span>Official Instagram</span>
        </div>

        <h3 className="text-xl font-black text-slate-900 dark:text-white">
          Follow <span className="bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">{INSTAGRAM_HANDLE}</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[260px] mx-auto">
          Scan the QR code with your phone camera or Instagram app to explore new drops, reviews &amp; exclusive deals.
        </p>

        {/* QR Code Container */}
        <div className="my-5 p-3 rounded-2xl bg-gradient-to-br from-amber-100/60 via-pink-100/40 to-purple-100/60 dark:from-amber-950/30 dark:via-pink-950/20 dark:to-purple-950/30 border border-pink-200 dark:border-pink-900/40 inline-block shadow-inner">
          <div className="w-56 h-56 sm:w-60 sm:h-60 rounded-xl overflow-hidden bg-white shadow-md mx-auto">
            <img
              src={INSTAGRAM_QR_IMAGE}
              alt={`Instagram QR Code for ${INSTAGRAM_HANDLE}`}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-600 hover:via-rose-600 hover:to-purple-700 text-white font-bold text-sm shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Instagram className="w-4 h-4" />
            <span>Open Instagram Profile</span>
            <ExternalLink className="w-4 h-4 opacity-80" />
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500">Handle Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy {INSTAGRAM_HANDLE}</span>
                </>
              )}
            </button>
          </div>
        </div>

        <p className="mt-4 text-[10px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Follow us to never miss daily flash sales</span>
        </p>
      </div>
    </div>
  );
}

export default InstagramModal;

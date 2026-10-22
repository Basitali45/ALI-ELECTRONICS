import React, { useState } from 'react';
import { X, Instagram } from 'lucide-react';
import { AnnouncementBarConfig } from '../types';
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from '../lib/policy';

interface AnnouncementBarProps {
  config: AnnouncementBarConfig;
  onNavigate?: (sectionId: string) => void;
  onOpenInstagram?: () => void;
}

export function AnnouncementBar({ config, onNavigate, onOpenInstagram }: AnnouncementBarProps) {
  const [dismissed, setDismissed] = useState(false);
  if (!config.enabled || dismissed || !config.text) return null;

  const handleClick = () => {
    if (!config.link) return;
    if (config.link.startsWith('#') && onNavigate) onNavigate(config.link.substring(1));
    else window.location.href = config.link;
  };

  return (
    <div className="relative bg-slate-950 dark:bg-black text-white text-[11px] tracking-wide py-2 px-8 border-b border-amber-500/20">
      <div className="max-w-6xl mx-auto flex items-center justify-center gap-2 sm:gap-4 flex-wrap text-center">
        <p onClick={handleClick} className={`font-semibold ${config.link ? 'cursor-pointer hover:text-amber-400' : ''}`}>
          {config.text}
        </p>
        <span className="hidden sm:inline text-amber-500/50">•</span>
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1 text-pink-400 hover:text-pink-300 font-bold transition-colors cursor-pointer"
        >
          <Instagram className="w-3 h-3" />
          <span>Instagram: {INSTAGRAM_HANDLE}</span>
        </a>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/70 hover:text-white cursor-pointer"
        aria-label="Dismiss banner"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default AnnouncementBar;

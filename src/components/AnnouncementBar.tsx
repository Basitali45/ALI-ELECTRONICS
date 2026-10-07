import React, { useState } from 'react';
import { Megaphone, X, ArrowRight } from 'lucide-react';
import { AnnouncementBarConfig } from '../types';

interface AnnouncementBarProps {
  config: AnnouncementBarConfig;
  onNavigate?: (sectionId: string) => void;
}

export function AnnouncementBar({ config, onNavigate }: AnnouncementBarProps) {
  const [dismissed, setDismissed] = useState(false);

  if (!config.enabled || dismissed || !config.text) return null;

  const styleClasses = {
    gradient: 'bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-700 text-white',
    navy: 'bg-slate-900 text-blue-100 border-b border-slate-800',
    emerald: 'bg-emerald-700 text-white',
    amber: 'bg-amber-600 text-white',
  }[config.style || 'gradient'];

  const handleClick = () => {
    if (config.link) {
      if (config.link.startsWith('#') && onNavigate) {
        onNavigate(config.link.substring(1));
      } else {
        window.location.href = config.link;
      }
    }
  };

  return (
    <div className={`relative z-50 text-xs py-2 px-4 ${styleClasses} transition-all`}>
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center">
        <span className="flex items-center gap-1.5 font-medium cursor-pointer" onClick={handleClick}>
          <Megaphone className="w-3.5 h-3.5 shrink-0 animate-bounce" />
          <span>{config.text}</span>
          {config.link && (
            <ArrowRight className="w-3 h-3 ml-1 inline opacity-80" />
          )}
        </span>

        <button
          onClick={() => setDismissed(true)}
          className="absolute right-3 p-1 rounded-md text-white/80 hover:text-white hover:bg-black/10"
          aria-label="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

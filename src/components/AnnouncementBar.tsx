import React, { useState } from 'react';
import { X } from 'lucide-react';
import { AnnouncementBarConfig } from '../types';

interface AnnouncementBarProps {
  config: AnnouncementBarConfig;
  onNavigate?: (sectionId: string) => void;
}

export function AnnouncementBar({ config, onNavigate }: AnnouncementBarProps) {
  const [dismissed, setDismissed] = useState(false);
  if (!config.enabled || dismissed || !config.text) return null;

  const handleClick = () => {
    if (!config.link) return;
    if (config.link.startsWith('#') && onNavigate) onNavigate(config.link.substring(1));
    else window.location.href = config.link;
  };

  return (
    <div className="relative bg-black text-white text-[11px] tracking-wide py-2 px-9">
      <p onClick={handleClick} className={`text-center font-medium ${config.link ? 'cursor-pointer' : ''}`}>
        {config.text}
      </p>
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

import React, { useState } from 'react';
import { OFFICIAL_LOGO_IMAGE } from '../lib/policy';

interface ZaplixLogoProps {
  variant?: 'full' | 'icon' | 'compact' | 'emblem';
  theme?: 'light' | 'dark' | 'auto';
  className?: string;
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function ZaplixLogo({
  variant = 'full',
  theme = 'auto',
  className = '',
  showTagline = false,
  size = 'md',
}: ZaplixLogoProps) {
  const [imgError, setImgError] = useState(false);

  // Dimension classes based on size
  const iconSizeClasses = {
    sm: 'w-7 h-7 sm:w-8 sm:h-8',
    md: 'w-9 h-9 sm:w-10 sm:h-10',
    lg: 'w-12 h-12 sm:w-14 sm:h-14',
    xl: 'w-16 h-16 sm:w-20 sm:h-20',
  }[size];

  const fontSizeClasses = {
    sm: 'text-lg tracking-[0.14em]',
    md: 'text-xl sm:text-2xl tracking-[0.14em]',
    lg: 'text-2xl sm:text-3xl tracking-[0.14em]',
    xl: 'text-3xl sm:text-4xl tracking-[0.15em]',
  }[size];

  // SVG Fallback if image fails to load
  const ZaplixSvgFallback = ({ sizeClass = 'w-9 h-9' }: { sizeClass?: string }) => (
    <div className={`relative ${sizeClass} shrink-0 select-none rounded-full overflow-hidden bg-black border-2 border-amber-400/90 shadow-md flex items-center justify-center`}>
      <span className="font-black text-amber-400 text-sm italic">Z</span>
    </div>
  );

  // Official Circular Emblem with gold border and luxury depth
  const OfficialEmblem = ({ sizeClass = 'w-9 h-9' }: { sizeClass?: string }) => (
    <div className={`relative ${sizeClass} shrink-0 select-none rounded-full overflow-hidden shadow-[0_2px_10px_rgba(217,119,6,0.25)] border border-amber-400/80 ring-1 ring-amber-500/30 transition-transform duration-300 hover:scale-105 bg-black`}>
      {!imgError ? (
        <img
          src={OFFICIAL_LOGO_IMAGE}
          alt="ZAPLIX Official Emblem"
          className="w-full h-full object-cover object-center scale-[1.03]"
          onError={() => setImgError(true)}
        />
      ) : (
        <ZaplixSvgFallback sizeClass="w-full h-full" />
      )}
    </div>
  );

  if (variant === 'icon' || variant === 'emblem') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <OfficialEmblem sizeClass={variant === 'emblem' ? 'w-14 h-14 sm:w-16 sm:h-16' : iconSizeClasses} />
      </div>
    );
  }

  // Text color classes based on theme
  const textColorClass =
    theme === 'dark'
      ? 'text-white'
      : theme === 'light'
      ? 'text-slate-900'
      : 'text-slate-900 dark:text-white';

  const taglineColorClass =
    theme === 'dark'
      ? 'text-amber-400/90'
      : theme === 'light'
      ? 'text-amber-600'
      : 'text-amber-600 dark:text-amber-400/90';

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 ${className}`}>
      <OfficialEmblem sizeClass={variant === 'compact' ? 'w-8 h-8' : iconSizeClasses} />
      <div className="flex flex-col justify-center leading-none text-left">
        <span
          className={`font-black uppercase font-sans transition-colors ${fontSizeClasses} ${textColorClass}`}
        >
          ZAP<span className="text-amber-500 dark:text-amber-400">LIX</span>
        </span>
        {showTagline ? (
          <span
            className={`text-[8px] sm:text-[9px] font-bold tracking-[0.24em] uppercase transition-colors mt-0.5 ${taglineColorClass}`}
          >
            STYLE &bull; QUALITY &bull; YOU
          </span>
        ) : (
          <span className="text-[7.5px] sm:text-[8.5px] font-semibold tracking-[0.18em] uppercase text-slate-500 dark:text-slate-400 mt-0.5">
            Shop Smarter &bull; Live Better
          </span>
        )}
      </div>
    </div>
  );
}

export default ZaplixLogo;

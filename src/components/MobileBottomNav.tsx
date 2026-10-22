import React from 'react';
import { Home, Store, Heart, User } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface MobileBottomNavProps {
  active: 'home' | 'shop' | 'wishlist' | 'account';
  onHome: () => void;
  onShop: () => void;
  onWishlist: () => void;
  onAccount: () => void;
}

export function MobileBottomNav({ active, onHome, onShop, onWishlist, onAccount }: MobileBottomNavProps) {
  const { wishlist } = useCart();

  const Item = ({
    id,
    label,
    onClick,
    children,
  }: {
    id: MobileBottomNavProps['active'];
    label: string;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-1 py-1.5 transition-colors cursor-pointer ${
        active === id
          ? 'text-amber-500 dark:text-amber-400 font-bold'
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
      }`}
      aria-current={active === id ? 'page' : undefined}
    >
      <span className="relative">{children}</span>
      <span className="text-[11px] leading-tight">{label}</span>
    </button>
  );

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 px-3 pb-2 pt-1 bg-transparent pointer-events-none">
      <div className="pointer-events-auto flex items-center bg-white/95 dark:bg-[#0b1320]/95 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-[0_-4px_24px_rgba(0,0,0,0.12)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.5)] px-2 py-1 transition-colors">
        <Item id="home" label="Home" onClick={onHome}>
          <Home className={`w-[22px] h-[22px] ${active === 'home' ? 'fill-current' : ''}`} strokeWidth={1.8} />
        </Item>
        <Item id="shop" label="Shop" onClick={onShop}>
          <Store className="w-[22px] h-[22px]" strokeWidth={1.8} />
        </Item>
        <Item id="wishlist" label="Wishlist" onClick={onWishlist}>
          <Heart className={`w-[22px] h-[22px] ${active === 'wishlist' ? 'fill-current' : ''}`} strokeWidth={1.8} />
          {wishlist.length > 0 && (
            <span className="absolute -top-1 -right-2 min-w-[15px] h-[15px] px-1 rounded-full bg-amber-500 text-black text-[9px] font-black flex items-center justify-center">
              {wishlist.length}
            </span>
          )}
        </Item>
        <Item id="account" label="Account" onClick={onAccount}>
          <User className="w-[22px] h-[22px]" strokeWidth={1.8} />
        </Item>
      </div>
    </nav>
  );
}

export default MobileBottomNav;

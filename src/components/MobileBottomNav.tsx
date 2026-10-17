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

  const Item = ({ id, label, onClick, children }: { id: MobileBottomNavProps['active']; label: string; onClick: () => void; children: React.ReactNode }) => (
    <button onClick={onClick} className="flex-1 flex flex-col items-center gap-1 py-2 text-black cursor-pointer" aria-current={active === id ? 'page' : undefined}>
      <span className="relative">{children}</span>
      <span className={`text-[12px] ${active === id ? 'font-semibold' : 'font-normal'}`}>{label}</span>
    </button>
  );

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 px-2 pb-2 pt-1 bg-transparent pointer-events-none">
      <div className="pointer-events-auto flex items-center bg-white rounded-3xl shadow-[0_-4px_24px_rgba(0,0,0,0.10)] px-2 py-1">
        <Item id="home" label="Home" onClick={onHome}>
          <Home className={`w-[26px] h-[26px] ${active === 'home' ? 'fill-black' : ''}`} strokeWidth={1.6} />
        </Item>
        <Item id="shop" label="Shop" onClick={onShop}>
          <Store className="w-[26px] h-[26px]" strokeWidth={1.6} />
        </Item>
        <Item id="wishlist" label="Wishlist" onClick={onWishlist}>
          <Heart className={`w-[26px] h-[26px] ${active === 'wishlist' ? 'fill-black' : ''}`} strokeWidth={1.6} />
          {wishlist.length > 0 && (
            <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-black text-white text-[9px] font-bold flex items-center justify-center">
              {wishlist.length}
            </span>
          )}
        </Item>
        <Item id="account" label="Account" onClick={onAccount}>
          <User className="w-[26px] h-[26px]" strokeWidth={1.6} />
        </Item>
      </div>
    </nav>
  );
}

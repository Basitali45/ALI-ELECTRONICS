import React, { useState, useEffect } from 'react';
import { Search, Menu, X, User, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { StoreSettings, AnnouncementBarConfig, Category } from '../types';
import { AnnouncementBar } from './AnnouncementBar';

interface HeaderProps {
  settings: StoreSettings;
  categories: Category[];
  announcementBar?: AnnouncementBarConfig;
  onOpenSearch: () => void;
  onOpenAdmin: () => void;
  onNavigate: (sectionId: string) => void;
  onSelectCategory: (categoryName: string) => void;
}

export function Header({ settings, categories, announcementBar, onOpenSearch, onOpenAdmin, onNavigate, onSelectCategory }: HeaderProps) {
  const { totalItems, setIsCartOpen } = useCart();
  const { isAuthenticated } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navCats = categories
    .filter((c) => c.isVisible !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .slice(0, 6);

  const pickCategory = (name: string) => {
    setMenuOpen(false);
    onSelectCategory(name);
  };

  const Logo = (
    <button
      onClick={() => { setMenuOpen(false); onNavigate('home'); }}
      aria-label={`${settings.businessName || 'Zyvara'} home`}
      className="zv-logo text-[28px] sm:text-[26px] text-black cursor-pointer"
    >
      {settings.businessName || 'Zyvara'}
    </button>
  );

  return (
    <header className="sticky top-0 z-40">
      {announcementBar && announcementBar.enabled && (
        <AnnouncementBar config={announcementBar} onNavigate={onNavigate} />
      )}

      <div className={`bg-white transition-shadow ${isScrolled ? 'shadow-[0_2px_14px_rgba(0,0,0,0.06)]' : 'shadow-[0_1px_0_rgba(0,0,0,0.04)]'}`}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          {/* Desktop */}
          <div className="hidden md:flex items-center justify-between h-[60px]">
            {Logo}

            <nav className="flex items-center gap-9">
              {navCats.map((c) => (
                <button
                  key={c.id}
                  onClick={() => pickCategory(c.name)}
                  className="text-[13px] font-medium text-black hover:opacity-60 transition-opacity cursor-pointer"
                >
                  {c.name}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-5 text-black">
              <button onClick={onOpenSearch} aria-label="Search products" className="hover:opacity-60 transition-opacity cursor-pointer">
                <Search className="w-[18px] h-[18px]" strokeWidth={1.6} />
              </button>
              <button onClick={onOpenAdmin} aria-label={isAuthenticated ? 'Open admin panel' : 'Account / admin login'} className="hover:opacity-60 transition-opacity cursor-pointer">
                <User className="w-[18px] h-[18px]" strokeWidth={1.6} />
              </button>
              <button onClick={() => setIsCartOpen(true)} aria-label="Open shopping bag" className="relative hover:opacity-60 transition-opacity cursor-pointer">
                <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.6} />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[15px] h-[15px] px-1 rounded-full bg-black text-white text-[9px] font-bold flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile */}
          <div className="md:hidden grid grid-cols-[1fr_auto_1fr] items-center h-[64px]">
            <button onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu" className="justify-self-start text-black cursor-pointer">
              {menuOpen ? <X className="w-6 h-6" strokeWidth={1.6} /> : <Menu className="w-6 h-6" strokeWidth={1.6} />}
            </button>
            {Logo}
            <div className="justify-self-end flex items-center gap-4 text-black">
              <button onClick={onOpenSearch} aria-label="Search products" className="cursor-pointer">
                <Search className="w-[22px] h-[22px]" strokeWidth={1.6} />
              </button>
              <button onClick={() => setIsCartOpen(true)} aria-label="Open shopping bag" className="relative cursor-pointer">
                <ShoppingBag className="w-[22px] h-[22px]" strokeWidth={1.6} />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-black text-white text-[9px] font-bold flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-5 pb-5 pt-2">
            <button onClick={() => { setMenuOpen(false); onNavigate('home'); }} className="block w-full text-left py-3 text-sm font-medium text-black cursor-pointer">Home</button>
            {navCats.map((c) => (
              <button key={c.id} onClick={() => pickCategory(c.name)} className="block w-full text-left py-3 text-sm font-medium text-black border-t border-slate-100 cursor-pointer">
                {c.name}
              </button>
            ))}
            <button onClick={() => { setMenuOpen(false); onNavigate('products'); }} className="block w-full text-left py-3 text-sm font-medium text-black border-t border-slate-100 cursor-pointer">Shop All</button>
            <button onClick={() => { setMenuOpen(false); onNavigate('footer'); }} className="block w-full text-left py-3 text-sm font-medium text-black border-t border-slate-100 cursor-pointer">Customer Care</button>
          </div>
        )}
      </div>
    </header>
  );
}

import React, { useState, useEffect } from 'react';
import { Search, Menu, X, User, ShoppingBag, Sun, Moon, Instagram, QrCode, Headset } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { StoreSettings, AnnouncementBarConfig, Category } from '../types';
import { AnnouncementBar } from './AnnouncementBar';
import ZaplixLogo from './ZaplixLogo';
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from '../lib/policy';

interface HeaderProps {
  settings: StoreSettings;
  categories: Category[];
  announcementBar?: AnnouncementBarConfig;
  onOpenSearch: () => void;
  onOpenAdmin: () => void;
  onNavigate: (sectionId: string) => void;
  onSelectCategory: (categoryName: string) => void;
  onOpenInstagram?: () => void;
  onOpenSupport?: () => void;
  onOpenTrackOrder?: () => void;
}

export function Header({
  settings,
  categories,
  announcementBar,
  onOpenSearch,
  onOpenAdmin,
  onNavigate,
  onSelectCategory,
  onOpenInstagram,
  onOpenSupport,
  onOpenTrackOrder,
}: HeaderProps) {
  const { totalItems, setIsCartOpen } = useCart();
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
      onClick={() => {
        setMenuOpen(false);
        onNavigate('home');
      }}
      aria-label={`${settings.businessName || 'ZAPLIX'} home`}
      className="cursor-pointer flex items-center focus:outline-none"
    >
      <ZaplixLogo variant="full" className="py-0.5" />
    </button>
  );

  return (
    <header className="sticky top-0 z-40">
      {announcementBar && announcementBar.enabled && (
        <AnnouncementBar config={announcementBar} onNavigate={onNavigate} />
      )}

      <div
        className={`bg-white dark:bg-[#070e1b] border-b border-slate-200/80 dark:border-slate-800/90 transition-all duration-300 ${
          isScrolled
            ? 'shadow-[0_4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_25px_rgba(0,0,0,0.45)]'
            : ''
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-between h-[64px]">
            {Logo}

            <nav className="flex items-center gap-7 lg:gap-8">
              {navCats.map((c) => (
                <button
                  key={c.id}
                  onClick={() => pickCategory(c.name)}
                  className="text-[13px] font-medium text-slate-700 dark:text-slate-200 hover:text-amber-500 dark:hover:text-amber-400 transition-colors cursor-pointer"
                >
                  {c.name}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-3.5 lg:gap-4 text-slate-800 dark:text-slate-100">
              {/* Instagram Link & QR trigger */}
              <div className="flex items-center">
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow ZAPLIX on Instagram (${INSTAGRAM_HANDLE})`}
                  className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-500/10 transition-all cursor-pointer"
                  title={`Follow us on Instagram: ${INSTAGRAM_HANDLE}`}
                >
                  <Instagram className="w-[19px] h-[19px]" strokeWidth={1.8} />
                </a>
                {onOpenInstagram && (
                  <button
                    onClick={onOpenInstagram}
                    aria-label="View Instagram QR Code"
                    className="hidden lg:flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-pink-600 dark:text-pink-400 hover:bg-pink-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Scan Instagram QR Code"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>{INSTAGRAM_HANDLE}</span>
                  </button>
                )}
              </div>

              {/* Light / Dark Mode Toggle */}
              <button
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-all cursor-pointer"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              >
                {theme === 'dark' ? (
                  <Sun className="w-[19px] h-[19px] text-amber-400 animate-spin-slow" strokeWidth={1.8} />
                ) : (
                  <Moon className="w-[19px] h-[19px] text-slate-700" strokeWidth={1.8} />
                )}
              </button>

              <button
                onClick={onOpenSearch}
                aria-label="Search products"
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-all cursor-pointer"
              >
                <Search className="w-[19px] h-[19px]" strokeWidth={1.8} />
              </button>

              {onOpenSupport && (
                <button
                  onClick={onOpenSupport}
                  aria-label="Open ZAPLIX Customer Support"
                  title="ZAPLIX Customer Support (Voice & Chat)"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-slate-200/80 dark:border-slate-800/80 transition-all cursor-pointer"
                >
                  <Headset className="w-4 h-4 text-amber-500" strokeWidth={2} />
                  <span className="hidden lg:inline text-[11px]">Support</span>
                </button>
              )}

              <button
                onClick={onOpenAdmin}
                aria-label={isAuthenticated ? 'Open admin panel' : 'Account / admin login'}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-all cursor-pointer"
              >
                <User className="w-[19px] h-[19px]" strokeWidth={1.8} />
              </button>

              <button
                onClick={() => setIsCartOpen(true)}
                aria-label="Open shopping bag"
                className="relative p-2 rounded-xl text-slate-800 dark:text-slate-100 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-all cursor-pointer"
              >
                <ShoppingBag className="w-[19px] h-[19px]" strokeWidth={1.8} />
                {totalItems > 0 && (
                  <span className="absolute 0 top-0.5 right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-amber-500 text-black text-[9px] font-black flex items-center justify-center shadow-sm">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Bar */}
          <div className="md:hidden grid grid-cols-[auto_1fr_auto] items-center h-[62px] gap-2">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              className="p-2 text-slate-800 dark:text-slate-100 cursor-pointer"
            >
              {menuOpen ? <X className="w-6 h-6" strokeWidth={1.8} /> : <Menu className="w-6 h-6" strokeWidth={1.8} />}
            </button>

            <div className="flex justify-center">{Logo}</div>

            <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-100">
              {/* Theme toggle mobile */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle Theme"
                className="p-2 text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 cursor-pointer"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-amber-400" strokeWidth={1.8} />
                ) : (
                  <Moon className="w-5 h-5" strokeWidth={1.8} />
                )}
              </button>

              <button
                onClick={onOpenSearch}
                aria-label="Search products"
                className="p-2 text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                <Search className="w-5 h-5" strokeWidth={1.8} />
              </button>

              <button
                onClick={() => setIsCartOpen(true)}
                aria-label="Open shopping bag"
                className="relative p-2 text-slate-800 dark:text-slate-100 cursor-pointer"
              >
                <ShoppingBag className="w-5 h-5" strokeWidth={1.8} />
                {totalItems > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-amber-500 text-black text-[9px] font-black flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070e1b] px-5 pb-5 pt-3 space-y-1">
            {/* Quick Instagram Callout in Mobile Drawer */}
            <div className="pb-3 mb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold text-pink-600 dark:text-pink-400 py-1"
              >
                <Instagram className="w-4 h-4" />
                <span>Instagram: {INSTAGRAM_HANDLE}</span>
              </a>
              {onOpenInstagram && (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenInstagram();
                  }}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-pink-500/10 text-pink-600 dark:text-pink-400 rounded-lg cursor-pointer"
                >
                  View QR
                </button>
              )}
            </div>

            <button
              onClick={() => {
                setMenuOpen(false);
                onNavigate('home');
              }}
              className="block w-full text-left py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100 cursor-pointer"
            >
              Home
            </button>
            {navCats.map((c) => (
              <button
                key={c.id}
                onClick={() => pickCategory(c.name)}
                className="block w-full text-left py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800/60 cursor-pointer"
              >
                {c.name}
              </button>
            ))}
            <button
              onClick={() => {
                setMenuOpen(false);
                onNavigate('products');
              }}
              className="block w-full text-left py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800/60 cursor-pointer"
            >
              Shop All Products
            </button>
            {onOpenSupport && (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onOpenSupport();
                }}
                className="flex items-center justify-between w-full text-left py-2.5 text-sm font-bold text-amber-600 dark:text-amber-400 border-t border-slate-100 dark:border-slate-800/60 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Headset className="w-4 h-4" />
                  <span>ZAPLIX Customer Support</span>
                </span>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  24/7 Live
                </span>
              </button>
            )}
            {onOpenTrackOrder && (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onOpenTrackOrder();
                }}
                className="block w-full text-left py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800/60 cursor-pointer"
              >
                Track Order
              </button>
            )}
            <button
              onClick={() => {
                setMenuOpen(false);
                onNavigate('footer');
              }}
              className="block w-full text-left py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800/60 cursor-pointer"
            >
              Help &amp; Policies
            </button>

            {/* Dark mode switch in mobile drawer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                {theme === 'dark' ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-600" />}
                Theme: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </span>
              <button
                onClick={toggleTheme}
                className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                Switch to {theme === 'dark' ? 'Light' : 'Dark'}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;

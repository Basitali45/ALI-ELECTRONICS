import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  Phone, 
  ShieldCheck, 
  Lock, 
  SlidersHorizontal 
} from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { StoreSettings, AnnouncementBarConfig } from '../types';
import { AnnouncementBar } from './AnnouncementBar';

interface HeaderProps {
  settings: StoreSettings;
  announcementBar?: AnnouncementBarConfig;
  onOpenSearch: () => void;
  onOpenAdmin: () => void;
  onNavigate: (sectionId: string) => void;
}

export function Header({ settings, announcementBar, onOpenSearch, onOpenAdmin, onNavigate }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    onNavigate(sectionId);
  };

  const cleanWhatsApp = settings.whatsappNumber.replace(/^0/, '92').replace(/[^0-9]/g, '');

  return (
    <header className="fixed top-0 left-0 right-0 z-40 transition-all duration-300">
      {/* Top Announcement Bar if enabled */}
      {announcementBar && announcementBar.enabled && (
        <AnnouncementBar config={announcementBar} onNavigate={onNavigate} />
      )}

      {/* Main Nav Bar */}
      <div
        className={`transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 dark:bg-slate-950/95 backdrop-blur-md shadow-sm border-b border-slate-200/60 dark:border-slate-800/80 py-3'
            : 'bg-white/90 dark:bg-slate-950/90 backdrop-blur-xs border-b border-slate-100 dark:border-slate-900 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            
            {/* Aesthetic Brand Name without logo icon */}
            <button
              onClick={() => handleNavClick('home')}
              className="text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg p-1 cursor-pointer"
            >
              <div className="flex items-baseline gap-2.5">
                <span className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl tracking-tighter uppercase leading-none bg-gradient-to-r from-slate-950 via-blue-600 to-indigo-600 dark:from-white dark:via-blue-300 dark:to-cyan-300 bg-clip-text text-transparent transition-opacity group-hover:opacity-90">
                  {settings.businessName || 'ALI ELECTRONICS'}
                </span>
                <span className="hidden sm:inline-block text-[11px] font-extrabold uppercase tracking-widest text-blue-600 dark:text-cyan-400 font-mono">
                  Hassan Abdal
                </span>
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-7">
              <button
                onClick={() => handleNavClick('home')}
                className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
              >
                Home
              </button>
              <button
                onClick={() => handleNavClick('products')}
                className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
              >
                Products
              </button>
              <button
                onClick={() => handleNavClick('categories')}
                className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
              >
                Categories
              </button>
              <button
                onClick={() => handleNavClick('trending-offers')}
                className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400 hover:text-blue-700 dark:hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>Offers</span>
              </button>
              <button
                onClick={() => handleNavClick('about')}
                className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
              >
                About
              </button>
              <button
                onClick={() => handleNavClick('contact')}
                className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
              >
                Contact
              </button>
            </nav>

            {/* Right Action Icons */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Trigger */}
              <button
                onClick={onOpenSearch}
                aria-label="Search products"
                className="p-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Dark / Light Toggle */}
              <button
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                className="p-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
              </button>

              {/* WhatsApp Quick Link */}
              {settings.whatsappFloatingEnabled && (
                <a
                  href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent('Assalam-o-Alaikum Ali Electronics, I want to inquire about products.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#25D366] hover:bg-[#20ba59] text-white shadow-xs transition-all duration-200 cursor-pointer"
                >
                  <WhatsAppIcon className="w-4 h-4 fill-white text-white shrink-0" />
                  <span>WhatsApp</span>
                </a>
              )}

              {/* Admin Control Center Portal Button */}
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={onOpenAdmin}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Control Center</span>
                  </button>
                  <button
                    onClick={logout}
                    title="Logout Admin"
                    className="p-2 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenAdmin}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span className="hidden sm:inline">Control Center</span>
                </button>
              )}

              {/* Mobile Hamburger Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle navigation menu"
                className="md:hidden p-2.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Drawer */}
          {mobileMenuOpen && (
            <div className="md:hidden pt-4 pb-6 border-t border-slate-200 dark:border-slate-800 mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleNavClick('home')}
                  className="text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Home
                </button>
                <button
                  onClick={() => handleNavClick('products')}
                  className="text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Products
                </button>
                <button
                  onClick={() => handleNavClick('categories')}
                  className="text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Categories
                </button>
                <button
                  onClick={() => handleNavClick('trending-offers')}
                  className="text-left px-3 py-2 rounded-lg text-sm font-bold text-blue-600 dark:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  ⚡ Offers & Promotions
                </button>
                <button
                  onClick={() => handleNavClick('about')}
                  className="text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  About Ali Electronics
                </button>
                <button
                  onClick={() => handleNavClick('contact')}
                  className="text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Contact & Store Hours
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

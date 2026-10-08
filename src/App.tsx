/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { TrendingOffersBanner } from './components/TrendingOffersBanner';
import { CategoriesSection } from './components/CategoriesSection';
import { FeaturedSection } from './components/FeaturedSection';
import { NewArrivalsSection } from './components/NewArrivalsSection';
import { ProductCatalogue } from './components/ProductCatalogue';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { PromoPopup } from './components/PromoPopup';
import { ProductDetailModal } from './components/ProductDetailModal';
import { SearchModal } from './components/SearchModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AdminLoginModal } from './admin/AdminLoginModal';
import { AdminDashboard } from './admin/AdminDashboard';
import { Product, Category, Offer, HomepageConfig, StoreSettings } from './types';
import { api } from './services/api';

const defaultHomepage: HomepageConfig = {
  heroHeading: 'Your Trusted Electronics Store in Hassan Abdal',
  heroSubtitle: 'Explore quality electronics, competitive prices and reliable service at Ali Electronic.',
  heroBackgroundImage: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1600&auto=format&fit=crop&q=80',
  heroOverlayOpacity: 75,
  heroCtaText: 'Browse Products',
  heroCtaDestination: '#products',
  heroSecondaryCtaText: 'Contact on WhatsApp',
  heroSecondaryCtaDestination: '#contact',
  heroEnabled: true,
  sections: [
    { id: 'announcement', name: 'Announcement Bar', enabled: true, order: 1 },
    { id: 'hero', name: 'Hero Banner', enabled: true, order: 2 },
    { id: 'offers', name: 'Special Offers & Promotions', enabled: true, order: 3 },
    { id: 'categories', name: 'Categories Department', enabled: true, order: 4 },
    { id: 'featured', name: 'Featured Products', enabled: true, order: 5 },
    { id: 'newArrivals', name: 'New Arrivals', enabled: true, order: 6 },
    { id: 'about', name: 'About Ali Electronic', enabled: true, order: 7 },
    { id: 'whyUs', name: 'Why Choose Us', enabled: true, order: 8 },
    { id: 'contact', name: 'Contact & Store Hours', enabled: true, order: 9 },
    { id: 'map', name: 'Google Map Location', enabled: true, order: 10 },
  ],
  announcementBar: {
    enabled: true,
    text: '🔥 SPECIAL OFFER — Up to 30% OFF on Selected Electronics at Hassan Abdal Store!',
    link: '#products',
    style: 'gradient',
  },
  promoPopup: {
    enabled: false,
    title: 'MEGA ELECTRONICS SALE',
    description: 'Get amazing discounts and authentic accessories at Ali Electronic today.',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
    buttonText: 'Shop Special Offers',
    buttonLink: '#products',
    delaySeconds: 4,
    showOnce: true,
  }
};

const defaultSettings: StoreSettings = {
  businessName: 'Ali Electronic',
  tagline: 'Your Trusted Electronics Store in Hassan Abdal',
  supportingText: 'Explore quality electronics, competitive prices and reliable service at Ali Electronic.',
  location: 'Main Bus Stop, Islam Shaheed Road, Opposite New Sethi Flour Mills, Hassan Abdal, Pakistan',
  googleMapsUrl: 'https://maps.google.com/?q=Main+Bus+Stop+Islam+Shaheed+Road+Hassan+Abdal+Pakistan',
  phone1: '03115321647',
  phone1Name: 'Arbaz Ahmed',
  phone2: '03133332141',
  phone2Name: 'Faraz Ahmed',
  whatsappNumber: '03115321647',
  whatsappFloatingEnabled: true,
  whatsappProductButtonEnabled: true,
  whatsappTemplate: 'Assalam-o-Alaikum Ali Electronic, I am interested in {product_name}. Current price is {price}. Please confirm availability.',
  businessHours: 'Opening Hours — Contact us for current timings',
  aboutText: 'Ali Electronic is a local electronics business serving customers in Hassan Abdal with quality electronics products, competitive pricing and customer-focused service.',
  logoUrl: '',
  footerText: '© 2026 Ali Electronic. All Rights Reserved. Hassan Abdal, Pakistan.',
  themePreset: 'ocean-blue',
};

function MainContent() {
  const { isAuthenticated } = useAuth();
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [homepage, setHomepage] = useState<HomepageConfig>(defaultHomepage);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);

  // Catalogue filter synchronization
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [catalogueSearchQuery, setCatalogueSearchQuery] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [settingsData, homeData, prodsData, catsData, offersData] = await Promise.all([
        api.getSettings().catch(() => defaultSettings),
        api.getHomepage().catch(() => defaultHomepage),
        api.getProducts().catch(() => []),
        api.getCategories().catch(() => []),
        api.getOffers().catch(() => []),
      ]);

      setSettings(settingsData);
      setHomepage(homeData);
      setProducts(prodsData);
      setCategories(catsData);
      setOffers(offersData);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Smooth scroll handler
  const handleNavigate = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      const headerOffset = 90;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectCategory = (categoryName: string) => {
    setSelectedCategoryFilter(categoryName);
    handleNavigate('products');
  };

  const handleOpenAdmin = () => {
    if (isAuthenticated) {
      setIsAdminDashboardOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleDirectOrder = (prod: Product) => {
    const cleanPhone = (settings.whatsappNumber || '03115321647').replace(/^0/, '92').replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
      `Assalam-o-Alaikum Ali Electronic, I want to order: ${prod.name} (Price: Rs. ${prod.price.toLocaleString()}). Please confirm availability.`
    )}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  // Helper to check if a section is enabled in homepage.sections
  const isSectionEnabled = (id: string) => {
    const sec = homepage.sections?.find((s) => s.id === id);
    return sec ? sec.enabled : true;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Sticky Header with logo and announcement bar */}
      <Header
        settings={settings}
        announcementBar={isSectionEnabled('announcement') ? homepage.announcementBar : undefined}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAdmin={handleOpenAdmin}
        onNavigate={handleNavigate}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section */}
        {isSectionEnabled('hero') && (
          <Hero
            settings={settings}
            homepage={homepage}
            trendingProducts={products}
            onBrowseClick={() => handleNavigate('products')}
            onOffersClick={() => handleNavigate('trending-offers')}
            onContactClick={() => handleNavigate('contact')}
            onViewProduct={(prod) => setSelectedProduct(prod)}
          />
        )}

        {/* Fullpage Landing: Aesthetic Trending Products & Mega Offer Banner */}
        {isSectionEnabled('offers') && (
          <TrendingOffersBanner
            offers={offers}
            products={products}
            settings={settings}
            onNavigate={handleNavigate}
            onViewProduct={(prod) => setSelectedProduct(prod)}
            onDirectOrder={handleDirectOrder}
          />
        )}

        {/* Categories Section */}
        {isSectionEnabled('categories') && (
          <CategoriesSection
            categories={categories}
            products={products}
            onSelectCategory={handleSelectCategory}
          />
        )}

        {/* Featured Products */}
        {isSectionEnabled('featured') && (
          <FeaturedSection
            products={products}
            whatsappNumber={settings.whatsappNumber}
            whatsappButtonEnabled={settings.whatsappProductButtonEnabled !== false}
            onViewDetails={(prod) => setSelectedProduct(prod)}
            onDirectOrder={handleDirectOrder}
            onViewAllClick={() => handleNavigate('products')}
          />
        )}

        {/* New Arrivals */}
        {isSectionEnabled('newArrivals') && (
          <NewArrivalsSection
            products={products}
            whatsappNumber={settings.whatsappNumber}
            onViewDetails={(prod) => setSelectedProduct(prod)}
            onDirectOrder={handleDirectOrder}
            onViewAllClick={() => handleNavigate('products')}
          />
        )}

        {/* Complete Product Catalogue */}
        <ProductCatalogue
          products={products}
          categories={categories}
          settings={settings}
          loading={loading}
          onViewDetails={(prod) => setSelectedProduct(prod)}
          onDirectOrder={handleDirectOrder}
          onOpenAdminAdd={() => setIsAdminDashboardOpen(true)}
          initialSearchQuery={catalogueSearchQuery}
          selectedCategoryProp={selectedCategoryFilter}
        />

        {/* About Section */}
        {isSectionEnabled('about') && (
          <AboutSection settings={settings} />
        )}

        {/* Contact & Map Section */}
        {isSectionEnabled('contact') && (
          <ContactSection settings={settings} />
        )}
      </main>

      {/* Footer */}
      <Footer
        settings={settings}
        categories={categories}
        onNavigate={handleNavigate}
        onSelectCategory={handleSelectCategory}
      />

      {/* Floating WhatsApp Action Button */}
      {settings.whatsappFloatingEnabled && (
        <FloatingWhatsApp settings={settings} />
      )}

      {/* Promotional Popup */}
      <PromoPopup
        config={homepage.promoPopup}
        whatsappNumber={settings.whatsappNumber}
        onNavigate={handleNavigate}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        settings={settings}
        onClose={() => setSelectedProduct(null)}
      />

      {/* Quick Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
        onSelectProduct={(prod) => {
          setSelectedProduct(prod);
          setIsSearchOpen(false);
        }}
        onSelectCategoryFilter={(cat) => {
          handleSelectCategory(cat);
          setIsSearchOpen(false);
        }}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={() => {
          setIsAdminDashboardOpen(true);
        }}
      />

      {/* Full SaaS Admin Control Center */}
      {isAdminDashboardOpen && (
        <AdminDashboard
          initialSettings={settings}
          onClose={() => setIsAdminDashboardOpen(false)}
          onRefreshData={loadData}
        />
      )}

      {/* Cart & Checkout */}
      <CartDrawer settings={settings} />
      <CheckoutModal settings={settings} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <MainContent />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

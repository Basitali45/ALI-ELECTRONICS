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
import { MobileChips } from './components/MobileChips';
import { MobileBottomNav } from './components/MobileBottomNav';
import { TrendingOffersBanner } from './components/TrendingOffersBanner';
import { CategoriesSection } from './components/CategoriesSection';
import { FeaturedSection } from './components/FeaturedSection';
import { NewArrivalsSection } from './components/NewArrivalsSection';
import { ProductCatalogue } from './components/ProductCatalogue';
import { TrustStrip } from './components/TrustStrip';
import { Footer } from './components/Footer';
import { PolicyModal, PolicyKey } from './components/PolicyModal';
import { WishlistDrawer } from './components/WishlistDrawer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { PromoPopup } from './components/PromoPopup';
import { ProductDetailModal } from './components/ProductDetailModal';
import { SearchModal } from './components/SearchModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { InstagramModal } from './components/InstagramModal';
import { AdminLoginModal } from './admin/AdminLoginModal';
import { AdminDashboard } from './admin/AdminDashboard';
import { Product, Category, Offer, HomepageConfig, StoreSettings } from './types';
import { api } from './services/api';
import { initialSettings, initialHomepage } from './services/seedData';
import { toWhatsAppNumber, getWhatsAppUrl } from './lib/policy';

const defaultHomepage: HomepageConfig = initialHomepage;
const defaultSettings: StoreSettings = initialSettings;

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
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isInstagramOpen, setIsInstagramOpen] = useState(false);
  const [policy, setPolicy] = useState<PolicyKey | null>(null);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'shop'>('home');

  // Catalogue filter synchronization
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [catalogueSearchQuery] = useState('');

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
    const el = sectionId === 'home' ? null : document.getElementById(sectionId);
    if (el) {
      const headerOffset = 80;
      const offsetPosition = el.getBoundingClientRect().top + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (sectionId === 'products') setActiveTab('shop');
    if (sectionId === 'home') setActiveTab('home');
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
    const text = `Hello Zaplix Team! I would like to order: ${prod.name} (Price: Rs. ${prod.price.toLocaleString()}). Delivery: Free Home Delivery (Rs. 0). Payment: Cash on Delivery. Please confirm availability.`;
    const waUrl = getWhatsAppUrl(text);
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  // A section is shown unless the admin has explicitly switched it off
  const isSectionEnabled = (id: string) => {
    const sec = homepage.sections?.find((s) => s.id === id);
    return sec ? sec.enabled : true;
  };

  const openProduct = (prod: Product) => setSelectedProduct(prod);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-[#070b14] text-slate-900 dark:text-slate-100 selection:bg-amber-500 selection:text-black transition-colors duration-200">
      <Header
        settings={settings}
        categories={categories}
        announcementBar={isSectionEnabled('announcement') ? homepage.announcementBar : undefined}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAdmin={handleOpenAdmin}
        onNavigate={handleNavigate}
        onSelectCategory={handleSelectCategory}
        onOpenInstagram={() => setIsInstagramOpen(true)}
      />

      <main className="flex-1 flex flex-col">
        {isSectionEnabled('hero') && (
          <div className="order-1 hidden md:block">
            <Hero
              settings={settings}
              homepage={homepage}
              trendingProducts={products}
              onBrowseClick={() => handleNavigate('products')}
              onViewProduct={openProduct}
            />
          </div>
        )}

        <div className="order-1 md:hidden">
          <MobileChips
            categories={categories}
            selected={selectedCategoryFilter}
            onSelect={(name) => (name === 'all' ? setSelectedCategoryFilter('all') : handleSelectCategory(name))}
          />
        </div>

        {isSectionEnabled('offers') && (
          <div className="order-2">
            <TrendingOffersBanner offers={offers} onNavigate={handleNavigate} />
          </div>
        )}

        {isSectionEnabled('newArrivals') && (
          <div className="order-3 md:order-6">
            <NewArrivalsSection
              products={products}
              whatsappNumber={settings.whatsappNumber}
              onViewDetails={openProduct}
              onDirectOrder={handleDirectOrder}
              onViewAllClick={() => handleNavigate('products')}
            />
          </div>
        )}

        {isSectionEnabled('categories') && (
          <div className="order-4 md:order-3">
            <CategoriesSection categories={categories} products={products} onSelectCategory={handleSelectCategory} />
          </div>
        )}

        {isSectionEnabled('featured') && (
          <div className="order-5 md:order-4">
            <FeaturedSection
              products={products}
              whatsappNumber={settings.whatsappNumber}
              whatsappButtonEnabled={settings.whatsappProductButtonEnabled !== false}
              onViewDetails={openProduct}
              onDirectOrder={handleDirectOrder}
              onViewAllClick={() => handleNavigate('products')}
            />
          </div>
        )}

        <div className="order-6 md:order-5">
          <TrustStrip />
        </div>

        <div className="order-7">
          <ProductCatalogue
            products={products}
            categories={categories}
            settings={settings}
            loading={loading}
            onViewDetails={openProduct}
            onDirectOrder={handleDirectOrder}
            onOpenAdminAdd={() => setIsAdminDashboardOpen(true)}
            initialSearchQuery={catalogueSearchQuery}
            selectedCategoryProp={selectedCategoryFilter}
          />
        </div>
      </main>

      <Footer
        settings={settings}
        onOpenPolicy={setPolicy}
        onOpenInstagram={() => setIsInstagramOpen(true)}
      />

      {settings.whatsappFloatingEnabled && <FloatingWhatsApp settings={settings} />}

      <MobileBottomNav
        active={isWishlistOpen ? 'wishlist' : activeTab}
        onHome={() => { setSelectedCategoryFilter('all'); handleNavigate('home'); }}
        onShop={() => handleNavigate('products')}
        onWishlist={() => setIsWishlistOpen(true)}
        onAccount={handleOpenAdmin}
      />

      <PromoPopup config={homepage.promoPopup} whatsappNumber={settings.whatsappNumber} onNavigate={handleNavigate} />

      <ProductDetailModal product={selectedProduct} settings={settings} onClose={() => setSelectedProduct(null)} />

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

      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        products={products}
        onViewDetails={openProduct}
      />

      <InstagramModal
        isOpen={isInstagramOpen}
        onClose={() => setIsInstagramOpen(false)}
      />

      <PolicyModal policy={policy} settings={settings} onClose={() => setPolicy(null)} />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={() => {
          setIsAdminDashboardOpen(true);
        }}
      />

      {isAdminDashboardOpen && (
        <AdminDashboard
          initialSettings={settings}
          onClose={() => setIsAdminDashboardOpen(false)}
          onRefreshData={loadData}
        />
      )}

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

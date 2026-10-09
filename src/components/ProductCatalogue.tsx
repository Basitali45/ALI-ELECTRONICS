import React, { useState, useMemo } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  ArrowUpDown, 
  Sparkles, 
  RotateCcw, 
  Plus, 
  PackageOpen 
} from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { Product, Category, StoreSettings } from '../types';
import { ProductCard } from './ProductCard';
import { useAuth } from '../context/AuthContext';

interface ProductCatalogueProps {
  products: Product[];
  categories: Category[];
  settings: StoreSettings;
  loading: boolean;
  onViewDetails: (product: Product) => void;
  onDirectOrder: (product: Product) => void;
  onOpenAdminAdd?: () => void;
  initialSearchQuery?: string;
  selectedCategoryProp?: string;
}

export function ProductCatalogue({
  products,
  categories,
  settings,
  loading,
  onViewDetails,
  onDirectOrder,
  onOpenAdminAdd,
  initialSearchQuery = '',
  selectedCategoryProp = 'all'
}: ProductCatalogueProps) {
  const { isAuthenticated } = useAuth();
  const [search, setSearch] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState(selectedCategoryProp);
  const [selectedStock, setSelectedStock] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Sync if prop changes
  React.useEffect(() => {
    if (initialSearchQuery) setSearch(initialSearchQuery);
  }, [initialSearchQuery]);

  React.useEffect(() => {
    if (selectedCategoryProp) setSelectedCategory(selectedCategoryProp);
  }, [selectedCategoryProp]);

  // Compute maximum price among products
  const computedHighestPrice = useMemo(() => {
    if (!products.length) return 10000;
    const max = Math.max(...products.map(p => p.price));
    return Math.ceil(max / 1000) * 1000;
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Category filter
      if (selectedCategory !== 'all' && p.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      // Availability filter
      if (selectedStock !== 'all' && p.availability.toLowerCase() !== selectedStock.toLowerCase()) {
        return false;
      }
      // Price filter
      if (p.price > maxPrice) {
        return false;
      }
      // Search query
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesCat = p.category.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        const matchesSpecs = p.specifications?.some(s => s.toLowerCase().includes(q));
        if (!matchesName && !matchesCat && !matchesDesc && !matchesSpecs) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'popular') return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      // Newest
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [products, selectedCategory, selectedStock, maxPrice, search, sortBy]);

  const hasActiveFilters = selectedCategory !== 'all' || selectedStock !== 'all' || search.trim() !== '' || maxPrice < computedHighestPrice;

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedStock('all');
    setMaxPrice(computedHighestPrice || 10000);
    setSortBy('newest');
  };

  const cleanWhatsApp = (settings?.whatsappNumber || '03115321647').replace(/^0/, '92').replace(/[^0-9]/g, '');

  return (
    <section id="products" className="py-16 md:py-24 bg-slate-50/50 dark:bg-slate-950/60 border-t border-slate-200/60 dark:border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold tracking-wider text-blue-600 dark:text-blue-400 uppercase">
              Catalogue & Inventory
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1">
              Explore Electronics
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
              Authentic mobile accessories, chargers, audio devices, lighting, and computing gear in Hassan Abdal.
            </p>
          </div>

          {/* Search bar in header */}
          <div className="w-full md:w-80 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search products, chargers, brands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Interactive Filter Tabs (Zero-pill compliant button segments) */}
        <div className="space-y-4">
          
          {/* Category Tabs Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              All Products ({products.length})
            </button>
            {categories.map((cat) => {
              const count = products.filter(p => p.category.toLowerCase() === cat.name.toLowerCase()).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory.toLowerCase() === cat.name.toLowerCase()
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat.name} {count > 0 ? `(${count})` : ''}
                </button>
              );
            })}
          </div>

          {/* Sub Controls: Sort, Stock Filter, Price Slider, Reset */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Stock Selector */}
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                <span className="font-medium">Stock:</span>
                <select
                  value={selectedStock}
                  onChange={(e) => setSelectedStock(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All Availability</option>
                  <option value="in stock">In Stock Only</option>
                  <option value="limited stock">Limited Stock</option>
                  <option value="out of stock">Out of Stock</option>
                </select>
              </div>

              {/* Price Max Filter */}
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <span className="font-medium">Up to:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  Rs. {maxPrice.toLocaleString()}
                </span>
                <input
                  type="range"
                  min="500"
                  max={computedHighestPrice || 10000}
                  step="250"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-24 sm:w-32 accent-blue-600"
                />
              </div>

              {/* Reset button */}
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>

            {/* Sorting */}
            <div className="flex items-center gap-2 text-xs ml-auto">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="popular">Featured First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>

          </div>

        </div>

        {/* Product Count Indicator */}
        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Showing <span className="font-bold text-slate-900 dark:text-white">{filteredProducts.length}</span> of {products.length} products
          {selectedCategory !== 'all' && <span> in "{selectedCategory}"</span>}
          {search && <span> matching "{search}"</span>}
        </div>

        {/* Product Grid or Skeletons or Empty State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-xl" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3 pt-2" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <div
                key={`${product.id}-${selectedCategory}-${sortBy}`}
                className="animate-product-drop"
                style={{ animationDelay: `${(index % 12) * 55}ms` }}
              >
                <ProductCard
                  product={product}
                  whatsappNumber={settings.whatsappNumber}
                  whatsappButtonEnabled={settings.whatsappProductButtonEnabled !== false}
                  onViewDetails={onViewDetails}
                  onDirectOrder={onDirectOrder}
                />
              </div>
            ))}
          </div>
        ) : (
          /* Empty State as requested in instructions: "Products Coming Soon" / friendly fallback */
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-xl mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
              <PackageOpen className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="font-heading text-xl font-bold text-slate-900 dark:text-white">
                {products.length === 0 ? 'Products Coming Soon' : 'No Products Found'}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {products.length === 0
                  ? 'We are updating our product catalogue. Contact Ali Electronic on WhatsApp for current products and prices.'
                  : 'We could not find products matching your current filters or search term.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 cursor-pointer"
                >
                  Clear Filters
                </button>
              )}

              <a
                href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(`Assalam-o-Alaikum Ali Electronic, I was looking for ${search || 'electronics products'} at your Hassan Abdal shop. Could you please share what items you currently have available?`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center gap-1.5 shadow-sm shadow-[#25D366]/20 transition-all cursor-pointer"
              >
                <WhatsAppIcon className="w-4 h-4 fill-white text-white" />
                <span>Ask on WhatsApp</span>
              </a>

              {isAuthenticated && onOpenAdminAdd && (
                <button
                  onClick={onOpenAdminAdd}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Product</span>
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}

import React, { useState, useMemo } from 'react';
import { Search, X, RotateCcw, Plus, PackageOpen } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { Product, Category, StoreSettings } from '../types';
import { ProductCard } from './ProductCard';
import { useAuth } from '../context/AuthContext';
import { toWhatsAppNumber } from '../lib/policy';

interface ProductCatalogueProps {
  products: Product[];
  categories: Category[];
  settings: StoreSettings;
  loading: boolean;
  onViewDetails: (product: Product) => void;
  onDirectOrder?: (product: Product) => void;
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
  selectedCategoryProp = 'all',
}: ProductCatalogueProps) {
  const { isAuthenticated } = useAuth();
  const [search, setSearch] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState(selectedCategoryProp);
  const [sortBy, setSortBy] = useState('newest');

  React.useEffect(() => {
    if (initialSearchQuery) setSearch(initialSearchQuery);
  }, [initialSearchQuery]);

  React.useEffect(() => {
    if (selectedCategoryProp) setSelectedCategory(selectedCategoryProp);
  }, [selectedCategoryProp]);

  const filtered = useMemo(() => {
    return products
      .filter((p) => {
        if (p.active === false) return false;
        if (selectedCategory !== 'all' && p.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
        if (search.trim()) {
          const q = search.trim().toLowerCase();
          const hit =
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.specifications?.some((s) => s.toLowerCase().includes(q));
          if (!hit) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'popular') return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [products, selectedCategory, search, sortBy]);

  const hasFilters = selectedCategory !== 'all' || search.trim() !== '';
  const reset = () => {
    setSearch('');
    setSelectedCategory('all');
    setSortBy('newest');
  };

  const chip = (active: boolean) =>
    `px-4 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap border transition-all cursor-pointer ${
      active
        ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-black border-slate-900 dark:border-amber-500 shadow-sm'
        : 'bg-white dark:bg-[#0d1524] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700'
    }`;

  return (
    <section id="products" className="py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h2 className="text-[24px] md:text-[20px] font-bold text-slate-900 dark:text-white">
            Shop All Products
          </h2>
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-full text-[13px] bg-white dark:bg-[#0d1524] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 -mx-5 px-5 sm:mx-0 sm:px-0">
            <button onClick={() => setSelectedCategory('all')} className={chip(selectedCategory === 'all')}>
              All
            </button>
            {categories
              .filter((c) => c.isVisible !== false)
              .map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={chip(selectedCategory.toLowerCase() === cat.name.toLowerCase())}
                >
                  {cat.name}
                </button>
              ))}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort products"
            className="shrink-0 self-start px-3.5 py-2 rounded-full bg-white dark:bg-[#0d1524] border border-slate-200 dark:border-slate-800 text-[12px] font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
          >
            <option value="newest">Newest</option>
            <option value="popular">Featured</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white dark:bg-[#0d1524] rounded-2xl p-3 space-y-3 border border-slate-100 dark:border-slate-800">
                <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-xl" />
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-3/4 mx-auto" />
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/3 mx-auto" />
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {filtered.map((p) => (
              <ProductCard
                key={`${p.id}-${selectedCategory}`}
                product={p}
                whatsappNumber={settings.whatsappNumber}
                whatsappButtonEnabled={settings.whatsappProductButtonEnabled !== false}
                onViewDetails={onViewDetails}
                onDirectOrder={onDirectOrder}
              />
            ))}
          </div>
        ) : (
          <div className="p-10 text-center bg-white dark:bg-[#0d1524] border border-slate-200/80 dark:border-slate-800 rounded-2xl max-w-md mx-auto space-y-4 shadow-[0_4px_18px_rgba(0,0,0,0.05)]">
            <PackageOpen className="w-8 h-8 mx-auto text-slate-800 dark:text-slate-200" strokeWidth={1.4} />
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                {products.length === 0 ? 'Products Coming Soon' : 'No Products Found'}
              </h3>
              <p className="text-[13px] text-slate-500 dark:text-slate-400">
                {products.length === 0
                  ? 'We are updating our collection. Message ZAPLIX on WhatsApp for current products and prices.'
                  : 'We could not find products matching your search or filter.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {hasFilters && (
                <button
                  onClick={reset}
                  className="px-4 py-2 rounded-xl text-[12px] font-semibold border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Clear Filters
                </button>
              )}
              <a
                href={`https://wa.me/${toWhatsAppNumber(settings?.whatsappNumber)}?text=${encodeURIComponent(
                  `Hello Zaplix Team, I was looking for ${search || 'a product'}. Could you please share what is currently available?`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl text-[12px] font-semibold bg-[#25D366] text-white flex items-center gap-1.5 shadow-sm"
              >
                <WhatsAppIcon className="w-4 h-4 fill-white text-white" /> Ask on WhatsApp
              </a>
              {isAuthenticated && onOpenAdminAdd && (
                <button
                  onClick={onOpenAdminAdd}
                  className="px-4 py-2 rounded-xl text-[12px] font-semibold bg-amber-500 text-black flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Product
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default ProductCatalogue;

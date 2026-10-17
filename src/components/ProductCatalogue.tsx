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
    `px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap border transition-colors cursor-pointer ${
      active ? 'bg-black text-white border-black' : 'bg-white text-black border-slate-300 hover:border-black'
    }`;

  return (
    <section id="products" className="py-8 md:py-10">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h2 className="text-[22px] md:text-[17px] font-bold md:font-semibold text-black">Shop All</h2>
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search products"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-full text-[13px] bg-white border border-slate-200 text-black placeholder:text-slate-400 focus:outline-none focus:border-black"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black cursor-pointer" aria-label="Clear search">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 -mx-5 px-5 sm:mx-0 sm:px-0">
            <button onClick={() => setSelectedCategory('all')} className={chip(selectedCategory === 'all')}>All</button>
            {categories.filter((c) => c.isVisible !== false).map((cat) => (
              <button key={cat.id} onClick={() => setSelectedCategory(cat.name)} className={chip(selectedCategory.toLowerCase() === cat.name.toLowerCase())}>
                {cat.name}
              </button>
            ))}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort products"
            className="shrink-0 self-start px-3 py-2 rounded-full bg-white border border-slate-200 text-[12px] font-medium text-black focus:outline-none focus:border-black cursor-pointer"
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
              <div key={i} className="animate-pulse bg-white rounded-2xl p-3 space-y-3">
                <div className="aspect-square bg-slate-100 rounded-xl" />
                <div className="h-3 bg-slate-100 rounded w-3/4 mx-auto" />
                <div className="h-4 bg-slate-100 rounded w-1/3 mx-auto" />
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
          <div className="p-10 text-center bg-white rounded-2xl max-w-md mx-auto space-y-4 shadow-[0_4px_18px_rgba(0,0,0,0.05)]">
            <PackageOpen className="w-8 h-8 mx-auto text-black" strokeWidth={1.4} />
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-black">{products.length === 0 ? 'Products Coming Soon' : 'No Products Found'}</h3>
              <p className="text-[13px] text-slate-500">
                {products.length === 0
                  ? 'We are updating our collection. Message Zyvara on WhatsApp for current products and prices.'
                  : 'We could not find products matching your search or filter.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {hasFilters && (
                <button onClick={reset} className="px-4 py-2 rounded-md text-[12px] font-semibold border border-black text-black flex items-center gap-1.5 cursor-pointer">
                  <RotateCcw className="w-3 h-3" /> Clear Filters
                </button>
              )}
              <a
                href={`https://wa.me/${toWhatsAppNumber(settings?.whatsappNumber)}?text=${encodeURIComponent(`Hello Zyvara, I was looking for ${search || 'a product'}. Could you please share what is currently available?`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-md text-[12px] font-semibold bg-[#25D366] text-white flex items-center gap-1.5"
              >
                <WhatsAppIcon className="w-4 h-4 fill-white text-white" /> Ask on WhatsApp
              </a>
              {isAuthenticated && onOpenAdminAdd && (
                <button onClick={onOpenAdminAdd} className="px-4 py-2 rounded-md text-[12px] font-semibold bg-black text-white flex items-center gap-1.5 cursor-pointer">
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

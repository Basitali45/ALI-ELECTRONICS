import React from 'react';
import { 
  Package, 
  Sparkles, 
  Tag, 
  AlertTriangle, 
  FolderTree, 
  MessageSquare, 
  Plus, 
  Layers, 
  Settings, 
  Image as ImageIcon,
  KeyRound,
  ShieldCheck
} from 'lucide-react';
import { Product, AdminStats } from '../../types';

interface DashboardOverviewProps {
  stats: AdminStats | null;
  products: Product[];
  onNavigateTab: (tab: any) => void;
  onOpenAddProduct: () => void;
  onOpenAddCategory: () => void;
  onOpenCreateOffer: () => void;
}

export function DashboardOverview({
  stats,
  products,
  onNavigateTab,
  onOpenAddProduct,
  onOpenAddCategory,
  onOpenCreateOffer,
}: DashboardOverviewProps) {
  const totalProds = stats?.totalProducts ?? products.length;
  const inStock = stats?.inStock ?? products.filter(p => p.availability === 'In Stock').length;
  const outOfStock = stats?.outOfStock ?? products.filter(p => p.availability === 'Out of Stock').length;
  const featured = stats?.featuredProducts ?? products.filter(p => p.featured).length;
  const newArrivals = stats?.newArrivals ?? products.filter(p => p.isNewArrival).length;
  const activeOffers = stats?.activeOffers ?? 1;
  const totalCategories = stats?.totalCategories ?? 12;

  return (
    <div className="space-y-6">
      {/* Quick Action Top Bar */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-blue-200 font-bold">
              Zyvara Control Center
            </div>
            <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-white mt-1">
              Store Quick Actions
            </h3>
            <p className="text-xs text-blue-100 max-w-lg mt-1">
              Manage your inventory, launch promotional discounts, and customize your customer-facing store in seconds.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2">
          <button
            onClick={onOpenAddProduct}
            className="p-3 rounded-2xl bg-white text-blue-900 hover:bg-blue-50 font-bold text-xs flex flex-col items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all"
          >
            <Plus className="w-5 h-5 text-blue-600" />
            <span>+ Add Product</span>
          </button>

          <button
            onClick={onOpenAddCategory}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 font-bold text-xs flex flex-col items-center justify-center gap-1.5 backdrop-blur-md cursor-pointer transition-all text-white"
          >
            <FolderTree className="w-5 h-5 text-blue-300" />
            <span>+ Add Category</span>
          </button>

          <button
            onClick={onOpenCreateOffer}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 font-bold text-xs flex flex-col items-center justify-center gap-1.5 backdrop-blur-md cursor-pointer transition-all text-white"
          >
            <Tag className="w-5 h-5 text-amber-300" />
            <span>Create Offer</span>
          </button>

          <button
            onClick={() => onNavigateTab('media')}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 font-bold text-xs flex flex-col items-center justify-center gap-1.5 backdrop-blur-md cursor-pointer transition-all text-white"
          >
            <ImageIcon className="w-5 h-5 text-emerald-300" />
            <span>Media Library</span>
          </button>

          <button
            onClick={() => onNavigateTab('homepage')}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 font-bold text-xs flex flex-col items-center justify-center gap-1.5 backdrop-blur-md cursor-pointer transition-all text-white"
          >
            <Layers className="w-5 h-5 text-indigo-300" />
            <span>Edit Homepage</span>
          </button>

          <button
            onClick={() => onNavigateTab('settings')}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 font-bold text-xs flex flex-col items-center justify-center gap-1.5 backdrop-blur-md cursor-pointer transition-all text-white"
          >
            <Settings className="w-5 h-5 text-slate-200" />
            <span>Store Settings</span>
          </button>

          <button
            onClick={() => onNavigateTab('security')}
            className="p-3 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/30 font-bold text-xs flex flex-col items-center justify-center gap-1.5 backdrop-blur-md cursor-pointer transition-all text-white col-span-2 sm:col-span-1"
          >
            <KeyRound className="w-5 h-5 text-cyan-300" />
            <span>Owner Password</span>
          </button>
        </div>
      </div>

      {/* Dashboard Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Total Products</div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono mt-1">
            {totalProds}
          </div>
          <div className="text-[11px] text-blue-600 dark:text-blue-400 mt-0.5">Active items</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Featured</div>
          <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-mono mt-1">
            {featured}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">On homepage</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">New Arrivals</div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
            {newArrivals}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Latest batch</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Active Offers</div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono mt-1">
            {activeOffers}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Live banners</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Out of Stock</div>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 font-mono mt-1">
            {outOfStock}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Needs restock</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Categories</div>
          <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono mt-1">
            {totalCategories}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Departments</div>
        </div>
      </div>

      {/* Recently Added Products List */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
            Recently Added Products (Editable Demo Inventory)
          </h4>
          <button
            onClick={() => onNavigateTab('products')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Manage All {products.length} Products
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {products.slice(0, 6).map((prod) => (
            <div
              key={prod.id}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-12 h-12 rounded-xl object-cover bg-white shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {prod.name}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {prod.category} · {prod.availability}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                  Rs. {prod.price.toLocaleString()}
                </div>
                {prod.badge && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                    {prod.badge}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

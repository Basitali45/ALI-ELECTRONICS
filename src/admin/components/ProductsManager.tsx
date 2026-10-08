import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  X, 
  Sparkles, 
  AlertTriangle, 
  Upload, 
  Tag, 
  Image as ImageIcon 
} from 'lucide-react';
import { Product, Category, ProductBadge } from '../../types';
import { api } from '../../services/api';

interface ProductsManagerProps {
  products: Product[];
  categories: Category[];
  onRefresh: () => void;
  showToast: (msg: string) => void;
}

export function ProductsManager({ products, categories, onRefresh, showToast }: ProductsManagerProps) {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Inline price editing
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editingPriceValue, setEditingPriceValue] = useState<string>('');

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [form, setForm] = useState({
    name: '',
    category: '',
    brand: 'Generic Tech',
    sku: '',
    stock: '15',
    price: '',
    oldPrice: '',
    discount: '',
    badge: '' as ProductBadge,
    image: '',
    additionalImages: [] as string[],
    shortDescription: '',
    description: '',
    specifications: [''],
    availability: 'In Stock' as 'In Stock' | 'Limited Stock' | 'Out of Stock',
    featured: false,
    isNewArrival: false,
    showOnHomepage: true,
    whatsappEnabled: true,
    displayOrder: 1,
  });

  // Delete confirmation
  const [deleteCandidate, setDeleteCandidate] = useState<Product | null>(null);

  const filtered = products.filter(p => {
    if (selectedCat !== 'all' && p.category.toLowerCase() !== selectedCat.toLowerCase()) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || (p.brand && p.brand.toLowerCase().includes(q)) || (p.sku && p.sku.toLowerCase().includes(q));
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setForm({
      name: '',
      category: categories[0]?.name || 'Mobile Accessories',
      brand: 'Generic Tech',
      sku: `AE-${Math.floor(1000 + Math.random() * 9000)}`,
      stock: '15',
      price: '',
      oldPrice: '',
      discount: '',
      badge: '',
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
      additionalImages: [],
      shortDescription: '',
      description: '',
      specifications: ['High quality build', 'Fast performance'],
      availability: 'In Stock',
      featured: false,
      isNewArrival: false,
      showOnHomepage: true,
      whatsappEnabled: true,
      displayOrder: products.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setForm({
      name: p.name,
      category: p.category,
      brand: p.brand || 'Generic Tech',
      sku: p.sku || `AE-${p.id.slice(-4)}`,
      stock: String(p.stock ?? 10),
      price: String(p.price),
      oldPrice: p.oldPrice ? String(p.oldPrice) : '',
      discount: p.discount || '',
      badge: p.badge || '',
      image: p.image,
      additionalImages: p.additionalImages || [],
      shortDescription: p.shortDescription || '',
      description: p.description,
      specifications: p.specifications && p.specifications.length ? [...p.specifications] : [''],
      availability: p.availability,
      featured: p.featured,
      isNewArrival: Boolean(p.isNewArrival),
      showOnHomepage: p.showOnHomepage !== false,
      whatsappEnabled: p.whatsappEnabled !== false,
      displayOrder: p.displayOrder || 1,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return showToast('Product name is required');
    const priceNum = Number(form.price);
    if (isNaN(priceNum) || priceNum <= 0) return showToast('Valid price in PKR is required');

    try {
      const payload: Partial<Product> = {
        name: form.name.trim(),
        category: form.category,
        brand: form.brand.trim(),
        sku: form.sku.trim(),
        stock: Number(form.stock) || 10,
        price: priceNum,
        oldPrice: form.oldPrice ? Number(form.oldPrice) : undefined,
        discount: form.discount.trim() || undefined,
        badge: form.badge || undefined,
        image: form.image.trim(),
        additionalImages: form.additionalImages.filter(Boolean),
        shortDescription: form.shortDescription.trim(),
        description: form.description.trim(),
        specifications: form.specifications.filter(s => s.trim() !== ''),
        availability: form.availability,
        featured: form.featured,
        isNewArrival: form.isNewArrival,
        showOnHomepage: form.showOnHomepage,
        whatsappEnabled: form.whatsappEnabled,
        displayOrder: Number(form.displayOrder) || 1,
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
        showToast('Product updated successfully in Supabase!');
      } else {
        await api.createProduct(payload);
        showToast('Product saved permanently to Supabase!');
      }

      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Error saving product');
    }
  };

  // Quick Inline Price Save
  const handleSaveInlinePrice = async (id: string) => {
    const val = Number(editingPriceValue);
    if (isNaN(val) || val <= 0) {
      showToast('Enter a valid price');
      return;
    }
    try {
      await api.quickUpdatePrice(id, val);
      setEditingPriceId(null);
      showToast('Price updated!');
      onRefresh();
    } catch {
      showToast('Failed to update price');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await api.duplicateProduct(id);
      showToast('Product duplicated!');
      onRefresh();
    } catch {
      showToast('Failed to duplicate product');
    }
  };

  const handleDelete = async () => {
    if (!deleteCandidate) return;
    try {
      await api.deleteProduct(deleteCandidate.id);
      showToast(`Deleted ${deleteCandidate.name}`);
      setDeleteCandidate(null);
      onRefresh();
    } catch {
      showToast('Failed to delete product');
    }
  };

  // Bulk actions
  const handleBulkAction = async (action: string, payload?: any) => {
    if (selectedIds.length === 0) return;
    try {
      await api.bulkProductAction(action, selectedIds, payload);
      showToast(`Bulk updated ${selectedIds.length} products`);
      setSelectedIds([]);
      onRefresh();
    } catch {
      showToast('Bulk update failed');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(p => p.id));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isAdditional = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      // 1. Upload to Supabase Storage bucket 'product-images'
      const { url: publicUrl, error: uploadErr } = await api.uploadProductImage(file);
      if (publicUrl) {
        if (isAdditional) {
          setForm(prev => ({ ...prev, additionalImages: [...prev.additionalImages, publicUrl] }));
        } else {
          setForm(prev => ({ ...prev, image: publicUrl }));
        }
        showToast('Image uploaded permanently to Supabase Storage!');
        return;
      }

      // If Supabase upload returns error, fallback to FileReader preview
      if (uploadErr) {
        console.warn('Supabase storage upload notice:', uploadErr);
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          const url = ev.target.result as string;
          if (isAdditional) {
            setForm(prev => ({ ...prev, additionalImages: [...prev.additionalImages, url] }));
          } else {
            setForm(prev => ({ ...prev, image: url }));
          }
          showToast('Image loaded. (Configure Supabase Storage for permanent cloud hosting)');
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      showToast('Image upload failed: ' + (err.message || ''));
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products or brands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          >
            <option value="all">All Departments</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAdd}
            className="py-2.5 px-4 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Product</span>
          </button>
        </div>
      </div>

      {/* Bulk Action Toolbar if items selected */}
      {selectedIds.length > 0 && (
        <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="font-bold text-blue-900 dark:text-blue-200">
            {selectedIds.length} products selected
          </span>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleBulkAction('stock', { availability: 'In Stock' })}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold"
            >
              Set In Stock
            </button>
            <button
              onClick={() => handleBulkAction('stock', { availability: 'Out of Stock' })}
              className="px-2.5 py-1.5 rounded-lg bg-rose-600 text-white font-semibold"
            >
              Set Out of Stock
            </button>
            <button
              onClick={() => handleBulkAction('featured', { featured: true })}
              className="px-2.5 py-1.5 rounded-lg bg-blue-600 text-white font-semibold"
            >
              Mark Featured
            </button>
            <button
              onClick={() => handleBulkAction('discountPercent', { percent: 10 })}
              className="px-2.5 py-1.5 rounded-lg bg-amber-600 text-white font-semibold"
            >
              Apply 10% Discount
            </button>
            <button
              onClick={() => {
                if (confirm(`Delete ${selectedIds.length} selected products?`)) {
                  handleBulkAction('delete');
                }
              }}
              className="px-2.5 py-1.5 rounded-lg bg-red-700 text-white font-semibold"
            >
              Bulk Delete
            </button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === filtered.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                </th>
                <th className="py-3 px-3">Item / Image</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">Price (Click to edit)</th>
                <th className="py-3 px-3">Stock Status</th>
                <th className="py-3 px-3 text-center">Featured</th>
                <th className="py-3 px-3 text-center">New</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filtered.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(prod.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedIds([...selectedIds, prod.id]);
                        else setSelectedIds(selectedIds.filter(id => id !== prod.id));
                      }}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                  </td>

                  {/* Product Details */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 dark:text-white line-clamp-1 max-w-xs">
                          {prod.name}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                          {prod.badge && (
                            <span className="font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-1 rounded">
                              {prod.badge}
                            </span>
                          )}
                          <span>Order: #{prod.displayOrder || 1}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Department */}
                  <td className="py-3 px-3 font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap">
                    {prod.category}
                  </td>

                  {/* Quick Inline Price Editing */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    {editingPriceId === prod.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={editingPriceValue}
                          onChange={(e) => setEditingPriceValue(e.target.value)}
                          className="w-20 px-2 py-1 text-xs border rounded bg-white dark:bg-slate-800 font-mono"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveInlinePrice(prod.id)}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingPriceId(null)}
                          className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => {
                          setEditingPriceId(prod.id);
                          setEditingPriceValue(String(prod.price));
                        }}
                        className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/50 p-1 rounded transition-colors group flex items-baseline gap-1"
                        title="Click to quickly edit price"
                      >
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          Rs. {prod.price.toLocaleString()}
                        </span>
                        <Edit3 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100" />
                      </div>
                    )}
                  </td>

                  {/* Stock Quick Toggle */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <select
                      value={prod.availability}
                      onChange={async (e) => {
                        await api.toggleProductStock(prod.id, e.target.value);
                        onRefresh();
                      }}
                      className="px-2 py-1 rounded-lg text-xs font-semibold border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    >
                      <option value="In Stock">In Stock</option>
                      <option value="Limited Stock">Limited Stock</option>
                      <option value="Out of Stock">Out of Stock</option>
                    </select>
                  </td>

                  {/* Featured */}
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={async () => {
                        await api.toggleProductFeatured(prod.id, !prod.featured);
                        onRefresh();
                      }}
                      className={`p-1.5 rounded-lg cursor-pointer ${
                        prod.featured ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/60' : 'text-slate-300'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                  </td>

                  {/* New Arrival */}
                  <td className="py-3 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={Boolean(prod.isNewArrival)}
                      onChange={async (e) => {
                        await api.updateProduct(prod.id, { isNewArrival: e.target.checked });
                        onRefresh();
                      }}
                      className="w-4 h-4 rounded text-emerald-600"
                    />
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleDuplicate(prod.id)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Duplicate Product"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(prod)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Edit Product"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteCandidate(prod)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FULL VISUAL PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-60 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-heading font-extrabold text-xl text-slate-900 dark:text-white mb-4">
              {editingProduct ? 'Edit Product Details' : 'Add New Electronics Product'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Product Name & Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Product Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="e.g. Wireless Bluetooth Earbuds"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Brand (Optional)
                  </label>
                  <input
                    type="text"
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    placeholder="Generic Tech"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Department & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Category Department <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Promotional Badge
                  </label>
                  <select
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value as ProductBadge })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="">None</option>
                    <option value="SALE">SALE (Red)</option>
                    <option value="HOT">HOT (Amber)</option>
                    <option value="NEW">NEW (Green)</option>
                    <option value="POPULAR">POPULAR (Indigo)</option>
                    <option value="LIMITED">LIMITED (Purple)</option>
                    <option value="BEST SELLER">BEST SELLER (Blue)</option>
                  </select>
                </div>
              </div>

              {/* SKU & Stock Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Product SKU (Code)
                  </label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    placeholder="e.g. AE-AUD-101"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Stock Quantity (Units)
                  </label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    placeholder="15"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* Price, Old Price & Custom Discount text */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Price (PKR) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                    placeholder="2499"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Old Price (Strike-through)
                  </label>
                  <input
                    type="number"
                    value={form.oldPrice}
                    onChange={(e) => setForm({ ...form, oldPrice: e.target.value })}
                    placeholder="2999"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Discount Text (e.g. 17% OFF)
                  </label>
                  <input
                    type="text"
                    value={form.discount}
                    onChange={(e) => setForm({ ...form, discount: e.target.value })}
                    placeholder="Auto or custom"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Image & Additional Images */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Primary Product Image
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    placeholder="Image URL or upload"
                    className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                  <label className="py-2 px-3 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 cursor-pointer flex items-center gap-1.5 shrink-0 transition-colors">
                    <Upload className={`w-3.5 h-3.5 ${uploadingImage ? 'animate-bounce' : ''}`} />
                    <span>{uploadingImage ? 'Uploading to Supabase...' : 'Upload Cloud Image'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      disabled={uploadingImage} 
                      onChange={(e) => handleFileUpload(e, false)} 
                      className="hidden" 
                    />
                  </label>
                </div>
                {form.image && (
                  <img src={form.image} alt="Preview" className="w-14 h-14 rounded-lg object-cover border" />
                )}
              </div>

              {/* Descriptions */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Short Description
                </label>
                <input
                  type="text"
                  value={form.shortDescription}
                  onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                  placeholder="One sentence summary for product card"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Full Description
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Detailed specifications, warranty and package contents..."
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span>Featured Product</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isNewArrival}
                    onChange={(e) => setForm({ ...form, isNewArrival: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span>New Arrival</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.showOnHomepage}
                    onChange={(e) => setForm({ ...form, showOnHomepage: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span>Show Homepage</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.whatsappEnabled}
                    onChange={(e) => setForm({ ...form, whatsappEnabled: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span>WhatsApp Button</span>
                </label>
              </div>

              {/* Buttons */}
              <div className="pt-4 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                >
                  {editingProduct ? 'Save Changes' : '+ Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-70 bg-slate-950/80 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-heading font-bold text-lg text-slate-900 dark:text-white">Delete Product?</h4>
              <p className="text-xs text-slate-500">Are you sure you want to delete "{deleteCandidate.name}"?</p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button onClick={() => setDeleteCandidate(null)} className="py-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800">
                Cancel
              </button>
              <button onClick={handleDelete} className="py-2.5 rounded-xl text-xs font-bold bg-rose-600 text-white">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

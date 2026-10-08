import React, { useState } from 'react';
import { Tag, Plus, Edit3, Trash2, Power, Upload, ExternalLink } from 'lucide-react';
import { Offer, Product } from '../../types';
import { api } from '../../services/api';

interface OffersManagerProps {
  offers: Offer[];
  products: Product[];
  onRefresh: () => void;
  showToast: (msg: string) => void;
}

export function OffersManager({ offers, products, onRefresh, showToast }: OffersManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 20,
    bannerImage: '',
    buttonText: 'Shop Now',
    buttonLink: '#products',
    displayLocation: 'banner' as 'hero' | 'banner' | 'listing' | 'detail' | 'popup',
    isActive: true,
  });

  const handleOpenAdd = () => {
    setEditingOffer(null);
    setForm({
      title: 'MEGA ELECTRONICS SALE',
      description: 'Up to 30% OFF on Selected Products at Ali Electronic Hassan Abdal',
      discountType: 'percentage',
      discountValue: 30,
      bannerImage: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1200&auto=format&fit=crop&q=80',
      buttonText: 'Shop Now',
      buttonLink: '#products',
      displayLocation: 'banner',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (o: Offer) => {
    setEditingOffer(o);
    setForm({
      title: o.title,
      description: o.description,
      discountType: o.discountType,
      discountValue: o.discountValue,
      bannerImage: o.bannerImage || '',
      buttonText: o.buttonText || 'Shop Now',
      buttonLink: o.buttonLink || '#products',
      displayLocation: o.displayLocation || 'banner',
      isActive: o.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return showToast('Title is required');

    try {
      if (editingOffer) {
        await api.updateOffer(editingOffer.id, form);
        showToast('Offer updated successfully!');
      } else {
        await api.createOffer(form);
        showToast('Offer created successfully!');
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Error saving offer');
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await api.toggleOffer(id);
      showToast('Offer status toggled');
      onRefresh();
    } catch {
      showToast('Error toggling offer');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this offer?')) return;
    try {
      await api.deleteOffer(id);
      showToast('Offer deleted');
      onRefresh();
    } catch {
      showToast('Error deleting offer');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setForm(prev => ({ ...prev, bannerImage: ev.target!.result as string }));
        showToast('Banner image uploaded!');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            <Tag className="w-4 h-4" />
            <span>Store Promotions & Banners</span>
          </div>
          <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white mt-1">
            Offers & Promotions Manager
          </h3>
          <p className="text-xs text-slate-500 max-w-md">
            Create promotional deals and discounts that appear as homepage banners or customer announcements.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="py-2.5 px-4 rounded-xl font-bold text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create New Offer</span>
        </button>
      </div>

      {/* Offers Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className={`p-5 rounded-3xl border transition-all ${
              offer.isActive
                ? 'bg-white dark:bg-slate-900 border-amber-300 dark:border-amber-800/80 shadow-md'
                : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-60'
            }`}
          >
            {offer.bannerImage && (
              <div className="h-32 rounded-2xl overflow-hidden mb-3 bg-slate-900 relative">
                <img src={offer.bannerImage} alt={offer.title} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white uppercase">
                  {offer.displayLocation}
                </div>
              </div>
            )}

            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400">
                  {offer.discountType === 'percentage' ? `${offer.discountValue}% OFF` : `Save Rs. ${offer.discountValue}`}
                </span>
                <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white mt-0.5">
                  {offer.title}
                </h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {offer.description}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleToggle(offer.id)}
                  className={`p-2 rounded-xl transition-colors cursor-pointer ${
                    offer.isActive ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60' : 'text-slate-400 bg-slate-100 dark:bg-slate-800'
                  }`}
                  title={offer.isActive ? 'Active on store' : 'Inactive'}
                >
                  <Power className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleOpenEdit(offer)}
                  className="p-2 text-slate-500 hover:text-blue-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(offer.id)}
                  className="p-2 text-slate-500 hover:text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Offer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-60 bg-slate-950/75 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
              {editingOffer ? 'Edit Promotional Offer' : 'Create New Promotional Offer'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Offer Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  placeholder="e.g. MEGA ELECTRONICS SALE"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Description / Offer Subtitle
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. Up to 30% OFF on Selected Products"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Discount Type</label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border"
                  >
                    <option value="percentage">Percentage (% OFF)</option>
                    <option value="fixed">Fixed Rupee Discount (Rs.)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Value</label>
                  <input
                    type="number"
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Banner Background Image</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.bannerImage}
                    onChange={(e) => setForm({ ...form, bannerImage: e.target.value })}
                    placeholder="URL or upload banner"
                    className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border"
                  />
                  <label className="py-2 px-3 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 cursor-pointer flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Button Text</label>
                  <input
                    type="text"
                    value={form.buttonText}
                    onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Display Placement</label>
                  <select
                    value={form.displayLocation}
                    onChange={(e) => setForm({ ...form, displayLocation: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border"
                  >
                    <option value="banner">Homepage Banner</option>
                    <option value="hero">Hero Spotlight</option>
                    <option value="listing">Product Catalogue Header</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 text-xs">
                <input
                  type="checkbox"
                  id="offerActive"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-600"
                />
                <label htmlFor="offerActive" className="cursor-pointer font-medium">
                  Active (Show to customers immediately)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-600 text-white"
                >
                  Save Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

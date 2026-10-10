import React, { useState } from 'react';
import { Image as ImageIcon, Upload, Trash2, Copy, Check, Filter } from 'lucide-react';
import { MediaItem } from '../../types';
import { api } from '../../services/api';

interface MediaLibraryProps {
  media: MediaItem[];
  onRefresh: () => void;
  showToast: (msg: string) => void;
}

export function MediaLibrary({ media, onRefresh, showToast }: MediaLibraryProps) {
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<'product' | 'category' | 'offer' | 'hero' | 'store' | 'logo'>('product');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredMedia = media.filter((m) => {
    if (selectedCat !== 'all' && m.category !== selectedCat) return false;
    return true;
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { url: publicUrl, error: uploadErr } = await api.uploadProductImage(file);
      if (!publicUrl) {
        showToast(`Image upload failed: ${uploadErr || 'unknown error'}`);
        return;
      }
      await api.uploadMedia({
        title: file.name.replace(/\.[^/.]+$/, ''),
        url: publicUrl,
        category
      });
      showToast('Image uploaded to library!');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Error uploading image');
    } finally {
      e.target.value = '';
    }
  };

  const handleAddUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    try {
      await api.uploadMedia({
        title: title.trim() || 'Media Item',
        url: url.trim(),
        category
      });
      setTitle('');
      setUrl('');
      showToast('Media added!');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Error saving media');
    }
  };

  const handleCopy = (id: string, itemUrl: string) => {
    navigator.clipboard.writeText(itemUrl);
    setCopiedId(id);
    showToast('Image URL copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteMedia(id);
      showToast('Image removed from library');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Error deleting media');
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Box */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-blue-600" />
          <span>Upload Store Images to Media Library</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* File Upload drag area */}
          <label className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-500 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-center cursor-pointer transition-colors bg-slate-50 dark:bg-slate-800/40">
            <Upload className="w-8 h-8 text-blue-500" />
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Click to upload photo from your device
            </div>
            <div className="text-[11px] text-slate-400">
              Auto-optimizes images for products, banners, and logos
            </div>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>

          {/* Add via URL */}
          <form onSubmit={handleAddUrl} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2.5">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Or add image by URL</div>
            <input
              type="text"
              placeholder="Image title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-800 border"
            />
            <input
              type="text"
              placeholder="https://images.unsplash.com/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="w-full px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-800 border"
            />
            <div className="flex gap-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="px-2 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-800 border flex-1"
              >
                <option value="product">Product Images</option>
                <option value="category">Category Images</option>
                <option value="offer">Offer Banners</option>
                <option value="hero">Hero Images</option>
                <option value="logo">Logo & Brand</option>
                <option value="store">Store Showroom</option>
              </select>
              <button
                type="submit"
                className="py-1.5 px-4 rounded-xl font-bold text-xs bg-blue-600 text-white shadow-xs cursor-pointer"
              >
                + Add
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5">
        {['all', 'product', 'category', 'offer', 'hero', 'logo', 'store'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize cursor-pointer transition-colors ${
              selectedCat === cat
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {cat === 'all' ? 'All Media' : `${cat}s`}
          </button>
        ))}
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filteredMedia.map((item) => (
          <div
            key={item.id}
            className="group relative rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col"
          >
            <div className="aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
              <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => handleCopy(item.id, item.url)}
                  className="p-1.5 rounded-lg bg-white/90 text-slate-800 hover:bg-white cursor-pointer"
                  title="Copy Image URL"
                >
                  {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 cursor-pointer"
                  title="Delete image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="p-2 space-y-0.5">
              <div className="font-semibold text-[11px] text-slate-900 dark:text-white truncate">
                {item.title}
              </div>
              <div className="text-[10px] text-blue-600 dark:text-blue-400 capitalize">
                {item.category}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

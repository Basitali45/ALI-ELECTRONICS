import React, { useState } from 'react';
import { Plus, Edit3, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, Upload, FolderTree } from 'lucide-react';
import { Category, Product } from '../../types';
import { api } from '../../services/api';

interface CategoriesManagerProps {
  categories: Category[];
  products: Product[];
  onRefresh: () => void;
  showToast: (msg: string) => void;
}

export function CategoriesManager({ categories, products, onRefresh, showToast }: CategoriesManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    image: '',
    isVisible: true,
  });

  const sortedCategories = [...categories].sort((a, b) => (a.order || 0) - (b.order || 0));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return showToast('Category name is required');

    try {
      if (editingId) {
        await api.updateCategory(editingId, form);
        showToast('Category updated!');
      } else {
        await api.addCategory({ ...form, order: categories.length + 1 });
        showToast('Category created!');
      }
      setEditingId(null);
      setForm({ name: '', description: '', image: '', isVisible: true });
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Error saving category');
    }
  };

  const handleEditClick = (cat: Category) => {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      description: cat.description || '',
      image: cat.image || '',
      isVisible: cat.isVisible !== false,
    });
  };

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Delete category "${cat.name}"? Products in it stay in the store but will no longer appear under this category.`)) return;
    try {
      await api.deleteCategory(cat.id);
      showToast(`Category "${cat.name}" deleted`);
      onRefresh();
    } catch (err: any) {
      showToast(err?.message || 'Error deleting category');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sortedCategories.length) return;

    const currentCat = sortedCategories[index];
    const targetCat = sortedCategories[targetIdx];

    try {
      await api.updateCategory(currentCat.id, { order: targetIdx + 1 });
      await api.updateCategory(targetCat.id, { order: index + 1 });
      onRefresh();
    } catch (err: any) {
      showToast(err?.message || 'Error reordering');
    }
  };

  const handleToggleVisibility = async (cat: Category) => {
    try {
      await api.updateCategory(cat.id, { isVisible: !(cat.isVisible !== false) });
      showToast(`Updated visibility for ${cat.name}`);
      onRefresh();
    } catch (err: any) {
      showToast(err?.message || 'Error updating visibility');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setForm(prev => ({ ...prev, image: ev.target!.result as string }));
        showToast('Category image uploaded!');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Category Form */}
      <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <FolderTree className="w-5 h-5 text-blue-600" />
          <span>{editingId ? 'Edit Department' : 'Create New Department'}</span>
        </h3>

        <form onSubmit={handleSave} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Department Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              placeholder="e.g. Smart Devices"
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Description (Optional)
            </label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief summary of items in this department"
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Department Image (Appears on Category Card)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="Image URL or upload"
                className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
              <label className="py-2 px-3 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 cursor-pointer flex items-center gap-1 shrink-0">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
            {form.image && (
              <img src={form.image} alt="Preview" className="w-12 h-12 rounded-xl object-cover mt-2 border" />
            )}
          </div>

          <div className="flex items-center gap-2 pt-1 text-xs">
            <input
              type="checkbox"
              id="catVisible"
              checked={form.isVisible}
              onChange={(e) => setForm({ ...form, isVisible: e.target.checked })}
              className="w-4 h-4 rounded text-blue-600"
            />
            <label htmlFor="catVisible" className="cursor-pointer font-medium text-slate-700 dark:text-slate-300">
              Visible on Customer Website
            </label>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer"
            >
              {editingId ? 'Save Changes' : '+ Add Department'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm({ name: '', description: '', image: '', isVisible: true });
                }}
                className="py-2.5 px-3 rounded-xl text-xs bg-slate-100 dark:bg-slate-800"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Categories Reorderable List */}
      <div className="lg:col-span-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="font-heading font-bold text-sm text-slate-900 dark:text-white">
            Store Departments ({sortedCategories.length})
          </span>
          <span className="text-xs text-slate-400">Use arrows to adjust display order</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[65vh] overflow-y-auto">
          {sortedCategories.map((cat, idx) => {
            const count = products.filter(p => p.category.toLowerCase() === cat.name.toLowerCase()).length;
            const isVisible = cat.isVisible !== false;

            return (
              <div key={cat.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-10 h-10 rounded-xl object-cover shrink-0 bg-slate-100" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                      #{idx + 1}
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white truncate">{cat.name}</span>
                      {!isVisible && (
                        <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">
                          Hidden
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {count} items · {cat.description || 'No description'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleMove(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-20 rounded"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMove(idx, 'down')}
                    disabled={idx === sortedCategories.length - 1}
                    className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-20 rounded"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleToggleVisibility(cat)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 rounded"
                    title={isVisible ? 'Hide from website' : 'Show on website'}
                  >
                    {isVisible ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                  </button>

                  <button
                    onClick={() => handleEditClick(cat)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 rounded"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(cat)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

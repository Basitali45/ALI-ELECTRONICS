import React, { useState } from 'react';
import { 
  Layers, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  EyeOff, 
  Save, 
  Upload, 
  Megaphone, 
  Sparkles, 
  Layout 
} from 'lucide-react';
import { HomepageConfig, HomepageSection } from '../../types';
import { api } from '../../services/api';

interface HomepageCustomizerProps {
  homepage: HomepageConfig;
  onRefresh: () => void;
  showToast: (msg: string) => void;
}

export function HomepageCustomizer({ homepage, onRefresh, showToast }: HomepageCustomizerProps) {
  const [config, setConfig] = useState<HomepageConfig>(homepage);
  const [activeSubTab, setActiveSubTab] = useState<'hero' | 'sections' | 'announcement' | 'popup'>('hero');

  const handleSave = async () => {
    try {
      await api.updateHomepage(config);
      showToast('Homepage customization saved!');
      onRefresh();
    } catch (err: any) {
      showToast(err?.message || 'Failed to save homepage settings');
    }
  };

  const handleHeroBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setConfig(prev => ({ ...prev, heroBackgroundImage: ev.target!.result as string }));
        showToast('Hero background uploaded!');
      }
    };
    reader.readAsDataURL(file);
  };

  const sortedSections = [...(config.sections || [])].sort((a, b) => a.order - b.order);

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sortedSections.length) return;

    const newSections = [...sortedSections];
    const temp = newSections[index];
    newSections[index] = newSections[targetIdx];
    newSections[targetIdx] = temp;

    // Re-index orders
    const reordered = newSections.map((s, idx) => ({ ...s, order: idx + 1 }));
    setConfig(prev => ({ ...prev, sections: reordered }));
  };

  const handleToggleSection = (id: string) => {
    setConfig(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s)
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header with Save Button */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            <Layout className="w-4 h-4" />
            <span>No-Code Visual Customizer</span>
          </div>
          <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white mt-1">
            Homepage Customizer & Section Manager
          </h3>
          <p className="text-xs text-slate-500 max-w-md">
            Control your hero presentation, re-order homepage sections, manage the announcement bar and promotional popup.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="py-2.5 px-5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Sub navigation pills */}
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
        <button
          onClick={() => setActiveSubTab('hero')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeSubTab === 'hero' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Hero Section
        </button>
        <button
          onClick={() => setActiveSubTab('sections')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeSubTab === 'sections' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Sections Order & Toggles
        </button>
        <button
          onClick={() => setActiveSubTab('announcement')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeSubTab === 'announcement' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Announcement Bar
        </button>
        <button
          onClick={() => setActiveSubTab('popup')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeSubTab === 'popup' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Promotional Popup
        </button>
      </div>

      {/* SUB-TAB 1: HERO SECTION */}
      {activeSubTab === 'hero' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 max-w-3xl">
          <div className="flex items-center justify-between pb-2 border-b">
            <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">Hero Banner Controls</h4>
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={config.heroEnabled !== false}
                onChange={(e) => setConfig({ ...config, heroEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600"
              />
              <span>Hero Enabled</span>
            </label>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Hero Main Heading</label>
            <input
              type="text"
              value={config.heroHeading}
              onChange={(e) => setConfig({ ...config, heroHeading: e.target.value })}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Hero Supporting Subtitle</label>
            <textarea
              rows={2}
              value={config.heroSubtitle}
              onChange={(e) => setConfig({ ...config, heroSubtitle: e.target.value })}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Hero Background Image</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={config.heroBackgroundImage}
                onChange={(e) => setConfig({ ...config, heroBackgroundImage: e.target.value })}
                className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border"
              />
              <label className="py-2 px-3 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 cursor-pointer flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload</span>
                <input type="file" accept="image/*" onChange={handleHeroBgUpload} className="hidden" />
              </label>
            </div>
            {config.heroBackgroundImage && (
              <img src={config.heroBackgroundImage} alt="Hero preview" className="w-full h-24 rounded-xl object-cover mt-2 border" />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Dark Overlay Opacity</span>
              <span>{config.heroOverlayOpacity ?? 75}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="95"
              value={config.heroOverlayOpacity ?? 75}
              onChange={(e) => setConfig({ ...config, heroOverlayOpacity: Number(e.target.value) })}
              className="w-full accent-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Primary Button Text</label>
              <input
                type="text"
                value={config.heroCtaText}
                onChange={(e) => setConfig({ ...config, heroCtaText: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Primary Button Destination</label>
              <input
                type="text"
                value={config.heroCtaDestination}
                onChange={(e) => setConfig({ ...config, heroCtaDestination: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Secondary Button Text</label>
              <input
                type="text"
                value={config.heroSecondaryCtaText}
                onChange={(e) => setConfig({ ...config, heroSecondaryCtaText: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Secondary Button Destination</label>
              <input
                type="text"
                value={config.heroSecondaryCtaDestination}
                onChange={(e) => setConfig({ ...config, heroSecondaryCtaDestination: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border"
              />
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: SECTIONS ORDER & TOGGLES */}
      {activeSubTab === 'sections' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 max-w-2xl">
          <div className="pb-2 border-b">
            <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
              Homepage Layout Section Manager
            </h4>
            <p className="text-xs text-slate-400">
              Use arrows to order sections up or down. Toggle eye to show or hide any section from customers.
            </p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {sortedSections.map((sec, idx) => (
              <div key={sec.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 font-bold text-xs flex items-center justify-center">
                    #{sec.order}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white">{sec.name}</div>
                    <div className="text-[10px] text-slate-400">Section ID: {sec.id}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMoveSection(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 text-slate-400 hover:text-blue-600 disabled:opacity-20 rounded"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMoveSection(idx, 'down')}
                    disabled={idx === sortedSections.length - 1}
                    className="p-1.5 text-slate-400 hover:text-blue-600 disabled:opacity-20 rounded"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleSection(sec.id)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 rounded ml-2"
                  >
                    {sec.enabled ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: ANNOUNCEMENT BAR */}
      {activeSubTab === 'announcement' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 max-w-2xl">
          <div className="flex items-center justify-between pb-2 border-b">
            <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">Announcement Banner</h4>
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={config.announcementBar?.enabled ?? true}
                onChange={(e) => setConfig({
                  ...config,
                  announcementBar: { ...config.announcementBar, enabled: e.target.checked }
                })}
                className="w-4 h-4 rounded text-blue-600"
              />
              <span>Enabled</span>
            </label>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Banner Notice Text</label>
            <input
              type="text"
              value={config.announcementBar?.text || ''}
              onChange={(e) => setConfig({
                ...config,
                announcementBar: { ...config.announcementBar, text: e.target.value }
              })}
              placeholder="e.g. 🔥 Special Offer — Up to 30% OFF on Selected Products"
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Banner Click Link</label>
              <input
                type="text"
                value={config.announcementBar?.link || ''}
                onChange={(e) => setConfig({
                  ...config,
                  announcementBar: { ...config.announcementBar, link: e.target.value }
                })}
                placeholder="#products"
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Banner Style</label>
              <select
                value={config.announcementBar?.style || 'gradient'}
                onChange={(e) => setConfig({
                  ...config,
                  announcementBar: { ...config.announcementBar, style: e.target.value as any }
                })}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border"
              >
                <option value="gradient">Electric Gradient (Blue/Indigo)</option>
                <option value="navy">Deep Navy Tech</option>
                <option value="emerald">Emerald Green (Sale)</option>
                <option value="amber">Warm Amber (Alert)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: POPUP */}
      {activeSubTab === 'popup' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 max-w-2xl">
          <div className="flex items-center justify-between pb-2 border-b">
            <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">Promotional Pop-up Window</h4>
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={config.promoPopup?.enabled ?? false}
                onChange={(e) => setConfig({
                  ...config,
                  promoPopup: { ...config.promoPopup, enabled: e.target.checked }
                })}
                className="w-4 h-4 rounded text-blue-600"
              />
              <span>Enabled</span>
            </label>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Popup Title</label>
            <input
              type="text"
              value={config.promoPopup?.title || ''}
              onChange={(e) => setConfig({
                ...config,
                promoPopup: { ...config.promoPopup, title: e.target.value }
              })}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Popup Description</label>
            <textarea
              rows={2}
              value={config.promoPopup?.description || ''}
              onChange={(e) => setConfig({
                ...config,
                promoPopup: { ...config.promoPopup, description: e.target.value }
              })}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Popup Image (Optional)</label>
            <input
              type="text"
              value={config.promoPopup?.image || ''}
              onChange={(e) => setConfig({
                ...config,
                promoPopup: { ...config.promoPopup, image: e.target.value }
              })}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Button Text</label>
              <input
                type="text"
                value={config.promoPopup?.buttonText || 'Shop Now'}
                onChange={(e) => setConfig({
                  ...config,
                  promoPopup: { ...config.promoPopup, buttonText: e.target.value }
                })}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Delay Seconds</label>
              <input
                type="number"
                value={config.promoPopup?.delaySeconds ?? 3}
                onChange={(e) => setConfig({
                  ...config,
                  promoPopup: { ...config.promoPopup, delaySeconds: Number(e.target.value) }
                })}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

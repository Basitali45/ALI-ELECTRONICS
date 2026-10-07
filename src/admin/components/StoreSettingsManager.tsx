import React, { useState } from 'react';
import { Settings, Save, Upload, MessageCircle, Phone, MapPin, Palette, KeyRound, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { StoreSettings, ThemePreset } from '../../types';
import { api } from '../../services/api';

interface StoreSettingsManagerProps {
  settings: StoreSettings;
  onRefresh: () => void;
  showToast: (msg: string) => void;
}

export function StoreSettingsManager({ settings, onRefresh, showToast }: StoreSettingsManagerProps) {
  const [form, setForm] = useState<StoreSettings>(settings);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passError, setPassError] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');

    if (!currentPassword) {
      setPassError('Please enter your current password');
      return;
    }
    if (newPassword.length < 6) {
      setPassError('New password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match');
      return;
    }

    setPassLoading(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      showToast('Admin password changed successfully! Your account is secure.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPassError(err.message || 'Failed to change password. Please verify your current password.');
    } finally {
      setPassLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateSettings(form);
      showToast('Store settings & WhatsApp templates saved successfully!');
      onRefresh();
    } catch {
      showToast('Failed to save store settings');
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setForm(prev => ({ ...prev, logoUrl: ev.target!.result as string }));
        showToast('Logo uploaded!');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            <Settings className="w-4 h-4" />
            <span>Store Configuration</span>
          </div>
          <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white mt-1">
            Business Information & WhatsApp Control
          </h3>
          <p className="text-xs text-slate-500 max-w-md">
            Update store name, phone lines, custom logo, theme styling, and WhatsApp automated inquiry messages.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="py-2.5 px-5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save All Settings</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Brand & Logo */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white pb-2 border-b">
            Store Identity & Brand Logo
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Business Name</label>
              <input
                type="text"
                value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Custom Logo (Replaces Default Icon)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.logoUrl || ''}
                  onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                  placeholder="Logo URL or upload"
                  className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border"
                />
                <label className="py-2 px-3 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 cursor-pointer flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload</span>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
              </div>
              {form.logoUrl && (
                <div className="flex items-center gap-2 mt-2">
                  <img src={form.logoUrl} alt="Logo preview" className="h-8 max-w-[120px] object-contain border p-1 rounded" />
                  <button type="button" onClick={() => setForm({ ...form, logoUrl: '' })} className="text-xs text-rose-500 hover:underline">
                    Remove custom logo (revert to default)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: WhatsApp Control & Templates */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
              WhatsApp Integration & Message Automation
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Primary WhatsApp Number</label>
              <input
                type="text"
                value={form.whatsappNumber}
                onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border font-mono"
              />
            </div>

            <div className="flex flex-col justify-end gap-2 text-xs font-semibold">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.whatsappFloatingEnabled}
                  onChange={(e) => setForm({ ...form, whatsappFloatingEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600"
                />
                <span>Floating WhatsApp Button on Website</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.whatsappProductButtonEnabled}
                  onChange={(e) => setForm({ ...form, whatsappProductButtonEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600"
                />
                <span>"Order on WhatsApp" Button on Products</span>
              </label>
            </div>
          </div>

          {/* WhatsApp Message Template */}
          <div className="space-y-1 pt-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Custom WhatsApp Message Template
            </label>
            <textarea
              rows={3}
              value={form.whatsappTemplate}
              onChange={(e) => setForm({ ...form, whatsappTemplate: e.target.value })}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border font-mono"
            />
            <p className="text-[11px] text-slate-400">
              Supported tokens: <code className="text-blue-500 font-bold">{'{product_name}'}</code>, <code className="text-blue-500 font-bold">{'{price}'}</code>, <code className="text-blue-500 font-bold">{'{category}'}</code>
            </p>
          </div>
        </div>

        {/* Section 3: Phone contacts & Shop address */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Phone className="w-4 h-4 text-blue-600" />
            <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
              Direct Contact Lines & Hassan Abdal Location
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Phone 1 Name & Number</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.phone1Name}
                  onChange={(e) => setForm({ ...form, phone1Name: e.target.value })}
                  className="w-1/3 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border"
                />
                <input
                  type="text"
                  value={form.phone1}
                  onChange={(e) => setForm({ ...form, phone1: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Phone 2 Name & Number</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.phone2Name}
                  onChange={(e) => setForm({ ...form, phone2Name: e.target.value })}
                  className="w-1/3 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border"
                />
                <input
                  type="text"
                  value={form.phone2}
                  onChange={(e) => setForm({ ...form, phone2: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border font-mono"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Physical Store Address</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Store Timings Notice</label>
              <input
                type="text"
                value={form.businessHours}
                onChange={(e) => setForm({ ...form, businessHours: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Store Email</label>
              <input
                type="text"
                value={form.email || ''}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">About Store Text</label>
            <textarea
              rows={3}
              value={form.aboutText}
              onChange={(e) => setForm({ ...form, aboutText: e.target.value })}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border"
            />
          </div>
        </div>

        {/* Section 4: Theme Preset */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Palette className="w-4 h-4 text-purple-600" />
            <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
              Appearance Theme Preset
            </h4>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'ocean-blue', name: 'Ocean Blue (Default)', desc: 'Electric blue & deep navy' },
              { id: 'midnight-tech', name: 'Midnight Tech', desc: 'Dark titanium & sapphire' },
              { id: 'modern-electric', name: 'Modern Electric', desc: 'High-contrast cyan & cobalt' },
              { id: 'clean-premium', name: 'Clean Premium', desc: 'Minimalist Apple-inspired' },
            ].map((theme) => (
              <div
                key={theme.id}
                onClick={() => setForm({ ...form, themePreset: theme.id as ThemePreset })}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  form.themePreset === theme.id
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="font-bold text-xs text-slate-900 dark:text-white">{theme.name}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{theme.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="py-3 px-6 rounded-2xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-md cursor-pointer"
          >
            Save All Settings
          </button>
        </div>
      </form>

      {/* Section 5: Owner Password & Security Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
          <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <div>
            <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
              Owner Security & Change Password
            </h4>
            <p className="text-xs text-slate-500">
              Set your private password. No hints are shown anywhere on the website for safety.
            </p>
          </div>
        </div>

        {passError && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
            {passError}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                  className="w-full px-3 py-2 pr-9 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showCurrentPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">New Password (min 6)</label>
              <div className="relative">
                <input
                  type={showNewPass ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new secret password"
                  required
                  className="w-full px-3 py-2 pr-9 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                required
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={passLoading}
            className="py-2.5 px-5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{passLoading ? 'Updating...' : 'Update Owner Password'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

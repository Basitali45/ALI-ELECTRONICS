import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  Upload, 
  MessageCircle, 
  Phone, 
  MapPin, 
  Palette, 
  KeyRound, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck,
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink
} from 'lucide-react';
import { StoreSettings, ThemePreset } from '../../types';
import { api } from '../../services/api';
import { 
  getSupabaseConfig, 
  saveSupabaseConfig, 
  testSupabaseConnection 
} from '../../lib/supabase';

interface StoreSettingsManagerProps {
  settings: StoreSettings;
  onRefresh: () => void;
  showToast: (msg: string) => void;
}

export function StoreSettingsManager({ settings, onRefresh, showToast }: StoreSettingsManagerProps) {
  const [form, setForm] = useState<StoreSettings>({
    ...settings,
    businessName: 'ZAPLIX'
  });

  // Supabase Configuration State
  const initialSb = getSupabaseConfig();
  const [sbUrl, setSbUrl] = useState(initialSb.url);
  const [sbKey, setSbKey] = useState(initialSb.key);
  const [sbTesting, setSbTesting] = useState(false);
  const [sbStatus, setSbStatus] = useState<{ checked: boolean; success: boolean; message: string }>({
    checked: false,
    success: false,
    message: ''
  });

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passError, setPassError] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => {
    // Quick test on mount
    testConnection();
  }, []);

  const testConnection = async () => {
    setSbTesting(true);
    const res = await testSupabaseConnection();
    setSbStatus({
      checked: true,
      success: res.success,
      message: res.message
    });
    setSbTesting(false);
  };

  const handleSaveSupabaseConfig = async () => {
    saveSupabaseConfig(sbUrl, sbKey);
    showToast('Supabase credentials saved!');
    await testConnection();
    onRefresh();
  };

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
      await api.updateStoreSettings(form);
      showToast('Store settings & WhatsApp templates saved successfully!');
      onRefresh();
    } catch (err: any) {
      showToast(err?.message || 'Failed to save store settings');
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
      
      {/* ================= 1. SUPABASE CLOUD DATABASE CONNECTION PANEL ================= */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-base text-slate-900 dark:text-white">
                Supabase Cloud Database & Storage
              </h3>
              <p className="text-xs text-slate-500">
                Permanent PostgreSQL database for Products, Categories, Orders and Product Images
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
              sbStatus.success 
                ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300' 
                : 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300'
            }`}>
              {sbStatus.success ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
              {sbStatus.success ? 'Supabase Connected' : 'Local Fallback Mode'}
            </span>

            <button
              onClick={testConnection}
              disabled={sbTesting}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            >
              {sbTesting ? 'Checking...' : 'Test Connection'}
            </button>
          </div>
        </div>

        {sbStatus.message && (
          <div className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
            sbStatus.success 
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800'
          }`}>
            <span className="font-medium">{sbStatus.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Supabase Project URL
            </label>
            <input
              type="text"
              placeholder="https://xyzproject.supabase.co"
              value={sbUrl}
              onChange={(e) => setSbUrl(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Supabase Anon / Public Key
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={sbKey}
              onChange={(e) => setSbKey(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleSaveSupabaseConfig}
            className="py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors cursor-pointer"
          >
            Save Supabase Credentials
          </button>

          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <span>SQL Schema file created:</span>
            <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-blue-600 dark:text-cyan-400">
              /supabase/schema.sql
            </code>
          </div>
        </div>
      </div>

      {/* ================= 2. STORE HEADER & GENERAL SETTINGS ================= */}
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
              Customer Care Contacts & Location
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Customer Service Phone 1</label>
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
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Customer Service Phone 2</label>
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

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  Tag, 
  Layers, 
  Image as ImageIcon, 
  Settings, 
  MessageSquare, 
  Inbox, 
  KeyRound, 
  LogOut, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  RefreshCw, 
  Check, 
  X, 
  Menu, 
  ArrowLeft 
} from 'lucide-react';
import { 
  Product, 
  Category, 
  Offer, 
  HomepageConfig, 
  StoreSettings, 
  MediaItem, 
  Inquiry, 
  ContactMessage, 
  AdminStats 
} from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DashboardOverview } from './components/DashboardOverview';
import { ProductsManager } from './components/ProductsManager';
import { CategoriesManager } from './components/CategoriesManager';
import { OffersManager } from './components/OffersManager';
import { HomepageCustomizer } from './components/HomepageCustomizer';
import { MediaLibrary } from './components/MediaLibrary';
import { StoreSettingsManager } from './components/StoreSettingsManager';
import { OrdersManager } from './components/OrdersManager';

interface AdminDashboardProps {
  initialSettings: StoreSettings;
  onClose: () => void;
  onRefreshData: () => void;
}

export type AdminTab = 
  | 'overview' 
  | 'orders'
  | 'products' 
  | 'categories' 
  | 'offers' 
  | 'homepage' 
  | 'media' 
  | 'settings' 
  | 'inquiries' 
  | 'messages' 
  | 'security';

export function AdminDashboard({ initialSettings, onClose, onRefreshData }: AdminDashboardProps) {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Data states
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [homepage, setHomepage] = useState<HomepageConfig | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(initialSettings);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [
        statsRes,
        prodsRes,
        catsRes,
        offersRes,
        homeRes,
        mediaRes,
        settRes,
        inqsRes,
        msgsRes
      ] = await Promise.all([
        api.getAdminStats().catch(() => null),
        api.getProducts().catch(() => []),
        api.getCategories().catch(() => []),
        api.getOffers(true).catch(() => []),
        api.getHomepage().catch(() => null),
        api.getMedia().catch(() => []),
        api.getSettings().catch(() => initialSettings),
        api.getInquiries().catch(() => []),
        api.getContactMessages().catch(() => [])
      ]);

      if (statsRes) setStats(statsRes);
      setProducts(prodsRes);
      setCategories(catsRes);
      setOffers(offersRes);
      if (homeRes) setHomepage(homeRes);
      setMedia(mediaRes);
      setSettings(settRes);
      setInquiries(inqsRes);
      setMessages(msgsRes);
    } catch {
      showToast('Error syncing dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    try {
      await api.changePassword(currentPassword, newPassword);
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Admin password changed!');
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password');
    }
  };

  const handleInquiryStatus = async (id: string, status: string) => {
    try {
      await api.updateInquiryStatus(id, status);
      setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: status as any } : i));
      showToast('Status updated');
    } catch {
      showToast('Error updating status');
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    try {
      await api.deleteInquiry(id);
      setInquiries(prev => prev.filter(i => i.id !== id));
      showToast('Inquiry deleted');
    } catch {
      showToast('Error deleting inquiry');
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      await api.deleteContactMessage(id);
      setMessages(prev => prev.filter(m => m.id !== id));
      showToast('Message deleted');
    } catch {
      showToast('Error deleting message');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-60 px-4 py-3 rounded-2xl bg-slate-900 text-white border border-blue-500 shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Admin Screen */}
      <div className="w-full h-full bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row overflow-hidden">
        
        {/* Sidebar */}
        <aside
          className={`w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-20 transition-all duration-300 ${
            mobileSidebarOpen ? 'fixed inset-y-0 left-0 shadow-2xl' : 'hidden md:flex'
          }`}
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                Z
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white">
                  Zyvara
                </h3>
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 block">
                  Control Center
                </span>
              </div>
            </div>
            <button onClick={() => setMobileSidebarOpen(false)} className="md:hidden p-1 text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
            <button
              onClick={() => { setActiveTab('overview'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer ${
                activeTab === 'overview' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard Overview</span>
            </button>

            <button
              onClick={() => { setActiveTab('orders'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer ${
                activeTab === 'orders' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Inbox className="w-4 h-4" />
                <span>Orders & Invoices</span>
              </div>
              {stats?.pendingOrders ? (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                  {stats.pendingOrders}
                </span>
              ) : null}
            </button>

            <button
              onClick={() => { setActiveTab('products'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer ${
                activeTab === 'products' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4" />
                <span>Products Manager</span>
              </div>
              <span className="font-mono text-[11px] opacity-80">{products.length}</span>
            </button>

            <button
              onClick={() => { setActiveTab('categories'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer ${
                activeTab === 'categories' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <FolderTree className="w-4 h-4" />
                <span>Category Manager</span>
              </div>
              <span className="font-mono text-[11px] opacity-80">{categories.length}</span>
            </button>

            <button
              onClick={() => { setActiveTab('offers'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer ${
                activeTab === 'offers' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Tag className="w-4 h-4" />
                <span>Offers & Promotions</span>
              </div>
              <span className="font-mono text-[11px] opacity-80">{offers.length}</span>
            </button>

            <button
              onClick={() => { setActiveTab('homepage'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer ${
                activeTab === 'homepage' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Homepage Customizer</span>
            </button>

            <button
              onClick={() => { setActiveTab('media'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer ${
                activeTab === 'media' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <ImageIcon className="w-4 h-4" />
                <span>Media Library</span>
              </div>
              <span className="font-mono text-[11px] opacity-80">{media.length}</span>
            </button>

            <button
              onClick={() => { setActiveTab('settings'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer ${
                activeTab === 'settings' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Store & WhatsApp Info</span>
            </button>

            <button
              onClick={() => { setActiveTab('inquiries'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer ${
                activeTab === 'inquiries' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Orders</span>
              </div>
              {inquiries.filter(i => i.status === 'New').length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-500 text-white">
                  {inquiries.filter(i => i.status === 'New').length}
                </span>
              )}
            </button>

            <button
              onClick={() => { setActiveTab('messages'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer ${
                activeTab === 'messages' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Inbox className="w-4 h-4" />
                <span>Contact Messages</span>
              </div>
              {messages.length > 0 && (
                <span className="font-mono text-[11px] opacity-80">{messages.length}</span>
              )}
            </button>

            <button
              onClick={() => { setActiveTab('security'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer ${
                activeTab === 'security' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>Change Password</span>
            </button>
          </nav>

          {/* Bottom */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <button
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Preview Customer Store</span>
            </button>

            <button
              onClick={() => { logout(); onClose(); }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out Admin</span>
            </button>
          </div>
        </aside>

        {/* Content pane */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-950">
          {/* Header */}
          <header className="h-16 px-4 sm:px-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileSidebarOpen(true)} className="md:hidden p-2 text-slate-600">
                <Menu className="w-5 h-5" />
              </button>
              <h2 className="font-heading font-extrabold text-base sm:text-lg text-slate-900 dark:text-white capitalize">
                {activeTab === 'overview' && 'Control Center Dashboard'}
                {activeTab === 'orders' && 'Customer Orders & Invoices (Supabase)'}
                {activeTab === 'products' && 'Products Manager (No-Code)'}
                {activeTab === 'categories' && 'Categories Department Manager'}
                {activeTab === 'offers' && 'Offers & Promotion Banners'}
                {activeTab === 'homepage' && 'Homepage Visual Customizer'}
                {activeTab === 'media' && 'Media Library'}
                {activeTab === 'settings' && 'Business Information & WhatsApp'}
                {activeTab === 'inquiries' && 'WhatsApp Orders Log'}
                {activeTab === 'messages' && 'Customer Inquiries & Messages'}
                {activeTab === 'security' && 'Admin Password & Security'}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadAllData}
                disabled={loading}
                title="Sync database"
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview Store</span>
              </button>
            </div>
          </header>

          {/* Active Tab View */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
            {activeTab === 'overview' && (
              <DashboardOverview
                stats={stats}
                products={products}
                onNavigateTab={(t) => setActiveTab(t)}
                onOpenAddProduct={() => setActiveTab('products')}
                onOpenAddCategory={() => setActiveTab('categories')}
                onOpenCreateOffer={() => setActiveTab('offers')}
              />
            )}

            {activeTab === 'orders' && (
              <OrdersManager
                settings={settings}
                showToast={showToast}
              />
            )}

            {activeTab === 'products' && (
              <ProductsManager
                products={products}
                categories={categories}
                onRefresh={() => { loadAllData(); onRefreshData(); }}
                showToast={showToast}
              />
            )}

            {activeTab === 'categories' && (
              <CategoriesManager
                categories={categories}
                products={products}
                onRefresh={() => { loadAllData(); onRefreshData(); }}
                showToast={showToast}
              />
            )}

            {activeTab === 'offers' && (
              <OffersManager
                offers={offers}
                products={products}
                onRefresh={() => { loadAllData(); onRefreshData(); }}
                showToast={showToast}
              />
            )}

            {activeTab === 'homepage' && homepage && (
              <HomepageCustomizer
                homepage={homepage}
                onRefresh={() => { loadAllData(); onRefreshData(); }}
                showToast={showToast}
              />
            )}

            {activeTab === 'media' && (
              <MediaLibrary
                media={media}
                onRefresh={() => { loadAllData(); onRefreshData(); }}
                showToast={showToast}
              />
            )}

            {activeTab === 'settings' && (
              <StoreSettingsManager
                settings={settings}
                onRefresh={() => { loadAllData(); onRefreshData(); }}
                showToast={showToast}
              />
            )}

            {activeTab === 'inquiries' && (
              <div className="space-y-4">
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                  Customer WhatsApp Order Logs ({inquiries.length})
                </h3>
                <div className="space-y-3">
                  {inquiries.map((inq) => (
                    <div key={inq.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-900 dark:text-white">{inq.productName}</span>
                        <div className="flex items-center gap-2">
                          <select
                            value={inq.status}
                            onChange={(e) => handleInquiryStatus(inq.id, e.target.value)}
                            className="px-2 py-1 rounded text-xs border bg-slate-50 dark:bg-slate-800"
                          >
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Completed">Completed</option>
                          </select>
                          <button onClick={() => handleDeleteInquiry(inq.id)} className="text-rose-500">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500">
                        Price: Rs. {inq.price.toLocaleString()} · Qty: {inq.quantity} · From: {inq.customerName} {inq.customerPhone ? `(${inq.customerPhone})` : ''}
                      </p>
                      {inq.message && <p className="text-xs bg-slate-50 dark:bg-slate-800 p-2 rounded italic">"{inq.message}"</p>}
                    </div>
                  ))}
                  {inquiries.length === 0 && <p className="text-xs text-slate-400 py-6 text-center">No inquiries logged yet.</p>}
                </div>
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="space-y-4">
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                  Contact Form Inquiries ({messages.length})
                </h3>
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold">{msg.name} ({msg.phone})</span>
                        <button onClick={() => handleDeleteMessage(msg.id)} className="text-rose-500">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">{msg.message}</p>
                    </div>
                  ))}
                  {messages.length === 0 && <p className="text-xs text-slate-400 py-6 text-center">No messages yet.</p>}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="max-w-md p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                      Owner Password & Security
                    </h4>
                    <p className="text-xs text-slate-500">
                      Set your personal password. Password hints are never displayed publicly.
                    </p>
                  </div>
                </div>

                {passwordSuccess && (
                  <div className="p-3 text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                    Password updated successfully! Your account is secure.
                  </div>
                )}
                {passwordError && (
                  <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl">
                    {passwordError}
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
                  <div>
                    <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPass ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        required
                        className="w-full px-3 py-2 pr-9 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                      New Password (minimum 6 characters)
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Create strong new password"
                        required
                        className="w-full px-3 py-2 pr-9 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      required
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl mt-2 cursor-pointer shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Save & Update Password</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

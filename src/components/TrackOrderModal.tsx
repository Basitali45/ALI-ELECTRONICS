import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Search,
  Clock,
  CheckCircle2,
  Truck,
  PackageCheck,
  AlertCircle,
  MapPin,
  Phone,
  User,
  ShoppingBag,
  RotateCcw,
  Check,
  XCircle,
} from 'lucide-react';
import { Order, OrderStatus, StoreSettings } from '../types';
import { api } from '../services/api';
import { OFFICIAL_WHATSAPP_NUMBER, getWhatsAppUrl } from '../lib/policy';
import { WhatsAppIcon } from './WhatsAppIcon';

export interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderId?: string;
  initialOrder?: Order | null;
  language?: 'en' | 'ur';
  settings?: StoreSettings;
}

type TimelineStageKey = 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered';

interface TimelineStageConfig {
  key: TimelineStageKey;
  labelEn: string;
  labelUr: string;
  descEn: string;
  descUr: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TIMELINE_STAGES: TimelineStageConfig[] = [
  {
    key: 'Pending',
    labelEn: 'Pending',
    labelUr: 'زیرِ التواء',
    descEn: 'Order received & awaiting verification',
    descUr: 'آرڈر موصول ہو گیا ہے',
    icon: Clock,
  },
  {
    key: 'Confirmed',
    labelEn: 'Confirmed',
    labelUr: 'کنفرم شدہ',
    descEn: 'Order verified & being packed',
    descUr: 'آرڈر کی تصدیق اور پیکنگ جاری ہے',
    icon: CheckCircle2,
  },
  {
    key: 'Shipped',
    labelEn: 'Shipped',
    labelUr: 'روانہ',
    descEn: 'Dispatched with courier partner',
    descUr: 'پارسل کوریئر کے حوالے کر دیا گیا',
    icon: Truck,
  },
  {
    key: 'Delivered',
    labelEn: 'Delivered',
    labelUr: 'ڈیلیور ہو گیا',
    descEn: 'Parcel delivered at doorstep',
    descUr: 'پارسل کامیابی سے پہنچا دیا گیا',
    icon: PackageCheck,
  },
];

function normalizeOrderNumber(raw: string): string {
  const cleaned = raw.trim().toUpperCase().replace(/^#/, '');
  const zxMatch = cleaned.match(/^ZX[-\s]?(\d{3,6})$/);
  if (zxMatch) return `ZX-${zxMatch[1]}`;
  return cleaned;
}

function getStageIndex(status: OrderStatus): number {
  switch (status) {
    case 'Pending':
      return 0;
    case 'Confirmed':
    case 'Processing':
      return 1;
    case 'Shipped':
      return 2;
    case 'Delivered':
      return 3;
    case 'Cancelled':
      return -1;
    default:
      return 0;
  }
}

function loadMergedOrdersFallback(): Order[] {
  try {
    const raw = localStorage.getItem('zaplix_orders') || localStorage.getItem('zyvara_orders');
    if (raw) {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch {
    // ignore storage errors
  }
  return [];
}

export function TrackOrderModal({
  isOpen,
  onClose,
  initialOrderId,
  initialOrder,
  language = 'en',
  settings,
}: TrackOrderModalProps) {
  const [query, setQuery] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchedQuery, setSearchedQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uiLang, setUiLang] = useState<'en' | 'ur'>(language);

  useEffect(() => {
    setUiLang(language);
  }, [language]);

  const fetchAllOrders = useCallback(async (): Promise<Order[]> => {
    const localOrders = loadMergedOrdersFallback();
    try {
      const remoteOrders = await api.getOrders();
      const byOrderNo = new Map<string, Order>();
      for (const ord of remoteOrders) {
        if (ord?.orderNumber) {
          byOrderNo.set(ord.orderNumber.toUpperCase(), ord);
        }
      }
      for (const ord of localOrders) {
        if (ord?.orderNumber && !byOrderNo.has(ord.orderNumber.toUpperCase())) {
          byOrderNo.set(ord.orderNumber.toUpperCase(), ord);
        }
      }
      return Array.from(byOrderNo.values()).sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    } catch {
      return localOrders;
    }
  }, []);

  const performLookup = useCallback(
    async (rawInput: string, presetOrder?: Order | null) => {
      const trimmed = rawInput.trim();
      if (!trimmed && !presetOrder) {
        setErrorMsg(
          uiLang === 'ur'
            ? 'براہِ کرم اپنا آرڈر آئی ڈی (مثلاً ZX-1234) یا فون نمبر درج کریں۔'
            : 'Please enter your Order ID (e.g. ZX-1234) or phone number.'
        );
        return;
      }

      setLoading(true);
      setErrorMsg(null);
      setSearchedQuery(trimmed || presetOrder?.orderNumber || '');

      try {
        const allOrders = await fetchAllOrders();
        setRecentOrders(allOrders.slice(0, 3));

        const normalizedQuery = normalizeOrderNumber(trimmed || presetOrder?.orderNumber || '');
        const digitsQuery = (trimmed || '').replace(/[^0-9]/g, '');

        const match =
          allOrders.find((o) => {
            const ordNo = (o.orderNumber || '').toUpperCase();
            if (ordNo === normalizedQuery) return true;
            if (digitsQuery.length >= 7) {
              const phoneDigits = (o.customerPhone || '').replace(/[^0-9]/g, '');
              const waDigits = (o.customerWhatsapp || '').replace(/[^0-9]/g, '');
              return (
                (phoneDigits && phoneDigits.endsWith(digitsQuery.slice(-9))) ||
                (waDigits && waDigits.endsWith(digitsQuery.slice(-9)))
              );
            }
            return false;
          }) || presetOrder || null;

        if (match) {
          setTrackedOrder(match);
          setErrorMsg(null);
        } else {
          setTrackedOrder(null);
          setErrorMsg(
            uiLang === 'ur'
              ? `آرڈر "${normalizedQuery || trimmed}" ہمارے ریکارڈ میں نہیں ملا۔ براہِ کرم اپنا آرڈر آئی ڈی چیک کریں۔`
              : `No order matching "${normalizedQuery || trimmed}" was found. Please verify your Order ID and try again.`
          );
        }
      } catch {
        if (presetOrder) {
          setTrackedOrder(presetOrder);
          setErrorMsg(null);
        } else {
          setTrackedOrder(null);
          setErrorMsg(
            uiLang === 'ur'
              ? 'آرڈر کی معلومات لوڈ کرنے میں مسئلہ پیش آیا۔ دوبارہ کوشش کریں۔'
              : 'Unable to load order details right now. Please try again.'
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [fetchAllOrders, uiLang]
  );

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);

    if (initialOrder) {
      setQuery(initialOrder.orderNumber);
      setTrackedOrder(initialOrder);
      setSearchedQuery(initialOrder.orderNumber);
      setErrorMsg(null);
      void performLookup(initialOrder.orderNumber, initialOrder);
    } else if (initialOrderId) {
      setQuery(initialOrderId);
      void performLookup(initialOrderId, null);
    } else {
      setTrackedOrder(null);
      setErrorMsg(null);
      setSearchedQuery('');
      setQuery('');
      void fetchAllOrders().then((list) => setRecentOrders(list.slice(0, 3)));
    }

    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, initialOrderId, initialOrder, onClose, performLookup, fetchAllOrders]);

  if (!isOpen) return null;

  const isUr = uiLang === 'ur';
  const activeIndex = trackedOrder ? getStageIndex(trackedOrder.status) : -1;
  const isCancelled = trackedOrder?.status === 'Cancelled';
  const phone = settings?.phone1 || OFFICIAL_WHATSAPP_NUMBER;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void performLookup(query);
  };

  const formatDate = (iso?: string) => {
    if (!iso) return isUr ? 'حالیہ' : 'Recent';
    try {
      return new Date(iso).toLocaleDateString('en-PK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isUr ? 'حالیہ' : 'Recent';
    }
  };

  const progressPercentage =
    activeIndex <= 0 ? 0 : activeIndex === 1 ? 33.33 : activeIndex === 2 ? 66.66 : 100;

  return (
    <div
      className="fixed inset-0 z-[99999] overflow-y-auto bg-slate-950/75 backdrop-blur-sm p-3 sm:p-6 flex items-center justify-center animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="track-order-modal-title"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div
        dir={isUr ? 'rtl' : 'ltr'}
        className="relative w-full max-w-2xl bg-white dark:bg-[#0c1424] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-slate-100 z-10 my-auto"
      >
        {/* Header */}
        <div className="bg-slate-950 text-white px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 id="track-order-modal-title" className="font-heading font-bold text-lg sm:text-xl tracking-tight text-white">
              {isUr ? 'اپنا آرڈر ٹریک کریں' : 'Track Your Order'}
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              {isUr
                ? 'اپنے پارسل کی لائیو صورتحال اور ٹائم لائن دیکھیں'
                : 'Live milestone timeline from confirmation to doorstep delivery'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setUiLang(isUr ? 'en' : 'ur')}
              className="px-3 py-1.5 min-h-[40px] rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-amber-300 border border-white/15 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              aria-label={isUr ? 'Switch to English' : 'اردو میں دیکھیں'}
            >
              {isUr ? 'EN' : 'اردو'}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label={isUr ? 'بند کریں' : 'Close Track Order modal'}
              className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          {/* Search Form */}
          <form onSubmit={handleSubmit} className="space-y-2.5">
            <label
              htmlFor="track-order-input"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              {isUr
                ? 'آرڈر آئی ڈی (مثلاً ZX-1234) یا فون نمبر درج کریں'
                : 'Order ID (e.g. ZX-1234) or Registered Phone Number'}
            </label>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search
                  className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${
                    isUr ? 'right-3.5' : 'left-3.5'
                  }`}
                />
                <input
                  id="track-order-input"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={isUr ? 'مثلاً ZX-1234 یا 03001234567' : 'e.g. ZX-1234 or 03001234567'}
                  className={`w-full min-h-[44px] py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-mono tabular-nums text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                    isUr ? 'pr-10 pl-3.5' : 'pl-10 pr-3.5'
                  }`}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Search className="w-4 h-4" />
                <span>{loading ? (isUr ? 'تلاش جاری ہے…' : 'Tracking…') : isUr ? 'ٹریک کریں' : 'Track Order'}</span>
              </button>
            </div>
          </form>

          {/* Error / Not Found State */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/70 text-rose-800 dark:text-rose-200 text-xs sm:text-sm space-y-2.5">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed font-medium">{errorMsg}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href={getWhatsAppUrl(
                    `Hello Zaplix Support, please check the status of my order: ${searchedQuery || query}`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  <WhatsAppIcon className="w-4 h-4 fill-current" />
                  <span>
                    {isUr
                      ? `واٹس ایپ ہیلپ لائن پر رابطہ کریں (${phone})`
                      : `Verify via WhatsApp Helpline (${phone})`}
                  </span>
                </a>
              </div>
            </div>
          )}

          {/* Visual Timeline Result */}
          {trackedOrder && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Top Order Identity Strip (unboxed clean metadata separators) */}
              <div className="pb-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {isUr ? 'آرڈر نمبر' : 'Order Reference'}
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white tracking-tight">
                    #{trackedOrder.orderNumber}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-300 tabular-nums">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    Rs. {Number(trackedOrder.totalAmount || 0).toLocaleString()}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{formatDate(trackedOrder.createdAt)}</span>
                  <span aria-hidden="true">·</span>
                  <span>{isUr ? 'کیش آن ڈیلیوری' : trackedOrder.paymentMethod || 'Cash on Delivery'}</span>
                </div>
              </div>

              {/* Cancelled Banner OR 4-Stage Visual Timeline */}
              {isCancelled ? (
                <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/35 border border-rose-200 dark:border-rose-800/70 flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                      {isUr ? 'یہ آرڈر منسوخ کر دیا گیا ہے (Cancelled)' : 'Order Cancelled'}
                    </h3>
                    <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
                      {isUr
                        ? `اگر آپ کو اس منسوخی کے بارے میں کوئی سوال ہے تو ہمارے واٹس ایپ نمبر ${phone} پر رابطہ کریں۔`
                        : `If you did not request this cancellation or need assistance, please contact our helpline at ${phone}.`}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3" aria-label="Order delivery progress timeline">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {isUr ? 'آرڈر ٹریکنگ ٹائم لائن' : 'Shipment Progress'}
                    </span>
                    <span className="font-semibold text-blue-600 dark:text-cyan-400">
                      {trackedOrder.status === 'Processing'
                        ? isUr
                          ? 'مرحلہ: کنفرم شدہ (پیکنگ جاری)'
                          : 'Current Stage: Confirmed (Packing)'
                        : isUr
                          ? `موجودہ اسٹیٹس: ${
                              TIMELINE_STAGES[activeIndex]?.labelUr || trackedOrder.status
                            }`
                          : `Current Stage: ${
                              TIMELINE_STAGES[activeIndex]?.labelEn || trackedOrder.status
                            }`}
                    </span>
                  </div>

                  {/* Desktop / Tablet Horizontal Stepper */}
                  <div className="hidden sm:block pt-3 pb-1">
                    <div className="relative">
                      {/* Background Track */}
                      <div
                        className="absolute top-5 left-[12.5%] right-[12.5%] h-1 bg-slate-200 dark:bg-slate-800 rounded-full"
                        aria-hidden="true"
                      />
                      {/* Filled Progress Track */}
                      <div
                        className={`absolute top-5 h-1 bg-blue-600 dark:bg-cyan-500 rounded-full transition-all duration-300 ${
                          isUr ? 'right-[12.5%]' : 'left-[12.5%]'
                        }`}
                        style={{
                          width: `calc(${progressPercentage}% * 0.75)`,
                        }}
                        aria-hidden="true"
                      />

                      <ol className="relative grid grid-cols-4 gap-3">
                        {TIMELINE_STAGES.map((stage, idx) => {
                          const Icon = stage.icon;
                          const isCompleted = idx < activeIndex || (idx === 3 && activeIndex === 3);
                          const isCurrent = idx === activeIndex && idx < 3;
                          const isReached = idx <= activeIndex;

                          return (
                            <li
                              key={stage.key}
                              aria-current={isCurrent || (idx === 3 && activeIndex === 3) ? 'step' : undefined}
                              className="flex flex-col items-center text-center"
                            >
                              <div
                                className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                                  isCompleted
                                    ? 'bg-emerald-600 border-emerald-600 text-white'
                                    : isCurrent
                                      ? 'bg-blue-600 border-blue-600 text-white ring-4 ring-blue-500/20 dark:ring-cyan-400/25'
                                      : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                                }`}
                              >
                                {isCompleted && idx < activeIndex ? (
                                  <Check className="w-5 h-5 stroke-[2.5]" />
                                ) : (
                                  <Icon className="w-5 h-5" />
                                )}
                              </div>

                              <div className="mt-3 space-y-1 px-1">
                                <div
                                  className={`text-xs font-bold ${
                                    isReached
                                      ? 'text-slate-900 dark:text-white'
                                      : 'text-slate-400 dark:text-slate-500'
                                  }`}
                                >
                                  {isUr ? stage.labelUr : stage.labelEn}
                                </div>
                                <p
                                  className={`text-[11px] leading-snug ${
                                    isReached
                                      ? 'text-slate-600 dark:text-slate-300'
                                      : 'text-slate-400 dark:text-slate-600'
                                  }`}
                                >
                                  {isUr ? stage.descUr : stage.descEn}
                                </p>
                              </div>
                            </li>
                          );
                        })}
                      </ol>
                    </div>
                  </div>

                  {/* Mobile Vertical Timeline */}
                  <ol className="sm:hidden space-y-0 pt-1">
                    {TIMELINE_STAGES.map((stage, idx) => {
                      const Icon = stage.icon;
                      const isCompleted = idx < activeIndex || (idx === 3 && activeIndex === 3);
                      const isCurrent = idx === activeIndex && idx < 3;
                      const isReached = idx <= activeIndex;
                      const isLast = idx === TIMELINE_STAGES.length - 1;

                      return (
                        <li
                          key={stage.key}
                          aria-current={isCurrent || (idx === 3 && activeIndex === 3) ? 'step' : undefined}
                          className="relative flex items-start gap-3.5 pb-5 last:pb-0"
                        >
                          {!isLast && (
                            <span
                              className={`absolute top-9 w-0.5 bottom-0 ${
                                isUr ? 'right-[17px]' : 'left-[17px]'
                              } ${
                                idx < activeIndex
                                  ? 'bg-emerald-500 dark:bg-emerald-500'
                                  : 'bg-slate-200 dark:bg-slate-800'
                              }`}
                              aria-hidden="true"
                            />
                          )}

                          <div
                            className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center border-2 shrink-0 ${
                              isCompleted
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : isCurrent
                                  ? 'bg-blue-600 border-blue-600 text-white ring-4 ring-blue-500/20'
                                  : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-400'
                            }`}
                          >
                            {isCompleted && idx < activeIndex ? (
                              <Check className="w-4 h-4 stroke-[2.5]" />
                            ) : (
                              <Icon className="w-4 h-4" />
                            )}
                          </div>

                          <div className="pt-0.5 min-w-0">
                            <div
                              className={`text-sm font-bold ${
                                isReached ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'
                              }`}
                            >
                              {isUr ? stage.labelUr : stage.labelEn}
                              {isCurrent && (
                                <span className="mx-2 text-[11px] font-semibold text-blue-600 dark:text-cyan-400">
                                  · {isUr ? 'موجودہ مرحلہ' : 'In Progress'}
                                </span>
                              )}
                            </div>
                            <p
                              className={`text-xs mt-0.5 ${
                                isReached ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400 dark:text-slate-600'
                              }`}
                            >
                              {isUr ? stage.descUr : stage.descEn}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}

              {/* Order Recipient & Delivery Summary */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2">
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {isUr ? 'کسٹمر اور ڈیلیوری پتہ' : 'Recipient & Delivery Address'}
                  </div>
                  <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {trackedOrder.customerName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono tabular-nums">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{trackedOrder.customerPhone}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">
                        {[trackedOrder.customerAddress, trackedOrder.city].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ordered Items List */}
                <div className="space-y-2">
                  <div className="font-semibold text-slate-900 dark:text-white flex items-center justify-between">
                    <span>{isUr ? 'آرڈر کی گئی اشیاء' : 'Items Ordered'}</span>
                    <span className="text-slate-500 dark:text-slate-400 font-normal tabular-nums">
                      {trackedOrder.items?.length || 0} {isUr ? 'آئٹمز' : 'item(s)'}
                    </span>
                  </div>
                  {trackedOrder.items && trackedOrder.items.length > 0 ? (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {trackedOrder.items.slice(0, 4).map((item, idx) => (
                        <div key={item.id || idx} className="py-1.5 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-medium text-slate-800 dark:text-slate-200 truncate">
                              {item.productName}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                              Qty: {item.quantity}
                            </div>
                          </div>
                          <span className="font-semibold text-slate-900 dark:text-white font-mono tabular-nums shrink-0">
                            Rs. {Number(item.subtotal || item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 py-1">
                      <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                      <span>{isUr ? 'آرڈر کی تفصیلات محفوظ ہیں' : 'Order summary recorded'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => void performLookup(trackedOrder.orderNumber, trackedOrder)}
                  className="px-4 py-2 min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isUr ? 'اسٹیٹس تازہ کریں' : 'Refresh Status'}</span>
                </button>

                <a
                  href={getWhatsAppUrl(
                    `Hello Zaplix Support, I checked Order #${trackedOrder.orderNumber} (${trackedOrder.status}) and have a question.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 min-h-[40px] rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                >
                  <WhatsAppIcon className="w-4 h-4 fill-white" />
                  <span>{isUr ? 'واٹس ایپ سپورٹ' : 'WhatsApp Help'}</span>
                </a>
              </div>
            </div>
          )}

          {/* Empty / Initial Guidance + Recent Browser Orders */}
          {!trackedOrder && !errorMsg && !loading && (
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              {recentOrders.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isUr ? 'حالیہ آرڈرز' : 'Recent Orders on This Device'}
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                    {recentOrders.map((ord) => (
                      <button
                        key={ord.id || ord.orderNumber}
                        type="button"
                        onClick={() => {
                          setQuery(ord.orderNumber);
                          void performLookup(ord.orderNumber, ord);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center justify-between gap-3 cursor-pointer"
                      >
                        <div className="min-w-0">
                          <div className="font-mono font-bold text-sm text-slate-900 dark:text-white tabular-nums">
                            #{ord.orderNumber}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {ord.customerName} · {formatDate(ord.createdAt)} · Rs.{' '}
                            {Number(ord.totalAmount || 0).toLocaleString()}
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-blue-600 dark:text-cyan-400 whitespace-nowrap shrink-0">
                          {ord.status}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {isUr
                    ? 'اپنی آرڈر رسید پر موجود آرڈر آئی ڈی (مثلاً ZX-1234) اوپر درج کر کے Pending، Confirmed، Shipped اور Delivered کے تمام مراحل دیکھیں۔'
                    : 'Enter the Order ID from your checkout confirmation receipt (for example: ZX-1234) to view your live Pending, Confirmed, Shipped, and Delivered timeline.'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TrackOrderModal;

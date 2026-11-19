import React, { useEffect, useState, useRef } from 'react';
import { Headset, Sparkles, X, MessageSquare, Phone, ShieldCheck } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { StoreSettings } from '../types';
import { 
  getWhatsAppUrl, 
  OFFICIAL_LOGO_IMAGE, 
  OFFICIAL_WHATSAPP_NUMBER 
} from '../lib/policy';

interface FloatingWhatsAppProps {
  settings: StoreSettings;
  onOpenSupportModal?: () => void;
}

function findVoicePilotHost(): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  const divs = Array.from(document.querySelectorAll('body > div'));
  for (const div of divs) {
    if (
      div.shadowRoot &&
      (div.shadowRoot.querySelector('.launcher') ||
        div.shadowRoot.querySelector('#launch') ||
        div.shadowRoot.querySelector('.panel') ||
        div.shadowRoot.querySelector('.fab'))
    ) {
      return div as HTMLElement;
    }
  }
  return null;
}

function splitIntoRuleLines(raw: string): string[] {
  if (!raw) return [];

  // Protect common abbreviations from accidental sentence splitting
  const protectedText = raw
    .replace(/\b(Rs|Mr|Mrs|Ms|Dr|No|St|vs|etc|e\.g|i\.e)\./gi, '$1__DOT__')
    .replace(/(\d)\.(\d)/g, '$1__DOT__$2');

  // Normalize explicit inline bullets / numbered items onto new lines
  const normalized = protectedText
    .replace(/\r\n/g, '\n')
    .replace(/\s+(?=\d+[.)]\s+)/g, '\n')
    .replace(/\s+(?=[•▪▸‣⁃]\s+)/g, '\n')
    .replace(/\s+-\s+(?=[A-Za-z\u0600-\u06FF0-9])/g, '\n');

  const blocks = normalized.split(/\n+/);
  const lines: string[] = [];

  for (const block of blocks) {
    const trimmedBlock = block.trim();
    if (!trimmedBlock) continue;

    // Split into individual sentences (Urdu ۔ or English . ! ?)
    const parts = trimmedBlock.split(/(?<=[\u06D4.!?])\s+/);
    for (const part of parts) {
      const restored = part
        .replace(/__DOT__/g, '.')
        .replace(/^(?:[•●▪▸‣⁃\-*]+|\d+[.)])\s+/, '')
        .trim();
      if (restored) {
        lines.push(restored);
      }
    }
  }

  return lines;
}

type WidgetLang = 'ur' | 'en';

function getActiveWidgetLang(shadowRoot: ShadowRoot | null | undefined): WidgetLang {
  if (!shadowRoot) return 'ur';
  const langBtn = shadowRoot.getElementById('lang');
  const label = (langBtn?.textContent || '').trim().toUpperCase();
  if (label === 'EN' || label === 'ENG' || label === 'ENGLISH') {
    return 'en';
  }
  return 'ur';
}

function formatOrderStatusForLang(status: string, lang: WidgetLang): string {
  if (lang === 'en') return status;
  const s = status.trim().toLowerCase();
  if (s === 'pending') return 'زیرِ التواء';
  if (s === 'confirmed') return 'کنفرم شدہ';
  if (s === 'processing') return 'پیکنگ جاری ہے';
  if (s === 'shipped' || s === 'dispatched') return 'روانہ کر دیا گیا';
  if (s === 'delivered') return 'ڈیلیور ہو چکا';
  if (s === 'cancelled') return 'منسوخ';
  return status;
}

function getZaplixReplyForMode(
  userQuery: string,
  botText: string,
  targetLang: WidgetLang
): string[] | null {
  const q = (userQuery || '').toLowerCase();
  const isUr = targetLang === 'ur';
  const isErrorReply = /not allowed|something went wrong|connection problem|could not|error/i.test(botText);

  if (/return|ریٹرن|واپس|exchange|refund|بدل/.test(q)) {
    return isUr
      ? [
          'زیپلیکس پر تمام آرڈرز کے لیے 7 دن کی آسان ریٹرن اور تبدیلی پالیسی موجود ہے۔',
          'اگر آپ کو خراب، ٹوٹا ہوا یا غلط پروڈکٹ موصول ہو تو 7 دن کے اندر واپس یا تبدیل کروا سکتے ہیں۔',
          'واپسی کے لیے پروڈکٹ غیر استعمال شدہ اور اپنی اصل پیکنگ میں ہونا ضروری ہے۔',
          `ریٹرن کی درخواست کے لیے ہمارے آفیشل واٹس ایپ یا ہیلپ لائن ${OFFICIAL_WHATSAPP_NUMBER} پر رابطہ کریں۔`,
        ]
      : [
          'ZAPLIX offers a hassle-free 7-day Return & Replacement Policy on all orders.',
          'You can request a return or replacement within 7 days if you receive a damaged, defective, or incorrect item.',
          'Returned products must be unused and kept in their original condition and packaging.',
          `To initiate a return, message our WhatsApp support desk or call ${OFFICIAL_WHATSAPP_NUMBER}.`,
        ];
  }

  if (/delivery|ڈیلیوری|shipping|شپنگ|چارجز|courier/.test(q)) {
    return isUr
      ? [
          'زیپلیکس پورے پاکستان میں تمام آرڈرز پر 100 فیصد مفت ہوم ڈیلیوری فراہم کرتا ہے۔',
          'تمام آرڈرز پر کیش آن ڈیلیوری کی سہولت دستیاب ہے، پارسل ملنے پر ادائیگی کریں۔',
          'بڑے شہروں جیسے لاہور، کراچی، اسلام آباد اور راولپنڈی میں ڈیلیوری 2 سے 4 کاروباری دنوں میں ہوتی ہے۔',
          'دیگر شہروں اور علاقوں میں پارسل 3 سے 6 کاروباری دنوں میں پہنچا دیا جاتا ہے۔',
        ]
      : [
          'ZAPLIX provides 100% Free Home Delivery nationwide across Pakistan with Rs. 0 shipping fees.',
          'Cash on Delivery (COD) is available on every order — pay conveniently at your doorstep.',
          'Major cities (Lahore, Karachi, Islamabad, Rawalpindi) receive orders within 2–4 working days.',
          'Other cities and regions across Pakistan typically receive delivery within 3–6 working days.',
        ];
  }

  if (/track|آرڈر|order|status|parcel|کہاں/.test(q)) {
    return isUr
      ? [
          'آپ کی آرڈر ٹریکنگ ٹائم لائن کھول دی گئی ہے — وہاں اپنا آرڈر آئی ڈی (مثلاً ZX-1234) یا فون نمبر درج کریں۔',
          'ٹائم لائن میں آپ کو Pending، Confirmed، Shipped اور Delivered کے تمام مراحل واضح نظر آئیں گے۔',
        ]
      : [
          'Your visual Track Order timeline is ready — enter your Order ID (e.g. ZX-1234) or phone number to view live progress.',
          'You will see your order stages across Pending, Confirmed, Shipped, and Delivered.',
        ];
  }

  if (/complaint|شکایت|issue|problem|مسئلہ|damaged|wrong/.test(q)) {
    return isUr
      ? [
          'زیپلیکس کسٹمر کیئر آپ کی شکایت کو اولین ترجیح پر حل کرنے کے لیے موجود ہے۔',
          'براہِ کرم اپنی شکایت کی تفصیل، آرڈر نمبر اور اگر ممکن ہو تو پروڈکٹ کی تصویر شیئر کریں۔',
          `فوری حل کے لیے ہمارے آفیشل واٹس ایپ یا ہیلپ لائن ${OFFICIAL_WHATSAPP_NUMBER} پر رابطہ کریں۔`,
          'ہماری ٹیم 24 گھنٹوں کے اندر آپ کے مسئلے کا جائزہ لے کر مکمل تعاون فراہم کرے گی۔',
        ]
      : [
          'ZAPLIX Customer Care handles all complaints on top priority.',
          'Please share your Order ID, mobile number, and brief details of the issue you experienced.',
          `You can also escalate directly on our WhatsApp helpline at ${OFFICIAL_WHATSAPP_NUMBER} with parcel photos.`,
          'Our support team will review your case and resolve it promptly within 24 hours.',
        ];
  }

  if (/thank|thanks|shukriya|شکریہ|جزاک/.test(q)) {
    return isUr
      ? [
          'بہت شکریہ! زیپلیکس پر خریداری کرنے کے لیے ہم آپ کے شکر گزار ہیں۔',
          'اگر آپ کو کسی بھی آرڈر، ڈیلیوری یا پروڈکٹ کے بارے میں مزید مدد درکار ہو تو بلا جھجھک پوچھیں۔',
        ]
      : [
          'Thank you for choosing ZAPLIX! We truly appreciate your trust.',
          'Feel free to ask anytime if you need help with an order, delivery, returns, or any product.',
        ];
  }

  if (!isErrorReply) {
    return null;
  }

  if (/\b(hi|hello|hey|salam|assalam|assalamualaikum)\b|السلام|ہیلو|سلام/.test(q)) {
    return isUr
      ? [
          'وعلیکم السلام! زیپلیکس کسٹمر سپورٹ میں خوش آمدید۔',
          'میں آپ کے آرڈر کو ٹریک کرنے، مفت ہوم ڈیلیوری، ریٹرن پالیسی اور پروڈکٹس کے بارے میں آپ کی مکمل رہنمائی کر سکتا ہوں۔',
          'براہِ کرم بتائیں آج میں آپ کی کیا مدد کر سکتا ہوں؟',
        ]
      : [
          'Hello! Welcome to ZAPLIX Customer Support.',
          'I can help you track an order (e.g. ZX-1234), explain our Free Home Delivery and 7-day Return Policy, or answer product questions.',
          'How can I assist you today?',
        ];
  }

  if (/product|products|item|items|shop|price|rate|catalog|پروڈکٹ|قیمت|سامان|خرید/.test(q)) {
    try {
      const rawProducts = localStorage.getItem('zaplix_products') || localStorage.getItem('zyvara_products');
      if (rawProducts) {
        const list = JSON.parse(rawProducts) as { name?: string; price?: number; category?: string }[];
        const top = list.filter((p) => p.name && typeof p.price === 'number').slice(0, 4);
        if (top.length > 0) {
          if (isUr) {
            return [
              'زیپلیکس کے چند مقبول اور بہترین پروڈکٹس یہ ہیں:',
              ...top.map((p) => `${p.name} — قیمت ${Number(p.price).toLocaleString()} روپے (مفت ہوم ڈیلیوری)`),
              'تمام آرڈرز پر کیش آن ڈیلیوری کی سہولت پورے پاکستان میں دستیاب ہے۔',
            ];
          }
          return [
            'Here are some popular products currently available on ZAPLIX:',
            ...top.map((p) => `${p.name} — Rs. ${Number(p.price).toLocaleString()} (Free Home Delivery)`),
            'Cash on Delivery (COD) is available nationwide across Pakistan.',
          ];
        }
      }
    } catch {
      // ignore storage errors
    }
    return isUr
      ? [
          'زیپلیکس پر فیشن، الیکٹرانکس، بیوٹی، بیگز اور ہوم ڈیکور کی بہترین مصنوعات دستیاب ہیں۔',
          'تمام پروڈکٹس پر پورے پاکستان میں 100 فیصد مفت ہوم ڈیلیوری اور کیش آن ڈیلیوری کی سہولت موجود ہے۔',
          'کسی خاص پروڈکٹ کے بارے میں جاننے کے لیے اس کا نام لکھیں یا اسٹور کیٹلاگ دیکھیں۔',
        ]
      : [
          'ZAPLIX offers curated collections across Fashion, Bags, Accessories, Beauty, Home Decor, and Electronics.',
          'Every product includes 100% Free Home Delivery and Cash on Delivery across Pakistan.',
          'Tell me the item name you are looking for or browse our store catalogue to order right away.',
        ];
  }

  if (/\b(cod|cash|payment|pay|پیمنٹ|کیش|ادائیگی)\b/.test(q)) {
    return isUr
      ? [
          'زیپلیکس پر کیش آن ڈیلیوری کی سہولت پورے پاکستان میں دستیاب ہے۔',
          'آپ اپنا پارسل موصول ہونے پر اپنے دروازے پر ادائیگی کر سکتے ہیں۔',
          'تمام آرڈرز پر ہوم ڈیلیوری بالکل مفت ہے۔',
        ]
      : [
          'ZAPLIX supports convenient Cash on Delivery (COD) nationwide across Pakistan.',
          'You pay directly at your doorstep when your parcel arrives.',
          'Home delivery is 100% Free (Rs. 0) on every order.',
        ];
  }

  if (/\b(whatsapp|contact|number|phone|call|helpline|رابطہ|نمبر|واٹس ایپ)\b/.test(q)) {
    return isUr
      ? [
          `زیپلیکس آفیشل واٹس ایپ اور ہیلپ لائن نمبر ${OFFICIAL_WHATSAPP_NUMBER} ہے۔`,
          'ہماری سپورٹ ٹیم روزانہ صبح 9 بجے سے رات 11 بجے تک دستیاب ہے۔',
          'آپ کسی بھی وقت آرڈر، ریٹرن یا پروڈکٹ کے متعلق معلومات حاصل کر سکتے ہیں۔',
        ]
      : [
          `You can reach ZAPLIX Official WhatsApp & Helpline at ${OFFICIAL_WHATSAPP_NUMBER}.`,
          'Our customer support team is available daily from 9:00 AM to 11:00 PM.',
          'Feel free to contact us anytime for order help, returns, or product questions.',
        ];
  }

  return isUr
    ? [
        'خوش آمدید! زیپلیکس کسٹمر سپورٹ آپ کی خدمت کے لیے حاضر ہے۔',
        'آپ یہاں اپنا آرڈر آئی ڈی لکھ کر آرڈر ٹریک کر سکتے ہیں یا ڈیلیوری، ریٹرن، پروڈکٹس اور شکایت کے بارے میں پوچھ سکتے ہیں۔',
        `فوری براہِ راست مدد کے لیے ہمارے واٹس ایپ نمبر ${OFFICIAL_WHATSAPP_NUMBER} پر رابطہ کریں۔`,
      ]
    : [
        'Welcome to ZAPLIX Customer Support! We are here to help you.',
        'You can enter your Order ID (e.g. ZX-1234) to track your order, or ask about Delivery, Returns, Products, COD, or Complaints.',
        `For direct live assistance, message our official WhatsApp helpline at ${OFFICIAL_WHATSAPP_NUMBER}.`,
      ];
}

const URDU_0_TO_99: string[] = [
  'صفر', 'ایک', 'دو', 'تین', 'چار', 'پانچ', 'چھ', 'سات', 'آٹھ', 'نو',
  'دس', 'گیارہ', 'بارہ', 'تیرہ', 'چودہ', 'پندرہ', 'سولہ', 'سترہ', 'اٹھارہ', 'انیس',
  'بیس', 'اکیس', 'بائیس', 'تئیس', 'چوبیس', 'پچیس', 'چھبیس', 'ستائیس', 'اٹھائیس', 'انتیس',
  'تیس', 'اکتیس', 'بتیس', 'تینتیس', 'چونتیس', 'پینتیس', 'چھتیس', 'سینتیس', 'اڑتیس', 'انتالیس',
  'چالیس', 'اکتالیس', 'بیالیس', 'تینتالیس', 'چوالیس', 'پینتالیس', 'چھیالیس', 'سینتالیس', 'اڑتالیس', 'انچاس',
  'پچاس', 'اکاون', 'باون', 'ترپن', 'چون', 'پچپن', 'چھپن', 'ستاون', 'اٹھاون', 'انسٹھ',
  'ساٹھ', 'اکسٹھ', 'باسٹھ', 'ترسٹھ', 'چونسٹھ', 'پینسٹھ', 'چھیاسٹھ', 'سڑسٹھ', 'اڑسٹھ', 'انہتر',
  'ستر', 'اکہتر', 'بہتر', 'تہتر', 'چوہتر', 'پچہتر', 'چھہتر', 'ستتر', 'اٹھتر', 'اناسی',
  'اسی', 'اکیاسی', 'بیاسی', 'تراسی', 'چوراسی', 'پچاسی', 'چھیاسی', 'ستاسی', 'اٹھاسی', 'نوے',
  'اکانوے', 'بانوے', 'ترانوے', 'چورانوے', 'پچانوے', 'چھیانوے', 'ستانوے', 'اٹھانوے', 'ننانوے',
];

function numberToUrduWords(num: number): string {
  const n = Math.floor(Math.abs(num));
  if (!Number.isFinite(n) || n > 999999999) return String(num);
  if (n < 100) return URDU_0_TO_99[n];

  const parts: string[] = [];
  let rem = n;

  const crore = Math.floor(rem / 10000000);
  if (crore > 0) {
    parts.push(`${numberToUrduWords(crore)} کروڑ`);
    rem %= 10000000;
  }

  const lakh = Math.floor(rem / 100000);
  if (lakh > 0) {
    parts.push(`${numberToUrduWords(lakh)} لاکھ`);
    rem %= 100000;
  }

  const thousand = Math.floor(rem / 1000);
  if (thousand > 0) {
    parts.push(`${numberToUrduWords(thousand)} ہزار`);
    rem %= 1000;
  }

  const hundred = Math.floor(rem / 100);
  if (hundred > 0) {
    parts.push(`${URDU_0_TO_99[hundred]} سو`);
    rem %= 100;
  }

  if (rem > 0) {
    parts.push(URDU_0_TO_99[rem]);
  }

  return parts.join(' ');
}

function cleanTextForSpeech(text: string, targetLang?: WidgetLang): string {
  let out = text
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/[•▪▸‣⁃]/g, '');

  // Strip thousands commas (e.g. 1,000 -> 1000) and trailing .00 decimals so TTS never misreads 1,000 as 1.000 (1 rupee 0 paisa)
  out = out.replace(/(\d),(?=\d{3}\b)/g, '$1').replace(/(\d)\.00\b/g, '$1');

  if (targetLang === 'ur') {
    out = out
      .replace(/\bZAPLIX\b/gi, 'زیپلیکس')
      .replace(/\(\s*[A-Za-z0-9\s/-]+\s*\)/g, '')
      .replace(/\bCash on Delivery\b/gi, 'کیش آن ڈیلیوری')
      .replace(/\bFree Home Delivery\b/gi, 'مفت ہوم ڈیلیوری')
      .replace(/(?:Rs\.?|روپے)\s*(\d+)/gi, (_m, d) => `${numberToUrduWords(Number(d))} روپے`)
      .replace(/(\d+)\s*(?:Rs\.?|روپے)/gi, (_m, d) => `${numberToUrduWords(Number(d))} روپے`)
      .replace(/(\d+)\s*%/g, (_m, d) => `${numberToUrduWords(Number(d))} فیصد`)
      .replace(/(\d+)\s*فیصد/g, (_m, d) => `${numberToUrduWords(Number(d))} فیصد`)
      .replace(/\bRs\.?\s*/gi, 'روپے ')
      // Convert standalone non-phone numbers (1-6 digits not starting with 0) to clean Urdu words
      .replace(/(^|[^\d+\-A-Za-z])([1-9]\d{0,5})(?![\dA-Za-z])/g, (m, pre, d) => {
        const val = Number(d);
        return val <= 999999 ? `${pre}${numberToUrduWords(val)}` : m;
      });
  } else {
    out = out
      .replace(/\bZAPLIX\b/g, 'Zaplix')
      .replace(/\bRs\.?\s*(\d+)/gi, (_m, d) => `${d} rupees`)
      .replace(/(\d+)\s*Rs\.?/gi, (_m, d) => `${d} rupees`);
  }

  return out.replace(/\s+/g, ' ').trim();
}

function countScriptChars(text: string) {
  const urduCount = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const englishCount = (text.match(/[A-Za-z]/g) || []).length;
  return { urduCount, englishCount };
}

function isDominantlyUrdu(text: string): boolean {
  const { urduCount, englishCount } = countScriptChars(text);
  if (urduCount === 0) return false;
  if (englishCount === 0) return true;
  return urduCount >= englishCount * 0.4 || urduCount > 25;
}

interface SpeechChunk {
  lang: 'ur' | 'en';
  text: string;
}

function splitLongChunk(text: string, maxLen = 175): string[] {
  const clean = text.trim();
  if (!clean) return [];
  if (clean.length <= maxLen) return [clean];

  const out: string[] = [];
  let remaining = clean;

  while (remaining.length > maxLen) {
    const slice = remaining.slice(0, maxLen);
    let breakIdx = Math.max(
      slice.lastIndexOf('۔'),
      slice.lastIndexOf('. '),
      slice.lastIndexOf('! '),
      slice.lastIndexOf('? '),
      slice.lastIndexOf('،'),
      slice.lastIndexOf(', ')
    );
    if (breakIdx < Math.floor(maxLen * 0.4)) {
      breakIdx = slice.lastIndexOf(' ');
    }
    if (breakIdx <= 0) {
      breakIdx = maxLen;
    } else {
      breakIdx += 1;
    }

    const part = remaining.slice(0, breakIdx).trim();
    if (part) out.push(part);
    remaining = remaining.slice(breakIdx).trim();
  }

  if (remaining) out.push(remaining);
  return out;
}

function buildLanguageSpeechChunks(rawText: string, forcedLang?: WidgetLang): SpeechChunk[] {
  const cleaned = cleanTextForSpeech(rawText, forcedLang);
  if (!cleaned) return [];

  const sentences = splitIntoRuleLines(cleaned);
  const rawSegments = sentences.length > 0 ? sentences : [cleaned];

  // Use the active header mode (EN / اردو) when specified so voice strictly matches selected mode
  const merged: SpeechChunk[] = [];
  for (const seg of rawSegments) {
    const lang: 'ur' | 'en' = forcedLang || (isDominantlyUrdu(seg) ? 'ur' : 'en');
    const last = merged[merged.length - 1];
    if (last && last.lang === lang && last.text.length + 1 + seg.length <= 175) {
      last.text = `${last.text} ${seg}`.trim();
    } else {
      merged.push({ lang, text: seg });
    }
  }

  const finalChunks: SpeechChunk[] = [];
  for (const item of merged) {
    for (const sub of splitLongChunk(item.text, 175)) {
      finalChunks.push({ lang: item.lang, text: sub });
    }
  }
  return finalChunks;
}

let activeTtsAudio: HTMLAudioElement | null = null;
let activeAudioResolver: ((result: 'ok' | 'blocked' | 'error') => void) | null = null;
let sharedTtsAudio: HTMLAudioElement | null = null;
let sharedTtsUnlocked = false;
let sharedAudioCtx: AudioContext | null = null;
let activeBufferSource: AudioBufferSourceNode | null = null;
let ttsSessionToken = 0;
let allowZaplixWebSpeech = false;

const SILENT_WAV_DATA_URI =
  'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

function unlockTtsPlayback(withSilentPrime = false) {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      if (!sharedAudioCtx) {
        sharedAudioCtx = new AudioCtx();
      }
      if (sharedAudioCtx.state === 'suspended') {
        void sharedAudioCtx.resume();
      }
    }
    if (!sharedTtsAudio) {
      sharedTtsAudio = new Audio();
      sharedTtsAudio.preload = 'auto';
    }
    // Only prime with silent WAV on non-bubble interactions so we never interrupt direct TTS playback
    if (withSilentPrime && !sharedTtsUnlocked && !activeTtsAudio) {
      sharedTtsUnlocked = true;
      sharedTtsAudio.src = SILENT_WAV_DATA_URI;
      void sharedTtsAudio.play().catch(() => {
        sharedTtsUnlocked = false;
      });
    }
  } catch {
    // ignore unlock issues
  }
}

function stopAllBotSpeech(shadowRoot?: ShadowRoot | null) {
  ttsSessionToken += 1;

  if (activeBufferSource) {
    try {
      activeBufferSource.onended = null;
      activeBufferSource.stop();
      activeBufferSource.disconnect();
    } catch {
      // ignore
    }
    activeBufferSource = null;
  }

  if (activeTtsAudio) {
    try {
      activeTtsAudio.onended = null;
      activeTtsAudio.onerror = null;
      activeTtsAudio.pause();
      activeTtsAudio.currentTime = 0;
    } catch {
      // ignore
    }
    activeTtsAudio = null;
  }

  if (activeAudioResolver) {
    const r = activeAudioResolver;
    activeAudioResolver = null;
    r('ok');
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }

  if (shadowRoot) {
    const activeLang = getActiveWidgetLang(shadowRoot);
    shadowRoot.querySelectorAll('.bot .b.vp-speaking').forEach((el) => {
      el.classList.remove('vp-speaking');
      const hint = el.querySelector('.vp-listen-tag');
      if (hint) {
        const bubbleLang = (el as HTMLElement).dataset.speakLang as WidgetLang | undefined;
        const isUr = (bubbleLang || activeLang) === 'ur';
        hint.textContent = isUr ? '🔊 آواز میں سنیں' : '🔊 Tap to listen';
      }
    });
  }
}

function speakChunkViaWebSpeech(chunk: SpeechChunk, token: number): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || token !== ttsSessionToken) {
      resolve();
      return;
    }

    const voices = window.speechSynthesis.getVoices();
    const urduVoice = voices.find((v) => v.lang.toLowerCase().startsWith('ur'));

    // Never speak Urdu text using an English fallback voice if no Urdu voice is installed
    if (chunk.lang === 'ur' && voices.length > 0 && !urduVoice) {
      resolve();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(chunk.text);
    utterance.lang = chunk.lang === 'ur' ? 'ur-PK' : 'en-US';
    utterance.rate = 0.96;
    utterance.pitch = 1;

    if (voices.length > 0) {
      const preferredVoice =
        chunk.lang === 'ur'
          ? urduVoice
          : voices.find((v) => v.lang.toLowerCase() === 'en-pk') ||
            voices.find((v) => v.lang.toLowerCase().startsWith('en-gb')) ||
            voices.find((v) => v.lang.toLowerCase().startsWith('en-us')) ||
            voices.find((v) => v.lang.toLowerCase().startsWith('en'));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
    }

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    (window as unknown as { __vpCurrentUtterance?: SpeechSynthesisUtterance }).__vpCurrentUtterance = utterance;
    allowZaplixWebSpeech = true;
    try {
      window.speechSynthesis.speak(utterance);
    } finally {
      allowZaplixWebSpeech = false;
    }
  });
}

function playViaHtmlAudioSync(url: string, token: number): Promise<'ok' | 'blocked' | 'error'> {
  return new Promise((resolve) => {
    if (token !== ttsSessionToken) {
      resolve('ok');
      return;
    }

    const audio = sharedTtsAudio || new Audio();
    sharedTtsAudio = audio;
    activeTtsAudio = audio;

    let settled = false;
    const finish = (result: 'ok' | 'blocked' | 'error') => {
      if (settled) return;
      settled = true;
      audio.onended = null;
      audio.onerror = null;
      if (activeAudioResolver === finish) {
        activeAudioResolver = null;
      }
      if (activeTtsAudio === audio) {
        activeTtsAudio = null;
      }
      resolve(result);
    };

    activeAudioResolver = finish;
    audio.onended = () => finish('ok');
    audio.onerror = () => finish('error');
    audio.src = url;

    // Called synchronously inside click call-stack so browser autoplay policy never blocks chunk playback
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise
        .then(() => {
          sharedTtsUnlocked = true;
        })
        .catch((err: unknown) => {
          const name = err instanceof Error ? err.name : '';
          finish(name === 'NotAllowedError' ? 'blocked' : 'error');
        });
    }
  });
}

async function playViaAudioContextFallback(url: string, token: number): Promise<boolean> {
  if (token !== ttsSessionToken) return true;
  try {
    unlockTtsPlayback(false);
    if (!sharedAudioCtx) return false;
    if (sharedAudioCtx.state === 'suspended') {
      await sharedAudioCtx.resume();
    }
    const res = await fetch(url);
    if (!res.ok || token !== ttsSessionToken) return false;
    const arrBuf = await res.arrayBuffer();
    if (token !== ttsSessionToken) return true;
    const decoded = await sharedAudioCtx.decodeAudioData(arrBuf);
    if (token !== ttsSessionToken) return true;

    return await new Promise<boolean>((resolve) => {
      if (!sharedAudioCtx || token !== ttsSessionToken) {
        resolve(true);
        return;
      }
      const src = sharedAudioCtx.createBufferSource();
      src.buffer = decoded;
      src.connect(sharedAudioCtx.destination);
      activeBufferSource = src;
      src.onended = () => {
        if (activeBufferSource === src) activeBufferSource = null;
        resolve(true);
      };
      src.start(0);
    });
  } catch {
    return false;
  }
}

async function speakChunkViaServerAudio(chunk: SpeechChunk, token: number): Promise<boolean> {
  if (token !== ttsSessionToken) return true;

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }

  const url = `/api/tts?lang=${chunk.lang}&text=${encodeURIComponent(chunk.text)}`;

  // Primary: Synchronous HTMLAudioElement.play() — preserves user click gesture immediately
  const htmlResult = await playViaHtmlAudioSync(url, token);
  if (htmlResult === 'ok') return true;
  if (token !== ttsSessionToken) return true;

  // Backup: Web Audio API decode (works after async fetches once AudioContext is resumed)
  return await playViaAudioContextFallback(url, token);
}

async function speakBotOutput(bubbleEl: HTMLElement, shadowRoot: ShadowRoot) {
  unlockTtsPlayback();
  const wasSpeakingThis = bubbleEl.classList.contains('vp-speaking');
  stopAllBotSpeech(shadowRoot);

  if (wasSpeakingThis) {
    return;
  }

  const activeLang = getActiveWidgetLang(shadowRoot);
  const rawSpeak = bubbleEl.dataset.speakText || bubbleEl.textContent || '';
  const chunks = buildLanguageSpeechChunks(rawSpeak, activeLang);
  if (chunks.length === 0) return;

  const isUrUI = activeLang === 'ur';
  const myToken = ttsSessionToken;

  bubbleEl.classList.add('vp-speaking');
  const listenTag = bubbleEl.querySelector('.vp-listen-tag');
  if (listenTag) {
    listenTag.textContent = isUrUI ? '🔊 سن رہے ہیں… (روکنے کے لیے کلک کریں)' : '🔊 Speaking… (tap to stop)';
  }

  for (const chunk of chunks) {
    if (myToken !== ttsSessionToken) break;

    const playedViaServer = await speakChunkViaServerAudio(chunk, myToken);
    if (!playedViaServer && myToken === ttsSessionToken) {
      await speakChunkViaWebSpeech(chunk, myToken);
    }
  }

  if (myToken === ttsSessionToken) {
    bubbleEl.classList.remove('vp-speaking');
    const tag = bubbleEl.querySelector('.vp-listen-tag');
    if (tag) {
      tag.textContent = isUrUI ? '🔊 آواز میں سنیں' : '🔊 Tap to listen';
    }
  }
}

function renderGreetingBubble(b: HTMLElement, targetLang: WidgetLang) {
  const greetingText =
    targetLang === 'ur'
      ? 'زیپلیکس میں خوش آمدید! میں آپ کی آرڈر ٹریکنگ، ریٹرن پالیسی، ڈیلیوری چارجز اور شکایت رجسٹریشن میں مدد کر سکتا ہوں۔ بتائیے آج میں آپ کی کیا مدد کر سکتا ہوں؟'
      : 'Welcome to ZAPLIX! I can help you with Order Tracking, Return Policy, Delivery Charges, and Complaint Registration. How can I assist you today?';

  b.dataset.speakText = greetingText;
  b.dataset.speakLang = targetLang;
  b.setAttribute('dir', targetLang === 'ur' ? 'rtl' : 'ltr');
  b.innerHTML = '';

  const textSpan = document.createElement('span');
  textSpan.className = 'vp-line-text';
  textSpan.textContent = greetingText;
  b.appendChild(textSpan);

  const listenTag = document.createElement('div');
  listenTag.className = 'vp-listen-tag';
  listenTag.textContent = targetLang === 'ur' ? '🔊 آواز میں سنیں' : '🔊 Tap to listen';
  b.appendChild(listenTag);
  b.setAttribute('title', targetLang === 'ur' ? 'آواز میں سننے کے لیے کلک کریں' : 'Click to hear in voice');
}

interface ComplaintSubmissionRecord {
  complaintId: string;
  name: string;
  phone: string;
  orderNumber?: string;
  details: string;
}

function getComplaintFormDraft(b: HTMLElement) {
  try {
    if (b.dataset.complaintDraft) {
      return JSON.parse(b.dataset.complaintDraft) as {
        name?: string;
        phone?: string;
        orderNumber?: string;
        details?: string;
      };
    }
  } catch {
    // ignore
  }
  return {};
}

function saveComplaintFormDraft(
  b: HTMLElement,
  patch: Partial<{ name: string; phone: string; orderNumber: string; details: string }>
) {
  const cur = getComplaintFormDraft(b);
  b.dataset.complaintDraft = JSON.stringify({ ...cur, ...patch });
}

function buildComplaintFormElement(
  b: HTMLElement,
  shadowRoot: ShadowRoot,
  targetLang: WidgetLang
): HTMLElement {
  const isUr = targetLang === 'ur';
  const draft = getComplaintFormDraft(b);

  const form = document.createElement('form');
  form.className = 'vp-complaint-form';
  form.setAttribute('dir', isUr ? 'rtl' : 'ltr');
  form.addEventListener('click', (e) => e.stopPropagation());

  const title = document.createElement('div');
  title.className = 'vp-cf-title';
  title.textContent = isUr ? '📝 شکایت رجسٹریشن فارم' : '📝 Register Your Complaint';
  form.appendChild(title);

  const makeInput = (
    key: 'name' | 'phone' | 'orderNumber',
    placeholderUr: string,
    placeholderEn: string,
    required: boolean,
    type = 'text'
  ) => {
    const inp = document.createElement('input');
    inp.type = type;
    inp.className = 'vp-cf-input';
    inp.required = required;
    inp.placeholder = isUr ? placeholderUr : placeholderEn;
    inp.value = draft[key] || '';
    inp.addEventListener('input', () => saveComplaintFormDraft(b, { [key]: inp.value }));
    inp.addEventListener('click', (e) => e.stopPropagation());
    return inp;
  };

  const nameInput = makeInput('name', 'آپ کا پورا نام *', 'Your Full Name *', true);
  const phoneInput = makeInput('phone', 'موبائل / واٹس ایپ نمبر *', 'Mobile / WhatsApp Number *', true, 'tel');
  const orderInput = makeInput('orderNumber', 'آرڈر آئی ڈی (اختیاری، مثلاً ZX-1234)', 'Order ID (Optional, e.g. ZX-1234)', false);

  const detailsInput = document.createElement('textarea');
  detailsInput.className = 'vp-cf-textarea';
  detailsInput.rows = 2;
  detailsInput.required = true;
  detailsInput.placeholder = isUr ? 'اپنی شکایت کی تفصیل لکھیں *' : 'Describe your complaint *';
  detailsInput.value = draft.details || '';
  detailsInput.addEventListener('input', () => saveComplaintFormDraft(b, { details: detailsInput.value }));
  detailsInput.addEventListener('click', (e) => e.stopPropagation());

  const errEl = document.createElement('div');
  errEl.className = 'vp-cf-err';
  errEl.style.display = 'none';

  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'vp-cf-submit';
  submitBtn.textContent = isUr ? 'شکایت درج کریں' : 'Submit Complaint';

  form.appendChild(nameInput);
  form.appendChild(phoneInput);
  form.appendChild(orderInput);
  form.appendChild(detailsInput);
  form.appendChild(errEl);
  form.appendChild(submitBtn);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const curLang = getActiveWidgetLang(shadowRoot);
    const urNow = curLang === 'ur';
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const orderNumber = orderInput.value.trim().toUpperCase();
    const details = detailsInput.value.trim();

    if (!name || !phone || !details) {
      errEl.textContent = urNow
        ? 'براہِ کرم نام، موبائل نمبر اور شکایت کی تفصیل درج کریں۔'
        : 'Please enter your name, phone number, and complaint details.';
      errEl.style.display = 'block';
      return;
    }

    errEl.style.display = 'none';
    submitBtn.disabled = true;
    submitBtn.textContent = urNow ? 'رجسٹر ہو رہی ہے…' : 'Registering…';

    let record: ComplaintSubmissionRecord = {
      complaintId: `CMP-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      phone,
      orderNumber: orderNumber || undefined,
      details,
    };

    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, orderNumber, details }),
      });
      if (res.ok) {
        const json = (await res.json()) as {
          complaintId?: string;
          name?: string;
          phone?: string;
          orderNumber?: string;
          details?: string;
        };
        if (json?.complaintId) {
          record = {
            complaintId: json.complaintId,
            name: json.name || name,
            phone: json.phone || phone,
            orderNumber: json.orderNumber || orderNumber || undefined,
            details: json.details || details,
          };
        }
      }
    } catch {
      // fallback to local persistence below
    }

    try {
      const existing = JSON.parse(localStorage.getItem('zaplix_complaints') || '[]') as ComplaintSubmissionRecord[];
      localStorage.setItem('zaplix_complaints', JSON.stringify([record, ...existing]));
    } catch {
      // ignore storage errors
    }

    b.dataset.complaintRecord = JSON.stringify(record);
    const activeNow = getActiveWidgetLang(shadowRoot);
    const spkBtn = shadowRoot.getElementById('spk');
    const spkOn = spkBtn?.getAttribute('aria-pressed') === 'true';

    renderSubmittedComplaintBubble(b, record, activeNow);
    if (spkOn) {
      speakBotOutput(b, shadowRoot);
    }
  });

  return form;
}

function renderSubmittedComplaintBubble(
  b: HTMLElement,
  record: ComplaintSubmissionRecord,
  targetLang: WidgetLang
) {
  const isUr = targetLang === 'ur';
  const lines = isUr
    ? [
        'آپ کی شکایت کامیابی کے ساتھ درج کر لی گئی ہے۔',
        `شکایت ٹکٹ نمبر: ${record.complaintId}`,
        `کسٹمر: ${record.name} (${record.phone})`,
        ...(record.orderNumber ? [`آرڈر آئی ڈی: ${record.orderNumber}`] : []),
        'زیپلیکس کسٹمر کیئر ٹیم 24 گھنٹوں کے اندر آپ سے رابطہ کر کے مسئلہ حل کرے گی۔',
      ]
    : [
        'Your complaint has been registered successfully.',
        `Complaint Ticket ID: ${record.complaintId}`,
        `Customer: ${record.name} (${record.phone})`,
        ...(record.orderNumber ? [`Order ID: ${record.orderNumber}`] : []),
        'Our ZAPLIX Customer Care team will contact you within 24 hours to resolve this.',
      ];

  renderBulletBubble(b, lines, lines.join('. '), targetLang);
}

function dispatchOpenTrackOrderModal(
  orderId?: string,
  order?: TrackedOrderRecord | null,
  lang?: WidgetLang
) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent('zaplix:open-track-order', {
      detail: { orderId, order: order || null, lang },
    })
  );
}

function buildTrackOrderActionElement(
  targetLang: WidgetLang,
  orderId?: string,
  order?: TrackedOrderRecord | null
): HTMLElement {
  const isUr = targetLang === 'ur';
  const wrap = document.createElement('div');
  wrap.className = 'vp-track-action';
  wrap.setAttribute('dir', isUr ? 'rtl' : 'ltr');
  wrap.addEventListener('click', (e) => e.stopPropagation());

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'vp-track-btn';
  if (orderId) {
    btn.textContent = isUr
      ? `آرڈر ٹریکنگ ٹائم لائن دیکھیں (${orderId})`
      : `View Track Order Timeline (${orderId})`;
  } else {
    btn.textContent = isUr ? 'ٹریک آرڈر ٹائم لائن کھولیں' : 'Open Track Order Timeline';
  }
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    dispatchOpenTrackOrderModal(orderId, order || null, targetLang);
  });

  wrap.appendChild(btn);
  return wrap;
}

function renderBulletBubble(
  b: HTMLElement,
  lines: string[],
  speakContent: string,
  targetLang: WidgetLang,
  complaintShadowRoot?: ShadowRoot,
  trackAction?: { orderId?: string; order?: TrackedOrderRecord | null }
) {
  b.dataset.speakText = speakContent;
  b.dataset.speakLang = targetLang;
  b.innerHTML = '';

  const listEl = document.createElement('div');
  listEl.className = 'vp-bullet-list';

  for (const line of lines) {
    const lineEl = document.createElement('div');
    lineEl.className = 'vp-bullet-line';
    lineEl.setAttribute('dir', targetLang === 'ur' ? 'rtl' : 'ltr');

    const dotEl = document.createElement('span');
    dotEl.className = 'vp-bullet';
    dotEl.setAttribute('aria-hidden', 'true');
    dotEl.textContent = '•';

    const textEl = document.createElement('span');
    textEl.className = 'vp-line-text';
    textEl.textContent = line;

    lineEl.appendChild(dotEl);
    lineEl.appendChild(textEl);
    listEl.appendChild(lineEl);
  }

  b.appendChild(listEl);

  if (complaintShadowRoot) {
    b.appendChild(buildComplaintFormElement(b, complaintShadowRoot, targetLang));
  }

  if (trackAction) {
    b.appendChild(buildTrackOrderActionElement(targetLang, trackAction.orderId, trackAction.order));
  }

  const isUrduOutput = targetLang === 'ur';
  const listenTag = document.createElement('div');
  listenTag.className = 'vp-listen-tag';
  listenTag.textContent = isUrduOutput ? '🔊 آواز میں سنیں' : '🔊 Tap to listen';
  b.appendChild(listenTag);
  b.setAttribute('title', isUrduOutput ? 'آواز میں سننے کے لیے کلک کریں' : 'Click to hear in voice');
}

interface TrackedOrderRecord {
  orderNumber?: string;
  customerName?: string;
  city?: string;
  status?: string;
  totalAmount?: number;
  createdAt?: string;
  items?: { productName?: string; quantity?: number }[];
}

async function lookupLocalOrder(orderNumberQuery: string): Promise<TrackedOrderRecord | null> {
  const normalized = orderNumberQuery.toUpperCase().replace(/^ZX\s*-?\s*/, 'ZX-');

  try {
    const res = await fetch('/api/orders');
    if (res.ok) {
      const list = (await res.json()) as TrackedOrderRecord[];
      const match = list.find((o) => o.orderNumber?.toUpperCase() === normalized);
      if (match) return match;
    }
  } catch {
    // ignore network errors and fallback to browser cache
  }

  try {
    const raw = localStorage.getItem('zaplix_orders') || localStorage.getItem('zyvara_orders');
    if (raw) {
      const localList = JSON.parse(raw) as TrackedOrderRecord[];
      const match = localList.find((o) => o.orderNumber?.toUpperCase() === normalized);
      if (match) return match;
    }
  } catch {
    // ignore storage errors
  }

  return null;
}

async function translateTextForMode(text: string, targetLang: WidgetLang): Promise<string> {
  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, to: targetLang }),
    });
    if (res.ok) {
      const data = (await res.json()) as { translatedText?: string };
      if (data?.translatedText?.trim()) {
        return data.translatedText.trim();
      }
    }
  } catch {
    // ignore translation errors and return original
  }
  return text;
}

async function renderBotBubbleInMode(
  b: HTMLElement,
  shadowRoot: ShadowRoot,
  rawSource: string,
  userText: string,
  isGreeting: boolean,
  targetLang: WidgetLang,
  autoSpeakIfPending: boolean
) {
  const renderToken = String((Number(b.dataset.renderToken || '0') || 0) + 1);
  b.dataset.renderToken = renderToken;

  const triggerAutoSpeak = () => {
    if (!autoSpeakIfPending || b.dataset.vpAutoSpoken === '1') return;
    if (b.dataset.renderToken !== renderToken) return;
    b.dataset.vpAutoSpoken = '1';
    speakBotOutput(b, shadowRoot);
  };

  if (isGreeting) {
    renderGreetingBubble(b, targetLang);
    return;
  }

  const orderIdMatch = userText.match(/\b(ZX[-\s]?\d{3,6})\b/i);
  if (orderIdMatch) {
    const normalized = orderIdMatch[1].toUpperCase().replace(/^ZX\s*-?\s*/, 'ZX-');
    const order = await lookupLocalOrder(normalized);
    if (b.dataset.renderToken !== renderToken) return;

    const statusLabel = order ? formatOrderStatusForLang(order.status || 'Pending', targetLang) : '';
    const promptLines = order
      ? targetLang === 'ur'
        ? [`آرڈر ${order.orderNumber} کی ٹریکنگ ٹائم لائن تیار ہے (موجودہ اسٹیٹس: ${statusLabel})۔`]
        : [`Visual tracking timeline opened for Order ${order.orderNumber} (${statusLabel}).`]
      : targetLang === 'ur'
        ? [`آرڈر ${normalized} کے لیے ٹریک آرڈر ٹائم لائن کھول دی گئی ہے تاکہ آپ اسٹیٹس چیک کر سکیں۔`]
        : [`Opened the Track Order timeline to check Order ${normalized}.`];

    renderBulletBubble(b, promptLines, promptLines.join('. '), targetLang, undefined, {
      orderId: order?.orderNumber || normalized,
      order: order || null,
    });

    if (b.dataset.trackModalAutoOpened !== '1') {
      b.dataset.trackModalAutoOpened = '1';
      dispatchOpenTrackOrderModal(order?.orderNumber || normalized, order || null, targetLang);
    }

    triggerAutoSpeak();
    return;
  }

  if (b.dataset.complaintRecord) {
    try {
      const rec = JSON.parse(b.dataset.complaintRecord) as ComplaintSubmissionRecord;
      renderSubmittedComplaintBubble(b, rec, targetLang);
      return;
    } catch {
      // continue if malformed
    }
  }

  const isComplaintQuery = /complaint|شکایت|issue|problem|مسئلہ|damaged|wrong|register/i.test(userText);
  const isTrackQuery = /track|آرڈر|order|status|parcel|کہاں/i.test(userText);
  const ruleOrFallbackLines = getZaplixReplyForMode(userText, rawSource, targetLang);
  if (ruleOrFallbackLines && ruleOrFallbackLines.length > 0) {
    renderBulletBubble(
      b,
      ruleOrFallbackLines,
      ruleOrFallbackLines.join('. '),
      targetLang,
      isComplaintQuery ? shadowRoot : undefined,
      isTrackQuery ? {} : undefined
    );
    if (isTrackQuery && b.dataset.trackModalAutoOpened !== '1') {
      b.dataset.trackModalAutoOpened = '1';
      dispatchOpenTrackOrderModal(undefined, null, targetLang);
    }
    triggerAutoSpeak();
    return;
  }

  // Genuine remote AI reply: translate cleanly whenever target language doesn't match reply script
  const strippedLatin = rawSource
    .replace(/\bZX[-\s]?\d{3,6}\b/gi, '')
    .replace(/\bRs\.?\b/gi, '')
    .replace(/\bZAPLIX\b/gi, '');
  const { urduCount } = countScriptChars(rawSource);
  const hasForeignEnglish = /[A-Za-z]{2,}/.test(strippedLatin);
  const needsUrduTranslation = targetLang === 'ur' && (urduCount === 0 || hasForeignEnglish);
  const needsEnglishTranslation = targetLang === 'en' && urduCount > 0;

  let displayText = rawSource;
  if (needsUrduTranslation || needsEnglishTranslation) {
    const cacheAttr = targetLang === 'ur' ? 'translatedUr' : 'translatedEn';
    const cached = b.dataset[cacheAttr];
    if (cached) {
      displayText = cached;
    } else {
      displayText = await translateTextForMode(rawSource, targetLang);
      if (b.dataset.renderToken !== renderToken) return;
      if (targetLang === 'ur') {
        displayText = displayText.replace(/\bZAPLIX\b/gi, 'زیپلیکس').replace(/\bRs\.?\s*/gi, 'روپے ');
      }
      b.dataset[cacheAttr] = displayText;
    }
  }

  const parsedLines = splitIntoRuleLines(displayText);
  if (parsedLines.length > 1) {
    renderBulletBubble(b, parsedLines, parsedLines.join('. '), targetLang);
  } else {
    renderBulletBubble(b, [displayText], displayText, targetLang);
  }
  triggerAutoSpeak();
}

const CHIP_QUERY_TRANSLATIONS: Record<string, { ur: string; en: string }> = {
  'میرا آرڈر کہاں ہے؟': { ur: 'میرا آرڈر کہاں ہے؟', en: 'Where is my order?' },
  'Where is my order?': { ur: 'میرا آرڈر کہاں ہے؟', en: 'Where is my order?' },
  'آپ کی ریٹرن پالیسی کیا ہے؟': { ur: 'آپ کی ریٹرن پالیسی کیا ہے؟', en: 'What is your return policy?' },
  'What is your return policy?': { ur: 'آپ کی ریٹرن پالیسی کیا ہے؟', en: 'What is your return policy?' },
  'ڈیلیوری میں کتنے دن لگتے ہیں؟': { ur: 'ڈیلیوری میں کتنے دن لگتے ہیں؟', en: 'How long does delivery take?' },
  'How long does delivery take?': { ur: 'ڈیلیوری میں کتنے دن لگتے ہیں؟', en: 'How long does delivery take?' },
  'میں شکایت درج کرانا چاہتا ہوں': { ur: 'میں شکایت درج کرانا چاہتا ہوں', en: 'I want to make a complaint' },
  'I want to make a complaint': { ur: 'میں شکایت درج کرانا چاہتا ہوں', en: 'I want to make a complaint' },
};

async function renderUserBubbleInMode(b: HTMLElement, targetLang: WidgetLang) {
  const currentDom = (b.textContent || '').trim();
  const isVoiceBubble = b.classList.contains('voice');

  // Voice bubbles first display "🎤 0:02 · listening…" then update to "🎤 <transcript>"
  if (isVoiceBubble && /listening…|سمجھ رہا ہوں…/i.test(currentDom)) {
    b.setAttribute('dir', targetLang === 'ur' ? 'rtl' : 'ltr');
    return;
  }

  if (!b.dataset.rawSourceText || (isVoiceBubble && !b.dataset.voiceTranscriptCaptured)) {
    b.dataset.rawSourceText = currentDom;
    if (isVoiceBubble) {
      b.dataset.voiceTranscriptCaptured = '1';
    }
  }

  const orig = b.dataset.rawSourceText;
  if (!orig) return;

  // Keep pure Order IDs untouched
  if (/^\s*ZX[-\s]?\d{3,6}\s*$/i.test(orig)) {
    return;
  }

  const cleanVoicePrefix = isVoiceBubble && orig.startsWith('🎤 ') ? orig.slice(2).trim() : orig;

  const mapped = CHIP_QUERY_TRANSLATIONS[cleanVoicePrefix];
  if (mapped) {
    b.textContent = isVoiceBubble ? `🎤 ${mapped[targetLang]}` : mapped[targetLang];
    b.setAttribute('dir', targetLang === 'ur' ? 'rtl' : 'ltr');
    return;
  }

  const { urduCount } = countScriptChars(cleanVoicePrefix);
  const hasLatin = /[A-Za-z]{2,}/.test(cleanVoicePrefix.replace(/\bZX[-\s]?\d{3,6}\b/gi, ''));
  const needsTranslate =
    (targetLang === 'ur' && (urduCount === 0 || hasLatin)) ||
    (targetLang === 'en' && urduCount > 0);

  if (!needsTranslate) {
    b.textContent = isVoiceBubble ? `🎤 ${cleanVoicePrefix}` : cleanVoicePrefix;
    b.setAttribute('dir', targetLang === 'ur' ? 'rtl' : 'ltr');
    return;
  }

  const cacheAttr = targetLang === 'ur' ? 'translatedUr' : 'translatedEn';
  if (b.dataset[cacheAttr]) {
    const out = b.dataset[cacheAttr]!;
    b.textContent = isVoiceBubble ? `🎤 ${out}` : out;
    b.setAttribute('dir', targetLang === 'ur' ? 'rtl' : 'ltr');
    return;
  }

  const translated = await translateTextForMode(cleanVoicePrefix, targetLang);
  b.dataset[cacheAttr] = translated;
  b.textContent = isVoiceBubble ? `🎤 ${translated}` : translated;
  b.setAttribute('dir', targetLang === 'ur' ? 'rtl' : 'ltr');
}

function syncHeaderAndChromeLanguage(shadowRoot: ShadowRoot) {
  const targetLang = getActiveWidgetLang(shadowRoot);
  const titleEl = shadowRoot.getElementById('title');
  if (titleEl) {
    titleEl.textContent = targetLang === 'ur' ? 'زیپلیکس کسٹمر سپورٹ' : 'ZAPLIX Customer Support';
    titleEl.setAttribute('data-zaplix-branded', 'true');
  }

  const statusEl = shadowRoot.getElementById('status');
  if (statusEl) {
    const cur = (statusEl.textContent || '').trim();
    if (!/Recording|ریکارڈنگ|Hold|مائیک|allow|Microphone/i.test(cur)) {
      const nextStatus = targetLang === 'ur' ? 'آن لائن · فوری جواب' : 'Online · replies instantly';
      if (cur !== nextStatus) {
        statusEl.textContent = nextStatus;
      }
    }
  }

  const inputEl = shadowRoot.getElementById('in') as HTMLInputElement | null;
  if (inputEl) {
    inputEl.placeholder = targetLang === 'ur' ? 'اپنا پیغام لکھیں…' : 'Type your message…';
    inputEl.setAttribute('dir', targetLang === 'ur' ? 'rtl' : 'ltr');
  }
}

function enhanceBotRow(row: Element, shadowRoot: ShadowRoot) {
  if (!row.classList.contains('bot') || row.classList.contains('typing')) return;
  const b = row.querySelector('.b') as HTMLElement | null;
  if (!b || b.getAttribute('data-vp-enhanced') === '1') return;

  const rawText = (b.textContent || '').trim();
  if (!rawText) return;

  // Locate preceding user query bubble & whether it came from voice
  let userText = '';
  let isVoiceQuery = false;
  let prev = row.previousElementSibling;
  while (prev) {
    if (prev.classList.contains('me')) {
      const prevB = prev.querySelector('.b') as HTMLElement | null;
      userText = (prevB?.dataset.rawSourceText || prevB?.textContent || '').trim();
      isVoiceQuery = !!prevB?.classList.contains('voice');
      break;
    }
    prev = prev.previousElementSibling;
  }

  const isGreeting =
    !userText &&
    (!row.previousElementSibling ||
      rawText.startsWith('السلام علیکم') ||
      /Welcome|خوش آمدید/i.test(rawText));
  b.dataset.rawSourceText = rawText;
  b.dataset.speakText = rawText;
  b.dataset.userQuery = userText;
  b.dataset.isGreeting = isGreeting ? '1' : '0';

  const targetLang = getActiveWidgetLang(shadowRoot);
  const spkBtn = shadowRoot.getElementById('spk');
  const spkOn = spkBtn?.getAttribute('aria-pressed') === 'true';
  const shouldAutoSpeak = !isGreeting && Boolean(userText) && (spkOn || isVoiceQuery);

  if (shouldAutoSpeak && typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }

  // Enable click & keyboard accessibility to hear the output in voice (ignore form inputs inside bubble)
  b.setAttribute('role', 'button');
  b.setAttribute('tabindex', '0');
  b.addEventListener('click', (e) => {
    if ((e.target as Element | null)?.closest?.('.vp-complaint-form, .vp-track-action')) {
      return;
    }
    e.stopPropagation();
    speakBotOutput(b, shadowRoot);
  });
  b.addEventListener('keydown', (e) => {
    if ((e.target as Element | null)?.closest?.('.vp-complaint-form, .vp-track-action')) {
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      speakBotOutput(b, shadowRoot);
    }
  });

  b.setAttribute('data-vp-enhanced', '1');
  void renderBotBubbleInMode(b, shadowRoot, rawText, userText, isGreeting, targetLang, shouldAutoSpeak);
}

function refreshAllBotRowsForLanguage(shadowRoot: ShadowRoot) {
  stopAllBotSpeech(shadowRoot);
  syncHeaderAndChromeLanguage(shadowRoot);
  const targetLang = getActiveWidgetLang(shadowRoot);
  const msgsEl = shadowRoot.querySelector('#msgs');
  if (!msgsEl) return;

  msgsEl.querySelectorAll('.row.me .b').forEach((el) => {
    void renderUserBubbleInMode(el as HTMLElement, targetLang);
  });

  msgsEl.querySelectorAll('.row.bot:not(.typing) .b[data-vp-enhanced="1"]').forEach((el) => {
    const b = el as HTMLElement;
    const rawSource = b.dataset.rawSourceText || (b.textContent || '').trim();
    const userText = b.dataset.userQuery || '';
    const isGreeting = b.dataset.isGreeting === '1';
    void renderBotBubbleInMode(b, shadowRoot, rawSource, userText, isGreeting, targetLang, false);
  });
}

export function FloatingWhatsApp({ settings: _settings, onOpenSupportModal }: FloatingWhatsAppProps) {
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [agentReady, setAgentReady] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(true);
  const [showPromptBadge, setShowPromptBadge] = useState(true);
  const waUrl = getWhatsAppUrl('Hello Zaplix Customer Support! I would like to inquire about your products.');

  useEffect(() => {
    // Warm up speech synthesis voice list
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }

    // Customize VoicePilot widget: hide default purple button, inject Zaplix branding and fullscreen rules
    const setupVoicePilot = () => {
      const host = findVoicePilotHost();
      if (host && host.shadowRoot) {
        const shadowRoot = host.shadowRoot;
        setAgentReady(true);

        // 1. Hide external purple launcher button immediately
        const launcher = shadowRoot.querySelector('.launcher, #launch, .fab') as HTMLElement | null;
        if (launcher) {
          launcher.style.setProperty('display', 'none', 'important');
          launcher.style.setProperty('opacity', '0', 'important');
          launcher.style.setProperty('pointer-events', 'none', 'important');
          launcher.style.setProperty('visibility', 'hidden', 'important');
          launcher.style.setProperty('width', '0', 'important');
          launcher.style.setProperty('height', '0', 'important');
          launcher.style.setProperty('position', 'absolute', 'important');
          launcher.style.setProperty('top', '-9999px', 'important');
        }

        // 2. Inject Zaplix Custom Styles into ShadowRoot
        let customStyle = shadowRoot.getElementById('zaplix-vp-override');
        if (!customStyle) {
          customStyle = document.createElement('style');
          customStyle.id = 'zaplix-vp-override';
          customStyle.textContent = `
            /* 1. HIDE EXTERNAL PURPLE LAUNCHER COMPLETELY */
            .launcher,
            #launch,
            .fab,
            button[aria-label="Open chat"] {
              display: none !important;
              opacity: 0 !important;
              pointer-events: none !important;
              visibility: hidden !important;
              width: 0 !important;
              height: 0 !important;
              position: absolute !important;
              top: -9999px !important;
              left: -9999px !important;
              transform: scale(0) !important;
            }

            /* 2. BASE PANEL SPECIFICATION - NO TOP CROPPING */
            .panel {
              z-index: 9990 !important;
              box-shadow: 0 25px 60px -12px rgba(15, 23, 42, 0.45) !important;
              background: #ffffff !important;
              color: #0f172a !important;
              overflow: hidden !important;
              font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
            }

            /* MOBILE: 100% FULL SCREEN SUPPORT - NEVER CROPPED AT THE TOP */
            @media (max-width: 768px) {
              .panel {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                width: 100vw !important;
                max-width: 100vw !important;
                height: 100% !important;
                height: 100dvh !important;
                max-height: 100dvh !important;
                border-radius: 0 !important;
                margin: 0 !important;
                box-shadow: none !important;
                border: none !important;
              }

              .panel.open {
                display: flex !important;
                flex-direction: column !important;
              }

              .panel .head {
                padding-top: max(16px, env(safe-area-inset-top, 16px)) !important;
                padding-left: max(16px, env(safe-area-inset-left, 16px)) !important;
                padding-right: max(16px, env(safe-area-inset-right, 16px)) !important;
                min-height: 68px !important;
              }

              .panel .composer {
                padding-bottom: max(12px, env(safe-area-inset-bottom, 12px)) !important;
              }

              .panel .foot {
                padding-bottom: max(10px, env(safe-area-inset-bottom, 10px)) !important;
              }
            }

            /* LAPTOP / DESKTOP: PROPER VIEWPORT WITH SAFE TOP MARGIN & BORDER RADIUS */
            @media (min-width: 769px) {
              .panel {
                position: fixed !important;
                top: auto !important;
                bottom: 24px !important;
                right: 24px !important;
                left: auto !important;
                width: 440px !important;
                max-width: calc(100vw - 48px) !important;
                height: min(650px, calc(100vh - 48px)) !important;
                max-height: calc(100vh - 48px) !important;
                border-radius: 24px !important;
                border: 1px solid rgba(226, 232, 240, 0.9) !important;
                box-shadow: 0 25px 60px -12px rgba(15, 23, 42, 0.35), 0 0 0 1px rgba(0, 0, 0, 0.05) !important;
              }

              .panel.open {
                display: flex !important;
                flex-direction: column !important;
              }

              /* Fullscreen Mode on Laptop */
              .panel.vp-fullscreen {
                top: 20px !important;
                left: 20px !important;
                right: 20px !important;
                bottom: 20px !important;
                width: calc(100vw - 40px) !important;
                max-width: 1060px !important;
                margin: 0 auto !important;
                height: calc(100vh - 40px) !important;
                max-height: calc(100vh - 40px) !important;
                border-radius: 20px !important;
                box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5) !important;
              }
            }

            /* LUXURY ZAPLIX BRANDED HEADER */
            .panel .head {
              background: linear-gradient(135deg, #070e1b 0%, #0f172a 45%, #1e1b4b 100%) !important;
              border-bottom: 2px solid rgba(245, 158, 11, 0.35) !important;
              padding: 14px 18px !important;
            }

            .panel .head #avatar {
              width: 42px !important;
              height: 42px !important;
              border-radius: 50% !important;
              overflow: hidden !important;
              border: 2px solid #f59e0b !important;
              box-shadow: 0 2px 8px rgba(245, 158, 11, 0.35) !important;
              background-image: url('${OFFICIAL_LOGO_IMAGE}') !important;
              background-size: cover !important;
              background-position: center !important;
              color: transparent !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              flex-shrink: 0 !important;
            }

            .panel .head .who .name,
            .panel .head #title {
              font-weight: 800 !important;
              font-size: 15px !important;
              letter-spacing: -0.01em !important;
              color: #ffffff !important;
              display: flex !important;
              align-items: center !important;
              gap: 6px !important;
            }

            .panel .head .status {
              font-size: 11px !important;
              color: #93c5fd !important;
              display: flex !important;
              align-items: center !important;
              gap: 6px !important;
            }

            /* HEADER ACTION BUTTONS */
            .panel .head .actions {
              display: flex !important;
              align-items: center !important;
              gap: 6px !important;
            }

            .panel .head .actions .icon {
              background: rgba(255, 255, 255, 0.16) !important;
              border-radius: 10px !important;
              min-width: 36px !important;
              height: 36px !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              cursor: pointer !important;
              color: #ffffff !important;
              transition: all 0.18s ease !important;
              border: 1px solid rgba(255, 255, 255, 0.15) !important;
            }

            .panel .head .actions .icon:hover {
              background: rgba(255, 255, 255, 0.3) !important;
              transform: scale(1.05) !important;
            }

            .panel .head .actions #lang {
              min-width: 54px !important;
              padding: 0 10px !important;
              font-weight: 800 !important;
              font-size: 12px !important;
              letter-spacing: 0.02em !important;
              background: rgba(245, 158, 11, 0.22) !important;
              border-color: rgba(245, 158, 11, 0.55) !important;
              color: #fde68a !important;
            }

            .panel .head .actions #lang:hover {
              background: rgba(245, 158, 11, 0.36) !important;
            }

            #min {
              background: rgba(255, 255, 255, 0.22) !important;
            }

            /* PROFESSIONAL BULLET-POINT OUTPUT & CLICK-TO-VOICE INTERACTION */
            .bot .b[data-vp-enhanced="1"] {
              cursor: pointer !important;
              transition: border-color 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease !important;
            }

            .bot .b[data-vp-enhanced="1"]:hover {
              border-color: #6366f1 !important;
              box-shadow: 0 4px 14px rgba(79, 70, 229, 0.12) !important;
            }

            .bot .b.vp-speaking {
              border-color: #4f46e5 !important;
              background: #eef2ff !important;
              box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.18) !important;
            }

            .vp-bullet-list {
              display: flex !important;
              flex-direction: column !important;
              gap: 7px !important;
              width: 100% !important;
            }

            .vp-bullet-line {
              display: flex !important;
              align-items: flex-start !important;
              gap: 8px !important;
              line-height: 1.55 !important;
            }

            .vp-bullet {
              color: #4f46e5 !important;
              font-weight: 900 !important;
              font-size: 16px !important;
              line-height: 1.4 !important;
              flex-shrink: 0 !important;
            }

            .vp-line-text {
              flex: 1 !important;
              min-width: 0 !important;
              word-break: break-word !important;
            }

            .vp-listen-tag {
              margin-top: 8px !important;
              padding-top: 6px !important;
              border-top: 1px dashed #e2e8f0 !important;
              font-size: 11px !important;
              font-weight: 600 !important;
              color: #4f46e5 !important;
              display: flex !important;
              align-items: center !important;
              gap: 5px !important;
              opacity: 0.85 !important;
            }

            .bot .b.vp-speaking .vp-listen-tag {
              color: #dc2626 !important;
              opacity: 1 !important;
              border-top-color: #c7d2fe !important;
            }

            /* INTERACTIVE COMPLAINT REGISTRATION FORM INSIDE AGENT */
            .vp-complaint-form {
              margin-top: 10px !important;
              padding: 10px !important;
              border-radius: 12px !important;
              background: #f8fafc !important;
              border: 1px solid #cbd5e1 !important;
              display: flex !important;
              flex-direction: column !important;
              gap: 7px !important;
              cursor: default !important;
            }

            .vp-cf-title {
              font-size: 12px !important;
              font-weight: 800 !important;
              color: #0f172a !important;
            }

            .vp-cf-input,
            .vp-cf-textarea {
              width: 100% !important;
              box-sizing: border-box !important;
              padding: 7px 10px !important;
              border-radius: 8px !important;
              border: 1px solid #cbd5e1 !important;
              background: #ffffff !important;
              color: #0f172a !important;
              font-size: 12px !important;
              font-family: inherit !important;
              outline: none !important;
            }

            .vp-cf-input:focus,
            .vp-cf-textarea:focus {
              border-color: #4f46e5 !important;
              box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.15) !important;
            }

            .vp-cf-err {
              font-size: 11px !important;
              font-weight: 600 !important;
              color: #dc2626 !important;
            }

            .vp-cf-submit {
              padding: 8px 12px !important;
              border-radius: 9px !important;
              border: none !important;
              background: linear-gradient(135deg, #4f46e5, #0f172a) !important;
              color: #ffffff !important;
              font-size: 12px !important;
              font-weight: 700 !important;
              cursor: pointer !important;
            }

            .vp-cf-submit:disabled {
              opacity: 0.6 !important;
              cursor: not-allowed !important;
            }

            /* TRACK ORDER MODAL LAUNCHER BUTTON INSIDE BUBBLE */
            .vp-track-action {
              margin-top: 10px !important;
            }

            .vp-track-btn {
              width: 100% !important;
              padding: 9px 14px !important;
              border-radius: 10px !important;
              border: none !important;
              background: linear-gradient(135deg, #2563eb, #0f172a) !important;
              color: #ffffff !important;
              font-size: 12px !important;
              font-weight: 700 !important;
              cursor: pointer !important;
              text-align: center !important;
              transition: opacity 0.16s ease !important;
            }

            .vp-track-btn:hover {
              opacity: 0.92 !important;
            }
          `;
          shadowRoot.appendChild(customStyle);
        }

        // 3. Set Header Title & Status cleanly matching current EN / اردو mode (without breaking voice recording states)
        syncHeaderAndChromeLanguage(shadowRoot);

        // 4. Inject Fullscreen Toggle button on Desktop header actions if not already injected
        const actions = shadowRoot.querySelector('.head .actions');
        if (actions && !shadowRoot.getElementById('vp-expand-btn')) {
          const expandBtn = document.createElement('button');
          expandBtn.id = 'vp-expand-btn';
          expandBtn.className = 'icon';
          expandBtn.type = 'button';
          expandBtn.title = 'Full Screen';
          expandBtn.setAttribute('aria-label', 'Toggle full screen');
          expandBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>`;
          expandBtn.onclick = (e) => {
            e.stopPropagation();
            const p = shadowRoot.querySelector('.panel');
            if (p) {
              const isFull = p.classList.toggle('vp-fullscreen');
              expandBtn.title = isFull ? 'Restore Size' : 'Full Screen';
              expandBtn.innerHTML = isFull
                ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7"/></svg>`
                : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>`;
            }
          };
          const minBtn = actions.querySelector('#min');
          if (minBtn) {
            actions.insertBefore(expandBtn, minBtn);
          } else {
            actions.appendChild(expandBtn);
          }
        }

        // 5. Enhance bot output messages & keep user bubbles synced with EN / اردو mode
        const msgsEl = shadowRoot.querySelector('#msgs');
        let msgsObserver: MutationObserver | null = null;
        if (msgsEl) {
          const activeLang = getActiveWidgetLang(shadowRoot);
          msgsEl.querySelectorAll('.row.me .b').forEach((el) => {
            void renderUserBubbleInMode(el as HTMLElement, activeLang);
          });
          msgsEl.querySelectorAll('.row.bot:not(.typing)').forEach((r) => enhanceBotRow(r, shadowRoot));
          msgsObserver = new MutationObserver((mutations) => {
            const curLang = getActiveWidgetLang(shadowRoot);
            for (const m of mutations) {
              const targetEl = m.target instanceof Element ? m.target : m.target?.parentElement;
              const meVoiceB = targetEl?.closest?.('.row.me .b.voice') as HTMLElement | null;
              if (meVoiceB && !meVoiceB.dataset.voiceTranscriptCaptured) {
                const txt = (meVoiceB.textContent || '').trim();
                if (txt && !/listening…|سمجھ رہا ہوں…/i.test(txt)) {
                  void renderUserBubbleInMode(meVoiceB, curLang);
                }
              }
            }
            msgsEl.querySelectorAll('.row.me .b').forEach((el) => {
              const meB = el as HTMLElement;
              if (meB.classList.contains('voice')) {
                const txt = (meB.textContent || '').trim();
                if (!meB.dataset.voiceTranscriptCaptured && txt && !/listening…|سمجھ رہا ہوں…/i.test(txt)) {
                  void renderUserBubbleInMode(meB, curLang);
                }
              } else if (!meB.dataset.rawSourceText) {
                void renderUserBubbleInMode(meB, curLang);
              }
            });
            msgsEl.querySelectorAll('.row.bot:not(.typing)').forEach((r) => enhanceBotRow(r, shadowRoot));
          });
          msgsObserver.observe(msgsEl, { childList: true, subtree: true, characterData: true });
        }

        // Sync #status after widget.js finishes voice recording
        const statusEl = shadowRoot.getElementById('status');
        let statusObserver: MutationObserver | null = null;
        if (statusEl) {
          statusObserver = new MutationObserver(() => {
            if (
              statusEl.textContent === 'Online · replies instantly' &&
              getActiveWidgetLang(shadowRoot) === 'ur'
            ) {
              statusEl.textContent = 'آن لائن · فوری جواب';
            }
          });
          statusObserver.observe(statusEl, { childList: true, characterData: true, subtree: true });
        }

        const panel = shadowRoot.querySelector('.panel');

        // Silent-prime shared audio only on non-bubble taps so direct bubble clicks never race with silent WAV
        const onPanelInteract = (e: Event) => {
          const target = e.target as Element | null;
          if (target?.closest?.('.bot .b')) {
            unlockTtsPlayback(false);
          } else {
            unlockTtsPlayback(true);
          }
        };
        if (panel) {
          panel.addEventListener('pointerdown', onPanelInteract, { capture: true });
        }

        // Prevent widget.js native window.speechSynthesis.speak() from playing rogue English voice over ZAPLIX TTS
        let origSpeechSpeak: typeof window.speechSynthesis.speak | null = null;
        if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
          origSpeechSpeak = window.speechSynthesis.speak.bind(window.speechSynthesis);
          window.speechSynthesis.speak = (utterance: SpeechSynthesisUtterance) => {
            if (!allowZaplixWebSpeech && panel?.classList.contains('open')) {
              return;
            }
            origSpeechSpeak?.(utterance);
          };
        }

        const micBtn = shadowRoot.querySelector('#mic');
        const onMicStart = () => stopAllBotSpeech(shadowRoot);
        if (micBtn) {
          micBtn.addEventListener('pointerdown', onMicStart, { capture: true });
        }

        const langBtn = shadowRoot.getElementById('lang');
        const onLangToggle = () => {
          setTimeout(() => {
            refreshAllBotRowsForLanguage(shadowRoot);
          }, 0);
        };
        if (langBtn) {
          langBtn.addEventListener('click', onLangToggle);
        }

        const spkBtn = shadowRoot.getElementById('spk');
        const onSpkToggle = () => {
          setTimeout(() => {
            if (spkBtn?.getAttribute('aria-pressed') !== 'true') {
              stopAllBotSpeech(shadowRoot);
            }
          }, 0);
        };
        if (spkBtn) {
          spkBtn.addEventListener('click', onSpkToggle);
        }

        // Sync outgoing VoicePilot chat/voice language with the top EN / اردو button
        const origFetch = window.fetch.bind(window);
        const patchedFetch: typeof window.fetch = (input, init) => {
          try {
            const url = typeof input === 'string' ? input : input instanceof Request ? input.url : '';
            if (
              url.includes('fyp-2jte.vercel.app/api/v1/public/') &&
              init &&
              typeof init.body === 'string'
            ) {
              const activeLang = getActiveWidgetLang(shadowRoot);
              const parsed = JSON.parse(init.body) as Record<string, unknown>;
              parsed.language = activeLang;
              return origFetch(input, { ...init, body: JSON.stringify(parsed) });
            }
          } catch {
            // fallback to original fetch
          }
          return origFetch(input, init);
        };
        window.fetch = patchedFetch;

        if (panel) {
          const checkOpen = () => {
            const open = panel.classList.contains('open');
            setIsAgentOpen(open);
            if (!open) {
              stopAllBotSpeech(shadowRoot);
            }
          };
          const panelObserver = new MutationObserver(checkOpen);
          panelObserver.observe(panel, { attributes: true, attributeFilter: ['class'] });
          return () => {
            panelObserver.disconnect();
            if (msgsObserver) msgsObserver.disconnect();
            if (statusObserver) statusObserver.disconnect();
            panel.removeEventListener('pointerdown', onPanelInteract, { capture: true });
            if (micBtn) micBtn.removeEventListener('pointerdown', onMicStart, { capture: true });
            if (langBtn) langBtn.removeEventListener('click', onLangToggle);
            if (spkBtn) spkBtn.removeEventListener('click', onSpkToggle);
            if (window.fetch === patchedFetch) window.fetch = origFetch;
            if (origSpeechSpeak && 'speechSynthesis' in window) {
              window.speechSynthesis.speak = origSpeechSpeak;
            }
            stopAllBotSpeech(shadowRoot);
          };
        }
      }
      return undefined;
    };

    let cleanup = setupVoicePilot();
    const interval = setInterval(() => {
      const c = setupVoicePilot();
      if (c) {
        cleanup = c;
        clearInterval(interval);
      }
    }, 250);

    const timeout = setTimeout(() => clearInterval(interval), 15000);

    const handleExternalOpen = () => {
      handleToggleAgent();
    };
    window.addEventListener('zaplix:open-voice-agent', handleExternalOpen);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      window.removeEventListener('zaplix:open-voice-agent', handleExternalOpen);
      if (cleanup) cleanup();
    };
  }, []);

  const handleToggleAgent = () => {
    const host = findVoicePilotHost();
    if (host && host.shadowRoot) {
      const launcher = (host.shadowRoot.querySelector('#launch') ||
        host.shadowRoot.querySelector('.launcher') ||
        host.shadowRoot.querySelector('.fab')) as HTMLElement | null;
      const panel = host.shadowRoot.querySelector('.panel') as HTMLElement | null;

      if (launcher) {
        launcher.click();
      } else if (panel) {
        panel.classList.toggle('open');
      }

      if (panel) {
        setIsAgentOpen(panel.classList.contains('open'));
      }
    } else {
      setTimeout(() => {
        const h = findVoicePilotHost();
        const f = (h?.shadowRoot?.querySelector('#launch') ||
          h?.shadowRoot?.querySelector('.launcher') ||
          h?.shadowRoot?.querySelector('.fab')) as HTMLElement | null;
        if (f) f.click();
      }, 350);
    }
  };

  return (
    <>
      {/* 1. PROFESSIONAL & ATTRACTIVE ZAPLIX CUSTOMER SUPPORT AGENT BUTTON */}
      <div
        className={`fixed z-40 right-3.5 bottom-[146px] md:right-6 md:bottom-[98px] items-center group transition-all duration-300 ${
          isAgentOpen ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Attractive Branded Floating Pill / Tooltip */}
        <div 
          onClick={handleToggleAgent}
          className="hidden md:flex items-center gap-2.5 mr-3 px-3.5 py-2 rounded-2xl bg-slate-900/95 dark:bg-[#070e1b]/95 backdrop-blur-md text-white shadow-xl border border-amber-500/30 hover:border-amber-400 cursor-pointer transition-all duration-200 select-none hover:scale-102"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <div className="flex flex-col text-left leading-tight">
            <span className="text-[11px] font-black tracking-wide text-amber-400 flex items-center gap-1">
              <span>ZAPLIX CUSTOMER CARE</span>
              <Sparkles className="w-3 h-3 text-amber-300 animate-spin-slow" />
            </span>
            <span className="text-[10px] text-slate-300 font-medium">
              AI Voice &amp; Chat · 24/7 Live
            </span>
          </div>
        </div>

        {/* The Branded Blinking Agent Button */}
        <button
          type="button"
          onClick={handleToggleAgent}
          aria-label="Open ZAPLIX Customer Support Agent"
          title="ZAPLIX Customer Support · AI Voice & Chat"
          className={`relative w-[58px] h-[58px] md:w-[62px] md:h-[62px] rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 shadow-[0_10px_30px_rgba(245,158,11,0.35),0_4px_12px_rgba(0,0,0,0.5)] hover:shadow-[0_14px_35px_rgba(245,158,11,0.5)] hover:scale-108 active:scale-95 ${
            isAgentOpen
              ? 'bg-gradient-to-tr from-rose-600 via-rose-700 to-indigo-800 text-white ring-4 ring-rose-400/50'
              : 'bg-gradient-to-tr from-slate-950 via-indigo-950 to-slate-900 text-white ring-2 ring-amber-400/80 hover:ring-amber-300'
          }`}
        >
          {/* Subtle Ambient Radar Pulse Rings (Blinking Effect) */}
          <span className="absolute inset-0 rounded-full bg-amber-400/40 animate-ping -z-10 opacity-75" />
          <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-500 via-cyan-400 to-indigo-500 -z-20 opacity-40 blur-xs animate-pulse" />

          {/* Button Content: Zaplix Official Logo + Support Headset Icon */}
          <div className="relative w-full h-full rounded-full overflow-hidden p-1 flex items-center justify-center">
            {isAgentOpen ? (
              <X className="w-7 h-7 text-white animate-in zoom-in-75" />
            ) : (
              <div className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-black">
                {/* Official Zaplix Logo Image */}
                {logoLoaded ? (
                  <img
                    src={OFFICIAL_LOGO_IMAGE}
                    alt="ZAPLIX Official Agent"
                    className="w-full h-full object-cover scale-105"
                    onError={() => setLogoLoaded(false)}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-slate-950 to-indigo-950 flex items-center justify-center font-black text-amber-400 text-sm">
                    Z
                  </div>
                )}

                {/* Glassmorphic Gradient Overlay for Depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

                {/* Professional Headset Badge at Bottom Right of Logo */}
                <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center shadow-md ring-1 ring-slate-950">
                  <Headset className="w-3 h-3 stroke-[2.5]" />
                </div>
              </div>
            )}
          </div>

          {/* Active Online Status Badge (Blinking green dot) */}
          <span
            className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950 shadow-md flex items-center justify-center"
            title={agentReady ? 'ZAPLIX Support Online' : 'Connecting to Zaplix Agent...'}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          </span>
        </button>
      </div>

      {/* 2. OFFICIAL WHATSAPP BUTTON (Positioned below Customer Support Agent) */}
      <div
        className={`fixed z-40 right-3.5 bottom-[80px] md:right-6 md:bottom-6 items-center group ${
          isAgentOpen ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Tooltip Pill (Desktop & Hover) */}
        <div className="hidden md:flex items-center gap-1.5 mr-3 px-3.5 py-1.5 rounded-full bg-slate-900/95 dark:bg-[#070e1b]/95 backdrop-blur-md text-white text-xs font-semibold shadow-xl border border-emerald-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
          <span>WhatsApp Helpline · {OFFICIAL_WHATSAPP_NUMBER}</span>
        </div>

        {/* WhatsApp Button */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Message Zaplix Support on WhatsApp"
          className="w-[52px] h-[52px] md:w-[56px] md:h-[56px] rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white shadow-[0_8px_24px_rgba(37,211,102,0.45)] hover:shadow-[0_12px_28px_rgba(37,211,102,0.6)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer group ring-2 ring-emerald-300/40"
        >
          <WhatsAppIcon className="w-7 h-7 md:w-8 md:h-8 fill-white text-white group-hover:scale-110 transition-transform" />
        </a>
      </div>
    </>
  );
}

export default FloatingWhatsApp;

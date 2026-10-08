import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
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
} from './src/types/index';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Session secret
const JWT_SECRET = process.env.JWT_SECRET || 'ali-electronics-hassanabdal-secret-key-2026';

export interface StoreData {
  admin: {
    username: string;
    passwordHash: string;
    salt: string;
  };
  settings: StoreSettings;
  homepage: HomepageConfig;
  categories: Category[];
  products: Product[];
  offers: Offer[];
  media: MediaItem[];
  inquiries: Inquiry[];
  contactMessages: ContactMessage[];
}

// Password hashing helper
function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

// Token helper (HMAC signed token)
function generateToken(username: string): string {
  const payload = {
    username,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    nonce: crypto.randomBytes(8).toString('hex')
  };
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(payloadStr).digest('base64url');
  return `${payloadStr}.${signature}`;
}

function verifyToken(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return false;
    const [payloadStr, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(payloadStr).digest('base64url');
    if (signature !== expectedSig) return false;
    const payload = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf8'));
    if (payload.exp < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}

// Initial Seed Data with required 12 sample unbranded electronics products
const initialSalt = crypto.randomBytes(16).toString('hex');

const defaultHomepageConfig: HomepageConfig = {
  heroHeading: 'Your Trusted Electronics Store in Hassan Abdal',
  heroSubtitle: 'Explore quality electronics, competitive prices and reliable service at Ali Electronic.',
  heroBackgroundImage: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1600&auto=format&fit=crop&q=80',
  heroOverlayOpacity: 75,
  heroCtaText: 'Browse Products',
  heroCtaDestination: '#products',
  heroSecondaryCtaText: 'Contact on WhatsApp',
  heroSecondaryCtaDestination: '#contact',
  heroEnabled: true,
  sections: [
    { id: 'announcement', name: 'Announcement Bar', enabled: true, order: 1 },
    { id: 'hero', name: 'Hero Banner', enabled: true, order: 2 },
    { id: 'offers', name: 'Special Offers & Promotions', enabled: true, order: 3 },
    { id: 'categories', name: 'Categories Department', enabled: true, order: 4 },
    { id: 'featured', name: 'Featured Products', enabled: true, order: 5 },
    { id: 'newArrivals', name: 'New Arrivals', enabled: true, order: 6 },
    { id: 'about', name: 'About Ali Electronic', enabled: true, order: 7 },
    { id: 'whyUs', name: 'Why Choose Us', enabled: true, order: 8 },
    { id: 'contact', name: 'Contact & Store Hours', enabled: true, order: 9 },
    { id: 'map', name: 'Google Map Location', enabled: true, order: 10 },
  ],
  announcementBar: {
    enabled: true,
    text: '🔥 SPECIAL OFFER — Up to 30% OFF on Selected Electronics at Hassan Abdal Store!',
    link: '#products',
    style: 'gradient',
  },
  promoPopup: {
    enabled: false,
    title: 'MEGA ELECTRONICS SALE',
    description: 'Get amazing discounts and authentic accessories at Ali Electronic today.',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
    buttonText: 'Shop Special Offers',
    buttonLink: '#products',
    delaySeconds: 4,
    showOnce: true,
  }
};

const defaultSettings: StoreSettings = {
  businessName: 'Ali Electronic',
  tagline: 'Your Trusted Electronics Store in Hassan Abdal',
  supportingText: 'Explore quality electronics, competitive prices and reliable service at Ali Electronic.',
  location: 'Main Bus Stop, Islam Shaheed Road, Opposite New Sethi Flour Mills, Hassan Abdal, Pakistan',
  googleMapsUrl: 'https://maps.google.com/?q=Main+Bus+Stop+Islam+Shaheed+Road+Hassan+Abdal+Pakistan',
  phone1: '03115321647',
  phone1Name: 'Arbaz Ahmed',
  phone2: '03133332141',
  phone2Name: 'Faraz Ahmed',
  whatsappNumber: '03115321647',
  whatsappFloatingEnabled: true,
  whatsappProductButtonEnabled: true,
  whatsappTemplate: 'Assalam-o-Alaikum Ali Electronic, I am interested in {product_name}. Current price is {price}. Please confirm availability.',
  businessHours: 'Opening Hours — Contact us for current timings',
  email: 'contact@alielectronics-hassanabdal.pk',
  aboutText: 'Ali Electronic is a local electronics business serving customers in Hassan Abdal with quality electronics products, competitive pricing and customer-focused service.',
  logoUrl: '',
  footerText: '© 2026 Ali Electronic. All Rights Reserved. Hassan Abdal, Pakistan.',
  themePreset: 'ocean-blue',
};

const defaultCategories: Category[] = [
  { id: 'cat-1', name: 'Mobile Accessories', description: 'Cases, holders, screen guards and daily mobile gear', image: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80', order: 1, isVisible: true },
  { id: 'cat-2', name: 'Chargers', description: 'Fast wall adapters, multi-port chargers and PD hubs', image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80', order: 2, isVisible: true },
  { id: 'cat-3', name: 'Cables', description: 'Durable USB-C, Lightning & fast-charge cables', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80', order: 3, isVisible: true },
  { id: 'cat-4', name: 'Earphones', description: 'Wireless earbuds, neckbands and in-ear audio', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80', order: 4, isVisible: true },
  { id: 'cat-5', name: 'Headphones', description: 'Over-ear studio and deep bass wireless headphones', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80', order: 5, isVisible: true },
  { id: 'cat-6', name: 'Speakers', description: 'Portable Bluetooth speakers and wireless sound', image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80', order: 6, isVisible: true },
  { id: 'cat-7', name: 'Power Banks', description: 'High capacity portable fast-charge power banks', image: 'https://images.unsplash.com/photo-1609592424109-dd9892f1b177?w=600&auto=format&fit=crop&q=80', order: 7, isVisible: true },
  { id: 'cat-8', name: 'LED & Lights', description: 'Rechargeable emergency lights, lanterns and LED', image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&auto=format&fit=crop&q=80', order: 8, isVisible: true },
  { id: 'cat-9', name: 'Computer Accessories', description: 'Mice, keyboards, USB flash drives and adapters', image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80', order: 9, isVisible: true },
  { id: 'cat-10', name: 'Networking', description: 'Routers, range extenders, LAN cables', image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80', order: 10, isVisible: true },
  { id: 'cat-11', name: 'Smart Devices', description: 'Smartwatches, fitness bands and smart accessories', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80', order: 11, isVisible: true },
  { id: 'cat-12', name: 'Home Electronics', description: 'Extension boards, sockets and power protectors', image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80', order: 12, isVisible: true },
];

const defaultProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Premium Wireless Earbuds',
    category: 'Earphones',
    brand: 'Generic Tech',
    price: 2499,
    oldPrice: 2999,
    discount: '17% OFF',
    badge: 'SALE',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'
    ],
    shortDescription: 'Active Noise Cancellation and 32-hour playback with pocket case.',
    description: 'High-definition wireless audio with Environmental Noise Cancellation (ENC), 32-hour total battery life with portable charging case, deep bass response, and Bluetooth 5.3 instant pairing.',
    specifications: [
      'Bluetooth Version: 5.3',
      'Total Playtime: 32 Hours',
      'Type-C Fast Charging (10 mins = 2 hrs playback)',
      'Touch Controls for Call & Music',
      'Sweat & Splash Resistant'
    ],
    availability: 'In Stock',
    featured: true,
    isNewArrival: false,
    showOnHomepage: true,
    whatsappEnabled: true,
    displayOrder: 1,
    createdAt: '2026-09-10T10:00:00Z',
    updatedAt: '2026-10-01T12:00:00Z',
  },
  {
    id: 'prod-2',
    name: 'Bluetooth Speaker',
    category: 'Speakers',
    brand: 'Generic Tech',
    price: 3499,
    oldPrice: 3999,
    discount: '12% OFF',
    badge: 'HOT',
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80',
    shortDescription: 'Heavy bass portable wireless speaker with built-in FM and USB player.',
    description: 'Rugged fabric finish portable speaker featuring 12W dynamic bass output, FM tuner, USB and MicroSD support, and up to 8 hours continuous playtime.',
    specifications: [
      'Audio Output: 12W Dual Driver',
      'Playtime: Up to 8 Hours',
      'Connectivity: Bluetooth 5.2, USB, TF Card, AUX',
      'Built-in Microphone for Hands-free Calls',
      'Carrying Lanyard Included'
    ],
    availability: 'In Stock',
    featured: true,
    isNewArrival: false,
    showOnHomepage: true,
    whatsappEnabled: true,
    displayOrder: 2,
    createdAt: '2026-09-12T10:00:00Z',
    updatedAt: '2026-10-02T12:00:00Z',
  },
  {
    id: 'prod-3',
    name: 'Fast USB Charger',
    category: 'Chargers',
    brand: 'Generic Tech',
    price: 1299,
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
    shortDescription: '25W Super Fast Quick Charge wall adapter with surge protection.',
    description: 'Universal fast wall adapter with auto-voltage chip. Compatible with all Android smartphones, iPhones, and tablets with overheat protection.',
    specifications: [
      'Power Output: 25W Max',
      'Input: 100-240V 50/60Hz Universal',
      'Smart IC Voltage Regulation',
      'Fire-Retardant ABS Enclosure'
    ],
    availability: 'In Stock',
    featured: true,
    isNewArrival: false,
    showOnHomepage: true,
    whatsappEnabled: true,
    displayOrder: 3,
    createdAt: '2026-09-15T10:00:00Z',
    updatedAt: '2026-10-02T12:00:00Z',
  },
  {
    id: 'prod-4',
    name: 'USB Type-C Cable',
    category: 'Cables',
    brand: 'Generic Tech',
    price: 699,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
    shortDescription: 'Heavy-duty 65W nylon braided Type-C fast charging cable 1.5m.',
    description: 'Tough braided fast charging cable supporting up to 65W power delivery and high-speed data sync. Bend-tested for 15,000+ bends.',
    specifications: [
      'Length: 1.5 Meters',
      'Power: Up to 65W Fast Charging',
      'Material: Double-braided Nylon',
      'Connectors: Zinc Alloy Reinforced'
    ],
    availability: 'In Stock',
    featured: false,
    isNewArrival: true,
    showOnHomepage: true,
    whatsappEnabled: true,
    displayOrder: 4,
    createdAt: '2026-09-18T10:00:00Z',
    updatedAt: '2026-10-02T12:00:00Z',
  },
  {
    id: 'prod-5',
    name: 'Power Bank',
    category: 'Power Banks',
    brand: 'Generic Tech',
    price: 2799,
    oldPrice: 3200,
    badge: 'POPULAR',
    image: 'https://images.unsplash.com/photo-1609592424109-dd9892f1b177?w=800&auto=format&fit=crop&q=80',
    shortDescription: '10,000mAh dual output slim portable power bank with LED indicators.',
    description: 'Compact pocket power bank with high density lithium polymer cells. Simultaneously charges 2 devices with intelligent charge distribution.',
    specifications: [
      'Capacity: 10,000mAh / 37Wh',
      'Outputs: Dual USB 2.4A Max',
      'Inputs: Type-C & Micro-USB',
      'Weight: 210g Lightweight Pocket Size'
    ],
    availability: 'In Stock',
    featured: true,
    isNewArrival: false,
    showOnHomepage: true,
    whatsappEnabled: true,
    displayOrder: 5,
    createdAt: '2026-09-20T10:00:00Z',
    updatedAt: '2026-10-03T12:00:00Z',
  },
  {
    id: 'prod-6',
    name: 'Wireless Headphones',
    category: 'Headphones',
    brand: 'Generic Tech',
    price: 3999,
    oldPrice: 4500,
    badge: 'BEST SELLER',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    shortDescription: 'Comfortable over-ear Bluetooth headphones with 40-hour battery life.',
    description: 'Plush ear cushions, 40mm tuned drivers for powerful punchy sound, foldable headband design, and 40-hour battery life with 3.5mm wired backup.',
    specifications: [
      'Driver: 40mm Dynamic Neodymium',
      'Battery: Up to 40 Hours Playback',
      'Dual Mode: Bluetooth 5.2 + 3.5mm AUX Cable',
      'Built-in HD Microphone for Crisp Calls'
    ],
    availability: 'In Stock',
    featured: true,
    isNewArrival: false,
    showOnHomepage: true,
    whatsappEnabled: true,
    displayOrder: 6,
    createdAt: '2026-09-22T10:00:00Z',
    updatedAt: '2026-10-04T12:00:00Z',
  },
  {
    id: 'prod-7',
    name: 'Smart Watch',
    category: 'Smart Devices',
    brand: 'Generic Tech',
    price: 4499,
    oldPrice: 5200,
    badge: 'NEW',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    shortDescription: '1.4-inch color display smartwatch with call alerts, heart rate & steps.',
    description: 'Vibrant touchscreen smartwatch featuring Bluetooth call notifications, continuous heart rate and sleep tracking, multiple sports modes, and 7-day battery life.',
    specifications: [
      'Screen: 1.4-inch HD Color Touch',
      'Battery Life: 7-10 Days Regular Use',
      'Alerts: WhatsApp, Calls, SMS',
      'Waterproof: IP67 Daily Splash Proof'
    ],
    availability: 'In Stock',
    featured: true,
    isNewArrival: true,
    showOnHomepage: true,
    whatsappEnabled: true,
    displayOrder: 7,
    createdAt: '2026-09-25T10:00:00Z',
    updatedAt: '2026-10-04T12:00:00Z',
  },
  {
    id: 'prod-8',
    name: 'LED Emergency Light',
    category: 'LED & Lights',
    brand: 'Generic Tech',
    price: 1899,
    image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&auto=format&fit=crop&q=80',
    shortDescription: 'Rechargeable 30W emergency lantern with long backup for home load-shedding.',
    description: 'Ultra-bright emergency lamp with high lumen output. Includes 360-degree illumination, dimmable switch, and sturdy top hook for hanging in shop or home.',
    specifications: [
      'Power: 30W Bright LED Tube',
      'Battery Backup: 6 to 10 Hours',
      'Rechargeable via Micro-USB',
      'Sturdy Metal Hook for Easy Hanging'
    ],
    availability: 'In Stock',
    featured: false,
    isNewArrival: true,
    showOnHomepage: true,
    whatsappEnabled: true,
    displayOrder: 8,
    createdAt: '2026-09-28T10:00:00Z',
    updatedAt: '2026-10-05T12:00:00Z',
  },
  {
    id: 'prod-9',
    name: 'Mobile Charger',
    category: 'Chargers',
    brand: 'Generic Tech',
    price: 999,
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
    shortDescription: 'Reliable 18W dual USB wall charger adapter with short-circuit protection.',
    description: 'Compact daily wall charger adapter supporting standard and fast-charge devices with heat-resistant construction.',
    specifications: [
      'Output: 18W Auto-Detect',
      'Dual USB Ports for 2 Devices',
      'Over-voltage and Surge Protection'
    ],
    availability: 'In Stock',
    featured: false,
    isNewArrival: false,
    showOnHomepage: true,
    whatsappEnabled: true,
    displayOrder: 9,
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-05T12:00:00Z',
  },
  {
    id: 'prod-10',
    name: 'Computer Mouse',
    category: 'Computer Accessories',
    brand: 'Generic Tech',
    price: 899,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80',
    shortDescription: 'Silent click 2.4GHz wireless optical mouse with nano receiver.',
    description: 'Ergonomic shape with silent click switches and smart power-saving sleep mode giving up to 12 months battery life.',
    specifications: [
      'Connectivity: 2.4GHz Wireless Nano USB',
      'DPI: 1600 Optical Precision',
      'Buttons: Silent Left & Right + Smooth Scroll Wheel'
    ],
    availability: 'In Stock',
    featured: false,
    isNewArrival: false,
    showOnHomepage: true,
    whatsappEnabled: true,
    displayOrder: 10,
    createdAt: '2026-10-02T10:00:00Z',
    updatedAt: '2026-10-05T12:00:00Z',
  },
  {
    id: 'prod-11',
    name: 'Keyboard',
    category: 'Computer Accessories',
    brand: 'Generic Tech',
    price: 1499,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    shortDescription: 'Slim membrane USB computer keyboard with spill-resistant layout.',
    description: 'Full-size 104-key USB keyboard with quiet keys, numeric keypad, and durable laser-etched lettering for office or home typing.',
    specifications: [
      'Keys: Full-size 104 Keys with Numpad',
      'Cable: 1.5m Durable USB Cable',
      'Spill-Resistant Drain Holes'
    ],
    availability: 'In Stock',
    featured: false,
    isNewArrival: true,
    showOnHomepage: true,
    whatsappEnabled: true,
    displayOrder: 11,
    createdAt: '2026-10-03T10:00:00Z',
    updatedAt: '2026-10-05T12:00:00Z',
  },
  {
    id: 'prod-12',
    name: 'Bluetooth Neckband',
    category: 'Earphones',
    brand: 'Generic Tech',
    price: 1799,
    oldPrice: 2200,
    badge: 'LIMITED',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
    shortDescription: 'Flexible magnetic wireless neckband earphone with 25-hour battery.',
    description: 'Lightweight silicone neckband with magnetic earbuds that snap together when idle. Features vibration alerts on incoming calls and clear mic.',
    specifications: [
      'Battery Life: 25 Hours Non-stop Playback',
      'Magnetic Earbuds with Auto-Pause',
      'Bluetooth 5.2 with Fast Pair',
      'In-line Volume and Call Buttons'
    ],
    availability: 'Limited Stock',
    featured: false,
    isNewArrival: false,
    showOnHomepage: true,
    whatsappEnabled: true,
    displayOrder: 12,
    createdAt: '2026-10-04T10:00:00Z',
    updatedAt: '2026-10-05T12:00:00Z',
  }
];

const defaultOffers: Offer[] = [
  {
    id: 'offer-1',
    title: 'MEGA ELECTRONICS SALE',
    description: 'Up to 30% OFF on Selected Audio, Chargers and Accessories at Hassan Abdal shop.',
    discountType: 'percentage',
    discountValue: 30,
    bannerImage: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1200&auto=format&fit=crop&q=80',
    buttonText: 'Shop Sale Items',
    buttonLink: '#products',
    isActive: true,
    displayLocation: 'banner',
    productIds: ['prod-1', 'prod-2', 'prod-5', 'prod-6'],
    createdAt: '2026-10-01T10:00:00Z'
  }
];

const defaultMedia: MediaItem[] = [
  { id: 'm-1', title: 'Showroom Hero Banner', url: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1600&auto=format&fit=crop&q=80', category: 'hero', createdAt: '2026-10-01T10:00:00Z' },
  { id: 'm-2', title: 'Wireless Earbuds Studio', url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80', category: 'product', createdAt: '2026-10-01T10:00:00Z' },
  { id: 'm-3', title: 'Bluetooth Speaker Studio', url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80', category: 'product', createdAt: '2026-10-01T10:00:00Z' },
  { id: 'm-4', title: 'Fast Charger Studio', url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80', category: 'product', createdAt: '2026-10-01T10:00:00Z' },
  { id: 'm-5', title: 'Braided Cable Studio', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80', category: 'product', createdAt: '2026-10-01T10:00:00Z' },
  { id: 'm-6', title: 'Power Bank Studio', url: 'https://images.unsplash.com/photo-1609592424109-dd9892f1b177?w=800&auto=format&fit=crop&q=80', category: 'product', createdAt: '2026-10-01T10:00:00Z' },
  { id: 'm-7', title: 'Smart Watch Studio', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80', category: 'product', createdAt: '2026-10-01T10:00:00Z' },
];

const defaultInitialData: StoreData = {
  admin: {
    username: 'admin',
    passwordHash: hashPassword('admin123', initialSalt),
    salt: initialSalt,
  },
  settings: defaultSettings,
  homepage: defaultHomepageConfig,
  categories: defaultCategories,
  products: defaultProducts,
  offers: defaultOffers,
  media: defaultMedia,
  inquiries: [],
  contactMessages: []
};

// Database operations
function readData(): StoreData {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      writeData(defaultInitialData);
      return defaultInitialData;
    }
    const content = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(content);
    // Ensure all upgraded fields exist
    if (!parsed.homepage) parsed.homepage = defaultHomepageConfig;
    if (!parsed.offers) parsed.offers = defaultOffers;
    if (!parsed.media) parsed.media = defaultMedia;
    if (!parsed.settings.whatsappTemplate) parsed.settings.whatsappTemplate = defaultSettings.whatsappTemplate;
    if (parsed.settings.whatsappFloatingEnabled === undefined) parsed.settings.whatsappFloatingEnabled = true;
    if (parsed.settings.whatsappProductButtonEnabled === undefined) parsed.settings.whatsappProductButtonEnabled = true;
    if (!parsed.settings.themePreset) parsed.settings.themePreset = 'ocean-blue';
    return parsed;
  } catch (err) {
    console.error('Error reading database file:', err);
    return defaultInitialData;
  }
}

function writeData(data: StoreData): void {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing database file:', err);
  }
}

// Middleware
app.use(express.json({ limit: '30mb' }));

// Auth middleware for protected routes
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Admin authentication token required' });
  }
  const token = authHeader.substring(7);
  if (!verifyToken(token)) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
  next();
}

// ==================== API ROUTES ====================

// --- AUTH ---
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const data = readData();
  const inputHash = hashPassword(password, data.admin.salt);

  if (username === data.admin.username && inputHash === data.admin.passwordHash) {
    const token = generateToken(username);
    return res.json({
      success: true,
      token,
      user: { username: data.admin.username }
    });
  }

  return res.status(401).json({ error: 'Invalid username or password' });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ authenticated: false });
  }
  const token = authHeader.substring(7);
  if (verifyToken(token)) {
    const data = readData();
    return res.json({ authenticated: true, user: { username: data.admin.username } });
  }
  return res.status(401).json({ authenticated: false });
});

app.post('/api/auth/change-password', requireAdmin, (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }

  const data = readData();
  const currentHash = hashPassword(currentPassword, data.admin.salt);
  if (currentHash !== data.admin.passwordHash) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }

  const newSalt = crypto.randomBytes(16).toString('hex');
  data.admin.salt = newSalt;
  data.admin.passwordHash = hashPassword(newPassword, newSalt);
  writeData(data);

  return res.json({ success: true, message: 'Password updated successfully' });
});

// --- STORE SETTINGS ---
app.get('/api/settings', (_req: Request, res: Response) => {
  const data = readData();
  res.json(data.settings);
});

app.put('/api/settings', requireAdmin, (req: Request, res: Response) => {
  const data = readData();
  const updatedSettings: StoreSettings = {
    ...data.settings,
    ...req.body
  };
  data.settings = updatedSettings;
  writeData(data);
  res.json({ success: true, settings: data.settings });
});

// --- HOMEPAGE CONFIG & SECTION MANAGER ---
app.get('/api/homepage', (_req: Request, res: Response) => {
  const data = readData();
  res.json(data.homepage || defaultHomepageConfig);
});

app.put('/api/homepage', requireAdmin, (req: Request, res: Response) => {
  const data = readData();
  data.homepage = {
    ...data.homepage,
    ...req.body
  };
  writeData(data);
  res.json({ success: true, homepage: data.homepage });
});

// --- CATEGORIES ---
app.get('/api/categories', (_req: Request, res: Response) => {
  const data = readData();
  const categoriesWithCount = data.categories.map(cat => ({
    ...cat,
    count: data.products.filter(p => p.category.toLowerCase() === cat.name.toLowerCase()).length
  }));
  // Sort by order
  categoriesWithCount.sort((a, b) => (a.order || 0) - (b.order || 0));
  res.json(categoriesWithCount);
});

app.post('/api/categories', requireAdmin, (req: Request, res: Response) => {
  const { name, description, image, icon, isVisible } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  const data = readData();
  const exists = data.categories.some(c => c.name.toLowerCase() === name.trim().toLowerCase());
  if (exists) {
    return res.status(400).json({ error: 'A category with this name already exists' });
  }

  const newCat: Category = {
    id: `cat-${Date.now()}`,
    name: name.trim(),
    description: description ? description.trim() : '',
    image: image ? image.trim() : '',
    icon: icon || '',
    order: data.categories.length + 1,
    isVisible: isVisible !== false,
  };

  data.categories.push(newCat);
  writeData(data);
  res.status(201).json(newCat);
});

app.put('/api/categories/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, image, icon, order, isVisible } = req.body;

  const data = readData();
  const index = data.categories.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Category not found' });
  }

  const oldName = data.categories[index].name;
  if (name && name.trim()) {
    const trimmed = name.trim();
    data.categories[index].name = trimmed;

    // Update products using the old category name
    data.products.forEach(p => {
      if (p.category.toLowerCase() === oldName.toLowerCase()) {
        p.category = trimmed;
      }
    });
  }

  if (description !== undefined) data.categories[index].description = description.trim();
  if (image !== undefined) data.categories[index].image = image.trim();
  if (icon !== undefined) data.categories[index].icon = icon;
  if (order !== undefined) data.categories[index].order = Number(order);
  if (isVisible !== undefined) data.categories[index].isVisible = Boolean(isVisible);

  writeData(data);
  res.json(data.categories[index]);
});

app.delete('/api/categories/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const data = readData();
  const category = data.categories.find(c => c.id === id);
  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }

  // Count products in this category
  const productsInCategory = data.products.filter(p => p.category.toLowerCase() === category.name.toLowerCase());
  if (productsInCategory.length > 0) {
    let otherCat = data.categories.find(c => c.name.toLowerCase() === 'other electronics');
    if (!otherCat) {
      otherCat = { id: `cat-${Date.now()}`, name: 'Other Electronics', isVisible: true, order: 99 };
      data.categories.push(otherCat);
    }
    productsInCategory.forEach(p => {
      p.category = 'Other Electronics';
    });
  }

  data.categories = data.categories.filter(c => c.id !== id);
  writeData(data);
  res.json({ success: true, message: 'Category deleted' });
});

// --- PRODUCTS ---
app.get('/api/products', (req: Request, res: Response) => {
  const { category, search, availability, sort, featured, newArrival, limit } = req.query;
  const data = readData();
  let list = [...data.products];

  // Category filter
  if (category && typeof category === 'string' && category.toLowerCase() !== 'all') {
    list = list.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  // Availability filter
  if (availability && typeof availability === 'string' && availability.toLowerCase() !== 'all') {
    list = list.filter(p => p.availability.toLowerCase() === availability.toLowerCase());
  }

  // Featured filter
  if (featured === 'true') {
    list = list.filter(p => p.featured === true);
  }

  // New Arrival filter
  if (newArrival === 'true') {
    list = list.filter(p => p.isNewArrival === true);
  }

  // Search filter
  if (search && typeof search === 'string' && search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      p.description.toLowerCase().includes(q) ||
      (p.shortDescription && p.shortDescription.toLowerCase().includes(q)) ||
      (p.specifications && p.specifications.some(s => s.toLowerCase().includes(q)))
    );
  }

  // Sort
  if (sort === 'price_asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    list.sort((a, b) => b.price - a.price);
  } else if (sort === 'popular') {
    list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  } else if (sort === 'newest') {
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else {
    // Default by displayOrder if available, then newest
    list.sort((a, b) => (a.displayOrder || 999) - (b.displayOrder || 999));
  }

  if (limit && !isNaN(Number(limit))) {
    list = list.slice(0, Number(limit));
  }

  res.json(list);
});

app.get('/api/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const data = readData();
  const product = data.products.find(p => p.id === id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

app.post('/api/products', requireAdmin, (req: Request, res: Response) => {
  const { 
    name, 
    category, 
    brand, 
    price, 
    oldPrice, 
    discount, 
    badge, 
    image, 
    additionalImages, 
    shortDescription, 
    description, 
    specifications, 
    availability, 
    featured, 
    isNewArrival, 
    showOnHomepage, 
    whatsappEnabled, 
    displayOrder 
  } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Product name is required' });
  }
  if (!category || typeof category !== 'string' || !category.trim()) {
    return res.status(400).json({ error: 'Category is required' });
  }
  if (price === undefined || isNaN(Number(price)) || Number(price) <= 0) {
    return res.status(400).json({ error: 'A valid numeric price in PKR is required' });
  }

  const validAvailability = ['In Stock', 'Limited Stock', 'Out of Stock'].includes(availability)
    ? availability
    : 'In Stock';

  const defaultImage = 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80';

  const newProduct: Product = {
    id: `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: name.trim(),
    category: category.trim(),
    brand: brand ? brand.trim() : 'Generic Tech',
    price: Number(price),
    oldPrice: oldPrice ? Number(oldPrice) : undefined,
    discount: discount ? discount.trim() : undefined,
    badge: badge || '',
    image: (image && image.trim()) ? image.trim() : defaultImage,
    additionalImages: Array.isArray(additionalImages) ? additionalImages.filter(img => typeof img === 'string' && img.trim()) : [],
    shortDescription: shortDescription ? shortDescription.trim() : '',
    description: (description && description.trim()) ? description.trim() : '',
    specifications: Array.isArray(specifications) ? specifications.filter(s => typeof s === 'string' && s.trim()) : [],
    availability: validAvailability,
    featured: Boolean(featured),
    isNewArrival: Boolean(isNewArrival),
    showOnHomepage: showOnHomepage !== false,
    whatsappEnabled: whatsappEnabled !== false,
    displayOrder: displayOrder ? Number(displayOrder) : 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const data = readData();
  data.products.unshift(newProduct);
  writeData(data);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const data = readData();
  const index = data.products.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const existing = data.products[index];
  const updatedProduct: Product = {
    ...existing,
    ...req.body,
    price: req.body.price !== undefined ? Number(req.body.price) : existing.price,
    oldPrice: req.body.oldPrice !== undefined ? (req.body.oldPrice ? Number(req.body.oldPrice) : undefined) : existing.oldPrice,
    updatedAt: new Date().toISOString(),
  };

  data.products[index] = updatedProduct;
  writeData(data);
  res.json(updatedProduct);
});

// Quick price patch directly from table
app.patch('/api/products/:id/price', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { price, oldPrice } = req.body;

  if (price === undefined || isNaN(Number(price)) || Number(price) <= 0) {
    return res.status(400).json({ error: 'Valid price is required' });
  }

  const data = readData();
  const prod = data.products.find(p => p.id === id);
  if (!prod) {
    return res.status(404).json({ error: 'Product not found' });
  }

  prod.price = Number(price);
  if (oldPrice !== undefined) prod.oldPrice = oldPrice ? Number(oldPrice) : undefined;
  prod.updatedAt = new Date().toISOString();
  writeData(data);
  res.json(prod);
});

app.patch('/api/products/:id/stock', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { availability } = req.body;

  if (!['In Stock', 'Limited Stock', 'Out of Stock'].includes(availability)) {
    return res.status(400).json({ error: 'Invalid availability status' });
  }

  const data = readData();
  const product = data.products.find(p => p.id === id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  product.availability = availability;
  product.updatedAt = new Date().toISOString();
  writeData(data);
  res.json(product);
});

app.patch('/api/products/:id/featured', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { featured } = req.body;

  const data = readData();
  const product = data.products.find(p => p.id === id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  product.featured = Boolean(featured);
  product.updatedAt = new Date().toISOString();
  writeData(data);
  res.json(product);
});

// Duplicate product
app.post('/api/products/:id/duplicate', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const data = readData();
  const source = data.products.find(p => p.id === id);
  if (!source) {
    return res.status(404).json({ error: 'Source product not found' });
  }

  const duplicated: Product = {
    ...source,
    id: `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: `${source.name} (Copy)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  data.products.unshift(duplicated);
  writeData(data);
  res.status(201).json(duplicated);
});

// Bulk product actions
app.post('/api/products/bulk', requireAdmin, (req: Request, res: Response) => {
  const { action, productIds, payload } = req.body;
  if (!Array.isArray(productIds) || productIds.length === 0) {
    return res.status(400).json({ error: 'productIds array is required' });
  }

  const data = readData();

  if (action === 'delete') {
    data.products = data.products.filter(p => !productIds.includes(p.id));
  } else if (action === 'stock') {
    data.products.forEach(p => {
      if (productIds.includes(p.id)) p.availability = payload.availability;
    });
  } else if (action === 'featured') {
    data.products.forEach(p => {
      if (productIds.includes(p.id)) p.featured = Boolean(payload.featured);
    });
  } else if (action === 'newArrival') {
    data.products.forEach(p => {
      if (productIds.includes(p.id)) p.isNewArrival = Boolean(payload.isNewArrival);
    });
  } else if (action === 'category') {
    data.products.forEach(p => {
      if (productIds.includes(p.id)) p.category = payload.category;
    });
  } else if (action === 'discountPercent') {
    const pct = Number(payload.percent);
    if (!isNaN(pct) && pct > 0 && pct < 100) {
      data.products.forEach(p => {
        if (productIds.includes(p.id)) {
          if (!p.oldPrice || p.oldPrice <= p.price) p.oldPrice = p.price;
          p.price = Math.round(p.price * (1 - pct / 100));
          p.discount = `${pct}% OFF`;
          p.badge = 'SALE';
        }
      });
    }
  }

  writeData(data);
  res.json({ success: true, count: productIds.length });
});

app.delete('/api/products/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const data = readData();
  const index = data.products.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  data.products.splice(index, 1);
  writeData(data);
  res.json({ success: true, message: 'Product deleted successfully' });
});

// --- OFFERS & PROMOTIONS ---
app.get('/api/offers', (_req: Request, res: Response) => {
  const data = readData();
  res.json(data.offers || []);
});

app.post('/api/offers', requireAdmin, (req: Request, res: Response) => {
  const { title, description, discountType, discountValue, bannerImage, buttonText, buttonLink, startDate, endDate, displayLocation, productIds, isActive } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }

  const data = readData();
  const newOffer: Offer = {
    id: `offer-${Date.now()}`,
    title: title.trim(),
    description: description.trim(),
    discountType: discountType || 'percentage',
    discountValue: Number(discountValue) || 0,
    bannerImage: bannerImage || '',
    buttonText: buttonText || 'Shop Now',
    buttonLink: buttonLink || '#products',
    startDate,
    endDate,
    isActive: isActive !== false,
    displayLocation: displayLocation || 'banner',
    productIds: Array.isArray(productIds) ? productIds : [],
    createdAt: new Date().toISOString()
  };

  data.offers.unshift(newOffer);
  writeData(data);
  res.status(201).json(newOffer);
});

app.put('/api/offers/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const data = readData();
  const idx = data.offers.findIndex(o => o.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Offer not found' });

  data.offers[idx] = {
    ...data.offers[idx],
    ...req.body
  };
  writeData(data);
  res.json(data.offers[idx]);
});

app.patch('/api/offers/:id/toggle', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const data = readData();
  const offer = data.offers.find(o => o.id === id);
  if (!offer) return res.status(404).json({ error: 'Offer not found' });

  offer.isActive = !offer.isActive;
  writeData(data);
  res.json(offer);
});

app.delete('/api/offers/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const data = readData();
  data.offers = data.offers.filter(o => o.id !== id);
  writeData(data);
  res.json({ success: true });
});

// --- MEDIA LIBRARY ---
app.get('/api/media', (_req: Request, res: Response) => {
  const data = readData();
  res.json(data.media || []);
});

app.post('/api/media', requireAdmin, (req: Request, res: Response) => {
  const { title, url, category } = req.body;
  if (!url) return res.status(400).json({ error: 'Image URL or data is required' });

  const data = readData();
  const item: MediaItem = {
    id: `media-${Date.now()}`,
    title: title ? title.trim() : 'Uploaded Image',
    url: url.trim(),
    category: category || 'product',
    createdAt: new Date().toISOString()
  };

  data.media.unshift(item);
  writeData(data);
  res.status(201).json(item);
});

app.delete('/api/media/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const data = readData();
  data.media = data.media.filter(m => m.id !== id);
  writeData(data);
  res.json({ success: true });
});

// --- INQUIRIES & WHATSAPP ORDERS ---
app.post('/api/inquiries', (req: Request, res: Response) => {
  const { customerName, customerPhone, productId, productName, price, quantity, message } = req.body;
  if (!productName) {
    return res.status(400).json({ error: 'Product name is required' });
  }

  const data = readData();
  const newInquiry: Inquiry = {
    id: `inq-${Date.now()}`,
    customerName: customerName ? customerName.trim() : 'Customer',
    customerPhone: customerPhone ? customerPhone.trim() : '',
    productId: productId || '',
    productName: productName.trim(),
    price: Number(price) || 0,
    quantity: Number(quantity) || 1,
    message: message ? message.trim() : '',
    status: 'New',
    createdAt: new Date().toISOString()
  };

  data.inquiries.unshift(newInquiry);
  writeData(data);

  // Build clean WhatsApp message using configurable template
  const cleanPhone = data.settings.whatsappNumber.replace(/^0/, '92').replace(/[^0-9]/g, '');
  
  // Find product category if available
  const product = data.products.find(p => p.id === productId);
  const categoryStr = product?.category || 'Electronics';

  let template = data.settings.whatsappTemplate || 'Assalam-o-Alaikum Ali Electronic, I am interested in {product_name}. Current price is {price}. Please confirm availability.';
  
  template = template
    .replace('{product_name}', newInquiry.productName)
    .replace('{price}', `Rs. ${newInquiry.price.toLocaleString()}`)
    .replace('{category}', categoryStr);

  const qtyStr = newInquiry.quantity > 1 ? ` (Qty: ${newInquiry.quantity})` : '';
  const userMsg = newInquiry.message ? `\nNote: ${newInquiry.message}` : '';
  const customerInfo = newInquiry.customerName !== 'Customer' ? `\nFrom: ${newInquiry.customerName}${newInquiry.customerPhone ? ' (' + newInquiry.customerPhone + ')' : ''}` : '';

  const fullText = `${template}${qtyStr}${userMsg}${customerInfo}`;
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(fullText)}`;

  res.status(201).json({
    success: true,
    inquiry: newInquiry,
    whatsappUrl
  });
});

app.get('/api/inquiries', requireAdmin, (_req: Request, res: Response) => {
  const data = readData();
  res.json(data.inquiries);
});

app.patch('/api/inquiries/:id/status', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const data = readData();
  const inq = data.inquiries.find(i => i.id === id);
  if (!inq) {
    return res.status(404).json({ error: 'Inquiry not found' });
  }
  inq.status = status;
  writeData(data);
  res.json(inq);
});

app.delete('/api/inquiries/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const data = readData();
  data.inquiries = data.inquiries.filter(i => i.id !== id);
  writeData(data);
  res.json({ success: true, message: 'Inquiry deleted' });
});

// --- CONTACT FORM ---
app.post('/api/contact', (req: Request, res: Response) => {
  const { name, phone, message } = req.body;
  if (!name || !phone || !message) {
    return res.status(400).json({ error: 'Name, phone, and message are required' });
  }

  const data = readData();
  const newMsg: ContactMessage = {
    id: `msg-${Date.now()}`,
    name: name.trim(),
    phone: phone.trim(),
    message: message.trim(),
    status: 'Unread',
    createdAt: new Date().toISOString()
  };

  data.contactMessages.unshift(newMsg);
  writeData(data);

  const cleanPhone = data.settings.whatsappNumber.replace(/^0/, '92').replace(/[^0-9]/g, '');
  const text = `Assalam-o-Alaikum Ali Electronic, my name is ${name.trim()} (${phone.trim()}). ${message.trim()}`;
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;

  res.status(201).json({ success: true, message: 'Thank you! Your message has been received.', whatsappUrl });
});

app.get('/api/contact', requireAdmin, (_req: Request, res: Response) => {
  const data = readData();
  res.json(data.contactMessages);
});

app.delete('/api/contact/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const data = readData();
  data.contactMessages = data.contactMessages.filter(m => m.id !== id);
  writeData(data);
  res.json({ success: true });
});

// --- ADMIN STATS ---
app.get('/api/admin/stats', requireAdmin, (_req: Request, res: Response) => {
  const data = readData();
  const totalProducts = data.products.length;
  const inStock = data.products.filter(p => p.availability === 'In Stock').length;
  const featuredProducts = data.products.filter(p => p.featured).length;
  const newArrivals = data.products.filter(p => p.isNewArrival).length;
  const activeOffers = (data.offers || []).filter(o => o.isActive).length;
  const outOfStock = data.products.filter(p => p.availability === 'Out of Stock').length;
  const totalCategories = data.categories.length;
  const totalInquiries = data.inquiries.length;
  const newInquiries = data.inquiries.filter(i => i.status === 'New').length;
  const unreadMessages = data.contactMessages.filter(m => m.status === 'Unread').length;

  res.json({
    totalProducts,
    inStock,
    featuredProducts,
    newArrivals,
    activeOffers,
    outOfStock,
    totalCategories,
    totalInquiries,
    newInquiries,
    unreadMessages,
    recentInquiries: data.inquiries.slice(0, 5),
    recentProducts: data.products.slice(0, 5),
  });
});

// ==================== SERVE FRONTEND ====================
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Ali Electronic Server listening on port ${PORT} (mode: ${isProduction ? 'production' : 'development'})`);
  });
}

startServer();

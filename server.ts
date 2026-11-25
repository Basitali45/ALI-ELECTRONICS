import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { execFile } from 'child_process';
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
  AdminStats,
  Order,
  OrderItem,
  OrderStatus 
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
const JWT_SECRET = process.env.JWT_SECRET || 'zaplix-secret-key-2026';

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
  orders: Order[];
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

// Initial seed data (ZAPLIX)
const initialSalt = crypto.randomBytes(16).toString('hex');

const defaultHomepageConfig: HomepageConfig = {
  "heroHeading": "Shop Smarter. Live Better.",
  "heroSubtitle": "Pakistan's trusted multi-category online store. Free Home Delivery on all orders with guaranteed Cash on Delivery.",
  "heroBackgroundImage": "/images/zaplix/hero.jpg",
  "heroOverlayOpacity": 0,
  "heroCtaText": "Shop Now",
  "heroCtaDestination": "#products",
  "heroSecondaryCtaText": "Contact on WhatsApp",
  "heroSecondaryCtaDestination": "#contact",
  "heroEnabled": true,
  "sections": [
    {
      "id": "announcement",
      "name": "Announcement Bar",
      "enabled": false,
      "order": 1
    },
    {
      "id": "hero",
      "name": "Hero Banner",
      "enabled": true,
      "order": 2
    },
    {
      "id": "offers",
      "name": "Special Offers & Promotions",
      "enabled": true,
      "order": 3
    },
    {
      "id": "categories",
      "name": "Shop by Category",
      "enabled": true,
      "order": 4
    },
    {
      "id": "featured",
      "name": "Featured Products",
      "enabled": true,
      "order": 5
    },
    {
      "id": "newArrivals",
      "name": "New Arrivals",
      "enabled": true,
      "order": 6
    }
  ],
  "announcementBar": {
    "enabled": true,
    "text": "FREE HOME DELIVERY ON ALL ORDERS • CASH ON DELIVERY • 7-DAY EASY RETURNS",
    "link": "#products",
    "style": "navy"
  },
  "promoPopup": {
    "enabled": false,
    "title": "Welcome to ZAPLIX",
    "description": "FREE HOME DELIVERY ON ALL ORDERS with zero minimum purchase requirement. Pay via Cash on Delivery when your parcel arrives.",
    "image": "/images/zaplix/hero.jpg",
    "buttonText": "Start Shopping",
    "buttonLink": "#products",
    "delaySeconds": 4,
    "showOnce": true
  }
} as HomepageConfig;

const defaultSettings: StoreSettings = {
  "businessName": "ZAPLIX",
  "tagline": "Shop Smarter. Live Better.",
  "supportingText": "Pakistan's trusted multi-category online store — electronics, fashion, beauty, home & accessories with Cash on Delivery & Free Home Delivery nationwide.",
  "location": "Pakistan (Online Store)",
  "googleMapsUrl": "",
  "phone1": "03189869746",
  "phone1Name": "Customer Support",
  "phone2": "03189869746",
  "phone2Name": "WhatsApp Desk",
  "whatsappNumber": "03189869746",
  "whatsappFloatingEnabled": true,
  "whatsappProductButtonEnabled": true,
  "whatsappTemplate": "Hello Zaplix Team!\n\nI would like to inquire about {product_name} (Price: {price}). Please confirm availability and delivery.",
  "businessHours": "Customer care available daily on phone & WhatsApp (03189869746)",
  "email": "support@zaplix.pk",
  "aboutText": "ZAPLIX is Pakistan's premier multi-category online shopping brand. We bring you curated, top-grade products with guaranteed Cash on Delivery, 100% Free Home Delivery on all orders, and 7-day hassle-free returns.",
  "logoUrl": "/images/zaplix/zaplix-logo-full-light.svg",
  "footerText": "© 2026 ZAPLIX. All rights reserved. Shop Smarter. Live Better.",
  "themePreset": "clean-premium",
  "deliveryCharges": 0,
  "currency": "PKR"
} as StoreSettings;

const defaultCategories: Category[] = [
  {
    "id": "cat-1",
    "name": "Fashion",
    "description": "Jackets, bags and everyday wardrobe essentials",
    "image": "/images/zaplix/red-jacket.jpg",
    "order": 1,
    "isVisible": true
  },
  {
    "id": "cat-2",
    "name": "Beauty",
    "description": "Skincare and beauty essentials",
    "image": "/images/zaplix/vitamin-c-serum.jpg",
    "order": 2,
    "isVisible": true
  },
  {
    "id": "cat-3",
    "name": "Home",
    "description": "Planters, decor and living essentials",
    "image": "/images/zaplix/ceramic-plant-pot.jpg",
    "order": 3,
    "isVisible": true
  },
  {
    "id": "cat-4",
    "name": "Accessories",
    "description": "Sunglasses, totes and finishing touches",
    "image": "/images/zaplix/tortoise-sunglasses.jpg",
    "order": 4,
    "isVisible": true
  }
] as Category[];

const defaultProducts: Product[] = [
  {
    "id": "prod-1",
    "name": "Classic Red Handbag",
    "category": "Fashion",
    "brand": "ZAPLIX",
    "price": 8900,
    "image": "/images/zaplix/red-handbag.jpg",
    "shortDescription": "Structured crossbody in rich red with a gold clasp.",
    "description": "A timeless structured crossbody with a gold-tone clasp and adjustable strap. Roomy enough for daily essentials.",
    "specifications": [
      "Colour: Classic Red",
      "Closure: Flap with gold clasp",
      "Strap: Adjustable crossbody"
    ],
    "availability": "In Stock",
    "featured": true,
    "isNewArrival": false,
    "showOnHomepage": true,
    "whatsappEnabled": true,
    "displayOrder": 1,
    "createdAt": "2026-10-05T10:00:00Z",
    "updatedAt": "2026-10-05T10:00:00Z"
  },
  {
    "id": "prod-2",
    "name": "Brightening Serum",
    "category": "Beauty",
    "brand": "ZAPLIX",
    "price": 4200,
    "image": "/images/zaplix/vitamin-c-serum.jpg",
    "shortDescription": "Daily glow serum with a lightweight dropper.",
    "description": "A lightweight brightening serum for a fresh, even-looking complexion. Apply a few drops morning or night.",
    "specifications": [
      "Size: 30 ml",
      "Format: Glass dropper bottle",
      "Use: Daily, AM or PM"
    ],
    "availability": "In Stock",
    "featured": true,
    "isNewArrival": false,
    "showOnHomepage": true,
    "whatsappEnabled": true,
    "displayOrder": 2,
    "createdAt": "2026-10-05T10:00:00Z",
    "updatedAt": "2026-10-05T10:00:00Z"
  },
  {
    "id": "prod-3",
    "name": "Ceramic Plant Pot",
    "category": "Home",
    "brand": "ZAPLIX",
    "price": 2800,
    "image": "/images/zaplix/ceramic-plant-pot.jpg",
    "shortDescription": "Glazed sage-green ceramic planter with saucer.",
    "description": "A hand-finished glazed ceramic planter in soft sage green with a matching saucer. Perfect for succulents.",
    "specifications": [
      "Material: Glazed ceramic",
      "Colour: Sage green",
      "Includes: Matching saucer"
    ],
    "availability": "In Stock",
    "featured": true,
    "isNewArrival": false,
    "showOnHomepage": true,
    "whatsappEnabled": true,
    "displayOrder": 3,
    "createdAt": "2026-10-05T10:00:00Z",
    "updatedAt": "2026-10-05T10:00:00Z"
  },
  {
    "id": "prod-4",
    "name": "Tortoise Sunglasses",
    "category": "Accessories",
    "brand": "ZAPLIX",
    "price": 3500,
    "image": "/images/zaplix/tortoise-sunglasses.jpg",
    "shortDescription": "Olive tortoise frames with gradient lenses.",
    "description": "Modern olive tortoise frames with gradient lenses for all-day comfort and UV protection.",
    "specifications": [
      "Frame: Olive tortoise",
      "Lenses: Gradient, UV protection",
      "Fit: Unisex"
    ],
    "availability": "In Stock",
    "featured": true,
    "isNewArrival": false,
    "showOnHomepage": true,
    "whatsappEnabled": true,
    "displayOrder": 4,
    "createdAt": "2026-10-05T10:00:00Z",
    "updatedAt": "2026-10-05T10:00:00Z"
  },
  {
    "id": "prod-5",
    "name": "Essential Red Jacket",
    "category": "Fashion",
    "brand": "ZAPLIX",
    "price": 8900,
    "image": "/images/zaplix/red-jacket.jpg",
    "shortDescription": "Clean-cut zip jacket in deep red.",
    "description": "An everyday zip jacket with a clean collar, front zip and ribbed hem. Easy to layer, easy to wear.",
    "specifications": [
      "Colour: Deep red",
      "Closure: Front zip",
      "Fit: Regular"
    ],
    "availability": "In Stock",
    "featured": false,
    "isNewArrival": true,
    "showOnHomepage": true,
    "whatsappEnabled": true,
    "displayOrder": 5,
    "createdAt": "2026-10-08T10:00:00Z",
    "updatedAt": "2026-10-08T10:00:00Z"
  },
  {
    "id": "prod-6",
    "name": "Vitamin C Serum",
    "category": "Beauty",
    "brand": "ZAPLIX",
    "price": 3200,
    "image": "/images/zaplix/vitamin-c-serum.jpg",
    "shortDescription": "Brightening vitamin C serum, 30 ml.",
    "description": "A vitamin C serum that helps brighten and refresh dull-looking skin. Light texture, quick absorption.",
    "specifications": [
      "Size: 30 ml",
      "Key ingredient: Vitamin C",
      "Format: Glass dropper bottle"
    ],
    "availability": "In Stock",
    "featured": false,
    "isNewArrival": true,
    "showOnHomepage": true,
    "whatsappEnabled": true,
    "displayOrder": 6,
    "createdAt": "2026-10-08T10:00:00Z",
    "updatedAt": "2026-10-08T10:00:00Z"
  },
  {
    "id": "prod-7",
    "name": "Ceramic Plant Pot",
    "category": "Home",
    "brand": "ZAPLIX",
    "price": 2400,
    "image": "/images/zaplix/ceramic-plant-pot.jpg",
    "shortDescription": "Compact sage-green ceramic planter.",
    "description": "A compact glazed ceramic planter in sage green — a small touch of greenery for any shelf or desk.",
    "specifications": [
      "Material: Glazed ceramic",
      "Colour: Sage green",
      "Size: Compact"
    ],
    "availability": "In Stock",
    "featured": false,
    "isNewArrival": true,
    "showOnHomepage": true,
    "whatsappEnabled": true,
    "displayOrder": 7,
    "createdAt": "2026-10-08T10:00:00Z",
    "updatedAt": "2026-10-08T10:00:00Z"
  },
  {
    "id": "prod-8",
    "name": "Woven Mini Tote",
    "category": "Accessories",
    "brand": "ZAPLIX",
    "price": 4500,
    "image": "/images/zaplix/woven-mini-tote.jpg",
    "shortDescription": "Hand-woven mini tote in lime green.",
    "description": "A hand-woven mini tote with sturdy handles. Light, roomy and easy to style.",
    "specifications": [
      "Material: Woven",
      "Colour: Lime green",
      "Size: Mini"
    ],
    "availability": "In Stock",
    "featured": false,
    "isNewArrival": true,
    "showOnHomepage": true,
    "whatsappEnabled": true,
    "displayOrder": 8,
    "createdAt": "2026-10-08T10:00:00Z",
    "updatedAt": "2026-10-08T10:00:00Z"
  }
] as Product[];

const defaultOffers: Offer[] = [
  {
    "id": "offer-1",
    "title": "Free Home Delivery Nationwide",
    "description": "FREE HOME DELIVERY ON ALL ORDERS — Cash on Delivery guaranteed nationwide.",
    "discountType": "fixed",
    "discountValue": 0,
    "bannerImage": "/images/zaplix/hero.jpg",
    "buttonText": "Shop Now",
    "buttonLink": "#products",
    "isActive": true,
    "displayLocation": "banner",
    "productIds": [],
    "createdAt": "2026-10-10T10:00:00Z"
  }
] as Offer[];

const defaultMedia: MediaItem[] = [
  {
    "id": "m-1",
    "title": "Zaplix Hero Banner",
    "url": "/images/zaplix/hero.jpg",
    "category": "hero",
    "createdAt": "2026-10-10T10:00:00Z"
  },
  {
    "id": "m-2",
    "title": "Classic Red Handbag",
    "url": "/images/zaplix/red-handbag.jpg",
    "category": "product",
    "createdAt": "2026-10-10T10:00:00Z"
  },
  {
    "id": "m-3",
    "title": "Vitamin C Serum",
    "url": "/images/zaplix/vitamin-c-serum.jpg",
    "category": "product",
    "createdAt": "2026-10-10T10:00:00Z"
  },
  {
    "id": "m-4",
    "title": "Ceramic Plant Pot",
    "url": "/images/zaplix/ceramic-plant-pot.jpg",
    "category": "product",
    "createdAt": "2026-10-10T10:00:00Z"
  },
  {
    "id": "m-5",
    "title": "Tortoise Sunglasses",
    "url": "/images/zaplix/tortoise-sunglasses.jpg",
    "category": "product",
    "createdAt": "2026-10-10T10:00:00Z"
  },
  {
    "id": "m-6",
    "title": "Essential Red Jacket",
    "url": "/images/zaplix/red-jacket.jpg",
    "category": "product",
    "createdAt": "2026-10-10T10:00:00Z"
  },
  {
    "id": "m-7",
    "title": "Woven Mini Tote",
    "url": "/images/zaplix/woven-mini-tote.jpg",
    "category": "product",
    "createdAt": "2026-10-10T10:00:00Z"
  }
] as MediaItem[];

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
  contactMessages: [],
  orders: []
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
    if (!parsed.orders) parsed.orders = [];
    if (!parsed.inquiries) parsed.inquiries = [];
    if (!parsed.contactMessages) parsed.contactMessages = [];
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

  const normalizedInput = username.trim().toLowerCase();
  const validAdminUser = 
    normalizedInput === data.admin.username.toLowerCase() ||
    normalizedInput === 'admin@zaplix.pk' ||
    normalizedInput === 'admin@zyvara.pk' ||
    normalizedInput === 'owner@zaplix.pk' ||
    normalizedInput === 'admin';

  if (validAdminUser && inputHash === data.admin.passwordHash) {
    const token = generateToken(data.admin.username);
    return res.json({
      success: true,
      token,
      user: { username: 'admin@zaplix.pk' }
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
      otherCat = { id: `cat-${Date.now()}`, name: 'Other Categories', isVisible: true, order: 99 };
      data.categories.push(otherCat);
    }
    productsInCategory.forEach(p => {
      p.category = 'Other Categories';
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
  const categoryStr = product?.category || 'Product';

  let template = data.settings.whatsappTemplate || 'Hello Zaplix Team!\n\nI would like to inquire about {product_name} (Price: {price}). Please confirm availability.';
  
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
  const text = `Hello Zaplix Team, my name is ${name.trim()} (${phone.trim()}). ${message.trim()}`;
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;

  res.status(201).json({ success: true, message: 'Thank you! Your message has been received.', whatsappUrl });
});

app.post('/api/complaints', (req: Request, res: Response) => {
  const { name, phone, orderNumber, details } = req.body || {};
  if (!name || !phone || !details) {
    return res.status(400).json({ error: 'Name, phone number, and complaint details are required.' });
  }

  const data = readData();
  const complaintId = `CMP-${Math.floor(1000 + Math.random() * 9000)}`;
  const cleanName = String(name).trim();
  const cleanPhone = String(phone).trim();
  const cleanOrder = orderNumber ? String(orderNumber).trim().toUpperCase() : '';
  const cleanDetails = String(details).trim();

  const formattedMessage = `[COMPLAINT ${complaintId}]${cleanOrder ? ` [Order: ${cleanOrder}]` : ''} ${cleanDetails}`;

  const newMsg: ContactMessage = {
    id: `cmp-${Date.now()}`,
    name: cleanName,
    phone: cleanPhone,
    message: formattedMessage,
    status: 'Unread',
    createdAt: new Date().toISOString()
  };

  data.contactMessages.unshift(newMsg);
  writeData(data);

  res.status(201).json({
    success: true,
    complaintId,
    name: cleanName,
    phone: cleanPhone,
    orderNumber: cleanOrder,
    details: cleanDetails,
    createdAt: newMsg.createdAt
  });
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

// --- ORDERS ---
app.get('/api/orders', (_req: Request, res: Response) => {
  const data = readData();
  res.json(data.orders || []);
});

app.post('/api/orders', (req: Request, res: Response) => {
  const { order } = req.body;
  if (!order || !order.customerName || !order.customerPhone) {
    return res.status(400).json({ error: 'Valid order data is required' });
  }
  const data = readData();
  if (!data.orders) data.orders = [];
  data.orders.unshift(order);
  writeData(data);
  res.status(201).json({ success: true, order });
});

app.patch('/api/orders/:id/status', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const data = readData();
  if (!data.orders) data.orders = [];
  const found = data.orders.find(o => o.id === id);
  if (!found) {
    return res.status(404).json({ error: 'Order not found' });
  }
  found.status = status;
  writeData(data);
  res.json(found);
});

app.delete('/api/orders/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const data = readData();
  if (!data.orders) data.orders = [];
  data.orders = data.orders.filter(o => o.id !== id);
  writeData(data);
  res.json({ success: true, message: 'Order deleted' });
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

  const orders = data.orders || [];
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const totalSales = orders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.totalAmount : 0), 0);
  const todayStr = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(o => o.createdAt && o.createdAt.startsWith(todayStr));
  const todaySales = todayOrders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.totalAmount : 0), 0);

  res.json({
    totalProducts,
    inStock,
    featuredProducts,
    newArrivals,
    activeOffers,
    outOfStock,
    totalCategories,
    totalOrders,
    pendingOrders,
    totalSales,
    todaySales,
    totalInquiries,
    newInquiries,
    unreadMessages,
    recentOrders: orders.slice(0, 5),
    recentInquiries: data.inquiries.slice(0, 5),
    recentProducts: data.products.slice(0, 5),
  });
});

// --- BILINGUAL TTS AUDIO PROXY (Urdu & English) ---
const ttsAudioCache = new Map<string, Buffer>();
const ttsWavCache = new Map<string, Buffer>();
const ttsInflight = new Map<string, Promise<Buffer | null>>();

function isValidAudioPayload(contentType: string, buf: Buffer): boolean {
  if (buf.length < 128) return false;
  // Reject HTML / JSON error pages masquerading as 200 OK
  const headAscii = buf.subarray(0, 16).toString('utf8').trimStart();
  if (headAscii.startsWith('<') || headAscii.startsWith('{')) return false;
  if (contentType && !contentType.includes('audio') && !contentType.includes('octet-stream')) {
    return false;
  }
  return true;
}

async function fetchUpstreamTtsMp3(rawInput: string, lang: 'ur' | 'en', allowSplitRetry = true): Promise<Buffer | null> {
  const text = rawInput
    .replace(/[\u200B-\u200F\u202A-\u202E\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200);
  if (!text) return null;

  const encoded = encodeURIComponent(text);
  const tlPrimary = lang;
  const tlAlt = lang === 'ur' ? 'ur-PK' : 'en-US';
  const candidates: Array<{ url: string; headers: Record<string, string> }> = [
    {
      url: `https://translate.google.com/translate_tts?ie=UTF-8&tl=${tlPrimary}&client=tw-ob&q=${encoded}`,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        Referer: 'https://translate.google.com/',
      },
    },
    {
      url: `https://translate.googleapis.com/translate_tts?ie=UTF-8&tl=${tlPrimary}&client=gtx&q=${encoded}`,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    },
    {
      url: `https://translate.google.com/translate_tts?ie=UTF-8&tl=${tlPrimary}&client=webapp&q=${encoded}`,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Referer: 'https://translate.google.com/',
      },
    },
    {
      url: `https://translate.google.com/translate_tts?ie=UTF-8&tl=${tlPrimary}&client=dict-chrome-ex&q=${encoded}`,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    },
    {
      url: `https://translate.google.com/translate_tts?ie=UTF-8&tl=${tlPrimary}&client=at&q=${encoded}`,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/126.0.0.0 Mobile Safari/537.36',
      },
    },
    {
      url: `https://translate.google.com/translate_tts?ie=UTF-8&tl=${tlAlt}&client=tw-ob&q=${encoded}`,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Referer: 'https://translate.google.com/',
      },
    },
  ];

  for (const candidate of candidates) {
    try {
      const upstream = await fetch(candidate.url, {
        headers: candidate.headers,
        signal: AbortSignal.timeout(5500),
      });
      if (!upstream.ok) continue;
      const ct = (upstream.headers.get('content-type') || '').toLowerCase();
      const buf = Buffer.from(await upstream.arrayBuffer());
      if (isValidAudioPayload(ct, buf)) {
        return buf;
      }
    } catch {
      // try next upstream TTS provider
    }
  }

  // If a longer snippet was rejected upstream, split once and concatenate MP3 frames
  if (allowSplitRetry && text.length > 90) {
    const mid = Math.floor(text.length / 2);
    let splitIdx = text.lastIndexOf(' ', mid + 15);
    if (splitIdx < 20) splitIdx = text.indexOf(' ', mid - 15);
    if (splitIdx > 10 && splitIdx < text.length - 10) {
      const firstHalf = await fetchUpstreamTtsMp3(text.slice(0, splitIdx), lang, false);
      const secondHalf = await fetchUpstreamTtsMp3(text.slice(splitIdx + 1), lang, false);
      if (firstHalf && secondHalf) {
        return Buffer.concat([firstHalf, secondHalf]);
      }
    }
  }

  return null;
}

async function getCachedOrFetchTtsMp3(rawText: string, lang: 'ur' | 'en'): Promise<Buffer | null> {
  const text = rawText.slice(0, 200);
  const cacheKey = `${lang}:${text}`;
  const cached = ttsAudioCache.get(cacheKey);
  if (cached) return cached;

  const existing = ttsInflight.get(cacheKey);
  if (existing) return existing;

  const promise = (async () => {
    try {
      const audioBuffer = await fetchUpstreamTtsMp3(text, lang);
      if (!audioBuffer) return null;

      if (ttsAudioCache.size > 250) {
        const firstKey = ttsAudioCache.keys().next().value;
        if (firstKey) ttsAudioCache.delete(firstKey);
      }
      ttsAudioCache.set(cacheKey, audioBuffer);
      return audioBuffer;
    } finally {
      ttsInflight.delete(cacheKey);
    }
  })();

  ttsInflight.set(cacheKey, promise);
  return promise;
}

function transcodeMp3ToWav(mp3Buffer: Buffer): Promise<Buffer | null> {
  return new Promise((resolve) => {
    try {
      const child = execFile(
        'ffmpeg',
        [
          '-hide_banner',
          '-loglevel',
          'error',
          '-f',
          'mp3',
          '-i',
          'pipe:0',
          '-ar',
          '16000',
          '-ac',
          '1',
          '-map_metadata',
          '-1',
          '-fflags',
          '+bitexact',
          '-f',
          'wav',
          'pipe:1',
        ],
        { encoding: 'buffer', maxBuffer: 8 * 1024 * 1024, timeout: 8000 },
        (err, stdout) => {
          if (
            err ||
            !stdout ||
            stdout.length < 256 ||
            stdout.subarray(0, 4).toString('ascii') !== 'RIFF'
          ) {
            resolve(null);
            return;
          }
          resolve(stdout);
        }
      );
      child.stdin?.end(mp3Buffer);
    } catch {
      resolve(null);
    }
  });
}

async function getCachedTtsPayload(
  rawText: string,
  lang: 'ur' | 'en',
  preferWav: boolean
): Promise<{ buffer: Buffer; mimeType: 'audio/wav' | 'audio/mpeg' } | null> {
  const mp3Buffer = await getCachedOrFetchTtsMp3(rawText, lang);
  if (!mp3Buffer) return null;

  if (preferWav) {
    const cacheKey = `${lang}:${rawText.slice(0, 200)}`;
    const cachedWav = ttsWavCache.get(cacheKey);
    if (cachedWav) {
      return { buffer: cachedWav, mimeType: 'audio/wav' };
    }
    const wavBuffer = await transcodeMp3ToWav(mp3Buffer);
    if (wavBuffer) {
      if (ttsWavCache.size > 160) {
        const firstKey = ttsWavCache.keys().next().value;
        if (firstKey) ttsWavCache.delete(firstKey);
      }
      ttsWavCache.set(cacheKey, wavBuffer);
      return { buffer: wavBuffer, mimeType: 'audio/wav' };
    }
  }

  return { buffer: mp3Buffer, mimeType: 'audio/mpeg' };
}

app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const rawText = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
    const langParam = typeof req.body?.lang === 'string' ? req.body.lang.trim().toLowerCase() : 'en';
    const lang: 'ur' | 'en' = langParam === 'ur' || langParam === 'urdu' ? 'ur' : 'en';
    const formatParam = typeof req.body?.format === 'string' ? req.body.format.trim().toLowerCase() : 'mp3';
    const preferWav = formatParam === 'wav';

    if (!rawText) {
      return res.status(400).json({ error: 'Missing text parameter' });
    }

    const payload = await getCachedTtsPayload(rawText, lang, preferWav);
    if (!payload) {
      return res.status(502).json({ error: 'TTS upstream unavailable' });
    }

    return res.json({
      audioBase64: payload.buffer.toString('base64'),
      mimeType: payload.mimeType,
      lang,
    });
  } catch (err) {
    console.error('POST TTS error:', err);
    res.status(500).json({ error: 'TTS generation failed' });
  }
});

app.get('/api/tts', async (req: Request, res: Response) => {
  try {
    const rawText = typeof req.query.text === 'string' ? req.query.text.trim() : '';
    const langParam = typeof req.query.lang === 'string' ? req.query.lang.trim().toLowerCase() : 'en';
    const lang: 'ur' | 'en' = langParam === 'ur' ? 'ur' : 'en';
    const formatParam = typeof req.query.format === 'string' ? req.query.format.trim().toLowerCase() : 'mp3';
    const preferWav = formatParam === 'wav';

    if (!rawText) {
      return res.status(400).json({ error: 'Missing text parameter' });
    }

    const payload = await getCachedTtsPayload(rawText, lang, preferWav);
    if (!payload) {
      return res.status(502).json({ error: 'TTS upstream unavailable' });
    }

    const audioBuffer = payload.buffer;
    const totalLength = audioBuffer.length;
    res.setHeader('Content-Type', payload.mimeType);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

    const rangeHeader = req.headers.range;
    if (rangeHeader) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader);
      if (match) {
        const start = match[1] ? parseInt(match[1], 10) : 0;
        const end = match[2] ? Math.min(parseInt(match[2], 10), totalLength - 1) : totalLength - 1;
        if (start >= 0 && start <= end && start < totalLength) {
          const chunk = audioBuffer.subarray(start, end + 1);
          res.status(206);
          res.setHeader('Content-Range', `bytes ${start}-${end}/${totalLength}`);
          res.setHeader('Content-Length', String(chunk.length));
          return res.send(chunk);
        }
      }
    }

    res.setHeader('Content-Length', String(totalLength));
    return res.send(audioBuffer);
  } catch (err) {
    console.error('TTS error:', err);
    res.status(500).json({ error: 'TTS generation failed' });
  }
});

// --- BILINGUAL TRANSLATION PROXY (Urdu <-> English) ---
const translationCache = new Map<string, string>();

async function translateSnippetUpstream(
  snippet: string,
  sourceLang: 'en' | 'ur',
  targetLang: 'en' | 'ur'
): Promise<string | null> {
  // Primary: Google Translate gtx endpoint (fast, accurate for Urdu + mixed product names)
  try {
    const gtxUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(snippet)}`;
    const gRes = await fetch(gtxUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    if (gRes.ok) {
      const gJson = (await gRes.json()) as unknown;
      if (Array.isArray(gJson) && Array.isArray(gJson[0])) {
        const joined = (gJson[0] as unknown[])
          .map((seg) => (Array.isArray(seg) && typeof seg[0] === 'string' ? seg[0] : ''))
          .join('')
          .trim();
        if (joined) return joined;
      }
    }
  } catch {
    // fallback to MyMemory below
  }

  // Backup: MyMemory
  try {
    const langPair = `${sourceLang}|${targetLang}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(snippet)}&langpair=${encodeURIComponent(langPair)}`;
    const upstream = await fetch(url);
    if (upstream.ok) {
      const json = (await upstream.json()) as {
        responseStatus?: number;
        responseData?: { translatedText?: string };
      };
      const out = json?.responseData?.translatedText?.trim();
      if (json?.responseStatus === 200 && out && !/MYMEMORY WARNING/i.test(out)) {
        return out;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

app.post('/api/translate', async (req: Request, res: Response) => {
  try {
    const rawText = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
    const toParam = typeof req.body?.to === 'string' ? req.body.to.trim().toLowerCase() : 'en';
    const targetLang: 'en' | 'ur' = toParam === 'ur' ? 'ur' : 'en';

    if (!rawText) {
      return res.status(400).json({ error: 'Missing text parameter' });
    }

    const cacheKey = `${targetLang}:${rawText}`;
    const cached = translationCache.get(cacheKey);
    if (cached) {
      return res.json({ translatedText: cached, targetLang });
    }

    const sourceLang: 'en' | 'ur' = targetLang === 'ur' ? 'en' : 'ur';

    // Translate line by line to preserve bullet structure
    const lines = rawText
      .split(/\n+/)
      .map((l: string) => l.replace(/^[•●▪▸‣⁃\-*]+\s*/, '').trim())
      .filter(Boolean);
    const translatedLines: string[] = [];

    for (const line of lines) {
      const snippet = line.slice(0, 480);

      // If target is Urdu and line mixes Urdu script with English words (e.g. product names),
      // translate the embedded English phrases separately so the full sentence speaks in Urdu.
      const hasUrduScript = /[\u0600-\u06FF]/.test(snippet);
      const hasLatinWords = /[A-Za-z]{2,}/.test(
        snippet.replace(/\b(?:ZX|CMP)[-\s]?\d{3,6}\b/gi, '').replace(/\b(?:Rs|COD|ZAPLIX)\b/gi, '')
      );

      if (targetLang === 'ur' && hasUrduScript && hasLatinWords) {
        let updated = snippet;
        const phraseMatches = snippet.match(/[A-Za-z][A-Za-z0-9\s&'-]{1,40}[A-Za-z0-9]|[A-Za-z]{2,}/g) || [];
        for (const phrase of phraseMatches) {
          const cleanPhrase = phrase.trim();
          if (/^(?:ZX|CMP|Rs|ZAPLIX|Zaplix|COD)$/i.test(cleanPhrase)) continue;
          const pOut = await translateSnippetUpstream(cleanPhrase, 'en', 'ur');
          if (pOut) {
            updated = updated.replace(phrase, pOut);
          }
        }
        translatedLines.push(updated);
        continue;
      }

      const out = await translateSnippetUpstream(snippet, sourceLang, targetLang);
      translatedLines.push(out || line);
    }

    const result = translatedLines.join('\n');
    if (translationCache.size > 500) {
      translationCache.clear();
    }
    translationCache.set(cacheKey, result);

    res.json({ translatedText: result, targetLang });
  } catch (err) {
    console.error('Translate error:', err);
    res.json({ translatedText: req.body?.text || '', targetLang: req.body?.to === 'ur' ? 'ur' : 'en' });
  }
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

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`ZAPLIX Server listening on http://0.0.0.0:${PORT} (mode: ${isProduction ? 'production' : 'development'})`);
  });
}

startServer();

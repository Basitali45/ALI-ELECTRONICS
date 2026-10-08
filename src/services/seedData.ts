import { Product, Category, Offer, HomepageConfig, StoreSettings } from '../types';

export const initialSettings: StoreSettings = {
  businessName: 'Ali Electronic',
  tagline: 'Smart Technology. Better Living.',
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
  businessHours: 'Opening Hours — Mon - Sat: 9:00 AM - 9:00 PM',
  email: 'contact@alielectronic.pk',
  aboutText: 'Ali Electronic is a local electronics business serving customers in Hassan Abdal with quality electronics products, competitive pricing and customer-focused service.',
  logoUrl: '',
  footerText: '© 2026 Ali Electronic. All Rights Reserved. Hassan Abdal, Pakistan.',
  themePreset: 'ocean-blue',
  deliveryCharges: 0,
  currency: 'PKR'
};

export const initialHomepage: HomepageConfig = {
  heroHeading: 'Smart Technology. Better Living.',
  heroSubtitle: 'Explore quality electronics, competitive prices and reliable service at Ali Electronic in Hassan Abdal.',
  heroBackgroundImage: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1600&auto=format&fit=crop&q=80',
  heroOverlayOpacity: 75,
  heroCtaText: 'Explore Products',
  heroCtaDestination: '#products',
  heroSecondaryCtaText: 'Contact Us',
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
    { id: 'map', name: 'Google Map Location', enabled: true, order: 10 }
  ],
  announcementBar: {
    enabled: true,
    text: '🔥 SPECIAL OFFER — Up to 30% OFF on Selected Electronics at Hassan Abdal Store!',
    link: '#products',
    style: 'gradient'
  },
  promoPopup: {
    enabled: false,
    title: 'MEGA ELECTRONICS SALE',
    description: 'Get amazing discounts and authentic accessories at Ali Electronic today.',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
    buttonText: 'Shop Special Offers',
    buttonLink: '#products',
    delaySeconds: 4,
    showOnce: true
  }
};

export const initialCategories: Category[] = [
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
  { id: 'cat-12', name: 'Home Electronics', description: 'Extension boards, sockets and power protectors', image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80', order: 12, isVisible: true }
];

export const initialProducts: Product[] = [
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
    updatedAt: '2026-10-01T12:00:00Z'
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
    updatedAt: '2026-10-02T12:00:00Z'
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
    updatedAt: '2026-10-02T12:00:00Z'
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
    updatedAt: '2026-10-02T12:00:00Z'
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
    updatedAt: '2026-10-03T12:00:00Z'
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
    updatedAt: '2026-10-04T12:00:00Z'
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
    updatedAt: '2026-10-04T12:00:00Z'
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
    updatedAt: '2026-10-05T12:00:00Z'
  }
];

export const initialOffers: Offer[] = [
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

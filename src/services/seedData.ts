import { Product, Category, Offer, HomepageConfig, StoreSettings } from '../types';

export const initialSettings: StoreSettings = {
  "businessName": "Zyvara",
  "tagline": "Minimal luxury for everyday living",
  "supportingText": "Curated products for fashion, beauty, home & accessories — designed for modern living.",
  "location": "Pakistan (Online Store)",
  "googleMapsUrl": "",
  "phone1": "03701893960",
  "phone1Name": "Customer Service",
  "phone2": "03079371104",
  "phone2Name": "Customer Service",
  "whatsappNumber": "03705776869",
  "whatsappFloatingEnabled": true,
  "whatsappProductButtonEnabled": true,
  "whatsappTemplate": "Assalam-o-Alaikum Zyvara, I am interested in {product_name}. Current price is {price}. Please confirm availability.",
  "businessHours": "Customer care available daily on phone & WhatsApp",
  "email": "",
  "aboutText": "Zyvara — minimal luxury for everyday living. Curated fashion, beauty, home & accessories.",
  "logoUrl": "",
  "footerText": "© 2026 ZVYARA. All rights reserved.",
  "themePreset": "clean-premium",
  "deliveryCharges": 200,
  "currency": "PKR"
} as StoreSettings;

export const initialHomepage: HomepageConfig = {
  "heroHeading": "Elevate Your Everyday",
  "heroSubtitle": "Curated products for fashion, beauty, home & accessories — designed for modern living.",
  "heroBackgroundImage": "/images/zyvara/hero.jpg",
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
    "enabled": false,
    "text": "Free shipping on orders above Rs. 3,000 • 7-day easy returns",
    "link": "#products",
    "style": "navy"
  },
  "promoPopup": {
    "enabled": false,
    "title": "Welcome to Zyvara",
    "description": "Free shipping on orders above Rs. 3,000 and 7-day easy returns.",
    "image": "/images/zyvara/hero.jpg",
    "buttonText": "Shop Now",
    "buttonLink": "#products",
    "delaySeconds": 4,
    "showOnce": true
  }
} as HomepageConfig;

export const initialCategories: Category[] = [
  {
    "id": "cat-1",
    "name": "Fashion",
    "description": "Jackets, bags and everyday wardrobe essentials",
    "image": "/images/zyvara/red-jacket.jpg",
    "order": 1,
    "isVisible": true
  },
  {
    "id": "cat-2",
    "name": "Beauty",
    "description": "Skincare and beauty essentials",
    "image": "/images/zyvara/vitamin-c-serum.jpg",
    "order": 2,
    "isVisible": true
  },
  {
    "id": "cat-3",
    "name": "Home",
    "description": "Planters, decor and living essentials",
    "image": "/images/zyvara/ceramic-plant-pot.jpg",
    "order": 3,
    "isVisible": true
  },
  {
    "id": "cat-4",
    "name": "Accessories",
    "description": "Sunglasses, totes and finishing touches",
    "image": "/images/zyvara/tortoise-sunglasses.jpg",
    "order": 4,
    "isVisible": true
  }
] as Category[];

export const initialProducts: Product[] = [
  {
    "id": "prod-1",
    "name": "Classic Red Handbag",
    "category": "Fashion",
    "brand": "Zyvara",
    "price": 8900,
    "image": "/images/zyvara/red-handbag.jpg",
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
    "brand": "Zyvara",
    "price": 4200,
    "image": "/images/zyvara/vitamin-c-serum.jpg",
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
    "brand": "Zyvara",
    "price": 2800,
    "image": "/images/zyvara/ceramic-plant-pot.jpg",
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
    "brand": "Zyvara",
    "price": 3500,
    "image": "/images/zyvara/tortoise-sunglasses.jpg",
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
    "brand": "Zyvara",
    "price": 8900,
    "image": "/images/zyvara/red-jacket.jpg",
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
    "brand": "Zyvara",
    "price": 3200,
    "image": "/images/zyvara/vitamin-c-serum.jpg",
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
    "brand": "Zyvara",
    "price": 2400,
    "image": "/images/zyvara/ceramic-plant-pot.jpg",
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
    "brand": "Zyvara",
    "price": 4500,
    "image": "/images/zyvara/woven-mini-tote.jpg",
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

export const initialOffers: Offer[] = [
  {
    "id": "offer-1",
    "title": "Free Shipping Over Rs. 3,000",
    "description": "Enjoy free shipping on all orders above Rs. 3,000 — plus 7-day easy returns.",
    "discountType": "fixed",
    "discountValue": 0,
    "bannerImage": "/images/zyvara/hero.jpg",
    "buttonText": "Shop Now",
    "buttonLink": "#products",
    "isActive": false,
    "displayLocation": "banner",
    "productIds": [],
    "createdAt": "2026-10-10T10:00:00Z"
  }
] as Offer[];

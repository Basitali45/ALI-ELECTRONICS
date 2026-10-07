export type AvailabilityStatus = 'In Stock' | 'Limited Stock' | 'Out of Stock';
export type ProductBadge = 'NEW' | 'SALE' | 'HOT' | 'POPULAR' | 'LIMITED' | 'BEST SELLER' | '';

export interface Product {
  id: string;
  name: string;
  category: string;
  brand?: string;
  price: number;
  oldPrice?: number;
  discount?: string;
  badge?: ProductBadge;
  image: string;
  additionalImages?: string[];
  shortDescription?: string;
  description: string;
  specifications: string[];
  availability: AvailabilityStatus;
  featured: boolean;
  isNewArrival?: boolean;
  showOnHomepage?: boolean;
  whatsappEnabled?: boolean;
  displayOrder?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  icon?: string;
  order?: number;
  isVisible?: boolean;
  count?: number;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  bannerImage?: string;
  buttonText?: string;
  buttonLink?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  displayLocation: 'hero' | 'banner' | 'listing' | 'detail' | 'popup';
  productIds?: string[];
  createdAt: string;
}

export interface HomepageSection {
  id: 'hero' | 'announcement' | 'offers' | 'categories' | 'featured' | 'newArrivals' | 'about' | 'whyUs' | 'contact' | 'map';
  name: string;
  enabled: boolean;
  order: number;
}

export interface AnnouncementBarConfig {
  enabled: boolean;
  text: string;
  link?: string;
  style?: 'gradient' | 'navy' | 'emerald' | 'amber';
  expiryDate?: string;
}

export interface PromoPopupConfig {
  enabled: boolean;
  title: string;
  description: string;
  image?: string;
  buttonText: string;
  buttonLink: string;
  delaySeconds: number;
  showOnce: boolean;
}

export interface HomepageConfig {
  heroHeading: string;
  heroSubtitle: string;
  heroBackgroundImage: string;
  heroOverlayOpacity: number; // 0 to 100
  heroCtaText: string;
  heroCtaDestination: string;
  heroSecondaryCtaText: string;
  heroSecondaryCtaDestination: string;
  heroEnabled: boolean;
  sections: HomepageSection[];
  announcementBar: AnnouncementBarConfig;
  promoPopup: PromoPopupConfig;
}

export type ThemePreset = 'ocean-blue' | 'midnight-tech' | 'modern-electric' | 'clean-premium';

export interface StoreSettings {
  businessName: string;
  tagline: string;
  supportingText: string;
  location: string;
  googleMapsUrl: string;
  phone1: string;
  phone1Name: string;
  phone2: string;
  phone2Name: string;
  whatsappNumber: string;
  whatsappFloatingEnabled: boolean;
  whatsappProductButtonEnabled: boolean;
  whatsappTemplate: string; // token replacement e.g. "Assalam-o-Alaikum Ali Electronics, I am interested in {product_name}. Current price is {price}. Please confirm availability."
  businessHours: string;
  email?: string;
  aboutText: string;
  logoUrl?: string;
  footerText: string;
  themePreset: ThemePreset;
}

export interface MediaItem {
  id: string;
  title: string;
  url: string;
  category: 'product' | 'category' | 'offer' | 'hero' | 'store' | 'logo';
  createdAt: string;
}

export interface Inquiry {
  id: string;
  customerName: string;
  customerPhone: string;
  productId?: string;
  productName: string;
  price: number;
  quantity: number;
  message: string;
  status: 'New' | 'Contacted' | 'Completed';
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  message: string;
  status: 'Unread' | 'Read';
  createdAt: string;
}

export interface AdminStats {
  totalProducts: number;
  inStock?: number;
  featuredProducts: number;
  newArrivals: number;
  activeOffers: number;
  outOfStock: number;
  totalCategories: number;
  totalInquiries: number;
  newInquiries: number;
  unreadMessages: number;
  recentInquiries: Inquiry[];
  recentProducts: Product[];
}

-- ==============================================================================
-- ALI ELECTRONIC — SUPABASE DATABASE ARCHITECTURE & SCHEMA MIGRATION
-- Production-Ready PostgreSQL Schema with RLS, Storage & Seed Data
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. CATEGORIES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT DEFAULT '',
    image_url TEXT,
    icon TEXT,
    display_order INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. PRODUCTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    category TEXT NOT NULL,
    brand TEXT DEFAULT 'Generic / Tech Pro',
    sku TEXT UNIQUE,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    old_price NUMERIC(12, 2) CHECK (old_price >= 0),
    discount TEXT,
    badge TEXT DEFAULT '',
    stock INT NOT NULL DEFAULT 10 CHECK (stock >= 0),
    availability TEXT NOT NULL DEFAULT 'In Stock',
    image TEXT NOT NULL,
    additional_images JSONB DEFAULT '[]'::JSONB,
    short_description TEXT DEFAULT '',
    description TEXT DEFAULT '',
    specifications JSONB DEFAULT '[]'::JSONB,
    featured BOOLEAN DEFAULT FALSE,
    is_new_arrival BOOLEAN DEFAULT FALSE,
    show_on_homepage BOOLEAN DEFAULT TRUE,
    whatsapp_enabled BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for lightning fast searching and filtering
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(active);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);

-- ==============================================================================
-- 4. OFFERS & PROMOTIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.offers (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    discount_type TEXT NOT NULL DEFAULT 'percentage',
    discount_value NUMERIC(10, 2) NOT NULL DEFAULT 10,
    banner_image TEXT,
    button_text TEXT DEFAULT 'Claim Offer on WhatsApp',
    button_link TEXT DEFAULT '#products',
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    display_location TEXT DEFAULT 'banner',
    product_ids JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. ORDERS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    order_number TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_whatsapp TEXT,
    customer_email TEXT,
    customer_address TEXT NOT NULL,
    city TEXT DEFAULT 'Hassan Abdal',
    notes TEXT DEFAULT '',
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
    delivery_charges NUMERIC(12, 2) NOT NULL DEFAULT 0,
    discount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Pending',
    payment_method TEXT NOT NULL DEFAULT 'Cash on Delivery',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON public.orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- ==============================================================================
-- 6. ORDER ITEMS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.order_items (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    product_image TEXT,
    sku TEXT,
    price NUMERIC(12, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    subtotal NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- ==============================================================================
-- 7. STORE SETTINGS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.store_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    business_name TEXT NOT NULL DEFAULT 'Ali Electronic',
    tagline TEXT DEFAULT 'Smart Technology. Better Living.',
    supporting_text TEXT DEFAULT 'Premium electronics, competitive prices and trusted service in Hassan Abdal.',
    location TEXT DEFAULT 'Main Bus Stop, Islam Shaheed Road, Opposite New Sethi Flour Mills, Hassan Abdal, Pakistan',
    google_maps_url TEXT DEFAULT 'https://maps.google.com/?q=Hassan+Abdal+Punjab+Pakistan',
    phone1 TEXT DEFAULT '03115321647',
    phone1_name TEXT DEFAULT 'Arbaz Ahmed',
    phone2 TEXT DEFAULT '03133332141',
    phone2_name TEXT DEFAULT 'Faraz Ahmed',
    whatsapp_number TEXT DEFAULT '03115321647',
    whatsapp_floating_enabled BOOLEAN DEFAULT TRUE,
    whatsapp_product_button_enabled BOOLEAN DEFAULT TRUE,
    whatsapp_template TEXT DEFAULT 'Assalam-o-Alaikum Ali Electronic, I want to order {product_name} (Rs. {price}). Please confirm stock and delivery in Hassan Abdal.',
    delivery_charges NUMERIC(12, 2) DEFAULT 0,
    business_hours TEXT DEFAULT 'Mon - Sat: 9:00 AM - 9:00 PM | Friday: 3:00 PM - 9:00 PM',
    email TEXT DEFAULT 'contact@alielectronic.pk',
    about_text TEXT DEFAULT 'Ali Electronic is your trusted local electronics store located at Main Bus Stop, Islam Shaheed Road, Hassan Abdal. We specialize in authentic mobile accessories, chargers, cables, audio gadgets, power banks, and modern lifestyle technology.',
    logo_url TEXT,
    footer_text TEXT DEFAULT '© 2026 Ali Electronic. All Rights Reserved. Hassan Abdal, Pakistan.',
    theme_preset TEXT DEFAULT 'clean-premium',
    currency TEXT DEFAULT 'PKR',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 8. CONTACT MESSAGES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Unread',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 9. SUPABASE STORAGE BUCKET CONFIGURATION (product-images)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies: Public Read
CREATE POLICY "Public Read Product Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Storage Policies: Allow Uploads (Anon & Authenticated)
CREATE POLICY "Allow Uploads to Product Images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Allow Updates to Product Images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images');

CREATE POLICY "Allow Deletes from Product Images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images');

-- ==============================================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Categories Policies
CREATE POLICY "Public can view active categories"
ON public.categories FOR SELECT
USING (true);

CREATE POLICY "Full access categories for all"
ON public.categories FOR ALL
USING (true)
WITH CHECK (true);

-- Products Policies
CREATE POLICY "Public can view active products"
ON public.products FOR SELECT
USING (true);

CREATE POLICY "Full access products for all"
ON public.products FOR ALL
USING (true)
WITH CHECK (true);

-- Offers Policies
CREATE POLICY "Public can view offers"
ON public.offers FOR SELECT
USING (true);

CREATE POLICY "Full access offers for all"
ON public.offers FOR ALL
USING (true)
WITH CHECK (true);

-- Orders Policies
CREATE POLICY "Public can insert orders"
ON public.orders FOR INSERT
WITH CHECK (true);

CREATE POLICY "Full access orders for all"
ON public.orders FOR ALL
USING (true)
WITH CHECK (true);

-- Order Items Policies
CREATE POLICY "Public can insert order items"
ON public.order_items FOR INSERT
WITH CHECK (true);

CREATE POLICY "Full access order items for all"
ON public.order_items FOR ALL
USING (true)
WITH CHECK (true);

-- Store Settings Policies
CREATE POLICY "Public can view store settings"
ON public.store_settings FOR SELECT
USING (true);

CREATE POLICY "Full access store settings for all"
ON public.store_settings FOR ALL
USING (true)
WITH CHECK (true);

-- Contact Messages Policies
CREATE POLICY "Public can insert contact messages"
ON public.contact_messages FOR INSERT
WITH CHECK (true);

CREATE POLICY "Full access contact messages for all"
ON public.contact_messages FOR ALL
USING (true)
WITH CHECK (true);

-- ==============================================================================
-- 11. INITIAL SEED DATA FOR ALI ELECTRONIC
-- ==============================================================================

-- Seed Categories
INSERT INTO public.categories (id, name, slug, description, display_order, active)
VALUES 
  ('cat-mobile', 'Mobile Accessories', 'mobile-accessories', 'Cables, cases, holders, adapters and protectors', 1, true),
  ('cat-chargers', 'Chargers & Power', 'chargers-power', 'Fast wall chargers, car chargers, and power extensions', 2, true),
  ('cat-audio', 'Audio & Sound', 'audio-sound', 'Wireless earbuds, neckbands, headphones and bluetooth speakers', 3, true),
  ('cat-powerbanks', 'Power Banks', 'power-banks', 'High-capacity fast-charging portable power banks', 4, true),
  ('cat-smart', 'Smart Devices', 'smart-devices', 'Smart watches, fitness bands, and digital clocks', 5, true),
  ('cat-cables', 'Cables & Converters', 'cables-converters', 'Type-C, Lightning, Micro USB, OTG and HDMI cords', 6, true)
ON CONFLICT (id) DO NOTHING;

-- Seed Default Store Settings
INSERT INTO public.store_settings (
  id, business_name, tagline, supporting_text, location, google_maps_url,
  phone1, phone1_name, phone2, phone2_name, whatsapp_number, delivery_charges,
  business_hours, about_text, footer_text, currency
)
VALUES (
  'default',
  'Ali Electronic',
  'Smart Technology. Better Living.',
  'Premium electronics, competitive prices and trusted service in Hassan Abdal.',
  'Main Bus Stop, Islam Shaheed Road, Opposite New Sethi Flour Mills, Hassan Abdal, Pakistan',
  'https://maps.google.com/?q=Hassan+Abdal+Punjab+Pakistan',
  '03115321647',
  'Arbaz Ahmed',
  '03133332141',
  'Faraz Ahmed',
  '03115321647',
  0,
  'Mon - Sat: 9:00 AM - 9:00 PM | Friday: 3:00 PM - 9:00 PM',
  'Ali Electronic is your trusted local electronics store located at Main Bus Stop, Islam Shaheed Road, Hassan Abdal. We specialize in authentic mobile accessories, chargers, cables, audio gadgets, power banks, and modern lifestyle technology.',
  '© 2026 Ali Electronic. All Rights Reserved. Hassan Abdal, Pakistan.',
  'PKR'
)
ON CONFLICT (id) DO UPDATE SET
  business_name = EXCLUDED.business_name,
  location = EXCLUDED.location,
  phone1 = EXCLUDED.phone1,
  whatsapp_number = EXCLUDED.whatsapp_number;

-- Seed Initial Offer
INSERT INTO public.offers (
  id, title, description, discount_type, discount_value, banner_image,
  button_text, is_active, display_location
)
VALUES (
  'offer-grand-sale',
  'MEGA TECH PROMOTION',
  'Enjoy up to 25% OFF on premium wireless earbuds, 65W GaN fast chargers, and heavy-duty braided cables at Ali Electronic Hassan Abdal showroom.',
  'percentage',
  25,
  'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1600&auto=format&fit=crop&q=80',
  'Claim Offer on WhatsApp',
  true,
  'banner'
)
ON CONFLICT (id) DO NOTHING;

-- Seed Products
INSERT INTO public.products (
  id, name, slug, category, brand, sku, price, old_price, discount, badge,
  stock, availability, image, short_description, description, specifications,
  featured, is_new_arrival, show_on_homepage, whatsapp_enabled, display_order, active
)
VALUES
(
  'p-1',
  'Wireless Noise Cancelling Earbuds Pro',
  'wireless-noise-cancelling-earbuds-pro',
  'Audio & Sound',
  'Acoustic Pro',
  'AE-AUD-001',
  3499,
  4500,
  '22% OFF',
  'HOT',
  25,
  'In Stock',
  'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
  'Active noise cancellation with 32-hour playback case and deep punchy bass.',
  'Premium wireless earbuds with advanced hybrid active noise cancellation, Bluetooth 5.3, dual microphones for crystal-clear calls, touch controls, and splash-resistant IPX5 casing. Tested in Hassan Abdal showroom.',
  '["Active Hybrid ANC", "32 Hours Total Playtime", "Bluetooth 5.3", "Dual HD Mics", "IPX5 Splashproof"]'::JSONB,
  true,
  true,
  true,
  true,
  1,
  true
),
(
  'p-2',
  '65W GaN Ultra-Fast Dual Port Charger',
  '65w-gan-ultra-fast-dual-port-charger',
  'Chargers & Power',
  'PowerCore',
  'AE-CHG-002',
  2499,
  3200,
  '22% OFF',
  'POPULAR',
  40,
  'In Stock',
  'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
  'Dual-port Type-C PD 65W & USB-A fast charger with GaN technology for smartphones and laptops.',
  'Ultra-compact 65W GaN fast wall adapter capable of charging laptops, tablets, Samsung Super Fast Charging, and iPhones at maximum speed with intelligent heat dissipation.',
  '["65W Max GaN Output", "Type-C PD 3.0 + USB-A Quick Charge", "Universal Laptop & Phone Compatibility", "Over-heat Protection"]'::JSONB,
  true,
  false,
  true,
  true,
  2,
  true
),
(
  'p-3',
  '20,000mAh 22.5W Fast Charging Power Bank',
  '20000mah-225w-fast-charging-power-bank',
  'Power Banks',
  'VoltMax',
  'AE-PB-003',
  4200,
  5200,
  '19% OFF',
  'BEST SELLER',
  18,
  'In Stock',
  'https://images.unsplash.com/photo-1609592424364-d62153b6efb4?w=800&auto=format&fit=crop&q=80',
  'Heavy duty 20000mAh battery with digital LED percentage display and dual-way fast charging.',
  'Massive 20,000mAh real capacity battery backup featuring 22.5W Super Fast Charging, digital battery level monitor, and multi-device simultaneous charging.',
  '["20,000mAh Real Capacity", "22.5W Two-way Fast Charge", "LED Digital Percentage Display", "3 Output Ports"]'::JSONB,
  true,
  false,
  true,
  true,
  3,
  true
),
(
  'p-4',
  'Braided Heavy-Duty 100W USB-C Cable',
  'braided-heavy-duty-100w-usbc-cable',
  'Cables & Converters',
  'FlexWire',
  'AE-CBL-004',
  650,
  900,
  '28% OFF',
  'SALE',
  80,
  'In Stock',
  'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=800&auto=format&fit=crop&q=80',
  'Military-grade nylon braided 1.2M cable with E-Marker smart chip and 100W PD support.',
  'Durable reinforced copper core cable built to withstand over 25,000 bend cycles. Perfect for high-speed charging of flagship phones and laptops.',
  '["100W Power Delivery", "1.2 Meter Length", "Zinc Alloy Connectors", "480Mbps Data Sync"]'::JSONB,
  true,
  false,
  true,
  true,
  4,
  true
),
(
  'p-5',
  'Waterproof Bluetooth Outdoor Speaker',
  'waterproof-bluetooth-outdoor-speaker',
  'Audio & Sound',
  'SoundWave',
  'AE-SPK-005',
  2800,
  3500,
  '20% OFF',
  '',
  12,
  'In Stock',
  'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80',
  '16W stereo sound with dual bass radiators, RGB ring lighting, and IPX7 waterproof body.',
  'Rugged portable wireless speaker offering booming bass, 12 hours of uninterrupted battery life, FM radio, and micro-SD card playback.',
  '["16W Deep Bass Output", "IPX7 Waterproof", "12 Hours Battery Life", "RGB Lighting Modes"]'::JSONB,
  false,
  true,
  true,
  true,
  5,
  true
),
(
  'p-6',
  'Smart Fitness Watch with HD AMOLED Display',
  'smart-fitness-watch-with-hd-amoled-display',
  'Smart Devices',
  'FitPulse',
  'AE-WTC-006',
  4800,
  6200,
  '23% OFF',
  'NEW',
  15,
  'In Stock',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
  '1.96-inch curved AMOLED display, Bluetooth calling, heart rate tracker, and 100+ sports modes.',
  'Sleek zinc-alloy smartwatch with real-time health monitoring, sleep analysis, message notifications, customizable watch faces, and 7-day battery life.',
  '["1.96 Inch Curved AMOLED", "Bluetooth Calling & Speaker", "SpO2 & Heart Rate Monitor", "7 Days Battery Life"]'::JSONB,
  true,
  true,
  true,
  true,
  6,
  true
)
ON CONFLICT (id) DO NOTHING;

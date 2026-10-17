-- ==============================================================================
-- ZYVARA — SUPABASE DATABASE ARCHITECTURE & SCHEMA MIGRATION
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
    city TEXT DEFAULT '',
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
    business_name TEXT NOT NULL DEFAULT 'Zyvara',
    tagline TEXT DEFAULT 'Minimal luxury for everyday living',
    supporting_text TEXT DEFAULT 'Curated products for fashion, beauty, home & accessories — designed for modern living.',
    location TEXT DEFAULT 'Pakistan (Online Store)',
    google_maps_url TEXT DEFAULT '',
    phone1 TEXT DEFAULT '03701893960',
    phone1_name TEXT DEFAULT 'Customer Service',
    phone2 TEXT DEFAULT '03079371104',
    phone2_name TEXT DEFAULT 'Customer Service',
    whatsapp_number TEXT DEFAULT '03705776869',
    whatsapp_floating_enabled BOOLEAN DEFAULT TRUE,
    whatsapp_product_button_enabled BOOLEAN DEFAULT TRUE,
    whatsapp_template TEXT DEFAULT 'Hello Zyvara, I want to order {product_name} (Rs. {price}). Please confirm stock and delivery.',
    delivery_charges NUMERIC(12, 2) DEFAULT 0,
    business_hours TEXT DEFAULT 'Customer care available daily on phone & WhatsApp',
    email TEXT DEFAULT '',
    about_text TEXT DEFAULT 'Zyvara — minimal luxury for everyday living. Curated fashion, beauty, home & accessories.',
    logo_url TEXT,
    footer_text TEXT DEFAULT '© 2026 ZVYARA. All rights reserved.',
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
-- 8b. HOMEPAGE CONFIG TABLE (hero, announcement bar, promo popup, section order)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.homepage_config (
    id TEXT PRIMARY KEY DEFAULT 'default',
    config JSONB NOT NULL DEFAULT '{}'::JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 8c. MEDIA LIBRARY TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.media_library (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL DEFAULT 'Media Item',
    url TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'product',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 9. SUPABASE STORAGE BUCKET CONFIGURATION (product-images)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies: Public Read
DROP POLICY IF EXISTS "Public Read Product Images" ON storage.objects;
CREATE POLICY "Public Read Product Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Storage Policies: only the signed-in admin can upload / change / delete images
DROP POLICY IF EXISTS "Allow Uploads to Product Images" ON storage.objects;
CREATE POLICY "Allow Uploads to Product Images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Allow Updates to Product Images" ON storage.objects;
CREATE POLICY "Allow Updates to Product Images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Allow Deletes from Product Images" ON storage.objects;
CREATE POLICY "Allow Deletes from Product Images"
ON storage.objects FOR DELETE
TO authenticated
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
ALTER TABLE public.homepage_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;

-- 1. Categories Policies
DROP POLICY IF EXISTS "Public can view active categories" ON public.categories;
DROP POLICY IF EXISTS "Full access categories for all" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;

CREATE POLICY "Public can view active categories"
ON public.categories FOR SELECT
USING (active = true OR auth.role() = 'authenticated');

CREATE POLICY "Admins can manage categories"
ON public.categories FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 2. Products Policies
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
DROP POLICY IF EXISTS "Full access products for all" ON public.products;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;

CREATE POLICY "Public can view active products"
ON public.products FOR SELECT
USING (active = true OR auth.role() = 'authenticated');

CREATE POLICY "Admins can manage products"
ON public.products FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 3. Offers Policies
DROP POLICY IF EXISTS "Public can view offers" ON public.offers;
DROP POLICY IF EXISTS "Full access offers for all" ON public.offers;
DROP POLICY IF EXISTS "Admins can manage offers" ON public.offers;

CREATE POLICY "Public can view offers"
ON public.offers FOR SELECT
USING (is_active = true OR auth.role() = 'authenticated');

CREATE POLICY "Admins can manage offers"
ON public.offers FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Orders Policies (Strict Customer Privacy Protection)
DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Full access orders for all" ON public.orders;
DROP POLICY IF EXISTS "Public customers can create orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view and manage orders" ON public.orders;

-- Anyone/customer can submit a new order at checkout
CREATE POLICY "Public customers can create orders"
ON public.orders FOR INSERT
WITH CHECK (true);

-- ONLY authenticated store staff/admins can view, search, update or delete orders
CREATE POLICY "Admins can view and manage orders"
ON public.orders FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 5. Order Items Policies (Strict Customer Privacy Protection)
DROP POLICY IF EXISTS "Public can insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Full access order items for all" ON public.order_items;
DROP POLICY IF EXISTS "Public customers can create order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can view and manage order items" ON public.order_items;

-- Customers can submit order items alongside their order
CREATE POLICY "Public customers can create order items"
ON public.order_items FOR INSERT
WITH CHECK (true);

-- ONLY authenticated store staff/admins can view or manage order items
CREATE POLICY "Admins can view and manage order items"
ON public.order_items FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 6. Store Settings Policies
DROP POLICY IF EXISTS "Public can view store settings" ON public.store_settings;
DROP POLICY IF EXISTS "Full access store settings for all" ON public.store_settings;
DROP POLICY IF EXISTS "Admins can manage store settings" ON public.store_settings;

CREATE POLICY "Public can view store settings"
ON public.store_settings FOR SELECT
USING (true);

CREATE POLICY "Admins can manage store settings"
ON public.store_settings FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 7. Contact Messages Policies
DROP POLICY IF EXISTS "Public can insert contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Full access contact messages for all" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can view contact messages" ON public.contact_messages;

CREATE POLICY "Public can insert contact messages"
ON public.contact_messages FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view contact messages"
ON public.contact_messages FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 8. Homepage Config Policies (public can read, only admin can change)
DROP POLICY IF EXISTS "Public can view homepage config" ON public.homepage_config;
DROP POLICY IF EXISTS "Admins can manage homepage config" ON public.homepage_config;

CREATE POLICY "Public can view homepage config"
ON public.homepage_config FOR SELECT
USING (true);

CREATE POLICY "Admins can manage homepage config"
ON public.homepage_config FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 9. Media Library Policies
DROP POLICY IF EXISTS "Public can view media library" ON public.media_library;
DROP POLICY IF EXISTS "Admins can manage media library" ON public.media_library;

CREATE POLICY "Public can view media library"
ON public.media_library FOR SELECT
USING (true);

CREATE POLICY "Admins can manage media library"
ON public.media_library FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ==============================================================================
-- 11. INITIAL SEED DATA FOR ZYVARA
-- ==============================================================================

-- Seed Categories
INSERT INTO public.categories (id, name, slug, description, display_order, active)
VALUES 
  ('cat-fashion', 'Fashion', 'fashion', 'Jackets, bags and everyday wardrobe essentials', 1, true),
  ('cat-beauty', 'Beauty', 'beauty', 'Skincare and beauty essentials', 2, true),
  ('cat-home', 'Home', 'home', 'Planters, decor and living essentials', 3, true),
  ('cat-accessories', 'Accessories', 'accessories', 'Sunglasses, totes and finishing touches', 4, true)
ON CONFLICT (id) DO NOTHING;

-- Seed Default Store Settings
INSERT INTO public.store_settings (
  id, business_name, tagline, supporting_text, location, google_maps_url,
  phone1, phone1_name, phone2, phone2_name, whatsapp_number, delivery_charges,
  business_hours, about_text, footer_text, currency
)
VALUES (
  'default',
  'Zyvara',
  'Minimal luxury for everyday living',
  'Curated products for fashion, beauty, home & accessories — designed for modern living.',
  'Pakistan (Online Store)',
  '',
  '03701893960',
  'Customer Service',
  '03079371104',
  'Customer Service',
  '03705776869',
  200,
  'Customer care available daily on phone & WhatsApp',
  'Zyvara — minimal luxury for everyday living. Curated fashion, beauty, home & accessories.',
  '© 2026 ZVYARA. All rights reserved.',
  'PKR'
)
ON CONFLICT (id) DO NOTHING;

-- Demo offers and demo products live in /supabase/seed-demo-data.sql (optional).

-- ==============================================================================
-- KAMINI COLLECTIONS - DATABASE INITIALIZATION SCHEMA & POLICIES
-- ==============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (tied to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer', 'staff')),
    full_name TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    sku TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    fabric TEXT,
    color TEXT,
    occasion TEXT,
    saree_length TEXT,
    blouse_details TEXT,
    care_instructions TEXT,
    price_paise BIGINT NOT NULL CHECK (price_paise >= 0),
    compare_at_price_paise BIGINT CHECK (compare_at_price_paise IS NULL OR compare_at_price_paise >= 0),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. PRODUCT IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    shipping_address JSONB NOT NULL,
    subtotal_paise BIGINT NOT NULL CHECK (subtotal_paise >= 0),
    shipping_paise BIGINT NOT NULL CHECK (shipping_paise >= 0),
    discount_paise BIGINT NOT NULL DEFAULT 0 CHECK (discount_paise >= 0),
    total_paise BIGINT NOT NULL CHECK (total_paise >= 0),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('razorpay', 'cod')),
    payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'authorized', 'captured', 'failed', 'refunded')),
    order_status TEXT NOT NULL CHECK (order_status IN ('placed', 'processing', 'shipped', 'delivered', 'cancelled')),
    tracking_token_hash TEXT,
    tracking_carrier TEXT,
    tracking_number TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. ORDER ITEMS TABLE (Immutable snapshot of purchase)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    sku TEXT NOT NULL,
    unit_price_paise BIGINT NOT NULL CHECK (unit_price_paise >= 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    line_total_paise BIGINT NOT NULL CHECK (line_total_paise >= 0),
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    provider TEXT NOT NULL DEFAULT 'razorpay',
    provider_order_id TEXT,
    provider_payment_id TEXT,
    provider_signature TEXT,
    amount_paise BIGINT NOT NULL CHECK (amount_paise >= 0),
    status TEXT NOT NULL CHECK (status IN ('created', 'attempted', 'captured', 'failed', 'refunded')),
    raw_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. WEBHOOK EVENTS TABLE (For deduplication and idempotency)
CREATE TABLE IF NOT EXISTS public.webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id TEXT NOT NULL UNIQUE,
    provider TEXT NOT NULL DEFAULT 'razorpay',
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- INDEXES FOR HIGH-PERFORMANCE QUERIES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories (slug);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON public.categories (is_active);

CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products (slug);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products (sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products (is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products (is_featured);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products (price_paise);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images (product_id, sort_order ASC);

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders (order_number);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders (phone);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders (payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON public.orders (order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items (order_id);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments (order_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider_order_id ON public.payments (provider_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider_payment_id ON public.payments (provider_payment_id);

CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON public.webhook_events (event_id);

-- ==============================================================================
-- ATOMIC INVENTORY FUNCTIONS
-- ==============================================================================

-- Safely decrements stock with concurrency lock check. Returns true if successful, false if insufficient stock.
CREATE OR REPLACE FUNCTION public.decrement_product_stock(
    p_product_id UUID,
    p_quantity INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_updated_rows INTEGER;
BEGIN
    UPDATE public.products
    SET stock_quantity = stock_quantity - p_quantity,
        updated_at = timezone('utc'::text, now())
    WHERE id = p_product_id
      AND stock_quantity >= p_quantity
      AND is_active = true;
      
    GET DIAGNOSTICS v_updated_rows = ROW_COUNT;
    
    RETURN v_updated_rows > 0;
END;
$$;

-- Safely restores stock for an order's items (e.g., cancelled or expired order)
CREATE OR REPLACE FUNCTION public.restore_order_inventory(
    p_order_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    item RECORD;
BEGIN
    FOR item IN
        SELECT product_id, quantity 
        FROM public.order_items 
        WHERE order_id = p_order_id AND product_id IS NOT NULL
    LOOP
        UPDATE public.products
        SET stock_quantity = stock_quantity + item.quantity,
            updated_at = timezone('utc'::text, now())
        WHERE id = item.product_id;
    END LOOP;
END;
$$;

-- Automatic updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

-- Apply triggers
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_categories_updated_at ON public.categories;
CREATE TRIGGER set_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_payments_updated_at ON public.payments;
CREATE TRIGGER set_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current authenticated user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
$$;

-- PROFILES POLICIES
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Admins have full access to profiles"
    ON public.profiles FOR ALL
    USING (public.is_admin());

-- CATEGORIES POLICIES
CREATE POLICY "Public can view active categories"
    ON public.categories FOR SELECT
    USING (is_active = true);

CREATE POLICY "Admins have full access to categories"
    ON public.categories FOR ALL
    USING (public.is_admin());

-- PRODUCTS POLICIES
CREATE POLICY "Public can view active products"
    ON public.products FOR SELECT
    USING (is_active = true);

CREATE POLICY "Admins have full access to products"
    ON public.products FOR ALL
    USING (public.is_admin());

-- PRODUCT IMAGES POLICIES
CREATE POLICY "Public can view product images"
    ON public.product_images FOR SELECT
    USING (true);

CREATE POLICY "Admins have full access to product images"
    ON public.product_images FOR ALL
    USING (public.is_admin());

-- ORDERS & ORDER ITEMS POLICIES
-- Customers interact with orders via verified backend APIs (service role), not direct public read
CREATE POLICY "Admins have full access to orders"
    ON public.orders FOR ALL
    USING (public.is_admin());

CREATE POLICY "Admins have full access to order items"
    ON public.order_items FOR ALL
    USING (public.is_admin());

-- PAYMENTS POLICIES
CREATE POLICY "Admins have full access to payments"
    ON public.payments FOR ALL
    USING (public.is_admin());

-- WEBHOOK EVENTS POLICIES
CREATE POLICY "Admins have full access to webhook events"
    ON public.webhook_events FOR ALL
    USING (public.is_admin());

-- ==============================================================================
-- INITIAL SEED DATA (Curated for Kamini Collections)
-- ==============================================================================

INSERT INTO public.categories (id, name, slug, description, image_url, display_order)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Banarasi Silk', 'banarasi-silk', 'Pure handwoven Banarasi sarees featuring intricate zari work, royal brocades, and timeless royal motifs.', '/saree.jfif', 1),
    ('22222222-2222-2222-2222-222222222222', 'Kanchipuram Silk', 'kanchipuram-silk', 'Authentic temple border South Indian silk sarees crafted with heavy gold zari for weddings and festivities.', '/saree.jfif', 2),
    ('33333333-3333-3333-3333-333333333333', 'Chanderi & Organza', 'chanderi-organza', 'Breezy, lightweight, and sheer elegance with delicate floral motifs and fine tissue borders.', '/saree.jfif', 3),
    ('44444444-4444-4444-4444-444444444444', 'Pure Cotton & Linen', 'cotton-linen', 'Breathable, hand-spun artisanal cotton sarees for graceful everyday wear and office elegance.', '/saree.jfif', 4)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (
    id, category_id, name, slug, sku, description, 
    fabric, color, occasion, saree_length, blouse_details, care_instructions, 
    price_paise, compare_at_price_paise, stock_quantity, is_active, is_featured
)
VALUES
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '11111111-1111-1111-1111-111111111111',
        'Royal Crimson Kadwa Banarasi Silk Saree',
        'royal-crimson-kadwa-banarasi-silk-saree',
        'KC-BAN-001',
        'A regal Banarasi saree in deep scarlet crimson handwoven in pure katan silk. Adorned with all-over intricate gold zari floral butis and a majestic broad temple border with an opulent pallu.',
        'Pure Katan Silk',
        'Crimson Red & Gold',
        'Bridal, Wedding, Festive',
        '5.5 Meters',
        'Includes unstitched matching blouse piece (0.8 Meter) with zari border',
        'Dry clean only. Store wrapped in soft muslin cloth.',
        1250000, -- Rs. 12,500.00
        1550000, -- Rs. 15,500.00
        8,
        true,
        true
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        '22222222-2222-2222-2222-222222222222',
        'Golden Mustard Kanchipuram Bridal Pattu Saree',
        'golden-mustard-kanchipuram-bridal-pattu-saree',
        'KC-KAN-002',
        'Handloomed in authentic Kanchipuram tradition, this luminous mustard gold pattu saree features pure silver zari dipped in gold with peacock and elephant motifs on a contrasting emerald green border.',
        'Pure Mulberry Silk (Kanchipuram)',
        'Mustard Gold & Emerald Green',
        'Wedding, Traditional Ceremony',
        '5.5 Meters',
        'Includes unstitched contrasting emerald green blouse piece (0.8 Meter)',
        'Dry clean only. Avoid spraying perfumes directly on zari.',
        1890000, -- Rs. 18,900.00
        2200000, -- Rs. 22,000.00
        5,
        true,
        true
    ),
    (
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        '33333333-3333-3333-3333-333333333333',
        'Rose Quartz Handpainted Organza Silk Saree',
        'rose-quartz-handpainted-organza-silk-saree',
        'KC-ORG-003',
        'Delicate sheer pastel pink organza adorned with hand-painted botanical roses and finished with scalloped pearl-embroidered borders. Light as air and effortlessly graceful.',
        'Pure Organza Silk',
        'Rose Quartz Pink',
        'Party, Engagement, Cocktail',
        '5.5 Meters',
        'Includes unstitched raw silk blouse piece in rose pink (0.8 Meter)',
        'Dry clean only. Iron on reverse at low heat.',
        849000, -- Rs. 8,490.00
        1050000, -- Rs. 10,500.00
        12,
        true,
        true
    ),
    (
        'dddddddd-dddd-dddd-dddd-dddddddddddd',
        '44444444-4444-4444-4444-444444444444',
        'Artisanal Midnight Blue Jamdani Cotton Saree',
        'artisanal-midnight-blue-jamdani-cotton-saree',
        'KC-JAM-004',
        'Hand-spun fine Bengal cotton featuring geometric Jamdani weft motifs woven painstakingly by master artisans. Breathable, featherlight, and supremely sophisticated.',
        'Fine Handspun Cotton',
        'Midnight Navy Blue & Silver',
        'Festive, Casual Elegance, Office',
        '5.5 Meters',
        'Includes unstitched running blouse piece (0.8 Meter)',
        'Gentle hand wash with mild liquid detergent or dry clean.',
        425000, -- Rs. 4,250.00
        520000, -- Rs. 5,200.00
        15,
        true,
        false
    ),
    (
        'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        '11111111-1111-1111-1111-111111111111',
        'Vintage Marigold Banarasi Meenakari Silk Saree',
        'vintage-marigold-banarasi-meenakari-silk-saree',
        'KC-BAN-005',
        'Vibrant marigold yellow katan silk illuminated with colourful Meenakari enamelled resham and antique gold zari weave across the body and heavy pallu.',
        'Pure Katan Silk',
        'Marigold Yellow & Multi Zari',
        'Haldi, Sangeet, Festive',
        '5.5 Meters',
        'Includes unstitched contrasting ruby red blouse piece (0.8 Meter)',
        'Dry clean only.',
        1420000, -- Rs. 14,200.00
        1700000, -- Rs. 17,000.00
        6,
        true,
        true
    ),
    (
        'ffffffff-ffff-ffff-ffff-ffffffffffff',
        '22222222-2222-2222-2222-222222222222',
        'Peacock Teal Dual-Tone Kanchipuram Silk Saree',
        'peacock-teal-dual-tone-kanchipuram-silk-saree',
        'KC-KAN-006',
        'Exquisite peacock teal dual-tone silk shot with rich purple undertones. Finished with signature korvai woven temple borders and an opulent golden brocade pallu.',
        'Pure Silk',
        'Peacock Teal & Deep Purple',
        'Wedding Reception, Festive',
        '5.5 Meters',
        'Includes unstitched purple brocade blouse piece (0.8 Meter)',
        'Dry clean only.',
        1680000, -- Rs. 16,800.00
        1950000, -- Rs. 19,500.00
        4,
        true,
        false
    )
ON CONFLICT (sku) DO NOTHING;

-- Seed Images for the seeded products
INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/saree.jfif', name || ' - Main View', 1, true
FROM public.products
ON CONFLICT DO NOTHING;

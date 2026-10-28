-- ==============================================================================
-- KAMINI COLLECTIONS - CRITICAL DATABASE SECURITY & LEAST-PRIVILEGE GRANTS
-- Safe, additive migration: enforces least privilege without destructive drops.
-- ==============================================================================

-- 1. SCHEMA USAGE
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 2. SECURE SENSITIVE INVENTORY FUNCTIONS
-- In PostgreSQL, functions default to EXECUTE for PUBLIC.
-- Revoke execution from PUBLIC, anon, and authenticated so public users cannot tamper with inventory.
REVOKE EXECUTE ON FUNCTION public.decrement_product_stock(UUID, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_product_stock(UUID, INTEGER) TO service_role;

REVOKE EXECUTE ON FUNCTION public.restore_order_inventory(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.restore_order_inventory(UUID) TO service_role;

-- 3. ENSURE ROW LEVEL SECURITY IS ACTIVE ON ALL TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- 4. LEAST PRIVILEGE TABLE PERMISSIONS
-- ------------------------------------------------------------------------------
-- Role: anon (Public unauthenticated storefront)
-- Can only view active catalog data. Zero access to orders, payments, webhooks, profiles.
-- ------------------------------------------------------------------------------
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;

GRANT SELECT ON public.categories TO anon;
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.product_images TO anon;

-- ------------------------------------------------------------------------------
-- Role: authenticated (Signed-in customers and staff)
-- Can view catalog data and manage own profile.
-- Orders and payments are handled via secure server-side operations (service_role).
-- ------------------------------------------------------------------------------
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated;

GRANT SELECT ON public.categories TO authenticated;
GRANT SELECT ON public.products TO authenticated;
GRANT SELECT ON public.product_images TO authenticated;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;

-- ------------------------------------------------------------------------------
-- Role: service_role (Trusted server-side backend operations)
-- Full access to all tables, sequences, and routines for trusted order fulfillment,
-- payment verification, webhook deduplication, and admin management.
-- ------------------------------------------------------------------------------
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL ROUTINES IN SCHEMA public TO service_role;

-- Ensure future tables in public schema automatically grant full access to service_role
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO service_role;

-- 5. PROFILE ROLE ESCALATION PROTECTION POLICY
-- Prevent users from modifying their own 'role' field via UPDATE
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id AND 
        role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
    );

-- Ensure admin access policy on profiles
DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;
CREATE POLICY "Admins have full access to profiles"
    ON public.profiles FOR ALL
    TO authenticated
    USING (public.is_admin());

-- Ensure admin access policy on orders and order items
DROP POLICY IF EXISTS "Admins have full access to orders" ON public.orders;
CREATE POLICY "Admins have full access to orders"
    ON public.orders FOR ALL
    TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Admins have full access to order items" ON public.order_items;
CREATE POLICY "Admins have full access to order items"
    ON public.order_items FOR ALL
    TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Admins have full access to payments" ON public.payments;
CREATE POLICY "Admins have full access to payments"
    ON public.payments FOR ALL
    TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Admins have full access to webhook events" ON public.webhook_events;
CREATE POLICY "Admins have full access to webhook events"
    ON public.webhook_events FOR ALL
    TO authenticated
    USING (public.is_admin());

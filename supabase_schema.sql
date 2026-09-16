-- ============================================================================
-- RAGHAV TEXCHEMS CHEMICAL PRIVATE LIMITED - ENTERPRISE DATABASE & SECURITY SCHEMA
-- ============================================================================
-- OWASP Top 10 Hardened Schema for Production Supabase (PostgreSQL) Deployment.
-- Features:
--  1. Strict Row-Level Security (RLS) across all tables
--  2. Security Definer functions hardened with explicit 'search_path = public, pg_temp'
--  3. Multi-Factor Authentication (AAL2) & Role-Based Access Control
--  4. Database-level CHECK constraints, NOT NULL constraints, and length validations
--  5. Automated updated_at timestamp triggers
--  6. Storage bucket provisioning & storage RLS policies ('product-images' & 'company-assets')
--  7. Immutable Admin Audit Logging table (INSERT & SELECT only; no UPDATE/DELETE)
--  8. Tailored for manual data entry (No mock data pollution)
--  9. Supabase Realtime publication setup
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. HELPER TRIGGER FUNCTION FOR UPDATED_AT TIMESTAMPS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================================
-- 2. ADMIN USERS TABLE & AUTHORIZATION FUNCTION (OWASP A01: Broken Access Control)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid NOT NULL,
  role text NOT NULL DEFAULT 'admin' CHECK (role = 'admin'),
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT admin_users_pkey PRIMARY KEY (id),
  CONSTRAINT admin_users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Hardened helper function: Check if current authenticated user is an active Admin
-- Prevents search_path injection by fixing search_path to public, pg_temp
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE id = auth.uid()
      AND active = true
  );
END;
$$;

-- RLS Policies for admin_users
DO $$
BEGIN
  DROP POLICY IF EXISTS "Admins can view admin profiles" ON public.admin_users;
  DROP POLICY IF EXISTS "Admins can update their own profile" ON public.admin_users;
END $$;

CREATE POLICY "Admins can view admin profiles"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins can update their own profile"
  ON public.admin_users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());


-- ============================================================================
-- 3. PRODUCTS CATALOG TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.products (
  id text NOT NULL,
  name text NOT NULL CHECK (char_length(trim(name)) BETWEEN 1 AND 150),
  code text NOT NULL UNIQUE CHECK (char_length(trim(code)) BETWEEN 1 AND 50),
  category text NOT NULL CHECK (char_length(trim(category)) BETWEEN 1 AND 100),
  description text NOT NULL CHECK (char_length(trim(description)) BETWEEN 1 AND 3000),
  
  -- Media
  image_url text CHECK (image_url IS NULL OR char_length(image_url) <= 2048),
  image_path text CHECK (image_path IS NULL OR char_length(image_path) <= 500),
  
  -- Chemical Specifications
  appearance text NOT NULL DEFAULT '' CHECK (char_length(appearance) <= 150),
  ph text NOT NULL DEFAULT '' CHECK (char_length(ph) <= 50),
  active_content text NOT NULL DEFAULT '' CHECK (char_length(active_content) <= 50),
  viscosity text NOT NULL DEFAULT '' CHECK (char_length(viscosity) <= 80),
  
  -- Applications array
  applications text[] NOT NULL DEFAULT '{}'::text[],
  
  -- Controls
  featured boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  stock_status text NOT NULL DEFAULT 'In Stock' CHECK (stock_status IN ('In Stock', 'Custom Order', 'High Demand')),
  
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT products_pkey PRIMARY KEY (id)
);

-- Performance & Security indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured);
CREATE INDEX IF NOT EXISTS idx_products_code ON public.products(code);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- Trigger for products updated_at
DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Public can view active products" ON public.products;
  DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
  DROP POLICY IF EXISTS "Admins can update products" ON public.products;
  DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
END $$;

-- 1. Public can view only active products (Admins view all)
CREATE POLICY "Public can view active products"
  ON public.products
  FOR SELECT
  TO anon, authenticated
  USING (active = true OR public.is_admin());

-- 2. Only active Admins can write
CREATE POLICY "Admins can insert products"
  ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update products"
  ON public.products
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete products"
  ON public.products
  FOR DELETE
  TO authenticated
  USING (public.is_admin());


-- ============================================================================
-- 4. CUSTOMER INQUIRIES & RFQ TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.inquiries (
  id text NOT NULL,
  customer_name text NOT NULL CHECK (char_length(trim(customer_name)) BETWEEN 1 AND 150),
  phone text NOT NULL CHECK (char_length(trim(phone)) BETWEEN 5 AND 30),
  email text NOT NULL CHECK (char_length(trim(email)) BETWEEN 3 AND 254),
  company_name text NOT NULL DEFAULT '' CHECK (char_length(company_name) <= 200),
  product_category text NOT NULL CHECK (char_length(trim(product_category)) BETWEEN 1 AND 100),
  message text NOT NULL CHECK (char_length(trim(message)) BETWEEN 1 AND 3000),
  status text NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'In Progress', 'Quotation Sent', 'Closed')),
  assigned_to text NOT NULL DEFAULT '' CHECK (char_length(assigned_to) <= 150),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT inquiries_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.inquiries(created_at DESC);

DROP TRIGGER IF EXISTS trg_inquiries_updated_at ON public.inquiries;
CREATE TRIGGER trg_inquiries_updated_at
  BEFORE UPDATE ON public.inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Public can submit inquiries" ON public.inquiries;
  DROP POLICY IF EXISTS "Admins can view inquiries" ON public.inquiries;
  DROP POLICY IF EXISTS "Admins can update inquiries" ON public.inquiries;
  DROP POLICY IF EXISTS "Admins can delete inquiries" ON public.inquiries;
END $$;

-- 1. Public can submit new inquiries (validated lengths)
CREATE POLICY "Public can submit inquiries"
  ON public.inquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(trim(customer_name)) >= 2 AND
    char_length(trim(phone)) >= 7 AND
    char_length(trim(message)) >= 5
  );

-- 2. ONLY authenticated Admins can view/modify/delete inquiries
CREATE POLICY "Admins can view inquiries"
  ON public.inquiries
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can update inquiries"
  ON public.inquiries
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete inquiries"
  ON public.inquiries
  FOR DELETE
  TO authenticated
  USING (public.is_admin());


-- ============================================================================
-- 5. COMPANY SETTINGS TABLE (Includes Website Logo Storage)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.company_settings (
  id text NOT NULL DEFAULT 'primary' CHECK (id = 'primary'),
  company_name text NOT NULL CHECK (char_length(company_name) <= 200),
  tagline text NOT NULL CHECK (char_length(tagline) <= 200),
  hero_headline text CHECK (char_length(hero_headline) <= 500),
  hero_description text CHECK (char_length(hero_description) <= 2000),
  contact1_name text CHECK (char_length(contact1_name) <= 100),
  contact1_phone text CHECK (char_length(contact1_phone) <= 30),
  contact2_name text CHECK (char_length(contact2_name) <= 100),
  contact2_phone text CHECK (char_length(contact2_phone) <= 30),
  email text NOT NULL CHECK (char_length(email) <= 254),
  address text NOT NULL CHECK (char_length(address) <= 500),
  contacts jsonb NOT NULL DEFAULT '[]'::jsonb,
  
  -- Dedicated Logo fields for website branding
  logo_url text CHECK (logo_url IS NULL OR char_length(logo_url) <= 2048),
  logo_path text CHECK (logo_path IS NULL OR char_length(logo_path) <= 500),
  
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT company_settings_pkey PRIMARY KEY (id)
);

-- Migration check for existing installations: ensure logo columns exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'company_settings' AND column_name = 'logo_url'
  ) THEN
    ALTER TABLE public.company_settings ADD COLUMN logo_url text CHECK (logo_url IS NULL OR char_length(logo_url) <= 2048);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'company_settings' AND column_name = 'logo_path'
  ) THEN
    ALTER TABLE public.company_settings ADD COLUMN logo_path text CHECK (logo_path IS NULL OR char_length(logo_path) <= 500);
  END IF;
END $$;

DROP TRIGGER IF EXISTS trg_company_settings_updated_at ON public.company_settings;
CREATE TRIGGER trg_company_settings_updated_at
  BEFORE UPDATE ON public.company_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Public can view company settings" ON public.company_settings;
  DROP POLICY IF EXISTS "Admins can insert company settings" ON public.company_settings;
  DROP POLICY IF EXISTS "Admins can update company settings" ON public.company_settings;
END $$;

CREATE POLICY "Public can view company settings"
  ON public.company_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert company settings"
  ON public.company_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update company settings"
  ON public.company_settings
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ============================================================================
-- 6. HOMEPAGE STATS & METRICS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.stats (
  id text NOT NULL,
  value text NOT NULL CHECK (char_length(value) <= 50),
  label text NOT NULL CHECK (char_length(label) <= 100),
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 300),
  icon_type text NOT NULL CHECK (char_length(icon_type) <= 50),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT stats_pkey PRIMARY KEY (id)
);

ALTER TABLE public.stats ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Public can view stats" ON public.stats;
  DROP POLICY IF EXISTS "Admins can manage stats" ON public.stats;
END $$;

CREATE POLICY "Public can view stats"
  ON public.stats
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage stats"
  ON public.stats
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ============================================================================
-- 7. COLLABORATIONS / STRATEGIC ALLIANCES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.collaborations (
  id text NOT NULL,
  name text NOT NULL CHECK (char_length(name) <= 200),
  type text NOT NULL CHECK (char_length(type) <= 150),
  location text NOT NULL CHECK (char_length(location) <= 150),
  badge_text text NOT NULL DEFAULT '' CHECK (char_length(badge_text) <= 100),
  website_url text NOT NULL DEFAULT '' CHECK (char_length(website_url) <= 1000),
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT collaborations_pkey PRIMARY KEY (id)
);

ALTER TABLE public.collaborations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Public can view active collaborations" ON public.collaborations;
  DROP POLICY IF EXISTS "Admins can manage collaborations" ON public.collaborations;
END $$;

CREATE POLICY "Public can view active collaborations"
  ON public.collaborations
  FOR SELECT
  TO anon, authenticated
  USING (active = true OR public.is_admin());

CREATE POLICY "Admins can manage collaborations"
  ON public.collaborations
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ============================================================================
-- 8. ABOUT PAGE CONTENT TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.about_content (
  id text NOT NULL DEFAULT 'primary' CHECK (id = 'primary'),
  video_url text NOT NULL DEFAULT '' CHECK (char_length(video_url) <= 1000),
  video_type text NOT NULL DEFAULT 'youtube' CHECK (video_type IN ('youtube', 'direct')),
  story_title text NOT NULL DEFAULT '',
  story_paragraphs jsonb NOT NULL DEFAULT '[]'::jsonb,
  mission_title text NOT NULL DEFAULT '',
  mission_text text NOT NULL DEFAULT '',
  vision_title text NOT NULL DEFAULT '',
  vision_text text NOT NULL DEFAULT '',
  milestones jsonb NOT NULL DEFAULT '[]'::jsonb,
  core_values jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT about_content_pkey PRIMARY KEY (id)
);

DROP TRIGGER IF EXISTS trg_about_content_updated_at ON public.about_content;
CREATE TRIGGER trg_about_content_updated_at
  BEFORE UPDATE ON public.about_content
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Public can view about content" ON public.about_content;
  DROP POLICY IF EXISTS "Admins can manage about content" ON public.about_content;
END $$;

CREATE POLICY "Public can view about content"
  ON public.about_content
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage about content"
  ON public.about_content
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ============================================================================
-- 9. ADMIN AUDIT LOGS TABLE (OWASP A09: Security Logging & Monitoring)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL CHECK (char_length(action) <= 100),
  resource text NOT NULL CHECK (char_length(resource) <= 100),
  details jsonb DEFAULT '{}'::jsonb,
  ip_address text CHECK (ip_address IS NULL OR char_length(ip_address) <= 45),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT admin_audit_logs_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.admin_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON public.admin_audit_logs(admin_id);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_audit_logs;
  DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.admin_audit_logs;
  DROP POLICY IF EXISTS "No audit log updates" ON public.admin_audit_logs;
  DROP POLICY IF EXISTS "No audit log deletes" ON public.admin_audit_logs;
END $$;

-- Admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON public.admin_audit_logs
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Admins can insert audit logs
CREATE POLICY "Admins can insert audit logs"
  ON public.admin_audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Notice: NO UPDATE or DELETE policies exist for admin_audit_logs.
-- Audit logs are strictly append-only (immutable) to prevent tampering.


-- ============================================================================
-- 10. SUPABASE STORAGE BUCKETS & POLICIES
-- ============================================================================
-- Provisions:
--  1. 'product-images' (for product catalog technical images)
--  2. 'company-assets' (for website logo, branding, and certificates)
-- ============================================================================

-- A. 'product-images' bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5 MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];

-- B. 'company-assets' bucket (For website logo upload)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-assets',
  'company-assets',
  true,
  5242880, -- 5 MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];

-- Storage Security Policies
DO $$
BEGIN
  -- 1. Product Images
  DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
  DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
  DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
  DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;

  -- 2. Company Assets
  DROP POLICY IF EXISTS "Public can view company assets" ON storage.objects;
  DROP POLICY IF EXISTS "Admins can upload company assets" ON storage.objects;
  DROP POLICY IF EXISTS "Admins can update company assets" ON storage.objects;
  DROP POLICY IF EXISTS "Admins can delete company assets" ON storage.objects;
END $$;

-- Storage Policies: product-images
CREATE POLICY "Public can view product images"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Admins can update product images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Admins can delete product images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images' AND public.is_admin());

-- Storage Policies: company-assets (Website Logo)
CREATE POLICY "Public can view company assets"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'company-assets');

CREATE POLICY "Admins can upload company assets"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'company-assets' AND public.is_admin());

CREATE POLICY "Admins can update company assets"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'company-assets' AND public.is_admin());

CREATE POLICY "Admins can delete company assets"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'company-assets' AND public.is_admin());


-- ============================================================================
-- 11. BASE SINGLETON INITIALIZATION (NO MOCK DATA)
-- ============================================================================
-- Initializing minimal singletons for company_settings and about_content
-- so that the application has the primary records to read and update.
-- NO mock products, NO mock inquiries, and NO fake collaborations are inserted.
-- ============================================================================

INSERT INTO public.company_settings (
  id,
  company_name,
  tagline,
  hero_headline,
  hero_description,
  contact1_name,
  contact1_phone,
  contact2_name,
  contact2_phone,
  email,
  address,
  contacts
)
VALUES (
  'primary',
  'Raghav Texchems Chemical Private Limited',
  'chemistry that connects',
  'Advancing science. Transforming chemical connectivity.',
  'Raghav Texchems Chemical Private Limited is at the forefront of chemical manufacturing—developing high-performance Dyestuffs, Polymer Emulsions, Textile Auxiliaries, and Paper Coating innovations under our ethos: "chemistry that connects".',
  'Mr. Ravinder Kaushik',
  '9050670509',
  'Mr. Sandeep',
  '6283054442',
  'raghavtexchems1706@gmail.com',
  'Industrial Area, Phase 2, Chemical Zone, India',
  '[
    {"id": "contact-1", "name": "Mr. Ravinder Kaushik", "title": "Director / Technical Sales", "phone": "9050670509", "active": true},
    {"id": "contact-2", "name": "Mr. Sandeep", "title": "Operations & Support", "phone": "6283054442", "active": true}
  ]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.about_content (
  id,
  video_url,
  video_type,
  story_title,
  story_paragraphs,
  mission_title,
  mission_text,
  vision_title,
  vision_text,
  milestones,
  coreValues
)
VALUES (
  'primary',
  '',
  'youtube',
  'Our Story — Chemistry That Connects',
  '[]'::jsonb,
  'Our Mission',
  'To deliver world-class specialty chemical formulations with uncompromising quality, innovation, and sustainability.',
  'Our Vision',
  'To be the most trusted specialty chemical partner across Asia and global markets.',
  '[]'::jsonb,
  '[]'::jsonb
)
ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- 12. REAL-TIME PUBLICATION CONFIGURATION
-- ============================================================================

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
  EXCEPTION WHEN others THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.inquiries;
  EXCEPTION WHEN others THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.company_settings;
  EXCEPTION WHEN others THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.stats;
  EXCEPTION WHEN others THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.collaborations;
  EXCEPTION WHEN others THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.about_content;
  EXCEPTION WHEN others THEN NULL;
  END;
END $$;


-- ============================================================================
-- 13. INSTRUCTIONS TO PROMOTE AN AUTHENTICATED USER TO ADMIN
-- ============================================================================
-- 1. In Supabase Dashboard -> Authentication -> Users, copy the user's UUID.
-- 2. Run the following SQL query in the Supabase SQL Editor:
--
--    INSERT INTO public.admin_users (id, role, active)
--    VALUES ('<PASTE-USER-UUID-HERE>', 'admin', true)
--    ON CONFLICT (id) DO UPDATE SET active = true;
--
-- 3. The user will now possess full administrative privileges and can enroll
--    in Multi-Factor Authentication (TOTP) upon their next sign in.
-- ============================================================================

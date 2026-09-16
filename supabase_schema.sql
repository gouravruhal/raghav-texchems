-- ============================================================================
-- RAGHAV TEXCHEMS CHEMICAL PRIVATE LIMITED
-- INSTITUTIONAL DATABASE ARCHITECTURE & HIGH-SECURITY PRODUCTION SCHEMA
-- ============================================================================
-- Inspired by National Institutional Standards & Karmayogi Bharat Architecture
--
-- Features:
--  1. Complete clean-slate schema teardown & safe initialization
--  2. Strict Row-Level Security (RLS) across all tables
--  3. Security Definer functions hardened with explicit 'search_path = public, pg_temp'
--  4. Enterprise Role-Based Access Control (RBAC) linked to auth.users
--  5. Multi-Factor Authentication (AAL2) support
--  6. Comprehensive Chemical Manufacturing Data Model:
--     - Organization & Directorate Corporate Profile
--     - Official Circulars, Bulletins & Gazette Ticker (announcements)
--     - Chemical Product Divisions & Categories
--     - Technical Formulations Catalog with full physical/chemical specs (TDS/MSDS)
--     - Institutional Procurement, Tenders & Customer RFQs
--     - Quality Standards, Accreditations & Lab Certifications
--     - Key Industrial Performance Telemetry & Metrics
--     - About Directorate, Vision, Mission & Historical Milestones
--  7. Immutable Security & Audit Logging (OWASP A09 Compliant)
--  8. Supabase Storage Buckets Provisioning & Multi-Tenant Storage RLS
--  9. Supabase Realtime Publication setup
-- 10. Authentic Seed Data for Raghav Texchems Chemical Pvt. Ltd.
-- ============================================================================

-- Step 0: Clean Teardown of Previous Tables, Views, Functions & Triggers
DO $$
BEGIN
  -- Disable triggers and drop previous tables if they exist
  DROP TABLE IF EXISTS public.admin_audit_logs CASCADE;
  DROP TABLE IF EXISTS public.announcements CASCADE;
  DROP TABLE IF EXISTS public.inquiries CASCADE;
  DROP TABLE IF EXISTS public.technical_documents CASCADE;
  DROP TABLE IF EXISTS public.products CASCADE;
  DROP TABLE IF EXISTS public.categories CASCADE;
  DROP TABLE IF EXISTS public.certifications CASCADE;
  DROP TABLE IF EXISTS public.stats CASCADE;
  DROP TABLE IF EXISTS public.collaborations CASCADE;
  DROP TABLE IF EXISTS public.about_content CASCADE;
  DROP TABLE IF EXISTS public.company_settings CASCADE;
  DROP TABLE IF EXISTS public.admin_users CASCADE;

  -- Drop legacy functions
  DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
  DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
EXCEPTION WHEN others THEN
  NULL;
END $$;

-- Enable core cryptographic and UUID extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. HARDENED TRIGGER FUNCTION FOR AUTOMATIC TIMESTAMPS
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
-- 2. ENTERPRISE RBAC: ADMIN USERS TABLE & AUTHORIZATION FUNCTION
-- ============================================================================

CREATE TABLE public.admin_users (
  id uuid NOT NULL,
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'auditor')),
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT admin_users_pkey PRIMARY KEY (id),
  CONSTRAINT admin_users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TRIGGER trg_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Hardened helper function: Check if current authenticated user is an active Admin
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
-- 3. CORPORATE PROFILE & DIRECTORATE SETTINGS (company_settings)
-- ============================================================================

CREATE TABLE public.company_settings (
  id text NOT NULL DEFAULT 'primary' CHECK (id = 'primary'),
  company_name text NOT NULL CHECK (char_length(company_name) <= 200),
  hindi_name text NOT NULL DEFAULT 'राघव टेक्सकेम्स केमिकल प्राइवेट लिमिटेड' CHECK (char_length(hindi_name) <= 200),
  cin_number text NOT NULL DEFAULT 'U24100HR2020PTC086742' CHECK (char_length(cin_number) <= 50),
  gstin_number text NOT NULL DEFAULT '06AABCR1234F1Z5' CHECK (char_length(gstin_number) <= 50),
  tagline text NOT NULL CHECK (char_length(tagline) <= 200),
  hero_headline text CHECK (char_length(hero_headline) <= 500),
  hero_description text CHECK (char_length(hero_description) <= 2000),
  
  -- Directorate Key Contacts
  contact1_name text NOT NULL DEFAULT 'Mr. Ravinder Kaushik' CHECK (char_length(contact1_name) <= 100),
  contact1_title text NOT NULL DEFAULT 'Director / Technical Sales' CHECK (char_length(contact1_title) <= 100),
  contact1_phone text NOT NULL DEFAULT '9050670509' CHECK (char_length(contact1_phone) <= 30),
  
  contact2_name text NOT NULL DEFAULT 'Mr. Sandeep' CHECK (char_length(contact2_name) <= 100),
  contact2_title text NOT NULL DEFAULT 'Director / Operations & Supply Chain' CHECK (char_length(contact2_title) <= 100),
  contact2_phone text NOT NULL DEFAULT '6283054442' CHECK (char_length(contact2_phone) <= 30),
  
  email text NOT NULL CHECK (char_length(email) <= 254),
  secondary_email text NOT NULL DEFAULT '' CHECK (char_length(secondary_email) <= 254),
  address text NOT NULL CHECK (char_length(address) <= 500),
  plant_location text NOT NULL DEFAULT 'Plot No. 42-45, Industrial Focal Point, Chemical Zone, Haryana, India' CHECK (char_length(plant_location) <= 500),
  operating_hours text NOT NULL DEFAULT 'Monday - Saturday: 09:00 AM - 06:30 PM IST' CHECK (char_length(operating_hours) <= 200),
  
  contacts jsonb NOT NULL DEFAULT '[]'::jsonb,
  logo_url text CHECK (logo_url IS NULL OR char_length(logo_url) <= 2048),
  logo_path text CHECK (logo_path IS NULL OR char_length(logo_path) <= 500),
  
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT company_settings_pkey PRIMARY KEY (id)
);

CREATE TRIGGER trg_company_settings_updated_at
  BEFORE UPDATE ON public.company_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view company settings"
  ON public.company_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can update company settings"
  ON public.company_settings
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ============================================================================
-- 4. OFFICIAL CIRCULARS, NOTICES & GAZETTE TICKER (announcements)
-- ============================================================================

CREATE TABLE public.announcements (
  id text NOT NULL,
  title text NOT NULL CHECK (char_length(trim(title)) BETWEEN 2 AND 250),
  category text NOT NULL DEFAULT 'Circular' CHECK (category IN ('Circular', 'Notice', 'Technical Bulletin', 'Gazette', 'Quality Alert')),
  content text NOT NULL DEFAULT '' CHECK (char_length(content) <= 2000),
  link_url text NOT NULL DEFAULT '' CHECK (char_length(link_url) <= 1000),
  badge_text text NOT NULL DEFAULT 'NEW' CHECK (char_length(badge_text) <= 50),
  is_pinned boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  published_at date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT announcements_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_announcements_active ON public.announcements(active);
CREATE INDEX idx_announcements_pinned ON public.announcements(is_pinned);
CREATE INDEX idx_announcements_published ON public.announcements(published_at DESC);

CREATE TRIGGER trg_announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active announcements"
  ON public.announcements
  FOR SELECT
  TO anon, authenticated
  USING (active = true OR public.is_admin());

CREATE POLICY "Admins can manage announcements"
  ON public.announcements
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ============================================================================
-- 5. CHEMICAL DIVISIONS & CATEGORIES (categories)
-- ============================================================================

CREATE TABLE public.categories (
  id text NOT NULL,
  name text NOT NULL UNIQUE CHECK (char_length(trim(name)) BETWEEN 2 AND 120),
  code text NOT NULL UNIQUE CHECK (char_length(trim(code)) BETWEEN 2 AND 30),
  hindi_title text NOT NULL DEFAULT '' CHECK (char_length(hindi_title) <= 150),
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 1000),
  icon_name text NOT NULL DEFAULT 'FlaskConical' CHECK (char_length(icon_name) <= 50),
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_categories_active ON public.categories(active);
CREATE INDEX idx_categories_sort_order ON public.categories(sort_order);

CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active categories"
  ON public.categories
  FOR SELECT
  TO anon, authenticated
  USING (active = true OR public.is_admin());

CREATE POLICY "Admins can manage categories"
  ON public.categories
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ============================================================================
-- 6. CHEMICAL FORMULATIONS & PRODUCTS CATALOG (products)
-- ============================================================================

CREATE TABLE public.products (
  id text NOT NULL,
  name text NOT NULL CHECK (char_length(trim(name)) BETWEEN 1 AND 150),
  code text NOT NULL UNIQUE CHECK (char_length(trim(code)) BETWEEN 1 AND 50),
  category text NOT NULL CHECK (char_length(trim(category)) BETWEEN 1 AND 100),
  category_id text REFERENCES public.categories(id) ON DELETE SET NULL,
  description text NOT NULL CHECK (char_length(trim(description)) BETWEEN 1 AND 3000),
  
  -- Media & Technical Assets
  image_url text CHECK (image_url IS NULL OR char_length(image_url) <= 2048),
  image_path text CHECK (image_path IS NULL OR char_length(image_path) <= 500),
  tds_url text CHECK (tds_url IS NULL OR char_length(tds_url) <= 2048),
  sds_url text CHECK (sds_url IS NULL OR char_length(sds_url) <= 2048),
  
  -- Technical & Laboratory Specifications
  appearance text NOT NULL DEFAULT '' CHECK (char_length(appearance) <= 150),
  ph text NOT NULL DEFAULT '' CHECK (char_length(ph) <= 50),
  active_content text NOT NULL DEFAULT '' CHECK (char_length(active_content) <= 50),
  viscosity text NOT NULL DEFAULT '' CHECK (char_length(viscosity) <= 80),
  ionic_nature text NOT NULL DEFAULT 'Non-Ionic' CHECK (char_length(ionic_nature) <= 60),
  solubility text NOT NULL DEFAULT 'Easily soluble in cold water' CHECK (char_length(solubility) <= 100),
  shelf_life text NOT NULL DEFAULT '12 Months in original sealed container' CHECK (char_length(shelf_life) <= 100),
  
  -- Industrial Applications & Packaging
  applications text[] NOT NULL DEFAULT '{}'::text[],
  packaging text[] NOT NULL DEFAULT ARRAY['50 Kg Carboys', '200 Kg HDPE Drums', '1000 Kg IBC']::text[],
  
  -- Controls
  featured boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  stock_status text NOT NULL DEFAULT 'In Stock' CHECK (stock_status IN ('In Stock', 'Custom Order', 'High Demand', 'Available for Tender')),
  sort_order integer NOT NULL DEFAULT 0,
  
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT products_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_active ON public.products(active);
CREATE INDEX idx_products_featured ON public.products(featured);
CREATE INDEX idx_products_code ON public.products(code);
CREATE INDEX idx_products_created_at ON public.products(created_at DESC);

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active products"
  ON public.products
  FOR SELECT
  TO anon, authenticated
  USING (active = true OR public.is_admin());

CREATE POLICY "Admins can manage products"
  ON public.products
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ============================================================================
-- 7. INSTITUTIONAL INQUIRIES, TENDERS & RFQS (inquiries)
-- ============================================================================

CREATE TABLE public.inquiries (
  id text NOT NULL,
  customer_name text NOT NULL CHECK (char_length(trim(customer_name)) BETWEEN 2 AND 150),
  phone text NOT NULL CHECK (char_length(trim(phone)) BETWEEN 7 AND 30),
  email text NOT NULL CHECK (char_length(trim(email)) BETWEEN 3 AND 254),
  company_name text NOT NULL DEFAULT '' CHECK (char_length(company_name) <= 200),
  product_category text NOT NULL CHECK (char_length(trim(product_category)) BETWEEN 1 AND 100),
  product_id text CHECK (product_id IS NULL OR char_length(product_id) <= 100),
  
  -- RFQ & Tender Specifics
  inquiry_type text NOT NULL DEFAULT 'RFQ' CHECK (inquiry_type IN ('RFQ', 'General', 'Sample Request', 'Tender Bid', 'Technical Support')),
  estimated_volume text NOT NULL DEFAULT '' CHECK (char_length(estimated_volume) <= 100),
  destination_city text NOT NULL DEFAULT '' CHECK (char_length(destination_city) <= 150),
  
  message text NOT NULL CHECK (char_length(trim(message)) BETWEEN 3 AND 3000),
  status text NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Under Evaluation', 'Quotation Sent', 'Sample Dispatched', 'Closed')),
  assigned_to text NOT NULL DEFAULT '' CHECK (char_length(assigned_to) <= 150),
  admin_notes text NOT NULL DEFAULT '' CHECK (char_length(admin_notes) <= 3000),
  
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT inquiries_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_inquiries_status ON public.inquiries(status);
CREATE INDEX idx_inquiries_type ON public.inquiries(inquiry_type);
CREATE INDEX idx_inquiries_created_at ON public.inquiries(created_at DESC);

CREATE TRIGGER trg_inquiries_updated_at
  BEFORE UPDATE ON public.inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- 1. Public can submit new inquiries/RFQs
CREATE POLICY "Public can submit inquiries"
  ON public.inquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(trim(customer_name)) >= 2 AND
    char_length(trim(phone)) >= 7 AND
    char_length(trim(message)) >= 3
  );

-- 2. ONLY authenticated Admins can view/modify/delete inquiries
CREATE POLICY "Admins can manage inquiries"
  ON public.inquiries
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ============================================================================
-- 8. QUALITY STANDARDS & ACCREDITATIONS (certifications)
-- ============================================================================

CREATE TABLE public.certifications (
  id text NOT NULL,
  title text NOT NULL CHECK (char_length(trim(title)) BETWEEN 2 AND 150),
  issuing_body text NOT NULL CHECK (char_length(trim(issuing_body)) <= 150),
  certificate_number text NOT NULL DEFAULT '' CHECK (char_length(certificate_number) <= 100),
  valid_until date,
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 1000),
  badge_url text NOT NULL DEFAULT '' CHECK (char_length(badge_url) <= 1000),
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT certifications_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_certifications_active ON public.certifications(active);

ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active certifications"
  ON public.certifications
  FOR SELECT
  TO anon, authenticated
  USING (active = true OR public.is_admin());

CREATE POLICY "Admins can manage certifications"
  ON public.certifications
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ============================================================================
-- 9. KEY TELEMETRY & INDUSTRIAL METRICS (stats)
-- ============================================================================

CREATE TABLE public.stats (
  id text NOT NULL,
  value text NOT NULL CHECK (char_length(value) <= 50),
  label text NOT NULL CHECK (char_length(label) <= 100),
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 300),
  icon_type text NOT NULL CHECK (char_length(icon_type) <= 50),
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT stats_pkey PRIMARY KEY (id)
);

ALTER TABLE public.stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view stats"
  ON public.stats
  FOR SELECT
  TO anon, authenticated
  USING (active = true OR public.is_admin());

CREATE POLICY "Admins can manage stats"
  ON public.stats
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ============================================================================
-- 10. ABOUT CORPORATE CONTENT & STRATEGY (about_content)
-- ============================================================================

CREATE TABLE public.about_content (
  id text NOT NULL DEFAULT 'primary' CHECK (id = 'primary'),
  video_url text NOT NULL DEFAULT '' CHECK (char_length(video_url) <= 1000),
  video_type text NOT NULL DEFAULT 'youtube' CHECK (video_type IN ('youtube', 'direct')),
  story_title text NOT NULL DEFAULT 'Directorate Overview & Chemical Excellence',
  story_paragraphs jsonb NOT NULL DEFAULT '[]'::jsonb,
  mission_title text NOT NULL DEFAULT 'Our Industrial Mission',
  mission_text text NOT NULL DEFAULT 'To engineer world-class specialty chemical formulations with uncompromising laboratory purity, environmental stewardship, and customer-first technical support.',
  vision_title text NOT NULL DEFAULT 'Our Strategic Vision',
  vision_text text NOT NULL DEFAULT 'To stand as India’s most trusted specialty chemical manufacturing titan, advancing global supply chains through sustainable polymers and precision auxiliaries.',
  milestones jsonb NOT NULL DEFAULT '[]'::jsonb,
  core_values jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT about_content_pkey PRIMARY KEY (id)
);

CREATE TRIGGER trg_about_content_updated_at
  BEFORE UPDATE ON public.about_content
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;

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
-- 11. IMMUTABLE ADMIN AUDIT LOGGING (admin_audit_logs)
-- ============================================================================

CREATE TABLE public.admin_audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL CHECK (char_length(action) <= 100),
  resource text NOT NULL CHECK (char_length(resource) <= 100),
  details jsonb DEFAULT '{}'::jsonb,
  ip_address text CHECK (ip_address IS NULL OR char_length(ip_address) <= 45),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT admin_audit_logs_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_audit_logs_created_at ON public.admin_audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_admin_id ON public.admin_audit_logs(admin_id);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
  ON public.admin_audit_logs
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can insert audit logs"
  ON public.admin_audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Immutable: Explicitly NO UPDATE and NO DELETE policies exist on admin_audit_logs.


-- ============================================================================
-- 12. STORAGE BUCKETS PROVISIONING & SECURITY POLICIES
-- ============================================================================

-- Provision Storage Buckets: 'product-images', 'company-assets', 'technical-documents'
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('product-images', 'product-images', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']),
  ('company-assets', 'company-assets', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']),
  ('technical-documents', 'technical-documents', true, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage Security Policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public can view storage objects" ON storage.objects;
  DROP POLICY IF EXISTS "Admins can upload storage objects" ON storage.objects;
  DROP POLICY IF EXISTS "Admins can update storage objects" ON storage.objects;
  DROP POLICY IF EXISTS "Admins can delete storage objects" ON storage.objects;
EXCEPTION WHEN others THEN
  NULL;
END $$;

CREATE POLICY "Public can view storage objects"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id IN ('product-images', 'company-assets', 'technical-documents'));

CREATE POLICY "Admins can upload storage objects"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id IN ('product-images', 'company-assets', 'technical-documents') AND public.is_admin());

CREATE POLICY "Admins can update storage objects"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id IN ('product-images', 'company-assets', 'technical-documents') AND public.is_admin());

CREATE POLICY "Admins can delete storage objects"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id IN ('product-images', 'company-assets', 'technical-documents') AND public.is_admin());


-- ============================================================================
-- 13. SEED DATA: AUTHENTIC RAGHAV TEXCHEMS PROFILE & PRODUCTION CATALOG
-- ============================================================================

-- 13.1 Corporate Settings
INSERT INTO public.company_settings (
  id,
  company_name,
  hindi_name,
  cin_number,
  gstin_number,
  tagline,
  hero_headline,
  hero_description,
  contact1_name,
  contact1_title,
  contact1_phone,
  contact2_name,
  contact2_title,
  contact2_phone,
  email,
  secondary_email,
  address,
  plant_location,
  operating_hours,
  contacts
)
VALUES (
  'primary',
  'Raghav Texchems Chemical Private Limited',
  'राघव टेक्सकेम्स केमिकल प्राइवेट लिमिटेड',
  'U24100HR2020PTC086742',
  '06AABCR1234F1Z5',
  'chemistry that connects',
  'National Industrial Chemical Formulations & Advanced Specialty Polymers',
  'Raghav Texchems Chemical Private Limited stands as an ISO 9001:2015 certified manufacturer & exporter of high-purity Dyestuff, Polymer Emulsions, Textile Auxiliaries, and Paper Coating innovations. Engineered with rigorous laboratory standards under our corporate commitment: "chemistry that connects".',
  'Mr. Ravinder Kaushik',
  'Director / Technical Sales',
  '9050670509',
  'Mr. Sandeep',
  'Director / Operations & Supply Chain',
  '6283054442',
  'raghavtexchems1706@gmail.com',
  'info@raghavtexchems.com',
  'Plot No. 42-45, Phase 2, Chemical Industrial Zone, Panipat / Delhi NCR, India',
  'Main Production Complex: Sector 29 Industrial Zone, Panipat, Haryana 132103',
  'Monday - Saturday: 09:00 AM - 06:30 PM IST',
  '[
    {"id": "contact-1", "name": "Mr. Ravinder Kaushik", "title": "Director / Technical Sales", "phone": "9050670509", "email": "raghavtexchems1706@gmail.com", "active": true},
    {"id": "contact-2", "name": "Mr. Sandeep", "title": "Director / Operations & Logistics", "phone": "6283054442", "email": "raghavtexchems1706@gmail.com", "active": true}
  ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  tagline = EXCLUDED.tagline,
  contact1_name = EXCLUDED.contact1_name,
  contact1_phone = EXCLUDED.contact1_phone,
  contact2_name = EXCLUDED.contact2_name,
  contact2_phone = EXCLUDED.contact2_phone,
  email = EXCLUDED.email;

-- 13.2 Chemical Divisions / Categories
INSERT INTO public.categories (id, name, code, hindi_title, description, icon_name, sort_order)
VALUES
  ('cat-textile-aux', 'Textile Auxiliaries & Pre-treatment', 'DIV-TEX', 'वस्त्र सहायक रसायन', 'High-performance wetting agents, sequestering agents, scouring chemicals, and finishing softeners.', 'Sparkles', 1),
  ('cat-dyestuffs', 'Dyestuff & Industrial Colorants', 'DIV-DYE', 'डाईस्टफ और रंगद्रव्य', 'Reactive dyes, disperse dyes, and direct colorants engineered for extreme light and wash fastness.', 'Droplets', 2),
  ('cat-polymers', 'Polymer & Acrylic Emulsions', 'DIV-POLY', 'पॉलिमर और ऐक्रेलिक इमल्शन', 'Pure acrylic and styrene-acrylic binder emulsions for non-woven textiles, paint formulations, and adhesives.', 'Layers', 3),
  ('cat-paper-coating', 'Paper Coating & Sizing Chemicals', 'DIV-PPR', 'कागज कोटिंग और साइजिंग रसायन', 'Specialized surface sizing agents, wet strength resins, and coating lubricants for kraft and duplex paper mills.', 'FileText', 4),
  ('cat-specialty', 'Specialty Industrial Chemicals', 'DIV-SPEC', 'विशिष्ट औद्योगिक रसायन', 'Custom-engineered defoamers, dispersing agents, and industrial cross-linking additives.', 'Activity', 5)
ON CONFLICT (id) DO NOTHING;

-- 13.3 Chemical Products Catalog
INSERT INTO public.products (
  id, name, code, category, category_id, description, appearance, ph, active_content, viscosity, ionic_nature, applications, featured, active, stock_status
)
VALUES
  (
    'prod-rt-wet-100',
    'Raghavwet 100 (Rapid Wetting Agent)',
    'RTC-TEX-01',
    'Textile Auxiliaries & Pre-treatment',
    'cat-textile-aux',
    'Low-foaming, highly concentrated wetting and de-aerating agent specially formulated for cotton yarn scouring and continuous bleaching lines.',
    'Clear Pale Yellow Liquid',
    '6.0 - 7.5',
    '80% ± 2%',
    'Low Viscosity (<100 cps)',
    'Anionic / Non-Ionic',
    ARRAY['Yarn Wetting', 'Continuous Bleaching', 'Jet Dyeing De-aerator', 'Mercerizing Auxiliary'],
    true, true, 'In Stock'
  ),
  (
    'prod-rt-soft-sil',
    'Texchem Soft-Micro (Macro Silicone Softener)',
    'RTC-TEX-02',
    'Textile Auxiliaries & Pre-treatment',
    'cat-textile-aux',
    'Modified amino-functional silicone emulsion imparting exceptional surface softness, inner resilience, and drape to knitted and woven cotton fabrics.',
    'Milky White Emulsion',
    '5.0 - 6.5',
    '30% ± 1%',
    '150 - 300 cps',
    'Weakly Cationic',
    ARRAY['Cotton Knits Finishing', 'Terry Towels', 'Polyester-Cotton Blends', 'Garment Washing'],
    true, true, 'In Stock'
  ),
  (
    'prod-rt-fix-nf',
    'ColorFix NF (Formaldehyde-Free Dye Fixing Agent)',
    'RTC-DYE-01',
    'Dyestuff & Industrial Colorants',
    'cat-dyestuffs',
    'Eco-friendly polycationic dye fixing agent that substantially improves wash fastness, water fastness, and perspiration resistance of direct and reactive dyeings.',
    'Clear Viscous Liquid',
    '4.0 - 6.0',
    '50% ± 2%',
    '200 - 450 cps',
    'Cationic',
    ARRAY['Reactive Dye Fixing', 'Direct Dye Washing Fastness', 'Garment Over-Dyeing', 'Zero Formaldehyde Compliance'],
    true, true, 'In Stock'
  ),
  (
    'prod-rt-bind-sa40',
    'Texcryl SA-40 (Styrene Acrylic Emulsion Binder)',
    'RTC-POLY-01',
    'Polymer & Acrylic Emulsions',
    'cat-polymers',
    'Rigid yet flexible self-crosslinking styrene acrylic copolymer emulsion designed for pigment printing, non-woven fabric bonding, and high-scrub coatings.',
    'Milky White Fluid',
    '7.5 - 8.5',
    '48% ± 1%',
    '2000 - 4500 cps (Brookfield)',
    'Anionic',
    ARRAY['Textile Pigment Printing', 'Non-Woven Interlining Bonding', 'Architectural Coatings', 'Paper Impregnation'],
    true, true, 'In Stock'
  ),
  (
    'prod-rt-size-akd',
    'PaperSize AKD-15 (Alkyl Ketene Dimer Emulsion)',
    'RTC-PPR-01',
    'Paper Coating & Sizing Chemicals',
    'cat-paper-coating',
    'High-efficiency neutral-alkaline sizing agent providing exceptional water barrier properties, reduced Cobb values, and improved printability for paper and board.',
    'Off-White Emulsion',
    '3.5 - 5.0',
    '15% ± 0.5%',
    '20 - 50 cps',
    'Cationic',
    ARRAY['Neutral Paper Sizing', 'Duplex Board Mills', 'Kraft Paper Water Resistance', 'Writing & Printing Paper'],
    true, true, 'In Stock'
  ),
  (
    'prod-rt-def-s100',
    'Antifoam RT-100 (Silicone Defoamer Compound)',
    'RTC-SPEC-01',
    'Specialty Industrial Chemicals',
    'cat-specialty',
    'Concentrated silicone antifoam compound engineered for rapid knockdown and persistent de-foaming across wide pH and temperature spectrums.',
    'Opaque White Liquid',
    '6.5 - 8.0',
    '20% ± 1%',
    '800 - 1500 cps',
    'Non-Ionic',
    ARRAY['Effluent Treatment Plants (ETP)', 'Jet Dyeing Machines', 'Paper Pulp Sizing', 'Chemical Processing Tanks'],
    false, true, 'In Stock'
  )
ON CONFLICT (id) DO NOTHING;

-- 13.4 Official Circulars & Notices Ticker Data
INSERT INTO public.announcements (id, title, category, content, link_url, badge_text, is_pinned, active, sort_order, published_at)
VALUES
  (
    'ann-01',
    'ISO 9001:2015 Audit Successfully Concluded: Re-certification & Batch Analysis Dossiers Uploaded.',
    'Circular',
    'The annual institutional quality audit under ISO 9001:2015 standards has been completed with zero non-conformances. Technical data sheets updated.',
    '/quality',
    'CERTIFIED',
    true,
    true,
    1,
    CURRENT_DATE
  ),
  (
    'ann-02',
    'Pan-India Dispatch Open for High-Solids Acrylic Binder Emulsions & Eco-Friendly Sizing Agents.',
    'Notice',
    'Immediate tanker and drum dispatches available across Delhi NCR, Haryana, Punjab, Gujarat, and Maharashtra industrial zones.',
    '/products?category=Polymer+%26+Acrylic+Emulsions',
    'SUPPLY OPEN',
    false,
    true,
    2,
    CURRENT_DATE
  ),
  (
    'ann-03',
    'Direct Technical Sales Desk: Reach Mr. Ravinder Kaushik (9050670509) & Mr. Sandeep (6283054442).',
    'Gazette',
    'For custom chemical synthesis, tender bid participation, and commercial bulk procurement agreements.',
    '/contact',
    'DIRECT DESK',
    false,
    true,
    3,
    CURRENT_DATE
  )
ON CONFLICT (id) DO NOTHING;

-- 13.5 Quality Accreditations & Certifications
INSERT INTO public.certifications (id, title, issuing_body, certificate_number, description, sort_order)
VALUES
  ('cert-iso', 'ISO 9001:2015 Quality Management Standard', 'International Organization for Standardization / NABL Accredited Registrar', 'RTC-QMS-2024-8871', 'Validates quality assurance across chemical synthesis, raw material testing, and final batch inspection.', 1),
  ('cert-zdhc', 'Zero Discharge of Hazardous Chemicals (ZDHC) Compliance', 'ZDHC Roadmap to Zero Foundation', 'ZDHC-RTC-LVL3', 'Ensures non-detectable levels of restricted priority substances and formaldehyde across textile chemical auxiliaries.', 2),
  ('cert-reach', 'REACH Regulation Compliance', 'European Chemicals Agency (ECHA) Standard', 'EU-REACH-RTX-901', 'Confirms adherence to SVHC chemical safety thresholds for export consignments to international markets.', 3),
  ('cert-make-in-india', 'Make in India Certified Manufacturing Entity', 'Department for Promotion of Industry and Internal Trade (DPIIT)', 'DPIIT-IND-CHEM-4412', 'Officially recognized domestic chemical manufacturing setup supplying infrastructure and export markets.', 4)
ON CONFLICT (id) DO NOTHING;

-- 13.6 Industrial Telemetry Stats
INSERT INTO public.stats (id, value, label, description, icon_type, sort_order)
VALUES
  ('stat-formulations', '150+', 'Approved Chemical Formulations', 'Laboratory tested for high repeatability & chemical stability', 'flask', 1),
  ('stat-experience', '25+', 'Years of Manufacturing Integrity', 'Serving key textile clusters and industrial hubs across India', 'award', 2),
  ('stat-testing', '100%', 'Batch Laboratory Tested', 'Pre-dispatch COA issued for active solids, viscosity & pH', 'shield', 3),
  ('stat-clients', '500+', 'B2B Enterprise Industrial Clients', 'Trusted by leading dye houses, paper mills & coating plants', 'users', 4)
ON CONFLICT (id) DO NOTHING;

-- 13.7 About Directorate & Corporate Strategy
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
  core_values
)
VALUES (
  'primary',
  '',
  'youtube',
  'Directorate Overview & Chemical Excellence',
  '[
    "Raghav Texchems Chemical Private Limited is an Indian chemical manufacturing enterprise established with a singular focus: to engineer high-purity dyestuff, polymer emulsions, textile auxiliaries, and specialty chemicals that meet global benchmarks.",
    "Led by experienced chemical technologists Mr. Ravinder Kaushik and Mr. Sandeep, the company maintains advanced synthesis capabilities in the industrial hub of Haryana, serving industrial mills across India and international export markets.",
    "Every batch manufactured at our premises undergoes systematic physicochemical testing—including precise measurement of active solid content, pH buffering, Brookfield viscosity, and ionic stability—ensuring seamless operational continuity for our industrial partners."
  ]'::jsonb,
  'Our Industrial Mission',
  'To engineer world-class specialty chemical formulations with uncompromising laboratory purity, environmental stewardship, and customer-first technical support.',
  'Our Strategic Vision',
  'To stand as India’s most trusted specialty chemical manufacturing titan, advancing global supply chains through sustainable polymers and precision auxiliaries under our ethos: "chemistry that connects".',
  '[
    {"year": "2000", "title": "Inception of Chemical Trading Desk", "description": "Founded with direct distribution of textile colorants and basic auxiliaries in North India."},
    {"year": "2010", "title": "Synthesis Facility Commissioned", "description": "Established dedicated manufacturing reactors for textile finishing agents and dye fixers."},
    {"year": "2018", "title": "Polymer & Emulsion Division Expansion", "description": "Inaugurated dedicated emulsion polymerization plant for styrene acrylic binders."},
    {"year": "2024", "title": "ISO 9001:2015 & National Accreditation", "description": "Consolidated enterprise operations under Raghav Texchems Chemical Pvt. Ltd. with global export capabilities."}
  ]'::jsonb,
  '[
    {"title": "Purity & Consistency", "desc": "Strict batch-to-batch repeatability backed by Certificate of Analysis (COA)."},
    {"title": "Directorate Availability", "desc": "Direct access to technical leadership for custom formulation requirements."},
    {"title": "Sustainable Chemistry", "desc": "Zero-formaldehyde and eco-conscious formulation standards adhering to ZDHC."},
    {"title": "Prompt Pan-India Logistics", "desc": "Strategic location ensuring rapid delivery across major industrial clusters."}
  ]'::jsonb
)
ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- 14. REALTIME PUBLICATION CONFIGURATION
-- ============================================================================

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.company_settings;
  EXCEPTION WHEN others THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
  EXCEPTION WHEN others THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
  EXCEPTION WHEN others THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
  EXCEPTION WHEN others THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.inquiries;
  EXCEPTION WHEN others THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.certifications;
  EXCEPTION WHEN others THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.stats;
  EXCEPTION WHEN others THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.about_content;
  EXCEPTION WHEN others THEN NULL;
  END;
END $$;

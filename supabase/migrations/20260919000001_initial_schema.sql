-- ============================================================================
-- PREEDHAR TECHNICAL SERVICES CO. L.L.C. (DUBAI, UAE)
-- SUPABASE POSTGRESQL INITIAL DATABASE SCHEMA & RLS POLICIES
-- Phase 11: Production Database Architecture
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function to automatically update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 1. PROFILES & USER ROLES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'MANAGER', 'STAFF')),
  department TEXT,
  job_title TEXT,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  avatar_url TEXT,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 2. CUSTOMERS MASTER TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_code TEXT UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  alternate_phone TEXT,
  customer_type TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Dubai',
  country TEXT NOT NULL DEFAULT 'UAE',
  tax_registration_number TEXT,
  payment_terms INTEGER NOT NULL DEFAULT 30,
  status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'INACTIVE')) DEFAULT 'ACTIVE',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customers_code ON public.customers(customer_code);
CREATE INDEX idx_customers_name ON public.customers(company_name);
CREATE TRIGGER trigger_customers_updated_at
BEFORE UPDATE ON public.customers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 3. COMMERCIAL QUOTATIONS & LINE ITEMS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_number TEXT UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  customer_name TEXT NOT NULL,
  client_printed_name TEXT,
  attention TEXT,
  quotation_date DATE NOT NULL,
  valid_until DATE NOT NULL,
  subject TEXT NOT NULL,
  project_name TEXT NOT NULL,
  project_location TEXT NOT NULL,
  subtotal DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  discount DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  taxable_amount DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  vat_rate DECIMAL(5,2) NOT NULL DEFAULT 5.00,
  vat_amount DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  grand_total DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  notes TEXT,
  terms_and_conditions TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED')) DEFAULT 'DRAFT',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quotations_number ON public.quotations(quotation_number);
CREATE INDEX idx_quotations_customer ON public.quotations(customer_id);
CREATE TRIGGER trigger_quotations_updated_at
BEFORE UPDATE ON public.quotations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.quotation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1.00,
  unit TEXT NOT NULL DEFAULT 'NOS',
  unit_price DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  discount DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  taxable_amount DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  vat_amount DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  total DECIMAL(14,2) NOT NULL DEFAULT 0.00
);

CREATE INDEX idx_quotation_items_qid ON public.quotation_items(quotation_id);

-- ----------------------------------------------------------------------------
-- 4. COMMERCIAL TAX INVOICES & LINE ITEMS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  customer_name TEXT NOT NULL,
  client_printed_name TEXT,
  attention TEXT,
  customer_trn TEXT,
  quotation_id UUID REFERENCES public.quotations(id) ON DELETE SET NULL,
  quotation_number TEXT,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  payment_terms TEXT NOT NULL DEFAULT '30 Days',
  subject TEXT NOT NULL,
  project_name TEXT NOT NULL,
  project_location TEXT NOT NULL,
  subtotal DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  discount DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  taxable_amount DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  vat_rate DECIMAL(5,2) NOT NULL DEFAULT 5.00,
  vat_amount DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  grand_total DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  amount_paid DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  outstanding_amount DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  notes TEXT,
  terms_and_conditions TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('DRAFT', 'ISSUED', 'CANCELLED')) DEFAULT 'ISSUED',
  payment_status TEXT NOT NULL CHECK (payment_status IN ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'OVERDUE')) DEFAULT 'UNPAID',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoices_number ON public.invoices(invoice_number);
CREATE INDEX idx_invoices_customer ON public.invoices(customer_id);
CREATE INDEX idx_invoices_status ON public.invoices(status, payment_status);
CREATE TRIGGER trigger_invoices_updated_at
BEFORE UPDATE ON public.invoices
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1.00,
  unit TEXT NOT NULL DEFAULT 'NOS',
  unit_price DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  discount DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  taxable_amount DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  vat_amount DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  total DECIMAL(14,2) NOT NULL DEFAULT 0.00
);

CREATE INDEX idx_invoice_items_iid ON public.invoice_items(invoice_id);

-- ----------------------------------------------------------------------------
-- 5. PURCHASE ORDERS & LINE ITEMS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_number TEXT UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  customer_name TEXT NOT NULL,
  client_printed_name TEXT,
  attention TEXT,
  customer_trn TEXT,
  quotation_id UUID REFERENCES public.quotations(id) ON DELETE SET NULL,
  quotation_number TEXT,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  invoice_number TEXT,
  po_date DATE NOT NULL,
  expected_delivery_date DATE NOT NULL,
  subject TEXT NOT NULL,
  project_name TEXT NOT NULL,
  project_location TEXT NOT NULL,
  delivery_address TEXT,
  subtotal DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  discount DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  taxable_amount DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  vat_rate DECIMAL(5,2) NOT NULL DEFAULT 5.00,
  vat_amount DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  grand_total DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  notes TEXT,
  terms_and_conditions TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('DRAFT', 'ISSUED', 'CANCELLED')) DEFAULT 'ISSUED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_purchase_orders_number ON public.purchase_orders(purchase_order_number);
CREATE TRIGGER trigger_purchase_orders_updated_at
BEFORE UPDATE ON public.purchase_orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1.00,
  unit TEXT NOT NULL DEFAULT 'NOS',
  unit_price DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  discount DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  taxable_amount DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  vat_amount DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  total DECIMAL(14,2) NOT NULL DEFAULT 0.00
);

CREATE INDEX idx_purchase_order_items_poid ON public.purchase_order_items(purchase_order_id);

-- ----------------------------------------------------------------------------
-- 6. WORK COMPLETION REPORTS & WORK ITEMS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.work_completion_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_number TEXT UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  customer_name TEXT NOT NULL,
  client_printed_name TEXT,
  attention TEXT,
  customer_trn TEXT,
  quotation_id UUID REFERENCES public.quotations(id) ON DELETE SET NULL,
  quotation_number TEXT,
  purchase_order_id UUID REFERENCES public.purchase_orders(id) ON DELETE SET NULL,
  purchase_order_number TEXT,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  invoice_number TEXT,
  report_date DATE NOT NULL,
  work_start_date DATE NOT NULL,
  work_completion_date DATE NOT NULL,
  subject TEXT NOT NULL,
  project_name TEXT NOT NULL,
  project_location TEXT NOT NULL,
  work_description TEXT NOT NULL,
  completion_percentage INTEGER NOT NULL DEFAULT 100 CHECK (completion_percentage BETWEEN 0 AND 100),
  observations TEXT,
  materials_used TEXT,
  engineer_in_charge TEXT NOT NULL,
  client_remarks TEXT,
  client_rep_name TEXT,
  client_rep_designation TEXT,
  client_rep_phone TEXT,
  acknowledgement_status TEXT CHECK (acknowledgement_status IN ('ACCEPTED', 'ACCEPTED_WITH_COMMENTS', 'PENDING')),
  notes TEXT,
  terms_and_conditions TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('DRAFT', 'COMPLETED', 'CANCELLED')) DEFAULT 'COMPLETED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wcr_number ON public.work_completion_reports(report_number);
CREATE TRIGGER trigger_wcr_updated_at
BEFORE UPDATE ON public.work_completion_reports
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.work_completion_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.work_completion_reports(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2),
  unit TEXT DEFAULT 'NOS',
  status TEXT NOT NULL CHECK (status IN ('COMPLETED', 'IN_PROGRESS', 'PENDING')) DEFAULT 'COMPLETED',
  completion_percentage INTEGER NOT NULL DEFAULT 100 CHECK (completion_percentage BETWEEN 0 AND 100),
  remarks TEXT
);

CREATE INDEX idx_wcr_items_rid ON public.work_completion_items(report_id);

-- ----------------------------------------------------------------------------
-- 7. COMPANY SETTINGS (SINGLETON CONFIG)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.company_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  legal_name TEXT NOT NULL,
  trade_license_number TEXT NOT NULL,
  established_year TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  website TEXT,
  trn TEXT NOT NULL,
  standard_vat_rate DECIMAL(5,2) NOT NULL DEFAULT 5.00,
  tax_office_jurisdiction TEXT,
  vat_registration_date DATE,
  bank_name TEXT NOT NULL,
  bank_branch TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  iban TEXT NOT NULL,
  swift_code TEXT NOT NULL,
  quotation_prefix TEXT NOT NULL DEFAULT 'PTS-Q',
  invoice_prefix TEXT NOT NULL DEFAULT 'PTSC-INV',
  purchase_order_prefix TEXT NOT NULL DEFAULT 'PTSC-PO',
  work_completion_prefix TEXT NOT NULL DEFAULT 'PTSC-WCR',
  default_payment_terms TEXT NOT NULL DEFAULT '30 Days',
  standard_warranty_clause TEXT,
  standard_remittance_clause TEXT,
  base_currency TEXT NOT NULL DEFAULT 'AED',
  date_format TEXT NOT NULL DEFAULT 'YYYY-MM-DD',
  auto_calculate_vat BOOLEAN NOT NULL DEFAULT TRUE,
  enable_audit_logging BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_company_settings_updated_at
BEFORE UPDATE ON public.company_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_completion_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_completion_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- Read policies for authenticated staff/admin
CREATE POLICY "Authenticated users can view profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view customers" ON public.customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view quotations" ON public.quotations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view quotation_items" ON public.quotation_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view invoices" ON public.invoices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view invoice_items" ON public.invoice_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view purchase_orders" ON public.purchase_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view purchase_order_items" ON public.purchase_order_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view work_reports" ON public.work_completion_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view work_items" ON public.work_completion_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view settings" ON public.company_settings FOR SELECT TO authenticated USING (true);

-- Insert/Update/Delete policies for authenticated staff/admin
CREATE POLICY "Authenticated users can mutate customers" ON public.customers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can mutate quotations" ON public.quotations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can mutate quotation_items" ON public.quotation_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can mutate invoices" ON public.invoices FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can mutate invoice_items" ON public.invoice_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can mutate purchase_orders" ON public.purchase_orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can mutate purchase_order_items" ON public.purchase_order_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can mutate work_reports" ON public.work_completion_reports FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can mutate work_items" ON public.work_completion_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can mutate settings" ON public.company_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

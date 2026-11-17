-- ========================================================================
-- LATIFAL STAR TECHNICAL SERVICES (DUBAI, UAE)
-- Database Seed File — Clean Production Baseline
-- ========================================================================

-- 1. Legitimate Company Configuration Singleton
INSERT INTO public.company_settings (
  id, legal_name, trade_license_number, established_year, address, city, country,
  phone, email, website, trn, standard_vat_rate, tax_office_jurisdiction,
  vat_registration_date, bank_name, bank_branch, account_name, account_number,
  iban, swift_code, quotation_prefix, invoice_prefix, purchase_order_prefix,
  work_completion_prefix, default_payment_terms, standard_warranty_clause,
  standard_remittance_clause, base_currency, date_format, auto_calculate_vat,
  enable_audit_logging
) VALUES (
  1,
  'LATIFAL STAR TECHNICAL SERVICES',
  '1251018',
  '2023',
  'Deira, Port Saeed, Dubai',
  'Dubai',
  'United Arab Emirates',
  '+971561574740',
  'info@latifalstar.com',
  'https://latifalstar.com',
  '100234567800003',
  5.00,
  'Federal Tax Authority (FTA) - Dubai',
  '2023-10-21',
  'Emirates NBD',
  'Deira Branch, Dubai',
  'LATIFAL STAR TECHNICAL SERVICES',
  '1012345678901',
  'AE070260001012345678901',
  'EBILAEADXXX',
  'LSTS-Q',
  'LSTS-INV',
  'LSTS-PO',
  'LSTS-WCR',
  '30 Days Net from Invoice Date',
  'All workmanship is warranted for a period of twelve (12) months from the date of final handover.',
  'Please remit payment directly referencing the Invoice Number.',
  'AED',
  'YYYY-MM-DD',
  TRUE,
  TRUE
) ON CONFLICT (id) DO UPDATE SET
  legal_name = EXCLUDED.legal_name,
  trn = EXCLUDED.trn;

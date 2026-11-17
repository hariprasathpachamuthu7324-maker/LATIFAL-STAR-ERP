-- ============================================================
-- PREEDHAR TECHNICAL SERVICES — SUPABASE DATABASE SCHEMA
-- Run this ONCE in Supabase SQL Editor to create all tables
-- ============================================================

-- ── PROFILES (Team Members) ──────────────────────────────────
create table if not exists profiles (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null,
  email       text unique not null,
  phone       text,
  role        text not null default 'STAFF',
  department  text not null default 'Operations',
  job_title   text not null default 'Staff',
  is_active   boolean not null default true,
  avatar_url  text,
  last_login_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── CUSTOMERS ────────────────────────────────────────────────
create table if not exists customers (
  id                      uuid primary key default gen_random_uuid(),
  customer_code           text unique not null,
  company_name            text not null,
  contact_person          text not null,
  email                   text,
  phone                   text,
  alternate_phone         text,
  customer_type           text not null default 'CORPORATE',
  address                 text,
  city                    text,
  country                 text not null default 'UAE',
  tax_registration_number text,
  payment_terms           text,
  status                  text not null default 'ACTIVE',
  notes                   text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- ── QUOTATIONS ───────────────────────────────────────────────
create table if not exists quotations (
  id                   uuid primary key default gen_random_uuid(),
  quotation_number     text unique not null,
  customer_id          uuid references customers(id) on delete set null,
  customer_name        text not null,
  client_printed_name  text,
  attention            text,
  quotation_date       date not null,
  valid_until          date not null,
  subject              text not null,
  project_name         text not null,
  project_location     text,
  subtotal             numeric(15,2) not null default 0,
  discount             numeric(15,2) not null default 0,
  taxable_amount       numeric(15,2) not null default 0,
  vat_rate             numeric(5,2) not null default 5,
  vat_amount           numeric(15,2) not null default 0,
  grand_total          numeric(15,2) not null default 0,
  notes                text,
  terms_and_conditions text,
  status               text not null default 'DRAFT',
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create table if not exists quotation_items (
  id            uuid primary key default gen_random_uuid(),
  quotation_id  uuid not null references quotations(id) on delete cascade,
  description   text not null,
  quantity      numeric(10,2) not null default 1,
  unit          text not null default 'NOS',
  unit_price    numeric(15,2) not null default 0,
  total         numeric(15,2) not null default 0,
  sort_order    int not null default 0
);

-- ── INVOICES ─────────────────────────────────────────────────
create table if not exists invoices (
  id                   uuid primary key default gen_random_uuid(),
  invoice_number       text unique not null,
  customer_id          uuid references customers(id) on delete set null,
  customer_name        text not null,
  client_printed_name  text,
  attention            text,
  customer_trn         text,
  quotation_id         uuid references quotations(id) on delete set null,
  quotation_number     text,
  invoice_date         date not null,
  due_date             date not null,
  payment_terms        text not null,
  subject              text not null,
  project_name         text not null,
  project_location     text,
  subtotal             numeric(15,2) not null default 0,
  discount             numeric(15,2) not null default 0,
  taxable_amount       numeric(15,2) not null default 0,
  vat_rate             numeric(5,2) not null default 5,
  vat_amount           numeric(15,2) not null default 0,
  grand_total          numeric(15,2) not null default 0,
  amount_paid          numeric(15,2) not null default 0,
  outstanding_amount   numeric(15,2) not null default 0,
  notes                text,
  terms_and_conditions text,
  status               text not null default 'DRAFT',
  payment_status       text not null default 'UNPAID',
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create table if not exists invoice_items (
  id           uuid primary key default gen_random_uuid(),
  invoice_id   uuid not null references invoices(id) on delete cascade,
  description  text not null,
  quantity     numeric(10,2) not null default 1,
  unit         text not null default 'NOS',
  unit_price   numeric(15,2) not null default 0,
  total        numeric(15,2) not null default 0,
  sort_order   int not null default 0
);

-- ── PURCHASE ORDERS ──────────────────────────────────────────
create table if not exists purchase_orders (
  id                     uuid primary key default gen_random_uuid(),
  purchase_order_number  text unique not null,
  customer_id            uuid references customers(id) on delete set null,
  customer_name          text not null,
  client_printed_name    text,
  attention              text,
  customer_trn           text,
  quotation_id           uuid references quotations(id) on delete set null,
  quotation_number       text,
  invoice_id             uuid references invoices(id) on delete set null,
  invoice_number         text,
  po_date                date not null,
  expected_delivery_date date,
  subject                text not null,
  project_name           text not null,
  project_location       text,
  delivery_address       text,
  subtotal               numeric(15,2) not null default 0,
  discount               numeric(15,2) not null default 0,
  taxable_amount         numeric(15,2) not null default 0,
  vat_rate               numeric(5,2) not null default 5,
  vat_amount             numeric(15,2) not null default 0,
  grand_total            numeric(15,2) not null default 0,
  notes                  text,
  terms_and_conditions   text,
  status                 text not null default 'DRAFT',
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create table if not exists purchase_order_items (
  id                uuid primary key default gen_random_uuid(),
  purchase_order_id uuid not null references purchase_orders(id) on delete cascade,
  description       text not null,
  quantity          numeric(10,2) not null default 1,
  unit              text not null default 'NOS',
  unit_price        numeric(15,2) not null default 0,
  total             numeric(15,2) not null default 0,
  sort_order        int not null default 0
);

-- ── WORK COMPLETION REPORTS ──────────────────────────────────
create table if not exists work_completion_reports (
  id                               uuid primary key default gen_random_uuid(),
  report_number                    text unique not null,
  customer_id                      uuid references customers(id) on delete set null,
  customer_name                    text not null,
  client_printed_name              text,
  attention                        text,
  customer_trn                     text,
  quotation_id                     uuid references quotations(id) on delete set null,
  quotation_number                 text,
  purchase_order_id                uuid references purchase_orders(id) on delete set null,
  purchase_order_number            text,
  invoice_id                       uuid references invoices(id) on delete set null,
  invoice_number                   text,
  report_date                      date not null,
  work_start_date                  date,
  work_completion_date             date not null,
  subject                          text not null,
  project_name                     text not null,
  project_location                 text,
  work_description                 text,
  completion_percentage            numeric(5,2) not null default 100,
  observations                     text,
  materials_used                   text,
  engineer_in_charge               text not null,
  client_remarks                   text,
  acknowledgement_status           text not null default 'PENDING',
  client_rep_name                  text,
  client_rep_designation           text,
  client_rep_phone                 text,
  client_acknowledgement_date      date,
  status                           text not null default 'DRAFT',
  created_at                       timestamptz not null default now(),
  updated_at                       timestamptz not null default now()
);

create table if not exists work_completion_items (
  id                      uuid primary key default gen_random_uuid(),
  work_completion_report_id uuid not null references work_completion_reports(id) on delete cascade,
  description             text not null,
  quantity                numeric(10,2) not null default 1,
  unit                    text not null default 'NOS',
  unit_price              numeric(15,2) not null default 0,
  total                   numeric(15,2) not null default 0,
  status                  text not null default 'COMPLETED',
  sort_order              int not null default 0
);

create table if not exists wcr_photos (
  id                        uuid primary key default gen_random_uuid(),
  work_completion_report_id uuid not null references work_completion_reports(id) on delete cascade,
  storage_path              text not null,
  caption                   text,
  photo_type                text not null default 'BEFORE',
  created_at                timestamptz not null default now()
);

-- ── COMPANY SETTINGS ─────────────────────────────────────────
create table if not exists company_settings (
  id         uuid primary key default gen_random_uuid(),
  data       jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- ── ROW LEVEL SECURITY (allow authenticated users full access) ──
alter table profiles                enable row level security;
alter table customers               enable row level security;
alter table quotations              enable row level security;
alter table quotation_items         enable row level security;
alter table invoices                enable row level security;
alter table invoice_items           enable row level security;
alter table purchase_orders         enable row level security;
alter table purchase_order_items    enable row level security;
alter table work_completion_reports enable row level security;
alter table work_completion_items   enable row level security;
alter table wcr_photos              enable row level security;
alter table company_settings        enable row level security;

-- Allow all authenticated users full read/write on all tables
create policy "auth_all_profiles"                on profiles                for all to authenticated using (true) with check (true);
create policy "auth_all_customers"               on customers               for all to authenticated using (true) with check (true);
create policy "auth_all_quotations"              on quotations              for all to authenticated using (true) with check (true);
create policy "auth_all_quotation_items"         on quotation_items         for all to authenticated using (true) with check (true);
create policy "auth_all_invoices"                on invoices                for all to authenticated using (true) with check (true);
create policy "auth_all_invoice_items"           on invoice_items           for all to authenticated using (true) with check (true);
create policy "auth_all_purchase_orders"         on purchase_orders         for all to authenticated using (true) with check (true);
create policy "auth_all_purchase_order_items"    on purchase_order_items    for all to authenticated using (true) with check (true);
create policy "auth_all_wcr"                     on work_completion_reports for all to authenticated using (true) with check (true);
create policy "auth_all_wcr_items"               on work_completion_items   for all to authenticated using (true) with check (true);
create policy "auth_all_wcr_photos"              on wcr_photos              for all to authenticated using (true) with check (true);
create policy "auth_all_company_settings"        on company_settings        for all to authenticated using (true) with check (true);


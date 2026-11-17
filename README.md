# LATIFAL STAR TECHNICAL SERVICES — ENTERPRISE ERP

An enterprise-grade commercial operations, ERP, and field-service management platform built specifically for **LATIFAL STAR TECHNICAL SERVICES** (Dubai, United Arab Emirates).

---

## 🌟 Key Capabilities & Modules

- **Commercial Quotations (`LSTS-Q`)**: Full quotation workspace with multi-line item calculations, automated 5% UAE VAT, standard terms, exclusions, and official PDF generation matching official company standards.
- **Official Tax Invoices (`LSTS-INV`)**: UAE FTA-compliant commercial tax invoices with payment status tracking (`UNPAID`, `PARTIALLY_PAID`, `PAID`, `OVERDUE`), amount paid / balance due calculations, bank remittance details, and official PDF exports.
- **Purchase Orders (`LSTS-PO`)**: Procurement and vendor orders with expected delivery tracking, project site routing, supplier acknowledgment blocks, and dual signature PDF generation.
- **Work Completion Reports (`LSTS-WCR`)**: Engineering handover certificates with before/after technical observations, materials logs, photo attachments (Supabase Storage), and client acceptance sign-off.
- **Customer CRM & Master Data**: Complete customer directory with 15-digit UAE FTA TRN management, credit terms, and live entity search.
- **Team Management & RBAC**: Role-based access control (`ADMIN`, `MANAGER`, `STAFF`) with user profile state and Supabase Authentication.
- **Company Settings Singleton**: Single source of truth for corporate legal name, trade license (`1251018`), banking details, and document prefixes.
- **Official PDF Engine**: High-fidelity jsPDF engine embedding the official LATIFAL STAR logo, two-column shaded metadata grids, right-aligned currency formatting, dynamic amount-to-words in UAE Dirhams, and page pagination.

---

## 🛠 Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) with Turbopack
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS with enterprise color system (Navy `#0B1F33`, Corporate Blue `#2563EB`, Slate `#F5F7FA`)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security, SSR Auth, and Storage)
- **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF) & `jspdf-autotable`
- **Icons**: Lucide React

---

## 🚀 Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/) v20.x or higher
- [npm](https://www.npmjs.com/) or `pnpm`
- A Supabase project with database migrations applied

### 2. Installation

```bash
git clone <repository-url>
cd PREEDHAR
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env.local
```

Fill in your Supabase project credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-public-key
```

> [!IMPORTANT]
> Never commit `.env.local` or any service role keys to Git. Keep all sensitive values in `.env.local` (local development) or in Vercel Environment Variables (production).

### 4. Running Locally

```bash
# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏗 Build & Production Verification

```bash
# Type check the codebase
npx tsc --noEmit

# Create optimized production build
npm run build

# Start production server
npm run start
```

---

## 🗄 Database Schema & Migrations

Database definitions and seed scripts are located in `supabase/`:

- `supabase/migrations/20260919000001_initial_schema.sql`: Core tables (`profiles`, `customers`, `quotations`, `invoices`, `purchase_orders`, `work_completion_reports`, `company_settings`) and RLS policies.
- `supabase/migrations/20260919000002_photos_and_audit.sql`: WCR photo attachments and storage bucket policies.
- `supabase/seed.sql`: Clean production baseline containing official company settings and TRN configuration.

---

## ☁️ Vercel Deployment Guide

1. **Push to GitHub**: Ensure all changes are pushed to your private GitHub repository (`main` branch).
2. **Import into Vercel**:
   - Log in to [Vercel](https://vercel.com).
   - Click **Add New Project** $\rightarrow$ **Import Git Repository**.
   - Select your private `PREEDHAR-ERP` repository.
3. **Configure Environment Variables**:
   - In the Vercel project configuration, add:
     - `NEXT_PUBLIC_SUPABASE_URL`: Your production Supabase URL.
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your production Supabase Anon Key.
4. **Deploy**:
   - Framework preset: **Next.js**
   - Build command: `npm run build`
   - Output directory: `.next`
   - Click **Deploy**.

---

## 📄 License & Proprietary Notice

Copyright &copy; 2026 PREEDHAR TECHNICAL SERVICES CO. L.L.C. (Dubai, UAE). All rights reserved. Proprietary and confidential enterprise software.

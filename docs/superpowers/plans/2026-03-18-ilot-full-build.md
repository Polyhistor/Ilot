# Ilot Full Build Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete Ilot website — Next.js 15 App Router with Supabase backend, scroll-linked circular hero animation, ISR-rendered service pages, and WhatsApp CTA integration.

**Architecture:** Next.js 15 App Router with a repository pattern data layer over Supabase Postgres. All public pages are SSG or ISR (revalidate: 3600). The hero animation uses Framer Motion `useScroll`/`useTransform` inside a sticky 300vh container.

**Tech Stack:** Next.js 15, TypeScript (strict), Tailwind CSS v4, Framer Motion, Supabase JS v2, Lucide React, Vercel deployment.

---

## File Map

```
ilot-legal/
├── src/
│   ├── app/
│   │   ├── (marketing)/
│   │   │   ├── layout.tsx                     # Marketing layout (no auth)
│   │   │   ├── page.tsx                       # Homepage
│   │   │   ├── [category]/
│   │   │   │   ├── page.tsx                   # Pillar page /visa, /legal…
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx               # Service detail /visa/investor-kitas-2-years
│   │   │   ├── contact/page.tsx
│   │   │   ├── legal/page.tsx
│   │   │   ├── privacy/page.tsx
│   │   │   └── cookies/page.tsx
│   │   ├── sitemap.ts                         # Auto-generated sitemap.xml
│   │   ├── robots.ts                          # robots.txt
│   │   ├── layout.tsx                         # Root layout — fonts, metadata, globals
│   │   └── globals.css
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                      # Browser Supabase client (singleton)
│   │   │   └── server.ts                      # Server-side Supabase client
│   │   └── db/
│   │       ├── types.ts                       # Category, SubCategory, Service interfaces
│   │       ├── categories.ts                  # getCategories(), getCategoryBySlug()
│   │       └── services.ts                    # getServiceBySlug(), getRelatedServices(), getAllServiceSlugs()
│   └── components/
│       ├── layout/
│       │   ├── Navbar.tsx                     # Sticky nav — wordmark + links + WA ghost button
│       │   └── Footer.tsx                     # Dark footer — columns + legal links
│       ├── home/
│       │   ├── HeroCircle.tsx                 # Scroll-linked fan-out — sticky 300vh container
│       │   ├── PartnerBar.tsx                 # CSS marquee — partner logos
│       │   ├── AboutSection.tsx               # 2-col about + stats
│       │   ├── WhyUsBento.tsx                 # Asymmetric bento grid
│       │   ├── ProcessSteps.tsx               # 4-step timeline
│       │   ├── TestimonialsSection.tsx        # Card carousel
│       │   └── CTABanner.tsx                  # Gold full-width CTA
│       ├── services/
│       │   ├── ServiceCard.tsx                # Card used on pillar page
│       │   ├── CategorySidebar.tsx            # Sticky sidebar for pillar page
│       │   ├── ServiceDetail.tsx              # Detail layout for service page
│       │   └── RelatedServices.tsx            # Same sub-category, max 4
│       └── ui/
│           ├── WhatsAppCTA.tsx                # wa.me link builder — primary + ghost variants
│           ├── WhatsAppFloat.tsx              # Fixed bottom-right WA button
│           └── AnimatedSection.tsx            # Framer Motion fade-in on scroll wrapper
├── public/
│   └── images/categories/                     # category-slug.jpg (7 photos)
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── seed.sql
├── .env.local                                 # Local env vars (gitignored)
├── next.config.ts
└── tailwind.config.ts
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `next.config.ts`
- Create: `tailwind.config.ts`
- Create: `src/app/globals.css`
- Create: `src/app/layout.tsx`
- Create: `.env.local`

- [ ] **Step 1: Bootstrap Next.js project**

```bash
cd d:/ilot-legal
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-turbopack
```

When prompted, accept all defaults. This creates the scaffold in the current directory.

- [ ] **Step 2: Install dependencies**

```bash
npm install framer-motion @supabase/supabase-js lucide-react server-only
npm install -D @types/node
```

- [ ] **Step 3: Write `next.config.ts`**

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
}

export default nextConfig
```

- [ ] **Step 4: Write `tailwind.config.ts`**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF',
        surface: '#F4F4F0',
        foreground: '#0B0B1A',
        accent: '#F5B21A',
        muted: '#64748b',
        dark: '#0a0a14',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '2rem',
      },
      maxWidth: {
        site: '1800px',
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 5: Write `src/app/globals.css`**

```css
@import "tailwindcss";

@layer base {
  html {
    scroll-behavior: smooth;
  }
  body {
    @apply bg-background text-foreground font-sans;
  }
}

@layer utilities {
  .section-padding {
    @apply py-24 px-6 md:px-12;
  }
  .container-site {
    @apply max-w-site mx-auto w-full;
  }
}

/* Partner marquee */
@keyframes marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.animate-marquee {
  animation: marquee 30s linear infinite;
}
```

- [ ] **Step 6: Write root `src/app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { WhatsAppFloat } from '@/components/ui/WhatsAppFloat'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: {
    default: 'Ilot — Clear Legal Support. Confident Decisions.',
    template: '%s — Ilot',
  },
  description:
    'Premium legal, visa, and corporate structuring solutions for global investors and expatriates in Indonesia.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ilot.id'),
  openGraph: {
    siteName: 'Ilot',
    locale: 'en_US',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        {children}
        <WhatsAppFloat />
      </body>
    </html>
  )
}
```

- [ ] **Step 7: Create `.env.local`**

```env
NEXT_PUBLIC_WA_NUMBER=62812XXXXXXX
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_URL=https://YOURPROJECT.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Replace placeholders with real values from your Supabase project dashboard.

- [ ] **Step 8: Verify build compiles**

```bash
npm run build
```

Expected: Build succeeds (may show missing page warnings — fine for now).

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js 15 project with Tailwind, Framer Motion, Supabase"
```

---

## Task 2: Supabase Schema & Seed

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`
- Create: `supabase/seed.sql`

- [ ] **Step 1: Create Supabase project**

Go to https://supabase.com/dashboard → New project. Note the Project URL and anon/service-role keys. Update `.env.local`.

- [ ] **Step 2: Write migration `supabase/migrations/001_initial_schema.sql`**

```sql
-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ============================================================
-- categories
-- ============================================================
create table public.categories (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  name         text not null,
  tagline      text,
  icon_name    text,
  image_url    text,
  color_accent text,
  sort_order   smallint not null default 0,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

-- ============================================================
-- sub_categories
-- ============================================================
create table public.sub_categories (
  id          uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  slug        text not null,
  name        text not null,
  sort_order  smallint not null default 0,
  is_active   boolean not null default true,
  unique (category_id, slug)
);

-- ============================================================
-- services
-- ============================================================
create table public.services (
  id               uuid primary key default gen_random_uuid(),
  category_id      uuid not null references public.categories(id),
  sub_category_id  uuid references public.sub_categories(id) on delete set null,
  slug             text unique not null,
  name             text not null,
  description      text,
  target_client    text,
  key_deliverables text,
  estimated_timeline text,
  real_time_work   text,
  whatsapp_message text,
  meta_title       text,
  meta_description text,
  sort_order       smallint not null default 0,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger services_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

-- ============================================================
-- Row Level Security — public read on active rows only
-- ============================================================
alter table public.categories enable row level security;
alter table public.sub_categories enable row level security;
alter table public.services enable row level security;

create policy "public read categories"
  on public.categories for select
  using (is_active = true);

create policy "public read sub_categories"
  on public.sub_categories for select
  using (is_active = true);

create policy "public read services"
  on public.services for select
  using (is_active = true);
```

- [ ] **Step 3: Run migration in Supabase**

In Supabase dashboard → SQL Editor → paste contents of `001_initial_schema.sql` → Run.

Verify: all 3 tables appear in Table Editor.

- [ ] **Step 4: Write `supabase/seed.sql`**

This seeds the 7 categories and the Visa + Legal sub-categories and services from `docs/seed-data/services.json`.

```sql
-- ============================================================
-- Categories (7 pillars)
-- ============================================================
insert into public.categories (slug, name, tagline, icon_name, sort_order) values
  ('visa',          'Visa & Immigration',   'Your gateway to legal residency in Indonesia.',           'Plane',       0),
  ('legal',         'Legal & Contracts',    'Expert legal frameworks for confident business.',         'Scale',       1),
  ('company-setup', 'Company Setup',        'Establish your entity with zero friction.',               'Building2',   2),
  ('insurance',     'Insurance',            'Comprehensive coverage for expats and businesses.',       'Shield',      3),
  ('property',      'Property Advisory',    'Navigate Indonesian property law with confidence.',       'Home',        4),
  ('hr-payroll',    'HR & Payroll',         'Compliant workforce management from day one.',            'Users',       5),
  ('accounting-tax','Accounting & Tax',     'Full financial compliance, zero surprises.',              'Calculator',  6)
on conflict (slug) do nothing;

-- ============================================================
-- Sub-categories — Visa
-- ============================================================
with visa_cat as (select id from public.categories where slug = 'visa')
insert into public.sub_categories (category_id, slug, name, sort_order)
select visa_cat.id, s.slug, s.name, s.sort_order from visa_cat,
(values
  ('investor-kitas',             'Investor KITAS',                  0),
  ('working-remote-kitas',       'Working & Remote KITAS',          1),
  ('retirement-kitas',           'Retirement KITAS',                2),
  ('visit-visas',                'Visit Visas',                     3),
  ('permits-travel',             'Permits & Travel',                4),
  ('administrative-changes',     'Administrative Changes',          5),
  ('tax-registration',           'Tax Registration',                6),
  ('translation',                'Translation',                     7),
  ('reporting',                  'Reporting',                       8),
  ('closing-dissolution',        'Closing & Dissolution PMA',       9),
  ('investor-itas-offshore',     'Investor ITAS Offshore',          10),
  ('investor-itas-onshore',      'Investor ITAS Onshore',           11),
  ('worker-itas-offshore',       'Worker ITAS Offshore',            12),
  ('worker-itas-onshore',        'Worker ITAS Onshore',             13),
  ('freelance-itas',             'Freelance ITAS',                  14),
  ('family-itas-offshore',       'Family ITAS Offshore',            15),
  ('family-itas-onshore',        'Family ITAS Onshore',             16),
  ('family-itas-extension',      'Family ITAS Extension',           17),
  ('retirement-itas-offshore',   'Retirement ITAS Offshore',        18),
  ('retirement-itas-onshore',    'Retirement ITAS Onshore',         19),
  ('kitap',                      'KITAP Permanent Stay Permit',     20),
  ('single-entry-visa',          'Single Entry Visa',               21),
  ('golden-visa',                'Golden Visa',                     22),
  ('multiple-entry-visa',        'Multiple Entry Visa',             23),
  ('pre-investment-visa',        'Pre-Investment Visa',             24),
  ('second-home-visa',           'Second Home Visa',                25),
  ('remote-worker',              'Remote Worker',                   26),
  ('address-mutations',          'Address Mutations in ITAS',       27),
  ('affidavit',                  'Affidavit',                       28),
  ('apostille',                  'Apostille Documents',             29),
  ('brand-registration',         'Brand Registration',              30),
  ('domicile-letter',            'Domicile Letter',                 31),
  ('e-passport',                 'E-Passport',                      32),
  ('erp',                        'ERP',                             33),
  ('passport-mutation',          'Passport Mutation',               34),
  ('skck',                       'SKCK / Police Letter',            35),
  ('sktt',                       'SKTT',                            36)
) as s(slug, name, sort_order)
on conflict (category_id, slug) do nothing;

-- ============================================================
-- Sub-categories — Legal
-- ============================================================
with legal_cat as (select id from public.categories where slug = 'legal')
insert into public.sub_categories (category_id, slug, name, sort_order)
select legal_cat.id, s.slug, s.name, s.sort_order from legal_cat,
(values
  ('company-set-up',          'Company Set-Up',              0),
  ('compliance',              'Compliance',                  1),
  ('changes-restructuring',   'Changes & Restructuring',     2),
  ('agreements',              'Agreements',                  3),
  ('employment-contracts',    'Employment Contracts',        4),
  ('contract-notary',         'Contract & Notary',           5),
  ('management-licensing',    'Management & Licensing',      6),
  ('property-checks',         'Property Information & Checks', 7),
  ('yayasan',                 'Yayasan',                     8),
  ('rups',                    'RUPS',                        9),
  ('jbs',                     'JBS Per Transaction',         10)
) as s(slug, name, sort_order)
on conflict (category_id, slug) do nothing;

-- ============================================================
-- Services — Visa > Investor KITAS
-- ============================================================
with sc as (
  select s.id as sub_id, c.id as cat_id
  from public.sub_categories s
  join public.categories c on c.id = s.category_id
  where c.slug = 'visa' and s.slug = 'investor-kitas'
)
insert into public.services (category_id, sub_category_id, slug, name, description, target_client, key_deliverables, estimated_timeline, sort_order)
select sc.cat_id, sc.sub_id, s.slug, s.name, s.description, s.target_client, s.key_deliverables, s.estimated_timeline, s.sort_order
from sc,
(values
  ('investor-kitas-2-years', 'Investor KITAS 2 Years',
   'Full processing for a 2-year Investor Stay Permit (KITAS), allowing foreign investors to reside and manage investments.',
   'Foreign Investors', '2-Year Investor KITAS, MERP', '6–10 Weeks', 0),
  ('investor-kitas-2-years-extension', 'Investor KITAS 2 Years (Extension)',
   'Support for extending an existing 2-year Investor KITAS.',
   'Existing Investor KITAS Holders', 'Extended 2-Year Investor KITAS', '4–8 Weeks', 1),
  ('investor-kitas-1-year-extension', 'Investor KITAS 1 Year (Extension)',
   'Support for extending an existing 1-year Investor KITAS.',
   'Existing Investor KITAS Holders', 'Extended 1-Year Investor KITAS', '4–8 Weeks', 2)
) as s(slug, name, description, target_client, key_deliverables, estimated_timeline, sort_order)
on conflict (slug) do nothing;

-- ============================================================
-- Services — Visa > Working & Remote KITAS
-- ============================================================
with sc as (
  select s.id as sub_id, c.id as cat_id
  from public.sub_categories s
  join public.categories c on c.id = s.category_id
  where c.slug = 'visa' and s.slug = 'working-remote-kitas'
)
insert into public.services (category_id, sub_category_id, slug, name, description, target_client, key_deliverables, estimated_timeline, sort_order)
select sc.cat_id, sc.sub_id, s.slug, s.name, s.description, s.target_client, s.key_deliverables, s.estimated_timeline, s.sort_order
from sc,
(values
  ('working-kitas-6-month', 'Working KITAS 6 Month',
   'Processing for a 6-month Working Stay Permit.',
   'Foreign Employees', '6-Month Working KITAS, IMTA', '6–10 Weeks', 0),
  ('working-kitas-extension-1-year', 'Working KITAS Extension 1 Year',
   'Support for extending a 1-year Working Stay Permit.',
   'Existing Working KITAS Holders', 'Extended 1-Year Working KITAS', '4–8 Weeks', 1),
  ('working-kitas-extension-2-years', 'Working KITAS Extension 2 Years',
   'Support for extending a 2-year Working Stay Permit.',
   'Existing Working KITAS Holders', 'Extended 2-Year Working KITAS', '4–8 Weeks', 2),
  ('digital-nomad-kitas-1-year', 'Remote Worker KITAS — Digital Nomad (E33G) 1 Year',
   'Assistance for obtaining a 1-year Digital Nomad Stay Permit for eligible remote workers.',
   'Digital Nomads', '1-Year Digital Nomad KITAS', '6–10 Weeks', 3)
) as s(slug, name, description, target_client, key_deliverables, estimated_timeline, sort_order)
on conflict (slug) do nothing;

-- ============================================================
-- Services — Visa > Retirement KITAS
-- ============================================================
with sc as (
  select s.id as sub_id, c.id as cat_id
  from public.sub_categories s
  join public.categories c on c.id = s.category_id
  where c.slug = 'visa' and s.slug = 'retirement-kitas'
)
insert into public.services (category_id, sub_category_id, slug, name, description, target_client, key_deliverables, estimated_timeline, sort_order)
select sc.cat_id, sc.sub_id, s.slug, s.name, s.description, s.target_client, s.key_deliverables, s.estimated_timeline, s.sort_order
from sc,
(values
  ('retirement-kitas', 'Retirement KITAS',
   'Processing for a Retirement Stay Permit for eligible foreign nationals.',
   'Foreign Retirees', 'Retirement KITAS', '6–10 Weeks', 0),
  ('retirement-kitas-extension', 'Retirement KITAS Extension',
   'Support for extending an existing Retirement KITAS.',
   'Existing Retirement KITAS Holders', 'Extended Retirement KITAS', '4–8 Weeks', 1)
) as s(slug, name, description, target_client, key_deliverables, estimated_timeline, sort_order)
on conflict (slug) do nothing;

-- ============================================================
-- Services — Visa > Visit Visas
-- ============================================================
with sc as (
  select s.id as sub_id, c.id as cat_id
  from public.sub_categories s
  join public.categories c on c.id = s.category_id
  where c.slug = 'visa' and s.slug = 'visit-visas'
)
insert into public.services (category_id, sub_category_id, slug, name, description, target_client, key_deliverables, estimated_timeline, sort_order)
select sc.cat_id, sc.sub_id, s.slug, s.name, s.description, s.target_client, s.key_deliverables, s.estimated_timeline, s.sort_order
from sc,
(values
  ('visit-visa-single-60-days', 'Visit Visa Single Entry 60 Days (C1)',
   'Application processing for a single-entry visit visa valid for 60 days.',
   'Tourists, Short-term Visits', '60-Day Single Entry Visa', '2–4 Weeks', 0),
  ('visit-visa-single-60-days-extension', 'Visit Visa Single Entry 60 Days (Extension)',
   'Extension services for a 60-day single-entry visit visa.',
   'Existing 60-Day Visa Holders', 'Extended Visit Visa', '1–2 Weeks', 1),
  ('visit-visa-single-180-days', 'Visit Visa Single Entry 180 Days (C12)',
   'Application processing for a single-entry visit visa valid for 180 days.',
   'Longer-term Visitors', '180-Day Single Entry Visa', '2–4 Weeks', 2),
  ('visit-visa-180-days-extension', 'Visit Visa Single/Multiple Entry 180 Days (Extension)',
   'Extension services for 180-day single or multiple-entry visit visas.',
   'Existing 180-Day Visa Holders', 'Extended Visit Visa', '1–2 Weeks', 3),
  ('multiple-entry-visa-1-year', 'Multiple Entry Visit Visa (1 Year) D1 & D2',
   'Processing for a multiple-entry visit visa valid for 1 year.',
   'Frequent Visitors', '1-Year Multiple Entry Visa', '3–5 Weeks', 4),
  ('multiple-entry-visa-2-years', 'Multiple Entry Visit Visa (2 Years) D1 & D2',
   'Processing for a multiple-entry visit visa valid for 2 years.',
   'Frequent Visitors', '2-Year Multiple Entry Visa', '3–5 Weeks', 5),
  ('e-voa', 'Visa On Arrival E-VOA',
   'Assistance with the electronic Visa On Arrival application.',
   'Eligible Nationalities', 'Approved E-VOA', '1–3 Days', 6),
  ('e-voa-extension', 'Visa On Arrival E-VOA Extension',
   'Extension services for an E-VOA.',
   'E-VOA Holders', 'Extended E-VOA', '1–2 Weeks', 7),
  ('e-voa-extension-express', 'Visa On Arrival E-VOA Extension Express',
   'Expedited extension services for an E-VOA.',
   'E-VOA Holders (Urgent)', 'Expedited Extended E-VOA', '3–5 Days', 8),
  ('visitor-visa-subclass-600', 'Visitor Visa (Subclass 600)',
   'Assistance for Indonesian citizens applying for the Australian Visitor Visa (Subclass 600).',
   'Indonesian Travelers', 'Australian Visa Approval', '4–12 Weeks', 9),
  ('internship-visa-180-days', 'Internship Visa 180 Days (C22)',
   'Application processing for a 180-day internship visa.',
   'Foreign Interns', '180-Day Internship Visa', '4–8 Weeks', 10),
  ('entertainment-kitas', 'Entertainment KITAS',
   'Processing for a Stay Permit for foreign nationals in the entertainment industry.',
   'Entertainment Professionals', 'Entertainment KITAS', '6–10 Weeks', 11)
) as s(slug, name, description, target_client, key_deliverables, estimated_timeline, sort_order)
on conflict (slug) do nothing;

-- ============================================================
-- Services — Visa > Permits & Travel
-- ============================================================
with sc as (
  select s.id as sub_id, c.id as cat_id
  from public.sub_categories s
  join public.categories c on c.id = s.category_id
  where c.slug = 'visa' and s.slug = 'permits-travel'
)
insert into public.services (category_id, sub_category_id, slug, name, description, target_client, key_deliverables, estimated_timeline, sort_order)
select sc.cat_id, sc.sub_id, s.slug, s.name, s.description, s.target_client, s.key_deliverables, s.estimated_timeline, s.sort_order
from sc,
(values
  ('mrep-1-year', 'Multiple Re-Entry Permit (MREP) 1 Year',
   'Application for a 1-year MREP allowing multiple exits/entries for KITAS holders.',
   'KITAS Holders', '1-Year MREP', '1–2 Weeks', 0),
  ('mrep-2-years', 'Multiple Re-Entry Permit (MREP) 2 Years',
   'Application for a 2-year MREP.',
   'KITAS Holders', '2-Year MREP', '1–2 Weeks', 1),
  ('mrep-unlimited', 'Multiple Re-Entry Permit (MREP) Unlimited',
   'Application for an unlimited MREP.',
   'Long-term KITAS Holders', 'Unlimited MREP', '1–2 Weeks', 2),
  ('exit-permit-only', 'Exit Permit Only (E.P.O)',
   'Processing for an Exit Permit Only, required when permanently leaving Indonesia.',
   'KITAS/Visa Holders', 'EPO Document', '3–7 Days', 3),
  ('bridging-visa', 'Bridging Visa',
   'Temporary visa status while awaiting a new visa or during status transition.',
   'Special Circumstances', 'Temporary Visa Status', 'Varies', 4)
) as s(slug, name, description, target_client, key_deliverables, estimated_timeline, sort_order)
on conflict (slug) do nothing;

-- ============================================================
-- Services — Visa > Golden Visa
-- ============================================================
with sc as (
  select s.id as sub_id, c.id as cat_id
  from public.sub_categories s
  join public.categories c on c.id = s.category_id
  where c.slug = 'visa' and s.slug = 'golden-visa'
)
insert into public.services (category_id, sub_category_id, slug, name, sort_order)
select sc.cat_id, sc.sub_id, s.slug, s.name, s.sort_order
from sc,
(values
  ('golden-visa-offshore-5-years', 'Golden Visa Offshore 5 Years', 0),
  ('golden-visa-onshore-5-years', 'Golden Visa Onshore 5 Years', 1),
  ('golden-visa-extension', 'Golden Visa Extension', 2)
) as s(slug, name, sort_order)
on conflict (slug) do nothing;

-- ============================================================
-- Services — Visa > Second Home Visa
-- ============================================================
with sc as (
  select s.id as sub_id, c.id as cat_id
  from public.sub_categories s
  join public.categories c on c.id = s.category_id
  where c.slug = 'visa' and s.slug = 'second-home-visa'
)
insert into public.services (category_id, sub_category_id, slug, name, sort_order)
select sc.cat_id, sc.sub_id, s.slug, s.name, s.sort_order
from sc,
(values
  ('second-home-visa-offshore-5-years', 'Second Home Visa Offshore 5 Years', 0),
  ('second-home-visa-onshore-5-years', 'Second Home Visa Onshore 5 Years', 1),
  ('second-home-visa-extension', 'Second Home Visa Extension', 2)
) as s(slug, name, sort_order)
on conflict (slug) do nothing;

-- ============================================================
-- Services — Visa > KITAP
-- ============================================================
with sc as (
  select s.id as sub_id, c.id as cat_id
  from public.sub_categories s
  join public.categories c on c.id = s.category_id
  where c.slug = 'visa' and s.slug = 'kitap'
)
insert into public.services (category_id, sub_category_id, slug, name, sort_order)
select sc.cat_id, sc.sub_id, s.slug, s.name, s.sort_order
from sc,
(values
  ('investor-kitap-5-years', 'Investor KITAP 5 Years', 0),
  ('family-kitap-5-years', 'Family KITAP 5 Years', 1),
  ('retirement-kitap-5-years', 'Retirement KITAP 5 Years', 2)
) as s(slug, name, sort_order)
on conflict (slug) do nothing;

-- ============================================================
-- Services — Legal > Company Set-Up
-- ============================================================
with sc as (
  select s.id as sub_id, c.id as cat_id
  from public.sub_categories s
  join public.categories c on c.id = s.category_id
  where c.slug = 'legal' and s.slug = 'company-set-up'
)
insert into public.services (category_id, sub_category_id, slug, name, description, target_client, key_deliverables, estimated_timeline, sort_order)
select sc.cat_id, sc.sub_id, s.slug, s.name, s.description, s.target_client, s.key_deliverables, s.estimated_timeline, s.sort_order
from sc,
(values
  ('pt-local-set-up', 'PT Local — Set Up',
   'Comprehensive assistance for establishing a local Limited Liability Company (PT), including all legal and administrative requirements.',
   'Local Entrepreneurs', 'Notarial Deed, NIB, Business Licenses', '4–8 Weeks', 0),
  ('pt-local-hospitality-set-up', 'PT Local — Hospitality Set Up',
   'Specialized support for establishing a local PT for the hospitality sector (hotels, villas).',
   'Hospitality Investors', 'Notarial Deed, NIB, Hospitality Licenses', '6–12 Weeks', 1),
  ('pma-set-up', 'PMA — Set Up',
   'Full-service support for establishing a Foreign Capital Investment Company (PMA).',
   'Foreign Investors', 'Notarial Deed, BKPM Approval, NIB, Business Licenses', '8–16 Weeks', 2),
  ('cv-commanditaire-vennootschap', 'CV (Commanditaire Vennootschap)',
   'Assistance with establishing a limited partnership, including registration and legal documentation.',
   'Small Business Owners', 'Deed of Establishment, Registration', '3–6 Weeks', 3),
  ('pt-perorangan', 'PT Perorangan',
   'Support for establishing a Single-Person Limited Liability Company for individual entrepreneurs.',
   'Individual Entrepreneurs', 'Deed of Establishment, NIB', '2–4 Weeks', 4),
  ('nib-oss-process', 'NIB & OSS Process',
   'Guidance through the Online Single Submission (OSS) system to obtain a Business Identification Number (NIB).',
   'All Businesses', 'NIB, Standard Business Licenses', '1–3 Weeks', 5),
  ('oss-username-password', 'OSS Username & Password',
   'Support for obtaining or recovering OSS system credentials.',
   'All Businesses', 'OSS Account Access', '1–3 Days', 6)
) as s(slug, name, description, target_client, key_deliverables, estimated_timeline, sort_order)
on conflict (slug) do nothing;

-- ============================================================
-- Services — Legal > Compliance
-- ============================================================
with sc as (
  select s.id as sub_id, c.id as cat_id
  from public.sub_categories s
  join public.categories c on c.id = s.category_id
  where c.slug = 'legal' and s.slug = 'compliance'
)
insert into public.services (category_id, sub_category_id, slug, name, description, target_client, key_deliverables, estimated_timeline, sort_order)
select sc.cat_id, sc.sub_id, s.slug, s.name, s.description, s.target_client, s.key_deliverables, s.estimated_timeline, s.sort_order
from sc,
(values
  ('company-legal-documents-review', 'Company Legal Documents Review',
   'Thorough review of a company''s legal documents to ensure compliance and identify risks.',
   'All Businesses', 'Legal Review Report, Recommendations', '1–2 Weeks', 0),
  ('document-review-by-lawyer', 'Document Review By Lawyer',
   'Review of legal documents by a qualified lawyer with professional legal opinion.',
   'Individuals/Businesses', 'Legal Opinion/Advice', '3–7 Days', 1)
) as s(slug, name, description, target_client, key_deliverables, estimated_timeline, sort_order)
on conflict (slug) do nothing;

-- ============================================================
-- Services — Legal > Agreements
-- ============================================================
with sc as (
  select s.id as sub_id, c.id as cat_id
  from public.sub_categories s
  join public.categories c on c.id = s.category_id
  where c.slug = 'legal' and s.slug = 'agreements'
)
insert into public.services (category_id, sub_category_id, slug, name, description, target_client, key_deliverables, estimated_timeline, sort_order)
select sc.cat_id, sc.sub_id, s.slug, s.name, s.description, s.target_client, s.key_deliverables, s.estimated_timeline, s.sort_order
from sc,
(values
  ('prenuptial-postnuptial-agreement', 'Prenuptial & Postnuptial Agreement',
   'Drafting and legal processing of prenuptial or postnuptial agreements regarding asset division.',
   'Couples', 'Notarized Agreement', '2–4 Weeks', 0),
  ('shareholder-agreement', 'Shareholder Agreement',
   'Drafting of an agreement between shareholders outlining rights, obligations, and company management.',
   'Shareholders', 'Shareholder Agreement', '1–3 Weeks', 1)
) as s(slug, name, description, target_client, key_deliverables, estimated_timeline, sort_order)
on conflict (slug) do nothing;

-- ============================================================
-- Services — Legal > Contract & Notary
-- ============================================================
with sc as (
  select s.id as sub_id, c.id as cat_id
  from public.sub_categories s
  join public.categories c on c.id = s.category_id
  where c.slug = 'legal' and s.slug = 'contract-notary'
)
insert into public.services (category_id, sub_category_id, slug, name, description, target_client, key_deliverables, estimated_timeline, sort_order)
select sc.cat_id, sc.sub_id, s.slug, s.name, s.description, s.target_client, s.key_deliverables, s.estimated_timeline, s.sort_order
from sc,
(values
  ('land-building-rental-waarmerking', 'Land/Building Rental Contract With Waarmerking',
   'Drafting of land or building rental contracts with official Waarmerking by a notary.',
   'Landlords/Tenants', 'Waarmerking Contract', '3–7 Days', 0),
  ('notary-verification-lease-contract', 'Notary Verification Lease Contract',
   'Notarial verification of an existing lease contract confirming authenticity of signatures and dates.',
   'Landlords/Tenants', 'Verified Lease Contract', '1–3 Days', 1),
  ('waarmerking', 'Waarmerking',
   'Notarial service to authenticate signatures and the date of a private document.',
   'Individuals/Businesses', 'Waarmerking Document', '1–3 Days', 2),
  ('notary-property-land-leasing', 'Notary For Property/Land Contract Leasing',
   'Services of a notary for drafting and authenticating property or land lease contracts.',
   'Landlords/Tenants', 'Notarized Lease Contract', '3–7 Days', 3)
) as s(slug, name, description, target_client, key_deliverables, estimated_timeline, sort_order)
on conflict (slug) do nothing;

-- ============================================================
-- Services — Legal > Property Information & Checks
-- ============================================================
with sc as (
  select s.id as sub_id, c.id as cat_id
  from public.sub_categories s
  join public.categories c on c.id = s.category_id
  where c.slug = 'legal' and s.slug = 'property-checks'
)
insert into public.services (category_id, sub_category_id, slug, name, description, target_client, key_deliverables, estimated_timeline, sort_order)
select sc.cat_id, sc.sub_id, s.slug, s.name, s.description, s.target_client, s.key_deliverables, s.estimated_timeline, s.sort_order
from sc,
(values
  ('land-due-diligence', 'Land Due Diligence',
   'Comprehensive investigation and verification of land ownership, legal status, zoning, and potential risks.',
   'Property Buyers', 'Due Diligence Report', '1–3 Weeks', 0),
  ('itr-informasi-tata-ruang', 'ITR (Informasi Tata Ruang) Official',
   'Official retrieval of Spatial Planning Information detailing land use regulations and zoning.',
   'Property Buyers', 'ITR Document', '1–2 Weeks', 1)
) as s(slug, name, description, target_client, key_deliverables, estimated_timeline, sort_order)
on conflict (slug) do nothing;

-- ============================================================
-- Services — Visa > Administrative Changes
-- ============================================================
with sc as (
  select s.id as sub_id, c.id as cat_id
  from public.sub_categories s join public.categories c on c.id = s.category_id
  where c.slug = 'visa' and s.slug = 'administrative-changes'
)
insert into public.services (category_id, sub_category_id, slug, name, description, target_client, key_deliverables, estimated_timeline, sort_order)
select sc.cat_id, sc.sub_id, s.slug, s.name, s.description, s.target_client, s.key_deliverables, s.estimated_timeline, s.sort_order
from sc, (values
  ('changing-kitas-address', 'Changing KITAS Address',
   'Assistance with updating the registered address on a KITAS.',
   'KITAS Holders', 'Updated KITAS Details', '1–2 Weeks', 0)
) as s(slug, name, description, target_client, key_deliverables, estimated_timeline, sort_order)
on conflict (slug) do nothing;

-- ============================================================
-- Services — Visa > Tax Registration
-- ============================================================
with sc as (
  select s.id as sub_id, c.id as cat_id
  from public.sub_categories s join public.categories c on c.id = s.category_id
  where c.slug = 'visa' and s.slug = 'tax-registration'
)
insert into public.services (category_id, sub_category_id, slug, name, description, target_client, key_deliverables, estimated_timeline, sort_order)
select sc.cat_id, sc.sub_id, s.slug, s.name, s.description, s.target_client, s.key_deliverables, s.estimated_timeline, s.sort_order
from sc, (values
  ('npwp-company', 'NPWP (Company)',
   'Assistance with obtaining a Taxpayer Identification Number (NPWP) for a company.',
   'All Businesses', 'Company NPWP Certificate', '1–2 Weeks', 0),
  ('npwpd-regional', 'NPWPD (Regional)',
   'Support for obtaining a Regional Taxpayer Identification Number.',
   'Businesses (Regional Tax)', 'Regional Tax ID', '1–3 Weeks', 1),
  ('npwpd-abt-water-wells', 'NPWPD Abt (Underground Water Wells)',
   'Specialized assistance for a Regional Tax ID for underground water well usage.',
   'Businesses (Water Usage)', 'Regional Tax ID (Water)', '2–4 Weeks', 2),
  ('npwp-personal', 'NPWP (Personal)',
   'Assistance for foreign individuals to obtain an Indonesian Taxpayer Identification Number.',
   'Foreign Individuals', 'Personal NPWP Certificate', '1–2 Weeks', 3)
) as s(slug, name, description, target_client, key_deliverables, estimated_timeline, sort_order)
on conflict (slug) do nothing;

-- ============================================================
-- Services — Visa > Translation
-- ============================================================
with sc as (
  select s.id as sub_id, c.id as cat_id
  from public.sub_categories s join public.categories c on c.id = s.category_id
  where c.slug = 'visa' and s.slug = 'translation'
)
insert into public.services (category_id, sub_category_id, slug, name, description, target_client, key_deliverables, estimated_timeline, sort_order)
select sc.cat_id, sc.sub_id, s.slug, s.name, s.description, s.target_client, s.key_deliverables, s.estimated_timeline, s.sort_order
from sc, (values
  ('sworn-translation', 'Sworn Translation',
   'Official translation of documents by a sworn and certified translator.',
   'Individuals/Businesses', 'Certified Translated Document', '3–7 Days', 0)
) as s(slug, name, description, target_client, key_deliverables, estimated_timeline, sort_order)
on conflict (slug) do nothing;

-- ============================================================
-- Services — Visa > Reporting
-- ============================================================
with sc as (
  select s.id as sub_id, c.id as cat_id
  from public.sub_categories s join public.categories c on c.id = s.category_id
  where c.slug = 'visa' and s.slug = 'reporting'
)
insert into public.services (category_id, sub_category_id, slug, name, description, target_client, key_deliverables, estimated_timeline, sort_order)
select sc.cat_id, sc.sub_id, s.slug, s.name, s.description, s.target_client, s.key_deliverables, s.estimated_timeline, s.sort_order
from sc, (values
  ('bkpm-reports-lkpm', 'BKPM Reports (LKPM)',
   'Preparation and submission of Capital Investment Activity Reports (LKPM) to BKPM.',
   'PMA Companies', 'Timely LKPM Submission', 'Per Report Cycle', 0)
) as s(slug, name, description, target_client, key_deliverables, estimated_timeline, sort_order)
on conflict (slug) do nothing;

-- ============================================================
-- Services — Visa > Closing & Dissolution PMA
-- ============================================================
with sc as (
  select s.id as sub_id, c.id as cat_id
  from public.sub_categories s join public.categories c on c.id = s.category_id
  where c.slug = 'visa' and s.slug = 'closing-dissolution'
)
insert into public.services (category_id, sub_category_id, slug, name, description, target_client, key_deliverables, estimated_timeline, sort_order)
select sc.cat_id, sc.sub_id, s.slug, s.name, s.description, s.target_client, s.key_deliverables, s.estimated_timeline, s.sort_order
from sc, (values
  ('closing-local-company', 'Closing Local Company / PT, CV, Firma',
   'Comprehensive support for the legal dissolution and closure of local companies.',
   'Local Companies', 'Dissolution Deed, Tax Clearance, Deregistration', '3–6 Months', 0),
  ('closing-pma', 'Closing PMA',
   'Expert guidance and processing for the legal dissolution of a Foreign Capital Investment Company.',
   'PMA Companies', 'Liquidation Deed, BKPM Clearance, Deregistration', '6–12 Months', 1),
  ('company-valuation', 'Company Valuation',
   'Professional assessment to determine the economic value of a company or its assets.',
   'Businesses (M&A, Funding)', 'Valuation Report', '2–4 Weeks', 2)
) as s(slug, name, description, target_client, key_deliverables, estimated_timeline, sort_order)
on conflict (slug) do nothing;

-- ============================================================
-- Services — Visa > Investor ITAS Offshore / Onshore
-- ============================================================
with sc as (
  select s.id as sub_id, c.id as cat_id
  from public.sub_categories s join public.categories c on c.id = s.category_id
  where c.slug = 'visa' and s.slug = 'investor-itas-offshore'
)
insert into public.services (category_id, sub_category_id, slug, name, sort_order)
select sc.cat_id, sc.sub_id, v.slug, v.name, v.sort_order from sc,
(values ('investor-itas-offshore-1-year','Investor ITAS Offshore 1 Year',0),
        ('investor-itas-offshore-2-years','Investor ITAS Offshore 2 Years',1)) as v(slug,name,sort_order)
on conflict (slug) do nothing;

with sc as (
  select s.id as sub_id, c.id as cat_id
  from public.sub_categories s join public.categories c on c.id = s.category_id
  where c.slug = 'visa' and s.slug = 'investor-itas-onshore'
)
insert into public.services (category_id, sub_category_id, slug, name, sort_order)
select sc.cat_id, sc.sub_id, v.slug, v.name, v.sort_order from sc,
(values ('investor-itas-onshore-1-year','Investor ITAS Onshore 1 Year',0),
        ('investor-itas-onshore-2-years','Investor ITAS Onshore 2 Years',1)) as v(slug,name,sort_order)
on conflict (slug) do nothing;

-- ============================================================
-- Services — Visa > Worker ITAS Offshore / Onshore
-- ============================================================
with sc as (
  select s.id as sub_id, c.id as cat_id
  from public.sub_categories s join public.categories c on c.id = s.category_id
  where c.slug = 'visa' and s.slug = 'worker-itas-offshore'
)
insert into public.services (category_id, sub_category_id, slug, name, sort_order)
select sc.cat_id, sc.sub_id, v.slug, v.name, v.sort_order from sc,
(values ('worker-itas-offshore-6-months','Worker ITAS Offshore 6 Months',0),
        ('worker-itas-offshore-1-year','Worker ITAS Offshore 1 Year',1),
        ('worker-itas-offshore-2-years','Worker ITAS Offshore 2 Years',2)) as v(slug,name,sort_order)
on conflict (slug) do nothing;

with sc as (
  select s.id as sub_id, c.id as cat_id
  from public.sub_categories s join public.categories c on c.id = s.category_id
  where c.slug = 'visa' and s.slug = 'worker-itas-onshore'
)
insert into public.services (category_id, sub_category_id, slug, name, sort_order)
select sc.cat_id, sc.sub_id, v.slug, v.name, v.sort_order from sc,
(values ('worker-itas-onshore-6-months','Worker ITAS Onshore 6 Months',0),
        ('worker-itas-onshore-1-year','Worker ITAS Onshore 1 Year',1),
        ('worker-itas-onshore-2-years','Worker ITAS Onshore 2 Years',2)) as v(slug,name,sort_order)
on conflict (slug) do nothing;

-- ============================================================
-- Services — Visa > Freelance ITAS
-- ============================================================
with sc as (
  select s.id as sub_id, c.id as cat_id
  from public.sub_categories s join public.categories c on c.id = s.category_id
  where c.slug = 'visa' and s.slug = 'freelance-itas'
)
insert into public.services (category_id, sub_category_id, slug, name, sort_order)
select sc.cat_id, sc.sub_id, v.slug, v.name, v.sort_order from sc,
(values ('freelance-itas-6-months','Freelance ITAS 6 Months',0)) as v(slug,name,sort_order)
on conflict (slug) do nothing;

-- ============================================================
-- Services — Visa > Family ITAS (Offshore / Onshore / Extension)
-- ============================================================
with sc as (
  select s.id as sub_id, c.id as cat_id
  from public.sub_categories s join public.categories c on c.id = s.category_id
  where c.slug = 'visa' and s.slug = 'family-itas-offshore'
)
insert into public.services (category_id, sub_category_id, slug, name, sort_order)
select sc.cat_id, sc.sub_id, v.slug, v.name, v.sort_order from sc,
(values ('family-itas-offshore-1-year','Family ITAS Offshore 1 Year',0),
        ('family-itas-offshore-2-years','Family ITAS Offshore 2 Years',1)) as v(slug,name,sort_order)
on conflict (slug) do nothing;

with sc as (
  select s.id as sub_id, c.id as cat_id
  from public.sub_categories s join public.categories c on c.id = s.category_id
  where c.slug = 'visa' and s.slug = 'family-itas-onshore'
)
insert into public.services (category_id, sub_category_id, slug, name, sort_order)
select sc.cat_id, sc.sub_id, v.slug, v.name, v.sort_order from sc,
(values ('family-itas-onshore-1-year','Family ITAS Onshore 1 Year',0),
        ('family-itas-onshore-2-years','Family ITAS Onshore 2 Years',1)) as v(slug,name,sort_order)
on conflict (slug) do nothing;

with sc as (
  select s.id as sub_id, c.id as cat_id
  from public.sub_categories s join public.categories c on c.id = s.category_id
  where c.slug = 'visa' and s.slug = 'family-itas-extension'
)
insert into public.services (category_id, sub_category_id, slug, name, sort_order)
select sc.cat_id, sc.sub_id, v.slug, v.name, v.sort_order from sc,
(values ('family-itas-extension-1-year','Family ITAS Extension 1 Year',0),
        ('family-itas-extension-2-years','Family ITAS Extension 2 Years',1)) as v(slug,name,sort_order)
on conflict (slug) do nothing;

-- ============================================================
-- Services — Visa > Retirement ITAS (Offshore / Onshore)
-- ============================================================
with sc as (
  select s.id as sub_id, c.id as cat_id
  from public.sub_categories s join public.categories c on c.id = s.category_id
  where c.slug = 'visa' and s.slug = 'retirement-itas-offshore'
)
insert into public.services (category_id, sub_category_id, slug, name, sort_order)
select sc.cat_id, sc.sub_id, v.slug, v.name, v.sort_order from sc,
(values ('retirement-itas-offshore-1-year','Retirement ITAS Offshore 1 Year',0)) as v(slug,name,sort_order)
on conflict (slug) do nothing;

with sc as (
  select s.id as sub_id, c.id as cat_id
  from public.sub_categories s join public.categories c on c.id = s.category_id
  where c.slug = 'visa' and s.slug = 'retirement-itas-onshore'
)
insert into public.services (category_id, sub_category_id, slug, name, sort_order)
select sc.cat_id, sc.sub_id, v.slug, v.name, v.sort_order from sc,
(values ('retirement-itas-onshore-1-year','Retirement ITAS Onshore 1 Year',0)) as v(slug,name,sort_order)
on conflict (slug) do nothing;

-- ============================================================
-- Services — Visa > Single Entry Visa
-- ============================================================
with sc as (
  select s.id as sub_id, c.id as cat_id
  from public.sub_categories s join public.categories c on c.id = s.category_id
  where c.slug = 'visa' and s.slug = 'single-entry-visa'
)
insert into public.services (category_id, sub_category_id, slug, name, sort_order)
select sc.cat_id, sc.sub_id, v.slug, v.name, v.sort_order from sc,
(values ('business-single-entry-60-days','Business Single Entry 60 Days',0),
        ('social-volunteer-single-entry-60-days','Social or Volunteer Single Entry 60 Days',1)) as v(slug,name,sort_order)
on conflict (slug) do nothing;

-- ============================================================
-- Services — Visa > Multiple Entry Visa
-- ============================================================
with sc as (
  select s.id as sub_id, c.id as cat_id
  from public.sub_categories s join public.categories c on c.id = s.category_id
  where c.slug = 'visa' and s.slug = 'multiple-entry-visa'
)
insert into public.services (category_id, sub_category_id, slug, name, sort_order)
select sc.cat_id, sc.sub_id, v.slug, v.name, v.sort_order from sc,
(values ('tourist-multiple-entry-1-year','Tourist Multiple Entry 1 Year 60 Days',0),
        ('business-multiple-entry-1-year','Business Multiple Entry 1 Year 60 Days',1),
        ('multiple-entry-visa-extension','Multiple Entry Visa Extension',2)) as v(slug,name,sort_order)
on conflict (slug) do nothing;

-- ============================================================
-- Services — Visa > Pre-Investment Visa
-- ============================================================
with sc as (
  select s.id as sub_id, c.id as cat_id
  from public.sub_categories s join public.categories c on c.id = s.category_id
  where c.slug = 'visa' and s.slug = 'pre-investment-visa'
)
insert into public.services (category_id, sub_category_id, slug, name, sort_order)
select sc.cat_id, sc.sub_id, v.slug, v.name, v.sort_order from sc,
(values ('pre-investment-visa-1-year','Pre-Investment Visa 1 Year 180 Days',0),
        ('pre-investment-visa-2-years','Pre-Investment Visa 2 Years 180 Days',1)) as v(slug,name,sort_order)
on conflict (slug) do nothing;

-- ============================================================
-- Services — Visa > Remote Worker
-- ============================================================
with sc as (
  select s.id as sub_id, c.id as cat_id
  from public.sub_categories s join public.categories c on c.id = s.category_id
  where c.slug = 'visa' and s.slug = 'remote-worker'
)
insert into public.services (category_id, sub_category_id, slug, name, sort_order)
select sc.cat_id, sc.sub_id, v.slug, v.name, v.sort_order from sc,
(values ('remote-worker-offshore-1-year','Remote Worker Offshore 1 Year',0),
        ('remote-worker-onshore-1-year','Remote Worker Onshore 1 Year',1),
        ('remote-worker-extension','Remote Worker Extension',2)) as v(slug,name,sort_order)
on conflict (slug) do nothing;

-- ============================================================
-- Services — Visa > Miscellaneous single-service sub-categories
-- ============================================================
-- address-mutations, affidavit, apostille, brand-registration, domicile-letter,
-- e-passport, erp, passport-mutation, skck, sktt
do $$
declare
  cat_id uuid;
begin
  select id into cat_id from public.categories where slug = 'visa';

  insert into public.services (category_id, sub_category_id, slug, name, sort_order)
  select cat_id, sc.id, v.slug, v.name, 0
  from public.sub_categories sc
  join (values
    ('address-mutations',   'address-mutations-in-itas',  'Address Mutations in ITAS'),
    ('affidavit',           'affidavit',                  'Affidavit'),
    ('apostille',           'apostille-documents',        'Apostille Documents'),
    ('brand-registration',  'brand-registration',         'Brand Registration'),
    ('domicile-letter',     'domicile-letter',            'Domicile Letter'),
    ('erp',                 'erp',                        'ERP'),
    ('passport-mutation',   'passport-mutation',          'Passport Mutation from Old to New'),
    ('skck',                'skck-police-letter',         'SKCK / Police Letter'),
    ('sktt',                'sktt',                       'SKTT')
  ) as v(sub_slug, svc_slug, svc_name) on sc.slug = v.sub_slug
  where sc.category_id = cat_id
  on conflict (slug) do nothing;

  -- e-passport (2 services)
  insert into public.services (category_id, sub_category_id, slug, name, sort_order)
  select cat_id, sc.id, v.slug, v.name, v.sort_order
  from public.sub_categories sc,
  (values ('e-passport-5-years','E-Passport 5 Years',0),
          ('e-passport-10-years','E-Passport 10 Years',1)) as v(slug,name,sort_order)
  where sc.slug = 'e-passport' and sc.category_id = cat_id
  on conflict (slug) do nothing;
end $$;

-- ============================================================
-- Services — Legal > Changes & Restructuring
-- ============================================================
with sc as (
  select s.id as sub_id, c.id as cat_id
  from public.sub_categories s join public.categories c on c.id = s.category_id
  where c.slug = 'legal' and s.slug = 'changes-restructuring'
)
insert into public.services (category_id, sub_category_id, slug, name, description, target_client, key_deliverables, estimated_timeline, sort_order)
select sc.cat_id, sc.sub_id, s.slug, s.name, s.description, s.target_client, s.key_deliverables, s.estimated_timeline, s.sort_order
from sc, (values
  ('change-acte-pt-pma', 'Change Acte For PT Or PMA',
   'Processing of legal deeds (akta) for fundamental company changes (shareholders, directors, capital, Articles of Association).',
   'Existing Companies', 'Amended Articles of Association, Legal Updates', '3–6 Weeks', 0)
) as s(slug, name, description, target_client, key_deliverables, estimated_timeline, sort_order)
on conflict (slug) do nothing;

-- ============================================================
-- Services — Legal > Employment Contracts
-- ============================================================
with sc as (
  select s.id as sub_id, c.id as cat_id
  from public.sub_categories s join public.categories c on c.id = s.category_id
  where c.slug = 'legal' and s.slug = 'employment-contracts'
)
insert into public.services (category_id, sub_category_id, slug, name, description, target_client, key_deliverables, estimated_timeline, sort_order)
select sc.cat_id, sc.sub_id, s.slug, s.name, s.description, s.target_client, s.key_deliverables, s.estimated_timeline, s.sort_order
from sc, (values
  ('draft-employment-contract', 'Draft Employment Contract',
   'Drafting of legally compliant employment contracts for local employees.',
   'Employers', 'Legal Employment Contract', '3–7 Days', 0)
) as s(slug, name, description, target_client, key_deliverables, estimated_timeline, sort_order)
on conflict (slug) do nothing;

-- ============================================================
-- Services — Legal > Management & Licensing
-- ============================================================
with sc as (
  select s.id as sub_id, c.id as cat_id
  from public.sub_categories s join public.categories c on c.id = s.category_id
  where c.slug = 'legal' and s.slug = 'management-licensing'
)
insert into public.services (category_id, sub_category_id, slug, name, description, target_client, key_deliverables, estimated_timeline, sort_order)
select sc.cat_id, sc.sub_id, s.slug, s.name, s.description, s.target_client, s.key_deliverables, s.estimated_timeline, s.sort_order
from sc, (values
  ('joint-property-management', 'Joint Property Management',
   'Services for managing jointly owned properties, including legal agreements and operational oversight.',
   'Co-Owners', 'Management Agreement', 'Varies', 0),
  ('pondok-wisata-license', 'Pondok Wisata License',
   'Assistance with obtaining a license for small tourist accommodations (Pondok Wisata).',
   'Guesthouse Owners', 'Pondok Wisata License', '6–10 Weeks', 1),
  ('housing-contract-negotiation', 'Housing Contract Price Negotiation',
   'Professional negotiation services to secure favorable terms for housing rental or purchase contracts.',
   'Renters/Buyers', 'Negotiated Contract Terms', 'Varies', 2)
) as s(slug, name, description, target_client, key_deliverables, estimated_timeline, sort_order)
on conflict (slug) do nothing;

-- ============================================================
-- Services — Legal > Yayasan, RUPS, JBS (stub rows — details TBC by client)
-- ============================================================
do $$
declare
  cat_id uuid;
begin
  select id into cat_id from public.categories where slug = 'legal';

  insert into public.services (category_id, sub_category_id, slug, name, sort_order)
  select cat_id, sc.id, v.slug, v.name, 0
  from public.sub_categories sc
  join (values
    ('yayasan', 'yayasan-foundation-setup',    'Yayasan (Foundation) Setup'),
    ('rups',    'rups-general-meeting',         'RUPS (General Meeting of Shareholders)'),
    ('jbs',     'jbs-per-transaction',          'JBS Per Transaction')
  ) as v(sub_slug, svc_slug, svc_name) on sc.slug = v.sub_slug
  where sc.category_id = cat_id
  on conflict (slug) do nothing;
end $$;
```

- [ ] **Step 5: Run seed in Supabase SQL Editor**

Paste `supabase/seed.sql` → Run. Verify row counts:
- `categories`: 7 rows
- `sub_categories`: 47+ rows
- `services`: 100+ rows (all Visa and Legal sub-categories seeded)

- [ ] **Step 6: Commit**

```bash
git add supabase/
git commit -m "feat: add Supabase schema migration and seed data"
```

---

## Task 3: Data Layer (Repository Pattern)

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/db/types.ts`
- Create: `src/lib/db/categories.ts`
- Create: `src/lib/db/services.ts`

- [ ] **Step 1: Write `src/lib/supabase/client.ts`**

This file is **server-only** — never import it in client components. All DB access goes through server components or API routes.

```typescript
import 'server-only'
import { createClient } from '@supabase/supabase-js'

// Server-only singleton. Import only in server components, lib/db/*, and API routes.
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } }
)
```

- [ ] **Step 2: Write `src/lib/supabase/server.ts`**

```typescript
import { createClient } from '@supabase/supabase-js'

// Creates a fresh client per request for server components
export function createServerClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )
}
```

- [ ] **Step 3: Write `src/lib/db/types.ts`**

```typescript
export interface Category {
  id: string
  slug: string
  name: string
  tagline: string | null
  icon_name: string | null
  image_url: string | null
  color_accent: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface SubCategory {
  id: string
  category_id: string
  slug: string
  name: string
  sort_order: number
  is_active: boolean
}

export interface Service {
  id: string
  category_id: string
  sub_category_id: string | null
  slug: string
  name: string
  description: string | null
  target_client: string | null
  key_deliverables: string | null
  estimated_timeline: string | null
  real_time_work: string | null
  whatsapp_message: string | null
  meta_title: string | null
  meta_description: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// Enriched types used in pages
export interface ServiceWithCategory extends Service {
  category: Pick<Category, 'slug' | 'name'>
  sub_category: Pick<SubCategory, 'slug' | 'name'> | null
}

export interface SubCategoryWithServices extends SubCategory {
  services: Service[]
}

export interface CategoryWithSubCategories extends Category {
  sub_categories: SubCategoryWithServices[]
}
```

- [ ] **Step 4: Write `src/lib/db/categories.ts`**

```typescript
import { createServerClient } from '@/lib/supabase/server'
import type { Category, CategoryWithSubCategories } from './types'

export async function getCategories(): Promise<Category[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  if (error) throw new Error(`getCategories: ${error.message}`)
  return data ?? []
}

export async function getCategoryBySlug(slug: string): Promise<CategoryWithSubCategories | null> {
  const supabase = createServerClient()
  const { data: category, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !category) return null

  const { data: subCategories } = await supabase
    .from('sub_categories')
    .select('*')
    .eq('category_id', category.id)
    .eq('is_active', true)
    .order('sort_order')

  const subCatsWithServices = await Promise.all(
    (subCategories ?? []).map(async (sc) => {
      const { data: services } = await supabase
        .from('services')
        .select('*')
        .eq('sub_category_id', sc.id)
        .eq('is_active', true)
        .order('sort_order')

      return { ...sc, services: services ?? [] }
    })
  )

  return { ...category, sub_categories: subCatsWithServices }
}

export async function getAllCategorySlugs(): Promise<string[]> {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('categories')
    .select('slug')
    .eq('is_active', true)

  return (data ?? []).map((c) => c.slug)
}
```

- [ ] **Step 5: Write `src/lib/db/services.ts`**

```typescript
import { createServerClient } from '@/lib/supabase/server'
import type { Service, ServiceWithCategory } from './types'

export async function getServiceBySlug(slug: string): Promise<ServiceWithCategory | null> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('services')
    .select(`
      *,
      category:categories(slug, name),
      sub_category:sub_categories(slug, name)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !data) return null
  return data as ServiceWithCategory
}

export async function getRelatedServices(
  subCategoryId: string,
  excludeSlug: string,
  limit = 4
): Promise<Service[]> {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('services')
    .select('*')
    .eq('sub_category_id', subCategoryId)
    .eq('is_active', true)
    .neq('slug', excludeSlug)
    .order('sort_order')
    .limit(limit)

  return data ?? []
}

export async function getAllServiceSlugs(): Promise<{ category: string; slug: string }[]> {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('services')
    .select('slug, category:categories(slug)')
    .eq('is_active', true)

  return (data ?? []).map((s: any) => ({
    category: s.category.slug,
    slug: s.slug,
  }))
}
```

- [ ] **Step 6: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 7: Commit**

```bash
git add src/lib/
git commit -m "feat: add Supabase clients and repository data layer"
```

---

## Task 4: UI Primitives

**Files:**
- Create: `src/components/ui/WhatsAppCTA.tsx`
- Create: `src/components/ui/WhatsAppFloat.tsx`
- Create: `src/components/ui/AnimatedSection.tsx`

- [ ] **Step 1: Write `src/components/ui/WhatsAppCTA.tsx`**

```tsx
'use client'

interface WhatsAppCTAProps {
  serviceName?: string
  customMessage?: string
  variant?: 'primary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  label?: string
}

export function WhatsAppCTA({
  serviceName,
  customMessage,
  variant = 'primary',
  size = 'md',
  className = '',
  label,
}: WhatsAppCTAProps) {
  const number = process.env.NEXT_PUBLIC_WA_NUMBER ?? ''
  const message = customMessage
    ?? (serviceName
        ? `Hi Ilot, I'm interested in: *${serviceName}*. Could you help me get started?`
        : `Hi Ilot, I'd like to learn more about your services.`)

  const href = `https://wa.me/${number}?text=${encodeURIComponent(message)}`

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }[size]

  const variantClasses = variant === 'primary'
    ? 'bg-accent text-foreground font-bold hover:bg-yellow-400'
    : 'border-2 border-accent text-accent font-bold hover:bg-accent hover:text-foreground'

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-full transition-all duration-200 ${sizeClasses} ${variantClasses} ${className}`}
    >
      <WhatsAppIcon className="w-5 h-5 flex-shrink-0" />
      {label ?? (serviceName ? 'Enquire on WhatsApp' : 'Contact on WhatsApp')}
    </a>
  )
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}
```

- [ ] **Step 2: Write `src/components/ui/WhatsAppFloat.tsx`**

```tsx
'use client'

import { WhatsAppCTA } from './WhatsAppCTA'

export function WhatsAppFloat() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <WhatsAppCTA
        variant="primary"
        size="md"
        label=""
        className="w-14 h-14 rounded-full justify-center shadow-2xl !px-0"
        aria-label="Contact us on WhatsApp"
      />
    </div>
  )
}
```

- [ ] **Step 3: Write `src/components/ui/AnimatedSection.tsx`**

```tsx
'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

interface AnimatedSectionProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function AnimatedSection({ children, className = '', delay = 0 }: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/
git commit -m "feat: add WhatsAppCTA, WhatsAppFloat, AnimatedSection UI primitives"
```

---

## Task 5: Navbar & Footer

**Files:**
- Create: `src/components/layout/Navbar.tsx`
- Create: `src/components/layout/Footer.tsx`

- [ ] **Step 1: Write `src/components/layout/Navbar.tsx`**

```tsx
import Link from 'next/link'
import { WhatsAppCTA } from '@/components/ui/WhatsAppCTA'

const NAV_LINKS = [
  { href: '/visa', label: 'Visa' },
  { href: '/legal', label: 'Legal' },
  { href: '/company-setup', label: 'Company Setup' },
  { href: '/contact', label: 'Contact' },
]

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-surface">
      <nav className="container-site flex items-center justify-between h-16 px-6 md:px-12">
        {/* Wordmark */}
        <Link href="/" className="font-bold text-2xl tracking-tight text-foreground">
          Ilot
        </Link>

        {/* Links — hidden on mobile */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="text-sm font-medium text-muted hover:text-foreground transition-colors"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <WhatsAppCTA variant="ghost" size="sm" label="Get in touch" />
      </nav>
    </header>
  )
}
```

- [ ] **Step 2: Write `src/components/layout/Footer.tsx`**

```tsx
import Link from 'next/link'

const SERVICES = [
  { href: '/visa', label: 'Visa & Immigration' },
  { href: '/legal', label: 'Legal & Contracts' },
  { href: '/company-setup', label: 'Company Setup' },
  { href: '/insurance', label: 'Insurance' },
  { href: '/property', label: 'Property Advisory' },
  { href: '/hr-payroll', label: 'HR & Payroll' },
  { href: '/accounting-tax', label: 'Accounting & Tax' },
]

const LEGAL_LINKS = [
  { href: '/legal', label: 'Terms & Conditions' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/cookies', label: 'Cookies Policy' },
]

export function Footer() {
  return (
    <footer className="bg-dark text-white pt-16 pb-8">
      <div className="container-site px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="font-bold text-2xl tracking-tight mb-3">Ilot</div>
            <p className="text-muted text-sm leading-relaxed">
              Clear Legal Support. Confident Decisions.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted mb-4">
              Services
            </h3>
            <ul className="space-y-2">
              {SERVICES.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted mb-4">
              Legal
            </h3>
            <ul className="space-y-2">
              {LEGAL_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 text-xs text-muted flex flex-col md:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} Ilot. All rights reserved.</span>
          <span>Indonesia · English</span>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 3: Add layout for marketing group `src/app/(marketing)/layout.tsx`**

```tsx
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  )
}
```

- [ ] **Step 4: Verify dev server runs**

```bash
npm run dev
```

Open http://localhost:3000. Expect: white page with navbar and footer (no homepage content yet — fine).

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/ src/app/
git commit -m "feat: add Navbar, Footer, and marketing layout"
```

---

## Task 6: Hero Circle Animation

**Files:**
- Create: `src/components/home/HeroCircle.tsx`

This is the most complex component. Read carefully.

**How it works:**
- A `300vh` tall outer div is the scroll track
- Inside it, a `100vh` sticky div is the canvas — it stays fixed while user scrolls the 3 screen-heights
- Framer Motion `useScroll` tracks scroll progress within the sticky container
- `useTransform` maps progress (0→1) to individual card positions + rotations

**Card positions (7 cards in a circle, radius ~38% of container width):**
- Card angles at: -90°, -38.6°, 12.9°, 64.3°, 115.7°, 167.1°, 218.6° (evenly spaced, start at top = -90°)
- Final x = cos(angle) * radius, Final y = sin(angle) * radius (in %, relative to center)

- [ ] **Step 1: Write `src/components/home/HeroCircle.tsx`**

Key fixes applied:
- Scene 1 start position: cards sit at `calc(50vh - 80px)` from center top (bottom edge of viewport)
- Scroll ranges: text fades 30–60%, cards travel 30–95% (overlapping, matching spec Scene 2)
- Spring physics: `useSpring` wraps each transform for smooth settling
- Hover disabled during scroll via `isAnimating` derived from progress
- Lucide icon rendered top-left in a gold circle on each card

```tsx
'use client'

import { useRef, useState } from 'react'
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValueEvent,
  MotionValue,
} from 'framer-motion'
import Link from 'next/link'
import * as LucideIcons from 'lucide-react'
import { Star } from 'lucide-react'
import { WhatsAppCTA } from '@/components/ui/WhatsAppCTA'

interface HeroCard {
  slug: string
  name: string
  icon: string
  imageUrl?: string
  colorAccent?: string
}

interface HeroCircleProps {
  cards: HeroCard[]
}

// 7 evenly spaced angles starting at top (-90°) going clockwise
const ANGLES = Array.from({ length: 7 }, (_, i) => -90 + (360 / 7) * i)
const RADIUS_VW = 26 // circle radius in vw units

function getCirclePosition(angleIndex: number) {
  const angleDeg = ANGLES[angleIndex]
  const angleRad = (angleDeg * Math.PI) / 180
  return {
    x: Math.cos(angleRad) * RADIUS_VW,
    y: Math.sin(angleRad) * RADIUS_VW,
    rotate: angleDeg + 90, // face outward from center
  }
}

const SPRING_CONFIG = { stiffness: 80, damping: 20, mass: 0.8 }

export function HeroCircle({ cards }: HeroCircleProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  // Text fades out 30%→60% — fully visible until user starts scrolling meaningfully
  const textOpacity = useTransform(scrollYProgress, [0.3, 0.6], [1, 0])
  const textY = useTransform(scrollYProgress, [0.3, 0.6], [0, -40])

  // Center label fades in 85%→100%
  const centerOpacity = useTransform(scrollYProgress, [0.85, 1], [0, 1])
  const centerScale = useTransform(scrollYProgress, [0.85, 1], [0.8, 1])

  // isAnimating: true when scroll is between 30% and 95% (disables card hover)
  const isAnimating = useTransform(scrollYProgress, (v) => v > 0.28 && v < 0.97)

  return (
    <div ref={containerRef} style={{ height: '300vh' }} className="relative">
      <div className="sticky top-0 h-screen overflow-hidden bg-background flex items-center justify-center">

        {/* Initial headline */}
        <motion.div
          style={{ opacity: textOpacity, y: textY }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10"
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground max-w-4xl leading-none mb-6">
            Clear Legal Support.<br />Confident Decisions.
          </h1>
          <p className="text-muted text-lg md:text-xl max-w-xl mb-8 leading-relaxed">
            Elite visa, legal, and corporate solutions for global investors in Indonesia — handled end-to-end.
          </p>
          <div className="flex items-center gap-4">
            <WhatsAppCTA size="lg" label="Get your free quote" />
            <Link
              href="/contact"
              className="px-8 py-4 rounded-full border-2 border-foreground text-foreground font-bold hover:bg-foreground hover:text-white transition-all text-lg"
            >
              Learn more
            </Link>
          </div>
        </motion.div>

        {/* Center reveal */}
        <motion.div
          style={{ opacity: centerOpacity, scale: centerScale }}
          className="absolute z-10 text-center pointer-events-none select-none"
        >
          <p className="text-muted text-sm uppercase tracking-widest mb-2">One platform</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Everything you need<br />to grow
          </h2>
        </motion.div>

        {/* 7 service cards */}
        {cards.map((card, i) => (
          <HeroCard
            key={card.slug}
            card={card}
            index={i}
            scrollYProgress={scrollYProgress}
            isAnimating={isAnimating}
          />
        ))}
      </div>
    </div>
  )
}

function HeroCard({
  card,
  index,
  scrollYProgress,
  isAnimating,
}: {
  card: HeroCard
  index: number
  scrollYProgress: MotionValue<number>
  isAnimating: MotionValue<boolean>
}) {
  const target = getCirclePosition(index)

  // Scene 1 start: cards in a horizontal strip at the bottom edge of the viewport.
  // All values are plain numbers (vw units) — required by useSpring.
  // startY = 45vw places cards below the center on typical 16:9 screens (~bottom edge).
  const startX = (index - 3) * 13  // vw, numeric
  const startY = 45                 // vw, places cards at bottom edge on 16:9

  const rawX = useTransform(scrollYProgress, [0.3, 0.95], [startX, target.x])
  const rawY = useTransform(scrollYProgress, [0.3, 0.95], [startY, target.y])
  const rawRotate = useTransform(scrollYProgress, [0.3, 0.95], [0, target.rotate])

  // Spring wrapping — only works with numeric MotionValues
  const x = useSpring(rawX, SPRING_CONFIG)
  const y = useSpring(rawY, SPRING_CONFIG)
  const rotate = useSpring(rawRotate, SPRING_CONFIG)

  // Sync isAnimating MotionValue → React state so we can conditionally set whileHover.
  // MotionValue cannot be passed to whileHover directly — it must be a plain object or undefined.
  const [animating, setAnimating] = useState(false)
  useMotionValueEvent(isAnimating, 'change', setAnimating)

  // Resolve icon component from Lucide — fall back to Star
  const IconComponent =
    (LucideIcons as Record<string, any>)[card.icon] ?? Star

  return (
    <motion.div
      style={{ x, y, rotate, position: 'absolute' }}
    >
      <motion.div
        whileHover={animating ? undefined : { scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <Link
          href={`/${card.slug}`}
          className="block w-[11vw] min-w-[130px] max-w-[180px] aspect-square rounded-card shadow-2xl overflow-hidden relative group"
        >
          {/* Background photo or gradient */}
          <div
            className="absolute inset-0"
            style={{
              background: card.imageUrl
                ? `url(${card.imageUrl}) center/cover`
                : `linear-gradient(135deg, ${card.colorAccent ?? '#1e3a5f'}, #0a1628)`,
            }}
          />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Icon — top-left gold circle */}
          <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
            <IconComponent className="w-4 h-4 text-accent" aria-hidden="true" />
          </div>

          {/* Category name — bottom-left */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <span className="text-white font-bold text-xs leading-tight block">
              {card.name}
            </span>
          </div>

          {/* Gold border hover glow — only visible when not animating */}
          <div className="absolute inset-0 border-2 border-transparent group-hover:border-accent rounded-card transition-colors duration-300" />
        </Link>
      </motion.div>
    </motion.div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/home/HeroCircle.tsx
git commit -m "feat: add HeroCircle scroll-linked fan-out animation component"
```

---

## Task 7: Remaining Homepage Sections

**Files:**
- Create: `src/components/home/PartnerBar.tsx`
- Create: `src/components/home/AboutSection.tsx`
- Create: `src/components/home/WhyUsBento.tsx`
- Create: `src/components/home/ProcessSteps.tsx`
- Create: `src/components/home/TestimonialsSection.tsx`
- Create: `src/components/home/CTABanner.tsx`

- [ ] **Step 1: Write `src/components/home/PartnerBar.tsx`**

```tsx
const PARTNERS = ['Deloitte', 'KPMG', 'PwC', 'EY', 'BDO', 'Grant Thornton', 'RSM']

export function PartnerBar() {
  const doubled = [...PARTNERS, ...PARTNERS]
  return (
    <section className="bg-surface py-12 overflow-hidden">
      <div className="container-site px-6 md:px-12 mb-6 flex items-center justify-between">
        <p className="text-xs uppercase tracking-widest text-muted font-semibold">
          Trusted by clients advised by
        </p>
        <span className="text-foreground font-bold">110+ happy clients</span>
      </div>
      <div className="relative flex">
        <div className="flex animate-marquee whitespace-nowrap">
          {doubled.map((name, i) => (
            <span
              key={i}
              className="mx-12 text-lg font-bold text-foreground/30 hover:text-foreground/60 transition-colors cursor-default"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Write `src/components/home/AboutSection.tsx`**

```tsx
import { AnimatedSection } from '@/components/ui/AnimatedSection'

const STATS = [
  { value: '10+', label: 'Years of expertise' },
  { value: '110+', label: 'Clients served' },
  { value: '20+', label: 'Countries covered' },
]

export function AboutSection() {
  return (
    <section className="section-padding bg-background">
      <div className="container-site">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <AnimatedSection>
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-none">
              We replace the complexity of Indonesia&apos;s legal landscape with clarity.
            </h2>
          </AnimatedSection>

          <AnimatedSection delay={0.15}>
            <p className="text-muted text-lg leading-relaxed mb-10">
              Ilot was founded to give global investors, expatriates, and foreign businesses a single point of truth for navigating Indonesia. No more fragmented agencies, no more uncertainty — just expert guidance, from registration to operation.
            </p>
            <div className="grid grid-cols-3 gap-6">
              {STATS.map(({ value, label }) => (
                <div key={label}>
                  <div className="text-4xl font-bold text-accent mb-1">{value}</div>
                  <div className="text-sm text-muted">{label}</div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Write `src/components/home/WhyUsBento.tsx`**

```tsx
import { AnimatedSection } from '@/components/ui/AnimatedSection'
import { Zap, Shield, Eye, Clock, Lock } from 'lucide-react'

const ITEMS = [
  {
    icon: Zap,
    title: 'Frictionless Access',
    description: 'One intake, one team, one process. No chasing multiple agencies.',
    wide: true,
  },
  {
    icon: Shield,
    title: 'Regulatory Authority',
    description: 'Deep ties with Indonesian government bodies and notaries.',
    wide: false,
  },
  {
    icon: Eye,
    title: 'Absolute Transparency',
    description: 'You always know where your case stands. No surprises.',
    wide: false,
  },
  {
    icon: Clock,
    title: 'Speed & Precision',
    description: 'Optimised workflows that move at the pace of business.',
    wide: false,
  },
  {
    icon: Lock,
    title: 'Full Confidentiality',
    description: 'Your business information stays within Ilot, always.',
    wide: false,
  },
]

export function WhyUsBento() {
  return (
    <section className="section-padding bg-surface">
      <div className="container-site">
        <AnimatedSection className="mb-12">
          <p className="text-xs uppercase tracking-widest text-muted font-semibold mb-3">Why Ilot</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Built differently, by design.
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[180px]">
          {/* Wide cell */}
          <AnimatedSection
            delay={0.1}
            className="md:col-span-2 bg-foreground text-white rounded-card p-8 flex flex-col justify-end"
          >
            <ITEMS[0].icon className="w-8 h-8 text-accent mb-4" />
            <h3 className="text-2xl font-bold mb-2">{ITEMS[0].title}</h3>
            <p className="text-gray-400 text-sm">{ITEMS[0].description}</p>
          </AnimatedSection>

          {/* Single cell */}
          <AnimatedSection
            delay={0.15}
            className="bg-background rounded-card p-8 flex flex-col justify-end border border-surface"
          >
            <ITEMS[1].icon className="w-7 h-7 text-accent mb-3" />
            <h3 className="text-lg font-bold mb-1">{ITEMS[1].title}</h3>
            <p className="text-muted text-sm">{ITEMS[1].description}</p>
          </AnimatedSection>

          {/* Row of 3 */}
          {ITEMS.slice(2).map((item, i) => (
            <AnimatedSection
              key={item.title}
              delay={0.2 + i * 0.05}
              className="bg-background rounded-card p-8 flex flex-col justify-end border border-surface"
            >
              <item.icon className="w-7 h-7 text-accent mb-3" />
              <h3 className="text-lg font-bold mb-1">{item.title}</h3>
              <p className="text-muted text-sm">{item.description}</p>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Write `src/components/home/ProcessSteps.tsx`**

```tsx
import { AnimatedSection } from '@/components/ui/AnimatedSection'

const STEPS = [
  { n: '01', title: 'Selection', desc: 'Choose your service or describe your situation.' },
  { n: '02', title: 'One-Touch Initiation', desc: 'A single WhatsApp message connects you with your expert.' },
  { n: '03', title: 'Expert Handling', desc: 'Our team manages every document, deadline, and authority.' },
  { n: '04', title: 'Fulfillment', desc: 'Receive your permit, deed, or outcome. Clear and complete.' },
]

export function ProcessSteps() {
  return (
    <section className="section-padding bg-background">
      <div className="container-site">
        <AnimatedSection className="mb-12 text-center">
          <p className="text-xs uppercase tracking-widest text-muted font-semibold mb-3">How it works</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            A clean path in four steps.
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {STEPS.map(({ n, title, desc }, i) => (
            <AnimatedSection key={n} delay={i * 0.1} className="relative">
              <div className="text-7xl font-bold text-surface leading-none mb-4">{n}</div>
              <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
              <p className="text-muted text-sm leading-relaxed">{desc}</p>
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-8 -right-3 text-accent text-2xl">→</div>
              )}
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Write `src/components/home/TestimonialsSection.tsx`**

```tsx
import { AnimatedSection } from '@/components/ui/AnimatedSection'

const TESTIMONIALS = [
  {
    quote: 'Ilot handled our entire PMA setup while we focused on building the business. Seamless.',
    name: 'James T.',
    role: 'CEO, Singapore-based startup',
    stars: 5,
  },
  {
    quote: 'Got my Investor KITAS in 8 weeks with zero stress. The team knew exactly what to do at every step.',
    name: 'Marie L.',
    role: 'French Investor, Bali',
    stars: 5,
  },
  {
    quote: 'The land due diligence report they provided saved me from a very costly mistake. Worth every cent.',
    name: 'David K.',
    role: 'Property Buyer, Jakarta',
    stars: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section className="section-padding bg-surface">
      <div className="container-site">
        <AnimatedSection className="mb-12">
          <p className="text-xs uppercase tracking-widest text-muted font-semibold mb-3">Testimonials</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            What our clients say.
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ quote, name, role, stars }, i) => (
            <AnimatedSection
              key={name}
              delay={i * 0.1}
              className="bg-background rounded-card p-8 shadow-sm"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: stars }).map((_, j) => (
                  <span key={j} className="text-accent text-lg">★</span>
                ))}
              </div>
              <p className="text-foreground text-base leading-relaxed mb-6">&ldquo;{quote}&rdquo;</p>
              <div>
                <div className="font-bold text-foreground text-sm">{name}</div>
                <div className="text-muted text-xs">{role}</div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 6: Write `src/components/home/CTABanner.tsx`**

```tsx
import { WhatsAppCTA } from '@/components/ui/WhatsAppCTA'
import Link from 'next/link'

export function CTABanner() {
  return (
    <section className="bg-accent py-20 px-6 md:px-12">
      <div className="container-site text-center">
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-4">
          Ready to move forward?
        </h2>
        <p className="text-foreground/70 text-lg mb-10 max-w-xl mx-auto">
          Start with a free consultation. We&apos;ll tell you exactly what you need and how long it takes.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <WhatsAppCTA
            size="lg"
            label="Get your free quote"
            className="bg-foreground text-white hover:bg-foreground/90 border-none"
          />
          <Link
            href="/contact"
            className="px-8 py-4 rounded-full border-2 border-foreground text-foreground font-bold hover:bg-foreground hover:text-white transition-all text-lg"
          >
            Contact us
          </Link>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 7: Commit**

```bash
git add src/components/home/
git commit -m "feat: add all homepage sections — partners, about, bento, process, testimonials, CTA"
```

---

## Task 8: Homepage Page

**Files:**
- Create: `src/app/(marketing)/page.tsx`

- [ ] **Step 1: Write `src/app/(marketing)/page.tsx`**

```tsx
import { getCategories } from '@/lib/db/categories'
import { HeroCircle } from '@/components/home/HeroCircle'
import { PartnerBar } from '@/components/home/PartnerBar'
import { AboutSection } from '@/components/home/AboutSection'
import { WhyUsBento } from '@/components/home/WhyUsBento'
import { ProcessSteps } from '@/components/home/ProcessSteps'
import { TestimonialsSection } from '@/components/home/TestimonialsSection'
import { CTABanner } from '@/components/home/CTABanner'

export const revalidate = false // SSG — static forever

export default async function HomePage() {
  const categories = await getCategories()

  const cards = categories.map((cat) => ({
    slug: cat.slug,
    name: cat.name,
    icon: cat.icon_name ?? 'Star',
    imageUrl: cat.image_url ?? undefined,
    colorAccent: cat.color_accent ?? undefined,
  }))

  return (
    <>
      <HeroCircle cards={cards} />
      <PartnerBar />
      <AboutSection />
      <WhyUsBento />
      <ProcessSteps />
      <TestimonialsSection />
      <CTABanner />
    </>
  )
}
```

- [ ] **Step 2: Start dev server and verify homepage renders**

```bash
npm run dev
```

Open http://localhost:3000. Verify:
- Navbar visible with "Ilot" wordmark
- Hero section visible with headline
- Scroll down — cards should begin animating
- All 7 sections appear
- Footer visible

- [ ] **Step 3: Commit**

```bash
git add src/app/
git commit -m "feat: complete homepage with all 8 sections"
```

---

## Task 9: Service Components

**Files:**
- Create: `src/components/services/ServiceCard.tsx`
- Create: `src/components/services/CategorySidebar.tsx`
- Create: `src/components/services/ServiceDetail.tsx`
- Create: `src/components/services/RelatedServices.tsx`

- [ ] **Step 1: Write `src/components/services/ServiceCard.tsx`**

```tsx
import Link from 'next/link'
import { WhatsAppCTA } from '@/components/ui/WhatsAppCTA'
import type { Service } from '@/lib/db/types'

interface ServiceCardProps {
  service: Service
  categorySlug: string
}

export function ServiceCard({ service, categorySlug }: ServiceCardProps) {
  return (
    <div className="bg-background border border-surface rounded-card p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <Link
          href={`/${categorySlug}/${service.slug}`}
          className="text-lg font-bold text-foreground hover:text-accent transition-colors leading-snug"
        >
          {service.name}
        </Link>
        {service.target_client && (
          <span className="text-xs bg-surface text-muted px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0">
            {service.target_client}
          </span>
        )}
      </div>

      {/* Timeline */}
      {service.estimated_timeline && (
        <p className="text-sm text-muted mb-4">
          <span className="font-semibold text-foreground">Timeline:</span>{' '}
          {service.estimated_timeline}
        </p>
      )}

      {/* CTA */}
      <WhatsAppCTA
        serviceName={service.name}
        customMessage={service.whatsapp_message ?? undefined}
        variant="ghost"
        size="sm"
        label="Enquire"
      />
    </div>
  )
}
```

- [ ] **Step 2: Write `src/components/services/CategorySidebar.tsx`**

```tsx
'use client'

import { useEffect, useState } from 'react'

interface SidebarItem {
  id: string
  slug: string
  name: string
}

interface CategorySidebarProps {
  items: SidebarItem[]
}

export function CategorySidebar({ items }: CategorySidebarProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? '')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting)
        if (visible) setActiveId(visible.target.id)
      },
      { rootMargin: '-20% 0px -70% 0px' }
    )

    items.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [items])

  return (
    <nav className="hidden md:block sticky top-24 self-start">
      <ul className="space-y-1">
        {items.map(({ id, name }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className={`block text-sm px-3 py-2 rounded-lg transition-all ${
                activeId === id
                  ? 'bg-accent/10 text-accent font-semibold'
                  : 'text-muted hover:text-foreground hover:bg-surface'
              }`}
            >
              {name}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
```

- [ ] **Step 3: Write `src/components/services/ServiceDetail.tsx`**

```tsx
import { WhatsAppCTA } from '@/components/ui/WhatsAppCTA'
import type { ServiceWithCategory } from '@/lib/db/types'

interface ServiceDetailProps {
  service: ServiceWithCategory
}

export function ServiceDetail({ service }: ServiceDetailProps) {
  return (
    <article>
      {/* Hero */}
      <div className="bg-foreground text-white section-padding">
        <div className="container-site">
          {/* Breadcrumb — Home > Category > Sub-Category > Service Name */}
          <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2 flex-wrap">
            <a href="/" className="hover:text-white">Home</a>
            <span>›</span>
            <a href={`/${service.category.slug}`} className="hover:text-white">
              {service.category.name}
            </a>
            {service.sub_category && (
              <>
                <span>›</span>
                <a
                  href={`/${service.category.slug}#${service.sub_category.slug}`}
                  className="hover:text-white"
                >
                  {service.sub_category.name}
                </a>
              </>
            )}
            <span>›</span>
            <span className="text-gray-200">{service.name}</span>
          </nav>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-8 max-w-3xl">
            {service.name}
          </h1>

          <WhatsAppCTA
            serviceName={service.name}
            customMessage={service.whatsapp_message ?? undefined}
            size="lg"
            label="Start on WhatsApp"
            className="bg-accent text-foreground hover:bg-yellow-400"
          />
        </div>
      </div>

      {/* Info grid */}
      <div className="section-padding bg-surface">
        <div className="container-site">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {service.target_client && (
              <div className="bg-background rounded-card p-6">
                <p className="text-xs uppercase tracking-widest text-muted font-semibold mb-2">
                  Who it&apos;s for
                </p>
                <p className="font-semibold text-foreground">{service.target_client}</p>
              </div>
            )}
            {service.estimated_timeline && (
              <div className="bg-background rounded-card p-6">
                <p className="text-xs uppercase tracking-widest text-muted font-semibold mb-2">
                  Estimated timeline
                </p>
                <p className="font-semibold text-foreground">{service.estimated_timeline}</p>
              </div>
            )}
            {service.key_deliverables && (
              <div className="bg-background rounded-card p-6">
                <p className="text-xs uppercase tracking-widest text-muted font-semibold mb-2">
                  What you get
                </p>
                <p className="font-semibold text-foreground">{service.key_deliverables}</p>
              </div>
            )}
          </div>

          {service.description && (
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold mb-4">About this service</h2>
              <p className="text-muted leading-relaxed">{service.description}</p>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
```

- [ ] **Step 4: Write `src/components/services/RelatedServices.tsx`**

```tsx
import Link from 'next/link'
import type { Service } from '@/lib/db/types'

interface RelatedServicesProps {
  services: Service[]
  categorySlug: string
}

export function RelatedServices({ services, categorySlug }: RelatedServicesProps) {
  if (services.length === 0) return null

  return (
    <section className="section-padding bg-background">
      <div className="container-site">
        <h2 className="text-2xl font-bold mb-6">Related Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((s) => (
            <Link
              key={s.slug}
              href={`/${categorySlug}/${s.slug}`}
              className="block bg-surface rounded-card p-5 hover:shadow-md transition-shadow"
            >
              <p className="font-semibold text-foreground text-sm leading-snug mb-2">{s.name}</p>
              {s.estimated_timeline && (
                <p className="text-xs text-muted">{s.estimated_timeline}</p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/services/
git commit -m "feat: add ServiceCard, CategorySidebar, ServiceDetail, RelatedServices components"
```

---

## Task 10: Category Pillar Page

**Files:**
- Create: `src/app/(marketing)/[category]/page.tsx`

- [ ] **Step 1: Write `src/app/(marketing)/[category]/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getCategoryBySlug, getAllCategorySlugs } from '@/lib/db/categories'
import { ServiceCard } from '@/components/services/ServiceCard'
import { CategorySidebar } from '@/components/services/CategorySidebar'

export const revalidate = 3600

interface Props {
  params: Promise<{ category: string }>
}

export async function generateStaticParams() {
  const slugs = await getAllCategorySlugs()
  return slugs.map((slug) => ({ category: slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) return {}

  return {
    title: category.name,
    description:
      category.tagline ??
      `Expert ${category.name} services in Indonesia — handled by Ilot.`,
  }
}

export default async function CategoryPage({ params }: Props) {
  const { category: slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) notFound()

  const sidebarItems = category.sub_categories
    .filter((sc) => sc.services.length > 0)
    .map((sc) => ({ id: sc.slug, slug: sc.slug, name: sc.name }))

  return (
    <>
      {/* Hero */}
      <div className="bg-foreground text-white section-padding">
        <div className="container-site">
          <nav className="text-sm text-gray-400 mb-4">
            <a href="/" className="hover:text-white">Home</a>
            <span className="mx-2">›</span>
            <span>{category.name}</span>
          </nav>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
            {category.name}
          </h1>
          {category.tagline && (
            <p className="text-gray-300 text-xl max-w-xl">{category.tagline}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="section-padding bg-background">
        <div className="container-site">
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-12">
            {/* Sidebar */}
            <CategorySidebar items={sidebarItems} />

            {/* Services grouped by sub-category */}
            <div className="space-y-16">
              {category.sub_categories
                .filter((sc) => sc.services.length > 0)
                .map((sc) => (
                  <section key={sc.id} id={sc.slug}>
                    <h2 className="text-2xl font-bold text-foreground mb-6 pb-3 border-b border-surface">
                      {sc.name}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {sc.services.map((service) => (
                        <ServiceCard
                          key={service.slug}
                          service={service}
                          categorySlug={category.slug}
                        />
                      ))}
                    </div>
                  </section>
                ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Test category page**

```bash
npm run dev
```

Open http://localhost:3000/visa. Verify:
- Hero with "Visa & Immigration" title
- Sticky sidebar with sub-category links
- Service cards grouped by sub-category

- [ ] **Step 3: Commit**

```bash
git add src/app/
git commit -m "feat: add category pillar page with sticky sidebar and service card grid"
```

---

## Task 11: Service Detail Page

**Files:**
- Create: `src/app/(marketing)/[category]/[slug]/page.tsx`

- [ ] **Step 1: Write `src/app/(marketing)/[category]/[slug]/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getServiceBySlug, getRelatedServices, getAllServiceSlugs } from '@/lib/db/services'
import { ServiceDetail } from '@/components/services/ServiceDetail'
import { RelatedServices } from '@/components/services/RelatedServices'
import { CTABanner } from '@/components/home/CTABanner'

export const revalidate = 3600

interface Props {
  params: Promise<{ category: string; slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getAllServiceSlugs()
  return slugs.map(({ category, slug }) => ({ category, slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const service = await getServiceBySlug(slug)
  if (!service) return {}

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ilot.id'

  return {
    title: service.meta_title ?? service.name,
    description:
      service.meta_description ??
      service.description ??
      `${service.name} — professional service by Ilot in Indonesia.`,
    alternates: {
      canonical: `${siteUrl}/${service.category.slug}/${service.slug}`,
    },
  }
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params
  const service = await getServiceBySlug(slug)
  if (!service) notFound()

  const related = service.sub_category_id
    ? await getRelatedServices(service.sub_category_id, service.slug)
    : []

  // Schema.org JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description ?? '',
    provider: {
      '@type': 'Organization',
      name: 'Ilot',
      url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ilot.id',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ServiceDetail service={service} />
      <RelatedServices services={related} categorySlug={service.category.slug} />
      <CTABanner />
    </>
  )
}
```

- [ ] **Step 2: Test service detail page**

Open http://localhost:3000/visa/investor-kitas-2-years. Verify:
- Dark hero with service name
- WhatsApp CTA button
- Info grid (target client, timeline, deliverables)
- Description text
- Related services

- [ ] **Step 3: Commit**

```bash
git add src/app/
git commit -m "feat: add service detail page with SEO metadata and JSON-LD"
```

---

## Task 12: SEO — Sitemap & Robots

**Files:**
- Create: `src/app/sitemap.ts`
- Create: `src/app/robots.ts`

- [ ] **Step 1: Write `src/app/sitemap.ts`**

```typescript
import type { MetadataRoute } from 'next'
import { getCategories } from '@/lib/db/categories'
import { getAllServiceSlugs } from '@/lib/db/services'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ilot.id'
  const [categories, services] = await Promise.all([
    getCategories(),
    getAllServiceSlugs(),
  ])

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ]

  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${siteUrl}/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  }))

  const servicePages: MetadataRoute.Sitemap = services.map(({ category, slug }) => ({
    url: `${siteUrl}/${category}/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  return [...staticPages, ...categoryPages, ...servicePages]
}
```

- [ ] **Step 2: Write `src/app/robots.ts`**

```typescript
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ilot.id'
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
```

- [ ] **Step 3: Verify sitemap in dev**

```bash
npm run dev
```

Open http://localhost:3000/sitemap.xml. Verify all category and service URLs appear.

- [ ] **Step 4: Commit**

```bash
git add src/app/sitemap.ts src/app/robots.ts
git commit -m "feat: add auto-generated sitemap.xml and robots.txt"
```

---

## Task 13: Static Pages

**Files:**
- Create: `src/app/(marketing)/contact/page.tsx`
- Create: `src/app/(marketing)/legal/page.tsx`
- Create: `src/app/(marketing)/privacy/page.tsx`
- Create: `src/app/(marketing)/cookies/page.tsx`

- [ ] **Step 1: Write `src/app/(marketing)/contact/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { WhatsAppCTA } from '@/components/ui/WhatsAppCTA'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Ilot for a free consultation.',
}

export default function ContactPage() {
  return (
    <div className="section-padding">
      <div className="container-site max-w-2xl">
        <h1 className="text-5xl font-bold tracking-tight mb-4">Get in touch</h1>
        <p className="text-muted text-lg mb-8">
          Tell us what you need. We&apos;ll respond within one business day and guide you from there.
        </p>
        <WhatsAppCTA size="lg" label="Start on WhatsApp" className="mb-8 block w-fit" />
        <p className="text-muted text-sm">
          Prefer email? Reach us at{' '}
          <a href="mailto:hello@ilot.id" className="text-accent underline">
            hello@ilot.id
          </a>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write stub legal pages** (`legal`, `privacy`, `cookies` — same pattern)

```tsx
// src/app/(marketing)/legal/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Terms & Conditions' }

export default function LegalPage() {
  return (
    <div className="section-padding">
      <div className="container-site max-w-3xl">
        <h1 className="text-4xl font-bold mb-4">Terms & Conditions</h1>
        <p className="text-muted mb-6">Last updated: March 2026</p>
        <p className="text-muted italic">Full terms content to be provided by client.</p>
      </div>
    </div>
  )
}
```

```tsx
// src/app/(marketing)/privacy/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Privacy Policy' }

export default function PrivacyPage() {
  return (
    <div className="section-padding">
      <div className="container-site max-w-3xl">
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-muted mb-6">Last updated: March 2026</p>
        <p className="text-muted italic">Full policy content to be provided by client.</p>
      </div>
    </div>
  )
}
```

Create an identical stub for `cookies/page.tsx` with title "Cookies Policy".

- [ ] **Step 3: Commit**

```bash
git add src/app/
git commit -m "feat: add contact, privacy, legal, cookies static pages"
```

---

## Task 14: Production Build & Vercel Deploy

- [ ] **Step 1: Full production build**

```bash
npm run build
```

Expected: All pages build without errors. Check output — should show ISR pages for `/[category]` and `/[category]/[slug]`.

Fix any TypeScript or build errors before proceeding.

- [ ] **Step 2: Set up Vercel project**

```bash
npx vercel
```

Follow prompts: link to existing Vercel account, set project name to `ilot`, framework = Next.js.

- [ ] **Step 3: Add environment variables in Vercel dashboard**

Go to Vercel → Project Settings → Environment Variables. Add all 5 from `.env.local` with production values.

- [ ] **Step 4: Deploy to production**

```bash
npx vercel --prod
```

- [ ] **Step 5: Verify production deployment**

- Open the Vercel URL
- Check homepage loads and hero animation works
- Open `/visa` — pillar page with services
- Open `/visa/investor-kitas-2-years` — service detail
- Open `/sitemap.xml` — all URLs present
- Click a WhatsApp CTA — verify pre-filled message

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "chore: production build verified and deployed to Vercel"
```

---

## Checklist Summary

- [ ] Task 1: Project Scaffold
- [ ] Task 2: Supabase Schema & Seed
- [ ] Task 3: Data Layer
- [ ] Task 4: UI Primitives
- [ ] Task 5: Navbar & Footer
- [ ] Task 6: HeroCircle Animation
- [ ] Task 7: Homepage Sections
- [ ] Task 8: Homepage Page
- [ ] Task 9: Service Components
- [ ] Task 10: Category Pillar Page
- [ ] Task 11: Service Detail Page
- [ ] Task 12: SEO — Sitemap & Robots
- [ ] Task 13: Static Pages
- [ ] Task 14: Production Build & Vercel Deploy

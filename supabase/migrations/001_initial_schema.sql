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

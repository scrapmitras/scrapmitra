-- ============================================================================
-- Migration: 004_catalog_and_rates.sql
-- Description: Material categories, scrap items catalog, indicative rates, and audit history
-- ============================================================================

-- 1. Material Categories (e.g. Paper, Plastics, Ferrous Metals, Non-Ferrous Metals, E-Waste)
create table if not exists public.scrap_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_path text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Scrap Items Catalog (e.g. Newspaper, Cardboard, Iron Scrap, Copper Wire)
create table if not exists public.scrap_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.scrap_categories(id),
  name text not null,
  slug text not null unique,
  description text,
  image_path text,
  unit public.quantity_unit not null default 'kg',
  min_quantity numeric(12,3) not null default 0.100,
  quantity_step numeric(12,3) not null default 0.100,
  requires_inspection boolean not null default false,
  is_large_item boolean not null default false,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint scrap_items_min_qty check (min_quantity > 0),
  constraint scrap_items_qty_step check (quantity_step > 0)
);

create index if not exists scrap_items_category_idx on public.scrap_items (category_id, is_active, display_order);

-- 3. Published Indicative Rates (per kg / piece in INR)
create table if not exists public.scrap_rates (
  id uuid primary key default gen_random_uuid(),
  scrap_item_id uuid not null references public.scrap_items(id),
  rate_per_unit numeric(12,2) not null,
  currency char(3) not null default 'INR',
  is_indicative boolean not null default true,
  effective_from timestamptz not null default now(),
  effective_to timestamptz,
  is_published boolean not null default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  constraint scrap_rates_positive check (rate_per_unit >= 0),
  constraint scrap_rates_effective_range check (effective_to is null or effective_to > effective_from)
);

create index if not exists scrap_rates_current_idx on public.scrap_rates (scrap_item_id, is_published, effective_from desc);

-- 4. Rate Change History / Audit Trail
create table if not exists public.rate_history (
  id uuid primary key default gen_random_uuid(),
  scrap_rate_id uuid not null references public.scrap_rates(id),
  scrap_item_id uuid not null references public.scrap_items(id),
  old_rate numeric(12,2),
  new_rate numeric(12,2) not null,
  changed_by uuid references public.profiles(id),
  change_reason text,
  changed_at timestamptz not null default now()
);

create index if not exists rate_history_item_idx on public.rate_history (scrap_item_id, changed_at desc);

comment on table public.scrap_categories is 'Broad material classifications (Paper, Plastics, Metals, E-Waste)';
comment on table public.scrap_items is 'Individual scrap commodities with pricing units and quantity constraints';
comment on table public.scrap_rates is 'Time-versioned daily market benchmarked rates per unit';
comment on table public.rate_history is 'Audit trail of price adjustments by platform operators';

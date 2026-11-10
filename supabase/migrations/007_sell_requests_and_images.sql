-- ============================================================================
-- Migration: 007_sell_requests_and_images.sql
-- Description: Large items / commercial scrap quotation requests with private image attachments
-- ============================================================================

-- 1. Sell Requests Table (Header for Heavy/Bulky Items & Vehicles)
create table if not exists public.sell_requests (
  id uuid primary key default gen_random_uuid(),
  request_number text not null unique,
  profile_id uuid not null references public.profiles(id),
  address_id uuid references public.addresses(id) on delete set null,
  status public.sell_request_status not null default 'submitted',
  item_title text not null,
  item_description text,
  category_id uuid references public.scrap_categories(id),
  estimated_quantity numeric(12,3),
  unit public.quantity_unit,
  item_condition text,
  preferred_pickup_date date,
  customer_note text,
  -- Address Snapshot
  pickup_contact_name text not null,
  pickup_contact_phone_e164 text not null,
  pickup_address_line1 text not null,
  pickup_address_line2 text,
  pickup_landmark text,
  pickup_locality text,
  pickup_city text not null,
  pickup_state text not null,
  pickup_postal_code text not null,
  pickup_country_code char(2) not null default 'IN',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists sell_requests_profile_idx on public.sell_requests (profile_id, created_at desc);
create index if not exists sell_requests_status_idx on public.sell_requests (status, created_at desc);

-- 2. Sell Request Images (Private Storage Metadata)
create table if not exists public.sell_request_images (
  id uuid primary key default gen_random_uuid(),
  sell_request_id uuid not null references public.sell_requests(id) on delete cascade,
  storage_bucket text not null default 'sell-request-images',
  storage_path text not null unique,
  original_file_name text,
  content_type text not null,
  file_size_bytes bigint not null,
  uploaded_at timestamptz not null default now(),
  constraint sell_request_image_size check (file_size_bytes between 1 and 10485760),
  constraint sell_request_image_mime check (content_type in ('image/jpeg', 'image/png', 'image/webp'))
);

create index if not exists sell_request_images_request_idx on public.sell_request_images (sell_request_id);

comment on table public.sell_requests is 'Custom quote requests for bulky scrap, furniture, machinery, and vehicles';
comment on table public.sell_request_images is 'Customer-uploaded condition photos stored in private storage';

-- ============================================================================
-- Migration: 003_addresses.sql
-- Description: Customer saved addresses with geospatial coordinates & default tracking
-- ============================================================================

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  label text not null default 'Home',
  address_type public.address_type not null default 'home',
  contact_name text,
  contact_phone_e164 text,
  address_line1 text not null,
  address_line2 text,
  landmark text,
  locality text,
  city text not null,
  district text,
  state text not null,
  postal_code text not null,
  country_code char(2) not null default 'IN',
  latitude numeric(9,6),
  longitude numeric(9,6),
  delivery_instructions text,
  is_default boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (latitude is null or latitude between -90 and 90),
  check (longitude is null or longitude between -180 and 180)
);

create index if not exists addresses_profile_idx on public.addresses (profile_id, is_active);

-- Ensure a customer has at most one active default address
create unique index if not exists addresses_one_default_uq on public.addresses (profile_id)
  where is_default and is_active;

comment on table public.addresses is 'Saved customer addresses for doorstep pickup scheduling';

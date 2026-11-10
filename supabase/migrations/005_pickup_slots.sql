-- ============================================================================
-- Migration: 005_pickup_slots.sql
-- Description: Pickup time slot capacity management and serviceable pincode registry
-- ============================================================================

-- 1. Pickup Slots Table (Date + Time Window with Concurrency-Safe Capacity)
create table if not exists public.pickup_slots (
  id uuid primary key default gen_random_uuid(),
  slot_date date not null,
  starts_at time not null,
  ends_at time not null,
  capacity integer not null,
  reserved_count integer not null default 0,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pickup_slots_time_order check (ends_at > starts_at),
  constraint pickup_slots_capacity_bounds check (
    capacity >= 0 and
    reserved_count >= 0 and
    reserved_count <= capacity
  ),
  constraint pickup_slots_window_uq unique(slot_date, starts_at, ends_at)
);

create index if not exists pickup_slots_date_idx on public.pickup_slots (slot_date, is_available, starts_at);

-- 2. Serviceable Pincodes Registry (Vijayawada Launch Zone)
create table if not exists public.serviceable_pincodes (
  pincode char(6) primary key,
  locality text not null,
  city text not null default 'Vijayawada',
  district text not null default 'Krishna',
  state text not null default 'Andhra Pradesh',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists serviceable_pincodes_active_idx on public.serviceable_pincodes (is_active);

comment on table public.pickup_slots is 'Capacity-managed collection windows per day';
comment on table public.serviceable_pincodes is 'White-listed geographic operational coverage for doorstep collection';

-- ============================================================================
-- Migration: 006_bookings_and_items.sql
-- Description: Customer scrap pickup bookings, immutable snapshot items, and lifecycle timeline
-- ============================================================================

-- 1. Bookings Table (Header Record)
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_number text not null unique,
  profile_id uuid not null references public.profiles(id),
  address_id uuid references public.addresses(id) on delete set null,
  pickup_slot_id uuid references public.pickup_slots(id),
  status public.booking_status not null default 'pending_confirmation',
  payment_status public.booking_payment_status not null default 'not_required',
  scheduled_for timestamptz,
  customer_note text,
  -- Address Snapshot at Booking Time (Guarantees historical integrity if user edits address later)
  pickup_contact_name text not null,
  pickup_contact_phone_e164 text not null,
  pickup_address_line1 text not null,
  pickup_address_line2 text,
  pickup_landmark text,
  pickup_locality text,
  pickup_city text not null,
  pickup_district text,
  pickup_state text not null,
  pickup_postal_code text not null,
  pickup_country_code char(2) not null default 'IN',
  -- Financial Totals
  estimated_subtotal numeric(12,2) not null default 0,
  final_subtotal numeric(12,2),
  currency char(3) not null default 'INR',
  cancellation_reason text,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint bookings_est_subtotal_pos check (estimated_subtotal >= 0),
  constraint bookings_fin_subtotal_pos check (final_subtotal is null or final_subtotal >= 0)
);

create index if not exists bookings_profile_created_idx on public.bookings (profile_id, created_at desc);
create index if not exists bookings_status_idx on public.bookings (status, created_at desc);
create index if not exists bookings_scheduled_idx on public.bookings (scheduled_for);

-- 2. Booking Items (Line Items with Rate & Name Snapshots)
create table if not exists public.booking_items (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  scrap_item_id uuid references public.scrap_items(id),
  item_name_snapshot text not null,
  unit_snapshot public.quantity_unit not null,
  rate_per_unit_snapshot numeric(12,2) not null,
  estimated_quantity numeric(12,3) not null,
  final_quantity numeric(12,3),
  estimated_amount numeric(12,2) not null,
  final_amount numeric(12,2),
  customer_item_note text,
  created_at timestamptz not null default now(),
  constraint booking_items_rate_pos check (rate_per_unit_snapshot >= 0),
  constraint booking_items_est_qty_pos check (estimated_quantity > 0),
  constraint booking_items_fin_qty_pos check (final_quantity is null or final_quantity >= 0),
  constraint booking_items_est_amt_pos check (estimated_amount >= 0),
  constraint booking_items_fin_amt_pos check (final_amount is null or final_amount >= 0)
);

create index if not exists booking_items_booking_idx on public.booking_items (booking_id);

-- 3. Booking Status Transition Audit History (Timeline)
create table if not exists public.booking_status_history (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  from_status public.booking_status,
  to_status public.booking_status not null,
  changed_by_profile_id uuid references public.profiles(id),
  changed_by_role text not null default 'system',
  customer_visible_note text,
  internal_note text,
  created_at timestamptz not null default now()
);

create index if not exists booking_history_timeline_idx on public.booking_status_history (booking_id, created_at desc);

comment on table public.bookings is 'Customer doorstep collection bookings with immutable address snapshots';
comment on table public.booking_items is 'Scrap items associated with a booking with rate snapshots at booking time';
comment on table public.booking_status_history is 'Audit trail of booking state progression for real-time customer tracking';

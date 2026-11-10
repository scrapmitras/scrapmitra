-- ========================================================
-- SCRAP MITRA: COMPLETE DATABASE SCHEMA (ALL 12 MIGRATIONS)
-- ========================================================

-- >>>>> START MIGRATION: 001_extensions_and_enums.sql <<<<<
-- ============================================================================
-- Migration: 001_extensions_and_enums.sql
-- Description: Core PostgreSQL extensions and domain ENUM types for Scrap Mitra
-- Author: Scrap Mitra Engineering
-- ============================================================================

-- Extensions
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- 1. Identity & Auth Providers
do $$ begin
  create type public.identity_provider as enum ('firebase_phone', 'supabase_email');
exception
  when duplicate_object then null;
end $$;

-- 2. Address Categorization
do $$ begin
  create type public.address_type as enum ('home', 'work', 'shop', 'other');
exception
  when duplicate_object then null;
end $$;

-- 3. Quantity Units for Scrap Materials
do $$ begin
  create type public.quantity_unit as enum ('kg', 'piece', 'lot', 'gram');
exception
  when duplicate_object then null;
end $$;

-- 4. Doorstep Scrap Booking Lifecycle States
do $$ begin
  create type public.booking_status as enum (
    'draft',
    'pending_confirmation',
    'confirmed',
    'assigned',
    'pickup_started',
    'collected',
    'weighing_pending',
    'completed',
    'cancelled',
    'rejected'
  );
exception
  when duplicate_object then null;
end $$;

-- 5. Booking Settlement / Payment Statuses
do $$ begin
  create type public.booking_payment_status as enum (
    'not_required',
    'pending',
    'processing',
    'paid',
    'failed',
    'refunded',
    'partially_refunded'
  );
exception
  when duplicate_object then null;
end $$;

-- 6. Large Item / Heavy Machinery Sell Request States
do $$ begin
  create type public.sell_request_status as enum (
    'submitted',
    'under_review',
    'quotation_sent',
    'accepted',
    'rejected',
    'pickup_scheduled',
    'collected',
    'completed',
    'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

-- 7. Quotation Lifecycle States
do $$ begin
  create type public.quotation_status as enum (
    'draft',
    'sent',
    'accepted',
    'rejected',
    'expired',
    'withdrawn'
  );
exception
  when duplicate_object then null;
end $$;

-- 8. Payment Gateway & Settlement Transaction States
do $$ begin
  create type public.payment_status as enum (
    'created',
    'pending',
    'success',
    'failed',
    'refunded',
    'partially_refunded'
  );
exception
  when duplicate_object then null;
end $$;

-- 9. Supported Payment Methods for Doorstep Payouts
do $$ begin
  create type public.payment_method as enum (
    'cash',
    'upi',
    'bank_transfer',
    'online_gateway',
    'other'
  );
exception
  when duplicate_object then null;
end $$;

-- >>>>> END MIGRATION: 001_extensions_and_enums.sql <<<<<

-- >>>>> START MIGRATION: 002_profiles_and_identities.sql <<<<<
-- ============================================================================
-- Migration: 002_profiles_and_identities.sql
-- Description: Customer profile and multi-provider identity linking tables
-- ============================================================================

-- 1. Profiles Table (Central Customer Identity)
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  display_name text,
  email text,
  phone_e164 text,
  avatar_path text,
  preferred_language text not null default 'en',
  is_phone_verified boolean not null default false,
  is_email_verified boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint profiles_email_format check (email is null or position('@' in email) > 1),
  constraint profiles_phone_format check (phone_e164 is null or phone_e164 ~ '^\+[1-9][0-9]{7,14}$')
);

-- Partial unique indexes to allow soft deletion and null email/phones
create unique index if not exists profiles_email_uq on public.profiles (lower(email))
  where email is not null and deleted_at is null;

create unique index if not exists profiles_phone_uq on public.profiles (phone_e164)
  where phone_e164 is not null and deleted_at is null;

-- 2. User Identities Table (Maps Firebase Phone UID & Supabase Email UID to Profile)
create table if not exists public.user_identities (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  provider public.identity_provider not null,
  provider_subject text not null,
  provider_email text,
  provider_phone_e164 text,
  is_verified boolean not null default false,
  linked_at timestamptz not null default now(),
  last_authenticated_at timestamptz,
  created_at timestamptz not null default now(),
  constraint user_identity_provider_subject_uq unique(provider, provider_subject)
);

create index if not exists user_identities_profile_idx on public.user_identities (profile_id);

comment on table public.profiles is 'Unified customer profile across phone OTP and email credentials';
comment on table public.user_identities is 'Maps external auth tokens (Firebase phone UID, Supabase Auth UID) to internal customer profile ID';

-- >>>>> END MIGRATION: 002_profiles_and_identities.sql <<<<<

-- >>>>> START MIGRATION: 003_addresses.sql <<<<<
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

-- >>>>> END MIGRATION: 003_addresses.sql <<<<<

-- >>>>> START MIGRATION: 004_catalog_and_rates.sql <<<<<
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

-- >>>>> END MIGRATION: 004_catalog_and_rates.sql <<<<<

-- >>>>> START MIGRATION: 005_pickup_slots.sql <<<<<
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

-- >>>>> END MIGRATION: 005_pickup_slots.sql <<<<<

-- >>>>> START MIGRATION: 006_bookings_and_items.sql <<<<<
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

-- >>>>> END MIGRATION: 006_bookings_and_items.sql <<<<<

-- >>>>> START MIGRATION: 007_sell_requests_and_images.sql <<<<<
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

-- >>>>> END MIGRATION: 007_sell_requests_and_images.sql <<<<<

-- >>>>> START MIGRATION: 008_quotations.sql <<<<<
-- ============================================================================
-- Migration: 008_quotations.sql
-- Description: Platform-issued quotations for heavy items, with customer accept/reject lifecycle
-- ============================================================================

create table if not exists public.quotations (
  id uuid primary key default gen_random_uuid(),
  quotation_number text not null unique,
  sell_request_id uuid not null references public.sell_requests(id),
  profile_id uuid not null references public.profiles(id),
  status public.quotation_status not null default 'draft',
  offered_amount numeric(12,2) not null,
  currency char(3) not null default 'INR',
  offer_notes text,
  valid_until timestamptz not null,
  sent_at timestamptz,
  responded_at timestamptz,
  response_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quotations_offered_amt_pos check (offered_amount >= 0),
  constraint quotations_valid_period check (valid_until > created_at)
);

create index if not exists quotations_profile_idx on public.quotations (profile_id, created_at desc);
create index if not exists quotations_request_idx on public.quotations (sell_request_id);

comment on table public.quotations is 'Official binding price quotations issued for bulk/heavy scrap items';

-- >>>>> END MIGRATION: 008_quotations.sql <<<<<

-- >>>>> START MIGRATION: 009_payments.sql <<<<<
-- ============================================================================
-- Migration: 009_payments.sql
-- Description: Financial disbursements, cash on delivery, and gateway payouts/receipts
-- ============================================================================

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  payment_number text not null unique,
  profile_id uuid not null references public.profiles(id),
  booking_id uuid references public.bookings(id),
  quotation_id uuid references public.quotations(id),
  amount numeric(12,2) not null,
  currency char(3) not null default 'INR',
  method public.payment_method not null,
  status public.payment_status not null default 'created',
  provider_name text,
  provider_order_id text,
  provider_payment_id text,
  provider_signature_verified boolean not null default false,
  idempotency_key text unique,
  failure_code text,
  failure_message text,
  paid_at timestamptz,
  refunded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payments_positive_amount check (amount > 0),
  constraint payments_target_xor check (
    (booking_id is not null and quotation_id is null) or
    (booking_id is null and quotation_id is not null)
  )
);

create unique index if not exists payments_provider_ref_uq on public.payments (provider_name, provider_payment_id)
  where provider_payment_id is not null;

create index if not exists payments_profile_idx on public.payments (profile_id, created_at desc);

comment on table public.payments is 'Payment transaction records for customer scrap payouts and collection receipts';

-- >>>>> END MIGRATION: 009_payments.sql <<<<<

-- >>>>> START MIGRATION: 010_notifications_support_audit.sql <<<<<
-- ============================================================================
-- Migration: 010_notifications_support_audit.sql
-- Description: In-app customer notifications, support tickets, and immutable audit logs
-- ============================================================================

-- 1. In-App Notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  notification_type text not null,
  title text not null,
  body text not null,
  deep_link text,
  related_booking_id uuid references public.bookings(id) on delete set null,
  related_sell_request_id uuid references public.sell_requests(id) on delete set null,
  related_quotation_id uuid references public.quotations(id) on delete set null,
  is_read boolean not null default false,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_profile_idx on public.notifications (profile_id, created_at desc);

-- 2. Customer Support Tickets
create table if not exists public.support_requests (
  id uuid primary key default gen_random_uuid(),
  ticket_number text not null unique,
  profile_id uuid not null references public.profiles(id),
  booking_id uuid references public.bookings(id) on delete set null,
  subject text not null,
  message text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists support_profile_idx on public.support_requests (profile_id, created_at desc);

-- 3. Security Audit Logs (Immutable, Server-Side Written Only)
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid references public.profiles(id),
  actor_type text not null default 'customer',
  action text not null,
  entity_type text not null,
  entity_id uuid,
  request_id text,
  ip_hash text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_entity_idx on public.audit_logs (entity_type, entity_id, created_at desc);

comment on table public.notifications is 'Targeted customer notifications with deep links';
comment on table public.support_requests is 'Customer support inquiries and feedback tickets';
comment on table public.audit_logs is 'Tamper-evident administrative and financial event log';

-- >>>>> END MIGRATION: 010_notifications_support_audit.sql <<<<<

-- >>>>> START MIGRATION: 011_triggers_and_functions.sql <<<<<
-- ============================================================================
-- Migration: 011_triggers_and_functions.sql
-- Description: Updated-at timestamps, booking number generators, atomic slot reservation, and RPCs
-- ============================================================================

-- 1. Generic updated_at Trigger Function
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Attach triggers to all mutable tables
drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_addresses_updated_at on public.addresses;
create trigger set_addresses_updated_at
  before update on public.addresses
  for each row execute function public.set_updated_at();

drop trigger if exists set_scrap_categories_updated_at on public.scrap_categories;
create trigger set_scrap_categories_updated_at
  before update on public.scrap_categories
  for each row execute function public.set_updated_at();

drop trigger if exists set_scrap_items_updated_at on public.scrap_items;
create trigger set_scrap_items_updated_at
  before update on public.scrap_items
  for each row execute function public.set_updated_at();

drop trigger if exists set_pickup_slots_updated_at on public.pickup_slots;
create trigger set_pickup_slots_updated_at
  before update on public.pickup_slots
  for each row execute function public.set_updated_at();

drop trigger if exists set_bookings_updated_at on public.bookings;
create trigger set_bookings_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();

drop trigger if exists set_sell_requests_updated_at on public.sell_requests;
create trigger set_sell_requests_updated_at
  before update on public.sell_requests
  for each row execute function public.set_updated_at();

drop trigger if exists set_quotations_updated_at on public.quotations;
create trigger set_quotations_updated_at
  before update on public.quotations
  for each row execute function public.set_updated_at();

drop trigger if exists set_payments_updated_at on public.payments;
create trigger set_payments_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

drop trigger if exists set_support_requests_updated_at on public.support_requests;
create trigger set_support_requests_updated_at
  before update on public.support_requests
  for each row execute function public.set_updated_at();

-- 2. Concurrency-Safe Pickup Slot Reservation Function
-- Uses SELECT ... FOR UPDATE to prevent race conditions during peak booking hours
create or replace function public.reserve_pickup_slot(p_slot_id uuid)
returns boolean
language plpgsql
security definer
as $$
declare
  v_capacity int;
  v_reserved int;
  v_available boolean;
begin
  select capacity, reserved_count, is_available
  into v_capacity, v_reserved, v_available
  from public.pickup_slots
  where id = p_slot_id
  for update;

  if not found then
    raise exception 'Pickup slot % not found', p_slot_id;
  end if;

  if not v_available or v_reserved >= v_capacity then
    return false;
  end if;

  update public.pickup_slots
  set
    reserved_count = reserved_count + 1,
    is_available = (reserved_count + 1 < capacity)
  where id = p_slot_id;

  return true;
end;
$$;

-- 3. Atomic Customer Quotation Decision RPC (Accept / Reject)
create or replace function public.respond_to_quotation(
  p_quotation_id uuid,
  p_decision text, -- 'accepted' or 'rejected'
  p_note text default null
)
returns boolean
language plpgsql
security definer
as $$
declare
  v_quotation record;
  v_caller_id uuid;
begin
  v_caller_id := auth.uid();

  if p_decision not in ('accepted', 'rejected') then
    raise exception 'Invalid decision. Must be accepted or rejected';
  end if;

  -- Lock quotation row
  select * into v_quotation
  from public.quotations
  where id = p_quotation_id
  for update;

  if not found then
    raise exception 'Quotation not found';
  end if;

  -- Verify ownership
  if v_quotation.profile_id <> v_caller_id then
    raise exception 'Unauthorized to decide on this quotation';
  end if;

  -- Verify state is sent and not expired
  if v_quotation.status <> 'sent' then
    raise exception 'Quotation is not in actionable state (current: %)', v_quotation.status;
  end if;

  if v_quotation.valid_until < now() then
    update public.quotations set status = 'expired' where id = p_quotation_id;
    raise exception 'Quotation has expired on %', v_quotation.valid_until;
  end if;

  -- Atomically apply decision
  update public.quotations
  set
    status = p_decision::public.quotation_status,
    responded_at = now(),
    response_note = p_note
  where id = p_quotation_id;

  -- Update parent sell request
  update public.sell_requests
  set
    status = case
      when p_decision = 'accepted' then 'accepted'::public.sell_request_status
      else 'rejected'::public.sell_request_status
    end
  where id = v_quotation.sell_request_id;

  return true;
end;
$$;

-- >>>>> END MIGRATION: 011_triggers_and_functions.sql <<<<<

-- >>>>> START MIGRATION: 012_rls_policies.sql <<<<<
-- ============================================================================
-- Migration: 012_rls_policies.sql
-- Description: Comprehensive Row-Level Security (RLS) policies enforcing customer isolation
-- ============================================================================

-- Enable RLS on all public tables
alter table public.profiles enable row level security;
alter table public.user_identities enable row level security;
alter table public.addresses enable row level security;
alter table public.scrap_categories enable row level security;
alter table public.scrap_items enable row level security;
alter table public.scrap_rates enable row level security;
alter table public.rate_history enable row level security;
alter table public.pickup_slots enable row level security;
alter table public.serviceable_pincodes enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_items enable row level security;
alter table public.booking_status_history enable row level security;
alter table public.sell_requests enable row level security;
alter table public.sell_request_images enable row level security;
alter table public.quotations enable row level security;
alter table public.payments enable row level security;
alter table public.notifications enable row level security;
alter table public.support_requests enable row level security;
alter table public.audit_logs enable row level security;

-- ============================================================================
-- 1. PUBLIC READ-ONLY CATALOG POLICIES
-- ============================================================================

create policy "Categories are viewable by everyone"
  on public.scrap_categories for select
  using (is_active = true);

create policy "Scrap items are viewable by everyone"
  on public.scrap_items for select
  using (is_active = true);

create policy "Published rates are viewable by everyone"
  on public.scrap_rates for select
  using (is_published = true and (effective_to is null or effective_to > now()));

create policy "Serviceable pincodes are viewable by everyone"
  on public.serviceable_pincodes for select
  using (is_active = true);

create policy "Available pickup slots are viewable by authenticated users"
  on public.pickup_slots for select
  to authenticated
  using (is_available = true and slot_date >= current_date);

-- ============================================================================
-- 2. CUSTOMER PROFILES & IDENTITIES
-- ============================================================================

create policy "Customers can view their own profile"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

create policy "Customers can update their own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- user_identities is managed strictly by trusted server/auth service
create policy "Customers can view their own linked identities"
  on public.user_identities for select
  to authenticated
  using (profile_id = auth.uid());

-- ============================================================================
-- 3. ADDRESSES POLICIES
-- ============================================================================

create policy "Customers can view their own addresses"
  on public.addresses for select
  to authenticated
  using (profile_id = auth.uid());

create policy "Customers can insert their own addresses"
  on public.addresses for insert
  to authenticated
  with check (profile_id = auth.uid());

create policy "Customers can update their own addresses"
  on public.addresses for update
  to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "Customers can delete their own addresses"
  on public.addresses for delete
  to authenticated
  using (profile_id = auth.uid());

-- ============================================================================
-- 4. BOOKINGS & ITEMS POLICIES
-- ============================================================================

create policy "Customers can view their own bookings"
  on public.bookings for select
  to authenticated
  using (profile_id = auth.uid());

create policy "Customers can create bookings for themselves"
  on public.bookings for insert
  to authenticated
  with check (profile_id = auth.uid());

create policy "Customers can view line items of their own bookings"
  on public.booking_items for select
  to authenticated
  using (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id and b.profile_id = auth.uid()
    )
  );

create policy "Customers can insert line items for their own bookings"
  on public.booking_items for insert
  to authenticated
  with check (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id and b.profile_id = auth.uid()
    )
  );

create policy "Customers can view timeline of their own bookings"
  on public.booking_status_history for select
  to authenticated
  using (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id and b.profile_id = auth.uid()
    )
  );

-- ============================================================================
-- 5. SELL REQUESTS & IMAGES POLICIES
-- ============================================================================

create policy "Customers can view their own sell requests"
  on public.sell_requests for select
  to authenticated
  using (profile_id = auth.uid());

create policy "Customers can submit sell requests for themselves"
  on public.sell_requests for insert
  to authenticated
  with check (profile_id = auth.uid());

create policy "Customers can view images of their own sell requests"
  on public.sell_request_images for select
  to authenticated
  using (
    exists (
      select 1 from public.sell_requests r
      where r.id = sell_request_id and r.profile_id = auth.uid()
    )
  );

create policy "Customers can upload images for their own sell requests"
  on public.sell_request_images for insert
  to authenticated
  with check (
    exists (
      select 1 from public.sell_requests r
      where r.id = sell_request_id and r.profile_id = auth.uid()
    )
  );

-- ============================================================================
-- 6. QUOTATIONS POLICIES
-- ============================================================================

create policy "Customers can view quotations addressed to them"
  on public.quotations for select
  to authenticated
  using (profile_id = auth.uid());

-- Decisions (accept/reject) happen via secure RPC function respond_to_quotation()

-- ============================================================================
-- 7. PAYMENTS POLICIES
-- ============================================================================

create policy "Customers can view their own payment transactions"
  on public.payments for select
  to authenticated
  using (profile_id = auth.uid());

-- ============================================================================
-- 8. NOTIFICATIONS & SUPPORT POLICIES
-- ============================================================================

create policy "Customers can view their own notifications"
  on public.notifications for select
  to authenticated
  using (profile_id = auth.uid());

create policy "Customers can mark their own notifications as read"
  on public.notifications for update
  to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "Customers can view their own support requests"
  on public.support_requests for select
  to authenticated
  using (profile_id = auth.uid());

create policy "Customers can create support requests for themselves"
  on public.support_requests for insert
  to authenticated
  with check (profile_id = auth.uid());

-- >>>>> END MIGRATION: 012_rls_policies.sql <<<<<


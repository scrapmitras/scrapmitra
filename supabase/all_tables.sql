-- ============================================================================
-- SCRAP MITRA: ALL DATABASE TABLES & ENUMS IN ONE FILE
-- How to run:
-- 1. Open Supabase Dashboard: https://supabase.com/dashboard/project/caaivmxrksnrarknvanj/sql/new
-- 2. Paste this entire file into the SQL Editor
-- 3. Click the green "RUN" button (or press Ctrl + Enter)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- STEP 0: EXTENSIONS & CUSTOM ENUM TYPES
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
  CREATE TYPE public.identity_provider AS ENUM ('firebase_phone', 'supabase_email');
  CREATE TYPE public.address_type AS ENUM ('home', 'work', 'shop', 'other');
  CREATE TYPE public.quantity_unit AS ENUM ('kg', 'piece', 'lot', 'gram');
  CREATE TYPE public.booking_status AS ENUM (
    'draft', 'pending_confirmation', 'confirmed', 'assigned',
    'pickup_started', 'collected', 'weighing_pending', 'completed', 'cancelled', 'rejected'
  );
  CREATE TYPE public.booking_payment_status AS ENUM (
    'not_required', 'pending', 'processing', 'paid', 'failed', 'refunded', 'partially_refunded'
  );
  CREATE TYPE public.sell_request_status AS ENUM (
    'submitted', 'under_review', 'quotation_sent', 'accepted',
    'rejected', 'pickup_scheduled', 'collected', 'completed', 'cancelled'
  );
  CREATE TYPE public.quotation_status AS ENUM (
    'draft', 'sent', 'accepted', 'rejected', 'expired', 'withdrawn'
  );
  CREATE TYPE public.payment_status AS ENUM (
    'created', 'pending', 'success', 'failed', 'refunded', 'partially_refunded'
  );
  CREATE TYPE public.payment_method AS ENUM (
    'cash', 'upi', 'bank_transfer', 'online_gateway', 'other'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ----------------------------------------------------------------------------
-- TABLE 1: profiles
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name text,
  email text,
  phone_e164 text,
  avatar_path text,
  preferred_language text NOT NULL DEFAULT 'en',
  is_phone_verified boolean NOT NULL DEFAULT false,
  is_email_verified boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT profiles_email_format CHECK (email IS NULL OR position('@' IN email) > 1),
  CONSTRAINT profiles_phone_format CHECK (phone_e164 IS NULL OR phone_e164 ~ '^\+[1-9][0-9]{7,14}$')
);

CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_uq ON public.profiles (lower(email))
  WHERE email IS NOT NULL AND deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_uq ON public.profiles (phone_e164)
  WHERE phone_e164 IS NOT NULL AND deleted_at IS NULL;

-- ----------------------------------------------------------------------------
-- TABLE 2: user_identities
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_identities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider public.identity_provider NOT NULL,
  provider_subject text NOT NULL,
  provider_email text,
  provider_phone_e164 text,
  is_verified boolean NOT NULL DEFAULT false,
  linked_at timestamptz NOT NULL DEFAULT now(),
  last_authenticated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_identity_provider_subject_uq UNIQUE (provider, provider_subject)
);

CREATE INDEX IF NOT EXISTS user_identities_profile_idx ON public.user_identities (profile_id);

-- ----------------------------------------------------------------------------
-- TABLE 3: addresses
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT 'Home',
  address_type public.address_type NOT NULL DEFAULT 'home',
  contact_name text,
  contact_phone_e164 text,
  address_line1 text NOT NULL,
  address_line2 text,
  landmark text,
  locality text,
  city text NOT NULL,
  district text,
  state text NOT NULL,
  postal_code text NOT NULL,
  country_code char(2) NOT NULL DEFAULT 'IN',
  latitude numeric(9,6),
  longitude numeric(9,6),
  delivery_instructions text,
  is_default boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
  CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180)
);

CREATE INDEX IF NOT EXISTS addresses_profile_idx ON public.addresses (profile_id, is_active);

CREATE UNIQUE INDEX IF NOT EXISTS addresses_one_default_uq ON public.addresses (profile_id)
  WHERE is_default AND is_active;

-- ----------------------------------------------------------------------------
-- TABLE 4: scrap_categories
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.scrap_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  image_path text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- TABLE 5: scrap_items
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.scrap_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.scrap_categories(id),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  image_path text,
  unit public.quantity_unit NOT NULL DEFAULT 'kg',
  min_quantity numeric(12,3) NOT NULL DEFAULT 0.100,
  quantity_step numeric(12,3) NOT NULL DEFAULT 0.100,
  requires_inspection boolean NOT NULL DEFAULT false,
  is_large_item boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT scrap_items_min_qty CHECK (min_quantity > 0),
  CONSTRAINT scrap_items_qty_step CHECK (quantity_step > 0)
);

CREATE INDEX IF NOT EXISTS scrap_items_category_idx ON public.scrap_items (category_id, is_active, display_order);

-- ----------------------------------------------------------------------------
-- TABLE 6: scrap_rates
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.scrap_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scrap_item_id uuid NOT NULL REFERENCES public.scrap_items(id),
  rate_per_unit numeric(12,2) NOT NULL,
  currency char(3) NOT NULL DEFAULT 'INR',
  is_indicative boolean NOT NULL DEFAULT true,
  effective_from timestamptz NOT NULL DEFAULT now(),
  effective_to timestamptz,
  is_published boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT scrap_rates_positive CHECK (rate_per_unit >= 0),
  CONSTRAINT scrap_rates_effective_range CHECK (effective_to IS NULL OR effective_to > effective_from)
);

CREATE INDEX IF NOT EXISTS scrap_rates_current_idx ON public.scrap_rates (scrap_item_id, is_published, effective_from DESC);

-- ----------------------------------------------------------------------------
-- TABLE 7: rate_history
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rate_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scrap_rate_id uuid NOT NULL REFERENCES public.scrap_rates(id),
  scrap_item_id uuid NOT NULL REFERENCES public.scrap_items(id),
  old_rate numeric(12,2),
  new_rate numeric(12,2) NOT NULL,
  changed_by uuid REFERENCES public.profiles(id),
  change_reason text,
  changed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS rate_history_item_idx ON public.rate_history (scrap_item_id, changed_at DESC);

-- ----------------------------------------------------------------------------
-- TABLE 8: pickup_slots
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pickup_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_date date NOT NULL,
  starts_at time NOT NULL,
  ends_at time NOT NULL,
  capacity integer NOT NULL,
  reserved_count integer NOT NULL DEFAULT 0,
  is_available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pickup_slots_time_order CHECK (ends_at > starts_at),
  CONSTRAINT pickup_slots_capacity_bounds CHECK (
    capacity >= 0 AND reserved_count >= 0 AND reserved_count <= capacity
  ),
  CONSTRAINT pickup_slots_window_uq UNIQUE (slot_date, starts_at, ends_at)
);

CREATE INDEX IF NOT EXISTS pickup_slots_date_idx ON public.pickup_slots (slot_date, is_available, starts_at);

-- ----------------------------------------------------------------------------
-- TABLE 9: serviceable_pincodes
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.serviceable_pincodes (
  pincode char(6) PRIMARY KEY,
  locality text NOT NULL,
  city text NOT NULL DEFAULT 'Vijayawada',
  district text NOT NULL DEFAULT 'Krishna',
  state text NOT NULL DEFAULT 'Andhra Pradesh',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS serviceable_pincodes_active_idx ON public.serviceable_pincodes (is_active);

-- ----------------------------------------------------------------------------
-- TABLE 10: bookings
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number text NOT NULL UNIQUE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id),
  address_id uuid REFERENCES public.addresses(id) ON DELETE SET NULL,
  pickup_slot_id uuid REFERENCES public.pickup_slots(id),
  status public.booking_status NOT NULL DEFAULT 'pending_confirmation',
  payment_status public.booking_payment_status NOT NULL DEFAULT 'not_required',
  scheduled_for timestamptz,
  customer_note text,
  pickup_contact_name text NOT NULL,
  pickup_contact_phone_e164 text NOT NULL,
  pickup_address_line1 text NOT NULL,
  pickup_address_line2 text,
  pickup_landmark text,
  pickup_locality text,
  pickup_city text NOT NULL,
  pickup_district text,
  pickup_state text NOT NULL,
  pickup_postal_code text NOT NULL,
  pickup_country_code char(2) NOT NULL DEFAULT 'IN',
  estimated_subtotal numeric(12,2) NOT NULL DEFAULT 0,
  final_subtotal numeric(12,2),
  currency char(3) NOT NULL DEFAULT 'INR',
  cancellation_reason text,
  cancelled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  CONSTRAINT bookings_est_subtotal_pos CHECK (estimated_subtotal >= 0),
  CONSTRAINT bookings_fin_subtotal_pos CHECK (final_subtotal IS NULL OR final_subtotal >= 0)
);

CREATE INDEX IF NOT EXISTS bookings_profile_created_idx ON public.bookings (profile_id, created_at DESC);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON public.bookings (status, created_at DESC);

-- ----------------------------------------------------------------------------
-- TABLE 11: booking_items
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.booking_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  scrap_item_id uuid REFERENCES public.scrap_items(id),
  item_name_snapshot text NOT NULL,
  unit_snapshot public.quantity_unit NOT NULL,
  rate_per_unit_snapshot numeric(12,2) NOT NULL,
  estimated_quantity numeric(12,3) NOT NULL,
  final_quantity numeric(12,3),
  estimated_amount numeric(12,2) NOT NULL,
  final_amount numeric(12,2),
  customer_item_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT booking_items_rate_pos CHECK (rate_per_unit_snapshot >= 0),
  CONSTRAINT booking_items_est_qty_pos CHECK (estimated_quantity > 0),
  CONSTRAINT booking_items_fin_qty_pos CHECK (final_quantity IS NULL OR final_quantity >= 0),
  CONSTRAINT booking_items_est_amt_pos CHECK (estimated_amount >= 0),
  CONSTRAINT booking_items_fin_amt_pos CHECK (final_amount IS NULL OR final_amount >= 0)
);

CREATE INDEX IF NOT EXISTS booking_items_booking_idx ON public.booking_items (booking_id);

-- ----------------------------------------------------------------------------
-- TABLE 12: booking_status_history
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.booking_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  from_status public.booking_status,
  to_status public.booking_status NOT NULL,
  changed_by_profile_id uuid REFERENCES public.profiles(id),
  changed_by_role text NOT NULL DEFAULT 'system',
  customer_visible_note text,
  internal_note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS booking_history_timeline_idx ON public.booking_status_history (booking_id, created_at DESC);

-- ----------------------------------------------------------------------------
-- TABLE 13: sell_requests
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sell_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number text NOT NULL UNIQUE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id),
  address_id uuid REFERENCES public.addresses(id) ON DELETE SET NULL,
  status public.sell_request_status NOT NULL DEFAULT 'submitted',
  item_title text NOT NULL,
  item_description text,
  category_id uuid REFERENCES public.scrap_categories(id),
  estimated_quantity numeric(12,3),
  unit public.quantity_unit,
  item_condition text,
  preferred_pickup_date date,
  customer_note text,
  pickup_contact_name text NOT NULL,
  pickup_contact_phone_e164 text NOT NULL,
  pickup_address_line1 text NOT NULL,
  pickup_address_line2 text,
  pickup_landmark text,
  pickup_locality text,
  pickup_city text NOT NULL,
  pickup_state text NOT NULL,
  pickup_postal_code text NOT NULL,
  pickup_country_code char(2) NOT NULL DEFAULT 'IN',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS sell_requests_profile_idx ON public.sell_requests (profile_id, created_at DESC);
CREATE INDEX IF NOT EXISTS sell_requests_status_idx ON public.sell_requests (status, created_at DESC);

-- ----------------------------------------------------------------------------
-- TABLE 14: sell_request_images
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sell_request_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sell_request_id uuid NOT NULL REFERENCES public.sell_requests(id) ON DELETE CASCADE,
  storage_bucket text NOT NULL DEFAULT 'sell-request-images',
  storage_path text NOT NULL UNIQUE,
  original_file_name text,
  content_type text NOT NULL,
  file_size_bytes bigint NOT NULL,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sell_request_image_size CHECK (file_size_bytes BETWEEN 1 AND 10485760),
  CONSTRAINT sell_request_image_mime CHECK (content_type IN ('image/jpeg', 'image/png', 'image/webp'))
);

CREATE INDEX IF NOT EXISTS sell_request_images_request_idx ON public.sell_request_images (sell_request_id);

-- ----------------------------------------------------------------------------
-- TABLE 15: quotations
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_number text NOT NULL UNIQUE,
  sell_request_id uuid NOT NULL REFERENCES public.sell_requests(id),
  profile_id uuid NOT NULL REFERENCES public.profiles(id),
  status public.quotation_status NOT NULL DEFAULT 'draft',
  offered_amount numeric(12,2) NOT NULL,
  currency char(3) NOT NULL DEFAULT 'INR',
  offer_notes text,
  valid_until timestamptz NOT NULL,
  sent_at timestamptz,
  responded_at timestamptz,
  response_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT quotations_offered_amt_pos CHECK (offered_amount >= 0),
  CONSTRAINT quotations_valid_period CHECK (valid_until > created_at)
);

CREATE INDEX IF NOT EXISTS quotations_profile_idx ON public.quotations (profile_id, created_at DESC);
CREATE INDEX IF NOT EXISTS quotations_request_idx ON public.quotations (sell_request_id);

-- ----------------------------------------------------------------------------
-- TABLE 16: payments
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_number text NOT NULL UNIQUE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id),
  booking_id uuid REFERENCES public.bookings(id),
  quotation_id uuid REFERENCES public.quotations(id),
  amount numeric(12,2) NOT NULL,
  currency char(3) NOT NULL DEFAULT 'INR',
  method public.payment_method NOT NULL,
  status public.payment_status NOT NULL DEFAULT 'created',
  provider_name text,
  provider_order_id text,
  provider_payment_id text,
  provider_signature_verified boolean NOT NULL DEFAULT false,
  idempotency_key text UNIQUE,
  failure_code text,
  failure_message text,
  paid_at timestamptz,
  refunded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT payments_positive_amount CHECK (amount > 0),
  CONSTRAINT payments_target_xor CHECK (
    (booking_id IS NOT NULL AND quotation_id IS NULL) OR
    (booking_id IS NULL AND quotation_id IS NOT NULL)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS payments_provider_ref_uq ON public.payments (provider_name, provider_payment_id)
  WHERE provider_payment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS payments_profile_idx ON public.payments (profile_id, created_at DESC);

-- ----------------------------------------------------------------------------
-- TABLE 17: notifications
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  notification_type text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  deep_link text,
  related_booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  related_sell_request_id uuid REFERENCES public.sell_requests(id) ON DELETE SET NULL,
  related_quotation_id uuid REFERENCES public.quotations(id) ON DELETE SET NULL,
  is_read boolean NOT NULL DEFAULT false,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_profile_idx ON public.notifications (profile_id, created_at DESC);

-- ----------------------------------------------------------------------------
-- TABLE 18: support_requests
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.support_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number text NOT NULL UNIQUE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id),
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS support_profile_idx ON public.support_requests (profile_id, created_at DESC);

-- ----------------------------------------------------------------------------
-- TABLE 19: audit_logs
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_profile_id uuid REFERENCES public.profiles(id),
  actor_type text NOT NULL DEFAULT 'customer',
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  request_id text,
  ip_hash text,
  user_agent text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_entity_idx ON public.audit_logs (entity_type, entity_id, created_at DESC);


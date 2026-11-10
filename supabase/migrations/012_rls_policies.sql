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

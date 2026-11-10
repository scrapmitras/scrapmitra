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

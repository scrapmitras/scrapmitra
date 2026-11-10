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

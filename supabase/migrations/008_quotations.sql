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

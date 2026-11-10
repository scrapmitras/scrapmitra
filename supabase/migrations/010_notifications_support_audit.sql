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

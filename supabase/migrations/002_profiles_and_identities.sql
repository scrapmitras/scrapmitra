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

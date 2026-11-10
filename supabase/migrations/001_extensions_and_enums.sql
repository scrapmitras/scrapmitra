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

export type IdentityProvider = 'firebase_phone' | 'supabase_email'

export type AddressType = 'home' | 'work' | 'shop' | 'other'

export type QuantityUnit = 'kg' | 'piece' | 'lot' | 'gram'

export type BookingStatus =
  | 'draft'
  | 'pending_confirmation'
  | 'confirmed'
  | 'assigned'
  | 'pickup_started'
  | 'collected'
  | 'weighing_pending'
  | 'completed'
  | 'cancelled'
  | 'rejected'

export type BookingPaymentStatus =
  | 'not_required'
  | 'pending'
  | 'processing'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'partially_refunded'

export type SellRequestStatus =
  | 'submitted'
  | 'under_review'
  | 'quotation_sent'
  | 'accepted'
  | 'rejected'
  | 'pickup_scheduled'
  | 'collected'
  | 'completed'
  | 'cancelled'

export type QuotationStatus =
  | 'draft'
  | 'sent'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'withdrawn'

export type PaymentStatus =
  | 'created'
  | 'pending'
  | 'success'
  | 'failed'
  | 'refunded'
  | 'partially_refunded'

export type PaymentMethod =
  | 'cash'
  | 'upi'
  | 'bank_transfer'
  | 'online_gateway'
  | 'other'

export interface Profile {
  id: string
  display_name: string | null
  email: string | null
  phone_e164: string | null
  avatar_path: string | null
  preferred_language: string
  is_phone_verified: boolean
  is_email_verified: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Address {
  id: string
  profile_id: string
  label: string
  address_type: AddressType
  contact_name: string | null
  contact_phone_e164: string | null
  address_line1: string
  address_line2: string | null
  landmark: string | null
  locality: string | null
  city: string
  district: string | null
  state: string
  postal_code: string
  country_code: string
  latitude: number | null
  longitude: number | null
  delivery_instructions: string | null
  is_default: boolean
  is_active: boolean
}

export interface ScrapCategory {
  id: string
  name: string
  slug: string
  description: string | null
  image_path: string | null
  display_order: number
  is_active: boolean
}

export interface ScrapItem {
  id: string
  category_id: string
  name: string
  slug: string
  description: string | null
  image_path: string | null
  unit: QuantityUnit
  min_quantity: number
  quantity_step: number
  requires_inspection: boolean
  is_large_item: boolean
  display_order: number
  is_active: boolean
  current_rate?: ScrapRate
}

export interface ScrapRate {
  id: string
  scrap_item_id: string
  rate_per_unit: number
  currency: string
  is_indicative: boolean
  effective_from: string
  effective_to: string | null
  is_published: boolean
}

export interface PickupSlot {
  id: string
  slot_date: string
  starts_at: string
  ends_at: string
  capacity: number
  reserved_count: number
  is_available: boolean
}

export interface Booking {
  id: string
  booking_number: string
  profile_id: string
  address_id: string | null
  pickup_slot_id: string | null
  status: BookingStatus
  payment_status: BookingPaymentStatus
  scheduled_for: string | null
  customer_note: string | null
  pickup_contact_name: string
  pickup_contact_phone_e164: string
  pickup_address_line1: string
  pickup_address_line2: string | null
  pickup_landmark: string | null
  pickup_locality: string | null
  pickup_city: string
  pickup_district: string | null
  pickup_state: string
  pickup_postal_code: string
  pickup_country_code: string
  estimated_subtotal: number
  final_subtotal: number | null
  currency: string
  cancellation_reason: string | null
  cancelled_at: string | null
  created_at: string
  updated_at: string
  completed_at: string | null
  items?: BookingItem[]
}

export interface BookingItem {
  id: string
  booking_id: string
  scrap_item_id: string | null
  item_name_snapshot: string
  unit_snapshot: QuantityUnit
  rate_per_unit_snapshot: number
  estimated_quantity: number
  final_quantity: number | null
  estimated_amount: number
  final_amount: number | null
  customer_item_note: string | null
}

export interface BookingStatusHistory {
  id: string
  booking_id: string
  from_status: BookingStatus | null
  to_status: BookingStatus
  changed_by_profile_id: string | null
  changed_by_role: string
  customer_visible_note: string | null
  internal_note: string | null
  created_at: string
}

export interface SellRequest {
  id: string
  request_number: string
  profile_id: string
  address_id: string | null
  status: SellRequestStatus
  item_title: string
  item_description: string | null
  category_id: string | null
  estimated_quantity: number | null
  unit: QuantityUnit | null
  item_condition: string | null
  preferred_pickup_date: string | null
  customer_note: string | null
  pickup_contact_name: string
  pickup_contact_phone_e164: string
  pickup_address_line1: string
  pickup_address_line2: string | null
  pickup_landmark: string | null
  pickup_locality: string | null
  pickup_city: string
  pickup_state: string
  pickup_postal_code: string
  pickup_country_code: string
  created_at: string
  updated_at: string
  completed_at: string | null
  images?: SellRequestImage[]
  quotation?: Quotation
}

export interface SellRequestImage {
  id: string
  sell_request_id: string
  storage_bucket: string
  storage_path: string
  original_file_name: string | null
  content_type: string
  file_size_bytes: number
  uploaded_at: string
}

export interface Quotation {
  id: string
  quotation_number: string
  sell_request_id: string
  profile_id: string
  status: QuotationStatus
  offered_amount: number
  currency: string
  offer_notes: string | null
  valid_until: string
  sent_at: string | null
  responded_at: string | null
  response_note: string | null
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  payment_number: string
  profile_id: string
  booking_id: string | null
  quotation_id: string | null
  amount: number
  currency: string
  method: PaymentMethod
  status: PaymentStatus
  provider_name: string | null
  provider_order_id: string | null
  provider_payment_id: string | null
  provider_signature_verified: boolean
  paid_at: string | null
  created_at: string
}

export interface NotificationItem {
  id: string
  profile_id: string
  notification_type: string
  title: string
  body: string
  deep_link: string | null
  related_booking_id: string | null
  related_sell_request_id: string | null
  related_quotation_id: string | null
  is_read: boolean
  read_at: string | null
  created_at: string
}

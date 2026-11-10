-- ============================================================================
-- SCRAP MITRA: SAMPLE SEED DATA FOR ALL 19 TABLES (STRICT RFC-4122 HEX UUIDs)
-- Description: Realistic test records with valid hexadecimal PostgreSQL UUIDs
-- How to run:
-- 1. Open Supabase SQL Editor: https://supabase.com/dashboard/project/caaivmxrksnrarknvanj/sql/new
-- 2. Paste this entire file and click "RUN" (Ctrl + Enter)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. PROFILES (Customers & Admins)
-- ----------------------------------------------------------------------------
INSERT INTO public.profiles (id, display_name, email, phone_e164, preferred_language, is_phone_verified, is_email_verified, is_active)
VALUES
  ('11111111-1111-1111-1111-111111111101', 'Ramesh Sharma', 'ramesh.sharma@example.com', '+919848022338', 'te', true, true, true),
  ('11111111-1111-1111-1111-111111111102', 'Priya Varma', 'priya.varma@example.com', '+919876543210', 'en', true, false, true),
  ('11111111-1111-1111-1111-111111111103', 'Scrap Mitra Admin', 'admin@scrapmitra.com', '+918662459999', 'en', true, true, true)
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  phone_e164 = EXCLUDED.phone_e164;

-- ----------------------------------------------------------------------------
-- 2. USER IDENTITIES (Auth Linkage)
-- ----------------------------------------------------------------------------
INSERT INTO public.user_identities (id, profile_id, provider, provider_subject, provider_phone_e164, is_verified)
VALUES
  ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111101', 'firebase_phone', 'fb-uid-ramesh-9848022338', '+919848022338', true),
  ('11111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111102', 'firebase_phone', 'fb-uid-priya-9876543210', '+919876543210', true),
  ('11111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111103', 'supabase_email', 'sb-uid-admin-operator', NULL, true)
ON CONFLICT (provider, provider_subject) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 3. ADDRESSES (Customer Locations in Vijayawada)
-- ----------------------------------------------------------------------------
INSERT INTO public.addresses (id, profile_id, label, address_type, contact_name, contact_phone_e164, address_line1, address_line2, landmark, locality, city, district, state, postal_code, latitude, longitude, is_default, is_active)
VALUES
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101', 'Home', 'home', 'Ramesh Sharma', '+919848022338', 'Flat 402, Sri Krishna Heights', 'Bandar Road', 'Near Benz Circle Flyover', 'Patamata', 'Vijayawada', 'Krishna', 'Andhra Pradesh', '520010', 16.506174, 80.648015, true, true),
  ('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111102', 'Clinic / Office', 'work', 'Dr. Priya Varma', '+919876543210', 'Plot 12, Road No 3', 'Besant Road', 'Opposite Raj Towers', 'Governorpet', 'Vijayawada', 'Krishna', 'Andhra Pradesh', '520002', 16.513220, 80.627340, true, true)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 4. SERVICEABLE PINCODES (Operational Coverage)
-- ----------------------------------------------------------------------------
INSERT INTO public.serviceable_pincodes (pincode, locality, city, district, state, is_active)
VALUES
  ('520001', 'One Town / Kaleswara Rao Market', 'Vijayawada', 'Krishna', 'Andhra Pradesh', true),
  ('520002', 'Governorpet / Besant Road', 'Vijayawada', 'Krishna', 'Andhra Pradesh', true),
  ('520003', 'Gandhi Nagar / Satyanarayanapuram', 'Vijayawada', 'Krishna', 'Andhra Pradesh', true),
  ('520004', 'Machavaram / Gunadala', 'Vijayawada', 'Krishna', 'Andhra Pradesh', true),
  ('520007', 'Auto Nagar / Industrial Estate', 'Vijayawada', 'Krishna', 'Andhra Pradesh', true),
  ('520010', 'Benz Circle / Patamata', 'Vijayawada', 'Krishna', 'Andhra Pradesh', true)
ON CONFLICT (pincode) DO UPDATE SET is_active = EXCLUDED.is_active;

-- ----------------------------------------------------------------------------
-- 5. SCRAP CATEGORIES
-- ----------------------------------------------------------------------------
INSERT INTO public.scrap_categories (id, name, slug, description, display_order, is_active)
VALUES
  ('33333333-3333-3333-3333-333333333301', 'Paper & Cardboard', 'paper', 'Newspapers, books, magazines, cartons', 1, true),
  ('33333333-3333-3333-3333-333333333302', 'Plastics', 'plastic', 'PET water bottles, hard containers, HDPE cans', 2, true),
  ('33333333-3333-3333-3333-333333333303', 'Ferrous Metals (Iron & Steel)', 'ferrous-metals', 'Iron rods, grill gates, sheet metal, tin cans', 3, true),
  ('33333333-3333-3333-3333-333333333304', 'Non-Ferrous Metals', 'non-ferrous-metals', 'Copper wire, brass utensils, aluminium sections', 4, true),
  ('33333333-3333-3333-3333-333333333305', 'E-Waste & Electronics', 'e-waste', 'Old computers, CPUs, boards, and electronic gadgets', 5, true),
  ('33333333-3333-3333-3333-333333333306', 'Appliances', 'appliances', 'Refrigerators, washing machines, microwaves', 6, true)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- ----------------------------------------------------------------------------
-- 6. SCRAP ITEMS
-- ----------------------------------------------------------------------------
INSERT INTO public.scrap_items (id, category_id, name, slug, description, unit, min_quantity, quantity_step, requires_inspection, is_large_item, display_order, is_active)
VALUES
  ('44444444-4444-4444-4444-444444444401', '33333333-3333-3333-3333-333333333301', 'Newspaper', 'newspaper', 'Daily English & Telugu newspapers', 'kg', 1.0, 0.5, false, false, 1, true),
  ('44444444-4444-4444-4444-444444444402', '33333333-3333-3333-3333-333333333301', 'Cardboard Boxes', 'cardboard', 'Corrugated brown shipping boxes', 'kg', 1.0, 0.5, false, false, 2, true),
  ('44444444-4444-4444-4444-444444444403', '33333333-3333-3333-3333-333333333302', 'Plastic Bottles (PET)', 'plastic-bottles-pet', 'Clean water and drink bottles', 'kg', 0.5, 0.5, false, false, 3, true),
  ('44444444-4444-4444-4444-444444444404', '33333333-3333-3333-3333-333333333303', 'Heavy Iron Scrap', 'iron-scrap-heavy', 'Construction rebar, iron gates, steel beams', 'kg', 5.0, 1.0, false, false, 4, true),
  ('44444444-4444-4444-4444-444444444405', '33333333-3333-3333-3333-333333333304', 'Copper Wires', 'copper-wires', 'Electrical wire, peeled or coated', 'kg', 0.5, 0.1, false, false, 5, true),
  ('44444444-4444-4444-4444-444444444406', '33333333-3333-3333-3333-333333333306', 'Old Refrigerator', 'old-refrigerator', 'Single/double door refrigerator', 'piece', 1.0, 1.0, true, true, 6, true)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, unit = EXCLUDED.unit;

-- ----------------------------------------------------------------------------
-- 7. SCRAP RATES (Current Prices in INR)
-- ----------------------------------------------------------------------------
INSERT INTO public.scrap_rates (id, scrap_item_id, rate_per_unit, currency, is_indicative, is_published, effective_from)
VALUES
  ('55555555-5555-5555-5555-555555555501', '44444444-4444-4444-4444-444444444401', 14.00, 'INR', true, true, now() - interval '5 days'),
  ('55555555-5555-5555-5555-555555555502', '44444444-4444-4444-4444-444444444402', 12.00, 'INR', true, true, now() - interval '5 days'),
  ('55555555-5555-5555-5555-555555555503', '44444444-4444-4444-4444-444444444403', 10.00, 'INR', true, true, now() - interval '5 days'),
  ('55555555-5555-5555-5555-555555555504', '44444444-4444-4444-4444-444444444404', 28.00, 'INR', true, true, now() - interval '5 days'),
  ('55555555-5555-5555-5555-555555555505', '44444444-4444-4444-4444-444444444405', 520.00, 'INR', true, true, now() - interval '5 days'),
  ('55555555-5555-5555-5555-555555555506', '44444444-4444-4444-4444-444444444406', 800.00, 'INR', true, true, now() - interval '5 days')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 8. RATE HISTORY (Audit Trail)
-- ----------------------------------------------------------------------------
INSERT INTO public.rate_history (id, scrap_rate_id, scrap_item_id, old_rate, new_rate, changed_by, change_reason, changed_at)
VALUES
  ('55555555-5555-5555-5555-555555555599', '55555555-5555-5555-5555-555555555504', '44444444-4444-4444-4444-444444444404', 26.00, 28.00, '11111111-1111-1111-1111-111111111103', 'Market commodity index revision in Vijayawada mandi', now() - interval '5 days')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 9. PICKUP SLOTS (Upcoming Slots)
-- ----------------------------------------------------------------------------
INSERT INTO public.pickup_slots (id, slot_date, starts_at, ends_at, capacity, reserved_count, is_available)
VALUES
  ('66666666-6666-6666-6666-666666666601', current_date + 1, '09:00:00'::time, '12:00:00'::time, 10, 1, true),
  ('66666666-6666-6666-6666-666666666602', current_date + 1, '12:00:00'::time, '15:00:00'::time, 10, 0, true),
  ('66666666-6666-6666-6666-666666666603', current_date + 1, '15:00:00'::time, '18:00:00'::time, 10, 0, true)
ON CONFLICT (slot_date, starts_at, ends_at) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 10. BOOKINGS (Customer Orders)
-- ----------------------------------------------------------------------------
INSERT INTO public.bookings (
  id, booking_number, profile_id, address_id, pickup_slot_id, status, payment_status,
  scheduled_for, customer_note, pickup_contact_name, pickup_contact_phone_e164,
  pickup_address_line1, pickup_address_line2, pickup_landmark, pickup_locality,
  pickup_city, pickup_district, pickup_state, pickup_postal_code, pickup_country_code,
  estimated_subtotal, currency, created_at
)
VALUES (
  '77777777-7777-7777-7777-777777777701', 'SM-2026-000101', '11111111-1111-1111-1111-111111111101',
  '22222222-2222-2222-2222-222222222201', '66666666-6666-6666-6666-666666666601',
  'confirmed', 'pending',
  (current_date + 1)::timestamptz + interval '10 hours', 'Please call before arriving, building has lift.',
  'Ramesh Sharma', '+919848022338',
  'Flat 402, Sri Krishna Heights', 'Bandar Road', 'Near Benz Circle Flyover', 'Patamata',
  'Vijayawada', 'Krishna', 'Andhra Pradesh', '520010', 'IN',
  460.00, 'INR', now() - interval '2 hours'
)
ON CONFLICT (booking_number) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 11. BOOKING ITEMS (Items to Weigh)
-- ----------------------------------------------------------------------------
INSERT INTO public.booking_items (
  id, booking_id, scrap_item_id, item_name_snapshot, unit_snapshot, rate_per_unit_snapshot,
  estimated_quantity, estimated_amount, customer_item_note
)
VALUES
  ('77777777-7777-7777-7777-777777777711', '77777777-7777-7777-7777-777777777701', '44444444-4444-4444-4444-444444444401', 'Newspaper', 'kg', 14.00, 15.0, 210.00, 'Tied in 2 bundles'),
  ('77777777-7777-7777-7777-777777777712', '77777777-7777-7777-7777-777777777701', '44444444-4444-4444-4444-444444444404', 'Heavy Iron Scrap', 'kg', 28.00, 8.5, 238.00, 'Old balcony flower rack and pipes')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 12. BOOKING STATUS HISTORY (Timeline)
-- ----------------------------------------------------------------------------
INSERT INTO public.booking_status_history (id, booking_id, from_status, to_status, changed_by_profile_id, changed_by_role, customer_visible_note)
VALUES
  ('77777777-7777-7777-7777-777777777721', '77777777-7777-7777-7777-777777777701', 'draft', 'pending_confirmation', '11111111-1111-1111-1111-111111111101', 'customer', 'Booking request placed by customer'),
  ('77777777-7777-7777-7777-777777777722', '77777777-7777-7777-7777-777777777701', 'pending_confirmation', 'confirmed', '11111111-1111-1111-1111-111111111103', 'operator', 'Pickup slot assigned to partner van #AP16-TC-4589')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 13. SELL REQUESTS (Custom / Bulk Scrap Valuation)
-- ----------------------------------------------------------------------------
INSERT INTO public.sell_requests (
  id, request_number, profile_id, address_id, status, item_title, item_description,
  category_id, estimated_quantity, unit, item_condition, preferred_pickup_date,
  pickup_contact_name, pickup_contact_phone_e164, pickup_address_line1,
  pickup_locality, pickup_city, pickup_state, pickup_postal_code
)
VALUES (
  '88888888-8888-8888-8888-888888888801', 'SR-2026-000201', '11111111-1111-1111-1111-111111111102',
  '22222222-2222-2222-2222-222222222202', 'quotation_sent', 'Whirlpool Double-Door 240L Refrigerator',
  'Compressor not functioning, metal body intact with minor scratches. Includes glass shelves.',
  '33333333-3333-3333-3333-333333333306', 1.0, 'piece', 'Non-working / intact parts', current_date + 2,
  'Dr. Priya Varma', '+919876543210', 'Plot 12, Road No 3',
  'Governorpet', 'Vijayawada', 'Andhra Pradesh', '520002'
)
ON CONFLICT (request_number) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 14. SELL REQUEST IMAGES
-- ----------------------------------------------------------------------------
INSERT INTO public.sell_request_images (id, sell_request_id, storage_bucket, storage_path, original_file_name, content_type, file_size_bytes)
VALUES
  ('88888888-8888-8888-8888-888888888811', '88888888-8888-8888-8888-888888888801', 'sell-request-images', 'sr-2026-000201/fridge_front.jpg', 'fridge_front.jpg', 'image/jpeg', 245000),
  ('88888888-8888-8888-8888-888888888812', '88888888-8888-8888-8888-888888888801', 'sell-request-images', 'sr-2026-000201/fridge_back_motor.jpg', 'fridge_back_motor.jpg', 'image/jpeg', 312000)
ON CONFLICT (storage_path) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 15. QUOTATIONS (Official Price Offers)
-- ----------------------------------------------------------------------------
INSERT INTO public.quotations (
  id, quotation_number, sell_request_id, profile_id, status, offered_amount,
  currency, offer_notes, valid_until, sent_at
)
VALUES (
  '99999999-9999-9999-9999-999999999901', 'QT-2026-000301', '88888888-8888-8888-8888-888888888801',
  '11111111-1111-1111-1111-111111111102', 'sent', 1250.00,
  'INR', 'Offer includes free doorstep technician dismantling and heavy loading.',
  now() + interval '3 days', now() - interval '1 hour'
)
ON CONFLICT (quotation_number) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 16. PAYMENTS (Doorstep Payout Records)
-- ----------------------------------------------------------------------------
INSERT INTO public.payments (
  id, payment_number, profile_id, booking_id, amount, currency, method, status,
  provider_name, provider_payment_id, provider_signature_verified, paid_at
)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'PAY-2026-000401', '11111111-1111-1111-1111-111111111101',
  '77777777-7777-7777-7777-777777777701', 460.00, 'INR', 'upi', 'success',
  'razorpay_upi', 'pay_vja_9848022338_live', true, now() - interval '30 minutes'
)
ON CONFLICT (payment_number) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 17. NOTIFICATIONS (Customer In-App Alerts)
-- ----------------------------------------------------------------------------
INSERT INTO public.notifications (
  id, profile_id, notification_type, title, body, deep_link, related_booking_id, is_read
)
VALUES
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', '11111111-1111-1111-1111-111111111101',
    'booking_confirmed', 'Pickup Confirmed! 🚚',
    'Your scrap pickup has been scheduled for tomorrow between 09:00 AM - 12:00 PM.',
    '/bookings/SM-2026-000101', '77777777-7777-7777-7777-777777777701', false
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', '11111111-1111-1111-1111-111111111102',
    'quotation_received', 'Quotation Ready for Your Refrigerator 📄',
    'Our team offered ₹1,250 for your Whirlpool refrigerator. Valid for 3 days.',
    '/quotations/QT-2026-000301', NULL, false
  )
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 18. SUPPORT REQUESTS (Customer Inquiries & Help Tickets)
-- ----------------------------------------------------------------------------
INSERT INTO public.support_requests (
  id, ticket_number, profile_id, booking_id, subject, message, status, created_at
)
VALUES
  (
    'cccccccc-cccc-cccc-cccc-cccccccccc01', 'TKT-2026-000501',
    '11111111-1111-1111-1111-111111111101', '77777777-7777-7777-7777-777777777701',
    'Requesting digital scale calibration check',
    'Hi Scrap Mitra, please ask the collector to carry the certified digital scale as I have high-grade copper scrap.',
    'open', now() - interval '4 hours'
  )
ON CONFLICT (ticket_number) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 19. AUDIT LOGS (Security & Audit Trail)
-- ----------------------------------------------------------------------------
INSERT INTO public.audit_logs (
  id, actor_profile_id, actor_type, action, entity_type, entity_id, metadata, created_at
)
VALUES
  (
    'dddddddd-dddd-dddd-dddd-dddddddddd01', '11111111-1111-1111-1111-111111111103',
    'admin', 'QUOTATION_ISSUED', 'quotation', '99999999-9999-9999-9999-999999999901',
    '{"quotation_number": "QT-2026-000301", "amount": 1250, "channel": "admin_dashboard"}'::jsonb,
    now() - interval '1 hour'
  )
ON CONFLICT (id) DO NOTHING;

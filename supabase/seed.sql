-- ============================================================================
-- Seed Data: supabase/seed.sql
-- Description: Production-aligned seed data for Vijayawada launch
-- Includes: Categories, Items, Daily Indicative Rates, Pincodes, and Pickup Slots
-- ============================================================================

-- 1. Serviceable Pincodes in Vijayawada (Krishna District, AP)
insert into public.serviceable_pincodes (pincode, locality, city, district, state, is_active)
values
  ('520001', 'One Town / Kaleswara Rao Market', 'Vijayawada', 'Krishna', 'Andhra Pradesh', true),
  ('520002', 'Governorpet / Besant Road', 'Vijayawada', 'Krishna', 'Andhra Pradesh', true),
  ('520003', 'Gandhi Nagar / Satyanarayanapuram', 'Vijayawada', 'Krishna', 'Andhra Pradesh', true),
  ('520004', 'Machavaram / Gunadala', 'Vijayawada', 'Krishna', 'Andhra Pradesh', true),
  ('520007', 'Auto Nagar / Industrial Estate', 'Vijayawada', 'Krishna', 'Andhra Pradesh', true),
  ('520008', 'Gunadala / Ramavarappadu', 'Vijayawada', 'Krishna', 'Andhra Pradesh', true),
  ('520010', 'Benz Circle / Patamata', 'Vijayawada', 'Krishna', 'Andhra Pradesh', true),
  ('520012', 'Bhavanipuram / Vidyadharapuram', 'Vijayawada', 'Krishna', 'Andhra Pradesh', true)
on conflict (pincode) do update set is_active = excluded.is_active;

-- 2. Material Categories
insert into public.scrap_categories (id, name, slug, description, display_order, is_active)
values
  ('c0000001-0000-0000-0000-000000000001', 'Paper & Cardboard', 'paper', 'Old newspapers, magazines, cartons, and office records', 1, true),
  ('c0000001-0000-0000-0000-000000000002', 'Plastics', 'plastic', 'PET bottles, milk pouches, hard containers, and PVC scrap', 2, true),
  ('c0000001-0000-0000-0000-000000000003', 'Ferrous Metals (Iron & Steel)', 'ferrous-metals', 'Iron rods, scrap sheets, tin cans, grills, and construction steel', 3, true),
  ('c0000001-0000-0000-0000-000000000004', 'Non-Ferrous Metals', 'non-ferrous-metals', 'Copper wire, brass utensils, aluminium cans, and lead batteries', 4, true),
  ('c0000001-0000-0000-0000-000000000005', 'E-Waste & Electronics', 'e-waste', 'Old laptops, motherboards, mobile phones, and computer wiring', 5, true),
  ('c0000001-0000-0000-0000-000000000006', 'Appliances', 'appliances', 'Refrigerators, washing machines, microwaves, and air conditioners', 6, true),
  ('c0000001-0000-0000-0000-000000000007', 'Bulky & Commercial', 'bulky-items', 'Furniture, machinery, vehicles, and commercial mixed scrap lots', 7, true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  display_order = excluded.display_order;

-- 3. Scrap Items Catalog
insert into public.scrap_items (id, category_id, name, slug, description, unit, min_quantity, quantity_step, requires_inspection, is_large_item, display_order, is_active)
values
  -- Paper
  ('i0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'Newspaper', 'newspaper', 'Clean, dry daily newspapers (English & Telugu)', 'kg', 1.0, 0.5, false, false, 1, true),
  ('i0000001-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000001', 'Cardboard / Cartons', 'cardboard', 'Corrugated brown shipping boxes and cartons', 'kg', 1.0, 0.5, false, false, 2, true),
  ('i0000001-0000-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000001', 'Office White Paper', 'office-white-paper', 'Shredded or intact printer and notebook white paper', 'kg', 1.0, 0.5, false, false, 3, true),
  ('i0000001-0000-0000-0000-000000000004', 'c0000001-0000-0000-0000-000000000001', 'Books & Magazines', 'books-magazines', 'Old textbooks, novel books, and glossy magazines', 'kg', 1.0, 0.5, false, false, 4, true),

  -- Plastics
  ('i0000001-0000-0000-0000-000000000005', 'c0000001-0000-0000-0000-000000000002', 'Plastic Bottles (PET)', 'plastic-bottles-pet', 'Clear drinking water and soft drink plastic bottles', 'kg', 0.5, 0.5, false, false, 5, true),
  ('i0000001-0000-0000-0000-000000000006', 'c0000001-0000-0000-0000-000000000002', 'Hard Plastic Containers', 'hard-plastic-containers', 'Buckets, mugs, storage containers, HDPE crates', 'kg', 1.0, 0.5, false, false, 6, true),

  -- Ferrous Metals
  ('i0000001-0000-0000-0000-000000000007', 'c0000001-0000-0000-0000-000000000003', 'Iron Scrap (Heavy)', 'iron-scrap-heavy', 'Cast iron, rebar, steel beams, gates, and iron sheets', 'kg', 5.0, 1.0, false, false, 7, true),
  ('i0000001-0000-0000-0000-000000000008', 'c0000001-0000-0000-0000-000000000003', 'Tin Cans & Light Iron', 'tin-cans-light-iron', 'Food oil tins, beverage tins, and thin metal sheets', 'kg', 1.0, 0.5, false, false, 8, true),

  -- Non-Ferrous Metals
  ('i0000001-0000-0000-0000-000000000009', 'c0000001-0000-0000-0000-000000000004', 'Copper Wires', 'copper-wires', 'Electrical copper wire, peeled or insulated', 'kg', 0.5, 0.1, false, false, 9, true),
  ('i0000001-0000-0000-0000-000000000010', 'c0000001-0000-0000-0000-000000000004', 'Brass / Bronze', 'brass-bronze', 'Pooja brass utensils, plumbing valves, and fittings', 'kg', 0.5, 0.1, false, false, 10, true),
  ('i0000001-0000-0000-0000-000000000011', 'c0000001-0000-0000-0000-000000000004', 'Aluminium Scrap', 'aluminium-scrap', 'Aluminium utensils, door/window frame sections, cans', 'kg', 1.0, 0.5, false, false, 11, true),

  -- E-Waste
  ('i0000001-0000-0000-0000-000000000012', 'c0000001-0000-0000-0000-000000000005', 'E-Waste & Computer Scrap', 'e-waste-computer', 'CPUs, keyboards, circuit boards, routers, and cords', 'kg', 1.0, 0.5, false, false, 12, true),

  -- Appliances (Inspection / Quote Based)
  ('i0000001-0000-0000-0000-000000000013', 'c0000001-0000-0000-0000-000000000006', 'Old Refrigerator', 'old-refrigerator', 'Single/double door non-working refrigerators', 'piece', 1.0, 1.0, true, true, 13, true),
  ('i0000001-0000-0000-0000-000000000014', 'c0000001-0000-0000-0000-000000000006', 'Washing Machine', 'washing-machine', 'Front load or top load washing machines', 'piece', 1.0, 1.0, true, true, 14, true),

  -- Bulky
  ('i0000001-0000-0000-0000-000000000015', 'c0000001-0000-0000-0000-000000000007', 'Two Wheeler / Old Bike', 'old-bike', 'End of life motorcycles and scooters for scrap metal', 'piece', 1.0, 1.0, true, true, 15, true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  unit = excluded.unit,
  requires_inspection = excluded.requires_inspection,
  is_large_item = excluded.is_large_item;

-- 4. Initial Indicative Rates (per kg / piece in INR)
insert into public.scrap_rates (scrap_item_id, rate_per_unit, currency, is_indicative, is_published, effective_from)
values
  ('i0000001-0000-0000-0000-000000000001', 14.00, 'INR', true, true, now()),
  ('i0000001-0000-0000-0000-000000000002', 12.00, 'INR', true, true, now()),
  ('i0000001-0000-0000-0000-000000000003', 16.00, 'INR', true, true, now()),
  ('i0000001-0000-0000-0000-000000000004', 10.00, 'INR', true, true, now()),
  ('i0000001-0000-0000-0000-000000000005', 10.00, 'INR', true, true, now()),
  ('i0000001-0000-0000-0000-000000000006', 8.00, 'INR', true, true, now()),
  ('i0000001-0000-0000-0000-000000000007', 28.00, 'INR', true, true, now()),
  ('i0000001-0000-0000-0000-000000000008', 15.00, 'INR', true, true, now()),
  ('i0000001-0000-0000-0000-000000000009', 520.00, 'INR', true, true, now()),
  ('i0000001-0000-0000-0000-000000000010', 340.00, 'INR', true, true, now()),
  ('i0000001-0000-0000-0000-000000000011', 100.00, 'INR', true, true, now()),
  ('i0000001-0000-0000-0000-000000000012', 18.00, 'INR', true, true, now()),
  ('i0000001-0000-0000-0000-000000000013', 800.00, 'INR', true, true, now()),
  ('i0000001-0000-0000-0000-000000000014', 600.00, 'INR', true, true, now()),
  ('i0000001-0000-0000-0000-000000000015', 2500.00, 'INR', true, true, now());

-- 5. Pickup Slots for Upcoming 14 Days (Morning, Afternoon, Evening)
do $$
declare
  d date;
begin
  for i in 0..13 loop
    d := current_date + i;
    
    -- Morning Window: 09:00 - 12:00
    insert into public.pickup_slots (slot_date, starts_at, ends_at, capacity, reserved_count, is_available)
    values (d, '09:00:00'::time, '12:00:00'::time, 10, 0, true)
    on conflict (slot_date, starts_at, ends_at) do nothing;

    -- Afternoon Window: 12:00 - 15:00
    insert into public.pickup_slots (slot_date, starts_at, ends_at, capacity, reserved_count, is_available)
    values (d, '12:00:00'::time, '15:00:00'::time, 10, 0, true)
    on conflict (slot_date, starts_at, ends_at) do nothing;

    -- Evening Window: 15:00 - 18:00
    insert into public.pickup_slots (slot_date, starts_at, ends_at, capacity, reserved_count, is_available)
    values (d, '15:00:00'::time, '18:00:00'::time, 10, 0, true)
    on conflict (slot_date, starts_at, ends_at) do nothing;
  end loop;
end $$;

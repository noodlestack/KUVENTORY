-- seed.sql

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Roles
INSERT INTO roles (name, description) VALUES
('Administrator', 'Full system access'),
('Manager', 'Management access to inventory, sales, and reports'),
('Inventory Staff', 'Access to manage stock items, transfers, and daily inventory'),
('Cashier', 'Access to sales and cash monitoring'),
('Kitchen Staff', 'Access to view stock and request transfers'),
('Viewer', 'Read-only access to specific modules')
ON CONFLICT (name) DO NOTHING;

-- Development Users (ONLY FOR LOCAL DEVELOPMENT)
-- Admin
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES 
(
  '11111111-1111-1111-1111-111111111111', 
  '00000000-0000-0000-0000-000000000000', 
  'authenticated', 
  'authenticated', 
  'admin@kapeuno.com', 
  crypt('password', gen_salt('bf')), 
  now(), 
  '{"provider":"email","providers":["email"]}', 
  '{"full_name": "Admin User"}', 
  now(), 
  now()
) ON CONFLICT (id) DO NOTHING;

-- Cashier
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES 
(
  '22222222-2222-2222-2222-222222222222', 
  '00000000-0000-0000-0000-000000000000', 
  'authenticated', 
  'authenticated', 
  'cashier@kapeuno.com', 
  crypt('password', gen_salt('bf')), 
  now(), 
  '{"provider":"email","providers":["email"]}', 
  '{"full_name": "Cashier User"}', 
  now(), 
  now()
) ON CONFLICT (id) DO NOTHING;

-- Inventory Staff
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES 
(
  '33333333-3333-3333-3333-333333333333', 
  '00000000-0000-0000-0000-000000000000', 
  'authenticated', 
  'authenticated', 
  'inventory@kapeuno.com', 
  crypt('password', gen_salt('bf')), 
  now(), 
  '{"provider":"email","providers":["email"]}', 
  '{"full_name": "Inventory Staff User"}', 
  now(), 
  now()
) ON CONFLICT (id) DO NOTHING;

-- We rely on the trigger `handle_new_user` to create the `profiles`.
-- After profiles are created, we need to assign roles in `user_roles`.
-- Since profiles might have just been created by the trigger, we can fetch their IDs based on auth_user_id.

DO $$
DECLARE
  v_admin_profile_id UUID;
  v_cashier_profile_id UUID;
  v_inventory_profile_id UUID;
  
  v_admin_role_id UUID;
  v_cashier_role_id UUID;
  v_inventory_role_id UUID;
BEGIN
  -- Get profile IDs
  SELECT id INTO v_admin_profile_id FROM public.profiles WHERE auth_user_id = '11111111-1111-1111-1111-111111111111';
  SELECT id INTO v_cashier_profile_id FROM public.profiles WHERE auth_user_id = '22222222-2222-2222-2222-222222222222';
  SELECT id INTO v_inventory_profile_id FROM public.profiles WHERE auth_user_id = '33333333-3333-3333-3333-333333333333';
  
  -- Get role IDs
  SELECT id INTO v_admin_role_id FROM public.roles WHERE name = 'Administrator';
  SELECT id INTO v_cashier_role_id FROM public.roles WHERE name = 'Cashier';
  SELECT id INTO v_inventory_role_id FROM public.roles WHERE name = 'Inventory Staff';
  
  -- Assign roles (safely ignoring conflicts)
  IF v_admin_profile_id IS NOT NULL AND v_admin_role_id IS NOT NULL THEN
    INSERT INTO public.user_roles (profile_id, role_id) VALUES (v_admin_profile_id, v_admin_role_id) ON CONFLICT DO NOTHING;
  END IF;
  
  IF v_cashier_profile_id IS NOT NULL AND v_cashier_role_id IS NOT NULL THEN
    INSERT INTO public.user_roles (profile_id, role_id) VALUES (v_cashier_profile_id, v_cashier_role_id) ON CONFLICT DO NOTHING;
  END IF;
  
  IF v_inventory_profile_id IS NOT NULL AND v_inventory_role_id IS NOT NULL THEN
    INSERT INTO public.user_roles (profile_id, role_id) VALUES (v_inventory_profile_id, v_inventory_role_id) ON CONFLICT DO NOTHING;
  END IF;
END $$;


-- Categories
INSERT INTO categories (name, code, description) VALUES
('Grilled', 'CAT-GRILL', 'Grilled food items'),
('Portion', 'CAT-PORTION', 'Portioned items'),
('Beverage', 'CAT-BEV', 'Drinks and beverages'),
('Coffee', 'CAT-COF', 'Coffee products'),
('Rice Meals', 'CAT-RICE', 'Rice-based meals'),
('Snacks', 'CAT-SNACK', 'Snacks and side dishes'),
('Frozen Goods', 'CAT-FROZ', 'Frozen items'),
('Packaging', 'CAT-PACK', 'Packaging materials'),
('Raw Materials', 'CAT-RAW', 'Raw cooking materials'),
('Condiments', 'CAT-COND', 'Sauces and condiments'),
('Supplies', 'CAT-SUP', 'General supplies')
ON CONFLICT (code) DO NOTHING;

-- Units of Measure
INSERT INTO units_of_measure (code, name, description) VALUES
('pcs', 'Pieces', 'Individual items'),
('bottle', 'Bottle', 'Bottled items'),
('can', 'Can', 'Canned items'),
('case', 'Case', 'Case of items'),
('box', 'Box', 'Boxed items'),
('kg', 'Kilogram', 'Weight in kilograms'),
('g', 'Gram', 'Weight in grams'),
('L', 'Liter', 'Volume in liters'),
('mL', 'Milliliter', 'Volume in milliliters'),
('pack', 'Pack', 'Packaged items'),
('tray', 'Tray', 'Items in trays')
ON CONFLICT (code) DO NOTHING;

-- Inventory Locations
INSERT INTO inventory_locations (code, name, description) VALUES
('LOC-BODEGA', 'Bodega', 'Main storage area'),
('LOC-KIOSK', 'Kiosk', 'Front kiosk area'),
('LOC-GRILLED', 'Grilled', 'Grilling station'),
('LOC-PORTION', 'Portion', 'Portioning station')
ON CONFLICT (code) DO NOTHING;

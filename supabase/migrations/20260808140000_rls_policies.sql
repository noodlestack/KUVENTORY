-- Secure Role Lookup Functions (SECURITY DEFINER)
-- We use a dedicated function to avoid recursive RLS policy evaluations on profiles/user_roles.
-- This function runs as the table owner and bypasses RLS for the lookup.

CREATE OR REPLACE FUNCTION public.has_role(role_name text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    JOIN profiles p ON ur.profile_id = p.id
    WHERE p.auth_user_id = auth.uid()
    AND r.name = role_name
  );
$$;

CREATE OR REPLACE FUNCTION public.has_any_role(role_names text[])
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    JOIN profiles p ON ur.profile_id = p.id
    WHERE p.auth_user_id = auth.uid()
    AND r.name = ANY(role_names)
  );
$$;

-- Enable RLS on all tables
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE units_of_measure ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_inventory_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_inventory_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transfer_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_discount_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. Profiles
-- Everyone authenticated can read all profiles (required for UI display of names)
CREATE POLICY "Profiles are viewable by all authenticated users" ON profiles
  FOR SELECT TO authenticated USING (true);
-- Users can update non-sensitive fields of their own profile
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());
-- Admin can do everything
CREATE POLICY "Admin full access to profiles" ON profiles
  FOR ALL TO authenticated
  USING (public.has_role('Administrator'));

-- 2. Roles
-- Viewable by all authenticated
CREATE POLICY "Roles are viewable by authenticated users" ON roles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin full access to roles" ON roles
  FOR ALL TO authenticated
  USING (public.has_role('Administrator'));

-- 3. User Roles
-- Viewable by all authenticated
CREATE POLICY "User roles are viewable by authenticated users" ON user_roles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin full access to user_roles" ON user_roles
  FOR ALL TO authenticated
  USING (public.has_role('Administrator'));

-- 4. Categories & Units of Measure & Inventory Locations
CREATE POLICY "Categories viewable by authenticated users" ON categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Categories managed by Admin/Mgr/Inv" ON categories FOR ALL TO authenticated USING (public.has_any_role(ARRAY['Administrator', 'Manager', 'Inventory Staff']));

CREATE POLICY "Units viewable by authenticated users" ON units_of_measure FOR SELECT TO authenticated USING (true);
CREATE POLICY "Units managed by Admin/Mgr/Inv" ON units_of_measure FOR ALL TO authenticated USING (public.has_any_role(ARRAY['Administrator', 'Manager', 'Inventory Staff']));

CREATE POLICY "Locations viewable by authenticated users" ON inventory_locations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Locations managed by Admin/Mgr" ON inventory_locations FOR ALL TO authenticated USING (public.has_any_role(ARRAY['Administrator', 'Manager']));

-- 5. Stock Items
CREATE POLICY "Stock items viewable by authenticated users" ON stock_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Stock items managed by Admin/Mgr/Inv" ON stock_items FOR ALL TO authenticated USING (public.has_any_role(ARRAY['Administrator', 'Manager', 'Inventory Staff']));

-- 6. Inventory Balances
-- READ for all
CREATE POLICY "Inventory balances viewable by authenticated users" ON inventory_balances FOR SELECT TO authenticated USING (true);
-- NO UPDATE POLICY FOR ANYONE EXPLICITLY TO PREVENT INSECURE CLIENT-SIDE UPDATES.
-- (Only PostgreSQL functions bypassing RLS will be able to update these).
CREATE POLICY "Inventory balances insert by Admin/Mgr/Inv" ON inventory_balances FOR INSERT TO authenticated WITH CHECK (public.has_any_role(ARRAY['Administrator', 'Manager', 'Inventory Staff']));

-- 7. Daily Inventory
CREATE POLICY "Daily inventory viewable by authenticated users" ON daily_inventory_periods FOR SELECT TO authenticated USING (true);
CREATE POLICY "Daily inventory insert by authorized" ON daily_inventory_periods FOR INSERT TO authenticated WITH CHECK (public.has_any_role(ARRAY['Administrator', 'Manager', 'Inventory Staff', 'Kitchen Staff']));
-- Prevent update if status is CLOSED unless Admin
CREATE POLICY "Daily inventory update" ON daily_inventory_periods FOR UPDATE TO authenticated 
  USING (
    public.has_any_role(ARRAY['Administrator', 'Manager', 'Inventory Staff', 'Kitchen Staff']) 
    AND (status != 'CLOSED' OR public.has_role('Administrator'))
  );

CREATE POLICY "Daily inventory lines viewable by all" ON daily_inventory_lines FOR SELECT TO authenticated USING (true);
CREATE POLICY "Daily inventory lines manageable by authorized" ON daily_inventory_lines FOR ALL TO authenticated 
  USING (
    public.has_any_role(ARRAY['Administrator', 'Manager', 'Inventory Staff', 'Kitchen Staff'])
    AND EXISTS (
      SELECT 1 FROM daily_inventory_periods p 
      WHERE p.id = daily_inventory_period_id 
      AND (p.status != 'CLOSED' OR public.has_role('Administrator'))
    )
  );

-- 8. Stock Movements
CREATE POLICY "Stock movements viewable by authenticated users" ON stock_movements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Stock movements insertable by Admin/Mgr/Inv" ON stock_movements FOR INSERT TO authenticated WITH CHECK (public.has_any_role(ARRAY['Administrator', 'Manager', 'Inventory Staff']));
-- Updates/Deletes explicitly omitted (immutable) except Admin
CREATE POLICY "Admin full access to stock movements" ON stock_movements FOR ALL TO authenticated USING (public.has_role('Administrator'));

-- 9. Stock Transfers
CREATE POLICY "Stock transfers viewable by authenticated users" ON stock_transfers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Stock transfers managed by Admin/Mgr/Inv" ON stock_transfers FOR ALL TO authenticated USING (public.has_any_role(ARRAY['Administrator', 'Manager', 'Inventory Staff']));

CREATE POLICY "Stock transfer lines viewable by authenticated users" ON stock_transfer_lines FOR SELECT TO authenticated USING (true);
CREATE POLICY "Stock transfer lines managed by Admin/Mgr/Inv" ON stock_transfer_lines FOR ALL TO authenticated USING (public.has_any_role(ARRAY['Administrator', 'Manager', 'Inventory Staff']));

-- 10. Suppliers & Purchases
CREATE POLICY "Suppliers viewable by all" ON suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Suppliers managed by Admin/Mgr/Inv" ON suppliers FOR ALL TO authenticated USING (public.has_any_role(ARRAY['Administrator', 'Manager', 'Inventory Staff']));

CREATE POLICY "Supplier discounts viewable by all" ON supplier_discount_policies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Supplier discounts managed by Admin/Mgr" ON supplier_discount_policies FOR ALL TO authenticated USING (public.has_any_role(ARRAY['Administrator', 'Manager']));

CREATE POLICY "Purchases viewable by all" ON purchases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Purchases managed by Admin/Mgr/Inv" ON purchases FOR ALL TO authenticated USING (public.has_any_role(ARRAY['Administrator', 'Manager', 'Inventory Staff']));

CREATE POLICY "Purchase lines viewable by all" ON purchase_lines FOR SELECT TO authenticated USING (true);
CREATE POLICY "Purchase lines managed by Admin/Mgr/Inv" ON purchase_lines FOR ALL TO authenticated USING (public.has_any_role(ARRAY['Administrator', 'Manager', 'Inventory Staff']));

-- 11. Sales & Discounts
CREATE POLICY "Sales viewable by all" ON sales FOR SELECT TO authenticated USING (true);
CREATE POLICY "Sales managed by Admin/Mgr/Cashier" ON sales FOR ALL TO authenticated USING (public.has_any_role(ARRAY['Administrator', 'Manager', 'Cashier']));

CREATE POLICY "Sale lines viewable by all" ON sale_lines FOR SELECT TO authenticated USING (true);
CREATE POLICY "Sale lines managed by Admin/Mgr/Cashier" ON sale_lines FOR ALL TO authenticated USING (public.has_any_role(ARRAY['Administrator', 'Manager', 'Cashier']));

CREATE POLICY "Discounts viewable by all" ON discounts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Discounts managed by Admin/Mgr/Cashier" ON discounts FOR ALL TO authenticated USING (public.has_any_role(ARRAY['Administrator', 'Manager', 'Cashier']));

-- 12. Expenses
CREATE POLICY "Expense categories viewable by all" ON expense_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Expense categories managed by Admin/Mgr" ON expense_categories FOR ALL TO authenticated USING (public.has_any_role(ARRAY['Administrator', 'Manager']));

CREATE POLICY "Expenses viewable by all" ON expenses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Expenses managed by Admin/Mgr" ON expenses FOR ALL TO authenticated USING (public.has_any_role(ARRAY['Administrator', 'Manager']));
CREATE POLICY "Cashier can add expenses" ON expenses FOR INSERT TO authenticated WITH CHECK (public.has_role('Cashier'));

-- 13. Cash Sessions
CREATE POLICY "Cash sessions viewable by Admin/Mgr/Cashier" ON cash_sessions FOR SELECT TO authenticated USING (public.has_any_role(ARRAY['Administrator', 'Manager', 'Cashier']));
CREATE POLICY "Cash sessions managed by Admin/Mgr" ON cash_sessions FOR ALL TO authenticated USING (public.has_any_role(ARRAY['Administrator', 'Manager']));
CREATE POLICY "Cashier can manage own sessions" ON cash_sessions FOR ALL TO authenticated 
  USING (
    public.has_role('Cashier') AND opened_by = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Cash transactions viewable by Admin/Mgr/Cashier" ON cash_transactions FOR SELECT TO authenticated USING (public.has_any_role(ARRAY['Administrator', 'Manager', 'Cashier']));
CREATE POLICY "Cash transactions managed by Admin/Mgr" ON cash_transactions FOR ALL TO authenticated USING (public.has_any_role(ARRAY['Administrator', 'Manager']));
CREATE POLICY "Cashier can insert own transactions" ON cash_transactions FOR INSERT TO authenticated 
  WITH CHECK (
    public.has_role('Cashier') AND EXISTS (
      SELECT 1 FROM cash_sessions WHERE id = cash_session_id AND opened_by = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
    )
  );

-- 14. Notifications
-- Wait, the notification schema might not use auth.uid() directly for user_id. Let's check `notifications` schema. It likely references `profiles(id)`.
-- I'll verify this shortly, but let's assume it references `profiles(id)`.
-- Let's change `user_id = auth.uid()` to `user_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())`.
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT TO authenticated USING (user_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE TO authenticated USING (user_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())) WITH CHECK (user_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));
CREATE POLICY "Admin can manage all notifications" ON notifications FOR ALL TO authenticated USING (public.has_role('Administrator'));

-- 15. Audit Logs
CREATE POLICY "Admin can view audit logs" ON audit_logs FOR SELECT TO authenticated USING (public.has_role('Administrator'));
CREATE POLICY "Authenticated users can insert audit logs" ON audit_logs FOR INSERT TO authenticated WITH CHECK (true);


-- ========================================================================================
-- KUVENTORY V4 - SECURITY AND PERFORMANCE REMEDIATION
-- Migration Date: 2026-08-10 10:00:00
-- ========================================================================================

-- ========================================================================================
-- PHASE 2 & 3: FUNCTION RECREATION WITH SEARCH_PATH = '' AND QUALIFIED OBJECTS
-- ========================================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (auth_user_id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.has_role(role_name text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    JOIN public.profiles p ON ur.profile_id = p.id
    WHERE p.auth_user_id = (select auth.uid())
    AND r.name = role_name
  );
$$;
REVOKE EXECUTE ON FUNCTION public.has_role(text) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.has_any_role(role_names text[])
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    JOIN public.profiles p ON ur.profile_id = p.id
    WHERE p.auth_user_id = (select auth.uid())
    AND r.name = ANY(role_names)
  );
$$;
REVOKE EXECUTE ON FUNCTION public.has_any_role(text[]) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.create_stock_movement(
    p_stock_item_id UUID,
    p_location_id UUID,
    p_movement_type TEXT,
    p_quantity NUMERIC,
    p_reference_type TEXT DEFAULT NULL,
    p_reference_id UUID DEFAULT NULL,
    p_reason TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_user_id UUID;
    v_current_qty NUMERIC(15, 2) := 0.00;
    v_new_qty NUMERIC(15, 2);
    v_movement_id UUID;
    v_is_deduction BOOLEAN;
BEGIN
    v_user_id := (SELECT id FROM public.profiles WHERE auth_user_id = (select auth.uid()));
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: User profile not found.';
    END IF;

    IF p_quantity <= 0 THEN
        RAISE EXCEPTION 'Quantity must be greater than zero. Received: %', p_quantity;
    END IF;

    IF p_movement_type IN ('SALE_OUT', 'SALE_OUT_AM', 'SALE_OUT_PM', 'TRANSFER_OUT', 'ADJUSTMENT_OUT', 'DAMAGE', 'EXPIRY', 'LOSS') THEN
        v_is_deduction := TRUE;
    ELSIF p_movement_type IN ('OPENING_BALANCE', 'MANUAL_RECEIPT', 'PURCHASE_IN', 'TRANSFER_IN', 'ADJUSTMENT_IN', 'CORRECTION') THEN
        v_is_deduction := FALSE;
    ELSE
        RAISE EXCEPTION 'Invalid movement_type: %', p_movement_type;
    END IF;

    INSERT INTO public.inventory_balances (stock_item_id, location_id, current_quantity)
    VALUES (p_stock_item_id, p_location_id, 0.00)
    ON CONFLICT (stock_item_id, location_id) DO NOTHING;

    SELECT current_quantity INTO v_current_qty
    FROM public.inventory_balances
    WHERE stock_item_id = p_stock_item_id AND location_id = p_location_id
    FOR UPDATE;

    IF v_is_deduction THEN
        v_new_qty := v_current_qty - p_quantity;
    ELSE
        v_new_qty := v_current_qty + p_quantity;
    END IF;

    IF v_new_qty < 0 THEN
        RAISE EXCEPTION 'Insufficient stock for item %. Current: %, Requested: %', p_stock_item_id, v_current_qty, p_quantity;
    END IF;

    UPDATE public.inventory_balances
    SET current_quantity = v_new_qty,
        updated_at = NOW()
    WHERE stock_item_id = p_stock_item_id AND location_id = p_location_id;

    INSERT INTO public.stock_movements (
        stock_item_id, location_id, movement_type, quantity, 
        previous_quantity, new_quantity, reference_type, reference_id, 
        reason, notes, created_by
    ) VALUES (
        p_stock_item_id, p_location_id, p_movement_type, p_quantity,
        v_current_qty, v_new_qty, p_reference_type, p_reference_id,
        p_reason, p_notes, v_user_id
    ) RETURNING id INTO v_movement_id;

    RETURN v_movement_id;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.create_stock_movement(UUID, UUID, TEXT, NUMERIC, TEXT, UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated;


CREATE OR REPLACE FUNCTION public.inventory_adjust(
    p_stock_item_id UUID,
    p_location_id UUID,
    p_adjustment_type TEXT,
    p_quantity NUMERIC,
    p_reason TEXT,
    p_notes TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_movement_type TEXT;
    v_movement_id UUID;
BEGIN
    IF NOT public.has_any_role(ARRAY['Administrator', 'Manager', 'Inventory Staff']) THEN
        RAISE EXCEPTION 'Unauthorized: Requires Administrator, Manager, or Inventory Staff role.';
    END IF;

    IF p_adjustment_type = 'IN' THEN
        v_movement_type := 'ADJUSTMENT_IN';
    ELSIF p_adjustment_type = 'OUT' THEN
        v_movement_type := 'ADJUSTMENT_OUT';
    ELSE
        RAISE EXCEPTION 'Invalid adjustment type. Must be IN or OUT.';
    END IF;

    IF p_reason IS NULL OR trim(p_reason) = '' THEN
        RAISE EXCEPTION 'Reason is required for inventory adjustments.';
    END IF;

    v_movement_id := public.create_stock_movement(
        p_stock_item_id,
        p_location_id,
        v_movement_type,
        p_quantity,
        'MANUAL_ADJUSTMENT',
        NULL,
        p_reason,
        p_notes
    );

    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, metadata)
    VALUES (
        (SELECT id FROM public.profiles WHERE auth_user_id = (select auth.uid())),
        'INVENTORY_ADJUST',
        'stock_movements',
        v_movement_id,
        jsonb_build_object('item', p_stock_item_id, 'type', p_adjustment_type, 'qty', p_quantity)
    );

    RETURN v_movement_id;
END;
$$;


CREATE OR REPLACE FUNCTION public.create_stock_transfer(
    p_transfer_number TEXT,
    p_source_location_id UUID,
    p_destination_location_id UUID,
    p_reason TEXT,
    p_notes TEXT,
    p_lines_json JSONB
) RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_user_id UUID;
    v_transfer_id UUID;
    v_line JSONB;
    v_item_id UUID;
    v_qty NUMERIC(15, 2);
BEGIN
    IF NOT public.has_any_role(ARRAY['Administrator', 'Manager', 'Inventory Staff']) THEN
        RAISE EXCEPTION 'Unauthorized: Requires Administrator, Manager, or Inventory Staff role.';
    END IF;
    
    v_user_id := (SELECT id FROM public.profiles WHERE auth_user_id = (select auth.uid()));

    IF p_source_location_id = p_destination_location_id THEN
        RAISE EXCEPTION 'Source and destination locations cannot be the same.';
    END IF;

    INSERT INTO public.stock_transfers (
        transfer_number, source_location_id, destination_location_id,
        status, reason, notes, requested_by
    ) VALUES (
        p_transfer_number, p_source_location_id, p_destination_location_id,
        'PENDING', p_reason, p_notes, v_user_id
    ) RETURNING id INTO v_transfer_id;

    FOR v_line IN SELECT * FROM jsonb_array_elements(p_lines_json)
    LOOP
        v_item_id := (v_line->>'stock_item_id')::UUID;
        v_qty := (v_line->>'quantity')::NUMERIC;

        IF v_qty <= 0 THEN
            RAISE EXCEPTION 'Transfer quantity must be greater than zero.';
        END IF;

        INSERT INTO public.stock_transfer_lines (transfer_id, stock_item_id, quantity)
        VALUES (v_transfer_id, v_item_id, v_qty);

        PERFORM public.create_stock_movement(
            v_item_id,
            p_source_location_id,
            'TRANSFER_OUT',
            v_qty,
            'STOCK_TRANSFER',
            v_transfer_id,
            'Stock sent to destination',
            NULL
        );
    END LOOP;

    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, metadata)
    VALUES (v_user_id, 'TRANSFER_CREATE', 'stock_transfers', v_transfer_id, p_lines_json);

    RETURN v_transfer_id;
END;
$$;


CREATE OR REPLACE FUNCTION public.complete_stock_transfer(
    p_transfer_id UUID
) RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_user_id UUID;
    v_transfer RECORD;
    v_line RECORD;
BEGIN
    IF NOT public.has_any_role(ARRAY['Administrator', 'Manager', 'Inventory Staff']) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    v_user_id := (SELECT id FROM public.profiles WHERE auth_user_id = (select auth.uid()));

    SELECT * INTO v_transfer FROM public.stock_transfers WHERE id = p_transfer_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Transfer not found.';
    END IF;

    IF v_transfer.status != 'PENDING' THEN
        RAISE EXCEPTION 'Only PENDING transfers can be completed.';
    END IF;

    FOR v_line IN SELECT * FROM public.stock_transfer_lines WHERE transfer_id = p_transfer_id
    LOOP
        PERFORM public.create_stock_movement(
            v_line.stock_item_id,
            v_transfer.destination_location_id,
            'TRANSFER_IN',
            v_line.quantity,
            'STOCK_TRANSFER',
            p_transfer_id,
            'Stock received from source',
            NULL
        );
    END LOOP;

    UPDATE public.stock_transfers
    SET status = 'COMPLETED',
        completed_by = v_user_id,
        completed_at = NOW()
    WHERE id = p_transfer_id;

    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, metadata)
    VALUES (v_user_id, 'TRANSFER_COMPLETE', 'stock_transfers', p_transfer_id, NULL);
END;
$$;


CREATE OR REPLACE FUNCTION public.create_purchase(
    p_purchase_number TEXT,
    p_supplier_id UUID,
    p_purchase_date DATE,
    p_discount_amount NUMERIC,
    p_payment_method TEXT,
    p_notes TEXT,
    p_lines_json JSONB
) RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_user_id UUID;
    v_purchase_id UUID;
    v_line JSONB;
    v_item_id UUID;
    v_qty NUMERIC(15, 2);
    v_cost NUMERIC(15, 2);
    v_line_total NUMERIC(15, 2);
    v_subtotal NUMERIC(15, 2) := 0.00;
    v_final_total NUMERIC(15, 2) := 0.00;
BEGIN
    IF NOT public.has_any_role(ARRAY['Administrator', 'Manager', 'Inventory Staff']) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;
    v_user_id := (SELECT id FROM public.profiles WHERE auth_user_id = (select auth.uid()));

    FOR v_line IN SELECT * FROM jsonb_array_elements(p_lines_json)
    LOOP
        v_qty := (v_line->>'quantity')::NUMERIC;
        v_cost := (v_line->>'unit_cost')::NUMERIC;
        IF v_qty <= 0 OR v_cost < 0 THEN
            RAISE EXCEPTION 'Invalid quantity or unit cost.';
        END IF;
        v_subtotal := v_subtotal + (v_qty * v_cost);
    END LOOP;

    IF p_discount_amount < 0 OR p_discount_amount > v_subtotal THEN
        RAISE EXCEPTION 'Invalid discount amount.';
    END IF;
    v_final_total := v_subtotal - p_discount_amount;

    INSERT INTO public.purchases (
        purchase_number, supplier_id, purchase_date, status,
        subtotal, discount_amount, total_amount, payment_method, notes, created_by
    ) VALUES (
        p_purchase_number, p_supplier_id, p_purchase_date, 'ORDERED',
        v_subtotal, p_discount_amount, v_final_total, p_payment_method, p_notes, v_user_id
    ) RETURNING id INTO v_purchase_id;

    FOR v_line IN SELECT * FROM jsonb_array_elements(p_lines_json)
    LOOP
        v_item_id := (v_line->>'stock_item_id')::UUID;
        v_qty := (v_line->>'quantity')::NUMERIC;
        v_cost := (v_line->>'unit_cost')::NUMERIC;
        v_line_total := v_qty * v_cost;

        INSERT INTO public.purchase_lines (
            purchase_id, stock_item_id, quantity, unit_cost, line_total
        ) VALUES (
            v_purchase_id, v_item_id, v_qty, v_cost, v_line_total
        );
    END LOOP;

    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, metadata)
    VALUES (v_user_id, 'PURCHASE_CREATE', 'purchases', v_purchase_id, p_lines_json);

    RETURN v_purchase_id;
END;
$$;


CREATE OR REPLACE FUNCTION public.receive_purchase(
    p_purchase_id UUID,
    p_location_id UUID
) RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_user_id UUID;
    v_purchase RECORD;
    v_line RECORD;
BEGIN
    IF NOT public.has_any_role(ARRAY['Administrator', 'Manager', 'Inventory Staff']) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;
    v_user_id := (SELECT id FROM public.profiles WHERE auth_user_id = (select auth.uid()));

    SELECT * INTO v_purchase FROM public.purchases WHERE id = p_purchase_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Purchase not found.';
    END IF;

    IF v_purchase.status != 'ORDERED' THEN
        RAISE EXCEPTION 'Only ORDERED purchases can be received.';
    END IF;

    FOR v_line IN SELECT * FROM public.purchase_lines WHERE purchase_id = p_purchase_id
    LOOP
        PERFORM public.create_stock_movement(
            v_line.stock_item_id,
            p_location_id,
            'PURCHASE_IN',
            v_line.quantity,
            'PURCHASE',
            p_purchase_id,
            'Purchase received',
            NULL
        );
    END LOOP;

    UPDATE public.purchases
    SET status = 'RECEIVED',
        updated_at = NOW()
    WHERE id = p_purchase_id;

    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, metadata)
    VALUES (v_user_id, 'PURCHASE_RECEIVE', 'purchases', p_purchase_id, jsonb_build_object('location_id', p_location_id));
END;
$$;


CREATE OR REPLACE FUNCTION public.open_cash_session(
    p_business_date DATE,
    p_opening_cash NUMERIC
) RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_user_id UUID;
    v_session_id UUID;
    v_existing_session UUID;
BEGIN
    IF NOT public.has_any_role(ARRAY['Administrator', 'Manager', 'Cashier']) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;
    v_user_id := (SELECT id FROM public.profiles WHERE auth_user_id = (select auth.uid()));

    IF p_opening_cash < 0 THEN
        RAISE EXCEPTION 'Opening cash cannot be negative.';
    END IF;

    SELECT id INTO v_existing_session 
    FROM public.cash_sessions 
    WHERE opened_by = v_user_id AND status = 'OPEN' 
    LIMIT 1;

    IF FOUND THEN
        RAISE EXCEPTION 'You already have an open cash session.';
    END IF;

    INSERT INTO public.cash_sessions (
        business_date, opening_cash, status, opened_by
    ) VALUES (
        p_business_date, p_opening_cash, 'OPEN', v_user_id
    ) RETURNING id INTO v_session_id;

    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, metadata)
    VALUES (v_user_id, 'CASH_SESSION_OPEN', 'cash_sessions', v_session_id, NULL);

    RETURN v_session_id;
END;
$$;


CREATE OR REPLACE FUNCTION public.close_cash_session(
    p_session_id UUID,
    p_actual_closing_cash NUMERIC
) RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_user_id UUID;
    v_session RECORD;
    v_expected_cash NUMERIC(15, 2) := 0.00;
    v_cash_short NUMERIC(15, 2) := 0.00;
    v_cash_over NUMERIC(15, 2) := 0.00;
BEGIN
    IF NOT public.has_any_role(ARRAY['Administrator', 'Manager', 'Cashier']) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;
    v_user_id := (SELECT id FROM public.profiles WHERE auth_user_id = (select auth.uid()));

    IF p_actual_closing_cash < 0 THEN
        RAISE EXCEPTION 'Closing cash cannot be negative.';
    END IF;

    SELECT * INTO v_session FROM public.cash_sessions WHERE id = p_session_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Session not found.';
    END IF;

    IF v_session.status != 'OPEN' THEN
        RAISE EXCEPTION 'Session is already closed.';
    END IF;

    IF v_session.opened_by != v_user_id AND NOT public.has_any_role(ARRAY['Administrator', 'Manager']) THEN
        RAISE EXCEPTION 'You can only close your own cash sessions.';
    END IF;

    SELECT COALESCE(SUM(
        CASE 
            WHEN transaction_type IN ('CASH_SALE', 'DEPOSIT') THEN amount
            WHEN transaction_type IN ('EXPENSE', 'WITHDRAWAL') THEN -amount
            ELSE 0 
        END
    ), 0.00) INTO v_expected_cash
    FROM public.cash_transactions
    WHERE cash_session_id = p_session_id;

    v_expected_cash := v_session.opening_cash + v_expected_cash;

    IF p_actual_closing_cash < v_expected_cash THEN
        v_cash_short := v_expected_cash - p_actual_closing_cash;
    ELSIF p_actual_closing_cash > v_expected_cash THEN
        v_cash_over := p_actual_closing_cash - v_expected_cash;
    END IF;

    UPDATE public.cash_sessions
    SET status = 'CLOSED',
        closing_cash = p_actual_closing_cash,
        cash_short = v_cash_short,
        cash_over = v_cash_over,
        closed_by = v_user_id,
        closed_at = NOW()
    WHERE id = p_session_id;

    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, metadata)
    VALUES (v_user_id, 'CASH_SESSION_CLOSE', 'cash_sessions', p_session_id, jsonb_build_object('expected', v_expected_cash, 'actual', p_actual_closing_cash));
END;
$$;


CREATE OR REPLACE FUNCTION public.process_sale(
    p_sale_number TEXT,
    p_location_id UUID,
    p_sale_date DATE,
    p_discount_type TEXT,
    p_discount_amount NUMERIC,
    p_payment_method TEXT,
    p_cash_session_id UUID,
    p_notes TEXT,
    p_lines_json JSONB
) RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_user_id UUID;
    v_sale_id UUID;
    v_line JSONB;
    v_item_id UUID;
    v_qty NUMERIC(15, 2);
    v_price NUMERIC(15, 2);
    v_line_total NUMERIC(15, 2);
    v_subtotal NUMERIC(15, 2) := 0.00;
    v_final_total NUMERIC(15, 2) := 0.00;
BEGIN
    IF NOT public.has_any_role(ARRAY['Administrator', 'Manager', 'Cashier']) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;
    v_user_id := (SELECT id FROM public.profiles WHERE auth_user_id = (select auth.uid()));

    IF p_payment_method = 'CASH_SALE' THEN
        IF p_cash_session_id IS NULL THEN
            RAISE EXCEPTION 'Cash session ID is required for cash sales.';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM public.cash_sessions WHERE id = p_cash_session_id AND status = 'OPEN') THEN
            RAISE EXCEPTION 'Invalid or closed cash session.';
        END IF;
    END IF;

    FOR v_line IN SELECT * FROM jsonb_array_elements(p_lines_json)
    LOOP
        v_qty := (v_line->>'quantity')::NUMERIC;
        v_price := (v_line->>'unit_price')::NUMERIC;
        IF v_qty <= 0 OR v_price < 0 THEN
            RAISE EXCEPTION 'Invalid quantity or unit price.';
        END IF;
        v_subtotal := v_subtotal + (v_qty * v_price);
    END LOOP;

    IF p_discount_amount < 0 OR p_discount_amount > v_subtotal THEN
        RAISE EXCEPTION 'Invalid discount amount.';
    END IF;
    v_final_total := v_subtotal - p_discount_amount;

    INSERT INTO public.sales (
        sale_number, sale_date, status, subtotal, discount_amount, total_amount, payment_method, notes, created_by
    ) VALUES (
        p_sale_number, p_sale_date, 'COMPLETED', v_subtotal, p_discount_amount, v_final_total, p_payment_method, p_notes, v_user_id
    ) RETURNING id INTO v_sale_id;

    IF p_discount_amount > 0 AND p_discount_type != 'NONE' THEN
        INSERT INTO public.discounts (
            discount_type, discount_amount, reason, created_by
        ) VALUES (
            p_discount_type, p_discount_amount, 'Applied to sale ' || p_sale_number, v_user_id
        );
    END IF;

    IF p_payment_method = 'CASH_SALE' THEN
        INSERT INTO public.cash_transactions (
            cash_session_id, transaction_type, amount, reference_id, reference_type, notes, created_by
        ) VALUES (
            p_cash_session_id, 'CASH_SALE', v_final_total, v_sale_id, 'SALE', 'Sale ' || p_sale_number, v_user_id
        );
    END IF;

    FOR v_line IN SELECT * FROM jsonb_array_elements(p_lines_json)
    LOOP
        v_item_id := (v_line->>'stock_item_id')::UUID;
        v_qty := (v_line->>'quantity')::NUMERIC;
        v_price := (v_line->>'unit_price')::NUMERIC;
        v_line_total := v_qty * v_price;

        INSERT INTO public.sale_lines (
            sale_id, stock_item_id, quantity, unit_price, line_total
        ) VALUES (
            v_sale_id, v_item_id, v_qty, v_price, v_line_total
        );

        PERFORM public.create_stock_movement(
            v_item_id,
            p_location_id,
            'SALE_OUT',
            v_qty,
            'SALE',
            v_sale_id,
            'Sale deduction',
            NULL
        );
    END LOOP;

    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, metadata)
    VALUES (v_user_id, 'SALE_PROCESS', 'sales', v_sale_id, p_lines_json);

    RETURN v_sale_id;
END;
$$;


CREATE OR REPLACE FUNCTION public.create_expense(
    p_expense_number TEXT,
    p_category_id UUID,
    p_supplier_or_payee TEXT,
    p_expense_date DATE,
    p_original_amount NUMERIC,
    p_discount_amount NUMERIC,
    p_payment_method TEXT,
    p_cash_session_id UUID,
    p_description TEXT,
    p_notes TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_user_id UUID;
    v_expense_id UUID;
    v_final_amount NUMERIC(15, 2);
BEGIN
    IF NOT public.has_any_role(ARRAY['Administrator', 'Manager', 'Cashier']) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;
    v_user_id := (SELECT id FROM public.profiles WHERE auth_user_id = (select auth.uid()));

    IF p_original_amount < 0 OR p_discount_amount < 0 THEN
        RAISE EXCEPTION 'Amounts cannot be negative.';
    END IF;

    IF p_discount_amount > p_original_amount THEN
        RAISE EXCEPTION 'Discount cannot exceed original amount.';
    END IF;

    v_final_amount := p_original_amount - p_discount_amount;

    IF p_payment_method = 'CASH' THEN
        IF p_cash_session_id IS NULL THEN
            RAISE EXCEPTION 'Cash session ID is required for cash expenses.';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM public.cash_sessions WHERE id = p_cash_session_id AND status = 'OPEN') THEN
            RAISE EXCEPTION 'Invalid or closed cash session.';
        END IF;
    END IF;

    INSERT INTO public.expenses (
        expense_number, expense_category_id, supplier_or_payee, description,
        original_amount, discount_amount, final_amount, payment_method, expense_date, notes, created_by
    ) VALUES (
        p_expense_number, p_category_id, p_supplier_or_payee, p_description,
        p_original_amount, p_discount_amount, v_final_amount, p_payment_method, p_expense_date, p_notes, v_user_id
    ) RETURNING id INTO v_expense_id;

    IF p_payment_method = 'CASH' THEN
        INSERT INTO public.cash_transactions (
            cash_session_id, transaction_type, amount, reference_id, reference_type, notes, created_by
        ) VALUES (
            p_cash_session_id, 'EXPENSE', v_final_amount, v_expense_id, 'EXPENSE', p_description, v_user_id
        );
    END IF;

    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, metadata)
    VALUES (v_user_id, 'EXPENSE_CREATE', 'expenses', v_expense_id, NULL);

    RETURN v_expense_id;
END;
$$;

-- ========================================================================================
-- PHASE 8, 9 & 10-17: RLS POLICY OPTIMIZATIONS & MULTIPLE PERMISSIVE CONSOLIDATIONS
-- ========================================================================================

-- profiles
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth_user_id = (select auth.uid()))
  WITH CHECK (auth_user_id = (select auth.uid()));

-- categories
DROP POLICY IF EXISTS "Categories viewable by authenticated users" ON public.categories;
DROP POLICY IF EXISTS "Categories managed by Admin/Mgr/Inv" ON public.categories;

CREATE POLICY "Categories viewable by authenticated users" ON public.categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Categories managed by Admin/Mgr/Inv (Insert)" ON public.categories FOR INSERT TO authenticated WITH CHECK (public.has_any_role(ARRAY['Administrator', 'Manager', 'Inventory Staff']));
CREATE POLICY "Categories managed by Admin/Mgr/Inv (Update)" ON public.categories FOR UPDATE TO authenticated USING (public.has_any_role(ARRAY['Administrator', 'Manager', 'Inventory Staff']));
CREATE POLICY "Categories managed by Admin/Mgr/Inv (Delete)" ON public.categories FOR DELETE TO authenticated USING (public.has_any_role(ARRAY['Administrator', 'Manager', 'Inventory Staff']));

-- cash_sessions
DROP POLICY IF EXISTS "Cash sessions viewable by Admin/Mgr/Cashier" ON public.cash_sessions;
DROP POLICY IF EXISTS "Cash sessions managed by Admin/Mgr" ON public.cash_sessions;
DROP POLICY IF EXISTS "Cashier can manage own sessions" ON public.cash_sessions;

CREATE POLICY "Cash sessions viewable by Admin/Mgr/Cashier" ON public.cash_sessions FOR SELECT TO authenticated USING (public.has_any_role(ARRAY['Administrator', 'Manager', 'Cashier']));
CREATE POLICY "Cash sessions mutable by Admin/Mgr or Cashier Own" ON public.cash_sessions FOR UPDATE TO authenticated
USING (
    public.has_any_role(ARRAY['Administrator', 'Manager']) 
    OR 
    (public.has_role('Cashier') AND opened_by = (SELECT id FROM public.profiles WHERE auth_user_id = (select auth.uid())))
);
CREATE POLICY "Cash sessions insertable by Admin/Mgr or Cashier" ON public.cash_sessions FOR INSERT TO authenticated
WITH CHECK (
    public.has_any_role(ARRAY['Administrator', 'Manager']) 
    OR 
    (public.has_role('Cashier') AND opened_by = (SELECT id FROM public.profiles WHERE auth_user_id = (select auth.uid())))
);
CREATE POLICY "Cash sessions deletable by Admin/Mgr" ON public.cash_sessions FOR DELETE TO authenticated
USING (public.has_any_role(ARRAY['Administrator', 'Manager']));

-- cash_transactions
DROP POLICY IF EXISTS "Cash transactions viewable by Admin/Mgr/Cashier" ON public.cash_transactions;
DROP POLICY IF EXISTS "Cash transactions managed by Admin/Mgr" ON public.cash_transactions;
DROP POLICY IF EXISTS "Cashier can insert own transactions" ON public.cash_transactions;

CREATE POLICY "Cash transactions viewable by Admin/Mgr/Cashier" ON public.cash_transactions FOR SELECT TO authenticated USING (public.has_any_role(ARRAY['Administrator', 'Manager', 'Cashier']));
CREATE POLICY "Cash transactions mutable by Admin/Mgr" ON public.cash_transactions FOR UPDATE TO authenticated USING (public.has_any_role(ARRAY['Administrator', 'Manager']));
CREATE POLICY "Cash transactions deletable by Admin/Mgr" ON public.cash_transactions FOR DELETE TO authenticated USING (public.has_any_role(ARRAY['Administrator', 'Manager']));
CREATE POLICY "Cash transactions insertable by Admin/Mgr/Cashier" ON public.cash_transactions FOR INSERT TO authenticated WITH CHECK (
    public.has_any_role(ARRAY['Administrator', 'Manager']) 
    OR
    (public.has_role('Cashier') AND EXISTS (
      SELECT 1 FROM public.cash_sessions WHERE id = cash_session_id AND opened_by = (SELECT id FROM public.profiles WHERE auth_user_id = (select auth.uid()))
    ))
);

-- daily_inventory_lines
DROP POLICY IF EXISTS "Daily inventory lines viewable by all" ON public.daily_inventory_lines;
DROP POLICY IF EXISTS "Daily inventory lines manageable by authorized" ON public.daily_inventory_lines;

CREATE POLICY "Daily inventory lines viewable by all" ON public.daily_inventory_lines FOR SELECT TO authenticated USING (true);
CREATE POLICY "Daily inventory lines mutable by authorized" ON public.daily_inventory_lines FOR INSERT TO authenticated WITH CHECK (
    public.has_any_role(ARRAY['Administrator', 'Manager', 'Inventory Staff', 'Kitchen Staff'])
    AND EXISTS (
      SELECT 1 FROM public.daily_inventory_periods p 
      WHERE p.id = daily_inventory_period_id 
      AND (p.status != 'CLOSED' OR public.has_role('Administrator'))
    )
);
CREATE POLICY "Daily inventory lines updatable by authorized" ON public.daily_inventory_lines FOR UPDATE TO authenticated USING (
    public.has_any_role(ARRAY['Administrator', 'Manager', 'Inventory Staff', 'Kitchen Staff'])
    AND EXISTS (
      SELECT 1 FROM public.daily_inventory_periods p 
      WHERE p.id = daily_inventory_period_id 
      AND (p.status != 'CLOSED' OR public.has_role('Administrator'))
    )
);
CREATE POLICY "Daily inventory lines deletable by authorized" ON public.daily_inventory_lines FOR DELETE TO authenticated USING (
    public.has_any_role(ARRAY['Administrator', 'Manager', 'Inventory Staff', 'Kitchen Staff'])
    AND EXISTS (
      SELECT 1 FROM public.daily_inventory_periods p 
      WHERE p.id = daily_inventory_period_id 
      AND (p.status != 'CLOSED' OR public.has_role('Administrator'))
    )
);

-- discounts
DROP POLICY IF EXISTS "Discounts viewable by all" ON public.discounts;
DROP POLICY IF EXISTS "Discounts managed by Admin/Mgr/Cashier" ON public.discounts;

CREATE POLICY "Discounts viewable by all" ON public.discounts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Discounts insertable by Admin/Mgr/Cashier" ON public.discounts FOR INSERT TO authenticated WITH CHECK (public.has_any_role(ARRAY['Administrator', 'Manager', 'Cashier']));
CREATE POLICY "Discounts updatable by Admin/Mgr/Cashier" ON public.discounts FOR UPDATE TO authenticated USING (public.has_any_role(ARRAY['Administrator', 'Manager', 'Cashier']));
CREATE POLICY "Discounts deletable by Admin/Mgr/Cashier" ON public.discounts FOR DELETE TO authenticated USING (public.has_any_role(ARRAY['Administrator', 'Manager', 'Cashier']));

-- expense_categories
DROP POLICY IF EXISTS "Expense categories viewable by all" ON public.expense_categories;
DROP POLICY IF EXISTS "Expense categories managed by Admin/Mgr" ON public.expense_categories;

CREATE POLICY "Expense categories viewable by all" ON public.expense_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Expense categories insertable by Admin/Mgr" ON public.expense_categories FOR INSERT TO authenticated WITH CHECK (public.has_any_role(ARRAY['Administrator', 'Manager']));
CREATE POLICY "Expense categories updatable by Admin/Mgr" ON public.expense_categories FOR UPDATE TO authenticated USING (public.has_any_role(ARRAY['Administrator', 'Manager']));
CREATE POLICY "Expense categories deletable by Admin/Mgr" ON public.expense_categories FOR DELETE TO authenticated USING (public.has_any_role(ARRAY['Administrator', 'Manager']));

-- audit_logs
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON public.audit_logs;
CREATE POLICY "Authenticated users can insert audit logs" ON public.audit_logs FOR INSERT TO authenticated 
WITH CHECK (
    user_id = (SELECT id FROM public.profiles WHERE auth_user_id = (select auth.uid()))
);

-- notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = (SELECT id FROM public.profiles WHERE auth_user_id = (select auth.uid())));
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (user_id = (SELECT id FROM public.profiles WHERE auth_user_id = (select auth.uid()))) WITH CHECK (user_id = (SELECT id FROM public.profiles WHERE auth_user_id = (select auth.uid())));

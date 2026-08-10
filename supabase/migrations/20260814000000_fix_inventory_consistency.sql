-- ========================================================================================
-- KAPE-UNO REPAIR: Deep System-Wide Debugging & Data-Consistency Audit
-- Migration: 20260814000000_fix_inventory_consistency.sql
-- Description:
-- 1. Fix stock location discrepancies (dynamically resolve authoritative location).
-- 2. Fix purchase subtotal NULL propagation.
-- 3. Fix sales subtotal NULL propagation.
-- ========================================================================================

-- ========================================================================================
-- FUNCTION: create_stock_movement (UPDATED)
-- ========================================================================================
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
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_current_qty NUMERIC(15, 2) := 0.00;
    v_new_qty NUMERIC(15, 2);
    v_movement_id UUID;
    v_is_deduction BOOLEAN;
    v_resolved_loc_id UUID;
BEGIN
    -- 1. Identify User
    v_user_id := (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid());
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: User profile not found.';
    END IF;

    -- 2. Validate Inputs
    IF p_quantity IS NULL OR p_quantity <= 0 THEN
        RAISE EXCEPTION 'Quantity must be greater than zero. Received: %', p_quantity;
    END IF;

    -- Determine if additive or deductive
    IF p_movement_type IN ('SALE_OUT', 'SALE_OUT_AM', 'SALE_OUT_PM', 'TRANSFER_OUT', 'ADJUSTMENT_OUT', 'DAMAGE', 'EXPIRY', 'LOSS') THEN
        v_is_deduction := TRUE;
    ELSIF p_movement_type IN ('OPENING_BALANCE', 'MANUAL_RECEIPT', 'PURCHASE_IN', 'TRANSFER_IN', 'ADJUSTMENT_IN', 'CORRECTION') THEN
        v_is_deduction := FALSE;
    ELSE
        RAISE EXCEPTION 'Invalid movement_type: %', p_movement_type;
    END IF;

    -- 3. RESOLVE LOCATION DYNAMICALLY
    -- The frontend passes a random 'default' location. We must find the item's REAL location.
    
    -- Priority 1: Where does it actually have stock?
    SELECT location_id INTO v_resolved_loc_id
    FROM public.inventory_balances
    WHERE stock_item_id = p_stock_item_id
    ORDER BY current_quantity DESC
    LIMIT 1;

    -- Priority 2: Where is it assigned in the item master?
    IF v_resolved_loc_id IS NULL THEN
        SELECT location_id INTO v_resolved_loc_id FROM public.stock_items WHERE id = p_stock_item_id;
    END IF;

    -- Priority 3: Fallback to the parameter provided
    IF v_resolved_loc_id IS NULL THEN
        v_resolved_loc_id := p_location_id;
    END IF;

    -- 4. Lock and retrieve current inventory
    INSERT INTO public.inventory_balances (stock_item_id, location_id, current_quantity)
    VALUES (p_stock_item_id, v_resolved_loc_id, 0.00)
    ON CONFLICT (stock_item_id, location_id) DO NOTHING;

    SELECT current_quantity INTO v_current_qty
    FROM public.inventory_balances
    WHERE stock_item_id = p_stock_item_id AND location_id = v_resolved_loc_id
    FOR UPDATE;

    -- 5. Calculate new quantity
    IF v_is_deduction THEN
        v_new_qty := v_current_qty - p_quantity;
    ELSE
        v_new_qty := v_current_qty + p_quantity;
    END IF;

    -- 6. Business Rule: Prevent Negative Inventory
    IF v_new_qty < 0 THEN
        RAISE EXCEPTION 'Insufficient stock for item %. Current: %, Requested: %', p_stock_item_id, v_current_qty, p_quantity;
    END IF;

    -- 7. Update Balance
    UPDATE public.inventory_balances
    SET current_quantity = v_new_qty,
        updated_at = NOW()
    WHERE stock_item_id = p_stock_item_id AND location_id = v_resolved_loc_id;

    -- 8. Insert Stock Movement (Audit Log)
    INSERT INTO public.stock_movements (
        stock_item_id, location_id, movement_type, quantity, 
        previous_quantity, new_quantity, reference_type, reference_id, 
        reason, notes, created_by
    ) VALUES (
        p_stock_item_id, v_resolved_loc_id, p_movement_type, p_quantity,
        v_current_qty, v_new_qty, p_reference_type, p_reference_id,
        p_reason, p_notes, v_user_id
    ) RETURNING id INTO v_movement_id;

    RETURN v_movement_id;
END;
$$;


-- ========================================================================================
-- FUNCTION: process_sale (UPDATED)
-- ========================================================================================
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
    -- 1. Authorization
    IF NOT public.has_any_role(ARRAY['Administrator', 'Manager', 'Cashier']) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;
    v_user_id := (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid());

    -- 2. Validate Cash Session if payment is cash
    IF p_payment_method = 'CASH_SALE' THEN
        IF p_cash_session_id IS NULL THEN
            RAISE EXCEPTION 'Cash session ID is required for cash sales.';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM public.cash_sessions WHERE id = p_cash_session_id AND status = 'OPEN') THEN
            RAISE EXCEPTION 'Invalid or closed cash session.';
        END IF;
    END IF;

    -- 3. Calculate Subtotal from Lines (FIXED NULL PROPAGATION)
    FOR v_line IN SELECT * FROM jsonb_array_elements(p_lines_json)
    LOOP
        v_qty := (v_line->>'quantity')::NUMERIC;
        v_price := (v_line->>'unit_price')::NUMERIC;
        
        -- CHECK FOR NULL TO PREVENT DB CRASH
        IF v_qty IS NULL OR v_price IS NULL OR v_qty <= 0 OR v_price < 0 THEN
            RAISE EXCEPTION 'Invalid quantity or unit price.';
        END IF;
        
        v_subtotal := v_subtotal + (v_qty * v_price);
    END LOOP;

    -- 4. Validate Discount & Total
    IF p_discount_amount < 0 OR p_discount_amount > v_subtotal THEN
        RAISE EXCEPTION 'Invalid discount amount.';
    END IF;
    v_final_total := v_subtotal - p_discount_amount;

    -- 5. Create Sale
    INSERT INTO public.sales (
        sale_number, sale_date, status, subtotal, discount_amount, total_amount, payment_method, notes, created_by
    ) VALUES (
        p_sale_number, p_sale_date, 'COMPLETED', v_subtotal, p_discount_amount, v_final_total, p_payment_method, p_notes, v_user_id
    ) RETURNING id INTO v_sale_id;

    -- 6. Insert Discount Record (if applicable)
    IF p_discount_amount > 0 AND p_discount_type != 'NONE' THEN
        INSERT INTO public.discounts (
            discount_type, discount_amount, reason, created_by
        ) VALUES (
            p_discount_type, p_discount_amount, 'Applied to sale ' || p_sale_number, v_user_id
        );
    END IF;

    -- 7. Insert Cash Transaction (if applicable)
    IF p_payment_method = 'CASH_SALE' THEN
        INSERT INTO public.cash_transactions (
            cash_session_id, transaction_type, amount, reference_id, reference_type, notes, created_by
        ) VALUES (
            p_cash_session_id, 'CASH_SALE', v_final_total, v_sale_id, 'SALE', 'Sale ' || p_sale_number, v_user_id
        );
    END IF;

    -- 8. Create Lines and Deduct Inventory Atomically
    FOR v_line IN SELECT * FROM jsonb_array_elements(p_lines_json)
    LOOP
        v_item_id := (v_line->>'stock_item_id')::UUID;
        v_qty := (v_line->>'quantity')::NUMERIC;
        v_price := (v_line->>'unit_price')::NUMERIC;
        v_line_total := v_qty * v_price;

        -- Insert Sale Line
        INSERT INTO public.sale_lines (
            sale_id, stock_item_id, quantity, unit_price, line_total
        ) VALUES (
            v_sale_id, v_item_id, v_qty, v_price, v_line_total
        );

        -- Deduct Inventory (create_stock_movement handles location dynamically now)
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

    -- 9. Audit Log
    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, metadata)
    VALUES (v_user_id, 'SALE_PROCESS', 'sales', v_sale_id, p_lines_json);

    RETURN v_sale_id;
END;
$$;


-- ========================================================================================
-- FUNCTION: create_purchase (UPDATED)
-- ========================================================================================
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
    -- 1. Authorization
    IF NOT public.has_any_role(ARRAY['Administrator', 'Manager', 'Inventory Staff']) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;
    v_user_id := (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid());

    -- 2. Calculate Subtotal from Lines (FIXED NULL PROPAGATION)
    FOR v_line IN SELECT * FROM jsonb_array_elements(p_lines_json)
    LOOP
        v_qty := (v_line->>'quantity')::NUMERIC;
        v_cost := (v_line->>'unit_cost')::NUMERIC;
        
        -- CHECK FOR NULL TO PREVENT DB CRASH
        IF v_qty IS NULL OR v_cost IS NULL OR v_qty <= 0 OR v_cost < 0 THEN
            RAISE EXCEPTION 'Invalid quantity or unit cost.';
        END IF;
        
        v_subtotal := v_subtotal + (v_qty * v_cost);
    END LOOP;

    -- 3. Validate Discount & Total
    IF p_discount_amount < 0 OR p_discount_amount > v_subtotal THEN
        RAISE EXCEPTION 'Invalid discount amount.';
    END IF;
    v_final_total := v_subtotal - p_discount_amount;

    -- 4. Create Purchase
    INSERT INTO public.purchases (
        purchase_number, supplier_id, purchase_date, status,
        subtotal, discount_amount, total_amount, payment_method, notes, created_by
    ) VALUES (
        p_purchase_number, p_supplier_id, p_purchase_date, 'ORDERED',
        v_subtotal, p_discount_amount, v_final_total, p_payment_method, p_notes, v_user_id
    ) RETURNING id INTO v_purchase_id;

    -- 5. Create Lines
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

    -- 6. Audit Log
    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, metadata)
    VALUES (v_user_id, 'PURCHASE_CREATE', 'purchases', v_purchase_id, p_lines_json);

    RETURN v_purchase_id;
END;
$$;


-- ========================================================================================
-- FUNCTION: receive_purchase (UPDATED)
-- ========================================================================================
CREATE OR REPLACE FUNCTION public.receive_purchase(
    p_purchase_id UUID,
    p_location_id UUID -- Location to receive the stock into
) RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    v_user_id UUID;
    v_purchase RECORD;
    v_line RECORD;
BEGIN
    -- 1. Authorization
    IF NOT public.has_any_role(ARRAY['Administrator', 'Manager', 'Inventory Staff']) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;
    v_user_id := (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid());

    -- 2. Validate Purchase
    SELECT * INTO v_purchase FROM public.purchases WHERE id = p_purchase_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Purchase not found.';
    END IF;

    IF v_purchase.status != 'ORDERED' THEN
        RAISE EXCEPTION 'Only ORDERED purchases can be received.';
    END IF;

    -- 3. Process Lines & Add Inventory
    FOR v_line IN SELECT * FROM public.purchase_lines WHERE purchase_id = p_purchase_id
    LOOP
        -- Add to Inventory (create_stock_movement handles location dynamically now)
        PERFORM public.create_stock_movement(
            v_line.stock_item_id,
            p_location_id,
            'PURCHASE_IN',
            v_line.quantity,
            'PURCHASE',
            p_purchase_id,
            'Stock received from purchase',
            NULL
        );
    END LOOP;

    -- 4. Update Purchase Status
    UPDATE public.purchases
    SET status = 'RECEIVED',
        received_by = v_user_id,
        received_at = NOW()
    WHERE id = p_purchase_id;

    -- 5. Audit Log
    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, metadata)
    VALUES (v_user_id, 'PURCHASE_RECEIVE', 'purchases', p_purchase_id, NULL);
END;
$$;


-- ========================================================================================
-- FUNCTION: inventory_adjust (UPDATED)
-- ========================================================================================
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
AS $$
DECLARE
    v_movement_type TEXT;
    v_movement_id UUID;
BEGIN
    -- 1. Authorization
    IF NOT public.has_any_role(ARRAY['Administrator', 'Manager', 'Inventory Staff']) THEN
        RAISE EXCEPTION 'Unauthorized: Requires Administrator, Manager, or Inventory Staff role.';
    END IF;

    -- 2. Determine Movement Type
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

    -- 3. Execute Stock Movement (location is auto-resolved internally)
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

    -- 4. Audit Log
    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, metadata)
    VALUES (
        (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()),
        'INVENTORY_ADJUST',
        'stock_movements',
        v_movement_id,
        jsonb_build_object('item', p_stock_item_id, 'type', p_adjustment_type, 'qty', p_quantity)
    );

    RETURN v_movement_id;
END;
$$;

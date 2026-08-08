-- ========================================================================================
-- KUVENTORY RPC: INVENTORY ENGINE FOUNDATION
-- Migration Date: 2026-08-09 10:00:00
-- ========================================================================================

-- ========================================================================================
-- FUNCTION: create_stock_movement (INTERNAL)
-- Description: Core atomic transaction for modifying inventory balances.
--              Locks the inventory row to prevent race conditions.
--              SECURITY DEFINER to bypass RLS since users cannot update balances directly.
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
BEGIN
    -- 1. Identify User
    v_user_id := (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid());
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: User profile not found.';
    END IF;

    -- 2. Validate Inputs
    IF p_quantity <= 0 THEN
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

    -- 3. Lock and retrieve current inventory (Concurrency Control)
    -- UPSERT behavior to handle initial stock creation
    INSERT INTO public.inventory_balances (stock_item_id, location_id, current_quantity)
    VALUES (p_stock_item_id, p_location_id, 0.00)
    ON CONFLICT (stock_item_id, location_id) DO NOTHING;

    SELECT current_quantity INTO v_current_qty
    FROM public.inventory_balances
    WHERE stock_item_id = p_stock_item_id AND location_id = p_location_id
    FOR UPDATE;

    -- 4. Calculate new quantity
    IF v_is_deduction THEN
        v_new_qty := v_current_qty - p_quantity;
    ELSE
        v_new_qty := v_current_qty + p_quantity;
    END IF;

    -- 5. Business Rule: Prevent Negative Inventory
    IF v_new_qty < 0 THEN
        RAISE EXCEPTION 'Insufficient stock for item %. Current: %, Requested: %', p_stock_item_id, v_current_qty, p_quantity;
    END IF;

    -- 6. Update Balance
    UPDATE public.inventory_balances
    SET current_quantity = v_new_qty,
        updated_at = NOW()
    WHERE stock_item_id = p_stock_item_id AND location_id = p_location_id;

    -- 7. Insert Stock Movement (Audit Log)
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


-- ========================================================================================
-- FUNCTION: inventory_adjust
-- Description: Client-facing RPC for manual inventory adjustments.
-- ========================================================================================
CREATE OR REPLACE FUNCTION public.inventory_adjust(
    p_stock_item_id UUID,
    p_location_id UUID,
    p_adjustment_type TEXT, -- 'IN' or 'OUT'
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

    -- 3. Execute Stock Movement
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

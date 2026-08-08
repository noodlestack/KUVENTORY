-- ========================================================================================
-- KUVENTORY RPC: TRANSFERS AND PURCHASES
-- Migration Date: 2026-08-09 11:00:00
-- ========================================================================================

-- ========================================================================================
-- FUNCTION: create_stock_transfer
-- Description: Creates a PENDING stock transfer and deducts inventory from the source.
-- ========================================================================================
CREATE OR REPLACE FUNCTION public.create_stock_transfer(
    p_transfer_number TEXT,
    p_source_location_id UUID,
    p_destination_location_id UUID,
    p_reason TEXT,
    p_notes TEXT,
    p_lines_json JSONB -- Array of { stock_item_id, quantity }
) RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    v_user_id UUID;
    v_transfer_id UUID;
    v_line JSONB;
    v_item_id UUID;
    v_qty NUMERIC(15, 2);
BEGIN
    -- 1. Authorization
    IF NOT public.has_any_role(ARRAY['Administrator', 'Manager', 'Inventory Staff']) THEN
        RAISE EXCEPTION 'Unauthorized: Requires Administrator, Manager, or Inventory Staff role.';
    END IF;
    
    v_user_id := (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid());

    -- 2. Validate Locations
    IF p_source_location_id = p_destination_location_id THEN
        RAISE EXCEPTION 'Source and destination locations cannot be the same.';
    END IF;

    -- 3. Create Transfer Record
    INSERT INTO public.stock_transfers (
        transfer_number, source_location_id, destination_location_id,
        status, reason, notes, requested_by
    ) VALUES (
        p_transfer_number, p_source_location_id, p_destination_location_id,
        'PENDING', p_reason, p_notes, v_user_id
    ) RETURNING id INTO v_transfer_id;

    -- 4. Process Lines & Deduct Source Inventory
    FOR v_line IN SELECT * FROM jsonb_array_elements(p_lines_json)
    LOOP
        v_item_id := (v_line->>'stock_item_id')::UUID;
        v_qty := (v_line->>'quantity')::NUMERIC;

        IF v_qty <= 0 THEN
            RAISE EXCEPTION 'Transfer quantity must be greater than zero.';
        END IF;

        -- Insert Line
        INSERT INTO public.stock_transfer_lines (transfer_id, stock_item_id, quantity)
        VALUES (v_transfer_id, v_item_id, v_qty);

        -- Deduct from Source
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

    -- 5. Audit Log
    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, metadata)
    VALUES (v_user_id, 'TRANSFER_CREATE', 'stock_transfers', v_transfer_id, p_lines_json);

    RETURN v_transfer_id;
END;
$$;


-- ========================================================================================
-- FUNCTION: complete_stock_transfer
-- Description: Completes a PENDING transfer and adds inventory to the destination.
-- ========================================================================================
CREATE OR REPLACE FUNCTION public.complete_stock_transfer(
    p_transfer_id UUID
) RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    v_user_id UUID;
    v_transfer RECORD;
    v_line RECORD;
BEGIN
    -- 1. Authorization
    IF NOT public.has_any_role(ARRAY['Administrator', 'Manager', 'Inventory Staff']) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    v_user_id := (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid());

    -- 2. Validate Transfer
    SELECT * INTO v_transfer FROM public.stock_transfers WHERE id = p_transfer_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Transfer not found.';
    END IF;

    IF v_transfer.status != 'PENDING' THEN
        RAISE EXCEPTION 'Only PENDING transfers can be completed.';
    END IF;

    -- 3. Process Lines & Add Destination Inventory
    FOR v_line IN SELECT * FROM public.stock_transfer_lines WHERE transfer_id = p_transfer_id
    LOOP
        -- Add to Destination
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

    -- 4. Update Transfer Status
    UPDATE public.stock_transfers
    SET status = 'COMPLETED',
        completed_by = v_user_id,
        completed_at = NOW()
    WHERE id = p_transfer_id;

    -- 5. Audit Log
    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, metadata)
    VALUES (v_user_id, 'TRANSFER_COMPLETE', 'stock_transfers', p_transfer_id, NULL);
END;
$$;


-- ========================================================================================
-- FUNCTION: create_purchase
-- Description: Creates an ORDERED purchase with validated subtotals and discounts.
-- ========================================================================================
CREATE OR REPLACE FUNCTION public.create_purchase(
    p_purchase_number TEXT,
    p_supplier_id UUID,
    p_purchase_date DATE,
    p_discount_amount NUMERIC,
    p_payment_method TEXT,
    p_notes TEXT,
    p_lines_json JSONB -- Array of { stock_item_id, quantity, unit_cost }
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

    -- 2. Calculate Subtotal from Lines
    FOR v_line IN SELECT * FROM jsonb_array_elements(p_lines_json)
    LOOP
        v_qty := (v_line->>'quantity')::NUMERIC;
        v_cost := (v_line->>'unit_cost')::NUMERIC;
        IF v_qty <= 0 OR v_cost < 0 THEN
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
-- FUNCTION: receive_purchase
-- Description: Receives an ORDERED purchase, updating inventory and status.
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

    -- 3. Add to Inventory
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

    -- 4. Update Status
    UPDATE public.purchases
    SET status = 'RECEIVED',
        updated_at = NOW()
    WHERE id = p_purchase_id;

    -- 5. Audit Log
    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, metadata)
    VALUES (v_user_id, 'PURCHASE_RECEIVE', 'purchases', p_purchase_id, jsonb_build_object('location_id', p_location_id));
END;
$$;

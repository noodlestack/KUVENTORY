-- ========================================================================================
-- KUVENTORY RPC: SALES, EXPENSES, AND CASH
-- Migration Date: 2026-08-09 12:00:00
-- ========================================================================================

-- ========================================================================================
-- FUNCTION: open_cash_session
-- Description: Opens a new cash session for the current user.
-- ========================================================================================
CREATE OR REPLACE FUNCTION public.open_cash_session(
    p_business_date DATE,
    p_opening_cash NUMERIC
) RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    v_user_id UUID;
    v_session_id UUID;
    v_existing_session UUID;
BEGIN
    -- 1. Authorization
    IF NOT public.has_any_role(ARRAY['Administrator', 'Manager', 'Cashier']) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;
    v_user_id := (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid());

    IF p_opening_cash < 0 THEN
        RAISE EXCEPTION 'Opening cash cannot be negative.';
    END IF;

    -- 2. Check for existing open session
    SELECT id INTO v_existing_session 
    FROM public.cash_sessions 
    WHERE opened_by = v_user_id AND status = 'OPEN' 
    LIMIT 1;

    IF FOUND THEN
        RAISE EXCEPTION 'You already have an open cash session.';
    END IF;

    -- 3. Create Session
    INSERT INTO public.cash_sessions (
        business_date, opening_cash, status, opened_by
    ) VALUES (
        p_business_date, p_opening_cash, 'OPEN', v_user_id
    ) RETURNING id INTO v_session_id;

    -- 4. Audit Log
    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, metadata)
    VALUES (v_user_id, 'CASH_SESSION_OPEN', 'cash_sessions', v_session_id, NULL);

    RETURN v_session_id;
END;
$$;


-- ========================================================================================
-- FUNCTION: close_cash_session
-- Description: Closes a cash session and calculates shorts/overs.
-- ========================================================================================
CREATE OR REPLACE FUNCTION public.close_cash_session(
    p_session_id UUID,
    p_actual_closing_cash NUMERIC
) RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    v_user_id UUID;
    v_session RECORD;
    v_expected_cash NUMERIC(15, 2) := 0.00;
    v_cash_short NUMERIC(15, 2) := 0.00;
    v_cash_over NUMERIC(15, 2) := 0.00;
BEGIN
    -- 1. Authorization
    IF NOT public.has_any_role(ARRAY['Administrator', 'Manager', 'Cashier']) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;
    v_user_id := (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid());

    IF p_actual_closing_cash < 0 THEN
        RAISE EXCEPTION 'Closing cash cannot be negative.';
    END IF;

    -- 2. Validate Session
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

    -- 3. Calculate Expected Cash
    -- Sum of all cash transactions
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

    -- 4. Calculate Short/Over
    IF p_actual_closing_cash < v_expected_cash THEN
        v_cash_short := v_expected_cash - p_actual_closing_cash;
    ELSIF p_actual_closing_cash > v_expected_cash THEN
        v_cash_over := p_actual_closing_cash - v_expected_cash;
    END IF;

    -- 5. Close Session
    UPDATE public.cash_sessions
    SET status = 'CLOSED',
        closing_cash = p_actual_closing_cash,
        cash_short = v_cash_short,
        cash_over = v_cash_over,
        closed_by = v_user_id,
        closed_at = NOW()
    WHERE id = p_session_id;

    -- 6. Audit Log
    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, metadata)
    VALUES (v_user_id, 'CASH_SESSION_CLOSE', 'cash_sessions', p_session_id, jsonb_build_object('expected', v_expected_cash, 'actual', p_actual_closing_cash));
END;
$$;


-- ========================================================================================
-- FUNCTION: process_sale
-- Description: Processes a sale, deducts inventory atomically, records cash transaction.
-- ========================================================================================
CREATE OR REPLACE FUNCTION public.process_sale(
    p_sale_number TEXT,
    p_location_id UUID,
    p_sale_date DATE,
    p_discount_type TEXT, -- e.g., 'NONE', 'SENIOR_CITIZEN', 'PERCENTAGE'
    p_discount_amount NUMERIC,
    p_payment_method TEXT,
    p_cash_session_id UUID,
    p_notes TEXT,
    p_lines_json JSONB -- Array of { stock_item_id, quantity, unit_price }
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

    -- 3. Calculate Subtotal from Lines
    FOR v_line IN SELECT * FROM jsonb_array_elements(p_lines_json)
    LOOP
        v_qty := (v_line->>'quantity')::NUMERIC;
        v_price := (v_line->>'unit_price')::NUMERIC;
        IF v_qty <= 0 OR v_price < 0 THEN
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

        -- Deduct Inventory (Will raise exception and rollback if insufficient stock)
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
-- FUNCTION: create_expense
-- Description: Creates an expense and records a cash transaction if paid via cash.
-- ========================================================================================
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
AS $$
DECLARE
    v_user_id UUID;
    v_expense_id UUID;
    v_final_amount NUMERIC(15, 2);
BEGIN
    -- 1. Authorization
    IF NOT public.has_any_role(ARRAY['Administrator', 'Manager', 'Cashier']) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;
    v_user_id := (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid());

    -- 2. Validation
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

    -- 3. Insert Expense
    INSERT INTO public.expenses (
        expense_number, expense_category_id, supplier_or_payee, description,
        original_amount, discount_amount, final_amount, payment_method, expense_date, notes, created_by
    ) VALUES (
        p_expense_number, p_category_id, p_supplier_or_payee, p_description,
        p_original_amount, p_discount_amount, v_final_amount, p_payment_method, p_expense_date, p_notes, v_user_id
    ) RETURNING id INTO v_expense_id;

    -- 4. Record Cash Transaction
    IF p_payment_method = 'CASH' THEN
        INSERT INTO public.cash_transactions (
            cash_session_id, transaction_type, amount, reference_id, reference_type, notes, created_by
        ) VALUES (
            p_cash_session_id, 'EXPENSE', v_final_amount, v_expense_id, 'EXPENSE', p_description, v_user_id
        );
    END IF;

    -- 5. Audit Log
    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, metadata)
    VALUES (v_user_id, 'EXPENSE_CREATE', 'expenses', v_expense_id, NULL);

    RETURN v_expense_id;
END;
$$;

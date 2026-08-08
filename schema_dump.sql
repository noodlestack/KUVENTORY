


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "hypopg" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "index_advisor" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."close_cash_session"("p_session_id" "uuid", "p_actual_closing_cash" numeric) RETURNS "void"
    LANGUAGE "plpgsql"
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


ALTER FUNCTION "public"."close_cash_session"("p_session_id" "uuid", "p_actual_closing_cash" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."complete_stock_transfer"("p_transfer_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
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


ALTER FUNCTION "public"."complete_stock_transfer"("p_transfer_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_expense"("p_expense_number" "text", "p_category_id" "uuid", "p_supplier_or_payee" "text", "p_expense_date" "date", "p_original_amount" numeric, "p_discount_amount" numeric, "p_payment_method" "text", "p_cash_session_id" "uuid", "p_description" "text", "p_notes" "text") RETURNS "uuid"
    LANGUAGE "plpgsql"
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


ALTER FUNCTION "public"."create_expense"("p_expense_number" "text", "p_category_id" "uuid", "p_supplier_or_payee" "text", "p_expense_date" "date", "p_original_amount" numeric, "p_discount_amount" numeric, "p_payment_method" "text", "p_cash_session_id" "uuid", "p_description" "text", "p_notes" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_purchase"("p_purchase_number" "text", "p_supplier_id" "uuid", "p_purchase_date" "date", "p_discount_amount" numeric, "p_payment_method" "text", "p_notes" "text", "p_lines_json" "jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql"
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


ALTER FUNCTION "public"."create_purchase"("p_purchase_number" "text", "p_supplier_id" "uuid", "p_purchase_date" "date", "p_discount_amount" numeric, "p_payment_method" "text", "p_notes" "text", "p_lines_json" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_stock_movement"("p_stock_item_id" "uuid", "p_location_id" "uuid", "p_movement_type" "text", "p_quantity" numeric, "p_reference_type" "text" DEFAULT NULL::"text", "p_reference_id" "uuid" DEFAULT NULL::"uuid", "p_reason" "text" DEFAULT NULL::"text", "p_notes" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."create_stock_movement"("p_stock_item_id" "uuid", "p_location_id" "uuid", "p_movement_type" "text", "p_quantity" numeric, "p_reference_type" "text", "p_reference_id" "uuid", "p_reason" "text", "p_notes" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_stock_transfer"("p_transfer_number" "text", "p_source_location_id" "uuid", "p_destination_location_id" "uuid", "p_reason" "text", "p_notes" "text", "p_lines_json" "jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql"
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


ALTER FUNCTION "public"."create_stock_transfer"("p_transfer_number" "text", "p_source_location_id" "uuid", "p_destination_location_id" "uuid", "p_reason" "text", "p_notes" "text", "p_lines_json" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_any_role"("role_names" "text"[]) RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."has_any_role"("role_names" "text"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_role"("role_name" "text") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."has_role"("role_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."inventory_adjust"("p_stock_item_id" "uuid", "p_location_id" "uuid", "p_adjustment_type" "text", "p_quantity" numeric, "p_reason" "text", "p_notes" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql"
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


ALTER FUNCTION "public"."inventory_adjust"("p_stock_item_id" "uuid", "p_location_id" "uuid", "p_adjustment_type" "text", "p_quantity" numeric, "p_reason" "text", "p_notes" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."open_cash_session"("p_business_date" "date", "p_opening_cash" numeric) RETURNS "uuid"
    LANGUAGE "plpgsql"
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


ALTER FUNCTION "public"."open_cash_session"("p_business_date" "date", "p_opening_cash" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."process_sale"("p_sale_number" "text", "p_location_id" "uuid", "p_sale_date" "date", "p_discount_type" "text", "p_discount_amount" numeric, "p_payment_method" "text", "p_cash_session_id" "uuid", "p_notes" "text", "p_lines_json" "jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql"
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


ALTER FUNCTION "public"."process_sale"("p_sale_number" "text", "p_location_id" "uuid", "p_sale_date" "date", "p_discount_type" "text", "p_discount_amount" numeric, "p_payment_method" "text", "p_cash_session_id" "uuid", "p_notes" "text", "p_lines_json" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."receive_purchase"("p_purchase_id" "uuid", "p_location_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
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


ALTER FUNCTION "public"."receive_purchase"("p_purchase_id" "uuid", "p_location_id" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "action" "text" NOT NULL,
    "entity_type" "text" NOT NULL,
    "entity_id" "uuid",
    "old_values" "jsonb",
    "new_values" "jsonb",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cash_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "business_date" "date" NOT NULL,
    "opening_cash" numeric(15,2) DEFAULT 0.00 NOT NULL,
    "closing_cash" numeric(15,2),
    "cash_short" numeric(15,2) DEFAULT 0.00,
    "cash_over" numeric(15,2) DEFAULT 0.00,
    "status" "text" NOT NULL,
    "opened_by" "uuid",
    "closed_by" "uuid",
    "opened_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "closed_at" timestamp with time zone,
    CONSTRAINT "cash_sessions_cash_over_check" CHECK (("cash_over" >= (0)::numeric)),
    CONSTRAINT "cash_sessions_cash_short_check" CHECK (("cash_short" >= (0)::numeric)),
    CONSTRAINT "cash_sessions_closing_cash_check" CHECK (("closing_cash" >= (0)::numeric)),
    CONSTRAINT "cash_sessions_opening_cash_check" CHECK (("opening_cash" >= (0)::numeric)),
    CONSTRAINT "cash_sessions_status_check" CHECK (("status" = ANY (ARRAY['OPEN'::"text", 'CLOSED'::"text"])))
);


ALTER TABLE "public"."cash_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cash_transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "cash_session_id" "uuid" NOT NULL,
    "transaction_type" "text" NOT NULL,
    "amount" numeric(15,2) NOT NULL,
    "reference_id" "uuid",
    "reference_type" "text",
    "notes" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "cash_transactions_transaction_type_check" CHECK (("transaction_type" = ANY (ARRAY['CASH_SALE'::"text", 'GCASH'::"text", 'MAYA'::"text", 'CARD'::"text", 'BANK_TRANSFER'::"text", 'EXPENSE'::"text", 'DEPOSIT'::"text", 'WITHDRAWAL'::"text", 'ADJUSTMENT'::"text"])))
);


ALTER TABLE "public"."cash_transactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "code" "text",
    "description" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "archived_at" timestamp with time zone
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."daily_inventory_lines" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "daily_inventory_period_id" "uuid" NOT NULL,
    "stock_item_id" "uuid" NOT NULL,
    "beginning_stock" numeric(15,2) DEFAULT 0.00 NOT NULL,
    "added_stock" numeric(15,2) DEFAULT 0.00 NOT NULL,
    "total_stock" numeric(15,2) DEFAULT 0.00 NOT NULL,
    "am_sales" numeric(15,2) DEFAULT 0.00 NOT NULL,
    "pm_sales" numeric(15,2) DEFAULT 0.00 NOT NULL,
    "total_daily_sales" numeric(15,2) DEFAULT 0.00 NOT NULL,
    "calculated_ending_stock" numeric(15,2) DEFAULT 0.00 NOT NULL,
    "physical_ending_stock" numeric(15,2),
    "variance" numeric(15,2),
    "variance_status" "text" DEFAULT 'NO_VARIANCE'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "daily_inventory_lines_added_stock_check" CHECK (("added_stock" >= (0)::numeric)),
    CONSTRAINT "daily_inventory_lines_am_sales_check" CHECK (("am_sales" >= (0)::numeric)),
    CONSTRAINT "daily_inventory_lines_beginning_stock_check" CHECK (("beginning_stock" >= (0)::numeric)),
    CONSTRAINT "daily_inventory_lines_pm_sales_check" CHECK (("pm_sales" >= (0)::numeric)),
    CONSTRAINT "daily_inventory_lines_total_daily_sales_check" CHECK (("total_daily_sales" >= (0)::numeric)),
    CONSTRAINT "daily_inventory_lines_total_stock_check" CHECK (("total_stock" >= (0)::numeric)),
    CONSTRAINT "daily_inventory_lines_variance_status_check" CHECK (("variance_status" = ANY (ARRAY['NO_VARIANCE'::"text", 'PENDING_REVIEW'::"text", 'ACKNOWLEDGED'::"text", 'ADJUSTED'::"text"])))
);


ALTER TABLE "public"."daily_inventory_lines" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."daily_inventory_periods" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "business_date" "date" NOT NULL,
    "location_id" "uuid" NOT NULL,
    "status" "text" NOT NULL,
    "opened_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "closed_at" timestamp with time zone,
    "opened_by" "uuid",
    "closed_by" "uuid",
    "reopened_at" timestamp with time zone,
    "reopened_by" "uuid",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "daily_inventory_periods_status_check" CHECK (("status" = ANY (ARRAY['OPEN'::"text", 'CLOSING'::"text", 'CLOSED'::"text", 'REOPENED'::"text"])))
);


ALTER TABLE "public"."daily_inventory_periods" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."discounts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "discount_type" "text" NOT NULL,
    "discount_percentage" numeric(5,2),
    "fixed_discount_amount" numeric(15,2),
    "discount_amount" numeric(15,2) NOT NULL,
    "reason" "text",
    "reference_number" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "discounts_discount_amount_check" CHECK (("discount_amount" >= (0)::numeric)),
    CONSTRAINT "discounts_discount_percentage_check" CHECK ((("discount_percentage" >= (0)::numeric) AND ("discount_percentage" <= (100)::numeric))),
    CONSTRAINT "discounts_discount_type_check" CHECK (("discount_type" = ANY (ARRAY['PERCENTAGE'::"text", 'FIXED_AMOUNT'::"text", 'SENIOR_CITIZEN'::"text", 'PWD'::"text", 'DELIVERY_DRIVER'::"text", 'EMPLOYEE'::"text", 'PROMOTIONAL'::"text", 'SUPPLIER'::"text", 'VENDOR'::"text", 'MANUAL'::"text", 'CUSTOM'::"text"]))),
    CONSTRAINT "discounts_fixed_discount_amount_check" CHECK (("fixed_discount_amount" >= (0)::numeric))
);


ALTER TABLE "public"."discounts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."expense_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."expense_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."expenses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "expense_number" "text" NOT NULL,
    "expense_category_id" "uuid" NOT NULL,
    "supplier_or_payee" "text",
    "description" "text",
    "original_amount" numeric(15,2) NOT NULL,
    "discount_amount" numeric(15,2) DEFAULT 0.00 NOT NULL,
    "final_amount" numeric(15,2) NOT NULL,
    "payment_method" "text",
    "reference_number" "text",
    "expense_date" "date" NOT NULL,
    "notes" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "expenses_check" CHECK ((("discount_amount" >= (0)::numeric) AND ("discount_amount" <= "original_amount"))),
    CONSTRAINT "expenses_final_amount_check" CHECK (("final_amount" >= (0)::numeric)),
    CONSTRAINT "expenses_original_amount_check" CHECK (("original_amount" >= (0)::numeric))
);


ALTER TABLE "public"."expenses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."inventory_balances" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "stock_item_id" "uuid" NOT NULL,
    "location_id" "uuid" NOT NULL,
    "current_quantity" numeric(15,2) DEFAULT 0.00 NOT NULL,
    "minimum_stock_level_override" numeric(15,2),
    "reorder_level_override" numeric(15,2),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "inventory_balances_current_quantity_check" CHECK (("current_quantity" >= (0)::numeric)),
    CONSTRAINT "inventory_balances_minimum_stock_level_override_check" CHECK (("minimum_stock_level_override" >= (0)::numeric)),
    CONSTRAINT "inventory_balances_reorder_level_override_check" CHECK (("reorder_level_override" >= (0)::numeric))
);


ALTER TABLE "public"."inventory_balances" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."inventory_locations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."inventory_locations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "message" "text" NOT NULL,
    "is_read" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "read_at" timestamp with time zone
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "auth_user_id" "uuid",
    "full_name" "text",
    "phone" "text",
    "avatar_url" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."purchase_lines" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "purchase_id" "uuid" NOT NULL,
    "stock_item_id" "uuid" NOT NULL,
    "quantity" numeric(15,2) NOT NULL,
    "unit_cost" numeric(15,2) NOT NULL,
    "line_total" numeric(15,2) NOT NULL,
    CONSTRAINT "purchase_lines_line_total_check" CHECK (("line_total" >= (0)::numeric)),
    CONSTRAINT "purchase_lines_quantity_check" CHECK (("quantity" > (0)::numeric)),
    CONSTRAINT "purchase_lines_unit_cost_check" CHECK (("unit_cost" >= (0)::numeric))
);


ALTER TABLE "public"."purchase_lines" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."purchases" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "purchase_number" "text" NOT NULL,
    "supplier_id" "uuid" NOT NULL,
    "purchase_date" "date" NOT NULL,
    "status" "text" NOT NULL,
    "subtotal" numeric(15,2) DEFAULT 0.00 NOT NULL,
    "discount_amount" numeric(15,2) DEFAULT 0.00 NOT NULL,
    "total_amount" numeric(15,2) DEFAULT 0.00 NOT NULL,
    "payment_method" "text",
    "notes" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "purchases_discount_amount_check" CHECK (("discount_amount" >= (0)::numeric)),
    CONSTRAINT "purchases_status_check" CHECK (("status" = ANY (ARRAY['DRAFT'::"text", 'ORDERED'::"text", 'RECEIVED'::"text", 'CANCELLED'::"text"]))),
    CONSTRAINT "purchases_subtotal_check" CHECK (("subtotal" >= (0)::numeric)),
    CONSTRAINT "purchases_total_amount_check" CHECK (("total_amount" >= (0)::numeric))
);


ALTER TABLE "public"."purchases" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sale_lines" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "sale_id" "uuid" NOT NULL,
    "stock_item_id" "uuid" NOT NULL,
    "quantity" numeric(15,2) NOT NULL,
    "unit_price" numeric(15,2) NOT NULL,
    "line_total" numeric(15,2) NOT NULL,
    CONSTRAINT "sale_lines_line_total_check" CHECK (("line_total" >= (0)::numeric)),
    CONSTRAINT "sale_lines_quantity_check" CHECK (("quantity" > (0)::numeric)),
    CONSTRAINT "sale_lines_unit_price_check" CHECK (("unit_price" >= (0)::numeric))
);


ALTER TABLE "public"."sale_lines" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sales" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "sale_number" "text" NOT NULL,
    "sale_date" "date" NOT NULL,
    "status" "text" NOT NULL,
    "subtotal" numeric(15,2) DEFAULT 0.00 NOT NULL,
    "discount_amount" numeric(15,2) DEFAULT 0.00 NOT NULL,
    "total_amount" numeric(15,2) DEFAULT 0.00 NOT NULL,
    "payment_method" "text",
    "notes" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "sales_discount_amount_check" CHECK (("discount_amount" >= (0)::numeric)),
    CONSTRAINT "sales_status_check" CHECK (("status" = ANY (ARRAY['DRAFT'::"text", 'COMPLETED'::"text", 'VOIDED'::"text", 'REFUNDED'::"text"]))),
    CONSTRAINT "sales_subtotal_check" CHECK (("subtotal" >= (0)::numeric)),
    CONSTRAINT "sales_total_amount_check" CHECK (("total_amount" >= (0)::numeric))
);


ALTER TABLE "public"."sales" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."stock_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "stock_code" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "category_id" "uuid",
    "unit_of_measure_id" "uuid",
    "tracking_type" "text" NOT NULL,
    "cost_price" numeric(15,2) DEFAULT 0.00 NOT NULL,
    "selling_price" numeric(15,2) DEFAULT 0.00 NOT NULL,
    "minimum_stock_level" numeric(15,2) DEFAULT 0.00 NOT NULL,
    "reorder_level" numeric(15,2) DEFAULT 0.00 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "archived_at" timestamp with time zone,
    CONSTRAINT "stock_items_cost_price_check" CHECK (("cost_price" >= (0)::numeric)),
    CONSTRAINT "stock_items_minimum_stock_level_check" CHECK (("minimum_stock_level" >= (0)::numeric)),
    CONSTRAINT "stock_items_reorder_level_check" CHECK (("reorder_level" >= (0)::numeric)),
    CONSTRAINT "stock_items_selling_price_check" CHECK (("selling_price" >= (0)::numeric))
);


ALTER TABLE "public"."stock_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."stock_movements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "stock_item_id" "uuid" NOT NULL,
    "location_id" "uuid" NOT NULL,
    "movement_type" "text" NOT NULL,
    "quantity" numeric(15,2) NOT NULL,
    "previous_quantity" numeric(15,2),
    "new_quantity" numeric(15,2),
    "reference_type" "text",
    "reference_id" "uuid",
    "reason" "text",
    "notes" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "stock_movements_movement_type_check" CHECK (("movement_type" = ANY (ARRAY['OPENING_BALANCE'::"text", 'MANUAL_RECEIPT'::"text", 'PURCHASE_IN'::"text", 'SALE_OUT'::"text", 'SALE_OUT_AM'::"text", 'SALE_OUT_PM'::"text", 'TRANSFER_IN'::"text", 'TRANSFER_OUT'::"text", 'ADJUSTMENT_IN'::"text", 'ADJUSTMENT_OUT'::"text", 'DAMAGE'::"text", 'EXPIRY'::"text", 'LOSS'::"text", 'CORRECTION'::"text"])))
);


ALTER TABLE "public"."stock_movements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."stock_transfer_lines" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "transfer_id" "uuid" NOT NULL,
    "stock_item_id" "uuid" NOT NULL,
    "quantity" numeric(15,2) NOT NULL,
    CONSTRAINT "stock_transfer_lines_quantity_check" CHECK (("quantity" > (0)::numeric))
);


ALTER TABLE "public"."stock_transfer_lines" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."stock_transfers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "transfer_number" "text" NOT NULL,
    "source_location_id" "uuid" NOT NULL,
    "destination_location_id" "uuid" NOT NULL,
    "status" "text" NOT NULL,
    "reason" "text",
    "notes" "text",
    "requested_by" "uuid",
    "completed_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "completed_at" timestamp with time zone,
    CONSTRAINT "stock_transfers_check" CHECK (("source_location_id" <> "destination_location_id")),
    CONSTRAINT "stock_transfers_status_check" CHECK (("status" = ANY (ARRAY['DRAFT'::"text", 'PENDING'::"text", 'COMPLETED'::"text", 'CANCELLED'::"text"])))
);


ALTER TABLE "public"."stock_transfers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."supplier_discount_policies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "supplier_id" "uuid" NOT NULL,
    "discount_type" "text" NOT NULL,
    "discount_percentage" numeric(5,2),
    "fixed_discount_amount" numeric(15,2),
    "discount_terms" "text",
    "valid_from" timestamp with time zone,
    "valid_until" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "supplier_discount_policies_discount_percentage_check" CHECK ((("discount_percentage" >= (0)::numeric) AND ("discount_percentage" <= (100)::numeric))),
    CONSTRAINT "supplier_discount_policies_discount_type_check" CHECK (("discount_type" = ANY (ARRAY['PERCENTAGE'::"text", 'FIXED_AMOUNT'::"text"]))),
    CONSTRAINT "supplier_discount_policies_fixed_discount_amount_check" CHECK (("fixed_discount_amount" >= (0)::numeric))
);


ALTER TABLE "public"."supplier_discount_policies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."suppliers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "supplier_code" "text" NOT NULL,
    "name" "text" NOT NULL,
    "contact_person" "text",
    "phone" "text",
    "email" "text",
    "address" "text",
    "notes" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "archived_at" timestamp with time zone
);


ALTER TABLE "public"."suppliers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."units_of_measure" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."units_of_measure" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "role_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."view_cash_report" WITH ("security_invoker"='true') AS
 SELECT "cs"."id" AS "session_id",
    "cs"."business_date",
    "cs"."status",
    "cs"."opening_cash",
    "cs"."closing_cash",
    "cs"."cash_short",
    "cs"."cash_over",
    "cs"."opened_by",
    "p1"."full_name" AS "opened_by_name",
    "cs"."closed_by",
    "p2"."full_name" AS "closed_by_name",
    "cs"."opened_at",
    "cs"."closed_at",
    ( SELECT COALESCE("sum"("ct"."amount"), (0)::numeric) AS "coalesce"
           FROM "public"."cash_transactions" "ct"
          WHERE (("ct"."cash_session_id" = "cs"."id") AND ("ct"."transaction_type" = 'CASH_SALE'::"text"))) AS "cash_sales",
    ( SELECT COALESCE("sum"("ct"."amount"), (0)::numeric) AS "coalesce"
           FROM "public"."cash_transactions" "ct"
          WHERE (("ct"."cash_session_id" = "cs"."id") AND ("ct"."transaction_type" = ANY (ARRAY['DEPOSIT'::"text", 'ADJUSTMENT'::"text"])) AND ("ct"."amount" > (0)::numeric))) AS "cash_additions",
    ( SELECT COALESCE("sum"("ct"."amount"), (0)::numeric) AS "coalesce"
           FROM "public"."cash_transactions" "ct"
          WHERE (("ct"."cash_session_id" = "cs"."id") AND ("ct"."transaction_type" = ANY (ARRAY['WITHDRAWAL'::"text", 'EXPENSE'::"text"])) AND ("ct"."amount" > (0)::numeric))) AS "cash_withdrawals"
   FROM (("public"."cash_sessions" "cs"
     LEFT JOIN "public"."profiles" "p1" ON (("cs"."opened_by" = "p1"."id")))
     LEFT JOIN "public"."profiles" "p2" ON (("cs"."closed_by" = "p2"."id")));


ALTER VIEW "public"."view_cash_report" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."view_expense_report" WITH ("security_invoker"='true') AS
 SELECT "e"."id" AS "expense_id",
    "e"."expense_number",
    "e"."expense_date",
    "e"."expense_category_id",
    "c"."name" AS "category_name",
    "e"."description",
    "e"."original_amount",
    "e"."discount_amount",
    "e"."final_amount",
    "e"."payment_method",
    "e"."supplier_or_payee",
    "e"."created_by",
    "p"."full_name" AS "created_by_name",
    "e"."created_at"
   FROM (("public"."expenses" "e"
     JOIN "public"."expense_categories" "c" ON (("e"."expense_category_id" = "c"."id")))
     LEFT JOIN "public"."profiles" "p" ON (("e"."created_by" = "p"."id")));


ALTER VIEW "public"."view_expense_report" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."view_inventory_report" WITH ("security_invoker"='true') AS
 SELECT "ib"."id" AS "inventory_balance_id",
    "ib"."location_id",
    "l"."name" AS "location_name",
    "si"."id" AS "stock_item_id",
    "si"."stock_code",
    "si"."name" AS "stock_name",
    "si"."tracking_type",
    "c"."name" AS "category_name",
    "uom"."code" AS "unit_code",
    "ib"."current_quantity",
    COALESCE("ib"."minimum_stock_level_override", "si"."minimum_stock_level") AS "minimum_stock_level",
    COALESCE("ib"."reorder_level_override", "si"."reorder_level") AS "reorder_level",
    "si"."cost_price",
    "si"."selling_price",
    ("ib"."current_quantity" * "si"."cost_price") AS "inventory_value",
        CASE
            WHEN ("ib"."current_quantity" <= (0)::numeric) THEN 'OUT_OF_STOCK'::"text"
            WHEN ("ib"."current_quantity" <= COALESCE("ib"."minimum_stock_level_override", "si"."minimum_stock_level")) THEN 'LOW_STOCK'::"text"
            ELSE 'OPTIMAL'::"text"
        END AS "stock_status",
    "si"."is_active" AS "item_active",
    "ib"."updated_at" AS "last_updated"
   FROM (((("public"."inventory_balances" "ib"
     JOIN "public"."stock_items" "si" ON (("ib"."stock_item_id" = "si"."id")))
     JOIN "public"."inventory_locations" "l" ON (("ib"."location_id" = "l"."id")))
     LEFT JOIN "public"."categories" "c" ON (("si"."category_id" = "c"."id")))
     LEFT JOIN "public"."units_of_measure" "uom" ON (("si"."unit_of_measure_id" = "uom"."id")));


ALTER VIEW "public"."view_inventory_report" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."view_purchase_report" WITH ("security_invoker"='true') AS
 SELECT "p"."id" AS "purchase_id",
    "p"."purchase_number",
    "p"."purchase_date",
    "p"."status",
    "p"."subtotal",
    "p"."discount_amount",
    "p"."total_amount",
    "p"."payment_method",
    "p"."supplier_id",
    "s"."name" AS "supplier_name",
    "p"."created_by",
    "prof"."full_name" AS "created_by_name",
    "p"."created_at",
    ( SELECT "sum"("pl"."quantity") AS "sum"
           FROM "public"."purchase_lines" "pl"
          WHERE ("pl"."purchase_id" = "p"."id")) AS "total_items"
   FROM (("public"."purchases" "p"
     LEFT JOIN "public"."suppliers" "s" ON (("p"."supplier_id" = "s"."id")))
     LEFT JOIN "public"."profiles" "prof" ON (("p"."created_by" = "prof"."id")));


ALTER VIEW "public"."view_purchase_report" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."view_sales_report" WITH ("security_invoker"='true') AS
 SELECT "s"."id" AS "sale_id",
    "s"."sale_number",
    "s"."sale_date",
    "s"."status",
    "s"."subtotal",
    "s"."discount_amount",
    "s"."total_amount",
    "s"."payment_method",
    "s"."created_by" AS "cashier_id",
    "p"."full_name" AS "cashier_name",
    "s"."created_at",
    ( SELECT "sum"("sl"."quantity") AS "sum"
           FROM "public"."sale_lines" "sl"
          WHERE ("sl"."sale_id" = "s"."id")) AS "total_items"
   FROM ("public"."sales" "s"
     LEFT JOIN "public"."profiles" "p" ON (("s"."created_by" = "p"."id")));


ALTER VIEW "public"."view_sales_report" OWNER TO "postgres";


ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cash_sessions"
    ADD CONSTRAINT "cash_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cash_transactions"
    ADD CONSTRAINT "cash_transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."daily_inventory_lines"
    ADD CONSTRAINT "daily_inventory_lines_daily_inventory_period_id_stock_item__key" UNIQUE ("daily_inventory_period_id", "stock_item_id");



ALTER TABLE ONLY "public"."daily_inventory_lines"
    ADD CONSTRAINT "daily_inventory_lines_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."daily_inventory_periods"
    ADD CONSTRAINT "daily_inventory_periods_business_date_location_id_key" UNIQUE ("business_date", "location_id");



ALTER TABLE ONLY "public"."daily_inventory_periods"
    ADD CONSTRAINT "daily_inventory_periods_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."discounts"
    ADD CONSTRAINT "discounts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."expense_categories"
    ADD CONSTRAINT "expense_categories_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."expense_categories"
    ADD CONSTRAINT "expense_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_expense_number_key" UNIQUE ("expense_number");



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inventory_balances"
    ADD CONSTRAINT "inventory_balances_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inventory_balances"
    ADD CONSTRAINT "inventory_balances_stock_item_id_location_id_key" UNIQUE ("stock_item_id", "location_id");



ALTER TABLE ONLY "public"."inventory_locations"
    ADD CONSTRAINT "inventory_locations_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."inventory_locations"
    ADD CONSTRAINT "inventory_locations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_auth_user_id_key" UNIQUE ("auth_user_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."purchase_lines"
    ADD CONSTRAINT "purchase_lines_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."purchases"
    ADD CONSTRAINT "purchases_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."purchases"
    ADD CONSTRAINT "purchases_purchase_number_key" UNIQUE ("purchase_number");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sale_lines"
    ADD CONSTRAINT "sale_lines_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sales"
    ADD CONSTRAINT "sales_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sales"
    ADD CONSTRAINT "sales_sale_number_key" UNIQUE ("sale_number");



ALTER TABLE ONLY "public"."stock_items"
    ADD CONSTRAINT "stock_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."stock_items"
    ADD CONSTRAINT "stock_items_stock_code_key" UNIQUE ("stock_code");



ALTER TABLE ONLY "public"."stock_movements"
    ADD CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."stock_transfer_lines"
    ADD CONSTRAINT "stock_transfer_lines_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."stock_transfers"
    ADD CONSTRAINT "stock_transfers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."stock_transfers"
    ADD CONSTRAINT "stock_transfers_transfer_number_key" UNIQUE ("transfer_number");



ALTER TABLE ONLY "public"."supplier_discount_policies"
    ADD CONSTRAINT "supplier_discount_policies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."suppliers"
    ADD CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."suppliers"
    ADD CONSTRAINT "suppliers_supplier_code_key" UNIQUE ("supplier_code");



ALTER TABLE ONLY "public"."units_of_measure"
    ADD CONSTRAINT "units_of_measure_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."units_of_measure"
    ADD CONSTRAINT "units_of_measure_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_profile_id_role_id_key" UNIQUE ("profile_id", "role_id");



CREATE INDEX "audit_logs_created_at_idx" ON "public"."audit_logs" USING "btree" ("created_at");



CREATE UNIQUE INDEX "categories_name_active_idx" ON "public"."categories" USING "btree" ("name") WHERE ("is_active" = true);



CREATE INDEX "expenses_expense_date_idx" ON "public"."expenses" USING "btree" ("expense_date");



CREATE INDEX "inventory_balances_location_id_idx" ON "public"."inventory_balances" USING "btree" ("location_id");



CREATE INDEX "inventory_balances_stock_item_id_idx" ON "public"."inventory_balances" USING "btree" ("stock_item_id");



CREATE INDEX "notifications_user_id_idx" ON "public"."notifications" USING "btree" ("user_id");



CREATE INDEX "purchases_purchase_date_idx" ON "public"."purchases" USING "btree" ("purchase_date");



CREATE INDEX "sales_sale_date_idx" ON "public"."sales" USING "btree" ("sale_date");



CREATE INDEX "stock_items_category_id_idx" ON "public"."stock_items" USING "btree" ("category_id");



CREATE INDEX "stock_items_name_idx" ON "public"."stock_items" USING "btree" ("name");



CREATE INDEX "stock_movements_created_at_idx" ON "public"."stock_movements" USING "btree" ("created_at");



CREATE INDEX "stock_movements_location_id_idx" ON "public"."stock_movements" USING "btree" ("location_id");



CREATE INDEX "stock_movements_stock_item_id_idx" ON "public"."stock_movements" USING "btree" ("stock_item_id");



CREATE OR REPLACE TRIGGER "handle_updated_at_categories" BEFORE UPDATE ON "public"."categories" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at_daily_inventory_lines" BEFORE UPDATE ON "public"."daily_inventory_lines" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at_daily_inventory_periods" BEFORE UPDATE ON "public"."daily_inventory_periods" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at_expense_categories" BEFORE UPDATE ON "public"."expense_categories" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at_expenses" BEFORE UPDATE ON "public"."expenses" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at_inventory_balances" BEFORE UPDATE ON "public"."inventory_balances" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at_inventory_locations" BEFORE UPDATE ON "public"."inventory_locations" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at_profiles" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at_purchases" BEFORE UPDATE ON "public"."purchases" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at_roles" BEFORE UPDATE ON "public"."roles" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at_sales" BEFORE UPDATE ON "public"."sales" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at_stock_items" BEFORE UPDATE ON "public"."stock_items" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at_supplier_discount_policies" BEFORE UPDATE ON "public"."supplier_discount_policies" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at_suppliers" BEFORE UPDATE ON "public"."suppliers" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at_uom" BEFORE UPDATE ON "public"."units_of_measure" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."cash_sessions"
    ADD CONSTRAINT "cash_sessions_closed_by_fkey" FOREIGN KEY ("closed_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."cash_sessions"
    ADD CONSTRAINT "cash_sessions_opened_by_fkey" FOREIGN KEY ("opened_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."cash_transactions"
    ADD CONSTRAINT "cash_transactions_cash_session_id_fkey" FOREIGN KEY ("cash_session_id") REFERENCES "public"."cash_sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cash_transactions"
    ADD CONSTRAINT "cash_transactions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."daily_inventory_lines"
    ADD CONSTRAINT "daily_inventory_lines_daily_inventory_period_id_fkey" FOREIGN KEY ("daily_inventory_period_id") REFERENCES "public"."daily_inventory_periods"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."daily_inventory_lines"
    ADD CONSTRAINT "daily_inventory_lines_stock_item_id_fkey" FOREIGN KEY ("stock_item_id") REFERENCES "public"."stock_items"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."daily_inventory_periods"
    ADD CONSTRAINT "daily_inventory_periods_closed_by_fkey" FOREIGN KEY ("closed_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."daily_inventory_periods"
    ADD CONSTRAINT "daily_inventory_periods_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."inventory_locations"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."daily_inventory_periods"
    ADD CONSTRAINT "daily_inventory_periods_opened_by_fkey" FOREIGN KEY ("opened_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."daily_inventory_periods"
    ADD CONSTRAINT "daily_inventory_periods_reopened_by_fkey" FOREIGN KEY ("reopened_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."discounts"
    ADD CONSTRAINT "discounts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_expense_category_id_fkey" FOREIGN KEY ("expense_category_id") REFERENCES "public"."expense_categories"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."inventory_balances"
    ADD CONSTRAINT "inventory_balances_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."inventory_locations"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."inventory_balances"
    ADD CONSTRAINT "inventory_balances_stock_item_id_fkey" FOREIGN KEY ("stock_item_id") REFERENCES "public"."stock_items"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_auth_user_id_fkey" FOREIGN KEY ("auth_user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."purchase_lines"
    ADD CONSTRAINT "purchase_lines_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "public"."purchases"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."purchase_lines"
    ADD CONSTRAINT "purchase_lines_stock_item_id_fkey" FOREIGN KEY ("stock_item_id") REFERENCES "public"."stock_items"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."purchases"
    ADD CONSTRAINT "purchases_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."purchases"
    ADD CONSTRAINT "purchases_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."sale_lines"
    ADD CONSTRAINT "sale_lines_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sale_lines"
    ADD CONSTRAINT "sale_lines_stock_item_id_fkey" FOREIGN KEY ("stock_item_id") REFERENCES "public"."stock_items"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."sales"
    ADD CONSTRAINT "sales_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."stock_items"
    ADD CONSTRAINT "stock_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."stock_items"
    ADD CONSTRAINT "stock_items_unit_of_measure_id_fkey" FOREIGN KEY ("unit_of_measure_id") REFERENCES "public"."units_of_measure"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."stock_movements"
    ADD CONSTRAINT "stock_movements_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."stock_movements"
    ADD CONSTRAINT "stock_movements_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."inventory_locations"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."stock_movements"
    ADD CONSTRAINT "stock_movements_stock_item_id_fkey" FOREIGN KEY ("stock_item_id") REFERENCES "public"."stock_items"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."stock_transfer_lines"
    ADD CONSTRAINT "stock_transfer_lines_stock_item_id_fkey" FOREIGN KEY ("stock_item_id") REFERENCES "public"."stock_items"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."stock_transfer_lines"
    ADD CONSTRAINT "stock_transfer_lines_transfer_id_fkey" FOREIGN KEY ("transfer_id") REFERENCES "public"."stock_transfers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."stock_transfers"
    ADD CONSTRAINT "stock_transfers_completed_by_fkey" FOREIGN KEY ("completed_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."stock_transfers"
    ADD CONSTRAINT "stock_transfers_destination_location_id_fkey" FOREIGN KEY ("destination_location_id") REFERENCES "public"."inventory_locations"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."stock_transfers"
    ADD CONSTRAINT "stock_transfers_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."stock_transfers"
    ADD CONSTRAINT "stock_transfers_source_location_id_fkey" FOREIGN KEY ("source_location_id") REFERENCES "public"."inventory_locations"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."supplier_discount_policies"
    ADD CONSTRAINT "supplier_discount_policies_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE CASCADE;



CREATE POLICY "Admin can manage all notifications" ON "public"."notifications" TO "authenticated" USING ("public"."has_role"('Administrator'::"text"));



CREATE POLICY "Admin can view audit logs" ON "public"."audit_logs" FOR SELECT TO "authenticated" USING ("public"."has_role"('Administrator'::"text"));



CREATE POLICY "Admin full access to profiles" ON "public"."profiles" TO "authenticated" USING ("public"."has_role"('Administrator'::"text"));



CREATE POLICY "Admin full access to roles" ON "public"."roles" TO "authenticated" USING ("public"."has_role"('Administrator'::"text"));



CREATE POLICY "Admin full access to stock movements" ON "public"."stock_movements" TO "authenticated" USING ("public"."has_role"('Administrator'::"text"));



CREATE POLICY "Admin full access to user_roles" ON "public"."user_roles" TO "authenticated" USING ("public"."has_role"('Administrator'::"text"));



CREATE POLICY "Authenticated users can insert audit logs" ON "public"."audit_logs" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Cash sessions managed by Admin/Mgr" ON "public"."cash_sessions" TO "authenticated" USING ("public"."has_any_role"(ARRAY['Administrator'::"text", 'Manager'::"text"]));



CREATE POLICY "Cash sessions viewable by Admin/Mgr/Cashier" ON "public"."cash_sessions" FOR SELECT TO "authenticated" USING ("public"."has_any_role"(ARRAY['Administrator'::"text", 'Manager'::"text", 'Cashier'::"text"]));



CREATE POLICY "Cash transactions managed by Admin/Mgr" ON "public"."cash_transactions" TO "authenticated" USING ("public"."has_any_role"(ARRAY['Administrator'::"text", 'Manager'::"text"]));



CREATE POLICY "Cash transactions viewable by Admin/Mgr/Cashier" ON "public"."cash_transactions" FOR SELECT TO "authenticated" USING ("public"."has_any_role"(ARRAY['Administrator'::"text", 'Manager'::"text", 'Cashier'::"text"]));



CREATE POLICY "Cashier can add expenses" ON "public"."expenses" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_role"('Cashier'::"text"));



CREATE POLICY "Cashier can insert own transactions" ON "public"."cash_transactions" FOR INSERT TO "authenticated" WITH CHECK (("public"."has_role"('Cashier'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."cash_sessions"
  WHERE (("cash_sessions"."id" = "cash_transactions"."cash_session_id") AND ("cash_sessions"."opened_by" = ( SELECT "profiles"."id"
           FROM "public"."profiles"
          WHERE ("profiles"."auth_user_id" = "auth"."uid"()))))))));



CREATE POLICY "Cashier can manage own sessions" ON "public"."cash_sessions" TO "authenticated" USING (("public"."has_role"('Cashier'::"text") AND ("opened_by" = ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."auth_user_id" = "auth"."uid"())))));



CREATE POLICY "Categories managed by Admin/Mgr/Inv" ON "public"."categories" TO "authenticated" USING ("public"."has_any_role"(ARRAY['Administrator'::"text", 'Manager'::"text", 'Inventory Staff'::"text"]));



CREATE POLICY "Categories viewable by authenticated users" ON "public"."categories" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Daily inventory insert by authorized" ON "public"."daily_inventory_periods" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_any_role"(ARRAY['Administrator'::"text", 'Manager'::"text", 'Inventory Staff'::"text", 'Kitchen Staff'::"text"]));



CREATE POLICY "Daily inventory lines manageable by authorized" ON "public"."daily_inventory_lines" TO "authenticated" USING (("public"."has_any_role"(ARRAY['Administrator'::"text", 'Manager'::"text", 'Inventory Staff'::"text", 'Kitchen Staff'::"text"]) AND (EXISTS ( SELECT 1
   FROM "public"."daily_inventory_periods" "p"
  WHERE (("p"."id" = "daily_inventory_lines"."daily_inventory_period_id") AND (("p"."status" <> 'CLOSED'::"text") OR "public"."has_role"('Administrator'::"text")))))));



CREATE POLICY "Daily inventory lines viewable by all" ON "public"."daily_inventory_lines" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Daily inventory update" ON "public"."daily_inventory_periods" FOR UPDATE TO "authenticated" USING (("public"."has_any_role"(ARRAY['Administrator'::"text", 'Manager'::"text", 'Inventory Staff'::"text", 'Kitchen Staff'::"text"]) AND (("status" <> 'CLOSED'::"text") OR "public"."has_role"('Administrator'::"text"))));



CREATE POLICY "Daily inventory viewable by authenticated users" ON "public"."daily_inventory_periods" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Discounts managed by Admin/Mgr/Cashier" ON "public"."discounts" TO "authenticated" USING ("public"."has_any_role"(ARRAY['Administrator'::"text", 'Manager'::"text", 'Cashier'::"text"]));



CREATE POLICY "Discounts viewable by all" ON "public"."discounts" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Expense categories managed by Admin/Mgr" ON "public"."expense_categories" TO "authenticated" USING ("public"."has_any_role"(ARRAY['Administrator'::"text", 'Manager'::"text"]));



CREATE POLICY "Expense categories viewable by all" ON "public"."expense_categories" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Expenses managed by Admin/Mgr" ON "public"."expenses" TO "authenticated" USING ("public"."has_any_role"(ARRAY['Administrator'::"text", 'Manager'::"text"]));



CREATE POLICY "Expenses viewable by all" ON "public"."expenses" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Inventory balances insert by Admin/Mgr/Inv" ON "public"."inventory_balances" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_any_role"(ARRAY['Administrator'::"text", 'Manager'::"text", 'Inventory Staff'::"text"]));



CREATE POLICY "Inventory balances viewable by authenticated users" ON "public"."inventory_balances" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Locations managed by Admin/Mgr" ON "public"."inventory_locations" TO "authenticated" USING ("public"."has_any_role"(ARRAY['Administrator'::"text", 'Manager'::"text"]));



CREATE POLICY "Locations viewable by authenticated users" ON "public"."inventory_locations" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Profiles are viewable by all authenticated users" ON "public"."profiles" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Purchase lines managed by Admin/Mgr/Inv" ON "public"."purchase_lines" TO "authenticated" USING ("public"."has_any_role"(ARRAY['Administrator'::"text", 'Manager'::"text", 'Inventory Staff'::"text"]));



CREATE POLICY "Purchase lines viewable by all" ON "public"."purchase_lines" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Purchases managed by Admin/Mgr/Inv" ON "public"."purchases" TO "authenticated" USING ("public"."has_any_role"(ARRAY['Administrator'::"text", 'Manager'::"text", 'Inventory Staff'::"text"]));



CREATE POLICY "Purchases viewable by all" ON "public"."purchases" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Roles are viewable by authenticated users" ON "public"."roles" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Sale lines managed by Admin/Mgr/Cashier" ON "public"."sale_lines" TO "authenticated" USING ("public"."has_any_role"(ARRAY['Administrator'::"text", 'Manager'::"text", 'Cashier'::"text"]));



CREATE POLICY "Sale lines viewable by all" ON "public"."sale_lines" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Sales managed by Admin/Mgr/Cashier" ON "public"."sales" TO "authenticated" USING ("public"."has_any_role"(ARRAY['Administrator'::"text", 'Manager'::"text", 'Cashier'::"text"]));



CREATE POLICY "Sales viewable by all" ON "public"."sales" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Stock items managed by Admin/Mgr/Inv" ON "public"."stock_items" TO "authenticated" USING ("public"."has_any_role"(ARRAY['Administrator'::"text", 'Manager'::"text", 'Inventory Staff'::"text"]));



CREATE POLICY "Stock items viewable by authenticated users" ON "public"."stock_items" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Stock movements insertable by Admin/Mgr/Inv" ON "public"."stock_movements" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_any_role"(ARRAY['Administrator'::"text", 'Manager'::"text", 'Inventory Staff'::"text"]));



CREATE POLICY "Stock movements viewable by authenticated users" ON "public"."stock_movements" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Stock transfer lines managed by Admin/Mgr/Inv" ON "public"."stock_transfer_lines" TO "authenticated" USING ("public"."has_any_role"(ARRAY['Administrator'::"text", 'Manager'::"text", 'Inventory Staff'::"text"]));



CREATE POLICY "Stock transfer lines viewable by authenticated users" ON "public"."stock_transfer_lines" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Stock transfers managed by Admin/Mgr/Inv" ON "public"."stock_transfers" TO "authenticated" USING ("public"."has_any_role"(ARRAY['Administrator'::"text", 'Manager'::"text", 'Inventory Staff'::"text"]));



CREATE POLICY "Stock transfers viewable by authenticated users" ON "public"."stock_transfers" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Supplier discounts managed by Admin/Mgr" ON "public"."supplier_discount_policies" TO "authenticated" USING ("public"."has_any_role"(ARRAY['Administrator'::"text", 'Manager'::"text"]));



CREATE POLICY "Supplier discounts viewable by all" ON "public"."supplier_discount_policies" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Suppliers managed by Admin/Mgr/Inv" ON "public"."suppliers" TO "authenticated" USING ("public"."has_any_role"(ARRAY['Administrator'::"text", 'Manager'::"text", 'Inventory Staff'::"text"]));



CREATE POLICY "Suppliers viewable by all" ON "public"."suppliers" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Units managed by Admin/Mgr/Inv" ON "public"."units_of_measure" TO "authenticated" USING ("public"."has_any_role"(ARRAY['Administrator'::"text", 'Manager'::"text", 'Inventory Staff'::"text"]));



CREATE POLICY "Units viewable by authenticated users" ON "public"."units_of_measure" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "User roles are viewable by authenticated users" ON "public"."user_roles" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can update own notifications" ON "public"."notifications" FOR UPDATE TO "authenticated" USING (("user_id" = ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."auth_user_id" = "auth"."uid"())))) WITH CHECK (("user_id" = ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."auth_user_id" = "auth"."uid"()))));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("auth_user_id" = "auth"."uid"())) WITH CHECK (("auth_user_id" = "auth"."uid"()));



CREATE POLICY "Users can view own notifications" ON "public"."notifications" FOR SELECT TO "authenticated" USING (("user_id" = ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."auth_user_id" = "auth"."uid"()))));



ALTER TABLE "public"."audit_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cash_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cash_transactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."daily_inventory_lines" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."daily_inventory_periods" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."discounts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."expense_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."expenses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."inventory_balances" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."inventory_locations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."purchase_lines" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."purchases" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sale_lines" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sales" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."stock_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."stock_movements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."stock_transfer_lines" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."stock_transfers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."supplier_discount_policies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."suppliers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."units_of_measure" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";


























































































































































































GRANT ALL ON FUNCTION "public"."close_cash_session"("p_session_id" "uuid", "p_actual_closing_cash" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."close_cash_session"("p_session_id" "uuid", "p_actual_closing_cash" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."close_cash_session"("p_session_id" "uuid", "p_actual_closing_cash" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."complete_stock_transfer"("p_transfer_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."complete_stock_transfer"("p_transfer_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."complete_stock_transfer"("p_transfer_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_expense"("p_expense_number" "text", "p_category_id" "uuid", "p_supplier_or_payee" "text", "p_expense_date" "date", "p_original_amount" numeric, "p_discount_amount" numeric, "p_payment_method" "text", "p_cash_session_id" "uuid", "p_description" "text", "p_notes" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_expense"("p_expense_number" "text", "p_category_id" "uuid", "p_supplier_or_payee" "text", "p_expense_date" "date", "p_original_amount" numeric, "p_discount_amount" numeric, "p_payment_method" "text", "p_cash_session_id" "uuid", "p_description" "text", "p_notes" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_expense"("p_expense_number" "text", "p_category_id" "uuid", "p_supplier_or_payee" "text", "p_expense_date" "date", "p_original_amount" numeric, "p_discount_amount" numeric, "p_payment_method" "text", "p_cash_session_id" "uuid", "p_description" "text", "p_notes" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_purchase"("p_purchase_number" "text", "p_supplier_id" "uuid", "p_purchase_date" "date", "p_discount_amount" numeric, "p_payment_method" "text", "p_notes" "text", "p_lines_json" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."create_purchase"("p_purchase_number" "text", "p_supplier_id" "uuid", "p_purchase_date" "date", "p_discount_amount" numeric, "p_payment_method" "text", "p_notes" "text", "p_lines_json" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_purchase"("p_purchase_number" "text", "p_supplier_id" "uuid", "p_purchase_date" "date", "p_discount_amount" numeric, "p_payment_method" "text", "p_notes" "text", "p_lines_json" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_stock_movement"("p_stock_item_id" "uuid", "p_location_id" "uuid", "p_movement_type" "text", "p_quantity" numeric, "p_reference_type" "text", "p_reference_id" "uuid", "p_reason" "text", "p_notes" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_stock_movement"("p_stock_item_id" "uuid", "p_location_id" "uuid", "p_movement_type" "text", "p_quantity" numeric, "p_reference_type" "text", "p_reference_id" "uuid", "p_reason" "text", "p_notes" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_stock_movement"("p_stock_item_id" "uuid", "p_location_id" "uuid", "p_movement_type" "text", "p_quantity" numeric, "p_reference_type" "text", "p_reference_id" "uuid", "p_reason" "text", "p_notes" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_stock_transfer"("p_transfer_number" "text", "p_source_location_id" "uuid", "p_destination_location_id" "uuid", "p_reason" "text", "p_notes" "text", "p_lines_json" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."create_stock_transfer"("p_transfer_number" "text", "p_source_location_id" "uuid", "p_destination_location_id" "uuid", "p_reason" "text", "p_notes" "text", "p_lines_json" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_stock_transfer"("p_transfer_number" "text", "p_source_location_id" "uuid", "p_destination_location_id" "uuid", "p_reason" "text", "p_notes" "text", "p_lines_json" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."has_any_role"("role_names" "text"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."has_any_role"("role_names" "text"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_any_role"("role_names" "text"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."has_role"("role_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_role"("role_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_role"("role_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."inventory_adjust"("p_stock_item_id" "uuid", "p_location_id" "uuid", "p_adjustment_type" "text", "p_quantity" numeric, "p_reason" "text", "p_notes" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."inventory_adjust"("p_stock_item_id" "uuid", "p_location_id" "uuid", "p_adjustment_type" "text", "p_quantity" numeric, "p_reason" "text", "p_notes" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."inventory_adjust"("p_stock_item_id" "uuid", "p_location_id" "uuid", "p_adjustment_type" "text", "p_quantity" numeric, "p_reason" "text", "p_notes" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."open_cash_session"("p_business_date" "date", "p_opening_cash" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."open_cash_session"("p_business_date" "date", "p_opening_cash" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."open_cash_session"("p_business_date" "date", "p_opening_cash" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."process_sale"("p_sale_number" "text", "p_location_id" "uuid", "p_sale_date" "date", "p_discount_type" "text", "p_discount_amount" numeric, "p_payment_method" "text", "p_cash_session_id" "uuid", "p_notes" "text", "p_lines_json" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."process_sale"("p_sale_number" "text", "p_location_id" "uuid", "p_sale_date" "date", "p_discount_type" "text", "p_discount_amount" numeric, "p_payment_method" "text", "p_cash_session_id" "uuid", "p_notes" "text", "p_lines_json" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."process_sale"("p_sale_number" "text", "p_location_id" "uuid", "p_sale_date" "date", "p_discount_type" "text", "p_discount_amount" numeric, "p_payment_method" "text", "p_cash_session_id" "uuid", "p_notes" "text", "p_lines_json" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."receive_purchase"("p_purchase_id" "uuid", "p_location_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."receive_purchase"("p_purchase_id" "uuid", "p_location_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."receive_purchase"("p_purchase_id" "uuid", "p_location_id" "uuid") TO "service_role";
























GRANT ALL ON TABLE "public"."audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."cash_sessions" TO "anon";
GRANT ALL ON TABLE "public"."cash_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."cash_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."cash_transactions" TO "anon";
GRANT ALL ON TABLE "public"."cash_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."cash_transactions" TO "service_role";



GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON TABLE "public"."daily_inventory_lines" TO "anon";
GRANT ALL ON TABLE "public"."daily_inventory_lines" TO "authenticated";
GRANT ALL ON TABLE "public"."daily_inventory_lines" TO "service_role";



GRANT ALL ON TABLE "public"."daily_inventory_periods" TO "anon";
GRANT ALL ON TABLE "public"."daily_inventory_periods" TO "authenticated";
GRANT ALL ON TABLE "public"."daily_inventory_periods" TO "service_role";



GRANT ALL ON TABLE "public"."discounts" TO "anon";
GRANT ALL ON TABLE "public"."discounts" TO "authenticated";
GRANT ALL ON TABLE "public"."discounts" TO "service_role";



GRANT ALL ON TABLE "public"."expense_categories" TO "anon";
GRANT ALL ON TABLE "public"."expense_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."expense_categories" TO "service_role";



GRANT ALL ON TABLE "public"."expenses" TO "anon";
GRANT ALL ON TABLE "public"."expenses" TO "authenticated";
GRANT ALL ON TABLE "public"."expenses" TO "service_role";



GRANT ALL ON TABLE "public"."inventory_balances" TO "anon";
GRANT ALL ON TABLE "public"."inventory_balances" TO "authenticated";
GRANT ALL ON TABLE "public"."inventory_balances" TO "service_role";



GRANT ALL ON TABLE "public"."inventory_locations" TO "anon";
GRANT ALL ON TABLE "public"."inventory_locations" TO "authenticated";
GRANT ALL ON TABLE "public"."inventory_locations" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."purchase_lines" TO "anon";
GRANT ALL ON TABLE "public"."purchase_lines" TO "authenticated";
GRANT ALL ON TABLE "public"."purchase_lines" TO "service_role";



GRANT ALL ON TABLE "public"."purchases" TO "anon";
GRANT ALL ON TABLE "public"."purchases" TO "authenticated";
GRANT ALL ON TABLE "public"."purchases" TO "service_role";



GRANT ALL ON TABLE "public"."roles" TO "anon";
GRANT ALL ON TABLE "public"."roles" TO "authenticated";
GRANT ALL ON TABLE "public"."roles" TO "service_role";



GRANT ALL ON TABLE "public"."sale_lines" TO "anon";
GRANT ALL ON TABLE "public"."sale_lines" TO "authenticated";
GRANT ALL ON TABLE "public"."sale_lines" TO "service_role";



GRANT ALL ON TABLE "public"."sales" TO "anon";
GRANT ALL ON TABLE "public"."sales" TO "authenticated";
GRANT ALL ON TABLE "public"."sales" TO "service_role";



GRANT ALL ON TABLE "public"."stock_items" TO "anon";
GRANT ALL ON TABLE "public"."stock_items" TO "authenticated";
GRANT ALL ON TABLE "public"."stock_items" TO "service_role";



GRANT ALL ON TABLE "public"."stock_movements" TO "anon";
GRANT ALL ON TABLE "public"."stock_movements" TO "authenticated";
GRANT ALL ON TABLE "public"."stock_movements" TO "service_role";



GRANT ALL ON TABLE "public"."stock_transfer_lines" TO "anon";
GRANT ALL ON TABLE "public"."stock_transfer_lines" TO "authenticated";
GRANT ALL ON TABLE "public"."stock_transfer_lines" TO "service_role";



GRANT ALL ON TABLE "public"."stock_transfers" TO "anon";
GRANT ALL ON TABLE "public"."stock_transfers" TO "authenticated";
GRANT ALL ON TABLE "public"."stock_transfers" TO "service_role";



GRANT ALL ON TABLE "public"."supplier_discount_policies" TO "anon";
GRANT ALL ON TABLE "public"."supplier_discount_policies" TO "authenticated";
GRANT ALL ON TABLE "public"."supplier_discount_policies" TO "service_role";



GRANT ALL ON TABLE "public"."suppliers" TO "anon";
GRANT ALL ON TABLE "public"."suppliers" TO "authenticated";
GRANT ALL ON TABLE "public"."suppliers" TO "service_role";



GRANT ALL ON TABLE "public"."units_of_measure" TO "anon";
GRANT ALL ON TABLE "public"."units_of_measure" TO "authenticated";
GRANT ALL ON TABLE "public"."units_of_measure" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";



GRANT ALL ON TABLE "public"."view_cash_report" TO "anon";
GRANT ALL ON TABLE "public"."view_cash_report" TO "authenticated";
GRANT ALL ON TABLE "public"."view_cash_report" TO "service_role";



GRANT ALL ON TABLE "public"."view_expense_report" TO "anon";
GRANT ALL ON TABLE "public"."view_expense_report" TO "authenticated";
GRANT ALL ON TABLE "public"."view_expense_report" TO "service_role";



GRANT ALL ON TABLE "public"."view_inventory_report" TO "anon";
GRANT ALL ON TABLE "public"."view_inventory_report" TO "authenticated";
GRANT ALL ON TABLE "public"."view_inventory_report" TO "service_role";



GRANT ALL ON TABLE "public"."view_purchase_report" TO "anon";
GRANT ALL ON TABLE "public"."view_purchase_report" TO "authenticated";
GRANT ALL ON TABLE "public"."view_purchase_report" TO "service_role";



GRANT ALL ON TABLE "public"."view_sales_report" TO "anon";
GRANT ALL ON TABLE "public"."view_sales_report" TO "authenticated";
GRANT ALL ON TABLE "public"."view_sales_report" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";
































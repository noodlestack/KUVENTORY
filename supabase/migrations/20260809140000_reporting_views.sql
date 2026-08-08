-- 20260809140000_reporting_views.sql

-- 1. Inventory Report View
CREATE OR REPLACE VIEW view_inventory_report WITH (security_invoker = true) AS
SELECT
    ib.id AS inventory_balance_id,
    ib.location_id,
    l.name AS location_name,
    si.id AS stock_item_id,
    si.stock_code,
    si.name AS stock_name,
    si.tracking_type,
    c.name AS category_name,
    uom.code AS unit_code,
    ib.current_quantity,
    COALESCE(ib.minimum_stock_level_override, si.minimum_stock_level) AS minimum_stock_level,
    COALESCE(ib.reorder_level_override, si.reorder_level) AS reorder_level,
    si.cost_price,
    si.selling_price,
    (ib.current_quantity * si.cost_price) AS inventory_value,
    CASE 
        WHEN ib.current_quantity <= 0 THEN 'OUT_OF_STOCK'
        WHEN ib.current_quantity <= COALESCE(ib.minimum_stock_level_override, si.minimum_stock_level) THEN 'LOW_STOCK'
        ELSE 'OPTIMAL'
    END AS stock_status,
    si.is_active AS item_active,
    ib.updated_at AS last_updated
FROM inventory_balances ib
JOIN stock_items si ON ib.stock_item_id = si.id
JOIN inventory_locations l ON ib.location_id = l.id
LEFT JOIN categories c ON si.category_id = c.id
LEFT JOIN units_of_measure uom ON si.unit_of_measure_id = uom.id;

-- 2. Sales Report View
CREATE OR REPLACE VIEW view_sales_report WITH (security_invoker = true) AS
SELECT
    s.id AS sale_id,
    s.sale_number,
    s.sale_date,
    s.status,
    s.subtotal,
    s.discount_amount,
    s.total_amount,
    s.payment_method,
    s.created_by AS cashier_id,
    p.full_name AS cashier_name,
    s.created_at,
    (SELECT SUM(quantity) FROM sale_lines sl WHERE sl.sale_id = s.id) AS total_items
FROM sales s
LEFT JOIN profiles p ON s.created_by = p.id;

-- 3. Purchase Report View
CREATE OR REPLACE VIEW view_purchase_report WITH (security_invoker = true) AS
SELECT
    p.id AS purchase_id,
    p.purchase_number,
    p.purchase_date,
    p.status,
    p.subtotal,
    p.discount_amount,
    p.total_amount,
    p.payment_method,
    p.supplier_id,
    s.name AS supplier_name,
    p.created_by,
    prof.full_name AS created_by_name,
    p.created_at,
    (SELECT SUM(quantity) FROM purchase_lines pl WHERE pl.purchase_id = p.id) AS total_items
FROM purchases p
LEFT JOIN suppliers s ON p.supplier_id = s.id
LEFT JOIN profiles prof ON p.created_by = prof.id;

-- 4. Expense Report View
CREATE OR REPLACE VIEW view_expense_report WITH (security_invoker = true) AS
SELECT
    e.id AS expense_id,
    e.expense_number,
    e.expense_date,
    e.expense_category_id,
    c.name AS category_name,
    e.description,
    e.original_amount,
    e.discount_amount,
    e.final_amount,
    e.payment_method,
    e.supplier_or_payee,
    e.created_by,
    p.full_name AS created_by_name,
    e.created_at
FROM expenses e
JOIN expense_categories c ON e.expense_category_id = c.id
LEFT JOIN profiles p ON e.created_by = p.id;

-- 5. Cash Report View
CREATE OR REPLACE VIEW view_cash_report WITH (security_invoker = true) AS
SELECT
    cs.id AS session_id,
    cs.business_date,
    cs.status,
    cs.opening_cash,
    cs.closing_cash,
    cs.cash_short,
    cs.cash_over,
    cs.opened_by,
    p1.full_name AS opened_by_name,
    cs.closed_by,
    p2.full_name AS closed_by_name,
    cs.opened_at,
    cs.closed_at,
    (SELECT COALESCE(SUM(amount), 0) FROM cash_transactions ct WHERE ct.cash_session_id = cs.id AND ct.transaction_type = 'CASH_SALE') AS cash_sales,
    (SELECT COALESCE(SUM(amount), 0) FROM cash_transactions ct WHERE ct.cash_session_id = cs.id AND ct.transaction_type IN ('DEPOSIT', 'ADJUSTMENT') AND ct.amount > 0) AS cash_additions,
    (SELECT COALESCE(SUM(amount), 0) FROM cash_transactions ct WHERE ct.cash_session_id = cs.id AND ct.transaction_type IN ('WITHDRAWAL', 'EXPENSE') AND ct.amount > 0) AS cash_withdrawals
FROM cash_sessions cs
LEFT JOIN profiles p1 ON cs.opened_by = p1.id
LEFT JOIN profiles p2 ON cs.closed_by = p2.id;

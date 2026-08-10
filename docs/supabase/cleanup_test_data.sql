-- KAPE-UNO Test Data Cleanup Script
-- VERSION 4.0.0
-- 
-- IMPORTANT: Run this script via Supabase SQL Editor ONLY.
-- DO NOT RUN THIS ON A LIVE PRODUCTION DATABASE WITHOUT A BACKUP.

BEGIN;

-- ==============================================================================
-- OPTION 1: DELETE TRANSACTIONAL DATA ONLY (Recommended)
-- This deletes Sales, Purchases, Expenses, and Stock Movements, resetting stock to 0.
-- It KEEPS your inventory items, categories, units, suppliers, and system users.
-- ==============================================================================

-- Delete all activity and history logs
TRUNCATE TABLE history_logs CASCADE;
TRUNCATE TABLE notifications CASCADE;

-- Delete all transactions
TRUNCATE TABLE sales CASCADE;
TRUNCATE TABLE sale_items CASCADE;
TRUNCATE TABLE purchases CASCADE;
TRUNCATE TABLE purchase_items CASCADE;
TRUNCATE TABLE expenses CASCADE;
TRUNCATE TABLE cash_sessions CASCADE;

-- Reset inventory balances
TRUNCATE TABLE stock_movements CASCADE;
TRUNCATE TABLE inventory_balances CASCADE;
TRUNCATE TABLE daily_inventory_periods CASCADE;
TRUNCATE TABLE daily_inventory_lines CASCADE;

-- Re-initialize inventory balances for all active items to 0
INSERT INTO inventory_balances (stock_item_id, current_quantity)
SELECT id, 0 FROM stock_items WHERE is_active = true
ON CONFLICT (stock_item_id) DO UPDATE SET current_quantity = 0;


-- ==============================================================================
-- OPTION 2: FULL WIPE (Uncomment to use)
-- This deletes EVERYTHING except users, roles, and profiles.
-- ==============================================================================

/*
TRUNCATE TABLE stock_items CASCADE;
TRUNCATE TABLE categories CASCADE;
TRUNCATE TABLE units_of_measure CASCADE;
TRUNCATE TABLE suppliers CASCADE;
TRUNCATE TABLE inventory_locations CASCADE;
TRUNCATE TABLE discounts CASCADE;
*/

COMMIT;

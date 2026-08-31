-- seed.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Categories
INSERT INTO categories (id, name, description) VALUES
('cat-grill-001', 'Grilled', 'Grilled food items'),
('cat-portion-001', 'Portion', 'Portioned items'),
('cat-case-001', 'Per Cases', 'Items per case')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- Items from Image 1: Grilled Stock 7/25/26
-- We will insert them with their ending/tot.stock if ending is blank. 
-- Wait, Betamax Beg: 50, Sales AM: 4. So Current Stock = 46.
-- Adidas Beg: 13, Current: 13
-- Chicken Neck Beg: 15, Sales AM: 1, Current: 14
-- Pork BBQ Beg: 61, Sales AM: 1, Current: 60
-- Isaw Beg: 34, Sales AM: 2, Current: 32
-- Chicken-Inasal Beg: 6, Current: 6
-- Grilled Liempo Beg: 8, Current: 8
-- Bangus Beg: 3, Current: 3
-- Tilapia Beg: 7, Current: 7

INSERT INTO inventory_items (sku, name, category_id, cost, current_stock, minimum_stock, unit, status) VALUES
('GRILL-001', 'BETAMAX', 'cat-grill-001', 0, 46, 10, 'pcs', 'IN_STOCK'),
('GRILL-002', 'ADIDAS', 'cat-grill-001', 0, 13, 10, 'pcs', 'IN_STOCK'),
('GRILL-003', 'CHICKEN NECK', 'cat-grill-001', 0, 14, 10, 'pcs', 'IN_STOCK'),
('GRILL-004', 'PORK BBQ', 'cat-grill-001', 0, 60, 20, 'pcs', 'IN_STOCK'),
('GRILL-005', 'HOTDOG', 'cat-grill-001', 0, 0, 10, 'pcs', 'OUT_OF_STOCK'),
('GRILL-006', 'PORK TENGA', 'cat-grill-001', 0, 0, 10, 'pcs', 'OUT_OF_STOCK'),
('GRILL-007', 'ISAW', 'cat-grill-001', 0, 32, 10, 'pcs', 'IN_STOCK'),
('GRILL-008', 'CHICKEN-INASAL', 'cat-grill-001', 0, 6, 10, 'LOW_STOCK'),
('GRILL-009', 'CHICKEN-BBQ', 'cat-grill-001', 0, 0, 10, 'pcs', 'OUT_OF_STOCK'),
('GRILL-010', 'GRILLED LIEMPO', 'cat-grill-001', 0, 8, 10, 'LOW_STOCK'),
('GRILL-011', 'BANGUS', 'cat-grill-001', 0, 3, 5, 'LOW_STOCK'),
('GRILL-012', 'TILAPIA', 'cat-grill-001', 0, 7, 10, 'LOW_STOCK');

-- Items from Image 2: Portion Stock 7-26-26
-- Ending stock is listed on the far right column
INSERT INTO inventory_items (sku, name, category_id, cost, current_stock, minimum_stock, unit, status) VALUES
('PORT-001', 'PALE PILSEN', 'cat-portion-001', 0, 83, 20, 'pcs', 'IN_STOCK'),
('PORT-002', 'STALLION RED HORSE', 'cat-portion-001', 0, 71, 20, 'pcs', 'IN_STOCK'),
('PORT-003', 'SML', 'cat-portion-001', 0, 84, 20, 'pcs', 'IN_STOCK'),
('PORT-004', 'SMA', 'cat-portion-001', 0, 35, 10, 'pcs', 'IN_STOCK'),
('PORT-005', 'CERVEZA', 'cat-portion-001', 0, 6, 10, 'LOW_STOCK'),
('PORT-006', 'PREMUIM', 'cat-portion-001', 0, 6, 10, 'LOW_STOCK'),
('PORT-007', 'COKE IN CAN', 'cat-portion-001', 0, 22, 10, 'pcs', 'IN_STOCK'),
('PORT-008', 'DM ACE', 'cat-portion-001', 0, 0, 10, 'pcs', 'OUT_OF_STOCK'),
('PORT-009', 'DM FOUR SEASON', 'cat-portion-001', 0, 31, 10, 'pcs', 'IN_STOCK'),
('PORT-010', 'COKE ZERO', 'cat-portion-001', 0, 26, 10, 'pcs', 'IN_STOCK'),
('PORT-011', 'ROYAL IN CAN', 'cat-portion-001', 0, 18, 10, 'pcs', 'IN_STOCK'),
('PORT-012', 'SPRITE IN CAN', 'cat-portion-001', 0, 36, 10, 'pcs', 'IN_STOCK'),
('PORT-013', 'COKE MISMO', 'cat-portion-001', 0, 43, 10, 'pcs', 'IN_STOCK'),
('PORT-014', 'SPRITE MISMO', 'cat-portion-001', 0, 43, 10, 'pcs', 'IN_STOCK'),
('PORT-015', 'ROYAL MISMO', 'cat-portion-001', 0, 60, 10, 'pcs', 'IN_STOCK'),
('PORT-016', 'BOT. WATER', 'cat-portion-001', 0, 54, 20, 'pcs', 'IN_STOCK'),
('PORT-017', 'ASSORTED MAGNOLIA', 'cat-portion-001', 0, 1061, 50, 'pcs', 'IN_STOCK'),
('PORT-018', 'DRIP COFFEE', 'cat-portion-001', 0, 5, 10, 'pcs', 'LOW_STOCK'),
('PORT-019', 'BREWED COFFEE', 'cat-portion-001', 0, 6, 10, 'LOW_STOCK'),
('PORT-020', 'LIPTON TEA', 'cat-portion-001', 0, 12, 10, 'pcs', 'IN_STOCK'),
('PORT-021', 'PALE IN CAN', 'cat-portion-001', 0, 38, 10, 'pcs', 'IN_STOCK'),
('PORT-022', 'MAGNUM ALMOND', 'cat-portion-001', 0, 35, 10, 'pcs', 'IN_STOCK'),
('PORT-023', 'CORNETTO C & C', 'cat-portion-001', 0, 31, 10, 'pcs', 'IN_STOCK'),
('PORT-024', 'CORNETTO CHOCO', 'cat-portion-001', 0, 37, 10, 'pcs', 'IN_STOCK'),
('PORT-025', 'MAGNUM CLASSIC', 'cat-portion-001', 0, 36, 10, 'pcs', 'IN_STOCK'),
('PORT-026', 'CORNETTO VANILLA', 'cat-portion-001', 0, 36, 10, 'pcs', 'IN_STOCK'),
('PORT-027', 'HALO HALO', 'cat-portion-001', 0, 0, 10, 'pcs', 'OUT_OF_STOCK');

-- Items PER CASES
INSERT INTO inventory_items (sku, name, category_id, cost, current_stock, minimum_stock, unit, status) VALUES
('CASE-001', 'PALE PILSEN (CASE)', 'cat-case-001', 0, 3, 5, 'case', 'LOW_STOCK'),
('CASE-002', 'STALLION RED HORSE (CASE)', 'cat-case-001', 0, 2, 5, 'case', 'LOW_STOCK'),
('CASE-003', 'SML (CASE)', 'cat-case-001', 0, 3, 5, 'case', 'LOW_STOCK'),
('CASE-004', 'SMA (CASE)', 'cat-case-001', 0, 2, 5, 'case', 'LOW_STOCK'),
('CASE-005', 'COKE IN CAN (CASE)', 'cat-case-001', 0, 1, 5, 'case', 'LOW_STOCK'),
('CASE-006', 'ROYAL IN CAN (CASE)', 'cat-case-001', 0, 1, 5, 'case', 'LOW_STOCK'),
('CASE-007', 'SPRITE IN CAN (CASE)', 'cat-case-001', 0, 2, 5, 'case', 'LOW_STOCK'),
('CASE-008', 'COKE MISMO (CASE)', 'cat-case-001', 0, 10, 5, 'case', 'IN_STOCK'),
('CASE-009', 'SPRITE MISMO (CASE)', 'cat-case-001', 0, 6, 5, 'case', 'IN_STOCK'),
('CASE-010', 'ROYAL MISMO (CASE)', 'cat-case-001', 0, 6, 5, 'case', 'IN_STOCK'),
('CASE-011', 'BOT. WATER (CASE)', 'cat-case-001', 0, 10, 5, 'case', 'IN_STOCK'),
('CASE-012', 'MAGNOLIA ASSORTED (CASE)', 'cat-case-001', 0, 7, 5, 'case', 'IN_STOCK');

-- To represent the "Data by date", we will insert historical stock_movements for these dates.
-- Let's assume all ending stocks resulted from an "ADJUSTMENT" movement on that date to set the base level.

INSERT INTO stock_movements (item_id, type, quantity, reference_no, notes, created_at)
SELECT id, 'ADJUSTMENT', current_stock, 'INV-725', 'Initial stock reading from 7/25/26', '2026-07-25 23:59:00'
FROM inventory_items WHERE category_id = 'cat-grill-001';

INSERT INTO stock_movements (item_id, type, quantity, reference_no, notes, created_at)
SELECT id, 'ADJUSTMENT', current_stock, 'INV-726', 'Initial stock reading from 7/26/26', '2026-07-26 23:59:00'
FROM inventory_items WHERE category_id != 'cat-grill-001';

BEGIN;

-- Delete test purchases
DELETE FROM public.purchases
WHERE id IN (
    SELECT p.id FROM public.purchases p
    WHERE p.purchase_number ILIKE '%test%' OR p.notes ILIKE '%test%' OR p.notes ILIKE '%dummy%'
);

-- Delete test sales
DELETE FROM public.sales
WHERE id IN (
    SELECT s.id FROM public.sales s
    WHERE s.sale_number ILIKE '%test%' OR s.notes ILIKE '%test%' OR s.notes ILIKE '%dummy%'
);

-- Delete test stock items
DELETE FROM public.stock_items
WHERE stock_code ILIKE '%test%' 
   OR name ILIKE '%test%' 
   OR name ILIKE '%dummy%';

-- Delete test suppliers
DELETE FROM public.suppliers
WHERE name ILIKE '%test%' 
   OR name ILIKE '%dummy%';

-- Delete test categories
DELETE FROM public.categories
WHERE name ILIKE '%test%' 
   OR name ILIKE '%dummy%';

COMMIT;

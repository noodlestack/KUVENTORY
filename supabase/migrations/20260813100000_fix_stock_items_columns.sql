-- ========================================================================================
-- KAPE-UNO REPAIR: Fix Missing Columns
-- Migration: 20260813100000_fix_stock_items_columns.sql
-- ========================================================================================

-- 1. Add missing columns to stock_items that the frontend uses
ALTER TABLE public.stock_items
  ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES public.inventory_locations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. Create indexes for the new FK columns
CREATE INDEX IF NOT EXISTS stock_items_supplier_id_idx ON public.stock_items(supplier_id);
CREATE INDEX IF NOT EXISTS stock_items_location_id_idx ON public.stock_items(location_id);

-- 3. Add missing 'status' column to expenses table
ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'Paid'
    CHECK (status IN ('Paid', 'Pending', 'Cancelled'));

-- 4. Backfill archived_at for any stock_items that are already is_active=false
UPDATE public.stock_items
  SET archived_at = updated_at
  WHERE is_active = FALSE AND archived_at IS NULL;

-- 5. Grant permissions on updated tables
GRANT ALL ON public.stock_items TO authenticated;
GRANT ALL ON public.expenses TO authenticated;

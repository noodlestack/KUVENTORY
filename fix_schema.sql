ALTER TABLE public.stock_items
ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES public.suppliers(id),
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES public.inventory_locations(id),
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Reload schema cache to fix 'actual_quantity does not exist' and new columns
NOTIFY pgrst, reload_schema;

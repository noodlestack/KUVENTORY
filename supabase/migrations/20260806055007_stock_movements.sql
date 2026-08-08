-- stock_movements
CREATE TABLE stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stock_item_id UUID NOT NULL REFERENCES stock_items(id) ON DELETE RESTRICT,
    location_id UUID NOT NULL REFERENCES inventory_locations(id) ON DELETE RESTRICT,
    movement_type TEXT NOT NULL CHECK (movement_type IN (
        'OPENING_BALANCE', 'MANUAL_RECEIPT', 'PURCHASE_IN', 'SALE_OUT', 
        'SALE_OUT_AM', 'SALE_OUT_PM', 'TRANSFER_IN', 'TRANSFER_OUT', 
        'ADJUSTMENT_IN', 'ADJUSTMENT_OUT', 'DAMAGE', 'EXPIRY', 'LOSS', 'CORRECTION'
    )),
    quantity NUMERIC(15, 2) NOT NULL,
    previous_quantity NUMERIC(15, 2),
    new_quantity NUMERIC(15, 2),
    reference_type TEXT,
    reference_id UUID,
    reason TEXT,
    notes TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX stock_movements_stock_item_id_idx ON stock_movements(stock_item_id);
CREATE INDEX stock_movements_location_id_idx ON stock_movements(location_id);
CREATE INDEX stock_movements_created_at_idx ON stock_movements(created_at);

-- stock_transfers
CREATE TABLE stock_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_number TEXT NOT NULL UNIQUE,
    source_location_id UUID NOT NULL REFERENCES inventory_locations(id) ON DELETE RESTRICT,
    destination_location_id UUID NOT NULL REFERENCES inventory_locations(id) ON DELETE RESTRICT,
    status TEXT NOT NULL CHECK (status IN ('DRAFT', 'PENDING', 'COMPLETED', 'CANCELLED')),
    reason TEXT,
    notes TEXT,
    requested_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    completed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    CHECK (source_location_id != destination_location_id)
);

-- stock_transfer_lines
CREATE TABLE stock_transfer_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_id UUID NOT NULL REFERENCES stock_transfers(id) ON DELETE CASCADE,
    stock_item_id UUID NOT NULL REFERENCES stock_items(id) ON DELETE RESTRICT,
    quantity NUMERIC(15, 2) NOT NULL CHECK (quantity > 0)
);

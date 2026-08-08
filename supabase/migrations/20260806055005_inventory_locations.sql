-- inventory_locations
CREATE TABLE inventory_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER handle_updated_at_inventory_locations
    BEFORE UPDATE ON inventory_locations
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- inventory_balances
CREATE TABLE inventory_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stock_item_id UUID NOT NULL REFERENCES stock_items(id) ON DELETE RESTRICT,
    location_id UUID NOT NULL REFERENCES inventory_locations(id) ON DELETE RESTRICT,
    current_quantity NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (current_quantity >= 0),
    minimum_stock_level_override NUMERIC(15, 2) CHECK (minimum_stock_level_override >= 0),
    reorder_level_override NUMERIC(15, 2) CHECK (reorder_level_override >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(stock_item_id, location_id)
);

CREATE INDEX inventory_balances_location_id_idx ON inventory_balances(location_id);
CREATE INDEX inventory_balances_stock_item_id_idx ON inventory_balances(stock_item_id);

CREATE TRIGGER handle_updated_at_inventory_balances
    BEFORE UPDATE ON inventory_balances
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

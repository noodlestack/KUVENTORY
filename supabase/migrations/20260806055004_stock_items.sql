CREATE TABLE stock_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stock_code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE RESTRICT,
    unit_of_measure_id UUID REFERENCES units_of_measure(id) ON DELETE RESTRICT,
    tracking_type TEXT NOT NULL,
    cost_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (cost_price >= 0),
    selling_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (selling_price >= 0),
    minimum_stock_level NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (minimum_stock_level >= 0),
    reorder_level NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (reorder_level >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    archived_at TIMESTAMPTZ
);

CREATE INDEX stock_items_category_id_idx ON stock_items(category_id);
CREATE INDEX stock_items_name_idx ON stock_items(name);

CREATE TRIGGER handle_updated_at_stock_items
    BEFORE UPDATE ON stock_items
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

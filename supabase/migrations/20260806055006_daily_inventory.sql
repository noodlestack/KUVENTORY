-- daily_inventory_periods
CREATE TABLE daily_inventory_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_date DATE NOT NULL,
    location_id UUID NOT NULL REFERENCES inventory_locations(id) ON DELETE RESTRICT,
    status TEXT NOT NULL CHECK (status IN ('OPEN', 'CLOSING', 'CLOSED', 'REOPENED')),
    opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    opened_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    closed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reopened_at TIMESTAMPTZ,
    reopened_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(business_date, location_id)
);

CREATE TRIGGER handle_updated_at_daily_inventory_periods
    BEFORE UPDATE ON daily_inventory_periods
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- daily_inventory_lines
CREATE TABLE daily_inventory_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    daily_inventory_period_id UUID NOT NULL REFERENCES daily_inventory_periods(id) ON DELETE CASCADE,
    stock_item_id UUID NOT NULL REFERENCES stock_items(id) ON DELETE RESTRICT,
    beginning_stock NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (beginning_stock >= 0),
    added_stock NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (added_stock >= 0),
    total_stock NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (total_stock >= 0),
    am_sales NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (am_sales >= 0),
    pm_sales NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (pm_sales >= 0),
    total_daily_sales NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (total_daily_sales >= 0),
    calculated_ending_stock NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    physical_ending_stock NUMERIC(15, 2),
    variance NUMERIC(15, 2),
    variance_status TEXT NOT NULL DEFAULT 'NO_VARIANCE' CHECK (variance_status IN ('NO_VARIANCE', 'PENDING_REVIEW', 'ACKNOWLEDGED', 'ADJUSTED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(daily_inventory_period_id, stock_item_id)
);

CREATE TRIGGER handle_updated_at_daily_inventory_lines
    BEFORE UPDATE ON daily_inventory_lines
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

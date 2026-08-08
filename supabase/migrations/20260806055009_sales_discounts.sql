-- sales
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_number TEXT NOT NULL UNIQUE,
    sale_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('DRAFT', 'COMPLETED', 'VOIDED', 'REFUNDED')),
    subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0),
    discount_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
    total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
    payment_method TEXT,
    notes TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX sales_sale_date_idx ON sales(sale_date);

CREATE TRIGGER handle_updated_at_sales
    BEFORE UPDATE ON sales
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- sale_lines
CREATE TABLE sale_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    stock_item_id UUID NOT NULL REFERENCES stock_items(id) ON DELETE RESTRICT,
    quantity NUMERIC(15, 2) NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(15, 2) NOT NULL CHECK (unit_price >= 0),
    line_total NUMERIC(15, 2) NOT NULL CHECK (line_total >= 0)
);

-- discounts (reusable structure)
CREATE TABLE discounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discount_type TEXT NOT NULL CHECK (discount_type IN (
        'PERCENTAGE', 'FIXED_AMOUNT', 'SENIOR_CITIZEN', 'PWD', 
        'DELIVERY_DRIVER', 'EMPLOYEE', 'PROMOTIONAL', 'SUPPLIER', 
        'VENDOR', 'MANUAL', 'CUSTOM'
    )),
    discount_percentage NUMERIC(5, 2) CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    fixed_discount_amount NUMERIC(15, 2) CHECK (fixed_discount_amount >= 0),
    discount_amount NUMERIC(15, 2) NOT NULL CHECK (discount_amount >= 0),
    reason TEXT,
    reference_number TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

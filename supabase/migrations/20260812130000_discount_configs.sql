CREATE TABLE discount_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    discount_type TEXT NOT NULL,
    discount_percentage NUMERIC(5, 2) CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    fixed_discount_amount NUMERIC(15, 2) CHECK (fixed_discount_amount >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    description TEXT,
    requirements TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE discount_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all authenticated users to read discount configs"
ON discount_configs
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow managers and admins to manage discount configs"
ON discount_configs
FOR ALL
TO authenticated
USING (
  public.has_any_role(ARRAY['Administrator', 'Manager'])
);

-- Insert defaults
INSERT INTO discount_configs (name, discount_type, discount_percentage, is_active) VALUES
('Senior Citizen', 'SENIOR_CITIZEN', 20, true),
('PWD', 'PWD', 20, true),
('Employee', 'EMPLOYEE', 10, true);

-- expense_categories
CREATE TABLE expense_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER handle_updated_at_expense_categories
    BEFORE UPDATE ON expense_categories
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- expenses
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_number TEXT NOT NULL UNIQUE,
    expense_category_id UUID NOT NULL REFERENCES expense_categories(id) ON DELETE RESTRICT,
    supplier_or_payee TEXT,
    description TEXT,
    original_amount NUMERIC(15, 2) NOT NULL CHECK (original_amount >= 0),
    discount_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0 AND discount_amount <= original_amount),
    final_amount NUMERIC(15, 2) NOT NULL CHECK (final_amount >= 0),
    payment_method TEXT,
    reference_number TEXT,
    expense_date DATE NOT NULL,
    notes TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX expenses_expense_date_idx ON expenses(expense_date);

CREATE TRIGGER handle_updated_at_expenses
    BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- cash_sessions
CREATE TABLE cash_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_date DATE NOT NULL,
    opening_cash NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (opening_cash >= 0),
    closing_cash NUMERIC(15, 2) CHECK (closing_cash >= 0),
    cash_short NUMERIC(15, 2) DEFAULT 0.00 CHECK (cash_short >= 0),
    cash_over NUMERIC(15, 2) DEFAULT 0.00 CHECK (cash_over >= 0),
    status TEXT NOT NULL CHECK (status IN ('OPEN', 'CLOSED')),
    opened_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    closed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    closed_at TIMESTAMPTZ
);

-- cash_transactions
CREATE TABLE cash_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cash_session_id UUID NOT NULL REFERENCES cash_sessions(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN (
        'CASH_SALE', 'GCASH', 'MAYA', 'CARD', 'BANK_TRANSFER', 
        'EXPENSE', 'DEPOSIT', 'WITHDRAWAL', 'ADJUSTMENT'
    )),
    amount NUMERIC(15, 2) NOT NULL,
    reference_id UUID,
    reference_type TEXT,
    notes TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

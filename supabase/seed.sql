-- seed.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Categories
INSERT INTO categories (name, description) VALUES
('Grilled', 'Grilled food items'),
('Portion', 'Portioned items'),
('Beverage', 'Drinks and beverages'),
('Coffee', 'Coffee products'),
('Rice Meals', 'Rice-based meals'),
('Snacks', 'Snacks and side dishes'),
('Frozen Goods', 'Frozen items'),
('Packaging', 'Packaging materials'),
('Raw Materials', 'Raw cooking materials'),
('Condiments', 'Sauces and condiments'),
('Supplies', 'General supplies')
ON CONFLICT DO NOTHING;



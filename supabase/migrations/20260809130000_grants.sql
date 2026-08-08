-- ========================================================================================
-- KUVENTORY RPC: GRANTS
-- Migration Date: 2026-08-09 13:00:00
-- ========================================================================================

-- Grant usage on public schema to authenticated and anon users
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant all privileges on all tables in public schema to authenticated users
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Since the frontend relies on RLS, granting ALL PRIVILEGES to authenticated is safe 
-- because the RLS policies will act as the actual gatekeeper.

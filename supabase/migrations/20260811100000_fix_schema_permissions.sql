-- ========================================================================================
-- CRITICAL FIX: Restore correct function definitions and reload PostgREST schema cache
-- The prior REVOKE of has_role/has_any_role from `authenticated` broke RLS evaluation.
-- Additionally, we notify PostgREST to reload its schema cache.
-- ========================================================================================

-- Ensure has_role is grantable by postgres (SECURITY DEFINER runs as owner)
-- and executable by authenticated (needed by some versions of PostgREST for schema loading)
GRANT EXECUTE ON FUNCTION public.has_role(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_any_role(text[]) TO anon, authenticated, service_role;

-- Ensure create_stock_movement is callable by authenticated via SECURITY INVOKER RPCs
GRANT EXECUTE ON FUNCTION public.create_stock_movement(UUID, UUID, TEXT, NUMERIC, TEXT, UUID, TEXT, TEXT) TO authenticated;

-- Grant usage on schema and tables to ensure PostgREST can introspect
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Notify PostgREST to reload the schema cache
NOTIFY pgrst, 'reload schema';

-- ========================================================================================
-- RESTORE EXECUTE GRANTS FOR RLS AND INTERNAL FUNCTIONS
-- ========================================================================================

-- `has_any_role` and `has_role` are required by the `authenticated` role to evaluate RLS policies.
GRANT EXECUTE ON FUNCTION public.has_any_role(text[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(text) TO authenticated;

-- `create_stock_movement` is executed internally by `process_sale` and `inventory_adjust`, which are SECURITY INVOKER.
-- Thus, the `authenticated` caller must have EXECUTE privileges.
GRANT EXECUTE ON FUNCTION public.create_stock_movement(UUID, UUID, TEXT, NUMERIC, TEXT, UUID, TEXT, TEXT) TO authenticated;

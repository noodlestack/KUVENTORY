-- ========================================================================================
-- KUVENTORY v4.0.0 - COMPREHENSIVE AUTH + SCHEMA RECOVERY
-- This migration is idempotent and safe to run multiple times.
-- It restores ALL permissions required for Supabase Auth, PostgREST, and RLS to function.
-- ========================================================================================

-- ========================================================================================
-- 1. ENSURE ROLES TABLE HAS EXPECTED DATA (required for RLS to work on first login)
-- ========================================================================================
INSERT INTO public.roles (name, description) VALUES
  ('Administrator', 'Full system access'),
  ('Manager', 'Management access to inventory, sales, and reports'),
  ('Inventory Staff', 'Access to manage stock items, transfers, and daily inventory'),
  ('Cashier', 'Access to sales and cash monitoring'),
  ('Kitchen Staff', 'Access to view stock and request transfers'),
  ('Viewer', 'Read-only access to specific modules')
ON CONFLICT (name) DO NOTHING;

-- ========================================================================================
-- 2. RESTORE SCHEMA PERMISSIONS
-- PostgREST introspects the public schema as the `anon` role.
-- Without USAGE on schema, PostgREST cannot load the schema cache.
-- ========================================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Ensure future tables also get these grants
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL PRIVILEGES ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO anon;

-- ========================================================================================
-- 3. RESTORE EXECUTE GRANTS ON AUTH HELPER FUNCTIONS
-- has_role and has_any_role are SECURITY DEFINER - but PostgREST and Supabase's own 
-- schema introspection can fail if these functions are not EXECUTE-grantable to anon.
-- ========================================================================================
GRANT EXECUTE ON FUNCTION public.has_role(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_any_role(text[]) TO anon, authenticated, service_role;

-- ========================================================================================
-- 4. RESTORE EXECUTE ON INTERNAL FUNCTIONS
-- create_stock_movement is called internally by SECURITY INVOKER RPCs (process_sale, etc)
-- so the authenticated caller must be able to execute it.
-- ========================================================================================
GRANT EXECUTE ON FUNCTION public.create_stock_movement(UUID, UUID, TEXT, NUMERIC, TEXT, UUID, TEXT, TEXT) TO authenticated;

-- ========================================================================================
-- 5. ENSURE PROFILES RLS ALLOWS USERS TO READ OWN PROFILE
-- This is the query immediately after login in AuthContext.tsx
-- ========================================================================================
-- Drop and recreate the profiles policies to ensure they are clean
DROP POLICY IF EXISTS "Profiles are viewable by all authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin full access to profiles" ON public.profiles;

-- Authenticated users can read ALL profiles (needed for UI name display)
CREATE POLICY "Profiles are viewable by all authenticated users" ON public.profiles
  FOR SELECT TO authenticated USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = auth_user_id)
  WITH CHECK ((select auth.uid()) = auth_user_id);

-- Admins can manage all profiles
CREATE POLICY "Admin full access to profiles" ON public.profiles
  FOR ALL TO authenticated
  USING (public.has_role('Administrator'));

-- ========================================================================================
-- 6. ENSURE USER_ROLES RLS IS CORRECT  
-- ========================================================================================
DROP POLICY IF EXISTS "User roles viewable by all authenticated" ON public.user_roles;
DROP POLICY IF EXISTS "Admin can manage user roles" ON public.user_roles;

CREATE POLICY "User roles viewable by all authenticated" ON public.user_roles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin can manage user roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role('Administrator'));

-- ========================================================================================
-- 7. ENSURE ROLES TABLE RLS IS CORRECT
-- ========================================================================================
DROP POLICY IF EXISTS "Roles are viewable by all authenticated" ON public.roles;
DROP POLICY IF EXISTS "Admin can manage roles" ON public.roles;

CREATE POLICY "Roles are viewable by all authenticated" ON public.roles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin can manage roles" ON public.roles
  FOR ALL TO authenticated
  USING (public.has_role('Administrator'));

-- ========================================================================================
-- 8. ENSURE handle_new_user TRIGGER IS CORRECTLY CONFIGURED
-- The trigger must exist on auth.users. Without it, new user signups will not get profiles.
-- ========================================================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================================================================
-- 9. NOTIFY PostgREST TO RELOAD SCHEMA CACHE
-- ========================================================================================
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

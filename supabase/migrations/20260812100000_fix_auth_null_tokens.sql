-- ========================================================================================
-- FIX: confirmation_token NULL scan error in Supabase GoTrue
-- 
-- Root cause: GoTrue (Go) cannot scan NULL into a string variable.
-- The auth.users table requires confirmation_token to be '' (empty string) 
-- when the user is already confirmed, NOT NULL.
-- 
-- This affects users created via:
-- - Supabase Dashboard without sending confirmation email
-- - Manual inserts into auth.users without setting all required fields
-- - Seed scripts that don't set confirmation_token
-- ========================================================================================

UPDATE auth.users 
SET 
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  reauthentication_token = COALESCE(reauthentication_token, ''),
  phone_change_token = COALESCE(phone_change_token, '')
WHERE 
  confirmation_token IS NULL 
  OR recovery_token IS NULL 
  OR email_change_token_new IS NULL 
  OR email_change_token_current IS NULL
  OR reauthentication_token IS NULL
  OR phone_change_token IS NULL;

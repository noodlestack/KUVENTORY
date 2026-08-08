BEGIN;

CREATE OR REPLACE FUNCTION public.fix_auth_token_defaults()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.confirmation_token IS NULL THEN
    NEW.confirmation_token := '';
  END IF;
  IF NEW.recovery_token IS NULL THEN
    NEW.recovery_token := '';
  END IF;
  IF NEW.email_change_token_new IS NULL THEN
    NEW.email_change_token_new := '';
  END IF;
  IF NEW.email_change IS NULL THEN
    NEW.email_change := '';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_fix_auth_token_defaults ON auth.users;
CREATE TRIGGER tr_fix_auth_token_defaults
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.fix_auth_token_defaults();

COMMIT;

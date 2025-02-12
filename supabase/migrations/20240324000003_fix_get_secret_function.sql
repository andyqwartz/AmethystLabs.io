-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.get_secret;

-- Create the get_secret function with proper permissions
CREATE OR REPLACE FUNCTION public.get_secret(p_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_secret text;
  v_user_role public.user_role;
BEGIN
  -- Get the role of the current user
  SELECT role INTO v_user_role
  FROM public.profiles
  WHERE id = auth.uid();

  -- Only allow access to secrets for admin and moderator roles
  IF v_user_role IN ('admin'::public.user_role, 'moderator'::public.user_role) THEN
    SELECT decrypted_secret INTO v_secret
    FROM vault.decrypted_secrets
    WHERE name = p_name;
    
    RETURN v_secret;
  ELSE
    RAISE EXCEPTION 'Unauthorized access to secrets';
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_secret TO authenticated;

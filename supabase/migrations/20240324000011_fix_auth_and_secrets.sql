-- Drop and recreate get_secret function with proper permissions
DROP FUNCTION IF EXISTS public.get_secret;

CREATE OR REPLACE FUNCTION public.get_secret(p_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_secret text;
BEGIN
  SELECT decrypted_secret INTO v_secret
  FROM vault.decrypted_secrets
  WHERE name = p_name;
  
  RETURN v_secret;
END;
$$;

-- Grant execute to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.get_secret TO anon;
GRANT EXECUTE ON FUNCTION public.get_secret TO authenticated;

-- Fix profiles policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.profiles;

CREATE POLICY "Enable read access for all users"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for authenticated users only"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on id"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Grant access to profiles table
GRANT ALL ON public.profiles TO anon;
GRANT ALL ON public.profiles TO authenticated;
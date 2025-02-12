-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for users" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users" ON public.profiles;

-- Create basic policies
CREATE POLICY "Enable read access for all users"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for users"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update for users"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Grant basic permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO anon;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- Fix get_secret function
DROP FUNCTION IF EXISTS public.get_secret;
CREATE FUNCTION public.get_secret(p_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN current_setting('app.settings.' || p_name);
END;
$$;

-- Grant execute to anon and authenticated
GRANT EXECUTE ON FUNCTION public.get_secret TO anon;
GRANT EXECUTE ON FUNCTION public.get_secret TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_secret TO service_role;
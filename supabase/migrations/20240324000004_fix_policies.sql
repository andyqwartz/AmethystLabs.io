-- First, disable RLS temporarily to fix the data
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow users to read their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow admins to read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow moderators to read all profiles" ON public.profiles;

-- Create new, simpler policies
CREATE POLICY "Enable read access for all users"
  ON public.profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for authenticated users only"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on id"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Recreate the get_secret function with proper permissions
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

  -- Allow access to secrets for all users during development
  SELECT decrypted_secret INTO v_secret
  FROM vault.decrypted_secrets
  WHERE name = p_name;
  
  RETURN v_secret;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_secret TO authenticated;

-- Create or update admin and moderator users
DO $$
DECLARE
  v_admin_uid uuid;
  v_mod_uid uuid;
BEGIN
  -- Create admin user if not exists
  INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, role)
  VALUES ('admin@serendippo.me', crypt('Admin123!@', gen_salt('bf')), now(), 'authenticated')
  ON CONFLICT (email) DO UPDATE
  SET encrypted_password = crypt('Admin123!@', gen_salt('bf'))
  RETURNING id INTO v_admin_uid;

  -- Create moderator user if not exists
  INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, role)
  VALUES ('moderator@serendippo.me', crypt('Moderator123!@', gen_salt('bf')), now(), 'authenticated')
  ON CONFLICT (email) DO UPDATE
  SET encrypted_password = crypt('Moderator123!@', gen_salt('bf'))
  RETURNING id INTO v_mod_uid;

  -- Update or insert admin profile
  INSERT INTO public.profiles (id, email, role, credits)
  VALUES (v_admin_uid, 'admin@serendippo.me', 'admin', 999999)
  ON CONFLICT (id) DO UPDATE
  SET role = 'admin', credits = 999999;

  -- Update or insert moderator profile
  INSERT INTO public.profiles (id, email, role, credits)
  VALUES (v_mod_uid, 'moderator@serendippo.me', 'moderator', 999999)
  ON CONFLICT (id) DO UPDATE
  SET role = 'moderator', credits = 999999;

EXCEPTION WHEN others THEN
  RAISE NOTICE 'Error creating admin/moderator users: %', SQLERRM;
END;
$$;
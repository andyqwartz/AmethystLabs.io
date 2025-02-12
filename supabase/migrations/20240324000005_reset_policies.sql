-- First, disable RLS temporarily
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to read their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow admins to read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow moderators to read all profiles" ON public.profiles;

-- Create new simplified policies
CREATE POLICY "profiles_select_policy"
  ON public.profiles
  FOR SELECT
  USING (true);

CREATE POLICY "profiles_insert_policy"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_policy"
  ON public.profiles
  FOR UPDATE
  USING (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin'::public.user_role, 'moderator'::public.user_role)
    )
  );

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Recreate admin and moderator users if they don't exist
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
END;
$$;
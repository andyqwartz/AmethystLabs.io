-- Reset the auth schema
DROP SCHEMA IF EXISTS auth CASCADE;
CREATE SCHEMA IF NOT EXISTS auth;

-- Create the users table with proper constraints
CREATE TABLE auth.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  encrypted_password text NOT NULL,
  email_confirmed_at timestamp with time zone,
  role text DEFAULT 'authenticated',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Reset profiles table
TRUNCATE TABLE public.profiles CASCADE;

-- Create admin and moderator users
DO $$
DECLARE
  v_admin_uid uuid;
  v_mod_uid uuid;
BEGIN
  -- Create admin user
  INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, role)
  VALUES ('admin@serendippo.me', crypt('Admin123!@', gen_salt('bf')), now(), 'authenticated')
  RETURNING id INTO v_admin_uid;

  -- Create moderator user
  INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, role)
  VALUES ('moderator@serendippo.me', crypt('Moderator123!@', gen_salt('bf')), now(), 'authenticated')
  RETURNING id INTO v_mod_uid;

  -- Create admin profile
  INSERT INTO public.profiles (id, email, role, credits)
  VALUES (v_admin_uid, 'admin@serendippo.me', 'admin', 999999);

  -- Create moderator profile
  INSERT INTO public.profiles (id, email, role, credits)
  VALUES (v_mod_uid, 'moderator@serendippo.me', 'moderator', 999999);

EXCEPTION WHEN others THEN
  RAISE NOTICE 'Error creating users: %', SQLERRM;
END;
$$;

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create simplified policies
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;

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
  USING (auth.uid() = id);

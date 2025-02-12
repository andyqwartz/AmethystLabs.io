-- Create admin and moderator roles if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM ('user', 'moderator', 'admin');
  END IF;
END $$;

-- Create or replace the function to create admin user
CREATE OR REPLACE FUNCTION create_admin_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_email text := current_setting('app.admin_email', true);
  admin_password text := current_setting('app.admin_password', true);
  moderator_email text := current_setting('app.moderator_email', true);
  moderator_password text := current_setting('app.moderator_password', true);
  admin_uid uuid;
  moderator_uid uuid;
BEGIN
  -- Create admin user if not exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = admin_email) THEN
    INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, role)
    VALUES (admin_email, crypt(admin_password, gen_salt('bf')), now(), 'authenticated')
    RETURNING id INTO admin_uid;

    -- Create admin profile
    INSERT INTO public.profiles (id, email, role, credits)
    VALUES (admin_uid, admin_email, 'admin'::public.user_role, 999999);
  END IF;

  -- Create moderator user if not exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = moderator_email) THEN
    INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, role)
    VALUES (moderator_email, crypt(moderator_password, gen_salt('bf')), now(), 'authenticated')
    RETURNING id INTO moderator_uid;

    -- Create moderator profile
    INSERT INTO public.profiles (id, email, role, credits)
    VALUES (moderator_uid, moderator_email, 'moderator'::public.user_role, 999999);
  END IF;

EXCEPTION WHEN others THEN
  RAISE NOTICE 'Error creating admin/moderator users: %', SQLERRM;
END;
$$;

-- Set up initial admin and moderator users
DO $$
BEGIN
  -- Set configuration for admin and moderator credentials
  PERFORM set_config('app.admin_email', 'admin@serendippo.me', false);
  PERFORM set_config('app.admin_password', 'Admin123!@', false);
  PERFORM set_config('app.moderator_email', 'moderator@serendippo.me', false);
  PERFORM set_config('app.moderator_password', 'Moderator123!@', false);

  -- Create admin and moderator users
  PERFORM create_admin_user();
END;
$$;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow users to read their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Allow admins to read all profiles"
  ON public.profiles
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'::public.user_role
  ));

CREATE POLICY "Allow moderators to read all profiles"
  ON public.profiles
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'moderator'::public.user_role
  ));

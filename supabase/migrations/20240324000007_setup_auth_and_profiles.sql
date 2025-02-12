-- Create extensions if they don't exist
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create auth schema
CREATE SCHEMA IF NOT EXISTS auth;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS auth.users CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create auth.users table
CREATE TABLE auth.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  encrypted_password text,
  email_confirmed_at timestamp with time zone,
  invited_at timestamp with time zone,
  confirmation_token text,
  confirmation_sent_at timestamp with time zone,
  recovery_token text,
  recovery_sent_at timestamp with time zone,
  email_change_token text,
  email_change text,
  email_change_sent_at timestamp with time zone,
  last_sign_in_at timestamp with time zone,
  raw_app_meta_data jsonb,
  raw_user_meta_data jsonb,
  is_super_admin boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  phone text,
  phone_confirmed_at timestamp with time zone,
  phone_change text,
  phone_change_token text,
  phone_change_sent_at timestamp with time zone,
  confirmed_at timestamp with time zone,
  email_change_confirm_status smallint,
  banned_until timestamp with time zone,
  reauthentication_token text,
  reauthentication_sent_at timestamp with time zone,
  is_sso_user boolean DEFAULT false,
  deleted_at timestamp with time zone,
  role text DEFAULT 'authenticated'
);

-- Create user_role type
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM ('user', 'moderator', 'admin');
  END IF;
END $$;

-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  username text,
  full_name text,
  avatar_url text,
  bio text,
  role public.user_role DEFAULT 'user'::public.user_role,
  credits integer DEFAULT 10,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_login timestamp with time zone,
  preferences jsonb DEFAULT '{}'::jsonb
);

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
END;
$$;

-- Enable RLS
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

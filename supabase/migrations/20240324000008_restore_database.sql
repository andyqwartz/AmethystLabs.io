-- Drop and recreate auth schema
DROP SCHEMA IF EXISTS auth CASCADE;
CREATE SCHEMA auth;

-- Drop and recreate vault schema
DROP SCHEMA IF EXISTS vault CASCADE;
CREATE SCHEMA vault;

-- Drop and recreate public schema
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create user_role type
CREATE TYPE public.user_role AS ENUM ('user', 'moderator', 'admin');

-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
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

-- Create vault tables
CREATE TABLE vault.secrets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  secret text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create view for decrypted secrets
CREATE VIEW vault.decrypted_secrets AS
  SELECT id, name, secret as decrypted_secret
  FROM vault.secrets;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create basic policies
CREATE POLICY "Enable read for users"
  ON public.profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for users"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Create get_secret function
CREATE OR REPLACE FUNCTION public.get_secret(p_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_secret TO authenticated;

-- Insert initial secrets
INSERT INTO vault.secrets (name, secret) VALUES
  ('VITE_REPLICATE_API_TOKEN', 'r8_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'),
  ('stripe_secret_key', 'sk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');

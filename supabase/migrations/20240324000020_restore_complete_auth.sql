-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create vault schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS vault;

-- Create secrets table in vault schema
CREATE TABLE IF NOT EXISTS vault.secrets (
  name TEXT PRIMARY KEY,
  secret TEXT NOT NULL
);

-- Create decrypted secrets view
CREATE OR REPLACE VIEW vault.decrypted_secrets AS
  SELECT name, secret as decrypted_secret FROM vault.secrets;

-- Create function to get secrets
CREATE OR REPLACE FUNCTION get_secret(p_name text)
RETURNS text
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  secret_value text;
BEGIN
  SELECT decrypted_secret INTO secret_value
  FROM vault.decrypted_secrets
  WHERE name = p_name;
  
  RETURN secret_value;
END;
$$;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.credit_transactions CASCADE;
DROP TABLE IF EXISTS public.generations CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  username TEXT,
  full_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
  credits INTEGER NOT NULL DEFAULT 10,
  preferences JSONB NOT NULL DEFAULT '{
    "theme": "dark",
    "emailNotifications": true,
    "autoSave": true,
    "showParameters": true,
    "language": "en",
    "imageQualityPreference": "high",
    "defaultAspectRatio": "1:1",
    "defaultPromptStrength": 0.8,
    "defaultNumOutputs": 1,
    "defaultNumInferenceSteps": 28,
    "defaultGuidanceScale": 3.5,
    "defaultOutputFormat": "webp",
    "defaultOutputQuality": 80
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  last_login TIMESTAMP WITH TIME ZONE
);

-- Create credit transactions table
CREATE TABLE public.credit_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create generations table
CREATE TABLE public.generations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  prompt TEXT NOT NULL,
  generated_image TEXT NOT NULL,
  reference_image TEXT,
  parameters JSONB DEFAULT '{}'::jsonb,
  credits_used INTEGER NOT NULL DEFAULT 1,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create function to handle credit transactions
CREATE OR REPLACE FUNCTION handle_credit_transaction(
  p_user_id UUID,
  p_amount INTEGER,
  p_type TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS TABLE (id UUID, new_balance INTEGER) AS $$
DECLARE
  v_new_balance INTEGER;
  v_transaction_id UUID;
BEGIN
  -- Update user credits
  UPDATE public.profiles
  SET credits = credits + p_amount
  WHERE id = p_user_id
  RETURNING credits INTO v_new_balance;

  -- Record transaction
  INSERT INTO public.credit_transactions (user_id, amount, type, metadata)
  VALUES (p_user_id, p_amount, p_type, p_metadata)
  RETURNING id INTO v_transaction_id;

  RETURN QUERY SELECT v_transaction_id, v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create profile on signup trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set up trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can view own transactions"
  ON public.credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own generations"
  ON public.generations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own generations"
  ON public.generations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT INSERT ON public.generations TO authenticated;
GRANT EXECUTE ON FUNCTION handle_credit_transaction(UUID, INTEGER, TEXT, JSONB) TO authenticated;

-- Add admin user if needed (replace with actual admin email/password)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at)
VALUES ('00000000-0000-0000-0000-000000000000', 'admin@example.com', crypt('adminpassword', gen_salt('bf')), now())
ON CONFLICT (id) DO NOTHING;

-- Set admin role
INSERT INTO public.profiles (id, email, role, credits)
VALUES ('00000000-0000-0000-0000-000000000000', 'admin@example.com', 'admin', 999999)
ON CONFLICT (id) DO NOTHING;
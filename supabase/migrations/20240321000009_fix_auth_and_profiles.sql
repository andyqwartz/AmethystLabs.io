-- Drop existing objects
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;
DROP FUNCTION IF EXISTS public.handle_auth_user_created CASCADE;

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  credits INTEGER NOT NULL DEFAULT 10,
  preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_login TIMESTAMP WITH TIME ZONE,
  email_verified BOOLEAN DEFAULT false
);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_auth_user_created()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, credits, email_verified)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, NEW.raw_user_meta_data->>'email'),
    'user',
    10,
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_created();

-- Create function to handle email verification
CREATE OR REPLACE FUNCTION public.handle_email_verification()
RETURNS trigger AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    UPDATE public.profiles
    SET email_verified = true
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for email verification
CREATE TRIGGER on_auth_email_verified
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL)
  EXECUTE FUNCTION public.handle_email_verification();

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create function to handle credit transactions
CREATE OR REPLACE FUNCTION public.handle_credit_transaction(
  p_user_id UUID,
  p_amount INTEGER,
  p_type TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_transaction_id UUID;
  v_current_credits INTEGER;
BEGIN
  -- Get current credits
  SELECT credits INTO v_current_credits
  FROM profiles
  WHERE id = p_user_id;

  -- Check if user has enough credits for debit
  IF p_amount < 0 AND (v_current_credits + p_amount) < 0 THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;

  -- Insert transaction
  INSERT INTO credit_transactions (user_id, amount, type, metadata)
  VALUES (p_user_id, p_amount, p_type, p_metadata)
  RETURNING id INTO v_transaction_id;

  -- Update user credits
  UPDATE profiles
  SET 
    credits = credits + p_amount,
    updated_at = now()
  WHERE id = p_user_id;

  RETURN v_transaction_id;
END;
$$;
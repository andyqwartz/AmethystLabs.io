-- Drop existing objects
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT,
  full_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  credits INTEGER NOT NULL DEFAULT 10,
  preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_login TIMESTAMP WITH TIME ZONE
);

-- Create the function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, credits)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, NEW.raw_user_meta_data->>'email'),
    'user',
    10
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create credit transactions table
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  amount INTEGER NOT NULL,
  type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

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
BEGIN
  -- Insert the transaction
  INSERT INTO credit_transactions (user_id, amount, type, metadata)
  VALUES (p_user_id, p_amount, p_type, p_metadata)
  RETURNING id INTO v_transaction_id;

  -- Update user credits
  UPDATE profiles
  SET credits = credits + p_amount
  WHERE id = p_user_id;

  RETURN v_transaction_id;
END;
$$;
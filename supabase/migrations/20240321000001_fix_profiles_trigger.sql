-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;

-- Create the function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, credits)
  VALUES (
    NEW.id,
    NEW.email,
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

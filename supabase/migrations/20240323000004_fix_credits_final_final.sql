-- Set the default credits to 10 in the profiles table
ALTER TABLE profiles ALTER COLUMN credits SET DEFAULT 10;

-- Update any existing users who still have 100 credits to 10
UPDATE profiles SET credits = 10 WHERE credits = 100;

-- Add a trigger to ensure new users always get 10 credits
CREATE OR REPLACE FUNCTION set_default_credits()
RETURNS TRIGGER AS $$
BEGIN
    NEW.credits = 10;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_default_credits ON profiles;
CREATE TRIGGER ensure_default_credits
    BEFORE INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION set_default_credits();

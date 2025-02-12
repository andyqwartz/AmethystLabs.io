-- Set the default credits to 10 in the profiles table
ALTER TABLE profiles ALTER COLUMN credits SET DEFAULT 10;

-- Update any existing users who still have 100 credits to 10 if they haven't used any
UPDATE profiles SET credits = 10 WHERE credits = 100;

-- Update the default credits in the profiles table
ALTER TABLE profiles ALTER COLUMN credits SET DEFAULT 100;

-- Update existing users who still have 10 credits
UPDATE profiles SET credits = 100 WHERE credits = 10;

-- Set the default credits to 10
ALTER TABLE profiles ALTER COLUMN credits SET DEFAULT 10;

-- Update any users who still have 100 credits to 10 if they haven't used any
UPDATE profiles SET credits = 10 WHERE credits = 100;

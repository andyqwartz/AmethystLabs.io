-- Set the default credits back to 10
ALTER TABLE profiles ALTER COLUMN credits SET DEFAULT 10;

-- Update existing users who have 100 credits back to 10 if they haven't used any
UPDATE profiles SET credits = 10 WHERE credits = 100;

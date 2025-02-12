-- Create app.settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS app.settings (
  name TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Create function to get secret
CREATE OR REPLACE FUNCTION public.get_secret(name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (SELECT value FROM app.settings WHERE settings.name = $1);
END;
$$;

-- Insert Replicate token
INSERT INTO app.settings (name, value)
VALUES ('replicate_api_token', 'YOUR_REPLICATE_TOKEN_HERE')
ON CONFLICT (name) DO UPDATE SET value = EXCLUDED.value;
-- Create schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS vault;

-- Create secrets table
CREATE TABLE IF NOT EXISTS vault.secrets (
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
  RETURN (SELECT value FROM vault.secrets WHERE secrets.name = $1);
END;
$$;

-- Insert Replicate token
INSERT INTO vault.secrets (name, value)
VALUES ('replicate_api_token', 'YOUR_REPLICATE_TOKEN_HERE')
ON CONFLICT (name) DO UPDATE SET value = EXCLUDED.value;
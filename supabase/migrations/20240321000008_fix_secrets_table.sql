-- Create schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS vault;

-- Drop existing objects
DROP TABLE IF EXISTS vault.secrets;

-- Create secrets table
CREATE TABLE vault.secrets (
  name TEXT PRIMARY KEY,
  secret_value TEXT NOT NULL
);

-- Create function to get secret
CREATE OR REPLACE FUNCTION public.get_secret(name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (SELECT secret_value FROM vault.secrets WHERE secrets.name = $1);
END;
$$;

-- Insert Replicate token
INSERT INTO vault.secrets (name, secret_value)
VALUES ('replicate_api_token', 'YOUR_REPLICATE_TOKEN_HERE')
ON CONFLICT (name) DO UPDATE SET secret_value = EXCLUDED.secret_value;
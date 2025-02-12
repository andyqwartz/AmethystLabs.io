-- Create vault schema if it doesn't exist
DROP SCHEMA IF EXISTS vault CASCADE;
CREATE SCHEMA vault;

-- Create secrets table
CREATE TABLE vault.secrets (
    name TEXT PRIMARY KEY,
    secret TEXT NOT NULL
);

-- Create function to get secrets
CREATE OR REPLACE FUNCTION get_secret(p_name text)
RETURNS text
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    v_secret text;
BEGIN
    SELECT secret INTO v_secret
    FROM vault.secrets
    WHERE name = p_name;
    
    RETURN v_secret;
END;
$$;

-- Grant usage on vault schema
GRANT USAGE ON SCHEMA vault TO service_role;

-- Grant select on secrets table to service_role
GRANT SELECT ON vault.secrets TO service_role;

-- Grant execute on get_secret function
GRANT EXECUTE ON FUNCTION get_secret(text) TO authenticated;

-- Insert Replicate token if not exists
INSERT INTO vault.secrets (name, secret)
VALUES ('VITE_REPLICATE_API_TOKEN', 'your-replicate-token-here')
ON CONFLICT (name) DO NOTHING;

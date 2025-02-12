-- Drop existing vault schema if it exists
DROP SCHEMA IF EXISTS vault CASCADE;

-- Create vault schema
CREATE SCHEMA vault;

-- Grant usage to postgres (superuser)
GRANT USAGE ON SCHEMA vault TO postgres;

-- Create secrets table
CREATE TABLE vault.secrets (
    name TEXT PRIMARY KEY,
    secret TEXT NOT NULL
);

-- Grant permissions on secrets table
GRANT ALL ON vault.secrets TO postgres;
GRANT SELECT ON vault.secrets TO service_role;

-- Create get_secret function
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

-- Grant execute permission on function
GRANT EXECUTE ON FUNCTION get_secret(text) TO authenticated;

-- Insert initial secrets if needed
INSERT INTO vault.secrets (name, secret)
VALUES 
    ('VITE_REPLICATE_API_TOKEN', 'your-replicate-token-here'),
    ('stripe_secret_key', 'your-stripe-secret-key-here')
ON CONFLICT (name) DO NOTHING;

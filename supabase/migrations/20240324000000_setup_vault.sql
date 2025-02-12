-- Enable the vault extension
CREATE EXTENSION IF NOT EXISTS vault;

-- Create a function to get secrets from vault
CREATE OR REPLACE FUNCTION get_secret(secret_name text)
RETURNS text
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  secret_value text;
BEGIN
  SELECT decrypted_secret INTO secret_value
  FROM vault.decrypted_secrets
  WHERE name = secret_name;
  
  RETURN secret_value;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_secret(text) TO authenticated;

-- Insert the secret into vault (this needs to be done via SQL editor in Supabase dashboard)
-- vault.create_secret('replicate_api_token', 'your-replicate-token-here');

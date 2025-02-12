-- Create function to get secrets from vault
CREATE OR REPLACE FUNCTION get_secret(p_name text)
RETURNS text
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  secret_value text;
BEGIN
  SELECT decrypted_secret INTO secret_value
  FROM vault.decrypted_secrets
  WHERE name = p_name;
  
  RETURN secret_value;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_secret(text) TO authenticated;

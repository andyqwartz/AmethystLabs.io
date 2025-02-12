-- Create secrets if they don't exist
INSERT INTO vault.secrets (name, secret)
VALUES 
  ('stripe_secret_key', 'sk_test_XXXXXXXXXXXXXXXXXXXXX'),
  ('stripe_webhook_secret', 'whsec_XXXXXXXXXXXXXXXXXXXXX'),
  ('replicate_api_token', 'r8_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')
ON CONFLICT (name) DO UPDATE
SET secret = EXCLUDED.secret;

-- Create function to get secrets
CREATE OR REPLACE FUNCTION get_secret(name text)
RETURNS text
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  secret_value text;
BEGIN
  SELECT secret INTO secret_value
  FROM vault.secrets
  WHERE name = $1;
  
  RETURN secret_value;
END;
$$;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION get_secret(text) TO service_role;
GRANT EXECUTE ON FUNCTION get_secret(text) TO anon;

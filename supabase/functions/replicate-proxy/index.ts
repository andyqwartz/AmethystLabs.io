import { serve } from "https://deno.fresh.dev/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
    );

    // Get the token from vault
    const { data: token } = await supabaseClient.rpc("get_secret", {
      p_name: "VITE_REPLICATE_API_TOKEN",
    });

    if (!token) {
      throw new Error("No Replicate token found");
    }

    // Forward the request to Replicate
    const replicateUrl = new URL(req.url).searchParams.get("url");
    if (!replicateUrl) {
      throw new Error("No Replicate URL provided");
    }

    const body = await req.json();
    const response = await fetch(`https://api.replicate.com${replicateUrl}`, {
      method: req.method,
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});

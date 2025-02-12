import { serve } from "https://deno.fresh.dev/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Request-Headers": "*",
};

const proxyRequest = async (url: string, options: RequestInit) => {
  const response = await fetch(url, options);
  const data = await response.json();
  return new Response(JSON.stringify(data), {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
    status: response.status,
  });
};

const handler = async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        ...corsHeaders,
        "Access-Control-Max-Age": "86400",
        "Access-Control-Allow-Headers":
          req.headers.get("Access-Control-Request-Headers") || "*",
      },
    });
  }

  // Get the Replicate token from environment variable
  const REPLICATE_API_TOKEN = Deno.env.get("REPLICATE_API_TOKEN");
  if (!REPLICATE_API_TOKEN) {
    return new Response(
      JSON.stringify({ error: "Replicate token not configured" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  try {
    // Parse request body
    const { input, model, action, id } = await req.json();

    // Handle status check
    if (action === "status" && id) {
      const response = await fetch(
        `https://api.replicate.com/v1/predictions/${id}`,
        {
          headers: {
            Authorization: `Token ${REPLICATE_API_TOKEN}`,
          },
        },
      );
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    // Create prediction
    const prediction = await proxyRequest(
      "https://api.replicate.com/v1/predictions",
      {
        method: "POST",
        headers: {
          Authorization: `Token ${REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          version: model,
          input,
        }),
      },
    );

    // Get prediction data
    const predictionData = await prediction.json();
    if (!predictionData.id) {
      throw new Error("Failed to start prediction");
    }

    // Poll for completion
    let result = predictionData;
    while (result.status === "starting" || result.status === "processing") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const statusResponse = await proxyRequest(
        `https://api.replicate.com/v1/predictions/${predictionData.id}`,
        {
          headers: {
            Authorization: `Token ${REPLICATE_API_TOKEN}`,
          },
        },
      );
      result = await statusResponse.json();
    }

    return new Response(JSON.stringify(result), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
};

serve(handler);

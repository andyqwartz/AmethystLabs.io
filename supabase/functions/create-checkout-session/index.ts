import { serve } from "https://deno.fresh.dev/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import Stripe from "https://esm.sh/stripe@14.14.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

serve(async (req) => {
  try {
    const { amount, credits } = await req.json();

    // Get the user from the auth header
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_ANON_KEY") || "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      },
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${credits} Credits`,
              description: `Purchase ${credits} credits for image generation`,
            },
            unit_amount: amount * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/profile?payment=success`,
      cancel_url: `${req.headers.get("origin")}/profile?payment=cancelled`,
      metadata: {
        userId: user.id,
        credits: credits.toString(),
      },
    });

    return new Response(JSON.stringify({ id: session.id }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error creating checkout session:", err);
    return new Response(JSON.stringify({ error: { message: err.message } }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
});

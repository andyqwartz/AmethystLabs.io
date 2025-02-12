import { serve } from "https://deno.fresh.dev/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import Stripe from "https://esm.sh/stripe@14.14.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

serve(async (req) => {
  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response("No signature provided", { status: 400 });
    }

    const body = await req.text();
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret,
    );

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata || {};
        const userId = metadata.userId;
        const credits = parseInt(metadata.credits || "0", 10);

        if (!userId || !credits) {
          throw new Error("Missing userId or credits in session metadata");
        }

        // Add credits using the handle_credit_transaction function
        const { error } = await supabaseClient.rpc(
          "handle_credit_transaction",
          {
            p_user_id: userId,
            p_amount: credits,
            p_type: "purchase",
            p_metadata: {
              stripe_payment_id: session.payment_intent,
              stripe_session_id: session.id,
              amount_paid: session.amount_total,
            },
          },
        );

        if (error) {
          throw error;
        }

        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error("Payment failed:", paymentIntent.id);
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error processing webhook:", err);
    return new Response(JSON.stringify({ error: { message: err.message } }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
});

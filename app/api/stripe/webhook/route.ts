import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-04-22.dahlia",
  });
}

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

// Use service role to update subscription records without RLS restrictions
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const supabaseAdmin = getSupabaseAdmin();
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json(
      { error: `Webhook verification failed: ${err}` },
      { status: 400 }
    );
  }

  const userId = (event.data.object as { metadata?: { supabase_user_id?: string } })
    ?.metadata?.supabase_user_id;

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      if (!userId) break;

      const periodEnd = (sub as unknown as { current_period_end?: number }).current_period_end;

      await supabaseAdmin.from("subscriptions").upsert({
        user_id: userId,
        stripe_subscription_id: sub.id,
        plan: sub.status === "active" ? "premium" : "free",
        status: sub.status as string,
        current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      if (!userId) break;

      await supabaseAdmin.from("subscriptions").upsert({
        user_id: userId,
        stripe_subscription_id: sub.id,
        plan: "free",
        status: "canceled",
        current_period_end: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
      break;
    }

    default:
      // Unhandled event – return 200 to acknowledge receipt
      break;
  }

  return NextResponse.json({ received: true });
}

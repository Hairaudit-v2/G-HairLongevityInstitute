import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/payment/stripeServer";
import {
  applyCheckoutSessionCompleted,
  handleSubscriptionDeleted,
  handleSubscriptionEvent,
  insertWebhookEventIfNew,
} from "@/lib/payment/stripeWebhookHandlers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ ok: false, error: "Webhook not configured." }, { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ ok: false, error: "Missing signature." }, { status: 400 });
  }

  const rawBody = await req.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Invalid payload.";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }

  const supabase = supabaseAdmin();

  try {
    const isNew = await insertWebhookEventIfNew(supabase, event.id, event.type);
    if (!isNew) {
      return NextResponse.json({ ok: true, duplicate: true });
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Database error.";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await applyCheckoutSessionCompleted(supabase, session, event.id);
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionEvent(supabase, sub);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(supabase, sub, event.id);
        break;
      }
      default:
        break;
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Handler error.";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

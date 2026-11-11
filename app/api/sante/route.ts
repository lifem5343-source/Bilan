import type Stripe from "stripe";
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Page de diagnostic TEMPORAIRE. À supprimer avant la mise en production.
// Elle n'affiche jamais de clé : seulement si chaque réglage existe, et la réponse de Stripe.
function masquer(texte: string): string {
  return texte
    .replace(/(sk|pk|rk|whsec)_[A-Za-z0-9_*]+/g, "$1_***")
    .slice(0, 300);
}

export async function GET(request: Request) {
  const reglages = {
    STRIPE_SECRET_KEY: Boolean(process.env.STRIPE_SECRET_KEY),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: Boolean(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    ),
    STRIPE_WEBHOOK_SECRET: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    STRIPE_PRICE_ID: Boolean(process.env.STRIPE_PRICE_ID),
    NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    NEXT_PUBLIC_CONTACT_EMAIL: Boolean(process.env.NEXT_PUBLIC_CONTACT_EMAIL),
  };

  const cles = {
    secrete: process.env.STRIPE_SECRET_KEY?.slice(0, 8) ?? null,
    publique: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.slice(0, 8) ?? null,
  };

  let stripe: Record<string, unknown> = {};
  try {
    const client = getStripe();
    const prix = await client.prices.retrieve(process.env.STRIPE_PRICE_ID ?? "");
    stripe = {
      prix: { actif: prix.active, mode: prix.livemode ? "reel" : "test" },
    };

    const origine = new URL(request.url).origin;
    const params = {
      mode: "subscription",
      ui_mode: "embedded_page",
      line_items: [{ price: prix.id, quantity: 1 }],
      locale: "fr",
      return_url: `${origine}/merci?session_id={CHECKOUT_SESSION_ID}`,
    } as unknown as Stripe.Checkout.SessionCreateParams;
    const session = await client.checkout.sessions.create(params);
    stripe = {
      ...stripe,
      sessionCreee: true,
      uiMode: session.ui_mode,
      aUnClientSecret: Boolean(session.client_secret),
    };
  } catch (erreur) {
    const e = erreur as {
      type?: string;
      code?: string;
      statusCode?: number;
      param?: string;
      message?: string;
    };
    stripe = {
      ...stripe,
      erreur: {
        type: e.type,
        code: e.code,
        statut: e.statusCode,
        param: e.param,
        message: masquer(e.message ?? ""),
      },
    };
  }

  return NextResponse.json({ reglages, cles, stripe });
}

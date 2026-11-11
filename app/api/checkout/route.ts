import type Stripe from "stripe";
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Crée une session de paiement intégrée. Le prix vient du serveur, jamais du navigateur.
export async function POST(request: Request) {
  const prix = process.env.STRIPE_PRICE_ID;
  if (!prix) {
    return NextResponse.json(
      { erreur: "Le paiement n'est pas encore disponible." },
      { status: 503 },
    );
  }

  try {
    const origine = new URL(request.url).origin;

    const params = {
      mode: "subscription",
      ui_mode: "embedded_page",
      line_items: [{ price: prix, quantity: 1 }],
      locale: "fr",
      return_url: `${origine}/merci?session_id={CHECKOUT_SESSION_ID}`,
    } as unknown as Stripe.Checkout.SessionCreateParams;

    const session = await getStripe().checkout.sessions.create(params);

    if (!session.client_secret) {
      throw new Error("Session sans client_secret");
    }
    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (erreur) {
    console.error("Création de la session de paiement impossible", erreur);
    return NextResponse.json(
      { erreur: "Le paiement n'a pas pu s'ouvrir." },
      { status: 500 },
    );
  }
}

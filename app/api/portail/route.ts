import type Stripe from "stripe";
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { adresseSite } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Trouve la configuration du portail client Stripe, ou la crée (résiliation en fin de période,
// changement de carte, factures). Le portail héberge l'écran de résiliation : pas de code à nous.
async function obtenirConfiguration(stripe: Stripe, retour: string): Promise<string> {
  const existantes = await stripe.billingPortal.configurations.list({
    active: true,
    limit: 1,
  });
  if (existantes.data[0]) return existantes.data[0].id;

  const params = {
    business_profile: { headline: "Gérer mon abonnement Bilan" },
    default_return_url: retour,
    features: {
      subscription_cancel: { enabled: true, mode: "at_period_end" },
      payment_method_update: { enabled: true },
      invoice_history: { enabled: true },
      customer_update: { enabled: true, allowed_updates: ["email", "name"] },
    },
  } as unknown as Stripe.BillingPortal.ConfigurationCreateParams;
  const creee = await stripe.billingPortal.configurations.create(params);
  return creee.id;
}

// Ouvre le portail pour l'abonné connecté. L'identité vient du jeton de connexion vérifié
// côté serveur, jamais d'une valeur envoyée par le navigateur.
export async function POST(request: Request) {
  try {
    const jeton = (request.headers.get("authorization") ?? "").replace(/^Bearer /, "");
    if (!jeton) return NextResponse.json({ erreur: "Non connecté" }, { status: 401 });

    const supabase = getSupabaseAdmin();
    const { data: auth } = await supabase.auth.getUser(jeton);
    const utilisateur = auth?.user;
    if (!utilisateur) return NextResponse.json({ erreur: "Non connecté" }, { status: 401 });

    const { data: abonnements } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", utilisateur.id)
      .in("status", ["active", "trialing", "past_due"])
      .order("created_at", { ascending: false })
      .limit(1);
    const client = abonnements?.[0]?.stripe_customer_id;
    if (!client) return NextResponse.json({ erreur: "Aucun abonnement" }, { status: 404 });

    const stripe = getStripe();
    const retour = `${adresseSite(new URL(request.url).origin)}/espace`;
    const configuration = await obtenirConfiguration(stripe, retour);
    const session = await stripe.billingPortal.sessions.create({
      customer: client,
      configuration,
      return_url: retour,
    });
    return NextResponse.json({ url: session.url });
  } catch (erreur) {
    console.error("Ouverture du portail impossible", erreur);
    return NextResponse.json({ erreur: "Portail indisponible" }, { status: 500 });
  }
}

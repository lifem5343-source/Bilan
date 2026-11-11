import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Page de diagnostic TEMPORAIRE. À supprimer avant la mise en production.
// Elle n'affiche jamais de clé : seulement si chaque réglage existe, l'identifiant
// (public) du compte Stripe auquel appartient la clé secrète, et les objets qu'il contient.
function masquer(texte: string): string {
  return texte
    .replace(/(sk|pk|rk|whsec)_[A-Za-z0-9_*]+/g, "$1_***")
    .slice(0, 300);
}

async function essayer<T>(action: () => Promise<T>): Promise<T | { erreur: string }> {
  try {
    return await action();
  } catch (erreur) {
    const e = erreur as { code?: string; message?: string };
    return { erreur: masquer(`${e.code ?? ""} ${e.message ?? ""}`.trim()) };
  }
}

export async function GET() {
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

  const idPrixConfigure = process.env.STRIPE_PRICE_ID ?? "";

  const stripe = await essayer(async () => {
    const client = getStripe();

    const compte = await essayer(async () => {
      const c = await client.accounts.retrieve();
      return { id: c.id };
    });

    const prix = await essayer(async () => {
      const liste = await client.prices.list({ limit: 10 });
      return liste.data.map((p) => ({
        id: p.id,
        cle: p.lookup_key,
        actif: p.active,
        montant: p.unit_amount,
      }));
    });

    const webhooks = await essayer(async () => {
      const liste = await client.webhookEndpoints.list({ limit: 10 });
      return liste.data.map((w) => ({
        id: w.id,
        url: w.url,
        statut: w.status,
        evenements: w.enabled_events.length,
      }));
    });

    return { compte, prix, webhooks };
  });

  return NextResponse.json({
    reglages,
    idPrixConfigure,
    longueurIdPrix: idPrixConfigure.length,
    stripe,
  });
}

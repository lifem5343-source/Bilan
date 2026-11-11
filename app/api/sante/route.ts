import type Stripe from "stripe";
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { obtenirIdPrix } from "@/lib/prix";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Page de diagnostic TEMPORAIRE. À supprimer avant la mise en production.
// Elle n'affiche jamais de clé : seulement si chaque réglage existe, l'identifiant
// (public) du compte Stripe auquel appartient la clé secrète, et la réponse de Stripe.
function masquer(texte: string): string {
  return texte
    .replace(/(sk|pk|rk|whsec)_[A-Za-z0-9_*]+/g, "$1_***")
    .slice(0, 900);
}

async function essayer<T>(
  action: () => Promise<T>,
): Promise<T | { erreur: string }> {
  try {
    return await action();
  } catch (erreur) {
    const e = erreur as {
      type?: string;
      code?: string;
      param?: string;
      statusCode?: number;
      message?: string;
    };
    return {
      erreur: masquer(
        [e.type, e.code, e.param, e.statusCode, e.message]
          .filter(Boolean)
          .join(" | "),
      ),
    };
  }
}

export async function GET(request: Request) {
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

    // Reproduit exactement ce que fait le bouton « Payer ».
    const paiement = await essayer(async () => {
      const idPrix = await obtenirIdPrix();
      const origine = new URL(request.url).origin;
      const params = {
        mode: "subscription",
        ui_mode: "embedded_page",
        line_items: [{ price: idPrix, quantity: 1 }],
        locale: "fr",
        managed_payments: { enabled: false },
        return_url: `${origine}/merci?session_id={CHECKOUT_SESSION_ID}`,
      } as unknown as Stripe.Checkout.SessionCreateParams;
      const session = await client.checkout.sessions.create(params);
      return {
        prix: idPrix,
        uiMode: session.ui_mode,
        statut: session.status,
        aUnClientSecret: Boolean(session.client_secret),
      };
    });

    return { compte, prix, paiement };
  });

  return NextResponse.json({
    idPrixConfigure,
    stripe,
  });
}

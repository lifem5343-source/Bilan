import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Connexion juste après un paiement, sans e-mail.
// Seul le payeur connaît l'identifiant de session (il vient de l'adresse de retour
// de Stripe) : on le vérifie auprès de Stripe, côté serveur, avant d'ouvrir quoi que ce soit.
export async function POST(request: Request) {
  try {
    const corps = (await request.json().catch(() => null)) as {
      session_id?: unknown;
    } | null;
    const idSession = corps?.session_id;
    if (
      typeof idSession !== "string" ||
      !/^cs_(test|live)_[A-Za-z0-9]+$/.test(idSession)
    ) {
      return NextResponse.json({ erreur: "Session invalide." }, { status: 400 });
    }

    const session = await getStripe().checkout.sessions.retrieve(idSession);
    const paye =
      session.status === "complete" && session.payment_status !== "unpaid";
    const email = session.customer_details?.email;
    if (!paye || !email) {
      return NextResponse.json({ erreur: "Paiement non confirmé." }, { status: 403 });
    }

    const { data, error } = await getSupabaseAdmin().auth.admin.generateLink({
      type: "magiclink",
      email,
    });
    const jeton = data?.properties?.hashed_token;
    if (error || !jeton) {
      throw error ?? new Error("Jeton de connexion absent");
    }
    return NextResponse.json({ token_hash: jeton });
  } catch (erreur) {
    console.error("Connexion après paiement impossible", erreur);
    return NextResponse.json({ erreur: "Connexion impossible." }, { status: 500 });
  }
}

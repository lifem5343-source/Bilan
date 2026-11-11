import type Stripe from "stripe";
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Retrouve l'utilisateur Supabase de ce client Stripe, ou le crée avec son e-mail.
async function trouverOuCreerUtilisateur(
  email: string,
  customerId: string,
): Promise<string> {
  const supabase = getSupabaseAdmin();

  const { data: existant } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .limit(1)
    .maybeSingle();
  if (existant?.user_id) {
    return existant.user_id as string;
  }

  const { data: cree, error } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
  });
  if (cree?.user) {
    return cree.user.id;
  }

  // Le compte existe peut-être déjà : on le cherche par e-mail.
  for (let page = 1; page <= 20; page++) {
    const { data: liste, error: erreurListe } =
      await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (erreurListe) throw erreurListe;
    const trouve = liste.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase(),
    );
    if (trouve) return trouve.id;
    if (liste.users.length < 200) break;
  }
  throw error ?? new Error("Création de l'utilisateur impossible");
}

// Copie l'état de l'abonnement Stripe dans la base. Rejouer deux fois le même
// événement donne le même résultat.
async function synchroniser(abonnement: Stripe.Subscription) {
  const stripe = getStripe();
  const customerId =
    typeof abonnement.customer === "string"
      ? abonnement.customer
      : abonnement.customer.id;

  const client = await stripe.customers.retrieve(customerId);
  if ("deleted" in client) {
    throw new Error("Client Stripe supprimé");
  }
  if (!client.email) {
    throw new Error("Client Stripe sans e-mail");
  }

  const userId = await trouverOuCreerUtilisateur(client.email, customerId);
  const ligne = abonnement.items.data[0];
  const finPeriode = ligne?.current_period_end
    ? new Date(ligne.current_period_end * 1000).toISOString()
    : null;

  const { error } = await getSupabaseAdmin()
    .from("subscriptions")
    .upsert(
      {
        user_id: userId,
        stripe_customer_id: customerId,
        stripe_subscription_id: abonnement.id,
        stripe_price_id: ligne?.price.id ?? null,
        status: abonnement.status,
        current_period_end: finPeriode,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "stripe_subscription_id" },
    );
  if (error) throw error;
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) {
    return NextResponse.json({ erreur: "Requête invalide" }, { status: 400 });
  }

  // Le corps brut est indispensable pour vérifier la signature.
  const corps = await request.text();

  let evenement: Stripe.Event;
  try {
    evenement = getStripe().webhooks.constructEvent(corps, signature, secret);
  } catch {
    return NextResponse.json({ erreur: "Signature invalide" }, { status: 400 });
  }

  try {
    switch (evenement.type) {
      case "checkout.session.completed": {
        const session = evenement.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription" && session.subscription) {
          const id =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id;
          const abonnement = await getStripe().subscriptions.retrieve(id);
          await synchroniser(abonnement);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await synchroniser(evenement.data.object as Stripe.Subscription);
        break;
      }
      default:
        break;
    }
  } catch (erreur) {
    console.error("Traitement du webhook impossible", evenement.type, erreur);
    // Une erreur 500 fait rejouer l'événement par Stripe.
    return NextResponse.json({ erreur: "Traitement impossible" }, { status: 500 });
  }

  return NextResponse.json({ recu: true });
}

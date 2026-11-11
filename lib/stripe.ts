import Stripe from "stripe";

let client: Stripe | null = null;

// Client Stripe côté serveur uniquement. La clé secrète ne quitte jamais le serveur.
export function getStripe(): Stripe {
  if (!client) {
    const cle = process.env.STRIPE_SECRET_KEY;
    if (!cle) {
      throw new Error("STRIPE_SECRET_KEY est manquante");
    }
    // Version de l'API fixée ici : le paiement intégré (ui_mode "embedded_page")
    // exige au moins 2026-03-25.dahlia, quelle que soit la version par défaut du compte.
    client = new Stripe(cle, {
      apiVersion: "2026-03-25.dahlia" as unknown as Stripe.LatestApiVersion,
    });
  }
  return client;
}

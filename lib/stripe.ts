import Stripe from "stripe";

let client: Stripe | null = null;

// Client Stripe côté serveur uniquement. La clé secrète ne quitte jamais le serveur.
export function getStripe(): Stripe {
  if (!client) {
    const cle = process.env.STRIPE_SECRET_KEY;
    if (!cle) {
      throw new Error("STRIPE_SECRET_KEY est manquante");
    }
    client = new Stripe(cle);
  }
  return client;
}

import { getStripe } from "@/lib/stripe";
import { PRIX_MENSUEL } from "@/lib/offre";

const CLE_PRIX = "bilan_mensuel_39";

// Retrouve le prix de l'abonnement dans le compte Stripe de la clé utilisée,
// ou le crée s'il n'existe pas encore. Le montant vient du serveur, jamais du navigateur.
export async function obtenirIdPrix(): Promise<string> {
  const stripe = getStripe();

  const existants = await stripe.prices.list({
    lookup_keys: [CLE_PRIX],
    active: true,
    limit: 1,
  });
  if (existants.data[0]) {
    return existants.data[0].id;
  }

  const produit = await stripe.products.create({
    name: "Bilan",
    description:
      "Bilans mensuels envoyés automatiquement aux clients des créateurs de contenu. 10 clients suivis.",
    statement_descriptor: "BILAN",
  });

  try {
    const prix = await stripe.prices.create({
      product: produit.id,
      currency: "eur",
      unit_amount: PRIX_MENSUEL * 100,
      recurring: { interval: "month" },
      lookup_key: CLE_PRIX,
      nickname: "Bilan mensuel - 10 clients",
    });
    return prix.id;
  } catch (erreur) {
    // Une autre requête l'a peut-être créé au même moment.
    const apres = await stripe.prices.list({
      lookup_keys: [CLE_PRIX],
      active: true,
      limit: 1,
    });
    if (apres.data[0]) {
      return apres.data[0].id;
    }
    throw erreur;
  }
}

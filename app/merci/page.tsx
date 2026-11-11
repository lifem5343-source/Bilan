import Link from "next/link";
import type { Metadata } from "next";
import { getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Merci",
  robots: { index: false },
};

// Cette page n'ouvre aucun accès : elle ne fait qu'informer.
// L'accès est donné uniquement par le webhook Stripe, côté serveur.
export default async function Merci({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: idSession } = await searchParams;

  let paye = false;
  if (idSession && /^cs_(test|live)_[A-Za-z0-9]+$/.test(idSession)) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(idSession);
      paye = session.status === "complete" && session.payment_status !== "unpaid";
    } catch {
      paye = false;
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-5 py-10">
      {paye ? (
        <>
          <p className="chiffre text-lg">Paiement reçu</p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight">
            Merci, ton abonnement est en cours d&apos;activation.
          </h1>
          <p className="mt-4 text-lg text-sourdine">
            Ouvre ton espace avec l&apos;e-mail utilisé pour payer. On t&apos;y
            envoie un lien de connexion, sans mot de passe.
          </p>
          <div className="mt-8 max-w-xs">
            <Link href="/espace" className="bouton">
              Ouvrir mon espace
            </Link>
          </div>
        </>
      ) : (
        <>
          <h1 className="font-display text-4xl font-bold tracking-tight">
            Le paiement n&apos;a pas abouti.
          </h1>
          <p className="mt-4 text-lg text-sourdine">
            Rien n&apos;a été débité. Tu peux réessayer, avec une autre carte si
            besoin.
          </p>
          <div className="mt-8 max-w-xs">
            <Link href="/#offre" className="bouton">
              Réessayer le paiement
            </Link>
          </div>
        </>
      )}
    </main>
  );
}

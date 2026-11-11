import Link from "next/link";
import type { Metadata } from "next";
import { getStripe } from "@/lib/stripe";
import ConnexionAuto from "@/components/ConnexionAuto";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Merci",
  robots: { index: false },
};

// Cette page n'ouvre aucun accès aux fonctions payantes : elle ne fait qu'ouvrir la session.
// Le droit d'accès est donné uniquement par le webhook Stripe (ligne « subscriptions »).
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
          <ConnexionAuto idSession={idSession as string} />
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

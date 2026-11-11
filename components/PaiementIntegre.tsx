"use client";

import { useEffect, useRef, useState } from "react";

type CheckoutIntegre = {
  mount: (element: HTMLElement) => void;
  destroy: () => void;
};

type StripeJs = (cle: string) => {
  initEmbeddedCheckout: (options: {
    fetchClientSecret: () => Promise<string>;
  }) => Promise<CheckoutIntegre>;
};

declare global {
  interface Window {
    Stripe?: StripeJs;
  }
}

const URL_STRIPE_JS = "https://js.stripe.com/v3";

// Stripe.js doit toujours venir de js.stripe.com. On ne le charge qu'au clic,
// pour ne pas ralentir l'affichage de la page.
function chargerStripeJs(): Promise<StripeJs> {
  return new Promise((resolve, reject) => {
    if (window.Stripe) {
      resolve(window.Stripe);
      return;
    }
    const existant = document.querySelector<HTMLScriptElement>(
      `script[src="${URL_STRIPE_JS}"]`,
    );
    const script = existant ?? document.createElement("script");
    script.addEventListener(
      "load",
      () =>
        window.Stripe
          ? resolve(window.Stripe)
          : reject(new Error("Stripe.js indisponible")),
      { once: true },
    );
    script.addEventListener(
      "error",
      () => reject(new Error("Stripe.js n'a pas pu se charger")),
      { once: true },
    );
    if (!existant) {
      script.src = URL_STRIPE_JS;
      script.async = true;
      document.head.appendChild(script);
    }
  });
}

type Etat = "repos" | "chargement" | "pret" | "erreur";

export default function PaiementIntegre() {
  const [etat, setEtat] = useState<Etat>("repos");
  const conteneur = useRef<HTMLDivElement>(null);
  const checkout = useRef<CheckoutIntegre | null>(null);

  useEffect(() => {
    return () => {
      checkout.current?.destroy();
    };
  }, []);

  async function ouvrir() {
    setEtat("chargement");
    try {
      const cle = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
      if (!cle) throw new Error("Clé publique manquante");

      const Stripe = await chargerStripeJs();
      checkout.current?.destroy();

      const instance = await Stripe(cle).initEmbeddedCheckout({
        fetchClientSecret: async () => {
          const reponse = await fetch("/api/checkout", { method: "POST" });
          if (!reponse.ok) throw new Error("Session refusée");
          const donnees = (await reponse.json()) as { clientSecret?: string };
          if (!donnees.clientSecret) throw new Error("Session vide");
          return donnees.clientSecret;
        },
      });

      checkout.current = instance;
      if (conteneur.current) {
        instance.mount(conteneur.current);
      }
      setEtat("pret");
    } catch (erreur) {
      console.error(erreur);
      setEtat("erreur");
    }
  }

  return (
    <div>
      {etat !== "pret" && (
        <button
          type="button"
          onClick={ouvrir}
          disabled={etat === "chargement"}
          className="bouton disabled:opacity-60"
        >
          {etat === "chargement" ? "Ouverture du paiement…" : "Payer 39 € par mois"}
        </button>
      )}

      {etat === "erreur" && (
        <p
          role="alert"
          className="mt-4 rounded-md border border-papier/40 p-4 text-base"
        >
          Le paiement n&apos;a pas pu s&apos;ouvrir. Rien n&apos;a été débité.
          Réessaie dans un instant.
        </p>
      )}

      <div
        ref={conteneur}
        className={
          etat === "pret" ? "mt-2 overflow-hidden rounded-md bg-white" : "hidden"
        }
      />
    </div>
  );
}

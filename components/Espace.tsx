"use client";

import { useEffect, useState } from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let instance: SupabaseClient | null = null;

// Créé à la demande : la clé publique n'est lue qu'au moment d'en avoir besoin.
function clientNavigateur(): SupabaseClient {
  if (!instance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const cle = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !cle) throw new Error("Variables Supabase publiques manquantes");
    instance = createClient(url, cle);
  }
  return instance;
}

type Phase = "chargement" | "connexion" | "abonne" | "sans-abonnement" | "erreur";

export default function Espace() {
  const [phase, setPhase] = useState<Phase>("chargement");
  const [email, setEmail] = useState("");
  const [envoi, setEnvoi] = useState<"repos" | "en-cours" | "envoye" | "trop-de-demandes">("repos");

  useEffect(() => {
    let actif = true;
    (async () => {
      try {
        const supabase = clientNavigateur();
        const { data } = await supabase.auth.getSession();
        if (!actif) return;
        if (!data.session) {
          setPhase("connexion");
          return;
        }
        const { data: lignes, error } = await supabase
          .from("subscriptions")
          .select("status")
          .eq("user_id", data.session.user.id)
          .in("status", ["active", "trialing"])
          .limit(1);
        if (error) throw error;
        if (!actif) return;
        setPhase(lignes && lignes.length > 0 ? "abonne" : "sans-abonnement");
      } catch (erreur) {
        console.error(erreur);
        if (actif) setPhase("erreur");
      }
    })();
    return () => {
      actif = false;
    };
  }, []);

  async function envoyerLien(evenement: React.FormEvent) {
    evenement.preventDefault();
    setEnvoi("en-cours");
    try {
      const { error } = await clientNavigateur().auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/espace`,
          shouldCreateUser: false,
        },
      });
      setEnvoi(error?.status === 429 ? "trop-de-demandes" : "envoye");
    } catch (erreur) {
      console.error(erreur);
      setEnvoi("envoye");
    }
  }

  async function seDeconnecter() {
    await clientNavigateur().auth.signOut();
    setPhase("connexion");
  }

  if (phase === "chargement") {
    return <p className="text-lg text-sourdine">Chargement…</p>;
  }

  if (phase === "erreur") {
    return (
      <div>
        <h1 className="font-display text-4xl font-bold tracking-tight">
          Ton espace n&apos;a pas pu s&apos;ouvrir.
        </h1>
        <p className="mt-4 text-lg text-sourdine">
          Recharge la page dans un instant.
        </p>
      </div>
    );
  }

  if (phase === "abonne") {
    return (
      <div>
        <p className="chiffre text-lg">Abonnement actif</p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight">
          Bienvenue dans Bilan.
        </h1>
        <p className="mt-4 text-lg text-sourdine">
          Ton accès est ouvert. La saisie des chiffres du mois arrive très
          bientôt, tu seras prévenu par e-mail.
        </p>
        <button
          type="button"
          onClick={seDeconnecter}
          className="mt-8 text-base font-semibold underline underline-offset-4"
        >
          Se déconnecter
        </button>
      </div>
    );
  }

  if (phase === "sans-abonnement") {
    return (
      <div>
        <h1 className="font-display text-4xl font-bold tracking-tight">
          Aucun abonnement actif.
        </h1>
        <p className="mt-4 text-lg text-sourdine">
          Si tu viens de payer, patiente quelques secondes puis recharge la
          page.
        </p>
        <div className="mt-8 flex max-w-xs flex-col gap-3">
          <a href="/#offre" className="bouton">
            Voir l&apos;offre
          </a>
          <button
            type="button"
            onClick={seDeconnecter}
            className="text-base font-semibold underline underline-offset-4"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-4xl font-bold tracking-tight">
        Ouvrir mon espace
      </h1>
      <p className="mt-4 text-lg text-sourdine">
        Entre l&apos;e-mail utilisé pour payer. On t&apos;envoie un lien de
        connexion, sans mot de passe.
      </p>
      <form onSubmit={envoyerLien} className="mt-8 space-y-4">
        <label htmlFor="email" className="block text-base font-semibold">
          Ton e-mail
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="min-h-14 w-full rounded-md border border-encre/30 bg-white px-4 text-lg"
        />
        <button
          type="submit"
          disabled={envoi === "en-cours"}
          className="bouton disabled:opacity-60"
        >
          {envoi === "en-cours" ? "Envoi…" : "Recevoir mon lien"}
        </button>
      </form>
      {envoi === "envoye" && (
        <p role="status" className="mt-4 text-base text-sourdine">
          Si cet e-mail a un abonnement actif, le lien est en route. Pense à
          vérifier tes courriers indésirables.
        </p>
      )}
      {envoi === "trop-de-demandes" && (
        <p role="alert" className="mt-4 text-base text-braise">
          Trop de demandes d&apos;un coup. Réessaie dans quelques minutes.
        </p>
      )}
    </div>
  );
}

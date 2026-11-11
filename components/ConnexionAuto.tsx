"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clientNavigateur } from "@/lib/supabase-navigateur";

// Ouvre la session juste après le paiement, puis emmène dans l'espace.
export default function ConnexionAuto({ idSession }: { idSession: string }) {
  const [echec, setEchec] = useState(false);

  useEffect(() => {
    let actif = true;
    (async () => {
      try {
        const reponse = await fetch("/api/connexion", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: idSession }),
        });
        if (!reponse.ok) throw new Error("Connexion refusée");
        const { token_hash } = (await reponse.json()) as { token_hash: string };
        const { error } = await clientNavigateur().auth.verifyOtp({
          token_hash,
          type: "magiclink",
        });
        if (error) throw error;
        if (actif) window.location.assign("/espace");
      } catch (erreur) {
        console.error(erreur);
        if (actif) setEchec(true);
      }
    })();
    return () => {
      actif = false;
    };
  }, [idSession]);

  if (echec) {
    return (
      <div className="mt-8 max-w-xs">
        <p className="mb-4 text-base text-sourdine">
          Ton paiement est bien reçu, mais la connexion automatique n&apos;a pas
          abouti. Tu peux ouvrir ton espace avec ton e-mail.
        </p>
        <Link href="/espace" className="bouton">
          Ouvrir mon espace
        </Link>
      </div>
    );
  }

  return (
    <p role="status" className="mt-8 text-lg text-sourdine">
      Ouverture de ton espace…
    </p>
  );
}

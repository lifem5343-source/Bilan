"use client";

import { useEffect, useState } from "react";
import { clientNavigateur } from "@/lib/supabase-navigateur";

// Nom et couleur du prestataire : c'est ce que ses clients voient sur le rapport.
export default function Marque({ userId }: { userId: string }) {
  const [marque, setMarque] = useState("");
  const [couleur, setCouleur] = useState("#14213D");
  const [existe, setExiste] = useState(false);
  const [etat, setEtat] = useState<"repos" | "en-cours" | "ok" | "erreur">("repos");

  useEffect(() => {
    clientNavigateur()
      .from("profils")
      .select("marque, couleur")
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setMarque(data.marque);
          setCouleur(data.couleur);
          setExiste(true);
        }
      });
  }, []);

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    setEtat("en-cours");
    const { error } = await clientNavigateur()
      .from("profils")
      .upsert(
        { user_id: userId, marque: marque.trim(), couleur, updated_at: new Date().toISOString() },
        { onConflict: "user_id" },
      );
    setEtat(error ? "erreur" : "ok");
    if (!error) setExiste(true);
  }

  return (
    <form onSubmit={enregistrer} className="mt-10 space-y-4 rounded-md border border-filet bg-white/60 p-4">
      <h2 className="font-display text-2xl font-bold tracking-tight">Ton nom et ta couleur</h2>
      <p className="text-base text-sourdine">
        Ce que tes clients voient en haut de leur rapport.
        {!existe && " À renseigner avant d'envoyer ton premier bilan."}
      </p>
      <div>
        <label htmlFor="marque" className="block text-base font-semibold">
          Ton nom ou celui de ta marque
        </label>
        <input
          id="marque"
          required
          maxLength={60}
          value={marque}
          onChange={(e) => setMarque(e.target.value)}
          className="mt-2 min-h-14 w-full rounded-md border border-encre/30 bg-white px-4 text-lg"
        />
      </div>
      <div>
        <label htmlFor="couleur" className="block text-base font-semibold">
          Ta couleur
        </label>
        <input
          id="couleur"
          type="color"
          value={couleur}
          onChange={(e) => setCouleur(e.target.value)}
          className="mt-2 h-14 w-full rounded-md border border-encre/30 bg-white p-1"
        />
      </div>
      <button type="submit" disabled={etat === "en-cours"} className="bouton disabled:opacity-60">
        {etat === "en-cours" ? "Enregistrement…" : "Enregistrer"}
      </button>
      {etat === "ok" && (
        <p role="status" className="text-base text-sourdine">
          C&apos;est enregistré.
        </p>
      )}
      {etat === "erreur" && (
        <p role="alert" className="text-base text-braise">
          Ça n&apos;a pas pu être enregistré. Réessaie.
        </p>
      )}
    </form>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { clientNavigateur } from "@/lib/supabase-navigateur";

type Client = { id: string; nom: string; email: string };
type Bilan = {
  client_id: string;
  mois: string;
  publications: number;
  vues: number;
  abonnes_gagnes: number;
  engagement: number;
  commentaire: string | null;
};

const MAX_CLIENTS = 10;
const champ =
  "min-h-14 w-full rounded-md border border-encre/30 bg-white px-4 text-lg";

// Les trois derniers mois, du plus récent (le mois qui vient de finir) au plus ancien.
function moisProposes(): { valeur: string; libelle: string }[] {
  const maintenant = new Date();
  return [1, 2, 3].map((recul) => {
    const d = new Date(maintenant.getFullYear(), maintenant.getMonth() - recul, 1);
    const valeur = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
    const libelle = d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    return { valeur, libelle };
  });
}

function libelleMois(valeur: string): string {
  const [a, m] = valeur.split("-").map(Number);
  return new Date(a, m - 1, 1).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
}

export default function Clients({ userId }: { userId: string }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [bilans, setBilans] = useState<Bilan[]>([]);
  const [chargement, setChargement] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [ouvert, setOuvert] = useState<string | null>(null);

  const [nom, setNom] = useState("");
  const [emailClient, setEmailClient] = useState("");

  const recharger = useCallback(async () => {
    const supabase = clientNavigateur();
    const [c, b] = await Promise.all([
      supabase.from("clients").select("id, nom, email").order("created_at"),
      supabase
        .from("bilans")
        .select("client_id, mois, publications, vues, abonnes_gagnes, engagement, commentaire")
        .order("mois", { ascending: false }),
    ]);
    if (c.error || b.error) throw c.error ?? b.error;
    setClients(c.data ?? []);
    setBilans((b.data ?? []) as Bilan[]);
  }, []);

  useEffect(() => {
    recharger()
      .catch(() => setMessage("Impossible de charger tes clients. Recharge la page."))
      .finally(() => setChargement(false));
  }, [recharger]);

  async function ajouterClient(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const { error } = await clientNavigateur()
      .from("clients")
      .insert({ user_id: userId, nom: nom.trim(), email: emailClient.trim() });
    if (error) {
      setMessage(
        error.message.includes("Limite")
          ? `Tu as atteint la limite de ${MAX_CLIENTS} clients.`
          : "Le client n'a pas pu être ajouté.",
      );
      return;
    }
    setNom("");
    setEmailClient("");
    await recharger().catch(() => undefined);
  }

  async function supprimerClient(id: string) {
    if (!window.confirm("Supprimer ce client et tous ses bilans ?")) return;
    const { error } = await clientNavigateur().from("clients").delete().eq("id", id);
    if (error) {
      setMessage("Le client n'a pas pu être supprimé.");
      return;
    }
    setOuvert(null);
    await recharger().catch(() => undefined);
  }

  if (chargement) return <p className="mt-8 text-lg text-sourdine">Chargement…</p>;

  return (
    <div className="mt-10">
      <h2 className="font-display text-2xl font-bold tracking-tight">
        Tes clients{" "}
        <span className="chiffre text-xl">
          {clients.length}/{MAX_CLIENTS}
        </span>
      </h2>

      {message && (
        <p role="alert" className="mt-4 text-base text-braise">
          {message}
        </p>
      )}

      <ul className="mt-6 divide-y divide-filet border-y border-filet">
        {clients.length === 0 && (
          <li className="py-5 text-lg text-sourdine">
            Aucun client pour l&apos;instant. Ajoute le premier ci-dessous.
          </li>
        )}
        {clients.map((c) => {
          const dernier = bilans.find((b) => b.client_id === c.id);
          return (
            <li key={c.id} className="py-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xl font-semibold">{c.nom}</p>
                  <p className="text-base text-sourdine">{c.email}</p>
                  <p className="mt-1 text-base text-sourdine">
                    {dernier
                      ? `Dernier bilan : ${libelleMois(dernier.mois)}`
                      : "Aucun bilan saisi"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOuvert(ouvert === c.id ? null : c.id)}
                  className="shrink-0 rounded-md bg-encre px-4 py-3 text-base font-semibold text-papier"
                >
                  {ouvert === c.id ? "Fermer" : "Saisir le mois"}
                </button>
              </div>
              {ouvert === c.id && (
                <SaisieMois
                  client={c}
                  userId={userId}
                  bilans={bilans.filter((b) => b.client_id === c.id)}
                  apres={async () => {
                    setOuvert(null);
                    await recharger().catch(() => undefined);
                  }}
                  onSupprimer={() => supprimerClient(c.id)}
                />
              )}
            </li>
          );
        })}
      </ul>

      {clients.length < MAX_CLIENTS && (
        <form onSubmit={ajouterClient} className="mt-8 space-y-4">
          <h3 className="text-xl font-semibold">Ajouter un client</h3>
          <div>
            <label htmlFor="nom-client" className="block text-base font-semibold">
              Nom du client
            </label>
            <input
              id="nom-client"
              required
              maxLength={80}
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className={`${champ} mt-2`}
            />
          </div>
          <div>
            <label htmlFor="email-client" className="block text-base font-semibold">
              E-mail du client
            </label>
            <input
              id="email-client"
              type="email"
              required
              maxLength={200}
              inputMode="email"
              value={emailClient}
              onChange={(e) => setEmailClient(e.target.value)}
              className={`${champ} mt-2`}
            />
          </div>
          <button type="submit" className="bouton">
            Ajouter ce client
          </button>
        </form>
      )}
    </div>
  );
}

function SaisieMois({
  client,
  userId,
  bilans,
  apres,
  onSupprimer,
}: {
  client: Client;
  userId: string;
  bilans: Bilan[];
  apres: () => Promise<void>;
  onSupprimer: () => void;
}) {
  const mois = moisProposes();
  const [moisChoisi, setMoisChoisi] = useState(mois[0].valeur);
  const existant = bilans.find((b) => b.mois === moisChoisi);

  const [publications, setPublications] = useState("");
  const [vues, setVues] = useState("");
  const [abonnes, setAbonnes] = useState("");
  const [engagement, setEngagement] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  // Pré-remplit avec le bilan déjà saisi pour ce mois, s'il existe.
  useEffect(() => {
    setPublications(existant ? String(existant.publications) : "");
    setVues(existant ? String(existant.vues) : "");
    setAbonnes(existant ? String(existant.abonnes_gagnes) : "");
    setEngagement(existant ? String(existant.engagement) : "");
    setCommentaire(existant?.commentaire ?? "");
  }, [existant]);

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setEnvoi(true);
    const { error } = await clientNavigateur()
      .from("bilans")
      .upsert(
        {
          user_id: userId,
          client_id: client.id,
          mois: moisChoisi,
          publications: Number(publications),
          vues: Number(vues),
          abonnes_gagnes: Number(abonnes),
          engagement: Number(engagement.replace(",", ".")),
          commentaire: commentaire.trim() || null,
        },
        { onConflict: "client_id,mois" },
      );
    setEnvoi(false);
    if (error) {
      setErreur("Les chiffres n'ont pas pu être enregistrés. Vérifie-les et réessaie.");
      return;
    }
    await apres();
  }

  return (
    <form
      onSubmit={enregistrer}
      className="mt-5 space-y-4 rounded-md border border-filet bg-white/60 p-4"
    >
      <div>
        <label htmlFor={`mois-${client.id}`} className="block text-base font-semibold">
          Mois
        </label>
        <select
          id={`mois-${client.id}`}
          value={moisChoisi}
          onChange={(e) => setMoisChoisi(e.target.value)}
          className={`${champ} mt-2`}
        >
          {mois.map((m) => (
            <option key={m.valeur} value={m.valeur}>
              {m.libelle}
            </option>
          ))}
        </select>
        {existant && (
          <p className="mt-2 text-sm text-sourdine">
            Un bilan existe déjà pour ce mois : l&apos;enregistrer le remplace.
          </p>
        )}
      </div>

      <Nombre id={`pub-${client.id}`} label="Publications" valeur={publications} change={setPublications} min={0} />
      <Nombre id={`vues-${client.id}`} label="Vues" valeur={vues} change={setVues} min={0} />
      <Nombre
        id={`abo-${client.id}`}
        label="Abonnés gagnés (négatif si perdus)"
        valeur={abonnes}
        change={setAbonnes}
      />
      <div>
        <label htmlFor={`eng-${client.id}`} className="block text-base font-semibold">
          Taux d&apos;engagement (%)
        </label>
        <input
          id={`eng-${client.id}`}
          required
          inputMode="decimal"
          pattern="[0-9]{1,3}([.,][0-9]{1,2})?"
          value={engagement}
          onChange={(e) => setEngagement(e.target.value)}
          className={`${champ} mt-2`}
        />
      </div>
      <div>
        <label htmlFor={`com-${client.id}`} className="block text-base font-semibold">
          Un mot pour ton client (facultatif)
        </label>
        <textarea
          id={`com-${client.id}`}
          rows={3}
          maxLength={1000}
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
          className="mt-2 w-full rounded-md border border-encre/30 bg-white p-4 text-lg"
        />
      </div>

      {erreur && (
        <p role="alert" className="text-base text-braise">
          {erreur}
        </p>
      )}
      <button type="submit" disabled={envoi} className="bouton disabled:opacity-60">
        {envoi ? "Enregistrement…" : "Enregistrer les chiffres"}
      </button>
      <button
        type="button"
        onClick={onSupprimer}
        className="block text-sm font-semibold text-sourdine underline underline-offset-4"
      >
        Supprimer ce client
      </button>
    </form>
  );
}

function Nombre({
  id,
  label,
  valeur,
  change,
  min,
}: {
  id: string;
  label: string;
  valeur: string;
  change: (v: string) => void;
  min?: number;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-base font-semibold">
        {label}
      </label>
      <input
        id={id}
        type="number"
        required
        inputMode="numeric"
        step={1}
        min={min}
        value={valeur}
        onChange={(e) => change(e.target.value)}
        className={`${champ} mt-2`}
      />
    </div>
  );
}

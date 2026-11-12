import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ton bilan du mois",
  robots: { index: false, follow: false },
};

const RE_TOKEN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Robots de messagerie et d'aperçu : ils ouvrent les liens sans que le client les lise.
const RE_ROBOT =
  /bot|crawl|spider|preview|prefetch|facebookexternalhit|slurp|googleimageproxy|monitor|headless/i;

// Texte clair ou foncé selon la couleur du prestataire, pour rester lisible.
function couleurTexte(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#14213D" : "#FFFFFF";
}

function nombre(n: number, signe = false): string {
  const texte = Math.abs(n).toLocaleString("fr-FR");
  if (!signe) return n < 0 ? `-${texte}` : texte;
  return n > 0 ? `+${texte}` : n < 0 ? `-${texte}` : texte;
}

export default async function PageBilan({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ apercu?: string }>;
}) {
  const { token } = await params;
  const { apercu } = await searchParams;
  if (!RE_TOKEN.test(token)) notFound();

  const supabase = getSupabaseAdmin();
  const { data: bilan } = await supabase
    .from("bilans")
    .select(
      "id, user_id, mois, publications, vues, abonnes_gagnes, engagement, commentaire, lu_at, clients(nom)",
    )
    .eq("token", token)
    .maybeSingle();
  if (!bilan) notFound();

  const { data: profil } = await supabase
    .from("profils")
    .select("marque, couleur")
    .eq("user_id", bilan.user_id)
    .maybeSingle();

  // Accusé de lecture : enregistré à la première ouverture par un lecteur humain.
  const agent = (await headers()).get("user-agent") ?? "";
  if (!bilan.lu_at && !apercu && agent && !RE_ROBOT.test(agent)) {
    await supabase
      .from("bilans")
      .update({ lu_at: new Date().toISOString() })
      .eq("id", bilan.id)
      .is("lu_at", null);
  }

  const marque = profil?.marque ?? "Ton prestataire";
  const couleur = profil?.couleur ?? "#14213D";
  const texte = couleurTexte(couleur);
  const client = (bilan.clients as unknown as { nom: string } | null)?.nom ?? "";
  const [annee, mois] = String(bilan.mois).split("-").map(Number);
  const libelleMois = new Date(annee, mois - 1, 1).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  const chiffres = [
    { libelle: "Publications", valeur: nombre(bilan.publications) },
    { libelle: "Vues", valeur: nombre(bilan.vues) },
    { libelle: "Abonnés gagnés", valeur: nombre(bilan.abonnes_gagnes, true) },
    {
      libelle: "Engagement",
      valeur: `${Number(bilan.engagement).toLocaleString("fr-FR")} %`,
    },
  ];

  return (
    <main className="min-h-screen bg-papier">
      <header style={{ backgroundColor: couleur, color: texte }}>
        <div className="mx-auto max-w-2xl px-5 py-10">
          <p className="font-mono text-sm uppercase tracking-wide opacity-80">
            Bilan de {libelleMois}
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight tracking-tight">
            {marque}
          </h1>
          {client && <p className="mt-2 text-lg opacity-90">Pour {client}</p>}
        </div>
      </header>

      <section className="mx-auto max-w-2xl px-5 py-10">
        <h2 className="font-display text-2xl font-bold tracking-tight">
          Ce que ton mois a donné
        </h2>
        <dl className="mt-6 grid grid-cols-2 gap-4">
          {chiffres.map((c) => (
            <div key={c.libelle} className="rounded-md border border-filet bg-white p-5">
              <dt className="text-base text-sourdine">{c.libelle}</dt>
              <dd
                className="mt-2 font-mono text-3xl font-semibold tracking-tight"
                style={{ color: couleur }}
              >
                {c.valeur}
              </dd>
            </div>
          ))}
        </dl>

        {bilan.commentaire && (
          <div className="mt-8 rounded-md border-l-4 bg-white p-5" style={{ borderColor: couleur }}>
            <p className="whitespace-pre-line text-lg leading-relaxed">
              {bilan.commentaire}
            </p>
            <p className="mt-3 text-base font-semibold">{marque}</p>
          </div>
        )}

        <p className="mt-12 text-sm text-sourdine">
          Bilan mensuel préparé par {marque}.
        </p>
      </section>
    </main>
  );
}

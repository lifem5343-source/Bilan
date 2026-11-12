import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { envoyerBilan, libelleDuMois } from "@/lib/courriel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_PAR_PASSAGE = 40;
const PAUSE_MS = 600; // Resend accepte 2 envois par seconde.

function autorise(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  const recu = request.headers.get("authorization") ?? "";
  if (!secret) return false;
  const attendu = Buffer.from(`Bearer ${secret}`);
  const fourni = Buffer.from(recu);
  return fourni.length === attendu.length && timingSafeEqual(fourni, attendu);
}

// Appelé chaque jour par Vercel Cron. Envoie les bilans des mois terminés qui ne sont
// pas encore partis : le 1er du mois pour ceux saisis à l'avance, le lendemain pour les autres.
export async function GET(request: Request) {
  if (!autorise(request)) {
    console.warn(
      "cron envoi : refusé",
      process.env.CRON_SECRET ? "(secret reçu incorrect ou absent)" : "(CRON_SECRET non défini sur le serveur)",
    );
    return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const origine = new URL(request.url).origin;
  const maintenant = new Date();
  const debutMoisCourant = `${maintenant.getUTCFullYear()}-${String(
    maintenant.getUTCMonth() + 1,
  ).padStart(2, "0")}-01`;

  const { data: bilans, error } = await supabase
    .from("bilans")
    .select("id, user_id, token, mois, clients(nom, email)")
    .is("envoye_at", null)
    .lt("mois", debutMoisCourant)
    .order("mois")
    .limit(MAX_PAR_PASSAGE);
  if (error) {
    console.error("Lecture des bilans à envoyer impossible", error);
    return NextResponse.json({ erreur: "Lecture impossible" }, { status: 500 });
  }

  console.log(`cron envoi : ${bilans?.length ?? 0} bilan(s) à traiter`);

  let envoyes = 0;
  let ignores = 0;
  let echecs = 0;

  for (const bilan of bilans ?? []) {
    const client = bilan.clients as unknown as { nom: string; email: string } | null;
    if (!client) {
      console.warn("cron envoi : ignoré, client introuvable", bilan.id);
      ignores++;
      continue;
    }

    // Seuls les abonnements actifs envoient, et la marque doit être renseignée.
    const { data: abo } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", bilan.user_id)
      .in("status", ["active", "trialing"])
      .limit(1);
    const { data: profil } = await supabase
      .from("profils")
      .select("marque, couleur")
      .eq("user_id", bilan.user_id)
      .maybeSingle();
    if (!abo?.length || !profil) {
      console.warn(
        "cron envoi : ignoré",
        bilan.id,
        abo?.length ? "" : "(pas d'abonnement actif)",
        profil ? "" : "(nom et couleur non renseignés)",
      );
      ignores++;
      continue;
    }

    // On réserve le bilan avant d'envoyer : deux passages ne peuvent pas l'envoyer deux fois.
    const { data: reserve } = await supabase
      .from("bilans")
      .update({ envoye_at: new Date().toISOString() })
      .eq("id", bilan.id)
      .is("envoye_at", null)
      .select("id");
    if (!reserve?.length) continue;

    try {
      const { data: auteur } = await supabase.auth.admin.getUserById(bilan.user_id);
      await envoyerBilan({
        vers: client.email,
        marque: profil.marque,
        couleur: profil.couleur,
        client: client.nom,
        libelleMois: libelleDuMois(String(bilan.mois)),
        lien: `${origine}/bilan/${bilan.token}`,
        repondreA: auteur?.user?.email ?? undefined,
      });
      envoyes++;
    } catch (erreurEnvoi) {
      console.error("Envoi du bilan impossible", bilan.id, erreurEnvoi);
      // Le bilan sera retenté au prochain passage.
      await supabase.from("bilans").update({ envoye_at: null }).eq("id", bilan.id);
      echecs++;
    }
    await new Promise((r) => setTimeout(r, PAUSE_MS));
  }

  console.log(`cron envoi : ${envoyes} envoyé(s), ${ignores} ignoré(s), ${echecs} échec(s)`);
  return NextResponse.json({ envoyes, ignores, echecs });
}

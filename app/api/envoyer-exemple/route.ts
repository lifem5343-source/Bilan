import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { envoyerBilan, libelleDuMois } from "@/lib/courriel";
import { adresseSite } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Envoie un exemple du bilan à l'adresse du prestataire lui-même (jamais à quelqu'un d'autre),
// pour qu'il voie ce que reçoivent ses clients.
export async function POST(request: Request) {
  try {
    const jeton = (request.headers.get("authorization") ?? "").replace(/^Bearer /, "");
    if (!jeton) return NextResponse.json({ erreur: "Non connecté" }, { status: 401 });

    const supabase = getSupabaseAdmin();
    const { data: auth } = await supabase.auth.getUser(jeton);
    const utilisateur = auth?.user;
    if (!utilisateur?.email) {
      return NextResponse.json({ erreur: "Non connecté" }, { status: 401 });
    }

    const corps = (await request.json().catch(() => null)) as { bilan_id?: unknown } | null;
    if (typeof corps?.bilan_id !== "string") {
      return NextResponse.json({ erreur: "Bilan manquant" }, { status: 400 });
    }

    const { data: abo } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", utilisateur.id)
      .in("status", ["active", "trialing"])
      .limit(1);
    if (!abo?.length) return NextResponse.json({ erreur: "Abonnement requis" }, { status: 403 });

    const { data: bilan } = await supabase
      .from("bilans")
      .select("token, mois, clients(nom)")
      .eq("id", corps.bilan_id)
      .eq("user_id", utilisateur.id)
      .maybeSingle();
    const { data: profil } = await supabase
      .from("profils")
      .select("marque, couleur")
      .eq("user_id", utilisateur.id)
      .maybeSingle();
    if (!bilan) return NextResponse.json({ erreur: "Bilan introuvable" }, { status: 404 });
    if (!profil) {
      return NextResponse.json(
        { erreur: "Renseigne d'abord ton nom et ta couleur." },
        { status: 400 },
      );
    }

    const client = bilan.clients as unknown as { nom: string } | null;
    await envoyerBilan({
      vers: utilisateur.email,
      marque: profil.marque,
      couleur: profil.couleur,
      client: client?.nom ?? "",
      libelleMois: libelleDuMois(String(bilan.mois)),
      lien: `${adresseSite(new URL(request.url).origin)}/bilan/${bilan.token}?apercu=1`,
    });
    return NextResponse.json({ ok: true });
  } catch (erreur) {
    console.error("Envoi de l'exemple impossible", erreur);
    return NextResponse.json({ erreur: "Envoi impossible" }, { status: 500 });
  }
}

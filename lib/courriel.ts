// Envoi d'e-mails via Resend (API HTTP, sans bibliothèque en plus).
// L'adresse d'expédition appartient au domaine vérifié chez Resend.
const EXPEDITEUR = "bilan@monbilandecreateur.fr";

function echapper(texte: string): string {
  return texte
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type BilanACourriel = {
  vers: string;
  marque: string;
  client: string;
  libelleMois: string;
  lien: string;
  repondreA?: string;
  couleur: string;
};

export async function envoyerBilan(b: BilanACourriel): Promise<void> {
  const cle = process.env.RESEND_API_KEY;
  if (!cle) throw new Error("RESEND_API_KEY est manquante");

  const marque = echapper(b.marque);
  const client = echapper(b.client);
  const mois = echapper(b.libelleMois);
  const couleur = /^#[0-9A-Fa-f]{6}$/.test(b.couleur) ? b.couleur : "#14213D";

  const html = `<!doctype html>
<html lang="fr"><body style="margin:0;background:#F6F3EC;font-family:Arial,Helvetica,sans-serif;color:#14213D">
<div style="max-width:520px;margin:0 auto;padding:24px 16px">
  <div style="background:${couleur};color:#ffffff;padding:24px;border-radius:6px 6px 0 0">
    <div style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;opacity:.85">Bilan de ${mois}</div>
    <div style="font-size:26px;font-weight:bold;margin-top:8px">${marque}</div>
  </div>
  <div style="background:#ffffff;padding:24px;border-radius:0 0 6px 6px">
    <p style="font-size:17px;line-height:1.5;margin:0 0 16px">Bonjour ${client},</p>
    <p style="font-size:17px;line-height:1.5;margin:0 0 24px">Ton bilan de ${mois} est prêt. Tu y trouves les chiffres du mois.</p>
    <p style="margin:0 0 24px"><a href="${echapper(b.lien)}" style="display:inline-block;background:${couleur};color:#ffffff;text-decoration:none;font-weight:bold;font-size:17px;padding:14px 22px;border-radius:6px">Voir mon bilan</a></p>
    <p style="font-size:14px;color:#5B6475;margin:0">Si le bouton ne marche pas, copie ce lien : ${echapper(b.lien)}</p>
  </div>
</div></body></html>`;

  const texte = `Bonjour ${b.client},\n\nTon bilan de ${b.libelleMois} est prêt : ${b.lien}\n\n${b.marque}`;

  const reponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cle}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${b.marque.replace(/[<>"]/g, "")} <${EXPEDITEUR}>`,
      to: [b.vers],
      subject: `Ton bilan de ${b.libelleMois} — ${b.marque.replace(/[\r\n]/g, " ")}`,
      html,
      text: texte,
      ...(b.repondreA ? { reply_to: b.repondreA } : {}),
    }),
  });

  if (!reponse.ok) {
    const detail = (await reponse.text()).slice(0, 300);
    throw new Error(`Resend ${reponse.status} : ${detail}`);
  }
}

export function libelleDuMois(mois: string): string {
  const [a, m] = mois.split("-").map(Number);
  return new Date(a, m - 1, 1).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
}

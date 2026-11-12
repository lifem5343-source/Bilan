// Adresse publique stable du site, utilisée dans les liens envoyés par e-mail.
// Jamais l'adresse d'un déploiement précis : elle peut être protégée ou périmée.
export function adresseSite(origineRequete: string): string {
  const configuree = process.env.NEXT_PUBLIC_SITE_URL;
  if (configuree) return configuree.replace(/\/+$/, "");
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (production) return `https://${production}`;
  return origineRequete;
}

// Identité du vendeur, lue dans les variables Vercel (NEXT_PUBLIC_ENTREPRISE_*).
// Tant qu'un champ n'est pas rempli, la page affiche un texte à compléter bien visible.
export const ENTREPRISE = {
  nom: process.env.NEXT_PUBLIC_ENTREPRISE_NOM ?? "[NOM OU RAISON SOCIALE À RENSEIGNER]",
  forme: process.env.NEXT_PUBLIC_ENTREPRISE_FORME ?? "[FORME JURIDIQUE À RENSEIGNER]",
  siret: process.env.NEXT_PUBLIC_ENTREPRISE_SIRET ?? "[SIRET À RENSEIGNER]",
  adresse: process.env.NEXT_PUBLIC_ENTREPRISE_ADRESSE ?? "[ADRESSE À RENSEIGNER]",
  tva:
    process.env.NEXT_PUBLIC_ENTREPRISE_TVA ??
    "[MENTION DE TVA À RENSEIGNER : par exemple « TVA non applicable, art. 293 B du CGI » si tu es en franchise en base]",
};

export const MISE_A_JOUR_LEGALE = "12 novembre 2026";

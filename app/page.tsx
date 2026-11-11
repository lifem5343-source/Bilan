import PaiementIntegre from "@/components/PaiementIntegre";
import {
  DELAI_REMBOURSEMENT_JOURS_OUVRES,
  EMAIL_CONTACT,
  GARANTIE_JOURS,
} from "@/lib/offre";

const douleurs = [
  {
    chiffre: "45 min",
    texte: "Un bilan fait à la main, c'est facilement 45 minutes par client.",
  },
  {
    chiffre: "7 h 30",
    texte: "Pour 10 clients, ça fait 7 h 30 chaque mois, sans être payé.",
  },
  {
    chiffre: "1 oubli",
    texte:
      "Un bilan en retard, et ton client se demande pourquoi il continue de payer.",
  },
];

const benefices = [
  {
    titre: "Une minute de saisie",
    texte:
      "Tu entres les chiffres du mois. Le reste se fait tout seul : pas de modèle à ouvrir, pas de mise en page à refaire.",
  },
  {
    titre: "Un rapport à tes couleurs",
    texte:
      "Ton logo, ta couleur, ton nom. Ton client reçoit un document propre, qui a l'air de venir de toi.",
  },
  {
    titre: "Envoyé le 1er, lu confirmé",
    texte:
      "Le bilan part le premier de chaque mois. Tu vois quand ton client l'a ouvert.",
  },
];

export default function Accueil() {
  return (
    <main className="pb-28 md:pb-0">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-5">
        <span className="font-display text-2xl font-bold tracking-tight">
          Bilan
        </span>
        <a
          href="#offre"
          className="hidden text-sm font-semibold underline underline-offset-4 md:inline"
        >
          Voir le tarif
        </a>
      </header>

      <section className="mx-auto max-w-3xl px-5 pb-14 pt-6 md:pt-16">
        <p className="font-mono text-sm font-medium uppercase tracking-wide text-sourdine">
          Pour les créateurs de contenu facturés au mois
        </p>
        <h1 className="mt-4 font-display text-[2.6rem] font-bold leading-[1.05] tracking-tight md:text-6xl">
          Le bilan de tes clients part tout seul, le 1er du mois.
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-sourdine md:text-xl">
          Tu saisis les chiffres en une minute. Bilan met en page le rapport à
          tes couleurs et l&apos;envoie. Ton client voit ce qu&apos;il a eu
          pour son argent.
        </p>
        <div className="mt-8 md:max-w-xs">
          <a href="#offre" className="bouton">
            Commencer
          </a>
        </div>
      </section>

      <section className="border-y border-filet bg-white/40">
        <div className="mx-auto max-w-3xl px-5 py-12">
          <h2 className="font-display text-3xl font-bold leading-tight tracking-tight">
            Ce que te coûte le bilan fait à la main
          </h2>
          <ul className="mt-8 divide-y divide-filet">
            {douleurs.map((d) => (
              <li
                key={d.chiffre}
                className="flex items-baseline gap-5 py-5"
              >
                <span className="chiffre w-32 shrink-0 whitespace-nowrap text-3xl">
                  {d.chiffre}
                </span>
                <span className="text-lg leading-snug">{d.texte}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-14">
        <h2 className="font-display text-3xl font-bold leading-tight tracking-tight">
          Trois choses, et rien d&apos;autre
        </h2>
        <ol className="mt-8 space-y-8">
          {benefices.map((b, i) => (
            <li key={b.titre} className="flex gap-5">
              <span className="chiffre text-3xl">{i + 1}</span>
              <div>
                <h3 className="text-xl font-semibold">{b.titre}</h3>
                <p className="mt-2 text-lg leading-relaxed text-sourdine">
                  {b.texte}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section id="offre" className="scroll-mt-4 bg-encre text-papier">
        <div className="mx-auto max-w-3xl px-5 py-14">
          <h2 className="font-display text-3xl font-bold leading-tight tracking-tight">
            Un seul tarif, tout compris
          </h2>
          <p className="mt-6 flex items-baseline gap-3">
            <span className="font-mono text-6xl font-semibold tracking-tight">
              39&#8239;€
            </span>
            <span className="text-lg text-papier/80">par mois</span>
          </p>
          <p className="mt-3 text-lg text-papier/80">
            Dix clients suivis. Soit environ 1,30&nbsp;€ par jour, ou 3,90&nbsp;€
            par client et par mois.
          </p>
          <p className="mt-6 text-lg">
            Tu récupères environ 7&nbsp;h&nbsp;30 par mois. Ça met l&apos;heure
            à <span className="font-mono font-semibold text-[#FF8A4C]">5,20&nbsp;€</span>.
          </p>

          <div className="mt-8 rounded-md border border-papier/30 p-4">
            <p className="font-semibold">
              Satisfait ou remboursé, {GARANTIE_JOURS} jours.
            </p>
            <p className="mt-2 text-base text-papier/80">
              Écris à {EMAIL_CONTACT} dans les {GARANTIE_JOURS} jours qui suivent
              ton paiement, sans avoir à te justifier. Tu es remboursé en{" "}
              {DELAI_REMBOURSEMENT_JOURS_OUVRES} jours ouvrés au plus.
            </p>
          </div>

          <p className="mt-8 text-base font-semibold">
            Sans engagement, résiliable à tout moment.
          </p>
          <div className="mt-3">
            <PaiementIntegre />
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-3xl px-5 py-8 text-sm text-sourdine">
        © {new Date().getFullYear()} Bilan
      </footer>

      <div className="fixed inset-x-0 bottom-0 border-t border-filet bg-papier/95 p-3 backdrop-blur-sm md:hidden">
        <a href="#offre" className="bouton">
          Commencer
        </a>
      </div>
    </main>
  );
}

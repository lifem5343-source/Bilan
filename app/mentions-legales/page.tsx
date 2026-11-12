import type { Metadata } from "next";
import PageLegale from "@/components/PageLegale";
import { ENTREPRISE } from "@/lib/entreprise";
import { EMAIL_CONTACT } from "@/lib/offre";

export const metadata: Metadata = { title: "Mentions légales" };

export default function MentionsLegales() {
  return (
    <PageLegale titre="Mentions légales">
      <h2>Éditeur du site</h2>
      <p>
        {ENTREPRISE.nom}, {ENTREPRISE.forme}
        <br />
        SIRET : {ENTREPRISE.siret}
        <br />
        Adresse : {ENTREPRISE.adresse}
        <br />
        Contact : {EMAIL_CONTACT}
      </p>
      <p>{ENTREPRISE.tva}</p>
      <p>Directeur de la publication : {ENTREPRISE.nom}.</p>

      <h2>Hébergement</h2>
      <p>
        Le site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina,
        CA 91723, États-Unis (vercel.com).
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        Les textes, la marque Bilan et la mise en page du site sont protégés.
        Les chiffres et les contenus saisis par les abonnés leur appartiennent.
      </p>

      <h2>Contact</h2>
      <p>Pour toute question : {EMAIL_CONTACT}.</p>
    </PageLegale>
  );
}

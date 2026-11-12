import type { Metadata } from "next";
import PageLegale from "@/components/PageLegale";
import { ENTREPRISE } from "@/lib/entreprise";
import { EMAIL_CONTACT } from "@/lib/offre";

export const metadata: Metadata = { title: "Politique de confidentialité" };

export default function Confidentialite() {
  return (
    <PageLegale titre="Politique de confidentialité">
      <h2>Qui est responsable de vos données</h2>
      <p>
        {ENTREPRISE.nom}, {ENTREPRISE.adresse}. Contact : {EMAIL_CONTACT}.
      </p>
      <p>
        Pour les abonnés, nous sommes responsables du traitement. Pour les
        clients finaux des abonnés (leur nom et leur e-mail), nous agissons
        comme sous-traitant : l&apos;abonné est responsable de leurs données et
        nous ne les utilisons que pour envoyer ses bilans.
      </p>

      <h2>Ce que nous collectons</h2>
      <ul>
        <li>Abonnés : adresse e-mail, données d&apos;abonnement (statut, dates), nom et couleur de la marque.</li>
        <li>Clients finaux : nom et adresse e-mail saisis par l&apos;abonné, chiffres mensuels, date d&apos;ouverture du rapport (accusé de lecture).</li>
        <li>Paiement : géré par Stripe ; nous ne voyons ni ne conservons le numéro de carte.</li>
      </ul>

      <h2>Pourquoi, et sur quelle base</h2>
      <ul>
        <li>Fournir le service et envoyer les bilans (exécution du contrat).</li>
        <li>Indiquer à l&apos;abonné si son client a ouvert le rapport : un seul enregistrement, la date de première ouverture, sans suivi de navigation.</li>
        <li>Gérer les paiements et respecter nos obligations comptables (obligation légale).</li>
        <li>Mesurer la fréquentation du site de façon anonyme, sans cookie (intérêt légitime).</li>
      </ul>

      <h2>Qui reçoit les données</h2>
      <ul>
        <li>Vercel (hébergement du site, États-Unis).</li>
        <li>Supabase (base de données et comptes, serveurs en Allemagne).</li>
        <li>Stripe (paiement).</li>
        <li>Resend (envoi des e-mails, serveurs en Irlande).</li>
      </ul>
      <p>
        Certains de ces prestataires sont établis hors de l&apos;Union
        européenne : les transferts reposent sur des garanties prévues par le
        RGPD (clauses contractuelles types ou décision d&apos;adéquation).
      </p>

      <h2>Combien de temps</h2>
      <p>
        Les données du compte et des clients sont conservées tant que
        l&apos;abonnement est actif, puis supprimées dans les 12 mois suivant
        sa fin, sauf obligation légale de conservation (factures : 10 ans).
      </p>

      <h2>Cookies et stockage</h2>
      <p>
        Aucun cookie publicitaire ni traceur de suivi. Une information de
        connexion est enregistrée dans votre navigateur pour garder votre
        session ouverte : elle est strictement nécessaire au service.
      </p>

      <h2>Vos droits</h2>
      <p>
        Vous pouvez demander l&apos;accès, la correction, la suppression ou la
        portabilité de vos données, ou vous opposer à un traitement, en écrivant
        à {EMAIL_CONTACT}. Si la réponse ne vous satisfait pas, vous pouvez
        saisir la CNIL (cnil.fr).
      </p>
    </PageLegale>
  );
}

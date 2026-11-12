import type { Metadata } from "next";
import PageLegale from "@/components/PageLegale";
import { ENTREPRISE } from "@/lib/entreprise";
import {
  CLIENTS_INCLUS,
  DELAI_REMBOURSEMENT_JOURS_OUVRES,
  EMAIL_CONTACT,
  GARANTIE_JOURS,
  PRIX_MENSUEL,
} from "@/lib/offre";

export const metadata: Metadata = { title: "Conditions générales de vente" };

export default function CGV() {
  return (
    <PageLegale titre="Conditions générales de vente">
      <h2>1. Vendeur</h2>
      <p>
        {ENTREPRISE.nom}, {ENTREPRISE.forme}, SIRET {ENTREPRISE.siret},{" "}
        {ENTREPRISE.adresse}. Contact : {EMAIL_CONTACT}.
      </p>

      <h2>2. Service</h2>
      <p>
        Bilan permet à un prestataire de saisir les chiffres mensuels de ses
        clients, de produire un rapport à son nom et à sa couleur, et de
        l&apos;envoyer automatiquement par e-mail. Le prestataire saisit lui-même
        ses chiffres : Bilan ne les collecte pas auprès des réseaux sociaux.
      </p>

      <h2>3. Prix</h2>
      <p>
        {PRIX_MENSUEL}&#8239;€ par mois, pour {CLIENTS_INCLUS} clients suivis
        au maximum. {ENTREPRISE.tva}
      </p>

      <h2>4. Paiement et durée</h2>
      <p>
        Le paiement est réalisé par carte, via Stripe. L&apos;abonnement est
        mensuel et se renouvelle automatiquement chaque mois jusqu&apos;à sa
        résiliation. L&apos;accès est ouvert dès la confirmation du paiement.
      </p>

      <h2>5. Résiliation</h2>
      <p>
        Sans engagement : l&apos;abonné résilie à tout moment depuis son espace
        (« Gérer ou résilier mon abonnement »). La résiliation prend effet à la
        fin de la période déjà payée ; aucun nouveau prélèvement n&apos;a lieu
        ensuite.
      </p>

      <h2>6. Garantie satisfait ou remboursé</h2>
      <p>
        Pendant {GARANTIE_JOURS} jours après le premier paiement, l&apos;abonné
        peut demander le remboursement sans avoir à se justifier, en écrivant à{" "}
        {EMAIL_CONTACT}. Le remboursement est effectué sous{" "}
        {DELAI_REMBOURSEMENT_JOURS_OUVRES} jours ouvrés au plus, sur le moyen de
        paiement utilisé.
      </p>

      <h2>7. Obligations de l&apos;abonné</h2>
      <p>
        L&apos;abonné garantit qu&apos;il a le droit d&apos;envoyer à ses clients
        les chiffres et les rapports qu&apos;il saisit, et qu&apos;il leur a
        communiqué la manière dont leurs adresses e-mail sont utilisées. Il est
        responsable de l&apos;exactitude des chiffres saisis.
      </p>

      <h2>8. Disponibilité et responsabilité</h2>
      <p>
        Le service est fourni avec soin mais sans garantie de disponibilité
        continue. Une panne peut retarder l&apos;envoi d&apos;un bilan ; il est
        alors envoyé dès le rétablissement. La responsabilité du vendeur est
        limitée au montant des sommes payées au cours des 12 derniers mois,
        dans la mesure permise par la loi.
      </p>

      <h2>9. Données personnelles</h2>
      <p>
        Le traitement des données est décrit dans la politique de
        confidentialité.
      </p>

      <h2>10. Droit applicable</h2>
      <p>
        Les présentes conditions sont soumises au droit français. En cas de
        litige, les parties cherchent d&apos;abord une solution amiable en
        écrivant à {EMAIL_CONTACT}.
      </p>
      <p>
        [MÉDIATEUR DE LA CONSOMMATION À RENSEIGNER si le service est vendu à des
        consommateurs, et non seulement à des professionnels]
      </p>
    </PageLegale>
  );
}

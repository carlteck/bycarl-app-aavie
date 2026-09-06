import { ServicePreviewScreen } from '@/components/service-preview-screen';

export default function BudgetScreen() {
  return (
    <ServicePreviewScreen
      title="Gestion de budget"
      icon="wallet-outline"
      eyebrow="VOTRE BUDGET, PLUS LISIBLE"
      headline="Voir ce qui entre, ce qui sort et ce qu’il reste."
      description="Un suivi simple pour anticiper les dépenses importantes et garder vos priorités en vue."
      items={[
        {
          icon: 'arrow-down-circle-outline',
          title: 'Noter vos revenus',
          description: 'Salaires, prestations, pensions et autres ressources.',
        },
        {
          icon: 'arrow-up-circle-outline',
          title: 'Suivre vos dépenses',
          description:
            'Charges fixes, achats courants et dépenses ponctuelles.',
        },
        {
          icon: 'pie-chart-outline',
          title: 'Comprendre votre mois',
          description:
            'Un aperçu clair de votre équilibre et de vos échéances.',
        },
      ]}
      footer="Le suivi budgétaire sera privé et synchronisé avec votre compte. Aucune donnée bancaire n’est demandée sur cet écran."
    />
  );
}

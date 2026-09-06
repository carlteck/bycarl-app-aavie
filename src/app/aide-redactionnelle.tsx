import { ServicePreviewScreen } from '@/components/service-preview-screen';

export default function AideRedactionnelleScreen() {
  return (
    <ServicePreviewScreen
      title="Aide rédactionnelle"
      icon="create-outline"
      eyebrow="VOS MOTS, BIEN FORMULÉS"
      headline="Un courrier clair, sans partir d’une page blanche."
      description="AAVIE vous aidera à préparer un courrier adapté à votre situation, avec un ton simple et les informations utiles."
      items={[
        {
          icon: 'document-text-outline',
          title: 'Choisir un modèle',
          description:
            'Réclamation, demande, relance ou recours administratif.',
        },
        {
          icon: 'chatbubble-ellipses-outline',
          title: 'Expliquer votre situation',
          description: 'Répondez à quelques questions avec vos propres mots.',
        },
        {
          icon: 'checkmark-done-outline',
          title: 'Relire avant l’envoi',
          description: 'Vérifiez, adaptez et copiez votre courrier final.',
        },
      ]}
      footer="Aucun texte saisi ici n’est envoyé pour le moment. La rédaction assistée sera activée avec le service sécurisé correspondant."
    />
  );
}

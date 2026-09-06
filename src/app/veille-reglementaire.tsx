import { ServicePreviewScreen } from '@/components/service-preview-screen';

export default function VeilleReglementaireScreen() {
  return (
    <ServicePreviewScreen
      title="Veille réglementaire"
      icon="newspaper-outline"
      eyebrow="L’ESSENTIEL, SANS JARGON"
      headline="Comprendre les changements qui peuvent vous concerner."
      description="AAVIE réunira des informations vérifiées et expliquées simplement, avec une attention particulière à la Guyane."
      items={[
        {
          icon: 'location-outline',
          title: 'Informations locales',
          description: 'Dispositifs et démarches propres à la Guyane.',
        },
        {
          icon: 'sparkles-outline',
          title: 'Explications accessibles',
          description:
            'Les conséquences concrètes avant les détails juridiques.',
        },
        {
          icon: 'bookmark-outline',
          title: 'À lire plus tard',
          description: 'Gardez sous la main les informations importantes.',
        },
      ]}
      footer="Les articles seront publiés après vérification de leurs sources et de leur date de mise à jour."
    />
  );
}

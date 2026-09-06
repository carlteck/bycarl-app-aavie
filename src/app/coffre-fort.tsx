import { ServicePreviewScreen } from '@/components/service-preview-screen';

export default function CoffreFortScreen() {
  return (
    <ServicePreviewScreen
      title="Coffre-fort"
      icon="shield-checkmark-outline"
      eyebrow="VOS DOCUMENTS, BIEN RANGÉS"
      headline="Retrouver le bon justificatif au bon moment."
      description="Votre futur espace documentaire réunira les pièces utiles à vos démarches dans des dossiers faciles à comprendre."
      items={[
        {
          icon: 'cloud-upload-outline',
          title: 'Ajouter un document',
          description:
            'Importez une pièce et donnez-lui un nom reconnaissable.',
        },
        {
          icon: 'folder-open-outline',
          title: 'Classer simplement',
          description: 'Identité, logement, famille, santé ou travail.',
        },
        {
          icon: 'search-outline',
          title: 'Retrouver rapidement',
          description: 'Recherchez une pièce sans parcourir tous vos fichiers.',
        },
      ]}
      footer="Le stockage de documents n’est pas encore activé. AAVIE ne vous demande donc aucune autorisation d’accès aux photos ou fichiers à ce stade."
    />
  );
}

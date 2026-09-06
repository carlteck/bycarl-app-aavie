import type { Ionicons } from '@expo/vector-icons';
export type AavieModule = {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  href?: string;
  comingSoon?: boolean;
};
export type AavieSection = {
  key: string;
  tabTitle: string;
  heading: string;
  intro: string;
  icon: keyof typeof Ionicons.glyphMap;
  modules: AavieModule[];
};
export const SERVICE_GROUPS: { title: string; modules: AavieModule[] }[] = [
  {
    title: 'Se faire aider',
    modules: [
      {
        id: 'assistant',
        comingSoon: true,
        title: 'Assistant administratif',
        description: 'Bientôt sur mobile : préparer une démarche, pas à pas.',
        icon: 'chatbubbles-outline',
        // `/demarche` auparavant : la carte annonçait l'assistant et ouvrait la liste des
        // démarches. Un libellé qui ne tient pas sa promesse fait douter l'usager de lui-même.
        href: '/assistant',
      },
      {
        id: 'redaction',
        title: 'Aide rédactionnelle',
        description: 'Préparer vos courriers administratifs.',
        icon: 'create-outline',
      },
    ],
  },
  {
    title: 'M’organiser',
    modules: [
      {
        id: 'planificateur',
        title: 'Planificateur',
        description: 'Retrouver vos rendez-vous et échéances.',
        icon: 'calendar-outline',
        href: '/planificateur',
      },
      {
        id: 'budget',
        title: 'Gestion de budget',
        description: 'Suivre vos revenus et vos dépenses.',
        icon: 'wallet-outline',
      },
      {
        id: 'coffre-fort',
        title: 'Coffre-fort',
        description: 'Classer vos documents administratifs.',
        icon: 'shield-checkmark-outline',
      },
    ],
  },
  {
    title: 'M’informer',
    modules: [
      {
        id: 'veille',
        title: 'Veille réglementaire',
        description: 'Comprendre les évolutions qui vous concernent.',
        icon: 'newspaper-outline',
      },
      {
        id: 'centre-ressources',
        title: 'Centre de ressources',
        description: 'Consulter des guides pratiques et des tutoriels.',
        icon: 'book-outline',
      },
      {
        id: 'annuaire',
        title: 'Annuaire administratif',
        description: 'Trouver les coordonnées du bon organisme.',
        icon: 'business-outline',
        href: '/annuaire',
      },
    ],
  },
];
export const AAVIE_SECTIONS: AavieSection[] = [
  {
    key: 'accueil',
    tabTitle: 'Accueil',
    heading: 'Mon espace',
    intro: 'Vos services et vos priorités au même endroit.',
    icon: 'home-outline',
    modules: SERVICE_GROUPS.flatMap((group) => group.modules),
  },
  {
    key: 'ressources',
    tabTitle: 'Ressources',
    heading: 'Centre de ressources',
    intro: 'Des repères pour comprendre vos démarches administratives.',
    icon: 'book-outline',
    modules: SERVICE_GROUPS[2].modules.filter(
      (module) => module.id !== 'annuaire',
    ),
  },
  {
    key: 'annuaire',
    tabTitle: 'Annuaire',
    heading: 'Annuaire administratif',
    intro: 'Les bons contacts pour vos démarches.',
    icon: 'business-outline',
    modules: [],
  },
  {
    key: 'profil',
    tabTitle: 'Compte',
    heading: 'Mon compte',
    intro: 'Vos informations personnelles et vos réglages.',
    icon: 'person-circle-outline',
    modules: [],
  },
];

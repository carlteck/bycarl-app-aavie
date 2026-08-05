import type { Ionicons } from '@expo/vector-icons';

type IconName = keyof typeof Ionicons.glyphMap;

/** Regroupement des 8 modules du cahier des charges AAVIE en 4 sections de navigation. */
export type AavieModule = {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  /** Route vers laquelle la carte navigue quand le module est implémenté (sinon "Bientôt disponible"). */
  href?: string;
};

export type AavieSection = {
  key: string;
  tabTitle: string;
  heading: string;
  intro: string;
  icon: IconName;
  modules: AavieModule[];
};

export const AAVIE_SECTIONS: AavieSection[] = [
  {
    key: 'accueil',
    tabTitle: 'Accueil',
    heading: 'Bienvenue sur AAVIE',
    intro:
      "Votre allié pour comprendre et réaliser vos démarches administratives en toute autonomie, à votre rythme.",
    icon: 'home-outline',
    modules: [
      {
        id: 'assistant',
        title: 'Assistant administratif',
        description:
          "Accompagnement personnalisé pour réaliser une démarche étape par étape, avec pré-remplissage automatique.",
        icon: 'chatbubbles-outline',
        href: '/demarche',
      },
      {
        id: 'planificateur',
        title: 'Planificateur administratif',
        description: 'Calendrier des rendez-vous et échéances, avec rappels automatiques.',
        icon: 'calendar-outline',
        href: '/planificateur',
      },
      {
        id: 'rappels',
        title: 'Notifications et rappels',
        description: 'Alertes pour les échéances importantes : déclarations, renouvellements.',
        icon: 'notifications-outline',
        href: '/notifications',
      },
    ],
  },
  {
    key: 'ressources',
    tabTitle: 'Ressources',
    heading: 'Centre de ressources',
    intro:
      "Guides, tutoriels et veille pour comprendre les démarches administratives et rédiger sereinement vos documents.",
    icon: 'book-outline',
    modules: [
      {
        id: 'centre-ressources',
        title: 'Centre de ressources',
        description: 'Guides pédagogiques, vidéos explicatives et fiches simplifiées.',
        icon: 'book-outline',
      },
      {
        id: 'veille',
        title: 'Veille technique et informationnelle',
        description: 'Suivi des évolutions législatives locales, ultramarines et nationales.',
        icon: 'newspaper-outline',
      },
      {
        id: 'redaction',
        title: 'Aide rédactionnelle',
        description: 'Modèles de lettres et documents, avec assistance à la rédaction.',
        icon: 'create-outline',
      },
    ],
  },
  {
    key: 'annuaire',
    tabTitle: 'Annuaire',
    heading: 'Annuaire administratif',
    intro: 'Retrouvez rapidement les coordonnées des services administratifs près de chez vous.',
    icon: 'business-outline',
    modules: [
      {
        id: 'annuaire-local',
        title: 'Services locaux',
        description: 'Préfecture, mairie, CAF, CPAM et autres organismes de proximité.',
        icon: 'location-outline',
      },
      {
        id: 'annuaire-national',
        title: 'Services nationaux',
        description: 'Impôts, Pôle emploi, Sécurité sociale et administrations centrales.',
        icon: 'flag-outline',
      },
      {
        id: 'annuaire-contact',
        title: 'Contact direct',
        description: 'Coordonnées et accès rapide pour joindre chaque organisme.',
        icon: 'call-outline',
      },
    ],
  },
  {
    key: 'profil',
    tabTitle: 'Profil',
    heading: 'Mon espace',
    intro:
      "Vos documents, votre budget et les réglages d'accessibilité, personnalisables selon vos besoins.",
    icon: 'person-circle-outline',
    modules: [
      {
        id: 'sauvegarde',
        title: 'Outil de sauvegarde',
        description: 'Espace sécurisé pour numériser et organiser vos documents administratifs.',
        icon: 'folder-outline',
      },
      {
        id: 'budget',
        title: 'Gestion de budget',
        description: 'Suivi des revenus et dépenses, aide à la préparation des déclarations fiscales.',
        icon: 'bar-chart-outline',
      },
      {
        id: 'accessibilite',
        title: 'Accessibilité',
        description: 'Contraste, taille de texte, lecteur d’écran et navigation adaptée.',
        icon: 'accessibility-outline',
      },
    ],
  },
];

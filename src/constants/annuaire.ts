import type { Ionicons } from '@expo/vector-icons';

export type AnnuaireCategory = 'Local (Guyane)' | 'National' | 'Emploi' | 'Santé' | 'Logement';

export type AnnuaireEntry = {
  id: string;
  name: string;
  category: AnnuaireCategory;
  description: string;
  phone?: string;
  website?: string;
  address?: string;
};

export const ANNUAIRE_CATEGORIES: AnnuaireCategory[] = [
  'Local (Guyane)',
  'National',
  'Santé',
  'Emploi',
  'Logement',
];

export const ANNUAIRE_CATEGORY_ICON: Record<AnnuaireCategory, keyof typeof Ionicons.glyphMap> = {
  'Local (Guyane)': 'location-outline',
  National: 'flag-outline',
  Santé: 'medkit-outline',
  Emploi: 'briefcase-outline',
  Logement: 'home-outline',
};

/**
 * Jeu de données de démonstration (services les plus demandés en Guyane et au national).
 * À terme : alimenter depuis une source officielle (ex. api-lannuaire.service-public.fr).
 */
export const ANNUAIRE_ENTRIES: AnnuaireEntry[] = [
  {
    id: 'prefecture-guyane',
    name: 'Préfecture de la Guyane',
    category: 'Local (Guyane)',
    description: 'Titres de séjour, cartes grises, démarches préfectorales.',
    phone: '0594394600',
    website: 'https://www.guyane.gouv.fr',
    address: 'Rue Fiedmond, 97300 Cayenne',
  },
  {
    id: 'caf-guyane',
    name: 'CAF de la Guyane',
    category: 'Local (Guyane)',
    description: 'Allocations familiales, RSA, aides au logement.',
    phone: '0810251097',
    website: 'https://www.caf.fr',
  },
  {
    id: 'cpam-guyane',
    name: 'CPAM de la Guyane',
    category: 'Santé',
    description: 'Carte Vitale, remboursements, couverture maladie.',
    phone: '3646',
    website: 'https://www.ameli.fr',
  },
  {
    id: 'france-travail-guyane',
    name: 'France Travail Guyane',
    category: 'Emploi',
    description: 'Inscription, allocation chômage, offres d’emploi.',
    phone: '3949',
    website: 'https://www.francetravail.fr',
  },
  {
    id: 'mairie-cayenne',
    name: 'Mairie de Cayenne',
    category: 'Local (Guyane)',
    description: 'État civil, actes de naissance, cartes d’identité.',
    phone: '0594399090',
    website: 'https://www.ville-cayenne.fr',
  },
  {
    id: 'impots-gouv',
    name: 'Impôts (DGFiP)',
    category: 'National',
    description: 'Déclaration de revenus, avis d’imposition, paiement en ligne.',
    phone: '0809401401',
    website: 'https://www.impots.gouv.fr',
  },
  {
    id: 'service-public',
    name: 'Service-Public.fr',
    category: 'National',
    description: 'Portail officiel de toutes les démarches administratives françaises.',
    website: 'https://www.service-public.fr',
  },
  {
    id: 'mdph-guyane',
    name: 'MDPH de la Guyane',
    category: 'Santé',
    description: 'Reconnaissance du handicap, prestations et aides associées.',
    phone: '0594293535',
  },
  {
    id: 'caisse-logement',
    name: 'Action Logement Guyane',
    category: 'Logement',
    description: 'Aides au logement pour les salariés, garanties locatives.',
    website: 'https://www.actionlogement.fr',
  },
];

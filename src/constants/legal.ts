export type LegalDocumentType =
  | 'privacy_policy'
  | 'terms'
  | 'terms_of_sale'
  | 'legal_notice';

export const LEGAL_LINKS = {
  privacy: {
    label: 'Politique de confidentialité',
    type: 'privacy_policy',
    route: '/legal/privacy_policy',
  },
  terms: {
    label: 'Conditions d’utilisation',
    type: 'terms',
    route: '/legal/terms',
  },
  sales: {
    label: 'Conditions de vente',
    type: 'terms_of_sale',
    route: '/legal/terms_of_sale',
  },
  notice: {
    label: 'Mentions légales',
    type: 'legal_notice',
    route: '/legal/legal_notice',
  },
} as const;

/**
 * Les deux textes auxquels l'inscription demande un consentement explicite — même périmètre que
 * le site (`register.php` n'exige que la politique active et les CGU ; les CGV n'engagent qu'un
 * achat, pas encore possible depuis l'application).
 */
export const REGISTRATION_CONSENT_LINKS = [
  LEGAL_LINKS.privacy,
  LEGAL_LINKS.terms,
] as const;

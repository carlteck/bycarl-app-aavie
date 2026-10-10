/**
 * Textes légaux publiés par le site (`site_aavie`), accessibles sans compte
 * (`/confidentialite`, `/conditions-utilisation`, `/conditions-vente`, `/mentions-legales`).
 * L'application mobile ne les héberge pas elle-même : elle ouvre le navigateur sur ces pages,
 * comme elle le fait déjà pour un site web d'organisme dans l'annuaire.
 */
const SITE_URL = 'https://aavieapp.com';

export const LEGAL_LINKS = {
  privacy: {
    label: 'Politique de confidentialité',
    url: `${SITE_URL}/confidentialite`,
  },
  terms: {
    label: 'Conditions d’utilisation',
    url: `${SITE_URL}/conditions-utilisation`,
  },
  sales: { label: 'Conditions de vente', url: `${SITE_URL}/conditions-vente` },
  notice: { label: 'Mentions légales', url: `${SITE_URL}/mentions-legales` },
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

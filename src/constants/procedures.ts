import type { Ionicons } from '@expo/vector-icons';

import type { UserProfile } from '@/context/user-profile-context';

type IconName = keyof typeof Ionicons.glyphMap;

export type ProcedureCategory =
  | 'Identité'
  | 'Famille'
  | 'Logement'
  | 'Emploi'
  | 'Social'
  | 'Véhicule'
  | 'Fiscalité'
  | 'Étranger';

export const PROCEDURE_CATEGORIES: ProcedureCategory[] = [
  'Identité',
  'Famille',
  'Logement',
  'Emploi',
  'Social',
  'Véhicule',
  'Fiscalité',
  'Étranger',
];

export const PROCEDURE_CATEGORY_ICON: Record<ProcedureCategory, IconName> = {
  Identité: 'id-card-outline',
  Famille: 'people-outline',
  Logement: 'home-outline',
  Emploi: 'briefcase-outline',
  Social: 'heart-outline',
  Véhicule: 'car-outline',
  Fiscalité: 'cash-outline',
  Étranger: 'earth-outline',
};

export type ProcedureFieldType = 'text' | 'date' | 'tel' | 'email' | 'select';

export type ProcedureField = {
  key: string;
  label: string;
  type: ProcedureFieldType;
  placeholder?: string;
  options?: string[];
  /** Si renseigné, ce champ est pré-rempli depuis le profil utilisateur enregistré. */
  prefillFromProfile?: keyof UserProfile;
  required?: boolean;
};

export type ProcedureDocument = {
  id: string;
  label: string;
};

export type Procedure = {
  id: string;
  title: string;
  category: ProcedureCategory;
  /** Numéro du formulaire CERFA de référence, quand la démarche en utilise un. */
  cerfaNumber?: string;
  summary: string;
  durationEstimate: string;
  online: boolean;
  icon: IconName;
  documents: ProcedureDocument[];
  fields: ProcedureField[];
};

/**
 * Catalogue de démonstration des démarches administratives les plus courantes, organisées par
 * catégorie. Les champs `prefillFromProfile` permettent au moteur de formulaire (`DynamicForm`)
 * de pré-remplir automatiquement les informations déjà connues du profil utilisateur local.
 * À terme : brancher les téléservices officiels (ANTS, service-public.fr, caf.fr...) au lieu
 * d'un simple récapitulatif à l'écran.
 */
export const PROCEDURES: Procedure[] = [
  {
    id: 'cni',
    title: "Carte nationale d'identité",
    category: 'Identité',
    cerfaNumber: 'Cerfa n°12100*02',
    summary: 'Première demande ou renouvellement de votre carte nationale d’identité.',
    durationEstimate: '~15 min',
    online: true,
    icon: 'id-card-outline',
    documents: [
      { id: 'photo', label: "Photo d'identité récente" },
      { id: 'justificatif-domicile', label: 'Justificatif de domicile de moins d’un an' },
      { id: 'ancienne-piece', label: "Ancienne carte d'identité ou passeport (si renouvellement)" },
      { id: 'acte-naissance', label: 'Acte de naissance (si première demande)' },
    ],
    fields: [
      { key: 'civilite', label: 'Civilité', type: 'select', options: ['Mme', 'M.'], prefillFromProfile: 'civilite' },
      { key: 'nom', label: 'Nom de naissance', type: 'text', prefillFromProfile: 'nom', required: true },
      { key: 'prenom', label: 'Prénom(s)', type: 'text', prefillFromProfile: 'prenom', required: true },
      { key: 'dateNaissance', label: 'Date de naissance', type: 'date', prefillFromProfile: 'dateNaissance', required: true },
      { key: 'lieuNaissance', label: 'Lieu de naissance', type: 'text', prefillFromProfile: 'lieuNaissance' },
      { key: 'adresse', label: 'Adresse', type: 'text', prefillFromProfile: 'adresse', required: true },
      { key: 'ville', label: 'Ville', type: 'text', prefillFromProfile: 'ville' },
    ],
  },
  {
    id: 'passeport',
    title: 'Passeport',
    category: 'Identité',
    cerfaNumber: 'Cerfa n°12277*02',
    summary: 'Demande de passeport biométrique, en vue d’un voyage à l’étranger.',
    durationEstimate: '~15 min',
    online: true,
    icon: 'airplane-outline',
    documents: [
      { id: 'photo', label: "Photo d'identité récente" },
      { id: 'justificatif-domicile', label: 'Justificatif de domicile de moins d’un an' },
      { id: 'timbre-fiscal', label: 'Timbre fiscal électronique' },
      { id: 'ancienne-piece', label: "Carte d'identité ou ancien passeport" },
    ],
    fields: [
      { key: 'civilite', label: 'Civilité', type: 'select', options: ['Mme', 'M.'], prefillFromProfile: 'civilite' },
      { key: 'nom', label: 'Nom de naissance', type: 'text', prefillFromProfile: 'nom', required: true },
      { key: 'prenom', label: 'Prénom(s)', type: 'text', prefillFromProfile: 'prenom', required: true },
      { key: 'dateNaissance', label: 'Date de naissance', type: 'date', prefillFromProfile: 'dateNaissance', required: true },
      { key: 'adresse', label: 'Adresse', type: 'text', prefillFromProfile: 'adresse', required: true },
      { key: 'telephone', label: 'Téléphone', type: 'tel', prefillFromProfile: 'telephone' },
    ],
  },
  {
    id: 'changement-adresse',
    title: 'Changement d’adresse',
    category: 'Logement',
    summary: 'Déclarez votre nouvelle adresse aux organismes (impôts, CAF, carte grise...) en une fois.',
    durationEstimate: '~10 min',
    online: true,
    icon: 'home-outline',
    documents: [{ id: 'justificatif-domicile', label: 'Nouveau justificatif de domicile' }],
    fields: [
      { key: 'nom', label: 'Nom', type: 'text', prefillFromProfile: 'nom', required: true },
      { key: 'prenom', label: 'Prénom', type: 'text', prefillFromProfile: 'prenom', required: true },
      { key: 'ancienneAdresse', label: 'Ancienne adresse', type: 'text', prefillFromProfile: 'adresse' },
      { key: 'nouvelleAdresse', label: 'Nouvelle adresse', type: 'text', required: true },
      { key: 'nouvelleVille', label: 'Nouvelle ville', type: 'text', required: true },
      { key: 'dateEmmenagement', label: 'Date d’emménagement', type: 'date', required: true },
    ],
  },
  {
    id: 'rsa',
    title: 'Revenu de solidarité active (RSA)',
    category: 'Social',
    cerfaNumber: 'Cerfa n°15481*03',
    summary: 'Demande de RSA pour les personnes sans ressources ou à faibles revenus.',
    durationEstimate: '~20 min',
    online: true,
    icon: 'heart-outline',
    documents: [
      { id: 'piece-identite', label: "Pièce d'identité" },
      { id: 'justificatif-domicile', label: 'Justificatif de domicile' },
      { id: 'rib', label: 'Relevé d’identité bancaire (RIB)' },
      { id: 'ressources', label: 'Justificatifs de ressources des 3 derniers mois' },
    ],
    fields: [
      { key: 'nom', label: 'Nom', type: 'text', prefillFromProfile: 'nom', required: true },
      { key: 'prenom', label: 'Prénom', type: 'text', prefillFromProfile: 'prenom', required: true },
      { key: 'dateNaissance', label: 'Date de naissance', type: 'date', prefillFromProfile: 'dateNaissance', required: true },
      { key: 'adresse', label: 'Adresse', type: 'text', prefillFromProfile: 'adresse', required: true },
      { key: 'situationFamiliale', label: 'Situation familiale', type: 'select', options: ['Célibataire', 'Marié(e)', 'Pacsé(e)', 'En couple', 'Divorcé(e)', 'Veuf/veuve'] },
      { key: 'telephone', label: 'Téléphone', type: 'tel', prefillFromProfile: 'telephone' },
    ],
  },
  {
    id: 'apl',
    title: 'Aide personnalisée au logement (APL)',
    category: 'Logement',
    cerfaNumber: 'Cerfa n°10840*07',
    summary: 'Demande d’aide au logement auprès de la CAF, en location ou en accession.',
    durationEstimate: '~15 min',
    online: true,
    icon: 'key-outline',
    documents: [
      { id: 'bail', label: 'Contrat de location ou quittance de loyer' },
      { id: 'rib', label: 'Relevé d’identité bancaire (RIB)' },
      { id: 'avis-imposition', label: 'Dernier avis d’imposition' },
    ],
    fields: [
      { key: 'nom', label: 'Nom', type: 'text', prefillFromProfile: 'nom', required: true },
      { key: 'prenom', label: 'Prénom', type: 'text', prefillFromProfile: 'prenom', required: true },
      { key: 'adresse', label: 'Adresse du logement', type: 'text', prefillFromProfile: 'adresse', required: true },
      { key: 'loyer', label: 'Montant du loyer mensuel (€)', type: 'text', required: true },
      { key: 'dateEntree', label: 'Date d’entrée dans le logement', type: 'date' },
    ],
  },
  {
    id: 'inscription-emploi',
    title: 'Inscription comme demandeur d’emploi',
    category: 'Emploi',
    summary: 'Inscription à France Travail (ex Pôle emploi) pour rechercher un emploi et être indemnisé.',
    durationEstimate: '~20 min',
    online: true,
    icon: 'briefcase-outline',
    documents: [
      { id: 'piece-identite', label: "Pièce d'identité" },
      { id: 'cv', label: 'Curriculum vitae' },
      { id: 'attestation-employeur', label: 'Attestation employeur (dernier emploi)' },
    ],
    fields: [
      { key: 'nom', label: 'Nom', type: 'text', prefillFromProfile: 'nom', required: true },
      { key: 'prenom', label: 'Prénom', type: 'text', prefillFromProfile: 'prenom', required: true },
      { key: 'dateNaissance', label: 'Date de naissance', type: 'date', prefillFromProfile: 'dateNaissance', required: true },
      { key: 'email', label: 'E-mail', type: 'email', prefillFromProfile: 'email', required: true },
      { key: 'telephone', label: 'Téléphone', type: 'tel', prefillFromProfile: 'telephone', required: true },
      { key: 'dernierMetier', label: 'Dernier métier exercé', type: 'text' },
    ],
  },
  {
    id: 'carte-grise',
    title: 'Certificat d’immatriculation (carte grise)',
    category: 'Véhicule',
    cerfaNumber: 'Cerfa n°13750*07',
    summary: 'Immatriculation d’un véhicule neuf, d’occasion, ou changement de titulaire.',
    durationEstimate: '~15 min',
    online: true,
    icon: 'car-outline',
    documents: [
      { id: 'piece-identite', label: "Pièce d'identité" },
      { id: 'justificatif-domicile', label: 'Justificatif de domicile' },
      { id: 'certificat-cession', label: 'Certificat de cession (si occasion)' },
      { id: 'controle-technique', label: 'Contrôle technique valide' },
    ],
    fields: [
      { key: 'nom', label: 'Nom du titulaire', type: 'text', prefillFromProfile: 'nom', required: true },
      { key: 'prenom', label: 'Prénom du titulaire', type: 'text', prefillFromProfile: 'prenom', required: true },
      { key: 'adresse', label: 'Adresse', type: 'text', prefillFromProfile: 'adresse', required: true },
      { key: 'immatriculationActuelle', label: 'Numéro d’immatriculation actuel', type: 'text' },
      { key: 'marqueModele', label: 'Marque et modèle du véhicule', type: 'text', required: true },
    ],
  },
  {
    id: 'permis-conduire',
    title: 'Permis de conduire',
    category: 'Véhicule',
    cerfaNumber: 'Cerfa n°14882*01',
    summary: 'Demande de titre pour un premier permis, un renouvellement ou un duplicata.',
    durationEstimate: '~15 min',
    online: true,
    icon: 'car-sport-outline',
    documents: [
      { id: 'photo', label: "Photo d'identité récente" },
      { id: 'piece-identite', label: "Pièce d'identité" },
      { id: 'justificatif-domicile', label: 'Justificatif de domicile' },
      { id: 'ancien-permis', label: 'Ancien permis (renouvellement ou duplicata)' },
    ],
    fields: [
      { key: 'nom', label: 'Nom', type: 'text', prefillFromProfile: 'nom', required: true },
      { key: 'prenom', label: 'Prénom', type: 'text', prefillFromProfile: 'prenom', required: true },
      { key: 'dateNaissance', label: 'Date de naissance', type: 'date', prefillFromProfile: 'dateNaissance', required: true },
      { key: 'lieuNaissance', label: 'Lieu de naissance', type: 'text', prefillFromProfile: 'lieuNaissance' },
      { key: 'adresse', label: 'Adresse', type: 'text', prefillFromProfile: 'adresse', required: true },
    ],
  },
  {
    id: 'declaration-revenus',
    title: 'Déclaration de revenus',
    category: 'Fiscalité',
    cerfaNumber: 'Cerfa n°10330*..',
    summary: 'Déclaration annuelle des revenus auprès de la Direction générale des finances publiques.',
    durationEstimate: '~25 min',
    online: true,
    icon: 'cash-outline',
    documents: [
      { id: 'avis-precedent', label: 'Précédent avis d’imposition' },
      { id: 'justificatifs-revenus', label: 'Justificatifs de revenus (salaires, aides, pensions)' },
      { id: 'rib', label: 'Relevé d’identité bancaire (RIB)' },
    ],
    fields: [
      { key: 'nom', label: 'Nom', type: 'text', prefillFromProfile: 'nom', required: true },
      { key: 'prenom', label: 'Prénom', type: 'text', prefillFromProfile: 'prenom', required: true },
      { key: 'adresse', label: 'Adresse fiscale', type: 'text', prefillFromProfile: 'adresse', required: true },
      { key: 'situationFamiliale', label: 'Situation familiale', type: 'select', options: ['Célibataire', 'Marié(e)', 'Pacsé(e)', 'Divorcé(e)', 'Veuf/veuve'] },
      { key: 'nombrePersonnesCharge', label: 'Nombre de personnes à charge', type: 'text' },
    ],
  },
  {
    id: 'carte-vitale',
    title: 'Carte Vitale',
    category: 'Social',
    cerfaNumber: 'Cerfa n°S1106b',
    summary: 'Première demande de carte Vitale ou mise à jour de vos droits à l’Assurance Maladie.',
    durationEstimate: '~10 min',
    online: true,
    icon: 'medkit-outline',
    documents: [
      { id: 'piece-identite', label: "Pièce d'identité" },
      { id: 'acte-naissance', label: 'Acte de naissance' },
      { id: 'rib', label: 'Relevé d’identité bancaire (RIB)' },
      { id: 'photo', label: "Photo d'identité récente" },
    ],
    fields: [
      { key: 'nom', label: 'Nom', type: 'text', prefillFromProfile: 'nom', required: true },
      { key: 'prenom', label: 'Prénom', type: 'text', prefillFromProfile: 'prenom', required: true },
      { key: 'dateNaissance', label: 'Date de naissance', type: 'date', prefillFromProfile: 'dateNaissance', required: true },
      { key: 'adresse', label: 'Adresse', type: 'text', prefillFromProfile: 'adresse', required: true },
      { key: 'email', label: 'E-mail', type: 'email', prefillFromProfile: 'email' },
    ],
  },
  {
    id: 'pacs',
    title: 'Pacte civil de solidarité (PACS)',
    category: 'Famille',
    cerfaNumber: 'Cerfa n°15725*03',
    summary: 'Déclaration conjointe de PACS auprès de la mairie ou d’un notaire.',
    durationEstimate: '~15 min',
    online: false,
    icon: 'people-outline',
    documents: [
      { id: 'piece-identite', label: "Pièces d'identité des deux partenaires" },
      { id: 'acte-naissance', label: 'Actes de naissance de moins de 3 mois' },
      { id: 'attestation-non-pacse', label: 'Attestations sur l’honneur de non-parenté et de résidence' },
    ],
    fields: [
      { key: 'nom', label: 'Votre nom', type: 'text', prefillFromProfile: 'nom', required: true },
      { key: 'prenom', label: 'Votre prénom', type: 'text', prefillFromProfile: 'prenom', required: true },
      { key: 'dateNaissance', label: 'Votre date de naissance', type: 'date', prefillFromProfile: 'dateNaissance' },
      { key: 'nomPartenaire', label: 'Nom du/de la partenaire', type: 'text', required: true },
      { key: 'prenomPartenaire', label: 'Prénom du/de la partenaire', type: 'text', required: true },
      { key: 'adresseCommune', label: 'Adresse commune envisagée', type: 'text', prefillFromProfile: 'adresse' },
    ],
  },
  {
    id: 'titre-sejour',
    title: 'Titre de séjour',
    category: 'Étranger',
    summary: 'Première demande ou renouvellement de titre de séjour pour les ressortissants étrangers.',
    durationEstimate: '~25 min',
    online: true,
    icon: 'earth-outline',
    documents: [
      { id: 'passeport', label: 'Passeport en cours de validité' },
      { id: 'photo', label: "Photos d'identité récentes" },
      { id: 'justificatif-domicile', label: 'Justificatif de domicile' },
      { id: 'justificatif-ressources', label: 'Justificatifs de ressources' },
    ],
    fields: [
      { key: 'nom', label: 'Nom', type: 'text', prefillFromProfile: 'nom', required: true },
      { key: 'prenom', label: 'Prénom', type: 'text', prefillFromProfile: 'prenom', required: true },
      { key: 'dateNaissance', label: 'Date de naissance', type: 'date', prefillFromProfile: 'dateNaissance', required: true },
      { key: 'lieuNaissance', label: 'Lieu et pays de naissance', type: 'text', prefillFromProfile: 'lieuNaissance' },
      { key: 'adresse', label: 'Adresse en France', type: 'text', prefillFromProfile: 'adresse', required: true },
      { key: 'telephone', label: 'Téléphone', type: 'tel', prefillFromProfile: 'telephone' },
    ],
  },
];

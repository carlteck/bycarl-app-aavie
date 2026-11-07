# Journal de refonte UX mobile

## Lot 0 — services du site

### Ce qui change pour l’usager

- Veille, ressources et annuaire lisent désormais les contenus publiés par le site avec le compte unifié ; le repli embarqué de l’annuaire a été retiré.
- Les démarches suivies par l’équipe apparaissent dans « Mes démarches ».
- Le support utilise les tickets du site pour la liste, la création, le détail et les réponses. La fermeture mobile a été retirée : cette méthode n’est pas ouverte au jeton mobile.
- Le coffre-fort lit les documents et l’état Google Drive/OneDrive. Sans cloud, il propose d’ouvrir le site pour connecter le compte. Les contrats de dépôt, téléchargement, dossiers, déplacement et suppression sont centralisés dans `vault.ts`.
- « Mes crédits » affiche le solde, le forfait et l’historique réels.
- « Aide rédactionnelle » et les mentions « bientôt disponible » devenues fausses ont été retirées ; l’assistant remplace ce service.

### Fichiers principaux

`src/lib/api.ts`, `annuaire-remote.ts`, `regulatory-news.ts`, `resources.ts`, `support.ts`, `vault.ts`, `credits.ts`, `tracked-procedures.ts`, les écrans annuaire, démarches, support, coffre-fort et crédits, `src/constants/modules.ts`.

### Décisions et limites

- Les listes intégralement renvoyées par le site sont filtrées et paginées localement ; chaque ligne distante reste validée avant affichage.
- Les catégories du support ne sont pas envoyées : l’API du site ne les accepte pas. La fermeture d’un ticket n’est pas simulée.
- Le téléchargement binaire utilise `expo-file-system`, car `apiFetch` parse du JSON. L’autorisation Bearer reste la même. `expo-sharing` est chargé uniquement au moment de l’ouverture : le development build installé ne contient pas encore ce module natif et ne doit jamais planter au démarrage pour cette raison. Un prochain build natif devra l’embarquer.
- Les opérations de dossiers sont raccordées au niveau service. L’interface complète de gestion et le formulaire de dépôt restent à finaliser avec l’annonce du coût issue de `ai/quota.php` ; aucune écriture réelle n’a été effectuée pendant la vérification.
- Modules Expo officiels ajoutés : `expo-document-picker`, `expo-file-system`, `expo-sharing`, versions résolues par `expo install` pour SDK 57. Impact limité au choix, transfert et ouverture de fichiers.

### Contrôles

- `pnpm exec tsc --noEmit` : réussi.
- `pnpm lint` : réussi, zéro avertissement.
- `pnpm test:sync`, `test:modules`, `test:router`, `test:lifecycle`, `test:site-auth`, `test:assistant` : réussis.
- Captures temporaires regardées : `/tmp/aavie-lot0-credits-dark.png`, `/tmp/aavie-lot0-vault-dark.png`, `/tmp/aavie-lot0-procedures-dark.png`. Elles confirment les crédits et documents réels en thème sombre. La première capture `/tmp/aavie-lot0-before.png` a révélé le chargement natif prématuré d’Expo Sharing, corrigé par un import différé.
- La tentative thème clair + police 1,3 (`/tmp/aavie-lot0-credits-light-large.png`) a capturé l’écran pendant le redémarrage de l’activité et n’est pas exploitable. Ce contrôle reste à refaire.
- iOS non exécuté localement ; les APIs utilisées sont communes Expo SDK 57 et les types TypeScript passent.

### Suppressions explicites

- Lecteurs Supabase historiques pour veille, ressources, annuaire, support et coffre-fort.
- Repli embarqué de l’annuaire dans l’écran.
- Entrée de service « Aide rédactionnelle ».
- Action mobile « fermer le ticket », absente du contrat serveur autorisé.
- Faux textes « bientôt disponible », « crédits non disponibles » et « coffre-fort non activé ».

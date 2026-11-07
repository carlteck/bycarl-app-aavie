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

## Lot 1 — assistant central

### Ce qui change pour l’usager

- L’Assistant devient le premier onglet sur téléphone et sur la barre web, sans dupliquer la liste des conversations.
- Le fil reste en plein écran avec sa saisie fixée au-dessus du clavier, les suggestions de départ, la dictée et la lecture à voix haute.
- Le coût maximal par envoi et le nombre estimé de questions restantes viennent de `ai/quota.php`.
- Une photo ou un PDF de 4 Mo maximum peut être joint depuis le sélecteur système. Le fichier n’est lu qu’après le choix explicite de l’usager.
- Les cartes d’action sont confirmées ou annulées dans l’application via `ai/tool-confirm.php`; aucune écriture n’a lieu avant confirmation.
- Une réponse tronquée affiche « Continuer la réponse » et précise que cette suite compte comme une nouvelle question.

### Fichiers principaux

`src/app/(tabs)/assistant.tsx`, `src/components/app-tabs.tsx`, `app-tabs.web.tsx`, `assistant-thread.tsx`, `src/lib/assistant.ts`, `src/lib/assistant-reply.ts`, `src/hooks/use-assistant.ts`.

### Décisions et limites

- Le sélecteur de documents est importé au moment de l’appui afin qu’un ancien development build sans le module natif affiche une erreur utile au lieu de planter au démarrage.
- Une seule pièce jointe est proposée dans ce lot mobile, volontairement, pour rester lisible et fiable sur connexion lente ; le serveur conserve sa limite supérieure de cinq.
- Le coût affiché est la provision maximale promise par le serveur, pas une fausse estimation exacte du nombre de tokens.

### Contrôles

- Capture sombre regardée : `/tmp/aavie-lot1-assistant-dark.png`. Elle confirme l’Assistant en premier onglet, la liste réelle, le CTA « Nouvelle conversation » et l’absence de doublon de titre dans le contenu.
- La capture thème clair + police 1,3 (`/tmp/aavie-lot1-assistant-light-large.png`) est à nouveau tombée pendant le redémarrage Android provoqué par `uimode` et reste inexploitable ; aucun envoi ni écriture réelle n’a été effectué.
- Les écritures nouvelles (confirmation/annulation, pièce jointe) sont couvertes uniquement avec API simulée conformément à la règle de données réelles.

## Lot 2 — grammaire visuelle allégée

- Le composant d’en-tête partagé ne répète plus « VOTRE QUOTIDIEN AVEC AAVIE » ni une icône décorative sur chaque onglet : un titre, une introduction courte, puis le contenu.
- Connexion et inscription ne répètent plus leur titre de barre dans une carte interne.
- Aucun token de couleur ni comportement métier n’a changé ; l’accueil public validé reste intact.
- Fichiers principaux : `page-header.tsx`, `connexion.tsx`, `inscription.tsx`.

## Lot 3 — états justes et utiles

- L’accueil ne dit plus simultanément qu’une échéance passée exige une action et que « la suite est à vous ». S’il existe du retard sans date future, il invite d’abord à vérifier les échéances passées.
- Les écrans planificateur et notifications conservent leur bouton d’ajout visible avec leurs états vides ; les erreurs distantes conservent l’action Réessayer partagée.
- Le statut de synchronisation du compte reste dérivé de `SyncContext` (`synced`, `syncing`, attente) et n’est pas simulé localement.

## Lot 4 — connexion et inscription courtes

### Ce qui change

- L’inscription est découpée en trois étapes : accès, profil, consentement. Les valeurs restent dans le même état React lors des retours entre étapes.
- Chaque étape valide seulement les données nécessaires avant de continuer. Le dernier bouton conserve l’appel `register` existant, les identifiants des versions actives des textes légaux et le choix particulier/entreprise.
- Les champs de mot de passe vides affichent une consigne textuelle, plus une rangée de points donnant l’impression qu’une valeur existe déjà.
- Biométrie et défi administrateur par code e-mail restent inchangés.

### Vérification visuelle

- L’émulateur de production étant déjà authentifié, le lien profond public `/inscription` est correctement redirigé par `Stack.Protected` vers l’espace connecté (`/tmp/aavie-lot4-register-dark.png`). Aucun compte réel n’a été créé et aucune session réelle n’a été fermée. Le rendu public des trois étapes reste donc à vérifier sur un development build non authentifié.

## Lot 5 — retours immédiats

### Ce qui change

- Les chargements partagés utilisent un squelette sobre et homogène, avec un libellé annoncé par les technologies d’assistance.
- Les boutons d’action principaux déclenchent un retour haptique de sélection sur iOS et Android. L’import est différé et l’absence du module dans un ancien development build reste sans effet fonctionnel.
- La création d’une demande de support affiche une confirmation discrète dans le détail, sans dialogue bloquant.
- Les transitions de navigation sont courtes et désactivées lorsque la préférence système de réduction des animations est active. L’animation de démarrage est également ignorée dans ce cas.
- La barre d’état suit le thème clair ou sombre et les écrans continuent d’utiliser les zones sûres existantes.

### Fichiers principaux

`src/components/screen-state.tsx`, `src/components/primary-button.tsx`, `src/components/animated-icon.tsx`, `src/lib/haptics.ts`, `src/app/_layout.tsx`, `src/app/support/nouvelle.tsx`, `src/app/support/[id].tsx`.

### Décisions et limites

- `expo-haptics` est un module Expo officiel, résolu par `expo install` pour SDK 57. Il ne porte aucune donnée et ne demande aucune permission. Un prochain development build devra l’embarquer pour produire la vibration ; l’interface reste utilisable sans lui.
- Les squelettes restent statiques : ils évitent une animation permanente, consomment moins et respectent naturellement `reduceMotion`.
- La confirmation de création est portée par un paramètre de navigation éphémère. Un rechargement manuel de cette URL peut la réafficher, sans répéter l’écriture.

### Contrôles

- `pnpm exec tsc --noEmit` : réussi.
- `pnpm lint` : réussi, zéro avertissement.
- `pnpm test:sync`, `test:modules`, `test:router`, `test:lifecycle`, `test:site-auth`, `test:assistant` : réussis.
- Capture sombre regardée : `/tmp/aavie-current.png`. Elle confirme le rendu complet après redémarrage, la zone sûre supérieure et la barre d’état cohérente avec le thème. Une première capture trop précoce (`/tmp/aavie-lot5-assistant-dark.png`) montrait seulement la surface native avant la fin du chargement du bundle ; les logs Android ne contiennent aucune exception associée.
- Aucune demande réelle n’a été créée : la confirmation d’écriture n’a donc pas été déclenchée sur le compte de production.
- Capture thème clair et police 1,3 regardée : `/tmp/aavie-lot5-light-large.png`. Le titre, le quota, le bouton principal, les cartes et la barre basse restent lisibles sans chevauchement ; la bulle « Tools » visible à droite appartient au development build Expo, pas à l’interface AAVIE.

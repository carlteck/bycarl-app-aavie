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

## Lot 6 — crédits lisibles

### Ce qui change

- « Mes crédits » conserve son solde, son forfait et l’historique réel de `credits.php`, et affiche désormais aussi le nombre estimé de questions restantes fourni par `ai/quota.php`.
- Un compte exonéré est présenté comme « Illimitées ». Si l’estimation est temporairement indisponible, le reste de l’écran demeure accessible et l’état est indiqué honnêtement.
- L’assistant affichait déjà cette même estimation depuis le lot 1 ; les deux écrans reposent donc sur la même validation `mapAssistantQuota`.

### Contrôles et décisions

- `pnpm exec tsc --noEmit` et `pnpm lint` : réussis, zéro avertissement.
- `pnpm test:sync`, `test:modules`, `test:router`, `test:lifecycle`, `test:site-auth`, `test:assistant` : réussis.
- Capture sombre regardée : `/tmp/aavie-lot6-credits-dark.png`. Elle confirme sur les données réelles le solde illimité, l’estimation illimitée, le forfait mensuel et l’historique sans écriture.
- L’estimation est affichée séparément du solde, car elle dépend du coût maximal courant d’une question et ne constitue pas une promesse de consommation exacte.
- Capture thème clair et police 1,3 regardée : `/tmp/aavie-lot6-credits-light-large.png`. Le solde, l’estimation, son explication et l’historique s’adaptent sans troncature ni chevauchement. La première prise du même fichier avait précédé la restauration de session et montrait l’accueil public ; elle a été remplacée après chargement, sans connexion manuelle.

## Lot 7 — interface multilingue

### Ce qui change

- Le français reste la langue de référence. Anglais, espagnol, portugais et créole haïtien utilisent des dictionnaires à parité contrôlée ; une phrase absente retombe toujours sur le français.
- L’ancien code `gcr` et le drapeau guyanais sont remplacés par `ht`, « Kreyòl ayisyen » et le drapeau haïtien. Une ancienne préférence `gcr` est migrée localement vers `ht`.
- La langue peut être choisie à l’inscription et changée depuis Compte. Le choix est stocké sur l’appareil et s’applique immédiatement à la navigation, aux libellés partagés et aux écrans raccordés.
- Les phrases communes avec le site sont générées depuis ses dictionnaires versionnés, puis filtrées aux seules chaînes réellement utilisées par le mobile afin de ne pas alourdir inutilement le bundle. Les phrases propres au mobile complètent ce socle.
- Dates, heures et montants utilisent `Intl` avec la locale active. Dictée et lecture à voix haute demandent aussi la langue correspondante au module natif.

### Fichiers principaux et contrôles

`src/context/locale-context.tsx`, `src/i18n/`, `src/constants/locales.ts`, `ThemedText`, les composants de formulaire et de navigation, `remote-values.ts`, `budget.ts`, `scripts/generate-mobile-i18n.cjs`, `tests/i18n.test.cjs`.

- `pnpm test:i18n` vérifie la parité exacte des clés françaises dans les quatre autres langues, les phrases partagées, les phrases mobiles, le code `ht`, le drapeau 🇭🇹 et le repli français.
- Le harnais `test:lifecycle` simule la locale vocale ; les 10 scénarios biométrie/dictée passent après l’ajout du runtime i18n.
- Captures sombres regardées : `/tmp/aavie-lot7-profile-locales-dark.png` (cinq langues et drapeaux), `/tmp/aavie-lot7-profile-ht-dark.png` (navigation et mentions légales en créole), `/tmp/aavie-lot7-assistant-ht-dark.png` (conversation sans écriture), `/tmp/aavie-lot7-services-ht-dark.png` (catalogue en lecture seule).
- Contrôle complémentaire des services : Planificateur, Centre de ressources, Annuaire et Manuel ont été ouverts et regardés en créole (`/tmp/aavie-lot7-planificateur-ht-dark.png`, `/tmp/aavie-lot7-ressources-ht-dark.png`, `/tmp/aavie-lot7-annuaire-ht-dark.png`, `/tmp/aavie-lot7-manuel-utilisateur-ht-dark.png`). Les contenus éditoriaux restent en français, tandis que titres, recherche, filtres, actions et états appartiennent à l’interface traduite.
- La vérification a révélé que les cartes Planificateur, Ressources et Annuaire ne naviguaient pas : un onglet natif marqué `hidden` n’est pas une route empilable. Ces trois écrans ont été déplacés hors du groupe `(tabs)` vers la pile protégée et disposent d’un retour « Services ». Capture de reproduction : `/tmp/aavie-services-plan-tap.png` ; capture après correction : `/tmp/aavie-services-plan-tap-fixed.png`.
- Les cartes Assistant, Accompagnement, Planificateur, Budget, Coffre-fort, Veille, Centre de ressources, Annuaire et Manuel ont été rapprochées de leurs routes déclarées. Le Manuel était déjà une route de pile ; les trois écrans déplacés suivent désormais le même modèle.
- Contrôles après correction : `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm test:i18n`, `pnpm test:sync`, `pnpm test:modules`, `pnpm test:router`, `pnpm test:lifecycle`, `pnpm test:site-auth` et `pnpm test:assistant` réussis.
- Les contenus éditoriaux renvoyés par l’API (actualités, ressources, annuaire, démarches, messages de support et conversations) restent dans leur langue d’origine : ils ne sont pas des chaînes d’interface et le mobile ne les traduit pas artificiellement.
- ⚠️ La traduction créole haïtienne n’a pas été relue par un locuteur natif. Cette relecture reste obligatoire avant de considérer la formulation éditoriale définitive.

## Correction — accueil connecté

- Captures reçues et regardées : `Screenshot iPhone 18 Pro Max 06-11-2026 at 22.24.52.png` et `Screenshot iPhone 18 Pro Max 06-11-2026 at 22.24.59.png`.
- La grande carte bleue dupliquait l’onglet Assistant, repoussait les informations utiles sous la ligne de flottaison et contenait une seconde carte d’information sans action prioritaire. Elle est remplacée par un bloc compact : question, dictée et accès aux conversations restent disponibles.
- Les échéances passées ne sont plus rangées sous « À venir ». Elles deviennent une alerte prioritaire en tête de contenu, avec une explication et un accès direct au planificateur. L’échéance reste volontairement présente tant qu’elle n’est pas mise à jour ou supprimée par l’usager.
- Les prochaines échéances ne sont affichées que lorsqu’elles existent. Les grandes cartes vides contradictoires ont disparu ; un compte sans aucun rappel reçoit seulement une action compacte d’ajout.
- Contrôles : `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm test:i18n`, `pnpm test:sync`, `pnpm test:router` et `pnpm test:lifecycle` réussis. Le simulateur iOS visible dans les captures n’était pas exposé à l’outil de contrôle visuel ; une capture après rechargement reste à regarder.
- Capture après rechargement regardée : `Screenshot iPhone 18 Pro Max 06-11-2026 at 22.29.24.png`. La priorité en retard, le bloc Assistant et les accès rapides tiennent dans le premier écran sans chevauchement. À la suite de cette relecture, le bloc Assistant reçoit un filet supérieur bleu, une ombre légère et une icône blanche sur bleu : il se distingue des accès rapides turquoise sans redevenir une grande bannière.
- Le champ de question reçoit également un contour bleu profond : le bleu reste réservé à l’action principale et à la saisie active, le turquoise aux raccourcis secondaires, et le corail à l’échéance nécessitant une attention.
- Après relecture de la charte Toucan-Art du site, l’accueil adopte une composition plus éditoriale : l’Assistant utilise une surface bleu clair sans ombre ni bordure lourde, un décor bleu discret, un input blanc avec focus bleu et une hiérarchie interne explicite. Les raccourcis deviennent une liste compacte plutôt que trois tuiles turquoise concurrentes. La priorité corail reste extérieure à l’Assistant.
- Un token `primaryTint` clair/sombre porte cette surface sans détourner le turquoise de son rôle de sélection et de surface secondaire. Contrôles : `pnpm exec tsc --noEmit`, `pnpm lint` et `pnpm test:i18n` réussis. Aucun simulateur iOS ou Android n’était démarré pour produire la capture finale ; elle reste à regarder après rechargement sur l’iPhone simulé.
- La liste « Pour avancer » donne aussi un accès direct à la Gestion du budget et au Coffre-fort, entre le Planificateur et l’Annuaire. Ces liens réutilisent les routes existantes et ne dupliquent aucune logique métier.

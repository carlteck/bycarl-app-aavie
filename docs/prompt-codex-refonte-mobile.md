Tu travailles sur l'**application mobile** AAVIE, dépôt `bycarl-app-aavie` (Expo 57, React Native
0.86, expo-router, TypeScript). AAVIE est un assistant administratif pour un public guyanais, souvent
peu à l'aise avec l'écrit et le numérique, souvent sur une connexion lente.

⚠️ **Le périmètre est l'application mobile, pas le site web.** Tu ne modifies rien dans le dépôt
`site_aavie`. Tu peux le **lire** (`/Users/olivier/GitHub/site_aavie`) pour connaître le contrat
exact de l'API PHP, rien de plus.

Ta mission : rendre l'application fonctionnelle et moderne, au niveau d'un produit conversationnel
actuel (références : ChatGPT, Linear, Notion, Qonto, Alan). « Moderne » veut dire plus simple, plus
direct, plus vivant — pas d'effets gratuits.

## À lire avant d'écrire une ligne

1. `CLAUDE.md` et `AGENTS.md` du dépôt mobile, en entier. ⚠️ `AGENTS.md` : Expo a changé, lis la
   documentation versionnée https://docs.expo.dev/versions/v57.0.0/ avant d'écrire du code.
2. `docs/audit-ux-mobile-2026-11.md` : le diagnostic et la direction. Ton travail l'applique.
3. `docs/assistant-admin.md` : l'assistant mobile déjà branché sur le site.
4. Côté site, en lecture seule : `CLAUDE.md` (sections « Authentification mobile unifiée »,
   « Routes ouvertes au jeton de l'application », « Assistant : … », « Tarification IA automatique »)
   et les endpoints listés ci-dessous dans `api/public/`.

## Ce que l'API du site offre à l'application (en production depuis le 6 novembre 2026)

Base : `EXPO_PUBLIC_API_URL` (production `https://aavieapp.com/api`). Authentification par
`Authorization: Bearer <jeton du site>`, déjà géré par `apiFetch` (`src/lib/api.ts`). Seules ces
routes et méthodes acceptent le jeton (`MobileAuth::BEARER_ROUTES` côté site) :

| Route                                                   | Méthodes            | Usage dans l'application                           |
| ------------------------------------------------------- | ------------------- | -------------------------------------------------- |
| `ai/chat.php`                                           | POST                | envoyer une question (pièces jointes possibles)    |
| `ai/conversations.php`, `ai/conversation.php?id=`       | GET / GET PATCH DEL | historique                                         |
| `ai/quota.php`                                          | GET                 | coût annoncé avant envoi, questions restantes      |
| `ai/tool-confirm.php`                                   | POST                | confirmer ou annuler une action proposée           |
| `credits.php`                                           | GET                 | solde et historique de crédits                     |
| `news.php`                                              | GET                 | veille réglementaire (avec « me concerne »)        |
| `resources.php`                                         | GET                 | centre de ressources                               |
| `contacts.php`                                          | GET                 | annuaire                                           |
| `procedures.php`                                        | GET                 | démarches suivies par l'équipe                     |
| `support-tickets.php`, `support-ticket.php?id=`         | GET POST            | support : liste, création, détail, réponse         |
| `documents.php`, `document.php?id=`                     | GET POST / GET PATCH DELETE | coffre-fort : liste, dépôt, téléchargement, déplacement, suppression |
| `document-folders.php`, `document-folder.php?id=`       | GET POST / PATCH DELETE | dossiers du coffre-fort                        |
| `cloud.php`                                             | GET seulement       | état de la connexion Google Drive / OneDrive       |

- **Connecter un cloud ne se fait pas depuis l'application** (retour OAuth lié à la session du
  navigateur) : l'application lit `cloud.php` et, si rien n'est connecté, ouvre
  `https://aavieapp.com/espace/coffre-fort` dans le navigateur avec une explication courte.
- `documents.php` répond **409** tant qu'aucun cloud n'est connecté : c'est un état normal, pas une erreur.
- Le dépôt d'un document et le dépôt d'une réponse au coffre-fort **coûtent des crédits** : prix
  écrit sur le bouton, comme sur le site (`document_cost` dans `ai/quota.php`).
- Planificateur, budget et profil passent toujours par Supabase et la synchronisation : n'y touche pas.
- Toute autre route du site (profil, paiement, RGPD, administration) refuse le jeton : ne l'appelle pas.

## Règles non négociables

- **Rien ne change côté serveur** (site ou Supabase). Pas de migration Supabase, pas de fonction Edge.
  Si un besoin d'API manque, écris-le dans le journal et contourne-le proprement ; ne bricole pas.
- **Le coût en crédits est annoncé avant chaque action payante** (question, dépôt au coffre-fort).
  Tu peux le rendre plus lisible (questions restantes estimées), jamais le cacher.
- **Rien ne s'écrit sans confirmation de l'usager** : les cartes d'action de l'assistant (échéances,
  budget, formulaire) restent à confirmer, par `ai/tool-confirm.php`.
- **Les réponses de l'assistant sont du Markdown non fiable** : rendu natif via `RichText` /
  `simple-markdown.ts`, jamais de WebView ni de HTML interprété.
- **Charte** : couleurs uniquement via `src/constants/theme.ts`. Corail réservé à l'alerte et au
  destructif, jamais un bouton principal. Thème sombre et clair corrects tous les deux.
- **Décisions validées par l'utilisateur à conserver** (voir `CLAUDE.md`) : composition A de
  l'accueil public, police système, zones sûres, cibles tactiles de 48 points, mode tablette avec
  sidebar, identifiants natifs `com.aavie.app`.
- **Accessibilité** : libellés pour TalkBack/VoiceOver, ordre de lecture logique, grandes tailles de
  texte supportées sans troncature ni chevauchement, contrastes AA, jamais une information portée
  par la seule couleur, `reduceMotion` respecté. Dictée et lecture à voix haute conservées partout.
- **Performance** : pas de nouvelle grosse dépendance sans justification écrite dans le journal.
  Une connexion 3G doit rester utilisable : états de chargement, délais, reprise.
- **Pas de publication.** Ni `eas build`, ni `eas update`, ni push, ni soumission aux stores.
- **Données réelles** : l'émulateur est connecté au compte réel de l'utilisateur, en production.
  Pour vérifier un écran, **navigue en lecture seule** : n'envoie aucune question, ne crée ni ticket,
  ni document, ni échéance, ni opération, ne supprime rien. Les comportements d'écriture se vérifient
  par des tests avec API simulée. Aucun compte créé en production.
- **Git** : crée une branche `refonte-ux-mobile` depuis `develop`. Un commit par lot cohérent, message
  en français qui dit ce qui change pour l'usager. Ne pousse pas. Si `git status` n'est pas propre au
  démarrage, arrête-toi et signale-le.

## Ce qu'il faut livrer, par lots, dans cet ordre

0. **Brancher les services sur le site** : veille, ressources, annuaire, démarches, support,
   coffre-fort (liste, dossiers, dépôt, téléchargement, déplacement, suppression) et crédits lisent et
   écrivent par `apiFetch` sur les routes ci-dessus, avec validation des réponses à la lecture (même
   rigueur que `remote-values.ts`). Retire les lecteurs Supabase devenus morts, le repli embarqué de
   l'annuaire s'il n'a plus de raison d'être, et tout « Bientôt disponible » / « pas encore activé »
   devenu faux (`/demarche`, `credits.tsx`, `module-card.tsx`, coffre-fort). Retire « Aide
   rédactionnelle » des services : elle n'existe plus, l'assistant la remplace.
1. **L'assistant au centre** : un onglet Assistant en premier dans la barre basse (et en tête du
   sidebar tablette). Conversation plein écran, saisie collée en bas au-dessus du clavier, suggestions
   concrètes au démarrage, historique accessible d'un geste, « Nouvelle conversation » toujours visible.
   Ajoute ce qui manque par rapport au site : pièces jointes (photo et PDF, permission demandée au
   moment du choix seulement), coût annoncé avant l'envoi (`ai/quota.php`), cartes d'action
   confirmables, réponse coupée et « Continuer ». L'accueil connecté ne garde pas une seconde
   implémentation de l'assistant : son champ ouvre la même conversation.
2. **Grammaire visuelle allégée** sur tous les écrans connectés, connexion et inscription : un seul
   titre par écran, plus de sur-titres en capitales, plus de carte contenant le titre de l'écran,
   moins de cartes en général, hiérarchie par la typographie. L'accueil public (composition A) ne
   bouge pas.
3. **États justes et utiles** : jamais deux messages contradictoires sur un même écran (planificateur,
   accueil, notifications, « Synchronisation en cours… »). Chaque état vide ou d'erreur propose
   l'action suivante avec un bouton qui la déclenche (souvent : demander à l'assistant).
4. **Connexion et inscription courtes** : inscription en vraies étapes (accès, puis profil, puis
   consentement), valeurs conservées au retour ; plus de points dans le champ mot de passe vide.
   Conserver : consentement aux versions actives des textes légaux (`/legal.php`), choix
   particulier/entreprise, biométrie, code par e-mail pour un administrateur.
5. **Retours immédiats** : squelettes de chargement homogènes, retour haptique discret sur les actions
   principales, confirmation discrète après une création, transitions courtes, `reduceMotion` respecté.
   Le contenu ne défile plus sous la barre d'état.
6. **Crédits lisibles** : solde et nombre estimé de questions restantes (`remaining_questions` de
   `ai/quota.php`) dans l'assistant et dans « Mes crédits », qui devient un vrai écran (solde,
   forfait, historique de `credits.php`).
7. **Toute l'interface traduite** dans les langues du site : français (référence), anglais, espagnol,
   portugais, **créole haïtien** (`ht`, pas le créole guyanais : corrige aussi le drapeau). Une clé
   manquante retombe sur le français. Phrases entières, jamais concaténées. Un test échoue si une clé
   du français manque ailleurs. Dates et nombres via `Intl`. Le créole n'a pas été relu par un
   locuteur natif : signale-le dans le journal.

Si un lot se révèle trop gros, livre-le en plusieurs commits, mais ne commence pas le suivant avant
que le précédent passe tous les contrôles.

## Contrôles à chaque lot

- `pnpm exec tsc --noEmit`, `pnpm lint` (zéro avertissement toléré), et toutes les suites :
  `pnpm test:sync`, `test:modules`, `test:router`, `test:lifecycle`, `test:site-auth`, `test:assistant`.
  Ajoute des tests pour chaque nouveau comportement (lecture des réponses de l'API, états, i18n), avec
  API simulée — jamais d'appel réseau réel dans un test.
- Vérification visuelle dans l'émulateur Android (Metro : `pnpm exec expo start --dev-client`, puis
  `adb reverse tcp:8081 tcp:8081`) : capture `adb exec-out screencap -p` de chaque écran modifié, avant
  et après, en thème sombre et en thème clair, et au moins une fois en très grande taille de texte.
  Les captures vont dans un dossier temporaire, jamais dans le dépôt. Lecture seule sur les données
  réelles (voir plus haut).

## Suivi de ton travail

Tu es relu par une autre session (Claude) qui suit tes commits. Tiens un journal
`docs/refonte-ux-mobile-journal.md` : pour chaque lot, ce qui change pour l'usager, les fichiers
principaux, les contrôles passés avec leurs résultats, les captures regardées, ce qui n'a pas été
vérifié, les décisions prises avec leur raison. Signale explicitement tout ce que tu as supprimé,
tout comportement modifié et toute limite connue.

## Mise à jour de CLAUDE.md

À la fin de chaque lot, mets à jour le `CLAUDE.md` du dépôt mobile pour qu'il décrive l'application
telle qu'elle est désormais : corrige ou retire les passages devenus faux (par exemple « Le mobile parle
exclusivement à Supabase », la table des modules et leurs sources, « L'assistant n'a pas de service »,
« Le coffre-fort ne stocke rien », les crédits non raccordés, « Seule l'aide rédactionnelle reste une
page de présentation »), ajoute les nouvelles règles, dans le style du fichier : en français, précis,
avec les pièges marqués ⚠️. Ne supprime aucune règle de sécurité, de facturation, de publication ou de
RGPD.

## Fin de mission

Quand tous les lots sont faits : résumé dans le journal, liste des commits, et ce qui reste à décider
par l'équipe produit. Ne publie pas, ne pousse pas.

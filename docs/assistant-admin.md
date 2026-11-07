# Assistant administratif mobile

Le site et l'application utilisent le même moteur, les mêmes conversations et le même solde.
Le mobile appelle l'API PHP AAVIE ; aucune clé fournisseur IA ne figure dans l'application.

## Première version

- Envoyer une question depuis l'accueil : le fil s'ouvre et l'assistant répond directement,
  sans deuxième appui sur Envoyer.
- Poser des questions, préparer des courriers, relire, renommer et supprimer ses conversations.
- Afficher les crédits du site, y compris l'exonération des administrateurs.
- Afficher les réponses en Markdown et les écouter.
- Afficher les propositions d'action sans les exécuter : leur validation reste sur le site.

Les pièces jointes, la validation des actions et l'affichage progressif sont hors de cette première
version. L'API actuelle répond en JSON après traitement, sans flux de texte.

## Activation

L'assistant reste désactivé par défaut pour ne pas ouvrir un parcours dont l'API de production
n'a pas encore été mise à jour.

1. Dans le dépôt `site_aavie`, appliquer la migration
   `api/database/migrations/083_add_assistant_client_requests.sql` à la base cible.
2. Déployer les modifications PHP de `Auth`, `MobileAuth`, `MobileApiToken`, `AssistantRequest`,
   `bootstrap` et `ai/chat.php` ensemble.
3. Vérifier que l'authentification mobile unifiée est configurée et que l'hébergement transmet
   l'en-tête `Authorization` à PHP. Une ancienne connexion uniquement Supabase ne suffit pas :
   se reconnecter avec le compte du site pour obtenir un jeton signé par AAVIE.
4. Tester avec un compte du site : retrouver une conversation web, envoyer une question,
   vérifier la réponse et le solde, renommer puis supprimer une conversation de test.
5. Activer `EXPO_PUBLIC_ASSISTANT_ENABLED=true` dans l'environnement mobile et produire le bundle
   correspondant. `EXPO_PUBLIC_API_URL` désigne la racine de l'API (production :
   `https://aavieapp.com/api`, Herd local : `https://aavie-api.test`).

## Déploiement du 5 novembre 2026

La migration 083 est appliquée en production et les six fichiers PHP sont déployés, avec
sauvegarde des versions précédentes hors de la racine publique. La règle Apache de
`api/public/.htaccess` transmet désormais `Authorization` à PHP ; sans elle, le serveur
retournait 401 malgré un jeton valide.

Le parcours HTTPS a été vérifié avec un compte temporaire supprimé après le test : réponse IA,
lecture de l'historique, renommage, suppression, refus d'une signature falsifiée, maintien de la
protection CSRF web et renvoi sans second échange ni second débit.

L'assistant est activé dans l'environnement local et dans l'environnement EAS `production`.
Les mises à jour sont publiées sur le canal `production` :

- [iOS](https://expo.dev/accounts/bycarl/projects/aavie-app/updates/406fb7d1-10ac-4d30-870f-5d5a0edb5361),
  runtime `dd729fd2b388329de575fe53336aee1288adfcf8`.
- [Android](https://expo.dev/accounts/bycarl/projects/aavie-app/updates/144b68d3-bdd9-4144-86a3-53189c7aadd6),
  runtime `c49d9533acbd7cf5548824be5daf1a8e1c1b01f0`.

Les mises à jour OTA atteignent uniquement les binaires compatibles avec ces runtimes. Les
anciens builds distribués n'utilisant pas ces runtimes nécessitent une nouvelle compilation ;
aucun nouveau binaire ni soumission aux stores n'a été lancé dans cette activation.
Le téléchargement des manifestes est contrôlé séparément pour chaque plateforme. Le parcours
visuel complet sur téléphone reste à vérifier avec un compte client du site AAVIE.

La connexion mobile de production reste réservée aux comptes clients. La protection de connexion
à deux facteurs des administrateurs du site n'a pas été remplacée par une connexion mobile sans
second facteur. Un compte uniquement Supabase doit se reconnecter avec un compte client du site.

## Contrat utilisé

| Route relative à l'API             | Usage                                                  |
| ---------------------------------- | ------------------------------------------------------ |
| `GET /ai/conversations.php`        | Liste complète des conversations                       |
| `GET /ai/conversation.php?id=…`    | Conversation et messages dans l'ordre serveur          |
| `PATCH /ai/conversation.php?id=…`  | Renommage, corps `{title}`                             |
| `DELETE /ai/conversation.php?id=…` | Suppression                                            |
| `GET /credits.php`                 | Solde, attribution mensuelle et nom du forfait         |
| `POST /ai/chat.php`                | Corps `{question, conversation_id, client_message_id}` |

Le serveur vérifie la signature, l'émetteur, l'audience et l'expiration du jeton, retrouve le
compte du site et contrôle sa situation actuelle. Le Bearer est limité aux routes ci-dessus ;
un jeton invalide ne se rabat pas sur un cookie. Les appels web conservent leur protection CSRF.

Le mobile conserve la même clé lors d'un renvoi de la même question dans le fil ouvert.
Le serveur verrouille cette demande par compte avant tout débit et enregistre sa clé avec les
messages et le coût final dans une transaction. Un renvoi retrouve la conversation existante ;
une requête encore en cours reçoit 409. Une autre question reçoit une nouvelle clé.
La clé en mémoire ne survit pas à la fermeture du fil : après avoir quitté une demande dont
l'issue est incertaine, vérifier l'historique avant de poser à nouveau la question.

## Vérification

Mobile : `pnpm test:assistant`, `pnpm test:site-auth`, `pnpm typecheck`, `pnpm lint`.

Site : `php api/tests/mobile-assistant.test.php --database` vérifie les signatures et le
dédoublonnage dans une table MySQL temporaire, sans appel IA et sans modifier les comptes.
Ce test ne remplace pas la vérification du parcours sur appareil après déploiement.

## Correction de la connexion existante

Les appels du simulateur du 5 novembre à 21:11 ont reçu 401 sur les crédits et 419 sur l'envoi :
la session Supabase pouvait être ouverte dans l'application sans être transmise à l'API AAVIE.
Le client utilise désormais aussi cette session et bloque une question sans authentification.
Les refus de connexion affichent une reconnexion explicite ; le brouillon est conservé, et seule
une question déjà confirmée est renvoyée automatiquement après la reconnexion.

La compatibilité serveur des sessions historiques a été déployée le 5 novembre 2026 après
accord explicite. Le jeton est vérifié auprès du projet Supabase configuré, puis une liaison
existante vers un compte client AAVIE confirmé est exigée. Aucun rapprochement par e-mail ni
création automatique de compte n'est effectué. Les comptes administrateurs sont exclus de
cette compatibilité.

Vérification en production avec une session Supabase réelle : absence de liaison refusée (403),
compte client relié accepté (200), rôle administrateur refusé (403), question IA répondue (200),
renvoi de la même demande sans double débit. Les comptes temporaires ont été supprimés.
Sauvegardes serveur hors webroot : `aavie-api/.deploy/assistant-auth-20261105-01/backup/`.

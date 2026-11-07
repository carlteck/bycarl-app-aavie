# Audit UX : application mobile AAVIE

6 novembre 2026. Établi dans l'émulateur Android (Pixel 9a, build de développement, thème sombre),
connecté à un vrai compte du site, et à partir de la lecture de `src/`. Périmètre : application
mobile `bycarl-app-aavie` uniquement.

« Moderne » s'entend au sens des applications actuelles, conversationnelles et sans friction
(ChatGPT, Linear, Notion, Qonto, Alan) : rien à voir avec la blockchain.

## Diagnostic en une phrase

L'application donne l'impression d'être en chantier : la moitié des services affichent « Chargement
impossible » ou « Bientôt disponible », l'assistant — la raison de venir — est rangé dans un
sous-menu, et chaque écran empile sur-titre en capitales, titre, carte et seconde carte.

## Constats, du plus coûteux au moins coûteux

### 1. Des services qui ne marchent pas (cause technique, pas visuelle)

- **Coffre-fort, Support, Veille réglementaire** : « Chargement impossible — Ce service n'est pas
  encore disponible ». **Ressources et Annuaire** dépendent du même mécanisme (l'annuaire retombe
  sur une liste embarquée).
- Cause : ces écrans lisent des tables Supabase (`mobile_vault_documents`, `mobile_support_*`,
  `regulatory_news`, `resources`, `directory_contacts`) que rien n'alimente. Les vraies données
  sont sur le site.
- **Corrigé côté site le 6 novembre 2026** : l'API PHP accepte désormais le jeton de l'application
  sur ces routes (voir « Ce que l'API du site offre » dans le prompt). Il reste à brancher l'application.
- **Mes crédits** affiche « Les crédits et forfaits ne sont pas encore disponibles » alors que
  `credits.php` répond et que l'assistant affiche déjà le solde.
- **`/demarche`** affiche encore « Assistant administratif — Bientôt disponible sur mobile », alors
  que l'assistant fonctionne.
- **Services** liste « Aide rédactionnelle », qui n'existe plus sur le site (absorbée par l'assistant).
- Le coffre-fort annonce « L'ajout et le téléchargement de documents ne sont pas encore activés ».

### 2. L'assistant n'est pas au centre

- La barre basse propose Accueil / Services / Agenda / Compte : **pas d'onglet Assistant**.
- L'accueil montre un grand encart bleu avec un champ de question, mais la conversation elle-même
  vit dans Services → Assistant administratif, qui ouvre d'abord une **liste de conversations**.
- Pas de suggestions concrètes, pas de pièce jointe, pas de coût annoncé avant l'envoi, propositions
  d'action non confirmables (« leur validation reste sur le site »).

### 3. Une grammaire visuelle lourde et répétitive

- Sur-titres en capitales espacées sur presque chaque écran : « VOTRE QUOTIDIEN AVEC AAVIE »,
  « VOTRE ESPACE, À VOTRE RYTHME », « CHAQUE DATE COMPTE », « VOTRE QUOTIDIEN, SIMPLIFIÉ ».
- Titres doublés : « Connexion » puis une carte « Connexion à votre espace » ; « Créer mon compte »
  puis « Créer votre compte ». Une carte dans l'écran, un titre dans la carte.
- Grandes cartes colorées qui occupent la moitié de l'écran pour une seule information.

### 4. Des états contradictoires

- Planificateur : « Votre agenda est libre. » juste au-dessus de « 1 échéance est à vérifier » et
  d'un compteur « En retard · 1 ».
- Accueil : « 1 échéance passée à vérifier » puis « La suite est à vous. Aucune date à venir ».
- Notifications : la même échéance en retard figure dans « Alertes actives » et dans « Tous les
  rappels », l'une sous l'autre.
- Compte : « Synchronisation en cours… » affiché en permanence.

### 5. Connexion et inscription

- L'inscription est une seule page longue : type de compte, langue, prénom, nom, e-mail, mot de
  passe, consentement, puis un encart sur les crédits.
- Le champ mot de passe montre des points comme texte indicatif : on croit à un mot de passe déjà
  enregistré.
- L'encart « Des crédits offerts chaque mois » cite « l'aide rédactionnelle », qui n'existe plus.

### 6. Langues

- L'inscription propose cinq langues puis écrit « L'application reste en français pour l'instant ».
  Le multilingue est une exigence du cahier des charges, et le site est entièrement traduit.
- « Kréyòl » porte le drapeau de la Guyane, alors que le site propose le **créole haïtien** (`ht`).

### 7. Finitions mobiles

- Sur l'accueil, le contenu défile sous la barre d'état : le champ de question passe sur l'heure.
- Pas de retour haptique, pas de squelettes de chargement homogènes, pas de confirmation discrète
  après une action.

## Ce qui est bon et doit être gardé

- La charte (bleu d'action, turquoise de sélection, corail rare), le thème sombre, les zones sûres,
  les cibles tactiles de 48 points, la police système.
- La composition A de l'accueil public, validée par l'utilisateur le 5 septembre 2026.
- La dictée et la lecture à voix haute, la biométrie, la synchronisation hors ligne du planificateur
  et du budget, le consentement RGPD à l'inscription, l'authentification unifiée avec le site.
- Les garde-fous : rien n'est écrit sans confirmation, l'argent ne se modifie jamais depuis le mobile.

## Direction proposée

1. **Brancher les services sur l'API du site** et retirer tout « Bientôt disponible » devenu faux.
2. **L'assistant devient le premier onglet** : conversation plein écran, saisie en bas, suggestions,
   pièces jointes, coût annoncé, cartes d'action confirmables, historique accessible d'un geste.
3. **Une grammaire allégée** : un seul titre par écran, plus de sur-titres en capitales, moins de
   cartes, hiérarchie par la typographie.
4. **Des états justes et utiles** : jamais deux messages contradictoires, chaque état vide propose
   l'action suivante.
5. **Connexion et inscription courtes**, en vraies étapes.
6. **Retours immédiats** : squelettes, retour haptique, confirmations discrètes.
7. **Crédits lisibles** : solde et nombre estimé de questions restantes.
8. **Toute l'interface traduite** dans les cinq langues du site.

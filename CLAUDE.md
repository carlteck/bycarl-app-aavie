@AGENTS.md

# Projet : AAVIE (Assistant Administratif Virtuel Intelligent et Éducatif)

Application mobile/web (Expo) de simplification des démarches administratives.
Cahier des charges complet rédigé par Amanda GOMME (01/07/2024) — résumé ci-dessous pour guider le développement.

**Domaine officiel** : [aavieapp.com](https://aavieapp.com/). Utiliser ce domaine pour les liens
publics, les URL de retour d'authentification et les mentions produit.

**Nom de l'application** : AAVIE (`name` dans [app.config.ts](app.config.ts)). Toujours écrire **AAVIE en majuscules** dans les textes visibles, y compris la marque dans les en-têtes. Les URL, identifiants techniques et noms de fichiers conservent leur casse.

**Identifiants natifs** : `com.aavie.app` (`ios.bundleIdentifier` et `android.package`), décidé le
2026-09-04. Ils remplacent `fr.aavie.app`, dont les deux fiches de test ont été supprimées chez
Apple et Google. Un identifiant n'a pas besoin de correspondre à un domaine détenu : il doit
seulement être unique dans chaque store.

⚠️ **Ce choix est définitif.** Google Play réserve un nom de paquet **à vie** dès le premier envoi
d'un binaire : `fr.aavie.app` est désormais brûlé et ne pourra jamais être réutilisé, et
`com.aavie.app` le sera à son tour au premier dépôt. Ne jamais le modifier ensuite — cela
créerait une seconde application, sans les installations ni les avis de la première. Après tout
changement d'identifiant, régénérer les projets natifs (`expo prebuild --clean`) et prévoir de
nouveaux identifiants de signature côté EAS.

## Décisions utilisateur — 5 septembre 2026

- **Périmètre : application mobile uniquement**, dans `bycarl-app-aavie`, et son projet Supabase. Ne pas consulter ni modifier le site, sa base ou son serveur sans accord explicite préalable. La cohérence graphique avec le site n'autorise aucune intervention sur celui-ci.
- **Proposition A « L’essentiel » validée** pour l’accueil public. Référence : [directions-mobile.html](design/propositions/directions-mobile.html), variante A. L’utilisateur a refusé la simple recoloration et la longue liste de cartes uniformes : il veut une nouvelle composition moderne.
- **Accueil public distinct de l’espace utilisateur** : `/` présente AAVIE à tous ; seuls `/a-propos`, `/connexion` et `/inscription` sont également publics. Les services restent derrière l’authentification. Ne pas placer de services utilisables ni de données personnelles sur l’accueil public.
- **Composition A**, implémentée dans [src/app/index.tsx](src/app/index.tsx) : petit logo officiel et lien « À propos », illustration native de deux cartes décalées sur un disque turquoise doux, titre « Moins de papiers. Plus de sérénité. », description courte, mention Guyane. Un seul bouton plein « Créer mon compte » et un lien « Déjà un compte ? Se connecter ». Aucun catalogue de huit cartes sur cette page.
- Le titre éditorial de cet accueil utilise une taille spécifique (33–38), distincte des titres fonctionnels des autres écrans. Conserver la police système, le thème sombre, les zones sûres, les cibles tactiles de 48 points minimum et le défilement sur petit écran/grands caractères. L’illustration est décorative, masquée aux lecteurs d’écran et retirée aux très grandes tailles de texte.
- **Extension approuvée aux écrans connectés** : l’utilisateur a demandé de reprendre la direction A pour l’espace utilisateur. Les variantes B/C restent écartées. L’accueil connecté (`src/app/(tabs)/accueil.tsx`) présente une marque compacte, une salutation éditoriale, un encart bleu vers le planificateur, trois accès rapides et les échéances réelles. L’assistant indisponible est une ligne secondaire ; aucun rendez-vous ni compteur de démonstration.
- Le catalogue complet est dans `/services` (`src/app/services.tsx`), sous `Stack.Protected`, avec les trois groupes « Se faire aider », « M’organiser », « M’informer ». La navigation native conserve Accueil / Ressources / Annuaire / Compte.
- Les écrans Ressources, Annuaire, Compte et Planificateur reprennent la composition aérée, les titres éditoriaux, les surfaces turquoise douces et les arrondis de la direction A. Les échéances sont présentées en lignes avec un pavé date, via `reminder-row.tsx`, partagé avec les notifications. Les ressources indisponibles restent annoncées « En préparation » sans contenu fictif.
- **Authentification mobile actuelle : Supabase Auth**, via `signInWithPassword`, `signUp` et `onAuthStateChange` dans [auth-context.tsx](src/context/auth-context.tsx). Les utilisateurs sont dans `auth.users`. Les secrets ne doivent jamais être consignés ici. Un nom d’adresse contenant « admin » ne confère aucun privilège ; seul `app_metadata.role` est lu pour le rôle applicatif.
- Le retour de confirmation d’e-mail vers l’application reste à configurer : `localhost:3000` ne convient qu’au développement sur l’ordinateur. Ne pas le présenter comme un lien de retour mobile final.
- Les crédits et forfaits ne sont pas encore raccordés aux comptes Supabase ; l’écran mobile l’indique et n’appelle plus `credits.php`. Les données locales sont isolées par identifiant Supabase ; les anciens enregistrements sans propriétaire ne sont pas automatiquement attribués au premier compte connecté.

## Contexte et mission

- Public prioritaire : Guyane française et DROM-COM, confrontés à l'illectronisme, l'illettrisme et à l'isolement géographique face à une administration de plus en plus dématérialisée.
- Vocation : décomplexer l'administration, rendre les démarches accessibles à tous quel que soit le niveau numérique, et accompagner vers l'autonomie (pas de dépendance permanente à l'app).
- Ambition d'extension : France hexagonale (zones rurales, personnes âgées, situations de handicap), puis adaptation internationale.

## Public cible

- Particuliers, professionnels (TPE/indépendants), ressortissants étrangers, personnes en situation de handicap.

## Accessibilité (exigence transverse, à intégrer dès la conception, pas en option)

- **Handicap visuel** : compatibilité lecteurs d'écran (VoiceOver/TalkBack équivalents web NVDA/JAWS), synthèse vocale, contraste/taille de texte ajustables, navigation clavier complète.
- **Handicap auditif** : sous-titres/transcriptions, guides visuels/infographies, option langue des signes.
- **Motricité réduite** : compatibilité dispositifs d'assistance, commandes vocales, navigation simplifiée (cibles tactiles larges, parcours courts).
- **Troubles cognitifs/apprentissage** : UI épurée et linéaire, tutoriels pas-à-pas, pictogrammes, bouton « besoin d'aide » toujours visible.

## Modules fonctionnels clés

1. **Assistant administratif** — accompagnement IA/humain pas-à-pas, rappels d'échéances, tutoriels interactifs.
2. **Veille technique et informationnelle** — suivi des évolutions législatives (locales, DROM-COM, nationales).
3. **Outil de sauvegarde** — coffre-fort documentaire, sync cloud.
4. **Aide rédactionnelle** — modèles de lettres/documents, assistance IA à la rédaction.
5. **Planificateur administratif** — calendrier, alertes, échéances.
6. **Gestion de budget** — suivi revenus/dépenses, spécificités indépendants/cotisations/impôts locaux.
7. **Centre de ressources** — guides, vidéos, espace communautaire/questions à des experts.
8. **Annuaire administratif** — services locaux/nationaux/internationaux avec contact direct.

## Contraintes techniques

- **Multilingue** : français, anglais, portugais créole, espagnol.
- **Sécurité** : chiffrement des données personnelles, authentification forte (biométrie).
- **Multiplateforme** : mobile + web (cohérent avec la stack Expo actuelle, voir [AGENTS.md](AGENTS.md)).
- **Personnalisation** : interface adaptable par utilisateur (fonctionnalités mises en avant selon ses besoins).

## Charte graphique

Charte mobile officielle : [docs/charte-graphique-aavie-mobile.pdf](docs/charte-graphique-aavie-mobile.pdf) (v1.0, août 2026) — **source de vérité**, prévaut sur les captures CDC brutes plus anciennes dans [docs/](docs/) (couleurs/rôles réorganisés pour mobile, ex. rouge corail volontairement écarté des CTA par défaut).

**Logo** : fichier vectoriel officiel de la charte fourni (pack `aavie-logo-final-v2`, sources SVG dans [docs/charte-source/svg/](docs/charte-source/svg/)) — anneau turquoise + bulle de dialogue corail souriante sur fond bleu profond plein (pas un dégradé — voir `aavie-icon-master.svg`), conforme à la description §03. Tous les exports PNG dans [assets/images/](assets/images/) sont régénérés depuis ce pack via ImageMagick/`rsvg-convert` (pas de dégradé simulé côté app) : `icon.png` (icône d'app iOS/Android/web, 1024×1024 opaque), `android-icon-background.png`/`android-icon-foreground.png`/`android-icon-monochrome.png` (icône adaptative Android — la monochrome est rendue depuis `aavie-mark-monochrome.svg` puis convertie en silhouette blanche sur transparent par extraction d'alpha), `favicon.png` (48×48), `splash-icon.png` et `aavie-logo-mark.png` (anneau + bulle complets, détourés, utilisés dans [page-header.tsx](src/components/page-header.tsx) sur l'écran d'accueil — **l'anneau turquoise fait désormais partie du PNG lui-même**, ne plus le simuler avec un fond en dégradé autour du mark), `play-store-icon-512.png` et `play-store-feature-graphic.png` (visuels de fiche Google Play, uploadés manuellement dans Play Console — aucun rapport avec le build). Le bundle Icon Composer par défaut d'Expo (`assets/expo.icon`, symbole "expo" générique) a été supprimé — `ios.icon` retombe sur l'`icon` top-level standard dans [app.json](app.json). Si une nouvelle version du pack est fournie, régénérer tous ces exports depuis les nouveaux SVG plutôt que de retoucher les PNG à la main.

**Hiérarchie fonctionnelle des couleurs** (voir [src/constants/theme.ts](src/constants/theme.ts) `Palette`/`Colors`, §02-03 du PDF) :

| Rôle              | Couleur                   | Usage                                                                                                    | Token                              |
| ----------------- | ------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Fond principal    | Blanc `#FFFFFF`           | Écrans, cartes, contenu (dominant)                                                                       | `background`                       |
| Texte principal   | Gris anthracite `#222222` | Paragraphes, informations essentielles                                                                   | `text`                             |
| Action principale | Bleu profond `#0E74C7`    | Boutons, navigation, liens                                                                               | `primary` (+ `primaryPressed`)     |
| Texte secondaire  | Gris moyen `#666666`      | Légendes, dates, métadonnées                                                                             | `textSecondary`                    |
| État sélectionné  | Bleu turquoise `#00E7C7`  | Identité, sélection, surfaces secondaires (badges, tags)                                                 | `turquoise` (+ `turquoisePressed`) |
| Accent            | Rouge corail `#E81E4E`    | Logo, badges, attention ponctuelle — **jamais un CTA par défaut** (évoque alerte/suppression sur mobile) | `accent` (+ `accentPressed`)       |

- `primary`/`accent`/`turquoise` sont des couleurs de marque fixes (identiques clair/sombre) ; chacune a une variante `*Pressed` plus foncée pour l'état pressé, via le pattern `type={pressed ? 'xPressed' : 'x'}` (voir `annuaire-entry-card.tsx`, `onboarding-screen.tsx`).
- **Composants de référence (§03 PDF)** : bouton plein `primary` = action principale (« Continuer ») ; bouton contour `primary` = action secondaire (« Plus tard », voir [src/components/outline-button.tsx](src/components/outline-button.tsx)) ; ne jamais coder une info uniquement par la couleur (toujours texte/icône associé).
- **Typographie (§04 PDF)** : police système uniquement pour le numérique (SF/Roboto, déjà en place) — Calibri/Open Sans réservés à l'imprimé. Échelle à 5 niveaux dans `TypeScale` ([src/constants/theme.ts](src/constants/theme.ts)) et `ThemedText` : `screenTitle` (24/gras), `sectionTitle` (18/gras), `body` (16/normal, défaut), `label` (14/demi-gras), `caption` (12/normal). `brand` (30/gras) est une exception hors charte réservée au seul logotype "AAVIE" texte.
- **Logo** : bulle de dialogue rouge corail souriante sur dégradé bleu turquoise → bleu profond. Zone de protection ≈ hauteur du sourire, jamais recoloré hors rouge corail, jamais sur fond à faible contraste ou chargé. Taille mini : 32px icône / 96px signature complète.
- **Accessibilité (§07 PDF)** : contraste ≥4.5:1 texte courant / ≥3:1 grand texte ; zones tactiles ≥44×44pt iOS / 48×48dp Android (voir `minHeight: 44` + `hitSlop` sur les boutons/liens compacts) ; prévoir repos/pressé/focus/sélectionné/désactivé/erreur ; jamais transmettre une info par la seule couleur ; noms explicites pour lecteurs d'écran.

### Système visuel (icônes, élévation, teintes)

Ajouté en session pour donner du relief/repérage visuel à l'interface (au-delà des couleurs/typo de la charte, déjà conformes) :

- **Icônes** : `@expo/vector-icons` (Ionicons), via [src/components/icon-chip.tsx](src/components/icon-chip.tsx) — pastille ronde colorée (`variant`: `primary` fond bleu plein/icône blanche, `turquoise` fond teinté clair/icône turquoise foncé, `coral` fond teinté clair/icône corail). **Piège rencontré une fois** : ne jamais utiliser `theme.background` comme couleur d'icône sur un fond `primary` — `background` vaut noir en thème sombre, l'icône blanche doit être `Palette.white` fixe. Les icônes par module/catégorie sont data-driven dans [src/constants/modules.ts](src/constants/modules.ts) et [src/constants/annuaire.ts](src/constants/annuaire.ts) (`icon`/`ANNUAIRE_CATEGORY_ICON`), pas codées en dur dans les composants.
- **Teintes atténuées** (`turquoiseTint`/`turquoiseTintText`/`coralTint` dans `Colors`) : fonds clairs + texte coloré foncé pour badges/chips/puces, distincts des couleurs de marque pleines (`turquoise`/`accent`) qui restent réservées aux éléments qui ont besoin d'un vrai contraste fort (ex. teinte du logo, indicateurs).
- **Cartes élevées** : fond `background` (blanc/noir) + bordure 1px `cardBorder` + ombre `CardShadow` (`src/constants/theme.ts`), remplace l'ancien remplissage plat `backgroundElement` sur `ModuleCard`/`AnnuaireEntryCard`/la carte compte de Profil.
- **Profil** restructuré en liste groupée façon Réglages ([src/components/list-row.tsx](src/components/list-row.tsx) : icône + libellé + chevron/switch) avec avatar (initiale) ; le rouge corail y est enfin utilisé à bon escient, sur la seule action destructive (« Réinitialiser mes données locales »).
- **Annuaire** : chips de filtre par catégorie (turquoise = sélectionné) — usage exact prévu par la charte pour le turquoise (« filtres, onglets, repères actifs »).
- Contrastes vérifiés (WCAG AA) : `turquoise` illisible avec texte blanc (~1.6:1) mais excellent avec texte anthracite (~10:1) → toujours texte foncé dessus. `primary` passe largement avec texte blanc (~4.8:1) → CTA principal par défaut. `accent` est tout juste sous le seuil AA en texte blanc petite taille (~4.4:1) → réservé à un usage rare et intentionnel (ex. futures notifications/rappels du Planificateur), pas de généralisation.

## Décisions d'architecture actées

### Supabase mobile et conservation hors ligne

Supabase Auth détient les comptes mobiles. Supabase héberge également les tables personnelles
synchronisées entre appareils pour le profil, les rappels et l’avancement des démarches. Le raccordement des crédits, des forfaits et
des contenus du site aux comptes mobiles n’est pas réalisé ; aucune session PHP du site ne
doit être réutilisée comme identité mobile.

Le schéma Supabase versionné vit dans `supabase/migrations/`. La migration initiale
`202609040001_initial_mobile_data.sql` crée :

| Table                       | Clé                                          | Contenu                                                                                        |
| --------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `mobile_profiles`           | `user_id UUID`                               | civilité, prénoms, nom de naissance, naissance, adresse, téléphone et e-mail de préremplissage |
| `mobile_reminders`          | `id UUID`, `user_id UUID`                    | titre, date, catégorie, activation des notifications, anticipation et suppression logique      |
| `mobile_procedure_progress` | `id UUID`, unicité `(user_id, procedure_id)` | étape courante, statut, valeurs du formulaire, documents cochés et suppression logique         |

Toutes les tables ont la RLS activée avec refus par défaut. Les politiques `select`, `insert`,
`update` et `delete` sont séparées et imposent `auth.uid() = user_id`. Le rôle `anon` n'a aucun
droit sur ces tables. `user_id` n'a pas encore de FK vers `auth.users` pour une raison
historique : un JWT tiers avait été envisagé. L'identité mobile retenue est désormais
Supabase Auth. Avant d'ajouter la FK, vérifier les éventuels propriétaires orphelins
et adapter les fixtures des tests ; ne pas supprimer automatiquement de données.

La comparaison du schéma local du site et des migrations mobiles est consignée dans
[supabase/SCHEMA_AUDIT.md](supabase/SCHEMA_AUDIT.md). L'inspection du 5 septembre 2026
était en lecture seule, sans accès à la base ni au serveur du site. Les ajouts proposés
ne sont pas encore créés. Ne pas confondre les dossiers clients `procedures` du site
avec le catalogue de démarches embarqué dans le mobile.

Le client mobile utilise `EXPO_PUBLIC_SUPABASE_URL` et
`EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. La clé publishable est conçue pour être exposée dans le
bundle ; aucune clé `service_role`, `sb_secret_...` ou secret de signature JWT ne doit entrer dans
le dépôt, `.env.local`, EAS ou `app.config.ts`.

Les tests pgTAP vivent dans `supabase/tests/database/initial_mobile_data.test.sql` et couvrent,
pour chacune des trois tables, une lecture autorisée et une insertion refusée pour un autre
utilisateur.

La migration `202609040002_restrict_rls_helper.sql` retire à `PUBLIC`, `anon` et `authenticated`
le droit d'exécuter la fonction administrative `public.rls_auto_enable()`. Cette fonction est
`SECURITY DEFINER` et ne doit jamais être appelable via `/rest/v1/rpc`; conserver cette révocation
si la fonction est recréée ou modifiée depuis le tableau de bord Supabase.

La table technique `sync_internal._sync_outbox` n'est pas une donnée applicative et n'est pas
exposée par la Data API. La migration `202609040003_explicitly_deny_sync_outbox.sql` lui ajoute
néanmoins quatre politiques explicites refusant `select`, `insert`, `update` et `delete` à `anon`
et `authenticated`. Le backend privilégié conserve son accès par contournement RLS ; ne jamais
ouvrir cette table au client mobile.

Côté appareil natif, `expo-sqlite` porte la copie immédiate et persistante. La table locale
`mobile_queue` garde une opération par donnée tant qu'elle n'a pas été acceptée par
Supabase. `expo-secure-store` est réservé aux sessions et réglages de sécurité, pas
au stockage métier. Les copies locales sont cloisonnées par identifiant utilisateur.

Le moteur est dans `src/lib/sync-engine.ts`, l'adaptateur Supabase dans `sync-remote.ts`
et le stockage dans `sync-store.native.ts` (SQLite) / `sync-store.ts` (localStorage web).
Les anciennes tables locales sont copiées une seule fois, sans effacer les originaux.
`mobile_cache` contient les données lues par les écrans ; `mobile_queue` les changements
non confirmés. Un acquittement ne retire que la révision effectivement envoyée.

`SyncProvider` lance un cycle après connexion, retour au premier plan, modification locale
(délai 700 ms) et toutes les 15 secondes au premier plan. Sur le web, l'événement `online`
déclenche aussi un cycle. Pas de tâche garantie en arrière-plan ni d'exécution app fermée.
Un cycle envoie les changements, puis relit les trois tables par pages de 500 lignes.
Les suppressions distantes sont répercutées ; un élément en attente locale est protégé.
Un changement de compte annule le cycle ; toutes les requêtes filtrent `user_id`.

Conflits entre appareils : la dernière écriture reçue par Supabase gagne pour un même
élément, sans fusion champ par champ entre appareils. Un appareil hors ligne peut donc
remplacer une version distante en envoyant sa modification ; ce choix est explicite.
L'annuaire et le catalogue de démarches restent embarqués : aucun contenu du site n'est
importé automatiquement. L'avancement personnel du formulaire, lui, est synchronisé.

Validation locale : `pnpm test:sync` (Node >= 22.13, SQLite réel via `node:sqlite`, transport
réseau simulé). Vérification du contrat distant :
`supabase/tests/synchronization.sql`, transaction avec données fictives et ROLLBACK.

- **Persistance** : comptes et sessions dans Supabase Auth ; données métier locales dans SQLite en natif, avec synchronisation bidirectionnelle des profils, rappels et avancements vers Supabase.
- **Authentification** : Supabase Auth, stockage de session via `expo-secure-store` en natif et `localStorage` en web. Le renouvellement suit l’état actif de l’application. Les inscriptions demandent une confirmation par e-mail lorsque le projet Supabase l’exige.
- **Ancienne couche PHP** : `src/lib/api.ts` subsiste mais ne pilote plus la connexion ni les crédits. Ne pas la réactiver sans décision explicite sur le raccordement des comptes.
- **Le jeton vit dans le Keychain / Keystore** ([src/lib/supabase.ts](src/lib/supabase.ts)), jamais dans un stockage en clair sur natif. Repli `localStorage` sur web, moins sûr, comme partout ailleurs.
- **Quatre routes publiques, tout le reste protégé** — décalque de la structure du site :

  | Route mobile                     | Fichier                                               | Équivalent site                   |
  | -------------------------------- | ----------------------------------------------------- | --------------------------------- |
  | `/`                              | [src/app/index.tsx](src/app/index.tsx)                | `/` `LandingPage.tsx`             |
  | `/a-propos`                      | [src/app/a-propos.tsx](src/app/a-propos.tsx)          | _(nouveau, contenu issu du CDC)_  |
  | `/connexion`                     | [src/app/connexion.tsx](src/app/connexion.tsx)        | `/connexion` `LoginPage.tsx`      |
  | `/inscription`                   | [src/app/inscription.tsx](src/app/inscription.tsx)    | `/inscription` `RegisterPage.tsx` |
  | `/accueil` + onglets, `/credits` | `src/app/(tabs)/`, [credits.tsx](src/app/credits.tsx) | `/espace/*`                       |

- **Le gardiennage passe par `Stack.Protected`** ([src/app/_layout.tsx](src/app/_layout.tsx)), mécanisme officiel d'Expo Router (doc « Authentication »). `guard={!isAuthenticated}` / `guard={isAuthenticated}` : quand la session bascule, Expo Router redirige seul. **Ne pas remplacer par un `router.replace` dans un effect** — les effects ne s'exécutent pas au rendu serveur web, la page ressortirait vide. Aucun écran de connexion ne navigue à la main après un succès.
- ⚠️ **`/` appartient à la zone publique, l'accueil de l'app est `/accueil`** (`(tabs)/accueil.tsx`). Deux fichiers ne peuvent pas revendiquer `/`. Le trigger `NativeTabs` et la barre web ([app-tabs.tsx](src/components/app-tabs.tsx), [app-tabs.web.tsx](src/components/app-tabs.web.tsx)) pointent sur `accueil` — les trois doivent rester cohérents.
- **Crédits** : le quota « questions par jour » a été remplacé par un solde dépensé par action, côté serveur (`api/src/Credits.php` dans `site_aavie`). L'app lit `credits.php` et affiche solde, grille tarifaire et historique. ⚠️ **Aucun achat de crédits dans l'application** : un pack vendu ici serait un _consumable in-app purchase_ au sens d'Apple — achat in-app obligatoire, 15 à 30 % de commission, et interdiction de mentionner un paiement web. Tant que la question n'est pas tranchée, l'écran consomme et affiche, il ne vend pas.
- ⚠️ **Historique, à ne pas rétablir par erreur** : jusqu'au 2026-09-03 l'app fonctionnait en local pur, sans backend, avec un code PIN optionnel et la règle « ne verrouille JAMAIS au lancement » au nom de l'accessibilité du public en illectronisme (CDC §1-2). Olivier a tranché pour le compte obligatoire aligné sur le site. Le compromis d'accessibilité qui subsiste : `/` et `/a-propos` expliquent le service avant toute création de compte, et l'inscription est courte et annulable à tout moment. La biométrie reste disponible en confort, plus comme identifiant.
- **Pas d'état `loading` bloquant dans `AuthProvider`** ([src/context/auth-context.tsx](src/context/auth-context.tsx)) : `welcome` est l'état initial synchrone (pas un état dérivé d'un `useEffect`), et c'est aussi le bon contenu statique puisque c'est la page publique. **Piège rencontré** : un statut initial `'loading'` qui ne se résout que dans un `useEffect` ne se résout jamais pendant le rendu serveur web (les effects ne s'exécutent pas en SSR) — `AuthGate` rendait alors `null`, donc une page vide. `hasAccount`/`displayName`/biométrie se peuplent de façon asynchrone après le premier rendu, sans le bloquer. **`AuthGate` ne doit jamais rendre `null`, quelle que soit la branche.**

## Publication : builds, envoi aux stores et mises à jour OTA

Un seul workflow, [`.eas/workflows/production-builds.yml`](.eas/workflows/production-builds.yml),
déclenché par un **push sur `main`** (le travail courant se fait sur `develop`). Il prend l'un ou
l'autre chemin selon le **message de commit** :

| message de commit | ce qui se passe                                                                                                |
| ----------------- | -------------------------------------------------------------------------------------------------------------- |
| sans `[OTA]`      | builds iOS + Android en profil `production`, puis envoi vers TestFlight et la piste **interne** de Google Play |
| avec `[OTA]`      | `eas update` sur le canal `production`, sans aucun build                                                       |

Le déclencheur est le message de commit et non une branche, parce que la question n'est pas
« quel code » mais « ce changement touche-t-il le natif » — seule la personne qui écrit le commit
le sait, et elle le sait au moment de l'écrire.

⚠️ **Le marqueur doit OUVRIR le message**, pas y apparaître : la condition est `startsWith`, pas
`contains`. `github.commit_message` contient le message entier, corps compris — avec `contains`,
un commit qui se contente de _mentionner_ `[OTA]`, ne serait-ce que pour l'expliquer, saute les
builds et publie une mise à jour. C'est arrivé au commit qui a introduit ce workflow : son corps
décrivait les deux chemins, le mot a suffi.

⚠️ **`runtimeVersion` est en politique `fingerprint`**, pas `appVersion`. EAS calcule une empreinte
des dépendances natives et de la configuration : une mise à jour OTA n'atteint que les binaires
réellement compatibles. Conséquence à connaître — un commit `[OTA]` qui ajoute une dépendance
native, modifie un plugin de configuration ou monte de SDK **publie une mise à jour que personne
ne reçoit**, en silence, jusqu'au prochain build. C'est délibérément un silence plutôt qu'un
plantage : avec `appVersion`, ce même commit aurait livré du JavaScript à un binaire dépourvu du
code natif correspondant, et l'application se serait fermée au démarrage chez l'usager.

⚠️ **Les builds antérieurs au 5 septembre 2026 ne recevront jamais d'OTA** : ils ont été produits
sans canal ni `runtimeVersion`. Le premier build fait après cette configuration est celui qui
ouvre la voie ; ceux d'avant ne peuvent être mis à jour que par un nouveau binaire.

**Le canal vit dans `eas.json`** (`channel: "production"` sur le profil de build), pas dans
`app.config.ts` : un même code doit pouvoir alimenter `production` et `preview` selon le profil.

### Ce que la soumission automatique exige, et qui ne s'automatise pas

- ✅ **Premiers dépôts manuels faits sur les deux stores le 5 septembre 2026.** Google Play refuse
  son API tant qu'un premier AAB n'a pas été déposé à la main dans la Play Console : ce verrou est
  levé, il n'y a pas à y revenir. Le mentionner ici parce qu'un `submit_android` en échec ferait
  sinon suspecter ce point en premier, à tort.
- **Une clé de compte de service Google** doit être enregistrée côté EAS (`eas credentials -p android`).
  Elle ne doit jamais entrer dans le dépôt — même règle que les secrets Supabase.
- ⚠️ **Une clé d'API App Store Connect doit exister côté EAS — c'est ce qui a fait échouer le
  premier envoi iOS**, le 5 septembre 2026. Le build réussissait, l'`.ipa` se téléchargeait,
  l'identifiant de lot était bien lu, et l'étape `prepare_asc_api_key` s'arrêtait sur
  « eas-cli failed to resolve submission config ». Un workflow ne peut pas créer cette clé : il
  faut la déclarer une fois, en interactif, depuis un poste connecté au compte Apple :

  ```bash
  eas submit --platform ios --latest    # crée la clé si absente, ET envoie le dernier build
  # ou, sans rien envoyer :
  eas credentials -p ios                # → App Store Connect API Key → Set up
  ```

  Les deux jobs d'envoi portent `EXPO_DEBUG: '1'` : sans lui, le message d'échec ne dit ni quelle
  clé manque ni pourquoi, et EAS invite lui-même à l'activer.

- `ascAppId` vaut **`6808865116`** (identifiant Apple de la fiche, relevé dans App Store Connect).
  L'UGS `AAVIE-IOS-001` et l'identifiant de lot `com.aavie.app` n'ont pas leur place ici.

⚠️ **iOS ne « soumet » pas à la revue.** `eas submit` dépose le binaire sur App Store Connect,
donc dans TestFlight. Le passage en revue reste un geste manuel — c'est voulu, et c'est ce qui
évite qu'un push sur `main` déclenche une publication publique.

La piste Android est **`internal`** délibérément : le build atteint les testeurs internes en
quelques minutes sans revue Google, et la promotion vers `production` reste un geste manuel. Un
`track: "production"` ferait de chaque push sur `main` une mise en ligne pour tous les usagers,
avec un retour arrière qui se compte en heures.

## Notes de conception

- Toute nouvelle fonctionnalité doit être pensée accessibilité-first (voir section ci-dessus), pas ajoutée après coup.
- Le projet vise l'autonomisation de l'utilisateur, pas la dépendance : privilégier des parcours pédagogiques (tutoriels, explications) plutôt que des raccourcis qui masquent la démarche administrative réelle.
- État actuel du dépôt (2026-09-05) :
  - **Compte mobile Supabase** : inscription, connexion, restauration de session et déconnexion via Supabase Auth. Aucun compte partagé automatiquement avec le site.
  - **Zone publique routée** : `/` (accueil), `/a-propos`, `/connexion`, `/inscription`. Tout le reste est derrière `Stack.Protected`.
  - **Crédits** : écran explicatif ; les crédits et forfaits ne sont pas encore raccordés aux comptes mobiles Supabase.
  - **Annuaire administratif** ([src/app/(tabs)/annuaire.tsx](<src/app/(tabs)/annuaire.tsx>)) : module abouti — recherche, filtres par catégorie, appel téléphonique, site web, itinéraire. ⚠️ Données encore **en dur** dans [src/constants/annuaire.ts](src/constants/annuaire.ts) alors que `contacts.php` existe côté API : à rebrancher.
  - **Planificateur et Notifications** ([planificateur.tsx](src/app/planificateur.tsx), [notifications.tsx](src/app/notifications.tsx)) : écrans réels ; rappels persistés dans SQLite et synchronisés avec Supabase. ⚠️ **Aucune notification n'est réellement planifiée** : `expo-notifications` n'est pas installé, l'écran ne fait que lister.
  - **Assistant démarches** ([src/app/demarche/](src/app/demarche/)) : assistant pas-à-pas avec préremplissage, mais **sans IA** — 351 lignes de démarches en dur dans [src/constants/procedures.ts](src/constants/procedures.ts). Le vrai assistant IA (`ai/chat.php`, facturé en crédits) n'est pas branché.
  - **Profil civil** ([user-profile-context.tsx](src/context/user-profile-context.tsx)) : persisté dans SQLite et synchronisé avec `mobile_profiles` dans Supabase.
  - Pas encore implémenté : assistant IA, aide rédactionnelle, veille réglementaire, centre de ressources, gestion de budget, coffre-fort, multilingue.
  - Composants de démo du starter Expo (hint-row, collapsible, web-badge, external-link, l'export `AnimatedIcon` inutilisé) supprimés — plus aucune trace de l'app Expo par défaut dans `src/`.

### Correction des déclencheurs Supabase mobiles

La migration `202609050001_fix_mobile_outbox_triggers.sql` corrige les trois fonctions
`sync_internal._sync_outbox_fn_mobile_*` lorsqu’elles existent. Leur exécution sous le
rôle utilisateur faisait échouer toutes les écritures autorisées par la RLS personnelle,
car le journal technique refuse volontairement les écritures du client. Les déclencheurs
s’exécutent désormais avec les droits de leur propriétaire (`postgres` sur le projet lié),
avec `search_path` vide et sans droit d’exécution directe pour `PUBLIC`, `anon` ou
`authenticated`. Ne pas ouvrir la table `_sync_outbox` aux utilisateurs pour contourner
ce problème. Si un outil recrée ces déclencheurs, revérifier ce contrat.

### Correctif Expo Router 57.0.19 — lien initial natif

`patches/expo-router@57.0.19.patch`, déclaré dans `pnpm-workspace.yaml`, diffère la
notification du lien initial jusqu’au montage et ignore une résolution après démontage.
Le code livré appelait `onUnhandledLinking` depuis une promesse créée pendant le rendu,
ce qui déclenchait « state update on a component that hasn't mounted yet » sur Android.
Le calcul de l’état de navigation reste inchangé. Ne pas masquer cet avertissement avec
LogBox ; vérifier ce patch avant toute mise à jour d’Expo Router.
Test : `pnpm test:router` (résolution avant/après montage, démontage, URL synchrone,
rendu abandonné). Après application du patch, redémarrer Metro avec `pnpm start --clear`.

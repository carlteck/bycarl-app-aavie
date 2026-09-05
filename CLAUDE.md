@AGENTS.md

# Projet : AAVIE (Assistant Administratif Virtuel Intelligent et Éducatif)

Application mobile/web (Expo) de simplification des démarches administratives.
Cahier des charges complet rédigé par Amanda GOMME (01/07/2024) — résumé ci-dessous pour guider le développement.

**Domaine officiel** : [aavieapp.com](https://aavieapp.com/). Utiliser ce domaine pour les liens
publics, les URL de retour d'authentification et les mentions produit.

**Nom de l'application** : AAVIE (`name` dans [app.config.ts](app.config.ts)).

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

**Logo** : fichier vectoriel officiel de la charte fourni (pack `aavie-logo-final-v2`, sources SVG dans [docs/charte-source/svg/](docs/charte-source/svg/)) — anneau turquoise + bulle de dialogue corail souriante sur fond bleu profond plein (pas un dégradé — voir `aavie-icon-master.svg`), conforme à la description §03. Tous les exports PNG dans [assets/images/](assets/images/) sont régénérés depuis ce pack via ImageMagick/`rsvg-convert` (pas de dégradé simulé côté app) : `icon.png` (icône d'app iOS/Android/web, 1024×1024 opaque), `android-icon-background.png`/`android-icon-foreground.png`/`android-icon-monochrome.png` (icône adaptative Android — la monochrome est rendue depuis `aavie-mark-monochrome.svg` puis convertie en silhouette blanche sur transparent par extraction d'alpha), `favicon.png` (48×48), `splash-icon.png` et `aavie-logo-mark.png` (anneau + bulle complets, détourés, utilisés dans [gradient-header.tsx](src/components/gradient-header.tsx) sur l'écran d'accueil — **l'anneau turquoise fait désormais partie du PNG lui-même**, ne plus le simuler avec un fond en dégradé autour du mark), `play-store-icon-512.png` et `play-store-feature-graphic.png` (visuels de fiche Google Play, uploadés manuellement dans Play Console — aucun rapport avec le build). Le bundle Icon Composer par défaut d'Expo (`assets/expo.icon`, symbole "expo" générique) a été supprimé — `ios.icon` retombe sur l'`icon` top-level standard dans [app.json](app.json). Si une nouvelle version du pack est fournie, régénérer tous ces exports depuis les nouveaux SVG plutôt que de retoucher les PNG à la main.

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
- **Bandeau d'en-tête en dégradé** ([src/components/gradient-header.tsx](src/components/gradient-header.tsx)) : dégradé `primary`→`primaryPressed` + deux cercles décoratifs flous (motif repris de la couverture de la charte PDF) + panneau vitré (glass) pour le titre — texte toujours sur fond quasi-opaque, jamais directement sur le dégradé/flou. **Piège rencontré** : `expo-linear-gradient`/`expo-blur` sont des vues natives qui ne se rendent pas en SSR web (le rendu serveur d'Expo Router web ressort vide) — variante `.web.tsx` obligatoire en CSS pur (`experimental_backgroundImage` + `backdropFilter`) pour ces deux composants et pour la barre d'onglets web ([src/components/app-tabs.web.tsx](src/components/app-tabs.web.tsx)).
- **Mise en page bento** : dans [src/components/section-screen.tsx](src/components/section-screen.tsx), le premier module de chaque section s'affiche en carte "vedette" pleine largeur (`ModuleCard` `variant="feature"`), les suivants en paires de cartes compactes (`variant="compact"`) — hiérarchie visuelle par la taille plutôt qu'une pile uniforme.
- **Raffinements de passe (conformité aux maquettes cibles validées)** : dans [src/components/module-card.tsx](src/components/module-card.tsx) (+ [module-card.web.tsx](src/components/module-card.web.tsx)), la carte vedette utilise le token `backgroundElement` (déjà existant, pas de nouvelle couleur) au lieu de `background` pour se distinguer visuellement des cartes compactes, plus un reflet subtil en haut (`LinearGradient` blanc→transparent en natif, `experimental_backgroundImage` en web — même piège SSR que `gradient-header.web.tsx`, variante `.web.tsx` obligatoire). Dans [gradient-header.tsx](src/components/gradient-header.tsx)/[.web.tsx](src/components/gradient-header.web.tsx), les cercles décoratifs du bandeau sont passés de ronds nets à une lueur atmosphérique : deux cercles superposés à opacité dégressive en natif (pas de `filter` CSS disponible côté vues natives), un vrai flou CSS (`filter: blur()`) en web. Le dégradé de fond du bandeau reste `primary`→`primaryPressed` (pas turquoise→bleu comme le dégradé du logo) : un dégradé incluant du turquoise sous le texte "AAVIE" blanc casserait le contraste (turquoise + texte blanc ≈ 1.6:1, sous le seuil AA) — la touche turquoise de la maquette cible est déjà apportée par le cercle décoratif, pas par le fond plein.

## Décisions d'architecture actées

### Supabase mobile et conservation hors ligne

Supabase détient uniquement les données personnelles qui bénéficient d'une synchronisation entre
appareils. MySQL reste l'unique propriétaire des comptes, forfaits, crédits, facturation, audit,
RGPD, conversations IA, catalogue de démarches et contenus éditoriaux. L'API ByCarl maintient le
miroir serveur nécessaire hors mobile ; ce miroir ne doit jamais devenir une seconde source
modifiable du grand livre de crédits.

Le schéma Supabase versionné vit dans `supabase/migrations/`. La migration initiale
`202609040001_initial_mobile_data.sql` crée :

| Table                       | Clé                                          | Contenu                                                                                        |
| --------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `mobile_profiles`           | `user_id UUID`                               | civilité, prénoms, nom de naissance, naissance, adresse, téléphone et e-mail de préremplissage |
| `mobile_reminders`          | `id UUID`, `user_id UUID`                    | titre, date, catégorie, activation des notifications, anticipation et suppression logique      |
| `mobile_procedure_progress` | `id UUID`, unicité `(user_id, procedure_id)` | étape courante, statut, valeurs du formulaire, documents cochés et suppression logique         |

Toutes les tables ont la RLS activée avec refus par défaut. Les politiques `select`, `insert`,
`update` et `delete` sont séparées et imposent `auth.uid() = user_id`. Le rôle `anon` n'a aucun
droit sur ces tables. `user_id` n'a volontairement pas encore de FK vers `auth.users` : il doit
pouvoir correspondre soit à un compte Supabase Auth, soit au `sub` d'un JWT reconnu par Supabase
et émis par ByCarl. Ne figer cette FK qu'après décision définitive sur l'identité.

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
`sync_outbox` garde une opération idempotente par donnée tant qu'elle n'a pas été acceptée par
Supabase. `expo-secure-store` est réservé aux jetons et à la migration des anciennes données, pas
au stockage métier. Les copies locales sont cloisonnées par identifiant utilisateur.

- **Persistance hybride** : l'API PHP partagée avec le site reste propriétaire du compte, des
  forfaits et des crédits. Supabase porte le profil civil, les rappels et l'avancement personnel
  des démarches ; SQLite en conserve la copie hors ligne et l'outbox sur l'appareil. Le catalogue
  des démarches et les contenus éditoriaux restent servis par l'API PHP.
- **Authentification : compte serveur partagé avec le site.** Plus aucun compte local, plus de code PIN : l'application parle à la même API PHP que le site (dépôt `site_aavie`), avec les mêmes endpoints `login.php`, `register.php`, `me.php`, `logout.php`. Un compte créé dans l'application fonctionne sur le site et inversement, et le solde de crédits est le même des deux côtés. `register.php` écrit le rôle en dur à `'client'` côté serveur : il n'est jamais lu depuis la requête.
- **Couche réseau** : [src/lib/api.ts](src/lib/api.ts), pendant mobile du `src/lib/api.ts` du site. Base d'URL dans `EXPO_PUBLIC_API_URL`. Deux mécanismes cohabitent volontairement : `Authorization: Bearer <jeton>` dès qu'un jeton est stocké, `credentials: 'include'` sinon. **Le jeton porteur est la cible** — le cookie `aavie_session` a `lifetime => 0` et sa survie au redémarrage de l'app n'est garantie par aucun contrat iOS/Android ; en attendant que l'API l'émette, la session par cookie fonctionne sur natif. Le jour de la bascule, rien ne change côté app. `NetworkError` est distinct d'`ApiError` : un réseau mobile qui tombe n'est pas un refus du serveur.
- **Le jeton vit dans le Keychain / Keystore** ([src/lib/session-storage.ts](src/lib/session-storage.ts)), jamais dans un stockage en clair sur natif. Repli `localStorage` sur web, moins sûr, comme partout ailleurs.
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

## Notes de conception

- Toute nouvelle fonctionnalité doit être pensée accessibilité-first (voir section ci-dessus), pas ajoutée après coup.
- Le projet vise l'autonomisation de l'utilisateur, pas la dépendance : privilégier des parcours pédagogiques (tutoriels, explications) plutôt que des raccourcis qui masquent la démarche administrative réelle.
- État actuel du dépôt (2026-09-04) :
  - **Compte serveur partagé avec le site** : inscription, connexion, déconnexion et profil passent par l'API PHP ([src/lib/api.ts](src/lib/api.ts), [src/context/auth-context.tsx](src/context/auth-context.tsx)). Plus de compte local ni de code PIN — `auth-storage.ts`, `pin-pad.tsx`, `lock-screen.tsx`, `onboarding-screen.tsx` et `confirm-reset.ts` ont été supprimés.
  - **Zone publique routée** : `/` (accueil), `/a-propos`, `/connexion`, `/inscription`. Tout le reste est derrière `Stack.Protected`.
  - **Crédits** ([src/app/credits.tsx](src/app/credits.tsx)) : solde, grille tarifaire et historique lus dans `credits.php`, accessibles depuis l'onglet Profil qui affiche le solde en pastille. Écran en lecture seule, aucun achat (voir la note Apple/Google plus haut).
  - **Annuaire administratif** ([src/app/(tabs)/annuaire.tsx](<src/app/(tabs)/annuaire.tsx>)) : module abouti — recherche, filtres par catégorie, appel téléphonique, site web, itinéraire. ⚠️ Données encore **en dur** dans [src/constants/annuaire.ts](src/constants/annuaire.ts) alors que `contacts.php` existe côté API : à rebrancher.
  - **Planificateur et Notifications** ([planificateur.tsx](src/app/planificateur.tsx), [notifications.tsx](src/app/notifications.tsx)) : écrans réels ; rappels persistés dans SQLite avec une outbox prête pour Supabase. ⚠️ La vidange distante attend encore le contrat d'identité/JWT et **aucune notification n'est réellement planifiée** : `expo-notifications` n'est pas installé, l'écran ne fait que lister.
  - **Assistant démarches** ([src/app/demarche/](src/app/demarche/)) : assistant pas-à-pas avec préremplissage, mais **sans IA** — 351 lignes de démarches en dur dans [src/constants/procedures.ts](src/constants/procedures.ts). Le vrai assistant IA (`ai/chat.php`, facturé en crédits) n'est pas branché.
  - **Profil civil** ([user-profile-context.tsx](src/context/user-profile-context.tsx)) : persisté dans SQLite avec une outbox prête pour `mobile_profiles` dans Supabase ; la vidange distante attend le contrat d'identité/JWT.
  - Pas encore implémenté : assistant IA, aide rédactionnelle, veille réglementaire, centre de ressources, gestion de budget, coffre-fort, multilingue.
  - Composants de démo du starter Expo (hint-row, collapsible, web-badge, external-link, l'export `AnimatedIcon` inutilisé) supprimés — plus aucune trace de l'app Expo par défaut dans `src/`.

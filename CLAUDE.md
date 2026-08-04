@AGENTS.md

# Projet : AAVIE (Assistant Administratif Virtuel Intelligent et Éducatif)

Application mobile/web (Expo) de simplification des démarches administratives.
Cahier des charges complet rédigé par Amanda GOMME (01/07/2024) — résumé ci-dessous pour guider le développement.

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

Charte mobile officielle : [docs/charte-graphique-aavie-mobile.pdf](docs/charte-graphique-aavie-mobile.pdf) (v1.0, août 2026) — **source de vérité**, prévaut sur les captures CDC brutes plus anciennes dans [docs/](docs/) (couleurs/rôles réorganisés pour mobile, ex. rouge corail volontairement écarté des CTA par défaut). **Le fichier source du logo n'a pas été fourni** — icône d'app et splash screen utilisent encore les assets Expo par défaut.

**Hiérarchie fonctionnelle des couleurs** (voir [src/constants/theme.ts](src/constants/theme.ts) `Palette`/`Colors`, §02-03 du PDF) :

| Rôle | Couleur | Usage | Token |
|---|---|---|---|
| Fond principal | Blanc `#FFFFFF` | Écrans, cartes, contenu (dominant) | `background` |
| Texte principal | Gris anthracite `#222222` | Paragraphes, informations essentielles | `text` |
| Action principale | Bleu profond `#0E74C7` | Boutons, navigation, liens | `primary` (+ `primaryPressed`) |
| Texte secondaire | Gris moyen `#666666` | Légendes, dates, métadonnées | `textSecondary` |
| État sélectionné | Bleu turquoise `#00E7C7` | Identité, sélection, surfaces secondaires (badges, tags) | `turquoise` (+ `turquoisePressed`) |
| Accent | Rouge corail `#E81E4E` | Logo, badges, attention ponctuelle — **jamais un CTA par défaut** (évoque alerte/suppression sur mobile) | `accent` (+ `accentPressed`) |

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

- **Persistance : locale uniquement pour l'instant** (pas de backend serveur). Les données de compte utilisent `expo-secure-store` sur natif (Keychain/Keystore) avec repli sur `window.localStorage` sur web (voir [src/lib/auth-storage.ts](src/lib/auth-storage.ts) — web est donc moins sécurisé qu'iOS/Android tant qu'aucun backend n'est branché). À réévaluer si le projet passe à un vrai compte multi-appareils (ex. Supabase/Firebase envisagés mais non retenus pour l'instant).
- **Authentification : optionnelle, et ne verrouille JAMAIS l'app au lancement** — profil local + code PIN à 4 chiffres, hashé (SHA-256 salé via `expo-crypto`) avant stockage, avec option de déverrouillage biométrique (`expo-local-authentication`, Face ID/Touch ID). Pas de compte serveur, pas de mot de passe classique. **Important : le CDC (§6-7) demande l'authentification pour protéger la confidentialité des données personnelles, pas un péage à l'entrée de l'app** — imposer un compte ou un code avant tout accès contredirait la mission d'accessibilité/autonomisation (§1-2, public en illectronisme). Piège déjà rencontré une fois : une version précédente ne verrouillait au démarrage que si un profil existait déjà (ex. profil créé en test) — **ne jamais réintroduire cette variante** : `unlocked` doit rester l'état de démarrage **systématique**, qu'un profil existe ou non. Le verrouillage (`locked`) n'est atteignable que par une action explicite en session (bouton "Verrouiller" dans Profil) et ne doit jamais persister d'un lancement à l'autre. La création de profil est une action volontaire depuis l'onglet Profil, à réserver pour protéger de futures données sensibles (documents, budget).
- **Pas d'état `loading` bloquant dans `AuthProvider`** ([src/context/auth-context.tsx](src/context/auth-context.tsx)) : `unlocked` est l'état initial synchrone (pas un état dérivé d'un `useEffect`). **Piège rencontré** : un statut initial `'loading'` qui ne se résout que dans un `useEffect` ne se résout jamais pendant le rendu serveur web (les effects ne s'exécutent pas en SSR) — `AuthGate` rendait alors `null`, donc une page vide. `hasAccount`/`displayName`/biométrie se peuplent de façon asynchrone après le premier rendu, sans le bloquer.

## Notes de conception

- Toute nouvelle fonctionnalité doit être pensée accessibilité-first (voir section ci-dessus), pas ajoutée après coup.
- Le projet vise l'autonomisation de l'utilisateur, pas la dépendance : privilégier des parcours pédagogiques (tutoriels, explications) plutôt que des raccourcis qui masquent la démarche administrative réelle.
- État actuel du dépôt :
  - **Authentification locale, optionnelle** ([src/context/auth-context.tsx](src/context/auth-context.tsx)) : gate dans [src/app/_layout.tsx](src/app/_layout.tsx) — `unlocked` est **toujours** l'état de démarrage (accès libre aux 4 onglets, profil ou non), y compris si l'initialisation du profil échoue (lecture protégée par `try/catch`, jamais de blocage sur l'écran de chargement). `locked` (déverrouillage PIN/biométrie, [src/components/lock-screen.tsx](src/components/lock-screen.tsx), avec option « Code oublié ? ») n'est atteint que par une action explicite (« Verrouiller » dans Profil), jamais au lancement. `onboarding` (création profil + PIN, [src/components/onboarding-screen.tsx](src/components/onboarding-screen.tsx), avec bouton Annuler et gestion d'erreur si la création échoue) se lance uniquement depuis l'onglet Profil, à la demande. Gestion du compte (verrouiller, activer biométrie, réinitialiser) dans l'onglet Profil.
  - **Annuaire administratif** ([src/app/annuaire.tsx](src/app/annuaire.tsx)) : module pleinement fonctionnel — liste/recherche d'organismes avec appel téléphonique et lien vers site web. Données de démonstration dans [src/constants/annuaire.ts](src/constants/annuaire.ts) (à terme : brancher une source officielle type api-lannuaire.service-public.fr).
  - **Accueil, Ressources, Profil** : squelette de navigation affichant les modules CDC restants sous forme de cartes « Bientôt disponible » via [src/components/section-screen.tsx](src/components/section-screen.tsx) et [src/constants/modules.ts](src/constants/modules.ts).
  - Pas encore implémenté : IA (Assistant, Aide rédactionnelle), Veille légale, Planificateur, Gestion de budget, coffre-fort documentaire, multilingue, paiement/abonnements.
  - Composants de démo du starter Expo (hint-row, collapsible, web-badge, external-link, l'export `AnimatedIcon` inutilisé) supprimés — plus aucune trace de l'app Expo par défaut dans `src/`.

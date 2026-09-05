# Comparaison du schéma mobile et du site — 5 septembre 2026

Inspection en lecture seule de `site_aavie/api/database/schema.sql` et des migrations
locales. Aucun accès à la base du site ni à son serveur. Le schéma local ne prouve
pas l'état de la base de production.

L'historique distant du projet mobile `swbesgzgrbsfukvgosgc` confirme les migrations
`202609040001`, `202609040002` et `202609040003`. Cela confirme leur application,
pas l'absence de modifications manuelles ultérieures du schéma.

## Correspondances

| Besoin                                 | Site MySQL                                                                  | Mobile Supabase / suite proposée                                                                                                        |
| -------------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Authentification                       | `users`, sessions PHP                                                       | `auth.users` ; ne pas copier les mots de passe ni supposer des UUID communs                                                             |
| Profil personnel                       | `user_profiles`                                                             | `mobile_profiles` existe ; compléter seulement les champs utilisés par le mobile                                                        |
| Profil entreprise                      | `company_profiles`                                                          | Prévoir `mobile_company_profiles` lorsque le formulaire entreprise est raccordé                                                         |
| Échéances                              | `deadlines`                                                                 | `mobile_reminders` existe ; brancher la synchronisation SQLite/Supabase                                                                 |
| Démarches                              | `procedures`, `procedure_steps` : dossiers affectés à un client             | `mobile_procedure_progress` existe ; son `procedure_id` est un identifiant texte du catalogue embarqué, pas l'UUID d'un dossier du site |
| Budget                                 | `budget_entries`                                                            | Prévoir `mobile_budget_entries` : propriétaire, libellé, montant décimal, revenu/dépense, catégorie, date                               |
| Courriers                              | `redaction_drafts`                                                          | Prévoir `mobile_redaction_drafts` : propriétaire, mode, titre, formulaire JSON, contenu                                                 |
| Contenus éditoriaux                    | `resources`, `directory_contacts`, `regulatory_news`, `redaction_templates` | Décider d'abord de la source de publication commune ; une copie sans synchronisation divergerait du site                                |
| Assistant IA                           | `ai_conversations`, `ai_messages`                                           | Historique privé ; écritures des réponses et consommation réservées au backend, contrôle du propriétaire avant chaque appel             |
| Crédits et forfaits                    | `plans`, `credit_ledger`, `credit_actions`, `credit_grants`                 | Contrat serveur nécessaire : attribution et débit atomiques, jamais de modification du solde par le client                              |
| Paiements                              | `payments`, `subscriptions`, `invoices`, tables prestataires                | Dépend de l'intégration de paiement mobile ; ne pas recopier les secrets des prestataires                                               |
| Coffre-fort                            | `documents`, tables de dossiers cloud                                       | Métadonnées et fichiers externes ; choisir le stockage mobile avant de créer un second système documentaire                             |
| Consentements et demandes personnelles | `legal_documents`, `user_consents`, `privacy_requests`                      | Versions des textes et preuves côté serveur ; notes administratives non exposées au client                                              |

## Ordre de réalisation proposé

1. Vérifier le schéma Supabase effectif (colonnes, contraintes, politiques), puis
   brancher la synchronisation des trois tables existantes. La présence des tables
   ne suffit pas : l'application conserve encore les données localement.
2. Préparer les tables personnelles budget, brouillons et entreprise avec leurs
   écrans consommateurs. Utiliser `auth.users(id)` comme identité ; pour les tables
   existantes, rechercher les éventuels propriétaires orphelins avant d'ajouter une FK.
3. Définir comment les contenus administrés sur le site arrivent dans l'application.
   Cette intégration est une décision distincte ; l'autorisation d'inspecter le
   schéma local n'autorise pas une modification du site ou de son serveur.
4. Raccorder IA, crédits et documents avec leurs fonctions serveur et règles métier.

## Contrat de sécurité des futures migrations

- Données personnelles : RLS activée, aucune permission pour `anon`, opérations
  limitées à `auth.uid() = user_id`, y compris après modification du propriétaire.
- Contenus publiés : lecture selon le périmètre produit (services réservés aux
  utilisateurs connectés), édition réservée au backend privilégié.
- Identité : aucun rôle déduit de l'adresse e-mail ou des métadonnées modifiables
  par l'utilisateur. Aucun rattachement automatique d'un compte MySQL par e-mail.
- Synchronisation : conversion explicite des noms de champs locaux vers SQL,
  suppressions logiques transmises, index compatibles avec la lecture des suppressions,
  règle de résolution des conflits et reprise idempotente à définir.
- Validation : tester deux propriétaires distincts, l'accès anonyme, le changement
  de propriétaire et les opérations interdites sur les crédits/contenus.

Aucune nouvelle migration n'est appliquée par cet audit. Aucune donnée du site
n'est importée. Les noms de tables proposés ci-dessus ne désignent pas des tables
déjà créées.

## Mise en œuvre après l’audit

La synchronisation des profils, rappels et avancements est désormais branchée dans
l’application : voir `CLAUDE.md` pour le déclenchement, les conflits et les limites.
Le schéma distant des trois tables a été vérifié par lecture d’`information_schema`.
Cette étape réutilise les tables existantes. Une migration corrige les droits des
déclencheurs internes qui bloquaient les écritures personnelles ; elle ne crée pas les tables proposées
pour les futurs modules et ne raccorde pas les contenus éditoriaux du site.

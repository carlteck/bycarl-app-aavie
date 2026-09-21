-- Droits du rôle service_role sur les tables synchronisées avec le site AAVIE.
--
-- La migration initiale n'accorde ces tables qu'à `authenticated` (et retire tout à `anon`) : le
-- rôle `service_role` contourne la RLS, mais pas les privilèges SQL, et n'en a AUCUN ici. Le site
-- (API PHP, clé service_role côté serveur uniquement) reçoit donc « permission denied » (42501)
-- dès qu'il lit ou écrit ces tables.
--
-- Moindre privilège : le site écrit dans `mobile_profiles` et `mobile_reminders` et supprime en
-- douceur (`deleted_at`). DELETE n'est là que pour l'effacement RGPD d'un compte, qui doit aussi
-- vider `mobile_procedure_progress` (lecture et suppression seulement, aucune écriture).
--
-- Aucune ouverture pour `anon` ni `authenticated` : les politiques RLS par propriétaire restent la
-- seule protection des données côté client mobile. Ce fichier est identique à ce que produit
-- `SupabaseSchema` côté site (version 1) ; les deux sont idempotents.

grant select, insert, update, delete on public.mobile_profiles to service_role;
grant select, insert, update, delete on public.mobile_reminders to service_role;
grant select, delete on public.mobile_procedure_progress to service_role;

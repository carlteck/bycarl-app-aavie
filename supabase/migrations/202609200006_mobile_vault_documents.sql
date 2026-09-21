-- Coffre-fort : MÉTADONNÉES des documents uniquement.
--
-- ⚠️ Le choix du stockage des fichiers n'est pas tranché (Supabase Storage, cloud de l'usager
-- comme sur le site, ou autre). Cette table ne contient JAMAIS le fichier : elle décrit un document
-- et pointe vers son emplacement (`storage_provider` + `remote_ref`). Aucun bucket ni politique de
-- stockage n'est créé ici : ils viendront avec la décision, et la table n'aura pas à changer.
-- Le fichier lui-même ne doit pas être stocké dans PostgreSQL.

create table public.mobile_vault_documents (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (length(trim(title)) between 1 and 190),
  category text not null default 'autre'
    check (category in ('identite', 'logement', 'famille', 'sante', 'travail', 'fiscalite', 'autre')),
  mime_type text not null check (length(mime_type) <= 120),
  size_bytes bigint not null check (size_bytes >= 0),
  storage_provider text not null check (storage_provider in ('supabase_storage', 'external')),
  -- Chemin dans le bucket ou identifiant chez le fournisseur externe ; jamais une URL signée
  -- (elle expire et ne doit pas être conservée).
  remote_ref text check (length(remote_ref) <= 500),
  transfer_status text not null default 'pending'
    check (transfer_status in ('pending', 'available', 'failed')),
  expires_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index mobile_vault_documents_user_idx
  on public.mobile_vault_documents (user_id, created_at desc)
  where deleted_at is null;

create trigger mobile_vault_documents_set_updated_at
before update on public.mobile_vault_documents
for each row execute function public.set_updated_at();

alter table public.mobile_vault_documents enable row level security;
revoke all on public.mobile_vault_documents from anon, authenticated;

grant select on public.mobile_vault_documents to authenticated;
grant insert (
  id, user_id, title, category, mime_type, size_bytes, storage_provider, remote_ref
) on public.mobile_vault_documents to authenticated;
-- Suppression logique seulement : supprimer la ligne laisserait le fichier orphelin.
grant update (title, category, expires_on, transfer_status, remote_ref, deleted_at)
  on public.mobile_vault_documents to authenticated;
grant select, insert, update, delete on public.mobile_vault_documents to service_role;

create policy mobile_vault_documents_select_own
on public.mobile_vault_documents for select to authenticated
using ((select auth.uid()) = user_id);

create policy mobile_vault_documents_insert_own
on public.mobile_vault_documents for insert to authenticated
with check ((select auth.uid()) = user_id and transfer_status = 'pending');

create policy mobile_vault_documents_update_own
on public.mobile_vault_documents for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

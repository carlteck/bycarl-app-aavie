-- Budget personnel : opérations de revenus et de dépenses.
--
-- ⚠️ Cette table EXISTE DÉJÀ sur le projet Supabase lié : elle a été créée par le site
-- (SupabaseSchema, version 2) pour synchroniser `budget_entries` (MySQL). Elle n'était pas versionnée
-- dans ce dépôt. Cette migration en est la copie fidèle, entièrement idempotente : rejouée sur le
-- projet existant elle ne change rien, sur un projet neuf elle crée la même table. Toute évolution
-- de colonne doit rester alignée avec le registre du site, sous peine de dérive détectée là-bas.
--
-- Montants : `numeric(10,2)` en euros, toujours positifs ; le sens est porté par `type`.
-- Suppression logique (`deleted_at`) comme pour les autres tables personnelles synchronisées.

create table if not exists public.mobile_budget_entries (
  id uuid primary key,
  user_id uuid not null,
  label text not null check (length(trim(label)) between 1 and 190),
  amount numeric(10,2) not null,
  type text not null check (type in ('income', 'expense')),
  category text not null check (length(trim(category)) between 1 and 60),
  entry_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists mobile_budget_entries_user_updated_idx
  on public.mobile_budget_entries (user_id, updated_at desc)
  where deleted_at is null;

drop trigger if exists mobile_budget_entries_set_updated_at on public.mobile_budget_entries;
create trigger mobile_budget_entries_set_updated_at
before update on public.mobile_budget_entries
for each row execute function public.set_updated_at();

alter table public.mobile_budget_entries enable row level security;

revoke all on public.mobile_budget_entries from anon;
grant select, insert, update, delete on public.mobile_budget_entries to authenticated;
grant select, insert, update, delete on public.mobile_budget_entries to service_role;

drop policy if exists mobile_budget_entries_select_own on public.mobile_budget_entries;
create policy mobile_budget_entries_select_own
on public.mobile_budget_entries for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists mobile_budget_entries_insert_own on public.mobile_budget_entries;
create policy mobile_budget_entries_insert_own
on public.mobile_budget_entries for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists mobile_budget_entries_update_own on public.mobile_budget_entries;
create policy mobile_budget_entries_update_own
on public.mobile_budget_entries for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists mobile_budget_entries_delete_own on public.mobile_budget_entries;
create policy mobile_budget_entries_delete_own
on public.mobile_budget_entries for delete to authenticated
using ((select auth.uid()) = user_id);

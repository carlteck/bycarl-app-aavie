create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.mobile_profiles (
  user_id uuid primary key,
  civility text check (civility in ('madame', 'monsieur', 'autre')),
  first_names text,
  birth_name text,
  birth_date date,
  birth_place text,
  address_line1 text,
  postal_code text,
  city text,
  phone text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.mobile_profiles is
  'Profil civil détenu par Supabase pour permettre le préremplissage hors ligne et la synchronisation entre appareils mobiles.';

create table public.mobile_reminders (
  id uuid primary key,
  user_id uuid not null,
  title text not null check (length(trim(title)) between 1 and 190),
  due_date date not null,
  category text not null check (
    category in ('Identité', 'Famille', 'Logement', 'Emploi', 'Social', 'Véhicule', 'Fiscalité', 'Étranger')
  ),
  notifications_enabled boolean not null default true,
  lead_days integer not null default 0 check (lead_days between 0 and 365),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

comment on table public.mobile_reminders is
  'Échéances personnelles détenues par Supabase car elles doivent rester modifiables hors ligne et se synchroniser entre appareils.';

create table public.mobile_procedure_progress (
  id uuid primary key,
  user_id uuid not null,
  procedure_id text not null check (length(trim(procedure_id)) between 1 and 100),
  status text not null default 'in_progress' check (status in ('in_progress', 'completed', 'abandoned')),
  current_step text not null default 'overview' check (current_step in ('overview', 'documents', 'form', 'summary')),
  form_values jsonb not null default '{}'::jsonb check (jsonb_typeof(form_values) = 'object'),
  checked_documents jsonb not null default '{}'::jsonb check (jsonb_typeof(checked_documents) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (user_id, procedure_id)
);

comment on table public.mobile_procedure_progress is
  'Avancement personnel détenu par Supabase pour reprendre une démarche hors ligne ou sur un autre appareil; le catalogue éditorial reste dans MySQL.';

create index mobile_reminders_user_updated_idx
  on public.mobile_reminders (user_id, updated_at desc)
  where deleted_at is null;

create index mobile_procedure_progress_user_updated_idx
  on public.mobile_procedure_progress (user_id, updated_at desc)
  where deleted_at is null;

create trigger mobile_profiles_set_updated_at
before update on public.mobile_profiles
for each row execute function public.set_updated_at();

create trigger mobile_reminders_set_updated_at
before update on public.mobile_reminders
for each row execute function public.set_updated_at();

create trigger mobile_procedure_progress_set_updated_at
before update on public.mobile_procedure_progress
for each row execute function public.set_updated_at();

alter table public.mobile_profiles enable row level security;
alter table public.mobile_reminders enable row level security;
alter table public.mobile_procedure_progress enable row level security;

revoke all on public.mobile_profiles from anon;
revoke all on public.mobile_reminders from anon;
revoke all on public.mobile_procedure_progress from anon;

grant select, insert, update, delete on public.mobile_profiles to authenticated;
grant select, insert, update, delete on public.mobile_reminders to authenticated;
grant select, insert, update, delete on public.mobile_procedure_progress to authenticated;

create policy mobile_profiles_select_own
on public.mobile_profiles for select to authenticated
using ((select auth.uid()) = user_id);

create policy mobile_profiles_insert_own
on public.mobile_profiles for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy mobile_profiles_update_own
on public.mobile_profiles for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy mobile_profiles_delete_own
on public.mobile_profiles for delete to authenticated
using ((select auth.uid()) = user_id);

create policy mobile_reminders_select_own
on public.mobile_reminders for select to authenticated
using ((select auth.uid()) = user_id);

create policy mobile_reminders_insert_own
on public.mobile_reminders for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy mobile_reminders_update_own
on public.mobile_reminders for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy mobile_reminders_delete_own
on public.mobile_reminders for delete to authenticated
using ((select auth.uid()) = user_id);

create policy mobile_procedure_progress_select_own
on public.mobile_procedure_progress for select to authenticated
using ((select auth.uid()) = user_id);

create policy mobile_procedure_progress_insert_own
on public.mobile_procedure_progress for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy mobile_procedure_progress_update_own
on public.mobile_procedure_progress for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy mobile_procedure_progress_delete_own
on public.mobile_procedure_progress for delete to authenticated
using ((select auth.uid()) = user_id);

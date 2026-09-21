-- Assistant administratif : historique des conversations et solde de crédits affiché.
--
-- ⚠️ Aucune clé d'IA dans l'application. Les réponses viennent d'une fonction serveur sécurisée
-- (Supabase Edge Function, `assistant-chat`, NON écrite ici) qui, avec `service_role` :
--   1. vérifie le jeton de l'usager et son solde de crédits ;
--   2. crée la conversation au premier message ;
--   3. écrit le message de l'usager ET la réponse de l'assistant ;
--   4. débite les crédits côté site (le grand livre reste au site, jamais copié en écriture).
-- Le mobile LIT ses conversations, peut renommer ou supprimer les siennes, et n'INSÈRE JAMAIS de
-- message : sans cela un client pourrait fabriquer de faux échanges passés pour orienter le modèle
-- (même règle que `ai/chat.php` côté site, qui relit l'historique en base).
--
-- Conservation : le site purge ses conversations après 12 mois (choix RGPD). La même durée doit
-- s'appliquer ici ; la purge (tâche planifiée ou fonction) reste à mettre en place.

create table public.mobile_assistant_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default 'Nouvelle conversation'
    check (length(trim(title)) between 1 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);

create table public.mobile_assistant_messages (
  -- Entier auto-incrémenté et non UUID : c'est lui qui donne l'ordre des messages, `created_at`
  -- seul ne départage pas deux messages écrits dans la même transaction.
  id bigint generated always as identity primary key,
  conversation_id uuid not null
    references public.mobile_assistant_conversations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (length(content) between 1 and 20000),
  created_at timestamptz not null default now()
);

-- Projection en LECTURE SEULE du solde tenu par le site. Une seule ligne par usager.
create table public.mobile_credit_balances (
  user_id uuid primary key references auth.users (id) on delete cascade,
  balance integer not null default 0,
  monthly_allowance integer not null default 0 check (monthly_allowance >= 0),
  plan_label text check (length(plan_label) <= 80),
  refreshed_at timestamptz not null default now()
);

comment on table public.mobile_credit_balances is
  'Copie affichable du solde de crédits. La source de vérité est le grand livre du site ; cette table ne doit jamais être modifiable par le client.';

create index mobile_assistant_conversations_user_idx
  on public.mobile_assistant_conversations (user_id, last_message_at desc);
create index mobile_assistant_messages_conversation_idx
  on public.mobile_assistant_messages (conversation_id, id);

create trigger mobile_assistant_conversations_set_updated_at
before update on public.mobile_assistant_conversations
for each row execute function public.set_updated_at();

alter table public.mobile_assistant_conversations enable row level security;
alter table public.mobile_assistant_messages enable row level security;
alter table public.mobile_credit_balances enable row level security;

revoke all on public.mobile_assistant_conversations from anon, authenticated;
revoke all on public.mobile_assistant_messages from anon, authenticated;
revoke all on public.mobile_credit_balances from anon, authenticated;

grant select, delete on public.mobile_assistant_conversations to authenticated;
grant update (title) on public.mobile_assistant_conversations to authenticated;
grant select on public.mobile_assistant_messages to authenticated;
grant select on public.mobile_credit_balances to authenticated;

grant select, insert, update, delete on public.mobile_assistant_conversations to service_role;
grant select, insert, delete on public.mobile_assistant_messages to service_role;
grant select, insert, update on public.mobile_credit_balances to service_role;

create policy mobile_assistant_conversations_select_own
on public.mobile_assistant_conversations for select to authenticated
using ((select auth.uid()) = user_id);

create policy mobile_assistant_conversations_rename_own
on public.mobile_assistant_conversations for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy mobile_assistant_conversations_delete_own
on public.mobile_assistant_conversations for delete to authenticated
using ((select auth.uid()) = user_id);

create policy mobile_assistant_messages_select_own
on public.mobile_assistant_messages for select to authenticated
using ((select auth.uid()) = user_id);

create policy mobile_credit_balances_select_own
on public.mobile_credit_balances for select to authenticated
using ((select auth.uid()) = user_id);

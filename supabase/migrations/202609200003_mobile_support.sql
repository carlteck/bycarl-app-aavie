-- Support : demandes d'aide de l'usager et fil de messages.
--
-- Données PERSONNELLES, propres à l'usager : chacun ne voit que ses demandes (RLS).
-- Ce que le mobile peut faire : ouvrir une demande, y répondre, la clore.
-- Ce qu'il ne peut PAS faire : écrire un message « équipe », modifier un sujet ou un message déjà
-- envoyé (l'historique est le seul justificatif d'un échange), rouvrir une demande close.
-- Les réponses de l'équipe et les statuts `pending` / `resolved` sont écrits côté serveur
-- (`service_role`, depuis le site) : le site reste propriétaire du traitement des demandes.
--
-- `user_id` porte une clé étrangère vers `auth.users` avec suppression en cascade : effacer un
-- compte (RGPD) efface ses demandes. Les tables personnelles plus anciennes n'en ont pas, pour une
-- raison historique documentée dans CLAUDE.md ; ce n'est pas un modèle à recopier.

create table public.mobile_support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  subject text not null check (length(trim(subject)) between 3 and 150),
  category text not null default 'autre'
    check (category in ('compte', 'demarche', 'paiement', 'technique', 'autre')),
  status text not null default 'open'
    check (status in ('open', 'pending', 'resolved', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);

comment on table public.mobile_support_tickets is
  'Demandes de support de l''usager mobile. open = ouverte, pending = en attente de sa réponse, resolved = résolue, closed = close (définitif).';

create table public.mobile_support_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.mobile_support_tickets (id) on delete cascade,
  -- Propriétaire de la DEMANDE, y compris pour un message de l'équipe : c'est ce qui permet à
  -- l'usager de lire les réponses sans jointure dans la politique.
  user_id uuid not null references auth.users (id) on delete cascade,
  author_role text not null default 'user' check (author_role in ('user', 'staff')),
  body text not null check (length(trim(body)) between 1 and 4000),
  created_at timestamptz not null default now()
);

create index mobile_support_tickets_user_activity_idx
  on public.mobile_support_tickets (user_id, last_message_at desc);

create index mobile_support_messages_ticket_created_idx
  on public.mobile_support_messages (ticket_id, created_at);

create trigger mobile_support_tickets_set_updated_at
before update on public.mobile_support_tickets
for each row execute function public.set_updated_at();

-- Une réponse de l'usager rouvre une demande en attente ou résolue et remonte la demande dans la
-- liste. SECURITY DEFINER : l'usager n'a volontairement aucun droit d'écriture sur ces colonnes.
create or replace function public.mobile_support_touch_ticket()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.mobile_support_tickets
  set last_message_at = new.created_at,
      status = case
        when new.author_role = 'user' and status in ('pending', 'resolved') then 'open'
        else status
      end
  where id = new.ticket_id;
  return new;
end;
$$;

revoke all on function public.mobile_support_touch_ticket() from public, anon, authenticated;

create trigger mobile_support_messages_touch_ticket
after insert on public.mobile_support_messages
for each row execute function public.mobile_support_touch_ticket();

alter table public.mobile_support_tickets enable row level security;
alter table public.mobile_support_messages enable row level security;

revoke all on public.mobile_support_tickets from anon, authenticated;
revoke all on public.mobile_support_messages from anon, authenticated;

-- Privilèges par colonne : la RLS dit QUELLES lignes, ceci dit QUELS champs.
grant select on public.mobile_support_tickets to authenticated;
grant insert (id, user_id, subject, category) on public.mobile_support_tickets to authenticated;
grant update (status) on public.mobile_support_tickets to authenticated;

grant select on public.mobile_support_messages to authenticated;
grant insert (id, ticket_id, user_id, body) on public.mobile_support_messages to authenticated;

grant select, insert, update on public.mobile_support_tickets to service_role;
grant select, insert on public.mobile_support_messages to service_role;

create policy mobile_support_tickets_select_own
on public.mobile_support_tickets for select to authenticated
using ((select auth.uid()) = user_id);

create policy mobile_support_tickets_insert_own
on public.mobile_support_tickets for insert to authenticated
with check ((select auth.uid()) = user_id and status = 'open');

-- Clore seulement : une demande close est définitive, l'usager en ouvre une nouvelle.
create policy mobile_support_tickets_close_own
on public.mobile_support_tickets for update to authenticated
using ((select auth.uid()) = user_id and status <> 'closed')
with check ((select auth.uid()) = user_id and status in ('open', 'closed'));

create policy mobile_support_messages_select_own
on public.mobile_support_messages for select to authenticated
using ((select auth.uid()) = user_id);

create policy mobile_support_messages_insert_own
on public.mobile_support_messages for insert to authenticated
with check (
  (select auth.uid()) = user_id
  and author_role = 'user'
  and exists (
    select 1
    from public.mobile_support_tickets ticket
    where ticket.id = ticket_id
      and ticket.user_id = (select auth.uid())
      and ticket.status <> 'closed'
  )
);

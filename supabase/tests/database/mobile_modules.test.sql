-- Contrat RLS des tables des modules mobiles : budget, support, catalogues, assistant, coffre-fort.
-- À lancer avec `supabase test db` (exige Docker et la pile Supabase locale).
begin;

create extension if not exists pgtap with schema extensions;
select plan(34);

-- Deux comptes : A est l'usager connecté, B est « l'autre ».
insert into auth.users (id, email) values
  ('a0000000-0000-4000-8000-000000000001', 'a@test.invalid'),
  ('b0000000-0000-4000-8000-000000000002', 'b@test.invalid');

insert into public.mobile_budget_entries (id, user_id, label, amount, type, category, entry_date) values
  ('a1000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Salaire A', 1500.00, 'income', 'Salaire', '2026-09-01'),
  ('b1000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000002', 'Salaire B', 1200.00, 'income', 'Salaire', '2026-09-01');

insert into public.mobile_support_tickets (id, user_id, subject, status) values
  ('a2000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Demande ouverte A', 'open'),
  ('a2000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'Demande close A', 'closed'),
  ('a2000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'Demande en attente A', 'pending'),
  ('b2000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000002', 'Demande B', 'open');

insert into public.mobile_support_messages (id, ticket_id, user_id, author_role, body) values
  ('a3000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'user', 'Message A'),
  ('b3000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000002', 'user', 'Message B');

insert into public.regulatory_news (id, title, description, tag, published_date) values
  ('c1000000-0000-4000-8000-000000000001', 'Actualité', 'Texte', 'Guyane', '2026-09-01');
insert into public.resources (id, title, category, description, duration_label) values
  ('c2000000-0000-4000-8000-000000000001', 'Guide', 'Logement', 'Texte', '5 min');
insert into public.directory_contacts (id, name, category) values
  ('c3000000-0000-4000-8000-000000000001', 'CAF', 'National');
insert into public.mobile_manual_sections (id, title, is_published) values
  ('c4000000-0000-4000-8000-000000000001', 'Chapitre publié', true),
  ('c4000000-0000-4000-8000-000000000002', 'Chapitre en préparation', false);

insert into public.mobile_assistant_conversations (id, user_id, title) values
  ('a5000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Conversation A'),
  ('b5000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000002', 'Conversation B');
insert into public.mobile_assistant_messages (conversation_id, user_id, role, content) values
  ('a5000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'user', 'Bonjour');
insert into public.mobile_credit_balances (user_id, balance, monthly_allowance) values
  ('a0000000-0000-4000-8000-000000000001', 120, 200),
  ('b0000000-0000-4000-8000-000000000002', 5, 200);

insert into public.mobile_vault_documents (id, user_id, title, mime_type, size_bytes, storage_provider) values
  ('a6000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Passeport A', 'application/pdf', 1000, 'external'),
  ('b6000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000002', 'Passeport B', 'application/pdf', 1000, 'external');

-- Le déclencheur agit quel que soit le rôle : on le vérifie d'abord, en tant que propriétaire.
insert into public.mobile_support_messages (ticket_id, user_id, author_role, body)
values ('a2000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'user', 'Je réponds');
select is(
  (select status from public.mobile_support_tickets where id = 'a2000000-0000-4000-8000-000000000003'),
  'open',
  'une réponse de l’usager rouvre une demande en attente'
);
insert into public.mobile_support_messages (ticket_id, user_id, author_role, body)
values ('a2000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'staff', 'Réponse tardive');
select is(
  (select status from public.mobile_support_tickets where id = 'a2000000-0000-4000-8000-000000000002'),
  'closed',
  'un message ne rouvre jamais une demande close'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', 'a0000000-0000-4000-8000-000000000001', true);

-- Budget
select results_eq(
  $$select label from public.mobile_budget_entries order by label$$,
  $$values ('Salaire A'::text)$$,
  'budget : un usager lit ses opérations et pas celles d’un autre'
);
select throws_ok(
  $$insert into public.mobile_budget_entries (id, user_id, label, amount, type, category, entry_date) values ('b1000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000002', 'Interdit', 1, 'expense', 'x', '2026-09-02')$$,
  '42501', null, 'budget : pas d’opération au nom d’un autre'
);

-- Support
select results_eq(
  $$select subject from public.mobile_support_tickets order by subject$$,
  $$values ('Demande close A'::text), ('Demande en attente A'::text), ('Demande ouverte A'::text)$$,
  'support : un usager ne voit que ses demandes'
);
select lives_ok(
  $$insert into public.mobile_support_tickets (id, user_id, subject, category) values ('a2000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 'Besoin d’aide', 'technique')$$,
  'support : un usager ouvre une demande'
);
select throws_ok(
  $$insert into public.mobile_support_tickets (id, user_id, subject) values ('b2000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000002', 'Au nom de B')$$,
  '42501', null, 'support : pas de demande au nom d’un autre'
);
select throws_ok(
  $$insert into public.mobile_support_tickets (id, user_id, subject, status) values ('a2000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000001', 'Déjà résolue', 'resolved')$$,
  '42501', null, 'support : le statut initial ne se choisit pas'
);
select lives_ok(
  $$insert into public.mobile_support_messages (id, ticket_id, user_id, body) values ('a3000000-0000-4000-8000-000000000002', 'a2000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Suite')$$,
  'support : un usager répond sur sa demande'
);
select throws_ok(
  $$insert into public.mobile_support_messages (ticket_id, user_id, author_role, body) values ('a2000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'staff', 'Faux message de l’équipe')$$,
  '42501', null, 'support : un usager ne peut pas écrire au nom de l’équipe'
);
select throws_ok(
  $$insert into public.mobile_support_messages (ticket_id, user_id, body) values ('b2000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Chez B')$$,
  '42501', null, 'support : pas de message sur la demande d’un autre'
);
select throws_ok(
  $$insert into public.mobile_support_messages (ticket_id, user_id, body) values ('a2000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'Sur une demande close')$$,
  '42501', null, 'support : pas de message sur une demande close'
);
select results_eq(
  $$select body from public.mobile_support_messages order by body$$,
  $$values ('Je réponds'::text), ('Message A'::text), ('Réponse tardive'::text), ('Suite'::text)$$,
  'support : l’usager lit son fil, y compris les réponses de l’équipe, jamais celui d’un autre'
);
select throws_ok(
  $$update public.mobile_support_tickets set subject = 'Modifié' where id = 'a2000000-0000-4000-8000-000000000001'$$,
  '42501', null, 'support : le sujet d’une demande ne se modifie pas'
);
select lives_ok(
  $$update public.mobile_support_tickets set status = 'closed' where id = 'a2000000-0000-4000-8000-000000000001'$$,
  'support : un usager clôt sa demande'
);
select is_empty(
  $$update public.mobile_support_tickets set status = 'open' where id = 'a2000000-0000-4000-8000-000000000002' returning id$$,
  'support : une demande close ne se rouvre pas'
);

-- Catalogues
select is(
  (select count(*) from public.regulatory_news), 1::bigint,
  'catalogues : un usager connecté lit la veille'
);
select throws_ok(
  $$insert into public.regulatory_news (id, title, description, tag, published_date) values ('c1000000-0000-4000-8000-000000000002', 'Faux', 'x', 'Guyane', '2026-09-02')$$,
  '42501', null, 'catalogues : un usager n’écrit pas dans la veille'
);
select throws_ok(
  $$update public.resources set title = 'Modifié'$$,
  '42501', null, 'catalogues : un usager ne modifie pas les ressources'
);
select throws_ok(
  $$delete from public.directory_contacts$$,
  '42501', null, 'catalogues : un usager ne supprime pas l’annuaire'
);
select results_eq(
  $$select title from public.mobile_manual_sections order by title$$,
  $$values ('Chapitre publié'::text)$$,
  'manuel : un chapitre non publié reste invisible'
);

-- Assistant
select results_eq(
  $$select title from public.mobile_assistant_conversations order by title$$,
  $$values ('Conversation A'::text)$$,
  'assistant : un usager ne voit que ses conversations'
);
select lives_ok(
  $$update public.mobile_assistant_conversations set title = 'Renommée' where id = 'a5000000-0000-4000-8000-000000000001'$$,
  'assistant : un usager renomme sa conversation'
);
select is_empty(
  $$update public.mobile_assistant_conversations set title = 'Piratée' where id = 'b5000000-0000-4000-8000-000000000002' returning id$$,
  'assistant : pas de renommage de la conversation d’un autre'
);
select throws_ok(
  $$insert into public.mobile_assistant_messages (conversation_id, user_id, role, content) values ('a5000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'assistant', 'Faux échange')$$,
  '42501', null, 'assistant : un usager ne fabrique pas de message'
);
select throws_ok(
  $$update public.mobile_credit_balances set balance = 999999$$,
  '42501', null, 'assistant : un usager ne modifie pas son solde'
);
select results_eq(
  $$select balance from public.mobile_credit_balances$$,
  $$values (120)$$,
  'assistant : un usager lit son solde et pas celui d’un autre'
);

-- Coffre-fort
select results_eq(
  $$select title from public.mobile_vault_documents order by title$$,
  $$values ('Passeport A'::text)$$,
  'coffre-fort : un usager ne voit que ses documents'
);
select throws_ok(
  $$insert into public.mobile_vault_documents (id, user_id, title, mime_type, size_bytes, storage_provider, transfer_status) values ('a6000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'Déjà disponible', 'application/pdf', 1, 'external', 'available')$$,
  '42501', null, 'coffre-fort : l’état initial d’un transfert ne se choisit pas'
);
select throws_ok(
  $$insert into public.mobile_vault_documents (id, user_id, title, mime_type, size_bytes, storage_provider) values ('b6000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000002', 'Chez B', 'application/pdf', 1, 'external')$$,
  '42501', null, 'coffre-fort : pas de document au nom d’un autre'
);

-- Anonyme : aucun accès, sur aucune de ces tables.
reset role;
set local role anon;
select throws_ok($$select 1 from public.regulatory_news$$, '42501', null, 'anonyme : pas de lecture de la veille');
select throws_ok($$select 1 from public.mobile_support_tickets$$, '42501', null, 'anonyme : pas de lecture du support');
select throws_ok($$select 1 from public.mobile_budget_entries$$, '42501', null, 'anonyme : pas de lecture du budget');
select throws_ok($$select 1 from public.mobile_vault_documents$$, '42501', null, 'anonyme : pas de lecture du coffre-fort');

select * from finish();
rollback;

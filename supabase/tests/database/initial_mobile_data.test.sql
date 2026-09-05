begin;

create extension if not exists pgtap with schema extensions;
select plan(6);

insert into public.mobile_profiles (user_id, first_names)
values
  ('10000000-0000-4000-8000-000000000001', 'Utilisateur A'),
  ('20000000-0000-4000-8000-000000000002', 'Utilisateur B');

insert into public.mobile_reminders (id, user_id, title, due_date, category)
values
  ('11000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'Rappel A', '2026-10-01', 'Identité'),
  ('22000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', 'Rappel B', '2026-10-02', 'Famille');

insert into public.mobile_procedure_progress (id, user_id, procedure_id)
values
  ('12000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'cni'),
  ('23000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', 'passeport');

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);

select results_eq(
  $$select first_names from public.mobile_profiles order by first_names$$,
  $$values ('Utilisateur A'::text)$$,
  'un utilisateur lit son profil et pas celui d’un autre'
);

select throws_ok(
  $$insert into public.mobile_profiles (user_id) values ('20000000-0000-4000-8000-000000000003')$$,
  '42501',
  'new row violates row-level security policy for table "mobile_profiles"',
  'un utilisateur ne peut pas créer le profil d’un autre'
);

select results_eq(
  $$select title from public.mobile_reminders order by title$$,
  $$values ('Rappel A'::text)$$,
  'un utilisateur lit ses rappels et pas ceux d’un autre'
);

select throws_ok(
  $$insert into public.mobile_reminders (id, user_id, title, due_date, category) values ('22000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000003', 'Interdit', '2026-10-03', 'Social')$$,
  '42501',
  'new row violates row-level security policy for table "mobile_reminders"',
  'un utilisateur ne peut pas créer le rappel d’un autre'
);

select results_eq(
  $$select procedure_id from public.mobile_procedure_progress order by procedure_id$$,
  $$values ('cni'::text)$$,
  'un utilisateur lit ses avancements et pas ceux d’un autre'
);

select throws_ok(
  $$insert into public.mobile_procedure_progress (id, user_id, procedure_id) values ('23000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000003', 'interdit')$$,
  '42501',
  'new row violates row-level security policy for table "mobile_procedure_progress"',
  'un utilisateur ne peut pas créer l’avancement d’un autre'
);

select * from finish();
rollback;

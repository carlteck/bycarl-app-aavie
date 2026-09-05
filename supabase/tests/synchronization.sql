-- Vérification réelle du contrat mobile ; toutes les données fictives sont annulées.
begin;
create temporary table sync_test_ids as select gen_random_uuid() as owner, gen_random_uuid() as other, gen_random_uuid() as reminder, gen_random_uuid() as foreign_reminder, gen_random_uuid() as progress;
grant select on sync_test_ids to authenticated;
insert into public.mobile_reminders (id, user_id, title, due_date, category)
select foreign_reminder, other, 'Test privé', '2026-10-01', 'Identité' from sync_test_ids;
set local role authenticated;
select set_config('request.jwt.claim.sub', (select owner::text from sync_test_ids), true);
do $$
declare ids record; n integer;
begin
  select * into ids from sync_test_ids;
  if has_function_privilege('authenticated', 'sync_internal._sync_outbox_fn_mobile_profiles()', 'execute') then
    raise exception 'Fonction technique exécutable directement';
  end if;
  begin
    insert into sync_internal._sync_outbox (table_name, row_id, operation, payload)
    values ('mobile_profiles', ids.owner::text, 'insert', '{}');
    raise exception 'Écriture directe dans le journal interne autorisée';
  exception when insufficient_privilege then null;
  end;
  insert into public.mobile_profiles (user_id, civility, birth_date, first_names)
  values (ids.owner, 'madame', '2000-02-29', 'Test synchronisation')
  on conflict (user_id) do update set first_names = excluded.first_names;
  insert into public.mobile_reminders (id, user_id, title, due_date, category)
  values (ids.reminder, ids.owner, 'Test initial', '2026-10-01', 'Identité');
  insert into public.mobile_reminders (id, user_id, title, due_date, category, deleted_at)
  values (ids.reminder, ids.owner, 'Test modifié', '2026-10-02', 'Identité', null)
  on conflict (id) do update set title = excluded.title, due_date = excluded.due_date, deleted_at = excluded.deleted_at;
  if not exists(select 1 from public.mobile_reminders where id = ids.reminder and title = 'Test modifié') then raise exception 'Échec upsert personnel'; end if;
  if exists(select 1 from public.mobile_reminders where id = ids.foreign_reminder) then raise exception 'Fuite de lecture'; end if;
  update public.mobile_reminders set title = 'Interdit' where id = ids.foreign_reminder;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'Écriture sur un autre compte'; end if;
  begin
    update public.mobile_reminders set user_id = ids.other where id = ids.reminder;
    raise exception 'Changement de propriétaire autorisé';
  exception when insufficient_privilege then null;
  end;
  update public.mobile_reminders set deleted_at = now() where id = ids.reminder;
  if not exists(select 1 from public.mobile_reminders where id = ids.reminder and deleted_at is not null) then raise exception 'Suppression non transmise'; end if;
  insert into public.mobile_procedure_progress (id, user_id, procedure_id, current_step, form_values, checked_documents)
  values (ids.progress, ids.owner, 'test-sync', 'summary', '{"nom":"Test"}', '{"photo":true}')
  on conflict (user_id, procedure_id) do update set current_step = excluded.current_step, form_values = excluded.form_values;
  if not exists(select 1 from public.mobile_procedure_progress where user_id = ids.owner and current_step = 'summary') then raise exception 'Avancement non enregistré'; end if;
  delete from public.mobile_profiles where user_id = ids.owner;
  if exists(select 1 from public.mobile_profiles where user_id = ids.owner) then raise exception 'Profil non supprimé'; end if;
end $$;
reset role;
set local role anon;
do $$
begin
  begin
    perform 1 from public.mobile_profiles limit 1;
    raise exception 'Lecture anonyme du profil autorisée';
  exception when insufficient_privilege then null;
  end;
  begin
    perform 1 from public.mobile_reminders limit 1;
    raise exception 'Lecture anonyme des rappels autorisée';
  exception when insufficient_privilege then null;
  end;
  begin
    perform 1 from public.mobile_procedure_progress limit 1;
    raise exception 'Lecture anonyme des démarches autorisée';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
select 'Contrat de synchronisation et isolation validés ; transaction annulée ensuite.' as verification;
rollback;

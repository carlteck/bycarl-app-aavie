do $$
begin
  if to_regclass('sync_internal._sync_outbox') is null then
    return;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'sync_internal' and tablename = '_sync_outbox'
      and policyname = 'sync_outbox_select_denied'
  ) then
    execute 'create policy sync_outbox_select_denied on sync_internal._sync_outbox for select to anon, authenticated using (false)';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'sync_internal' and tablename = '_sync_outbox'
      and policyname = 'sync_outbox_insert_denied'
  ) then
    execute 'create policy sync_outbox_insert_denied on sync_internal._sync_outbox for insert to anon, authenticated with check (false)';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'sync_internal' and tablename = '_sync_outbox'
      and policyname = 'sync_outbox_update_denied'
  ) then
    execute 'create policy sync_outbox_update_denied on sync_internal._sync_outbox for update to anon, authenticated using (false) with check (false)';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'sync_internal' and tablename = '_sync_outbox'
      and policyname = 'sync_outbox_delete_denied'
  ) then
    execute 'create policy sync_outbox_delete_denied on sync_internal._sync_outbox for delete to anon, authenticated using (false)';
  end if;
end;
$$;

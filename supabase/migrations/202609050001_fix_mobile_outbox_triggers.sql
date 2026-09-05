-- Le journal interne refuse l'accès aux clients. Seul le déclencheur doit y écrire,
-- après que la RLS de la table personnelle a autorisé l'opération d'origine.
do $$
declare
  function_name text;
begin
  foreach function_name in array array[
    '_sync_outbox_fn_mobile_profiles',
    '_sync_outbox_fn_mobile_reminders',
    '_sync_outbox_fn_mobile_procedure_progress'
  ] loop
    if to_regprocedure(format('sync_internal.%I()', function_name)) is not null then
      execute format('alter function sync_internal.%I() security definer', function_name);
      execute format('alter function sync_internal.%I() set search_path = %L', function_name, '');
      execute format('revoke all on function sync_internal.%I() from public, anon, authenticated', function_name);
    end if;
  end loop;
end;
$$;

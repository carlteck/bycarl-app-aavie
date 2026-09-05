do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke execute on function public.rls_auto_enable() from public, anon, authenticated';
    execute $comment$
      comment on function public.rls_auto_enable() is
      'Fonction administrative SECURITY DEFINER non exposée aux rôles Data API anon et authenticated.'
    $comment$;
  end if;
end;
$$;

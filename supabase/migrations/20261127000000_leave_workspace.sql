create or replace function public.leave_workspace(p_workspace_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  owner_role_id uuid;
begin
  select id into owner_role_id from public.workspace_roles where workspace_id = p_workspace_id and is_owner;

  delete from public.workspace_members
   where workspace_id = p_workspace_id and user_id = auth.uid() and role_id <> owner_role_id;

  if not found and public.is_workspace_owner(p_workspace_id) then
    raise exception 'The owner must transfer ownership before leaving' using errcode = '22023';
  end if;
end;
$$;

revoke execute on function public.leave_workspace(uuid) from public, anon;
grant execute on function public.leave_workspace(uuid) to authenticated, service_role;

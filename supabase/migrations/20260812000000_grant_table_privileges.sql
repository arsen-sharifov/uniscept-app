grant select, insert, update, delete on all tables in schema public to anon, authenticated, service_role;

alter default privileges in schema public
  grant select, insert, update, delete on tables to anon, authenticated, service_role;

revoke update on public.workspaces from anon, authenticated;
grant update (name) on public.workspaces to authenticated;

revoke update on public.workspace_members from anon, authenticated;
grant update (position) on public.workspace_members to authenticated;

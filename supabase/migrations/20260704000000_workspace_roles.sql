create table public.workspace_roles (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  key text check (key is null or key in ('owner', 'member', 'viewer')),
  name text not null,
  icon text,
  is_system boolean not null default false,
  is_owner boolean not null default false,
  can_edit_canvas boolean not null default false,
  can_comment boolean not null default false,
  can_manage_structure boolean not null default false,
  can_manage_members boolean not null default false,
  can_manage_roles boolean not null default false,
  can_manage_workspace boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  unique (workspace_id, name)
);

create index workspace_roles_workspace_id_idx on public.workspace_roles(workspace_id);
create unique index workspace_roles_one_owner_idx on public.workspace_roles(workspace_id) where is_owner;

create table public.workspace_invitations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  email text not null,
  role_id uuid not null references public.workspace_roles(id) on delete cascade,
  invited_by uuid references auth.users(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, email)
);

create index workspace_invitations_workspace_id_idx on public.workspace_invitations(workspace_id);
create index workspace_invitations_email_idx on public.workspace_invitations(lower(email));

create trigger on_workspace_invitations_updated
  before update on public.workspace_invitations
  for each row
  execute function public.handle_updated_at();

create or replace function public.seed_workspace_roles(p_workspace_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  owner_role_id uuid;
begin
  insert into public.workspace_roles (
    workspace_id, key, name, is_system, is_owner,
    can_edit_canvas, can_comment, can_manage_structure, can_manage_members, can_manage_roles, can_manage_workspace, position
  )
  values (p_workspace_id, 'owner', 'Owner', true, true, true, true, true, true, true, true, 0)
  returning id into owner_role_id;

  insert into public.workspace_roles (
    workspace_id, key, name, is_system, is_owner,
    can_edit_canvas, can_comment, can_manage_structure, can_manage_members, can_manage_roles, can_manage_workspace, position
  )
  values
    (p_workspace_id, 'member', 'Member', true, false, true, true, true, false, false, false, 1),
    (p_workspace_id, 'viewer', 'Viewer', true, false, false, false, false, false, false, false, 2);

  return owner_role_id;
end;
$$;

select public.seed_workspace_roles(w.id) from public.workspaces w;

alter table public.workspace_members add column role_id uuid references public.workspace_roles(id);

update public.workspace_members m
   set role_id = r.id
  from public.workspace_roles r
 where r.workspace_id = m.workspace_id
   and r.key = m.role;

create or replace function public.is_workspace_member(p_workspace_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members m
    where m.workspace_id = p_workspace_id
      and m.user_id = auth.uid()
  );
$$;

grant execute on function public.is_workspace_member(uuid) to authenticated;

create or replace function public.has_workspace_permission(p_workspace_id uuid, p_permission text)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    (
      select case p_permission
        when 'edit_canvas' then r.can_edit_canvas
        when 'comment' then r.can_comment
        when 'manage_structure' then r.can_manage_structure
        when 'manage_members' then r.can_manage_members
        when 'manage_roles' then r.can_manage_roles
        when 'manage_workspace' then r.can_manage_workspace
        else false
      end
      from public.workspace_members m
      join public.workspace_roles r on r.id = m.role_id
      where m.workspace_id = p_workspace_id
        and m.user_id = auth.uid()
    ),
    false
  );
$$;

grant execute on function public.has_workspace_permission(uuid, text) to authenticated;

create or replace function public.is_workspace_owner(p_workspace_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members m
    join public.workspace_roles r on r.id = m.role_id
    where m.workspace_id = p_workspace_id
      and m.user_id = auth.uid()
      and r.is_owner
  );
$$;

grant execute on function public.is_workspace_owner(uuid) to authenticated;

drop policy "editors can write canvas nodes" on public.canvas_nodes;
drop policy "editors can write canvas edges" on public.canvas_edges;
drop policy "authors can write node comments" on public.node_comments;
drop policy "authors can write canvas comments" on public.canvas_comments;

alter table public.workspace_members alter column role_id set not null;
alter table public.workspace_members drop column role;
alter table public.workspace_members add column position integer not null default 0;

update public.workspace_members m
   set position = ranked.rn
  from (
    select m2.workspace_id, m2.user_id,
           row_number() over (partition by m2.user_id order by w.position, w.created_at) - 1 as rn
    from public.workspace_members m2
    join public.workspaces w on w.id = m2.workspace_id
  ) ranked
 where ranked.workspace_id = m.workspace_id and ranked.user_id = m.user_id;

alter table public.workspaces drop column position;

alter table public.canvas_nodes
  add column created_by uuid references auth.users(id) on delete set null default auth.uid();
alter table public.canvas_edges
  add column created_by uuid references auth.users(id) on delete set null default auth.uid();

update public.canvas_nodes c
   set created_by = w.owner_id
  from public.threads t
  join public.workspaces w on w.id = t.workspace_id
 where t.id = c.thread_id and c.created_by is null;

update public.canvas_edges e
   set created_by = w.owner_id
  from public.threads t
  join public.workspaces w on w.id = t.workspace_id
 where t.id = e.thread_id and e.created_by is null;

create or replace function public.thread_has_question_node(p_thread_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.canvas_nodes q
    where q.thread_id = p_thread_id and q.type = 'question-node'
  );
$$;

grant execute on function public.thread_has_question_node(uuid) to authenticated;

create policy "editors insert canvas nodes"
  on public.canvas_nodes for insert
  with check (
    (
      public.has_workspace_permission(
        (select t.workspace_id from public.threads t where t.id = canvas_nodes.thread_id),
        'edit_canvas'
      )
      or (
        canvas_nodes.type = 'question-node'
        and public.has_workspace_permission(
          (select t.workspace_id from public.threads t where t.id = canvas_nodes.thread_id),
          'manage_structure'
        )
      )
    )
    and (created_by is null or created_by = auth.uid())
    and (
      canvas_nodes.type <> 'question-node'
      or not public.thread_has_question_node(canvas_nodes.thread_id)
    )
    and (
      canvas_nodes.source_node_id is null
      or public.can_reference_canvas_node(canvas_nodes.source_node_id, canvas_nodes.thread_id)
    )
  );

create policy "authors update canvas nodes"
  on public.canvas_nodes for update
  using (
    public.has_workspace_permission(
      (select t.workspace_id from public.threads t where t.id = canvas_nodes.thread_id),
      'edit_canvas'
    )
    and (
      created_by = auth.uid()
      or public.is_workspace_owner((select t.workspace_id from public.threads t where t.id = canvas_nodes.thread_id))
    )
  )
  with check (
    public.has_workspace_permission(
      (select t.workspace_id from public.threads t where t.id = canvas_nodes.thread_id),
      'edit_canvas'
    )
    and (
      created_by = auth.uid()
      or public.is_workspace_owner((select t.workspace_id from public.threads t where t.id = canvas_nodes.thread_id))
    )
  );

create policy "authors delete canvas nodes"
  on public.canvas_nodes for delete
  using (
    canvas_nodes.type <> 'question-node'
    and public.has_workspace_permission(
      (select t.workspace_id from public.threads t where t.id = canvas_nodes.thread_id),
      'edit_canvas'
    )
    and (
      created_by = auth.uid()
      or public.is_workspace_owner((select t.workspace_id from public.threads t where t.id = canvas_nodes.thread_id))
    )
  );

create policy "editors insert canvas edges"
  on public.canvas_edges for insert
  with check (
    public.has_workspace_permission(
      (select t.workspace_id from public.threads t where t.id = canvas_edges.thread_id),
      'edit_canvas'
    )
    and exists (
      select 1 from public.canvas_nodes sn
      where sn.id = canvas_edges.source_node_id and sn.thread_id = canvas_edges.thread_id
    )
    and exists (
      select 1 from public.canvas_nodes tn
      where tn.id = canvas_edges.target_node_id and tn.thread_id = canvas_edges.thread_id
    )
  );

create policy "editors delete canvas edges"
  on public.canvas_edges for delete
  using (
    public.has_workspace_permission(
      (select t.workspace_id from public.threads t where t.id = canvas_edges.thread_id),
      'edit_canvas'
    )
  );

create policy "commenters write node comments"
  on public.node_comments for all
  using (
    author_id = auth.uid()
    and public.has_workspace_permission(
      (
        select t.workspace_id
        from public.canvas_nodes n
        join public.threads t on t.id = n.thread_id
        where n.id = node_comments.node_id
      ),
      'comment'
    )
  );

create policy "commenters write canvas comments"
  on public.canvas_comments for all
  using (
    author_id = auth.uid()
    and public.has_workspace_permission(
      (select t.workspace_id from public.threads t where t.id = canvas_comments.thread_id),
      'comment'
    )
  );

create or replace function public.update_canvas_node_positions(updates jsonb)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  rows_updated integer;
begin
  update public.canvas_nodes c
     set position_x = (u->>'position_x')::float8,
         position_y = (u->>'position_y')::float8
    from jsonb_array_elements(updates) as u, public.threads t
   where c.id = (u->>'id')::uuid
     and t.id = c.thread_id
     and public.has_workspace_permission(t.workspace_id, 'edit_canvas');
  get diagnostics rows_updated = row_count;
  return rows_updated;
end;
$$;

create or replace function public.canvas_node_workspace_id(p_node_id uuid)
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select t.workspace_id
  from public.threads t
  join public.canvas_nodes n on n.thread_id = t.id
  where n.id = p_node_id;
$$;

create or replace function public.set_canvas_node_status(p_node_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_workspace_id uuid := public.canvas_node_workspace_id(p_node_id);
begin
  if v_workspace_id is null then
    return;
  end if;

  if not public.has_workspace_permission(v_workspace_id, 'edit_canvas') then
    raise exception 'You cannot edit this canvas' using errcode = '42501';
  end if;

  if p_status is not null and p_status not in ('valid', 'invalid') then
    raise exception 'Invalid status' using errcode = '22023';
  end if;

  update public.canvas_nodes set status = p_status where id = p_node_id;
end;
$$;

grant execute on function public.set_canvas_node_status(uuid, text) to authenticated;

create or replace function public.set_canvas_node_answer(p_node_id uuid, p_is_answer boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_workspace_id uuid := public.canvas_node_workspace_id(p_node_id);
begin
  if v_workspace_id is null then
    return;
  end if;

  if not public.has_workspace_permission(v_workspace_id, 'edit_canvas') then
    raise exception 'You cannot edit this canvas' using errcode = '42501';
  end if;

  update public.canvas_nodes set is_answer = p_is_answer where id = p_node_id;
end;
$$;

grant execute on function public.set_canvas_node_answer(uuid, boolean) to authenticated;

alter table public.workspaces enable row level security;
alter table public.folders enable row level security;
alter table public.threads enable row level security;
alter table public.workspace_members enable row level security;
alter table public.workspace_roles enable row level security;
alter table public.workspace_invitations enable row level security;

create policy "read own or member workspaces"
  on public.workspaces for select
  using (owner_id = auth.uid() or public.is_workspace_member(id));

create policy "create own workspace"
  on public.workspaces for insert
  with check (owner_id = auth.uid());

create policy "managers update workspace"
  on public.workspaces for update
  using (public.has_workspace_permission(id, 'manage_workspace'));

create policy "managers delete workspace"
  on public.workspaces for delete
  using (public.has_workspace_permission(id, 'manage_workspace'));

revoke update on public.workspaces from anon, authenticated;
grant update (name) on public.workspaces to authenticated;

create policy "members read folders"
  on public.folders for select
  using (public.is_workspace_member(workspace_id));

create policy "structure managers write folders"
  on public.folders for all
  using (public.has_workspace_permission(workspace_id, 'manage_structure'))
  with check (public.has_workspace_permission(workspace_id, 'manage_structure'));

create policy "members read threads"
  on public.threads for select
  using (public.is_workspace_member(workspace_id));

create policy "structure managers write threads"
  on public.threads for all
  using (public.has_workspace_permission(workspace_id, 'manage_structure'))
  with check (public.has_workspace_permission(workspace_id, 'manage_structure'));

create policy "read own membership"
  on public.workspace_members for select
  using (user_id = auth.uid());

create policy "members update own membership"
  on public.workspace_members for update
  using (user_id = auth.uid());

revoke update on public.workspace_members from anon, authenticated;
grant update (position) on public.workspace_members to authenticated;

create policy "members read roles"
  on public.workspace_roles for select
  using (public.is_workspace_member(workspace_id));

create or replace function public.seed_workspace_defaults()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  owner_role_id uuid;
begin
  owner_role_id := public.seed_workspace_roles(new.id);

  insert into public.workspace_members (workspace_id, user_id, role_id, position)
  values (
    new.id, new.owner_id, owner_role_id,
    (select coalesce(max(position), -1) + 1 from public.workspace_members where user_id = new.owner_id)
  );

  return new;
end;
$$;

create trigger on_workspace_created
  after insert on public.workspaces
  for each row
  execute function public.seed_workspace_defaults();

create or replace function public.get_workspace_roles(p_workspace_id uuid)
returns table (
  id uuid,
  key text,
  name text,
  icon text,
  is_system boolean,
  is_owner boolean,
  can_edit_canvas boolean,
  can_comment boolean,
  can_manage_structure boolean,
  can_manage_members boolean,
  can_manage_roles boolean,
  can_manage_workspace boolean,
  member_count bigint
)
language plpgsql
security definer
stable
set search_path = public
as $$
begin
  if not public.is_workspace_member(p_workspace_id) then
    raise exception 'Not a member of this workspace' using errcode = '42501';
  end if;

  return query
    select
      r.id, r.key, r.name, r.icon, r.is_system, r.is_owner,
      r.can_edit_canvas, r.can_comment, r.can_manage_structure,
      r.can_manage_members, r.can_manage_roles, r.can_manage_workspace,
      (select count(*) from public.workspace_members m where m.role_id = r.id)
    from public.workspace_roles r
    where r.workspace_id = p_workspace_id
    order by r.position, r.name;
end;
$$;

grant execute on function public.get_workspace_roles(uuid) to authenticated;

create or replace function public.get_workspace_members(p_workspace_id uuid)
returns table (
  user_id uuid,
  role_id uuid,
  role_key text,
  role_name text,
  is_owner boolean,
  joined_at timestamptz,
  email text,
  name text,
  avatar_icon text
)
language plpgsql
security definer
stable
set search_path = public
as $$
begin
  if not public.is_workspace_member(p_workspace_id) then
    raise exception 'Not a member of this workspace' using errcode = '42501';
  end if;

  return query
    select
      m.user_id, r.id, r.key, r.name, r.is_owner, m.joined_at,
      u.email::text,
      u.raw_user_meta_data ->> 'name',
      u.raw_user_meta_data ->> 'avatarIcon'
    from public.workspace_members m
    join public.workspace_roles r on r.id = m.role_id
    join auth.users u on u.id = m.user_id
    where m.workspace_id = p_workspace_id
    order by r.is_owner desc, r.position, m.joined_at;
end;
$$;

grant execute on function public.get_workspace_members(uuid) to authenticated;

create or replace function public.can_grant_permissions(
  p_workspace_id uuid,
  p_can_edit_canvas boolean,
  p_can_comment boolean,
  p_can_manage_structure boolean,
  p_can_manage_members boolean,
  p_can_manage_roles boolean,
  p_can_manage_workspace boolean
)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members m
    join public.workspace_roles r on r.id = m.role_id
    where m.workspace_id = p_workspace_id
      and m.user_id = auth.uid()
      and (
        r.is_owner
        or (
          (not p_can_edit_canvas or r.can_edit_canvas)
          and (not p_can_comment or r.can_comment)
          and (not p_can_manage_structure or r.can_manage_structure)
          and (not p_can_manage_members or r.can_manage_members)
          and (not p_can_manage_roles or r.can_manage_roles)
          and (not p_can_manage_workspace or r.can_manage_workspace)
        )
      )
  );
$$;

create or replace function public.create_workspace_role(
  p_workspace_id uuid,
  p_name text,
  p_icon text,
  p_can_edit_canvas boolean,
  p_can_comment boolean,
  p_can_manage_structure boolean,
  p_can_manage_members boolean,
  p_can_manage_roles boolean,
  p_can_manage_workspace boolean
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
  next_position integer;
begin
  if not public.has_workspace_permission(p_workspace_id, 'manage_roles') then
    raise exception 'You cannot manage roles in this workspace' using errcode = '42501';
  end if;

  if length(trim(coalesce(p_name, ''))) = 0 then
    raise exception 'Role name is required' using errcode = '22023';
  end if;

  if length(trim(p_name)) > 60 then
    raise exception 'Role name is too long' using errcode = '22023';
  end if;

  if not public.can_grant_permissions(
    p_workspace_id, p_can_edit_canvas, p_can_comment, p_can_manage_structure,
    p_can_manage_members, p_can_manage_roles, p_can_manage_workspace
  ) then
    raise exception 'You cannot grant permissions you do not have' using errcode = '42501';
  end if;

  if exists (
    select 1 from public.workspace_roles
    where workspace_id = p_workspace_id and name = trim(p_name)
  ) then
    raise exception 'A role with this name already exists' using errcode = '23505';
  end if;

  select coalesce(max(position), 0) + 1 into next_position
  from public.workspace_roles where workspace_id = p_workspace_id;

  insert into public.workspace_roles (
    workspace_id, key, name, icon, is_system, is_owner,
    can_edit_canvas, can_comment, can_manage_structure, can_manage_members, can_manage_roles, can_manage_workspace, position
  )
  values (
    p_workspace_id, null, trim(p_name), p_icon, false, false,
    p_can_edit_canvas, p_can_comment, p_can_manage_structure, p_can_manage_members, p_can_manage_roles, p_can_manage_workspace, next_position
  )
  returning id into new_id;

  return new_id;
end;
$$;

grant execute on function public.create_workspace_role(uuid, text, text, boolean, boolean, boolean, boolean, boolean, boolean) to authenticated;

create or replace function public.update_workspace_role(
  p_role_id uuid,
  p_name text,
  p_icon text,
  p_can_edit_canvas boolean,
  p_can_comment boolean,
  p_can_manage_structure boolean,
  p_can_manage_members boolean,
  p_can_manage_roles boolean,
  p_can_manage_workspace boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target public.workspace_roles;
begin
  select * into target from public.workspace_roles where id = p_role_id;
  if not found then
    raise exception 'Role not found' using errcode = 'P0002';
  end if;

  if not public.has_workspace_permission(target.workspace_id, 'manage_roles') then
    raise exception 'You cannot manage roles in this workspace' using errcode = '42501';
  end if;

  if target.is_system then
    raise exception 'Built-in roles cannot be edited' using errcode = '22023';
  end if;

  if length(trim(coalesce(p_name, ''))) = 0 then
    raise exception 'Role name is required' using errcode = '22023';
  end if;

  if length(trim(p_name)) > 60 then
    raise exception 'Role name is too long' using errcode = '22023';
  end if;

  if not public.can_grant_permissions(
    target.workspace_id, p_can_edit_canvas, p_can_comment, p_can_manage_structure,
    p_can_manage_members, p_can_manage_roles, p_can_manage_workspace
  ) then
    raise exception 'You cannot grant permissions you do not have' using errcode = '42501';
  end if;

  if exists (
    select 1 from public.workspace_roles
    where workspace_id = target.workspace_id and name = trim(p_name) and id <> p_role_id
  ) then
    raise exception 'A role with this name already exists' using errcode = '23505';
  end if;

  update public.workspace_roles
     set name = trim(p_name),
         icon = p_icon,
         can_edit_canvas = p_can_edit_canvas,
         can_comment = p_can_comment,
         can_manage_structure = p_can_manage_structure,
         can_manage_members = p_can_manage_members,
         can_manage_roles = p_can_manage_roles,
         can_manage_workspace = p_can_manage_workspace
   where id = p_role_id;
end;
$$;

grant execute on function public.update_workspace_role(uuid, text, text, boolean, boolean, boolean, boolean, boolean, boolean) to authenticated;

create or replace function public.delete_workspace_role(p_role_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target public.workspace_roles;
  member_role_id uuid;
begin
  select * into target from public.workspace_roles where id = p_role_id;
  if not found then
    raise exception 'Role not found' using errcode = 'P0002';
  end if;

  if not public.has_workspace_permission(target.workspace_id, 'manage_roles') then
    raise exception 'You cannot manage roles in this workspace' using errcode = '42501';
  end if;

  if target.is_system then
    raise exception 'Built-in roles cannot be deleted' using errcode = '22023';
  end if;

  select id into member_role_id
  from public.workspace_roles
  where workspace_id = target.workspace_id and key = 'member';

  update public.workspace_members set role_id = member_role_id where role_id = p_role_id;
  update public.workspace_invitations set role_id = member_role_id where role_id = p_role_id and status = 'pending';

  delete from public.workspace_roles where id = p_role_id;
end;
$$;

grant execute on function public.delete_workspace_role(uuid) to authenticated;

create or replace function public.set_member_role(p_workspace_id uuid, p_user_id uuid, p_role_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_role public.workspace_roles;
begin
  if not public.has_workspace_permission(p_workspace_id, 'manage_members') then
    raise exception 'You cannot manage members in this workspace' using errcode = '42501';
  end if;

  select * into target_role from public.workspace_roles where id = p_role_id and workspace_id = p_workspace_id;
  if not found then
    raise exception 'Role not found in this workspace' using errcode = 'P0002';
  end if;

  if target_role.is_owner then
    raise exception 'Ownership can only be transferred' using errcode = '22023';
  end if;

  if exists (
    select 1 from public.workspace_members m
    join public.workspace_roles r on r.id = m.role_id
    where m.workspace_id = p_workspace_id and m.user_id = p_user_id and r.is_owner
  ) then
    raise exception 'The owner role can only be transferred' using errcode = '22023';
  end if;

  if not public.can_grant_permissions(
    p_workspace_id, target_role.can_edit_canvas, target_role.can_comment, target_role.can_manage_structure,
    target_role.can_manage_members, target_role.can_manage_roles, target_role.can_manage_workspace
  ) then
    raise exception 'You cannot grant permissions you do not have' using errcode = '42501';
  end if;

  update public.workspace_members set role_id = p_role_id
   where workspace_id = p_workspace_id and user_id = p_user_id;

  if not found then
    raise exception 'Member not found' using errcode = 'P0002';
  end if;
end;
$$;

grant execute on function public.set_member_role(uuid, uuid, uuid) to authenticated;

create or replace function public.remove_workspace_member(p_workspace_id uuid, p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.has_workspace_permission(p_workspace_id, 'manage_members') then
    raise exception 'You cannot manage members in this workspace' using errcode = '42501';
  end if;

  if exists (
    select 1 from public.workspace_members m
    join public.workspace_roles r on r.id = m.role_id
    where m.workspace_id = p_workspace_id and m.user_id = p_user_id and r.is_owner
  ) then
    raise exception 'The owner cannot be removed' using errcode = '22023';
  end if;

  delete from public.workspace_members
   where workspace_id = p_workspace_id and user_id = p_user_id;
end;
$$;

grant execute on function public.remove_workspace_member(uuid, uuid) to authenticated;

create or replace function public.transfer_workspace_ownership(p_workspace_id uuid, p_new_owner_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  owner_role_id uuid;
  member_role_id uuid;
begin
  select id into owner_role_id from public.workspace_roles where workspace_id = p_workspace_id and is_owner;
  select id into member_role_id from public.workspace_roles where workspace_id = p_workspace_id and key = 'member';

  if not exists (
    select 1 from public.workspace_members
    where workspace_id = p_workspace_id and user_id = auth.uid() and role_id = owner_role_id
  ) then
    raise exception 'Only the owner can transfer ownership' using errcode = '42501';
  end if;

  if p_new_owner_id = auth.uid() then
    raise exception 'Already the owner' using errcode = '22023';
  end if;

  if not exists (
    select 1 from public.workspace_members where workspace_id = p_workspace_id and user_id = p_new_owner_id
  ) then
    raise exception 'New owner must be a member' using errcode = 'P0002';
  end if;

  update public.workspace_members set role_id = member_role_id
   where workspace_id = p_workspace_id and user_id = auth.uid();

  update public.workspace_members set role_id = owner_role_id
   where workspace_id = p_workspace_id and user_id = p_new_owner_id;

  update public.workspaces set owner_id = p_new_owner_id where id = p_workspace_id;
end;
$$;

grant execute on function public.transfer_workspace_ownership(uuid, uuid) to authenticated;

create or replace function public.create_workspace_invitation(p_workspace_id uuid, p_email text, p_role_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_email text := lower(trim(p_email));
  target_role public.workspace_roles;
  invite_id uuid;
begin
  if not public.has_workspace_permission(p_workspace_id, 'manage_members') then
    raise exception 'You cannot manage members in this workspace' using errcode = '42501';
  end if;

  if normalized_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'A valid email is required' using errcode = '22023';
  end if;

  select * into target_role from public.workspace_roles where id = p_role_id and workspace_id = p_workspace_id;
  if not found then
    raise exception 'Role not found in this workspace' using errcode = 'P0002';
  end if;

  if target_role.is_owner then
    raise exception 'Cannot invite someone as owner' using errcode = '22023';
  end if;

  if exists (
    select 1 from public.workspace_members m
    join auth.users u on u.id = m.user_id
    where m.workspace_id = p_workspace_id and lower(u.email) = normalized_email
  ) then
    raise exception 'This person is already a member' using errcode = '23505';
  end if;

  insert into public.workspace_invitations (workspace_id, email, role_id, invited_by, status)
  values (p_workspace_id, normalized_email, p_role_id, auth.uid(), 'pending')
  on conflict (workspace_id, email)
  do update set role_id = excluded.role_id, invited_by = excluded.invited_by, status = 'pending', updated_at = now()
  returning id into invite_id;

  return invite_id;
end;
$$;

grant execute on function public.create_workspace_invitation(uuid, text, uuid) to authenticated;

create or replace function public.revoke_workspace_invitation(p_invitation_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target public.workspace_invitations;
begin
  select * into target from public.workspace_invitations where id = p_invitation_id;
  if not found then
    return;
  end if;

  if not public.has_workspace_permission(target.workspace_id, 'manage_members') then
    raise exception 'You cannot manage members in this workspace' using errcode = '42501';
  end if;

  delete from public.workspace_invitations where id = p_invitation_id;
end;
$$;

grant execute on function public.revoke_workspace_invitation(uuid) to authenticated;

create or replace function public.get_workspace_invitations(p_workspace_id uuid)
returns table (
  id uuid,
  email text,
  role_id uuid,
  role_key text,
  role_name text,
  created_at timestamptz
)
language plpgsql
security definer
stable
set search_path = public
as $$
#variable_conflict use_column
begin
  if not public.has_workspace_permission(p_workspace_id, 'manage_members') then
    raise exception 'You cannot manage members in this workspace' using errcode = '42501';
  end if;

  return query
    select i.id, i.email, i.role_id, r.key, r.name, i.created_at
    from public.workspace_invitations i
    join public.workspace_roles r on r.id = i.role_id
    where i.workspace_id = p_workspace_id and i.status = 'pending'
    order by i.created_at desc;
end;
$$;

grant execute on function public.get_workspace_invitations(uuid) to authenticated;

create or replace function public.get_my_invitations()
returns table (
  id uuid,
  workspace_id uuid,
  workspace_name text,
  role_key text,
  role_name text,
  invited_by_name text,
  created_at timestamptz
)
language plpgsql
security definer
stable
set search_path = public
as $$
#variable_conflict use_column
declare
  my_email text;
begin
  select lower(email) into my_email from auth.users where id = auth.uid();

  return query
    select i.id, i.workspace_id, w.name, r.key, r.name,
      inviter.raw_user_meta_data ->> 'name',
      i.created_at
    from public.workspace_invitations i
    join public.workspaces w on w.id = i.workspace_id
    join public.workspace_roles r on r.id = i.role_id
    left join auth.users inviter on inviter.id = i.invited_by
    where lower(i.email) = my_email and i.status = 'pending'
    order by i.created_at desc;
end;
$$;

grant execute on function public.get_my_invitations() to authenticated;

create or replace function public.accept_workspace_invitation(p_invitation_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target public.workspace_invitations;
  my_email text;
begin
  select lower(email) into my_email from auth.users where id = auth.uid();

  select * into target from public.workspace_invitations where id = p_invitation_id and status = 'pending';
  if not found then
    raise exception 'Invitation not found' using errcode = 'P0002';
  end if;

  if my_email is null or lower(target.email) <> my_email then
    raise exception 'This invitation is for a different account' using errcode = '42501';
  end if;

  insert into public.workspace_members (workspace_id, user_id, role_id, position)
  values (
    target.workspace_id, auth.uid(), target.role_id,
    (select coalesce(max(position), -1) + 1 from public.workspace_members where user_id = auth.uid())
  )
  on conflict (workspace_id, user_id) do update set role_id = excluded.role_id;

  update public.workspace_invitations set status = 'accepted' where id = p_invitation_id;
end;
$$;

grant execute on function public.accept_workspace_invitation(uuid) to authenticated;

create or replace function public.decline_workspace_invitation(p_invitation_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target public.workspace_invitations;
  my_email text;
begin
  select lower(email) into my_email from auth.users where id = auth.uid();

  select * into target from public.workspace_invitations where id = p_invitation_id and status = 'pending';
  if not found then
    return;
  end if;

  if my_email is null or lower(target.email) <> my_email then
    raise exception 'This invitation is for a different account' using errcode = '42501';
  end if;

  update public.workspace_invitations set status = 'declined' where id = p_invitation_id;
end;
$$;

grant execute on function public.decline_workspace_invitation(uuid) to authenticated;

create or replace function public.get_my_workspaces()
returns table (
  id uuid,
  name text,
  can_manage_workspace boolean
)
language sql
security definer
stable
set search_path = public
as $$
  select w.id, w.name, r.can_manage_workspace
  from public.workspaces w
  join public.workspace_members m on m.workspace_id = w.id and m.user_id = auth.uid()
  join public.workspace_roles r on r.id = m.role_id
  order by m.position, w.created_at;
$$;

grant execute on function public.get_my_workspaces() to authenticated;

create or replace function public.get_my_workspace_permissions(p_workspace_id uuid)
returns table (
  is_owner boolean,
  can_edit_canvas boolean,
  can_comment boolean,
  can_manage_structure boolean,
  can_manage_members boolean,
  can_manage_roles boolean,
  can_manage_workspace boolean
)
language sql
security definer
stable
set search_path = public
as $$
  select r.is_owner, r.can_edit_canvas, r.can_comment, r.can_manage_structure,
         r.can_manage_members, r.can_manage_roles, r.can_manage_workspace
  from public.workspace_members m
  join public.workspace_roles r on r.id = m.role_id
  where m.workspace_id = p_workspace_id and m.user_id = auth.uid();
$$;

grant execute on function public.get_my_workspace_permissions(uuid) to authenticated;

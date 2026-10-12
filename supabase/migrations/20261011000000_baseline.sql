create table public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text not null default 'auto'
    check (theme in ('daybreak', 'eclipse', 'graphite', 'solstice', 'aurora', 'tide', 'orchid', 'bloom', 'auto')),
  language text not null default 'en' check (language in ('en', 'uk', 'ro', 'fr', 'es', 'pt')),
  canvas_pattern text not null default 'dots' check (canvas_pattern in ('dots', 'lines', 'cross', 'none')),
  snap_to_grid boolean not null default false,
  smart_guides boolean not null default true,
  default_zoom integer not null default 100 check (default_zoom in (50, 75, 100, 125, 150)),
  updated_at timestamptz not null default now()
);

create table public.user_onboarding (
  user_id uuid primary key references auth.users(id) on delete cascade,
  offer_answered boolean not null default false,
  completed_guides text[] not null default '{}',
  updated_at timestamptz not null default now(),
  constraint user_onboarding_completed_guides_length_check
    check (cardinality(completed_guides) <= 32 and char_length(array_to_string(completed_guides, '')) <= 2048)
);

create table public.signup_allowances (
  email text primary key check (email = lower(email)),
  expires_at timestamptz not null
);

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'My Workspace',
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workspaces_name_length_check check (char_length(name) <= 200)
);

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
  unique (workspace_id, name),
  constraint workspace_roles_name_length_check check (char_length(name) <= 200),
  constraint workspace_roles_icon_length_check check (char_length(icon) <= 64)
);

create table public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id uuid not null references public.workspace_roles(id),
  position integer not null default 0,
  joined_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table public.workspace_invitations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  email text not null,
  role_id uuid not null references public.workspace_roles(id) on delete cascade,
  invited_by uuid references auth.users(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  expires_at timestamptz not null default (now() + interval '14 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, email),
  constraint workspace_invitations_email_length_check check (char_length(email) <= 320)
);

create table public.folders (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  parent_folder_id uuid references public.folders(id) on delete cascade,
  name text not null default 'New Folder',
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint folders_name_length_check check (char_length(name) <= 200)
);

create table public.threads (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  folder_id uuid references public.folders(id) on delete cascade,
  name text not null default 'New Thread',
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint threads_name_length_check check (char_length(name) <= 200)
);

create table public.canvas_nodes (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.threads(id) on delete cascade,
  type text not null check (type in ('canvas-node', 'reference-node', 'question-node')),
  position_x double precision not null default 0,
  position_y double precision not null default 0,
  label text not null default '',
  status text check (
    status is null
    or (type = 'canvas-node' and status in ('valid', 'invalid'))
  ),
  is_answer boolean not null default false,
  source_node_id uuid references public.canvas_nodes(id) on delete cascade,
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint canvas_nodes_source_node_id_check
    check (
      (type = 'reference-node' and source_node_id is not null)
      or (type in ('canvas-node', 'question-node') and source_node_id is null)
    ),
  constraint canvas_nodes_answer_type_check
    check (is_answer = false or type = 'canvas-node'),
  constraint canvas_nodes_position_finite_check
    check (
      position_x > '-Infinity'::float8 and position_x < 'Infinity'::float8
      and position_y > '-Infinity'::float8 and position_y < 'Infinity'::float8
    ),
  constraint canvas_nodes_label_length_check
    check (char_length(label) <= 5000)
);

create table public.canvas_edges (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.threads(id) on delete cascade,
  source_node_id uuid not null references public.canvas_nodes(id) on delete cascade,
  target_node_id uuid not null references public.canvas_nodes(id) on delete cascade,
  source_handle text not null check (source_handle in ('top', 'right', 'bottom', 'left')),
  target_handle text not null check (target_handle in ('top', 'right', 'bottom', 'left')),
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (source_node_id, target_node_id)
);

create table public.node_comments (
  id uuid primary key default gen_random_uuid(),
  node_id uuid not null references public.canvas_nodes(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  text text not null check (length(trim(text)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint node_comments_text_length_check check (char_length(text) <= 5000)
);

create table public.canvas_comments (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.threads(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  text text not null check (length(trim(text)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint canvas_comments_text_length_check check (char_length(text) <= 5000)
);

create index workspaces_owner_id_idx on public.workspaces(owner_id);

create index workspace_roles_workspace_id_idx on public.workspace_roles(workspace_id);
create unique index workspace_roles_one_owner_idx on public.workspace_roles(workspace_id) where is_owner;

create index workspace_members_user_id_idx on public.workspace_members(user_id);
create index workspace_members_role_id_idx on public.workspace_members(role_id);

create index workspace_invitations_workspace_id_idx on public.workspace_invitations(workspace_id);
create index workspace_invitations_email_idx on public.workspace_invitations(lower(email));
create index workspace_invitations_role_id_idx on public.workspace_invitations(role_id);

create index folders_workspace_id_idx on public.folders(workspace_id);
create index folders_parent_folder_id_idx on public.folders(parent_folder_id);

create index threads_workspace_id_idx on public.threads(workspace_id);
create index threads_folder_id_idx on public.threads(folder_id);

create index canvas_nodes_thread_id_idx on public.canvas_nodes(thread_id);
create index canvas_nodes_source_node_id_idx on public.canvas_nodes(source_node_id);
create unique index canvas_nodes_one_question_idx on public.canvas_nodes(thread_id) where type = 'question-node';

create index canvas_edges_thread_id_idx on public.canvas_edges(thread_id);
create index canvas_edges_source_node_id_idx on public.canvas_edges(source_node_id);
create index canvas_edges_target_node_id_idx on public.canvas_edges(target_node_id);

create index node_comments_node_id_idx on public.node_comments(node_id);
create index node_comments_author_id_idx on public.node_comments(author_id);

create index canvas_comments_thread_id_idx on public.canvas_comments(thread_id);
create index canvas_comments_author_id_idx on public.canvas_comments(author_id);

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

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

create or replace function public.can_grant_role(p_role_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_roles r
    where r.id = p_role_id
      and public.can_grant_permissions(
        r.workspace_id, r.can_edit_canvas, r.can_comment, r.can_manage_structure,
        r.can_manage_members, r.can_manage_roles, r.can_manage_workspace
      )
  );
$$;

create or replace function public.can_reference_canvas_node(source_id uuid, target_thread_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.canvas_nodes source_n
    join public.threads source_t on source_t.id = source_n.thread_id
    join public.threads target_t on target_t.id = target_thread_id
    where source_n.id = source_id
      and source_n.type = 'canvas-node'
      and source_t.workspace_id = target_t.workspace_id
      and public.is_workspace_member(target_t.workspace_id)
  );
$$;

create or replace function public.thread_has_question_node(p_thread_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.canvas_nodes q
    join public.threads t on t.id = q.thread_id
    where q.thread_id = p_thread_id and q.type = 'question-node' and public.is_workspace_member(t.workspace_id)
  );
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

create or replace function public.guard_folder_parent()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  creates_cycle boolean;
  parent_depth integer;
  subtree_height integer;
begin
  if tg_op = 'UPDATE'
    and new.parent_folder_id is not distinct from old.parent_folder_id
    and new.workspace_id = old.workspace_id then
    return new;
  end if;

  if new.parent_folder_id is null then
    return new;
  end if;

  if auth.uid() is not null and not public.has_workspace_permission(new.workspace_id, 'manage_structure') then
    return new;
  end if;

  if new.parent_folder_id = new.id then
    raise exception 'A folder cannot be moved into itself' using errcode = '22023';
  end if;

  perform 1 from public.folders
  where id = new.parent_folder_id and workspace_id = new.workspace_id
  for share;
  if not found then
    raise exception 'A folder can only be nested inside its own workspace' using errcode = '22023';
  end if;

  with recursive chain(id, parent_folder_id) as (
    select f.id, f.parent_folder_id from public.folders f where f.id = new.parent_folder_id
    union
    select f.id, f.parent_folder_id from public.folders f join chain c on f.id = c.parent_folder_id
  )
  select coalesce(bool_or(chain.id = new.id), false), count(*)::integer - 1
    into creates_cycle, parent_depth
  from chain;

  if creates_cycle then
    raise exception 'A folder cannot be moved into its own subfolder' using errcode = '22023';
  end if;

  with recursive below(id, level) as (
    select f.id, 1 from public.folders f where f.parent_folder_id = new.id
    union all
    select f.id, b.level + 1 from public.folders f join below b on f.parent_folder_id = b.id where b.level < 64
  )
  select coalesce(max(level), 0) into subtree_height from below;

  if parent_depth + 1 + subtree_height > 1 then
    raise exception 'Folders can only be nested one level deep' using errcode = '22023';
  end if;

  return new;
end;
$$;

create or replace function public.guard_thread_folder()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE'
    and new.folder_id is not distinct from old.folder_id
    and new.workspace_id = old.workspace_id then
    return new;
  end if;

  if new.folder_id is null then
    return new;
  end if;

  if auth.uid() is not null and not public.has_workspace_permission(new.workspace_id, 'manage_structure') then
    return new;
  end if;

  if not exists (
    select 1 from public.folders where id = new.folder_id and workspace_id = new.workspace_id
  ) then
    raise exception 'A thread can only be placed in a folder of its own workspace' using errcode = '22023';
  end if;

  return new;
end;
$$;

create or replace function public.grant_signup_allowance(p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_email text := lower(trim(coalesce(p_email, '')));
begin
  if normalized_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'A valid email is required' using errcode = '22023';
  end if;

  delete from public.signup_allowances where expires_at <= now();

  insert into public.signup_allowances (email, expires_at)
  values (normalized_email, now() + interval '15 minutes')
  on conflict (email) do update set expires_at = excluded.expires_at;
end;
$$;

create or replace function public.hook_before_user_created(event jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.signup_allowances
  where email = lower(trim(event -> 'user' ->> 'email')) and expires_at > now();
  if found then
    return '{}'::jsonb;
  end if;

  return jsonb_build_object(
    'error', jsonb_build_object('http_code', 403, 'message', 'Sign-up requires an invitation or an invite code')
  );
end;
$$;

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

create or replace function public.get_my_owned_shared_workspaces()
returns table (
  id uuid,
  name text
)
language sql
security definer
stable
set search_path = public
as $$
  select w.id, w.name
  from public.workspaces w
  where w.owner_id = auth.uid()
    and exists (
      select 1 from public.workspace_members m
      where m.workspace_id = w.id and m.user_id <> auth.uid()
    )
  order by w.name;
$$;

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
      left(u.raw_user_meta_data ->> 'name', 200),
      left(u.raw_user_meta_data ->> 'avatarIcon', 64)
    from public.workspace_members m
    join public.workspace_roles r on r.id = m.role_id
    join auth.users u on u.id = m.user_id
    where m.workspace_id = p_workspace_id
    order by r.is_owner desc, r.position, m.joined_at;
end;
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
  select * into target from public.workspace_roles
  where id = p_role_id and public.is_workspace_member(workspace_id);
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

  if not public.can_grant_role(p_role_id) then
    raise exception 'You cannot manage a role with permissions you do not have' using errcode = '42501';
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

create or replace function public.delete_workspace_role(p_role_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target public.workspace_roles;
  fallback_role_id uuid;
begin
  select * into target from public.workspace_roles
  where id = p_role_id and public.is_workspace_member(workspace_id);
  if not found then
    raise exception 'Role not found' using errcode = 'P0002';
  end if;

  if not public.has_workspace_permission(target.workspace_id, 'manage_roles') then
    raise exception 'You cannot manage roles in this workspace' using errcode = '42501';
  end if;

  if target.is_system then
    raise exception 'Built-in roles cannot be deleted' using errcode = '22023';
  end if;

  if not public.can_grant_role(p_role_id) then
    raise exception 'You cannot manage a role with permissions you do not have' using errcode = '42501';
  end if;

  select id into fallback_role_id
  from public.workspace_roles
  where workspace_id = target.workspace_id and key = 'member';

  if (
    exists (select 1 from public.workspace_members where role_id = p_role_id)
    or exists (
      select 1 from public.workspace_invitations
      where role_id = p_role_id and status = 'pending' and expires_at > now()
    )
  ) and not public.can_grant_role(fallback_role_id) then
    raise exception 'You cannot move people into a role with permissions you do not have' using errcode = '42501';
  end if;

  update public.workspace_members set role_id = fallback_role_id where role_id = p_role_id;
  update public.workspace_invitations set role_id = fallback_role_id
   where role_id = p_role_id and status = 'pending' and expires_at > now();

  delete from public.workspace_roles where id = p_role_id;
end;
$$;

create or replace function public.set_member_role(p_workspace_id uuid, p_user_id uuid, p_role_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_role public.workspace_roles;
  member_role public.workspace_roles;
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

  select r.* into member_role
  from public.workspace_members m
  join public.workspace_roles r on r.id = m.role_id
  where m.workspace_id = p_workspace_id and m.user_id = p_user_id;
  if not found then
    raise exception 'Member not found' using errcode = 'P0002';
  end if;

  if member_role.is_owner then
    raise exception 'The owner role can only be transferred' using errcode = '22023';
  end if;

  if not public.can_grant_role(p_role_id) then
    raise exception 'You cannot grant permissions you do not have' using errcode = '42501';
  end if;

  if not public.can_grant_role(member_role.id) then
    raise exception 'You cannot manage a member with permissions you do not have' using errcode = '42501';
  end if;

  update public.workspace_members set role_id = p_role_id
   where workspace_id = p_workspace_id and user_id = p_user_id and role_id = member_role.id;

  if not found then
    raise exception 'Member not found' using errcode = 'P0002';
  end if;
end;
$$;

create or replace function public.remove_workspace_member(p_workspace_id uuid, p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  member_role public.workspace_roles;
begin
  if not public.has_workspace_permission(p_workspace_id, 'manage_members') then
    raise exception 'You cannot manage members in this workspace' using errcode = '42501';
  end if;

  select r.* into member_role
  from public.workspace_members m
  join public.workspace_roles r on r.id = m.role_id
  where m.workspace_id = p_workspace_id and m.user_id = p_user_id;
  if not found then
    return;
  end if;

  if member_role.is_owner then
    raise exception 'The owner cannot be removed' using errcode = '22023';
  end if;

  if not public.can_grant_role(member_role.id) then
    raise exception 'You cannot manage a member with permissions you do not have' using errcode = '42501';
  end if;

  delete from public.workspace_members
   where workspace_id = p_workspace_id and user_id = p_user_id and role_id = member_role.id;
end;
$$;

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

  update public.workspace_members set role_id = member_role_id
   where workspace_id = p_workspace_id and user_id = auth.uid() and role_id = owner_role_id;

  if not found then
    raise exception 'Only the owner can transfer ownership' using errcode = '42501';
  end if;

  update public.workspace_members set role_id = owner_role_id
   where workspace_id = p_workspace_id and user_id = p_new_owner_id;

  if not found then
    raise exception 'New owner must be a member' using errcode = 'P0002';
  end if;

  update public.workspaces set owner_id = p_new_owner_id where id = p_workspace_id;
end;
$$;

create or replace function public.create_workspace_invitation(p_workspace_id uuid, p_email text, p_role_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_email text := lower(trim(p_email));
  target_role public.workspace_roles;
  pending_role_id uuid;
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

  if not public.can_grant_role(p_role_id) then
    raise exception 'You cannot grant permissions you do not have' using errcode = '42501';
  end if;

  if exists (
    select 1 from public.workspace_members m
    join auth.users u on u.id = m.user_id
    where m.workspace_id = p_workspace_id and lower(u.email) = normalized_email
  ) then
    raise exception 'This person is already a member' using errcode = '23505';
  end if;

  perform 1 from public.workspaces where id = p_workspace_id for no key update;

  select role_id into pending_role_id
  from public.workspace_invitations
  where workspace_id = p_workspace_id and email = normalized_email and status = 'pending' and expires_at > now();
  if found and not public.can_grant_role(pending_role_id) then
    raise exception 'You cannot manage an invitation with permissions you do not have' using errcode = '42501';
  end if;

  if not found and (
    select count(*) from public.workspace_invitations
    where workspace_id = p_workspace_id and status = 'pending' and expires_at > now()
  ) >= 100 then
    raise exception 'Too many pending invitations' using errcode = '54000';
  end if;

  insert into public.workspace_invitations (workspace_id, email, role_id, invited_by, status)
  values (p_workspace_id, normalized_email, p_role_id, auth.uid(), 'pending')
  on conflict (workspace_id, email)
  do update set role_id = excluded.role_id, invited_by = excluded.invited_by, status = 'pending',
    expires_at = excluded.expires_at, updated_at = now()
  returning id into invite_id;

  return invite_id;
end;
$$;

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

  if not public.can_grant_role(target.role_id) then
    raise exception 'You cannot manage an invitation with permissions you do not have' using errcode = '42501';
  end if;

  delete from public.workspace_invitations where id = p_invitation_id;
end;
$$;

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
    where i.workspace_id = p_workspace_id and i.status = 'pending' and i.expires_at > now()
    order by i.created_at desc;
end;
$$;

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
begin
  return query
    select i.id, i.workspace_id, w.name, r.key, r.name,
      left(inviter.raw_user_meta_data ->> 'name', 200),
      i.created_at
    from public.workspace_invitations i
    join public.workspaces w on w.id = i.workspace_id
    join public.workspace_roles r on r.id = i.role_id
    left join auth.users inviter on inviter.id = i.invited_by
    where lower(i.email) = (select lower(u.email) from auth.users u where u.id = auth.uid())
      and i.status = 'pending' and i.expires_at > now()
    order by i.created_at desc;
end;
$$;

create or replace function public.accept_workspace_invitation(p_invitation_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target public.workspace_invitations;
begin
  update public.workspace_invitations set status = 'accepted'
   where id = p_invitation_id and status = 'pending' and expires_at > now()
     and lower(email) = (select lower(u.email) from auth.users u where u.id = auth.uid())
  returning * into target;

  if not found then
    raise exception 'Invitation not found' using errcode = 'P0002';
  end if;

  insert into public.workspace_members (workspace_id, user_id, role_id, position)
  values (
    target.workspace_id, auth.uid(), target.role_id,
    (select coalesce(max(position), -1) + 1 from public.workspace_members where user_id = auth.uid())
  )
  on conflict (workspace_id, user_id) do nothing;
end;
$$;

create or replace function public.decline_workspace_invitation(p_invitation_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.workspace_invitations set status = 'declined'
   where id = p_invitation_id and status = 'pending' and expires_at > now()
     and lower(email) = (select lower(u.email) from auth.users u where u.id = auth.uid());
end;
$$;

create trigger on_user_preferences_updated
  before update on public.user_preferences
  for each row
  execute function public.handle_updated_at();

create trigger on_user_onboarding_updated
  before update on public.user_onboarding
  for each row
  execute function public.handle_updated_at();

create trigger on_workspaces_updated
  before update on public.workspaces
  for each row
  execute function public.handle_updated_at();

create trigger on_workspace_created
  after insert on public.workspaces
  for each row
  execute function public.seed_workspace_defaults();

create trigger on_workspace_invitations_updated
  before update on public.workspace_invitations
  for each row
  execute function public.handle_updated_at();

create trigger on_folders_updated
  before update on public.folders
  for each row
  execute function public.handle_updated_at();

create trigger on_folder_placed
  before insert or update of parent_folder_id, workspace_id on public.folders
  for each row
  execute function public.guard_folder_parent();

create trigger on_threads_updated
  before update on public.threads
  for each row
  execute function public.handle_updated_at();

create trigger on_thread_placed
  before insert or update of folder_id, workspace_id on public.threads
  for each row
  execute function public.guard_thread_folder();

create trigger on_canvas_nodes_updated
  before update on public.canvas_nodes
  for each row
  execute function public.handle_updated_at();

create trigger on_node_comments_updated
  before update on public.node_comments
  for each row
  execute function public.handle_updated_at();

create trigger on_canvas_comments_updated
  before update on public.canvas_comments
  for each row
  execute function public.handle_updated_at();

alter table public.user_preferences enable row level security;
alter table public.user_onboarding enable row level security;
alter table public.signup_allowances enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_roles enable row level security;
alter table public.workspace_members enable row level security;
alter table public.workspace_invitations enable row level security;
alter table public.folders enable row level security;
alter table public.threads enable row level security;
alter table public.canvas_nodes enable row level security;
alter table public.canvas_edges enable row level security;
alter table public.node_comments enable row level security;
alter table public.canvas_comments enable row level security;

create policy "Users can read own preferences"
  on public.user_preferences for select
  using (auth.uid() = user_id);

create policy "Users can insert own preferences"
  on public.user_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update own preferences"
  on public.user_preferences for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can read own onboarding"
  on public.user_onboarding for select
  using (auth.uid() = user_id);

create policy "Users can insert own onboarding"
  on public.user_onboarding for insert
  with check (auth.uid() = user_id);

create policy "Users can update own onboarding"
  on public.user_onboarding for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

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

create policy "members read roles"
  on public.workspace_roles for select
  using (public.is_workspace_member(workspace_id));

create policy "read own membership"
  on public.workspace_members for select
  using (user_id = auth.uid());

create policy "members update own membership"
  on public.workspace_members for update
  using (user_id = auth.uid());

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

create policy "members can read canvas nodes"
  on public.canvas_nodes for select
  using (
    exists (
      select 1
      from public.threads t
      join public.workspace_members m on m.workspace_id = t.workspace_id
      where t.id = canvas_nodes.thread_id
        and m.user_id = auth.uid()
    )
  );

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
    and created_by = auth.uid()
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

create policy "members can read canvas edges"
  on public.canvas_edges for select
  using (
    exists (
      select 1
      from public.threads t
      join public.workspace_members m on m.workspace_id = t.workspace_id
      where t.id = canvas_edges.thread_id
        and m.user_id = auth.uid()
    )
  );

create policy "editors insert canvas edges"
  on public.canvas_edges for insert
  with check (
    public.has_workspace_permission(
      (select t.workspace_id from public.threads t where t.id = canvas_edges.thread_id),
      'edit_canvas'
    )
    and created_by = auth.uid()
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

create policy "members can read node comments"
  on public.node_comments for select
  using (
    exists (
      select 1
      from public.canvas_nodes n
      join public.threads t on t.id = n.thread_id
      join public.workspace_members m on m.workspace_id = t.workspace_id
      where n.id = node_comments.node_id
        and m.user_id = auth.uid()
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

create policy "members can read canvas comments"
  on public.canvas_comments for select
  using (
    exists (
      select 1
      from public.threads t
      join public.workspace_members m on m.workspace_id = t.workspace_id
      where t.id = canvas_comments.thread_id
        and m.user_id = auth.uid()
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

grant select, insert, update, delete on all tables in schema public to anon, authenticated, service_role;

revoke insert, update, delete, truncate, references, trigger, maintain on all tables in schema public from anon;
revoke truncate, references, trigger, maintain on all tables in schema public from authenticated;

alter default privileges in schema public
  revoke insert, update, delete, truncate, references, trigger, maintain on tables from anon;
alter default privileges in schema public
  revoke truncate, references, trigger, maintain on tables from authenticated;
alter default privileges revoke execute on functions from public;

revoke all on public.signup_allowances from anon, authenticated;

revoke insert, update, delete on public.workspace_roles from anon, authenticated;
revoke insert, update, delete on public.workspace_invitations from anon, authenticated;

revoke insert, update, delete on public.workspace_members from anon, authenticated;
grant update (position) on public.workspace_members to authenticated;

revoke insert, update on public.workspaces from anon, authenticated;
grant insert (id, name, owner_id) on public.workspaces to authenticated;
grant update (name) on public.workspaces to authenticated;

revoke insert, update on public.folders from anon, authenticated;
grant insert (id, workspace_id, parent_folder_id, name, position) on public.folders to authenticated;
grant update (name, parent_folder_id, position) on public.folders to authenticated;

revoke insert, update on public.threads from anon, authenticated;
grant insert (id, workspace_id, folder_id, name, position) on public.threads to authenticated;
grant update (name, folder_id, position) on public.threads to authenticated;

revoke insert, update on public.canvas_nodes from anon, authenticated;
grant insert (id, thread_id, type, position_x, position_y, label, status, source_node_id, is_answer, created_by)
  on public.canvas_nodes to authenticated;
grant update (label, position_x, position_y, status, is_answer) on public.canvas_nodes to authenticated;

revoke insert, update on public.canvas_edges from anon, authenticated;
grant insert (id, thread_id, source_node_id, target_node_id, source_handle, target_handle, created_by)
  on public.canvas_edges to authenticated;

revoke insert, update on public.node_comments from anon, authenticated;
grant insert (id, node_id, author_id, text) on public.node_comments to authenticated;
grant update (text) on public.node_comments to authenticated;

revoke insert, update on public.canvas_comments from anon, authenticated;
grant insert (id, thread_id, author_id, text) on public.canvas_comments to authenticated;
grant update (text) on public.canvas_comments to authenticated;

grant usage on schema public to supabase_auth_admin;

revoke execute on function public.grant_signup_allowance(text) from public, anon, authenticated;
grant execute on function public.grant_signup_allowance(text) to service_role;

revoke execute on function public.hook_before_user_created(jsonb) from public, anon, authenticated, service_role;
grant execute on function public.hook_before_user_created(jsonb) to supabase_auth_admin;

revoke execute on function public.get_my_owned_shared_workspaces() from public, anon, service_role;
grant execute on function public.get_my_owned_shared_workspaces() to authenticated;

revoke execute on function public.seed_workspace_roles(uuid) from public, anon, authenticated;
revoke execute on function public.canvas_node_workspace_id(uuid) from public, anon, authenticated;
revoke execute on function public.can_grant_permissions(uuid, boolean, boolean, boolean, boolean, boolean, boolean) from public, anon, authenticated;
revoke execute on function public.can_grant_role(uuid) from public, anon, authenticated;

revoke execute on function public.is_workspace_member(uuid) from public;
revoke execute on function public.has_workspace_permission(uuid, text) from public;
revoke execute on function public.is_workspace_owner(uuid) from public;
revoke execute on function public.thread_has_question_node(uuid) from public;
revoke execute on function public.can_reference_canvas_node(uuid, uuid) from public;
grant execute on function public.is_workspace_member(uuid) to anon, authenticated, service_role;
grant execute on function public.has_workspace_permission(uuid, text) to anon, authenticated, service_role;
grant execute on function public.is_workspace_owner(uuid) to anon, authenticated, service_role;
grant execute on function public.thread_has_question_node(uuid) to anon, authenticated, service_role;
grant execute on function public.can_reference_canvas_node(uuid, uuid) to anon, authenticated, service_role;

revoke execute on function public.accept_workspace_invitation(uuid) from public, anon;
revoke execute on function public.create_workspace_invitation(uuid, text, uuid) from public, anon;
revoke execute on function public.create_workspace_role(uuid, text, text, boolean, boolean, boolean, boolean, boolean, boolean) from public, anon;
revoke execute on function public.decline_workspace_invitation(uuid) from public, anon;
revoke execute on function public.delete_workspace_role(uuid) from public, anon;
revoke execute on function public.get_my_invitations() from public, anon;
revoke execute on function public.get_my_workspace_permissions(uuid) from public, anon;
revoke execute on function public.get_my_workspaces() from public, anon;
revoke execute on function public.get_workspace_invitations(uuid) from public, anon;
revoke execute on function public.get_workspace_members(uuid) from public, anon;
revoke execute on function public.get_workspace_roles(uuid) from public, anon;
revoke execute on function public.remove_workspace_member(uuid, uuid) from public, anon;
revoke execute on function public.revoke_workspace_invitation(uuid) from public, anon;
revoke execute on function public.set_canvas_node_answer(uuid, boolean) from public, anon;
revoke execute on function public.set_canvas_node_status(uuid, text) from public, anon;
revoke execute on function public.set_member_role(uuid, uuid, uuid) from public, anon;
revoke execute on function public.transfer_workspace_ownership(uuid, uuid) from public, anon;
revoke execute on function public.update_canvas_node_positions(jsonb) from public, anon;
revoke execute on function public.update_workspace_role(uuid, text, text, boolean, boolean, boolean, boolean, boolean, boolean) from public, anon;

grant execute on function public.accept_workspace_invitation(uuid) to authenticated, service_role;
grant execute on function public.create_workspace_invitation(uuid, text, uuid) to authenticated, service_role;
grant execute on function public.create_workspace_role(uuid, text, text, boolean, boolean, boolean, boolean, boolean, boolean) to authenticated, service_role;
grant execute on function public.decline_workspace_invitation(uuid) to authenticated, service_role;
grant execute on function public.delete_workspace_role(uuid) to authenticated, service_role;
grant execute on function public.get_my_invitations() to authenticated, service_role;
grant execute on function public.get_my_workspace_permissions(uuid) to authenticated, service_role;
grant execute on function public.get_my_workspaces() to authenticated, service_role;
grant execute on function public.get_workspace_invitations(uuid) to authenticated, service_role;
grant execute on function public.get_workspace_members(uuid) to authenticated, service_role;
grant execute on function public.get_workspace_roles(uuid) to authenticated, service_role;
grant execute on function public.remove_workspace_member(uuid, uuid) to authenticated, service_role;
grant execute on function public.revoke_workspace_invitation(uuid) to authenticated, service_role;
grant execute on function public.set_canvas_node_answer(uuid, boolean) to authenticated, service_role;
grant execute on function public.set_canvas_node_status(uuid, text) to authenticated, service_role;
grant execute on function public.set_member_role(uuid, uuid, uuid) to authenticated, service_role;
grant execute on function public.transfer_workspace_ownership(uuid, uuid) to authenticated, service_role;
grant execute on function public.update_canvas_node_positions(jsonb) to authenticated, service_role;
grant execute on function public.update_workspace_role(uuid, text, text, boolean, boolean, boolean, boolean, boolean, boolean) to authenticated, service_role;

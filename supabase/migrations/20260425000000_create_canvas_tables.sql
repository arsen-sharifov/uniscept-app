create table public.canvas_nodes (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.threads(id) on delete cascade,
  type text not null check (type in ('canvas-node', 'reference-node')),
  position_x double precision not null default 0,
  position_y double precision not null default 0,
  label text not null default '',
  status text check (
    status is null
    or (type = 'canvas-node' and status in ('valid', 'invalid'))
  ),
  source_node_id uuid references public.canvas_nodes(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (type = 'reference-node' and source_node_id is not null)
    or (type = 'canvas-node' and source_node_id is null)
  )
);

create index canvas_nodes_thread_id_idx on public.canvas_nodes(thread_id);
create index canvas_nodes_source_node_id_idx on public.canvas_nodes(source_node_id);

create trigger on_canvas_nodes_updated
  before update on public.canvas_nodes
  for each row
  execute function public.handle_updated_at();

create table public.canvas_edges (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.threads(id) on delete cascade,
  source_node_id uuid not null references public.canvas_nodes(id) on delete cascade,
  target_node_id uuid not null references public.canvas_nodes(id) on delete cascade,
  source_handle text not null check (source_handle in ('top', 'right', 'bottom', 'left')),
  target_handle text not null check (target_handle in ('top', 'right', 'bottom', 'left')),
  created_at timestamptz not null default now(),
  unique (source_node_id, target_node_id)
);

create index canvas_edges_thread_id_idx on public.canvas_edges(thread_id);
create index canvas_edges_source_node_id_idx on public.canvas_edges(source_node_id);
create index canvas_edges_target_node_id_idx on public.canvas_edges(target_node_id);

create table public.node_comments (
  id uuid primary key default gen_random_uuid(),
  node_id uuid not null references public.canvas_nodes(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  text text not null check (length(trim(text)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index node_comments_node_id_idx on public.node_comments(node_id);
create index node_comments_author_id_idx on public.node_comments(author_id);

create trigger on_node_comments_updated
  before update on public.node_comments
  for each row
  execute function public.handle_updated_at();

create table public.canvas_comments (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.threads(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  text text not null check (length(trim(text)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index canvas_comments_thread_id_idx on public.canvas_comments(thread_id);
create index canvas_comments_author_id_idx on public.canvas_comments(author_id);

create trigger on_canvas_comments_updated
  before update on public.canvas_comments
  for each row
  execute function public.handle_updated_at();

create or replace function public.update_canvas_node_positions(updates jsonb)
returns integer
language plpgsql
security invoker
as $$
declare
  rows_updated integer;
begin
  update public.canvas_nodes c
     set position_x = (u->>'position_x')::float8,
         position_y = (u->>'position_y')::float8
    from jsonb_array_elements(updates) as u
    join public.threads t on t.id = c.thread_id
    join public.workspace_members m
      on m.workspace_id = t.workspace_id
     and m.user_id = auth.uid()
     and m.role in ('owner', 'member')
   where c.id = (u->>'id')::uuid;
  get diagnostics rows_updated = row_count;
  return rows_updated;
end;
$$;

grant execute on function public.update_canvas_node_positions(jsonb) to authenticated;

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
  );
$$;

grant execute on function public.can_reference_canvas_node(uuid, uuid) to authenticated;

alter table public.canvas_nodes enable row level security;
alter table public.canvas_edges enable row level security;
alter table public.node_comments enable row level security;
alter table public.canvas_comments enable row level security;

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

create policy "editors can write canvas nodes"
  on public.canvas_nodes for all
  using (
    exists (
      select 1
      from public.threads t
      join public.workspace_members m on m.workspace_id = t.workspace_id
      where t.id = canvas_nodes.thread_id
        and m.user_id = auth.uid()
        and m.role in ('owner', 'member')
    )
  )
  with check (
    exists (
      select 1
      from public.threads t
      join public.workspace_members m on m.workspace_id = t.workspace_id
      where t.id = canvas_nodes.thread_id
        and m.user_id = auth.uid()
        and m.role in ('owner', 'member')
    )
    and (
      canvas_nodes.source_node_id is null
      or public.can_reference_canvas_node(canvas_nodes.source_node_id, canvas_nodes.thread_id)
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

create policy "editors can write canvas edges"
  on public.canvas_edges for all
  using (
    exists (
      select 1
      from public.threads t
      join public.workspace_members m on m.workspace_id = t.workspace_id
      where t.id = canvas_edges.thread_id
        and m.user_id = auth.uid()
        and m.role in ('owner', 'member')
    )
  )
  with check (
    exists (
      select 1
      from public.threads t
      join public.workspace_members m on m.workspace_id = t.workspace_id
      where t.id = canvas_edges.thread_id
        and m.user_id = auth.uid()
        and m.role in ('owner', 'member')
    )
    and exists (
      select 1
      from public.canvas_nodes sn
      where sn.id = canvas_edges.source_node_id
        and sn.thread_id = canvas_edges.thread_id
    )
    and exists (
      select 1
      from public.canvas_nodes tn
      where tn.id = canvas_edges.target_node_id
        and tn.thread_id = canvas_edges.thread_id
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

create policy "authors can write node comments"
  on public.node_comments for all
  using (
    author_id = auth.uid()
    and exists (
      select 1
      from public.canvas_nodes n
      join public.threads t on t.id = n.thread_id
      join public.workspace_members m on m.workspace_id = t.workspace_id
      where n.id = node_comments.node_id
        and m.user_id = auth.uid()
        and m.role in ('owner', 'member')
    )
  )
  with check (
    author_id = auth.uid()
    and exists (
      select 1
      from public.canvas_nodes n
      join public.threads t on t.id = n.thread_id
      join public.workspace_members m on m.workspace_id = t.workspace_id
      where n.id = node_comments.node_id
        and m.user_id = auth.uid()
        and m.role in ('owner', 'member')
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

create policy "authors can write canvas comments"
  on public.canvas_comments for all
  using (
    author_id = auth.uid()
    and exists (
      select 1
      from public.threads t
      join public.workspace_members m on m.workspace_id = t.workspace_id
      where t.id = canvas_comments.thread_id
        and m.user_id = auth.uid()
        and m.role in ('owner', 'member')
    )
  )
  with check (
    author_id = auth.uid()
    and exists (
      select 1
      from public.threads t
      join public.workspace_members m on m.workspace_id = t.workspace_id
      where t.id = canvas_comments.thread_id
        and m.user_id = auth.uid()
        and m.role in ('owner', 'member')
    )
  );

alter table public.threads drop column canvas_data;

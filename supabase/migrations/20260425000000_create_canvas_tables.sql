-- Canvas content (nodes, edges, comments) — normalised tables.
-- Replaces the previous threads.canvas_data jsonb blob.

create table public.canvas_nodes (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.threads(id) on delete cascade,
  type text not null check (type in ('canvas-node', 'reference-node')),
  position_x double precision not null default 0,
  position_y double precision not null default 0,
  label text not null default '',
  status text check (status in ('valid', 'invalid')),
  source_thread_id uuid references public.threads(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index canvas_nodes_thread_id_idx on public.canvas_nodes(thread_id);

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
  unique (source_node_id, source_handle, target_node_id, target_handle)
);

create index canvas_edges_thread_id_idx on public.canvas_edges(thread_id);

create table public.node_comments (
  id uuid primary key default gen_random_uuid(),
  node_id uuid not null references public.canvas_nodes(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

create index node_comments_node_id_idx on public.node_comments(node_id);

-- RLS: any authenticated member of the owning workspace may read/write canvas content.
-- (Role enforcement is intentionally deferred — every member is treated equally for now.)

alter table public.canvas_nodes enable row level security;
alter table public.canvas_edges enable row level security;
alter table public.node_comments enable row level security;

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

create policy "members can write canvas nodes"
  on public.canvas_nodes for all
  using (
    exists (
      select 1
      from public.threads t
      join public.workspace_members m on m.workspace_id = t.workspace_id
      where t.id = canvas_nodes.thread_id
        and m.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.threads t
      join public.workspace_members m on m.workspace_id = t.workspace_id
      where t.id = canvas_nodes.thread_id
        and m.user_id = auth.uid()
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

create policy "members can write canvas edges"
  on public.canvas_edges for all
  using (
    exists (
      select 1
      from public.threads t
      join public.workspace_members m on m.workspace_id = t.workspace_id
      where t.id = canvas_edges.thread_id
        and m.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.threads t
      join public.workspace_members m on m.workspace_id = t.workspace_id
      where t.id = canvas_edges.thread_id
        and m.user_id = auth.uid()
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
    )
  );

-- Drop legacy blob column.
alter table public.threads drop column canvas_data;

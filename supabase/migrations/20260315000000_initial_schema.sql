create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', new.email));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.workspaces enable row level security;

create policy "Owners can do everything with their workspaces"
  on public.workspaces for all
  using (auth.uid() = owner_id);

create type public.topic_type as enum ('topic', 'folder');

create table public.topics (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  parent_id uuid references public.topics(id) on delete cascade,
  name text not null,
  type public.topic_type not null default 'topic',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index topics_workspace_id_idx on public.topics(workspace_id);
create index topics_parent_id_idx on public.topics(parent_id);

alter table public.topics enable row level security;

create policy "Users can manage topics in their workspaces"
  on public.topics for all
  using (
    exists (
      select 1 from public.workspaces
      where workspaces.id = topics.workspace_id
        and workspaces.owner_id = auth.uid()
    )
  );

create type public.node_status as enum ('valid', 'invalid');

create table public.canvas_nodes (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete cascade,
  type text not null default 'canvas-node',
  label text not null default '',
  status public.node_status,
  position_x double precision not null default 0,
  position_y double precision not null default 0,
  source_topic_id uuid references public.topics(id) on delete set null,
  source_topic_name text,
  source_workspace_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index canvas_nodes_topic_id_idx on public.canvas_nodes(topic_id);

alter table public.canvas_nodes enable row level security;

create policy "Users can manage nodes in their workspaces"
  on public.canvas_nodes for all
  using (
    exists (
      select 1 from public.topics
      join public.workspaces on workspaces.id = topics.workspace_id
      where topics.id = canvas_nodes.topic_id
        and workspaces.owner_id = auth.uid()
    )
  );

create table public.canvas_edges (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete cascade,
  source_node_id uuid not null references public.canvas_nodes(id) on delete cascade,
  target_node_id uuid not null references public.canvas_nodes(id) on delete cascade,
  source_handle text,
  target_handle text,
  created_at timestamptz not null default now()
);

create index canvas_edges_topic_id_idx on public.canvas_edges(topic_id);

alter table public.canvas_edges enable row level security;

create policy "Users can manage edges in their workspaces"
  on public.canvas_edges for all
  using (
    exists (
      select 1 from public.topics
      join public.workspaces on workspaces.id = topics.workspace_id
      where topics.id = canvas_edges.topic_id
        and workspaces.owner_id = auth.uid()
    )
  );

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  node_id uuid not null references public.canvas_nodes(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

create index comments_node_id_idx on public.comments(node_id);

alter table public.comments enable row level security;

create policy "Users can manage comments on nodes in their workspaces"
  on public.comments for all
  using (
    exists (
      select 1 from public.canvas_nodes
      join public.topics on topics.id = canvas_nodes.topic_id
      join public.workspaces on workspaces.id = topics.workspace_id
      where canvas_nodes.id = comments.node_id
        and workspaces.owner_id = auth.uid()
    )
  );

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger set_workspaces_updated_at
  before update on public.workspaces
  for each row execute function public.set_updated_at();

create trigger set_topics_updated_at
  before update on public.topics
  for each row execute function public.set_updated_at();

create trigger set_canvas_nodes_updated_at
  before update on public.canvas_nodes
  for each row execute function public.set_updated_at();

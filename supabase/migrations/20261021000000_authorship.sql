alter table public.canvas_nodes
  add column edited_at timestamptz,
  add column edited_by uuid references auth.users(id) on delete set null;

create index canvas_nodes_edited_by_idx on public.canvas_nodes(edited_by);

update public.canvas_nodes
set label = ''
where type in ('canvas-node', 'reference-node')
  and rich_label is null
  and label in ('New node', 'Новий вузол', 'Nod nou', 'Nouveau nœud', 'Nuevo nodo', 'Novo nó');

alter table public.node_comments
  add column edited_at timestamptz,
  alter column author_id drop not null,
  drop constraint node_comments_author_id_fkey,
  add constraint node_comments_author_id_fkey
    foreign key (author_id) references auth.users(id) on delete set null;

create table public.deleted_canvas_nodes (
  id uuid primary key,
  thread_id uuid not null references public.threads(id) on delete cascade,
  type text not null,
  label text not null,
  rich_label jsonb,
  source_node_id uuid,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null,
  edited_at timestamptz,
  edited_by uuid references auth.users(id) on delete set null,
  deleted_by uuid not null references auth.users(id) on delete cascade,
  deleted_at timestamptz not null default now()
);

create index deleted_canvas_nodes_thread_id_idx on public.deleted_canvas_nodes(thread_id);
create index deleted_canvas_nodes_deleted_at_idx on public.deleted_canvas_nodes(deleted_at);

create table public.deleted_node_comments (
  id uuid primary key,
  thread_id uuid not null references public.threads(id) on delete cascade,
  node_id uuid not null,
  text text not null,
  rich_text jsonb,
  author_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null,
  edited_at timestamptz,
  deleted_by uuid not null references auth.users(id) on delete cascade,
  deleted_at timestamptz not null default now()
);

create index deleted_node_comments_thread_id_idx on public.deleted_node_comments(thread_id);
create index deleted_node_comments_deleted_at_idx on public.deleted_node_comments(deleted_at);

alter table public.deleted_canvas_nodes enable row level security;
alter table public.deleted_node_comments enable row level security;

revoke all on public.deleted_canvas_nodes, public.deleted_node_comments from anon, authenticated;
grant select, insert, update, delete on public.deleted_canvas_nodes, public.deleted_node_comments to service_role;

create or replace function public.deleted_content_cutoff()
returns timestamptz
language sql
stable
set search_path = public
as $$
  select now() - interval '7 days';
$$;

create or replace function public.forget_expired_deletions()
returns void
language sql
set search_path = public
as $$
  delete from public.deleted_canvas_nodes where deleted_at < public.deleted_content_cutoff();
  delete from public.deleted_node_comments where deleted_at < public.deleted_content_cutoff();
$$;

create or replace function public.mark_canvas_node_edited()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if (new.label is not distinct from old.label and new.rich_label is not distinct from old.rich_label)
    or (old.label = '' and old.edited_at is null) then
    return new;
  end if;

  new.edited_at = now();
  new.edited_by = auth.uid();

  return new;
end;
$$;

create trigger on_canvas_node_text_edited
  before update of label, rich_label on public.canvas_nodes
  for each row
  execute function public.mark_canvas_node_edited();

create or replace function public.mark_node_comment_edited()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.text is distinct from old.text or new.rich_text is distinct from old.rich_text then
    new.edited_at = now();
  end if;

  return new;
end;
$$;

create trigger on_node_comment_text_edited
  before update of text, rich_text on public.node_comments
  for each row
  execute function public.mark_node_comment_edited();

create or replace function public.keep_deleted_canvas_node()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null
    or not exists (select 1 from public.threads t where t.id = old.thread_id)
    or (
      old.source_node_id is not null
      and not exists (select 1 from public.canvas_nodes s where s.id = old.source_node_id)
    ) then
    return old;
  end if;

  perform public.forget_expired_deletions();

  insert into public.deleted_canvas_nodes (
    id, thread_id, type, label, rich_label, source_node_id,
    created_by, created_at, edited_at, edited_by, deleted_by
  )
  values (
    old.id, old.thread_id, old.type, old.label, old.rich_label, old.source_node_id,
    old.created_by, old.created_at, old.edited_at, old.edited_by, auth.uid()
  );

  return old;
end;
$$;

create trigger on_canvas_node_deleted
  before delete on public.canvas_nodes
  for each row
  execute function public.keep_deleted_canvas_node();

create or replace function public.keep_deleted_node_comment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  node_thread_id uuid;
begin
  select coalesce(
    (select n.thread_id from public.canvas_nodes n where n.id = old.node_id),
    (select d.thread_id from public.deleted_canvas_nodes d where d.id = old.node_id and d.deleted_by = auth.uid())
  )
  into node_thread_id;

  if auth.uid() is null or node_thread_id is null then
    return old;
  end if;

  perform public.forget_expired_deletions();

  insert into public.deleted_node_comments (
    id, thread_id, node_id, text, rich_text, author_id, created_at, edited_at, deleted_by
  )
  values (
    old.id, node_thread_id, old.node_id, old.text, old.rich_text, old.author_id, old.created_at, old.edited_at, auth.uid()
  );

  return old;
end;
$$;

create trigger on_node_comment_deleted
  before delete on public.node_comments
  for each row
  execute function public.keep_deleted_node_comment();

create or replace function public.restore_deleted_canvas_node()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  kept public.deleted_canvas_nodes;
begin
  select * into kept
  from public.deleted_canvas_nodes
  where id = new.id and deleted_at >= public.deleted_content_cutoff();

  if not found then
    return new;
  end if;

  if kept.deleted_by is distinct from auth.uid() then
    raise exception 'This id is reserved for restoring a deleted node' using errcode = '23505';
  end if;

  if kept.created_by is distinct from auth.uid() then
    new.label = kept.label;
    new.rich_label = kept.rich_label;
  end if;

  new.thread_id = kept.thread_id;
  new.type = kept.type;
  new.source_node_id = kept.source_node_id;
  new.created_by = kept.created_by;
  new.created_at = kept.created_at;

  if (new.label is distinct from kept.label or new.rich_label is distinct from kept.rich_label)
    and (kept.label <> '' or kept.edited_at is not null) then
    new.edited_at = now();
    new.edited_by = auth.uid();
  else
    new.edited_at = kept.edited_at;
    new.edited_by = kept.edited_by;
  end if;

  return new;
end;
$$;

create trigger on_canvas_node_restoring
  before insert on public.canvas_nodes
  for each row
  execute function public.restore_deleted_canvas_node();

create or replace function public.forget_deleted_canvas_node()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.deleted_canvas_nodes where id = new.id;

  perform public.forget_expired_deletions();

  return new;
end;
$$;

create trigger on_canvas_node_restored
  after insert on public.canvas_nodes
  for each row
  execute function public.forget_deleted_canvas_node();

create or replace function public.restore_deleted_node_comment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  kept public.deleted_node_comments;
begin
  select * into kept
  from public.deleted_node_comments
  where id = new.id and deleted_at >= public.deleted_content_cutoff();

  if not found then
    return new;
  end if;

  if kept.deleted_by is distinct from auth.uid() then
    raise exception 'This id is reserved for restoring a deleted comment' using errcode = '23505';
  end if;

  if kept.author_id is distinct from auth.uid()
    or not public.has_workspace_permission(
      (select t.workspace_id from public.threads t where t.id = kept.thread_id),
      'comment'
    ) then
    new.text = kept.text;
    new.rich_text = kept.rich_text;
  end if;

  new.node_id = kept.node_id;
  new.author_id = kept.author_id;
  new.created_at = kept.created_at;

  if new.text is distinct from kept.text or new.rich_text is distinct from kept.rich_text then
    new.edited_at = now();
  else
    new.edited_at = kept.edited_at;
  end if;

  return new;
end;
$$;

create trigger on_node_comment_restoring
  before insert on public.node_comments
  for each row
  execute function public.restore_deleted_node_comment();

create or replace function public.forget_deleted_node_comment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.deleted_node_comments where id = new.id;

  perform public.forget_expired_deletions();

  return new;
end;
$$;

create trigger on_node_comment_restored
  after insert on public.node_comments
  for each row
  execute function public.forget_deleted_node_comment();

create or replace function public.is_restored_canvas_node(p_node_id uuid, p_created_by uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.deleted_canvas_nodes d
    where d.id = p_node_id
      and d.deleted_by = auth.uid()
      and d.created_by is not distinct from p_created_by
      and d.deleted_at >= public.deleted_content_cutoff()
  );
$$;

create or replace function public.is_restored_node_comment(p_comment_id uuid, p_author_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.deleted_node_comments d
    where d.id = p_comment_id
      and d.deleted_by = auth.uid()
      and d.author_id is not distinct from p_author_id
      and d.deleted_at >= public.deleted_content_cutoff()
  );
$$;

drop policy "editors insert canvas nodes" on public.canvas_nodes;

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
    and (
      created_by = auth.uid()
      or public.is_restored_canvas_node(canvas_nodes.id, canvas_nodes.created_by)
    )
    and (
      canvas_nodes.type <> 'question-node'
      or not public.thread_has_question_node(canvas_nodes.thread_id)
    )
    and (
      canvas_nodes.source_node_id is null
      or public.can_reference_canvas_node(canvas_nodes.source_node_id, canvas_nodes.thread_id)
    )
  );

drop policy "authors update canvas nodes" on public.canvas_nodes;

create policy "authors update canvas nodes"
  on public.canvas_nodes for update
  using (
    public.has_workspace_permission(
      (select t.workspace_id from public.threads t where t.id = canvas_nodes.thread_id),
      'edit_canvas'
    )
    and created_by = auth.uid()
  )
  with check (
    public.has_workspace_permission(
      (select t.workspace_id from public.threads t where t.id = canvas_nodes.thread_id),
      'edit_canvas'
    )
    and created_by = auth.uid()
  );

drop policy "commenters write node comments" on public.node_comments;

create policy "commenters insert node comments"
  on public.node_comments for insert
  with check (
    (
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
    )
    or (
      public.is_restored_node_comment(node_comments.id, node_comments.author_id)
      and (
        public.has_workspace_permission(
          (
            select t.workspace_id
            from public.canvas_nodes n
            join public.threads t on t.id = n.thread_id
            where n.id = node_comments.node_id
          ),
          'comment'
        )
        or public.has_workspace_permission(
          (
            select t.workspace_id
            from public.canvas_nodes n
            join public.threads t on t.id = n.thread_id
            where n.id = node_comments.node_id
          ),
          'edit_canvas'
        )
      )
    )
  );

create policy "authors update node comments"
  on public.node_comments for update
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
  )
  with check (
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

create policy "authors delete node comments"
  on public.node_comments for delete
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

grant update (rich_text) on public.node_comments to authenticated;

revoke execute on function public.is_restored_canvas_node(uuid, uuid) from public;
revoke execute on function public.is_restored_node_comment(uuid, uuid) from public;
grant execute on function public.is_restored_canvas_node(uuid, uuid) to anon, authenticated, service_role;
grant execute on function public.is_restored_node_comment(uuid, uuid) to anon, authenticated, service_role;

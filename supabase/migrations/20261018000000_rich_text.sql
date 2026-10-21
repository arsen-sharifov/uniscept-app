alter table public.canvas_nodes
  add column rich_label jsonb,
  add constraint canvas_nodes_rich_label_check
    check (
      rich_label is null
      or (
        jsonb_typeof(rich_label) = 'object'
        and rich_label ->> 'type' = 'doc'
        and octet_length(rich_label::text) <= 100000
      )
    );

alter table public.node_comments
  add column rich_text jsonb,
  add constraint node_comments_rich_text_check
    check (
      rich_text is null
      or (
        jsonb_typeof(rich_text) = 'object'
        and rich_text ->> 'type' = 'doc'
        and octet_length(rich_text::text) <= 100000
      )
    );

create or replace function public.clear_stale_rich_label()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.label is distinct from old.label and new.rich_label is not distinct from old.rich_label then
    new.rich_label = null;
  end if;

  return new;
end;
$$;

create trigger on_canvas_node_label_changed
  before update of label on public.canvas_nodes
  for each row
  execute function public.clear_stale_rich_label();

create or replace function public.clear_stale_rich_text()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.text is distinct from old.text and new.rich_text is not distinct from old.rich_text then
    new.rich_text = null;
  end if;

  return new;
end;
$$;

create trigger on_node_comment_text_changed
  before update of text on public.node_comments
  for each row
  execute function public.clear_stale_rich_text();

grant insert (rich_label), update (rich_label) on public.canvas_nodes to authenticated;
grant insert (rich_text) on public.node_comments to authenticated;

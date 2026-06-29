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
   where c.id = (u->>'id')::uuid
     and exists (
       select 1
         from public.threads t
         join public.workspace_members m
           on m.workspace_id = t.workspace_id
          and m.user_id = auth.uid()
          and m.role in ('owner', 'member')
        where t.id = c.thread_id
     );
  get diagnostics rows_updated = row_count;
  return rows_updated;
end;
$$;

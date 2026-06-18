alter table public.canvas_nodes
  drop constraint canvas_nodes_type_check,
  add constraint canvas_nodes_type_check
    check (type in ('canvas-node', 'reference-node', 'question-node'));

alter table public.canvas_nodes
  drop constraint canvas_nodes_check1,
  add constraint canvas_nodes_source_node_id_check
    check (
      (type = 'reference-node' and source_node_id is not null)
      or (type in ('canvas-node', 'question-node') and source_node_id is null)
    );

alter table public.canvas_nodes
  add column is_answer boolean not null default false;

alter table public.canvas_nodes
  add constraint canvas_nodes_answer_type_check
    check (is_answer = false or type = 'canvas-node');

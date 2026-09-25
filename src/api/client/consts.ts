export const REFERENCE_SEARCH_LIMIT = 200;

export const REFERENCE_TARGET_SELECT = 'id, label, thread_id, threads!inner(id, name, workspace_id, workspaces(name))';

export const REFERENCE_TARGET_COUNT_SELECT = 'id, threads!inner(workspace_id)';

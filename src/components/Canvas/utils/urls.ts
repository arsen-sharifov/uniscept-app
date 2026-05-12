export const buildReferenceUrl = (workspaceId: string, threadId: string, nodeId?: string): string | null => {
  if (!workspaceId || !threadId) return null;

  const params = new URLSearchParams({ focus: 'ref' });
  if (nodeId) params.set('node', nodeId);

  return `/platform/${encodeURIComponent(workspaceId)}/${encodeURIComponent(threadId)}?${params.toString()}`;
};

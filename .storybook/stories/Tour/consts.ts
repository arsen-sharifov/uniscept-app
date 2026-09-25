import type { ITourPermissions, ITourSnapshot, TTourAnchor, TTourSignal } from '@interfaces';

import { ECanvasTool } from '@/components';

import { createCanvasNode } from '../../utils';

const FULL_ACCESS: ITourPermissions = {
  resolved: true,
  canEditCanvas: true,
  canComment: true,
  canManageStructure: true,
  canManageMembers: true,
  canManageRoles: true,
};

export const READY_SNAPSHOT: ITourSnapshot = {
  nodes: [createCanvasNode('sb-claim', 0, 200, 'The release checklist is green')],
  edges: [],
  activeTool: ECanvasTool.Select,
  threadId: 'sb-thread',
  openCommentsNodeId: null,
  pendingConnection: null,
  workspaceCount: 1,
  folderCount: 0,
  nestedThreadCount: 0,
  referenceTargetCount: 2,
  permissions: FULL_ACCESS,
  visibleAnchors: new Set<TTourAnchor>(),
  signals: new Set<TTourSignal>(),
};

export const NO_CANVAS_SNAPSHOT: ITourSnapshot = { ...READY_SNAPSHOT, nodes: [], threadId: null };

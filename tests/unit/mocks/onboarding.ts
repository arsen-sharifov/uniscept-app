import type { Node } from '@xyflow/react';

import type { ITourPermissions, ITourSnapshot, TTourAnchor, TTourSignal } from '@interfaces';

import { ECanvasTool } from '@/components/tools';

export const FULL_TOUR_ACCESS: ITourPermissions = {
  resolved: true,
  canEditCanvas: true,
  canComment: true,
  canManageStructure: true,
  canManageMembers: true,
  canManageRoles: true,
};

export const NO_TOUR_ACCESS: ITourPermissions = {
  resolved: true,
  canEditCanvas: false,
  canComment: false,
  canManageStructure: false,
  canManageMembers: false,
  canManageRoles: false,
};

const EMPTY_SNAPSHOT: ITourSnapshot = {
  nodes: [],
  edges: [],
  activeTool: ECanvasTool.Select,
  threadId: null,
  openCommentsNodeId: null,
  pendingConnection: null,
  workspaceCount: 0,
  folderCount: 0,
  nestedThreadCount: 0,
  referenceTargetCount: 0,
  permissions: FULL_TOUR_ACCESS,
  visibleAnchors: new Set<TTourAnchor>(),
  signals: new Set<TTourSignal>(),
};

export const snapshot = (overrides: Partial<ITourSnapshot> = {}): ITourSnapshot => ({
  ...EMPTY_SNAPSHOT,
  ...overrides,
});

export const withAnchors = (...anchors: TTourAnchor[]): ITourSnapshot => snapshot({ visibleAnchors: new Set(anchors) });

export const withNodes = (...nodes: Node[]): ITourSnapshot => snapshot({ nodes });

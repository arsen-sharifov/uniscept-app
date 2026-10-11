import type { Node } from '@xyflow/react';

import type {
  ITourGeometry,
  ITourPermissions,
  ITourSnapshot,
  ITourStep,
  TNavItem,
  TTourAnchor,
  TTourSignal,
} from '@interfaces';

import { ECanvasTool } from '@/components/tools';
import { EXAMPLE_GUIDE_ID, findGuide, GUIDES, joinAnchors } from '@/lib/onboarding';

import { domRect } from './browser';
import { canvasNode } from './canvas';
import { GEOMETRY_ANCHOR_RECT } from './geometry';

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

export const READY_SNAPSHOT = snapshot({
  workspaceCount: 1,
  threadId: 'thread-1',
  nodes: [canvasNode('n1')],
  referenceTargetCount: 1,
});

export const EXAMPLE_CREATE_ERROR = new Error('create failed');

export const ACTION_STEP: ITourStep = { copyKey: 'baseThread', placement: 'right', pose: 'point', isDone: () => false };
export const READ_STEP: ITourStep = { copyKey: 'baseIntro', placement: 'center', pose: 'think' };
export const ERGO_STEP: ITourStep = {
  copyKey: 'exampleCapsule',
  placement: 'bottom',
  pose: 'point',
  speaker: 'ergo',
};

export const BASE_STEP = findGuide('base')!.steps[0]!;
export const SECOND_BASE_STEP = findGuide('base')!.steps[1]!;
export const EXAMPLE_LAST_INDEX = findGuide(EXAMPLE_GUIDE_ID)!.steps.length - 1;
export const SETTINGS_STEPS = findGuide('settings')?.steps.length ?? 0;
export const LAST_GUIDE_ID = GUIDES[GUIDES.length - 1]!.id;

export const ONBOARDING_USER_ID = 'user-1';
export const WORKSPACE_ANCHORS = joinAnchors(['sidebarWorkspaceCreate', 'sidebarWorkspaceSwitcher']);

export const NAV_TREE: TNavItem[] = [
  { type: 'thread', id: 'loose', name: 'Loose thread' },
  {
    type: 'folder',
    id: 'research',
    name: 'Research',
    items: [{ type: 'thread', id: 'nested', name: 'Nested thread' }],
  },
];

export const CANVAS_DOM_RECT = domRect({ top: 0, left: 0, right: 800, bottom: 600 });

export const TOUR_GEOMETRY: ITourGeometry = {
  rect: GEOMETRY_ANCHOR_RECT,
  anchor: 'canvas',
  blocked: null,
  lit: [GEOMETRY_ANCHOR_RECT],
  open: [GEOMETRY_ANCHOR_RECT],
};

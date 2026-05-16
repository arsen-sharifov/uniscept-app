import type { IMockCanvasState } from '@story-interfaces';
import { ECanvasTool } from '@/components';
import { useCanvasStore } from '@/lib/stores';

const BASE_STATE: Required<IMockCanvasState> = {
  threadId: 'sb-thread',
  userId: 'storybook-user',
  hydrated: true,
  nodes: [],
  edges: [],
  canvasComments: [],
  activeTool: ECanvasTool.Select,
  pendingConnection: null,
  referenceSearchPosition: null,
  editingNodeId: null,
  openCommentsNodeId: null,
  canvasCommentsOpen: false,
  middlePan: false,
};

const RESET_STATE: Required<IMockCanvasState> = {
  ...BASE_STATE,
  threadId: null,
  userId: null,
  hydrated: false,
};

export const mockCanvasStore = (overrides: IMockCanvasState = {}): void => {
  useCanvasStore.setState({ ...BASE_STATE, ...overrides });
};

export const resetCanvasStore = (): void => {
  useCanvasStore.setState(RESET_STATE);
};

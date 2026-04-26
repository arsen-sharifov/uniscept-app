import {
  createCanvasEdge,
  createCanvasNode,
  createNodeComment,
  deleteCanvasEdge,
  deleteCanvasNode,
  updateCanvasNodeLabel,
  updateCanvasNodePositionsBatch,
  updateCanvasNodeStatus,
} from '@api/client';
import type { TCanvasOp } from './ops';
import { FLUSH_DEBOUNCE_MS, MAX_RETRIES, RETRY_BASE_MS } from './consts';

export type TSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface ISaveState {
  status: TSaveStatus;
  lastSavedAt: number | null;
}

type TStatusListener = (state: ISaveState) => void;

const initialState: ISaveState = { status: 'idle', lastSavedAt: null };

interface IQueueState {
  pending: TCanvasOp[];
  flushTimer: number | null;
  retryTimer: number | null;
  retries: number;
  inflight: boolean;
  saveState: ISaveState;
  listeners: Set<TStatusListener>;
}

const createQueueState = (): IQueueState => ({
  pending: [],
  flushTimer: null,
  retryTimer: null,
  retries: 0,
  inflight: false,
  saveState: initialState,
  listeners: new Set(),
});

const state: IQueueState = createQueueState();

const setSaveState = (next: Partial<ISaveState>) => {
  state.saveState = { ...state.saveState, ...next };
  for (const listener of state.listeners) listener(state.saveState);
};

export const subscribeSaveState = (listener: TStatusListener) => {
  state.listeners.add(listener);
  listener(state.saveState);
  return () => {
    state.listeners.delete(listener);
  };
};

export const getSaveState = () => state.saveState;

const clearTimer = (handle: number | null) => {
  if (handle !== null) window.clearTimeout(handle);
};

/**
 * Coalesce/dedupe rules:
 * - Multiple updateNodePosition for the same node id → keep only the latest.
 * - Multiple updateNodeLabel for the same node id → keep only the latest.
 * - Multiple updateNodeStatus for the same node id → keep only the latest.
 * - createCanvasNode/createReferenceNode followed by deleteNode for the same id →
 *   both ops drop entirely (the node never reached the server, so nothing to sync).
 * - createEdge followed by deleteEdge for the same id → both drop.
 *
 * The result is a queue with at most one of each "shape" per id, in arrival order.
 */
const coalesce = (ops: TCanvasOp[]): TCanvasOp[] => {
  const result: TCanvasOp[] = [];
  const lastIndex = new Map<string, number>();

  const overrideKey = (op: TCanvasOp): string | null => {
    if (
      op.type === 'updateNodePosition' ||
      op.type === 'updateNodeLabel' ||
      op.type === 'updateNodeStatus'
    ) {
      return `${op.type}:${op.id}`;
    }
    return null;
  };

  for (const op of ops) {
    if (op.type === 'deleteNode') {
      const createIdx = result.findIndex(
        (existing) =>
          (existing.type === 'createCanvasNode' ||
            existing.type === 'createReferenceNode') &&
          existing.id === op.id
      );
      if (createIdx !== -1) {
        const dropIds = new Set([op.id]);
        for (let i = result.length - 1; i >= 0; i--) {
          const existing = result[i];
          if (!existing) continue;
          if (
            (existing.type === 'updateNodePosition' ||
              existing.type === 'updateNodeLabel' ||
              existing.type === 'updateNodeStatus') &&
            dropIds.has(existing.id)
          ) {
            result.splice(i, 1);
          }
        }
        result.splice(createIdx, 1);
        rebuildLastIndex(result, lastIndex);
        continue;
      }
    }

    if (op.type === 'deleteEdge') {
      const createIdx = result.findIndex(
        (existing) => existing.type === 'createEdge' && existing.id === op.id
      );
      if (createIdx !== -1) {
        result.splice(createIdx, 1);
        rebuildLastIndex(result, lastIndex);
        continue;
      }
    }

    const key = overrideKey(op);
    if (key !== null) {
      const prevIdx = lastIndex.get(key);
      if (prevIdx !== undefined) {
        result[prevIdx] = op;
        continue;
      }
      lastIndex.set(key, result.length);
    }

    result.push(op);
  }

  return result;
};

const rebuildLastIndex = (ops: TCanvasOp[], lastIndex: Map<string, number>) => {
  lastIndex.clear();
  for (let i = 0; i < ops.length; i++) {
    const op = ops[i];
    if (!op) continue;
    if (
      op.type === 'updateNodePosition' ||
      op.type === 'updateNodeLabel' ||
      op.type === 'updateNodeStatus'
    ) {
      lastIndex.set(`${op.type}:${op.id}`, i);
    }
  }
};

/**
 * Run ops sequentially so that ordering invariants hold (e.g. a node must be
 * created before an edge that references it). Position updates are squashed
 * into a single batched call appended at the end — they have no dependency
 * relationship with anything else in a flush window.
 */
const runOps = async (ops: TCanvasOp[]) => {
  const positions: { id: string; x: number; y: number }[] = [];

  for (const op of ops) {
    if (op.type === 'updateNodePosition') {
      positions.push({ id: op.id, x: op.x, y: op.y });
      continue;
    }
    await runSingleOp(op);
  }

  if (positions.length > 0) {
    await updateCanvasNodePositionsBatch(positions);
  }
};

const runSingleOp = async (op: TCanvasOp) => {
  switch (op.type) {
    case 'createCanvasNode':
      return createCanvasNode({
        id: op.id,
        threadId: op.threadId,
        type: 'canvas-node',
        x: op.x,
        y: op.y,
        label: op.label,
      });
    case 'createReferenceNode':
      return createCanvasNode({
        id: op.id,
        threadId: op.threadId,
        type: 'reference-node',
        x: op.x,
        y: op.y,
        label: op.data.label,
        sourceThreadId: op.data.sourceThreadId,
      });
    case 'deleteNode':
      return deleteCanvasNode(op.id);
    case 'updateNodeLabel':
      return updateCanvasNodeLabel(op.id, op.label);
    case 'updateNodeStatus':
      return updateCanvasNodeStatus(op.id, op.status);
    case 'createEdge':
      return createCanvasEdge({
        id: op.id,
        threadId: op.threadId,
        sourceNodeId: op.source,
        targetNodeId: op.target,
        sourceHandle: op.sourceHandle,
        targetHandle: op.targetHandle,
      });
    case 'deleteEdge':
      return deleteCanvasEdge(op.id);
    case 'createComment':
      return createNodeComment({
        id: op.id,
        nodeId: op.nodeId,
        text: op.text,
      });
    case 'updateNodePosition':
      // handled in batch above
      return;
  }
};

const scheduleFlush = () => {
  clearTimer(state.flushTimer);
  state.flushTimer = window.setTimeout(() => {
    state.flushTimer = null;
    void flushNow();
  }, FLUSH_DEBOUNCE_MS);
};

export const enqueueOp = (op: TCanvasOp) => {
  state.pending.push(op);
  setSaveState({ status: 'saving' });
  scheduleFlush();
};

export const flushNow = async (): Promise<void> => {
  if (state.inflight) return;
  if (state.pending.length === 0) {
    if (state.saveState.status === 'saving') setSaveState({ status: 'saved' });
    return;
  }

  clearTimer(state.flushTimer);
  state.flushTimer = null;

  const batch = coalesce(state.pending);
  state.pending = [];
  state.inflight = true;

  try {
    await runOps(batch);
    state.retries = 0;
    state.inflight = false;
    setSaveState({ status: 'saved', lastSavedAt: Date.now() });
    if (state.pending.length > 0) scheduleFlush();
  } catch (error) {
    state.inflight = false;
    state.pending = [...batch, ...state.pending];

    if (state.retries < MAX_RETRIES) {
      state.retries += 1;
      const delay = RETRY_BASE_MS * 2 ** (state.retries - 1);
      setSaveState({ status: 'saving' });
      clearTimer(state.retryTimer);
      state.retryTimer = window.setTimeout(() => {
        state.retryTimer = null;
        void flushNow();
      }, delay);
    } else {
      setSaveState({ status: 'error' });
      console.error('[canvas-sync] flush failed', error);
    }
  }
};

export const resetQueue = () => {
  clearTimer(state.flushTimer);
  clearTimer(state.retryTimer);
  state.pending = [];
  state.flushTimer = null;
  state.retryTimer = null;
  state.retries = 0;
  state.inflight = false;
  setSaveState({ status: 'idle', lastSavedAt: null });
};

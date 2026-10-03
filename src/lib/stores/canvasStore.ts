'use client';

import {
  type Connection,
  type Edge,
  type Node,
  type OnEdgesChange,
  type OnNodesChange,
  type XYPosition,
  applyEdgeChanges,
  applyNodeChanges,
} from '@xyflow/react';
import { temporal } from 'zundo';
import { create } from 'zustand';

import {
  ECanvasNodeType,
  type ICanvasNodeData,
  type ICanvasSnapshot,
  type IComment,
  type IReferenceNodeData,
  type TCanvasNode,
  type TCanvasOperation,
  type TFitPadding,
  type TNodeStatus,
  type TReferenceNode,
} from '@interfaces';

import { ECanvasTool } from '@/components/tools';
import {
  CANVAS_HISTORY_LIMIT,
  DUPLICATE_NODE_OFFSET,
  detectPositionChanges,
  emitCanvasOperation,
  hasValidatedParent,
  isCanvasNodeData,
  isHandleId,
  isReferenceNodeData,
  withReverseEdgeIds,
} from '@/lib/canvas';
import { canEditNode } from '@/lib/utils';

import { usePermissionsStore } from './permissionsStore';

interface IPersistedSnapshot {
  nodes: Node[];
  edges: Edge[];
}

interface ICanvasState extends IPersistedSnapshot {
  threadId: string | null;
  hydrated: boolean;
  activeTool: ECanvasTool;
  pendingConnection: string | null;
  referenceSearchPosition: XYPosition | null;
  editingNodeId: string | null;
  openCommentsNodeId: string | null;
  middlePan: boolean;
  fitRequest: number;
  fitPadding: TFitPadding | null;
}

interface ICanvasStore extends ICanvasState {
  loadCanvas: (threadId: string, snapshot: ICanvasSnapshot) => void;
  clearCanvas: () => void;
  setActiveTool: (tool: ECanvasTool) => void;
  closeAllOverlays: () => void;
  setOpenCommentsNodeId: (id: string | null) => void;
  setMiddlePan: (active: boolean) => void;
  requestFit: (padding?: TFitPadding) => void;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  addNode: (position: XYPosition, label: string, id?: string) => void;
  addReferenceNode: (position: XYPosition, data: IReferenceNodeData) => void;
  setReferenceSearchPosition: (position: XYPosition | null) => void;
  deleteNode: (id: string) => void;
  deleteEdge: (id: string) => void;
  deleteElements: (nodeIds: string[], edgeIds: string[]) => void;
  connectNodes: (connection: Connection) => void;
  setPendingConnection: (nodeId: string | null) => void;
  setNodesStatus: (ids: string[], status: TNodeStatus) => void;
  setNodeAnswer: (id: string) => void;
  updateNodeLabel: (id: string, label: string) => void;
  addComment: (nodeId: string, text: string) => void;
  deleteComment: (nodeId: string, commentId: string) => void;
  duplicateNode: (id: string) => void;
  setEditingNodeId: (id: string | null) => void;
  clearNewFlag: (id: string) => void;
  undo: () => void;
  redo: () => void;
}

const CLEARED_OVERLAYS = {
  pendingConnection: null,
  referenceSearchPosition: null,
  editingNodeId: null,
  openCommentsNodeId: null,
} as const;

const EMPTY_CANVAS_STATE: Omit<ICanvasState, 'threadId' | 'hydrated' | 'fitRequest' | 'fitPadding'> = {
  nodes: [],
  edges: [],
  activeTool: ECanvasTool.Select,
  ...CLEARED_OVERLAYS,
  middlePan: false,
};

const INITIAL_STATE: ICanvasState = {
  threadId: null,
  hydrated: false,
  fitRequest: 0,
  fitPadding: null,
  ...EMPTY_CANVAS_STATE,
};

const snapshotOf = (state: IPersistedSnapshot): IPersistedSnapshot => ({
  nodes: state.nodes,
  edges: state.edges,
});

const toCreateOperations = (
  id: string,
  threadId: string,
  { x, y }: XYPosition,
  { label, status, isAnswer, comments }: ICanvasNodeData,
): TCanvasOperation[] => {
  const ops: TCanvasOperation[] = [{ type: 'createCanvasNode', id, threadId, x, y, label }];

  if (status !== null) ops.push({ type: 'updateNodeStatus', id, status });
  if (isAnswer) ops.push({ type: 'updateNodeAnswer', id, isAnswer });
  comments.forEach((comment) => ops.push({ type: 'createComment', id: comment.id, nodeId: id, text: comment.text }));

  return ops;
};

const diffNodeAdditions = (
  ops: TCanvasOperation[],
  nextNodeMap: Map<string, Node>,
  prevNodeMap: Map<string, Node>,
  threadId: string,
): void => {
  nextNodeMap.forEach((node, id) => {
    if (prevNodeMap.has(id)) return;
    if (node.type === ECanvasNodeType.Question) return;

    if (node.type === ECanvasNodeType.Reference) {
      if (!isReferenceNodeData(node.data)) return;

      ops.push({
        type: 'createReferenceNode',
        id,
        threadId,
        x: node.position.x,
        y: node.position.y,
        data: node.data,
      });

      return;
    }

    if (!isCanvasNodeData(node.data)) return;

    ops.push(...toCreateOperations(id, threadId, node.position, node.data));
  });
};

const diffNodeUpdates = (
  ops: TCanvasOperation[],
  nextNodeMap: Map<string, Node>,
  prevNodeMap: Map<string, Node>,
): void => {
  nextNodeMap.forEach((nextNode, id) => {
    const prevNode = prevNodeMap.get(id);
    if (!prevNode) return;

    if (prevNode.position.x !== nextNode.position.x || prevNode.position.y !== nextNode.position.y) {
      ops.push({
        type: 'updateNodePosition',
        id,
        x: nextNode.position.x,
        y: nextNode.position.y,
      });
    }

    if (!isCanvasNodeData(prevNode.data) || !isCanvasNodeData(nextNode.data)) {
      return;
    }

    if (prevNode.data.label !== nextNode.data.label) {
      ops.push({ type: 'updateNodeLabel', id, label: nextNode.data.label });
    }

    if (prevNode.data.status !== nextNode.data.status) {
      ops.push({
        type: 'updateNodeStatus',
        id,
        status: nextNode.data.status,
      });
    }

    if (prevNode.data.isAnswer !== nextNode.data.isAnswer) {
      ops.push({ type: 'updateNodeAnswer', id, isAnswer: nextNode.data.isAnswer });
    }

    const prevCommentIds = new Set(prevNode.data.comments.map((c) => c.id));
    const nextCommentIds = new Set(nextNode.data.comments.map((c) => c.id));

    prevNode.data.comments.forEach((comment) => {
      if (nextCommentIds.has(comment.id)) return;
      ops.push({ type: 'deleteComment', id: comment.id });
    });

    nextNode.data.comments.forEach((comment) => {
      if (prevCommentIds.has(comment.id)) return;
      ops.push({
        type: 'createComment',
        id: comment.id,
        nodeId: id,
        text: comment.text,
      });
    });
  });
};

const diffEdges = (
  ops: TCanvasOperation[],
  prev: IPersistedSnapshot,
  next: IPersistedSnapshot,
  threadId: string,
): void => {
  const prevEdgeMap = new Map(prev.edges.map((edge) => [edge.id, edge]));
  const nextEdgeMap = new Map(next.edges.map((edge) => [edge.id, edge]));

  prevEdgeMap.forEach((_, id) => {
    if (!nextEdgeMap.has(id)) ops.push({ type: 'deleteEdge', id });
  });

  nextEdgeMap.forEach((edge, id) => {
    if (prevEdgeMap.has(id)) return;

    const sourceHandle = isHandleId(edge.sourceHandle) ? edge.sourceHandle : 'right';
    const targetHandle = isHandleId(edge.targetHandle) ? edge.targetHandle : 'left';

    ops.push({
      type: 'createEdge',
      id,
      threadId,
      source: edge.source,
      target: edge.target,
      sourceHandle,
      targetHandle,
    });
  });
};

const diffStates = (
  prev: IPersistedSnapshot,
  next: IPersistedSnapshot,
  threadId: string | null,
): TCanvasOperation[] => {
  if (!threadId) return [];

  const ops: TCanvasOperation[] = [];
  const prevNodeMap = new Map(prev.nodes.map((node) => [node.id, node]));
  const nextNodeMap = new Map(next.nodes.map((node) => [node.id, node]));

  prevNodeMap.forEach((_, id) => {
    if (!nextNodeMap.has(id)) ops.push({ type: 'deleteNode', id });
  });

  diffNodeAdditions(ops, nextNodeMap, prevNodeMap, threadId);
  diffNodeUpdates(ops, nextNodeMap, prevNodeMap);
  diffEdges(ops, prev, next, threadId);

  return ops;
};

const sameComments = (a: IComment[], b: IComment[]): boolean =>
  a.length === b.length &&
  a.every((comment, index) => {
    const other = b[index];

    return comment.id === other?.id && comment.text === other.text;
  });

const sameNodeContent = (a: Node, b: Node): boolean => {
  if (a.position.x !== b.position.x || a.position.y !== b.position.y) return false;

  if (isCanvasNodeData(a.data) && isCanvasNodeData(b.data)) {
    return (
      a.data.label === b.data.label &&
      a.data.status === b.data.status &&
      a.data.isAnswer === b.data.isAnswer &&
      sameComments(a.data.comments, b.data.comments)
    );
  }

  return a.data === b.data;
};

const sameNodes = (a: Node[], b: Node[]): boolean =>
  a.length === b.length &&
  a.every((node, index) => {
    const other = b[index];

    return other !== undefined && node.id === other.id && sameNodeContent(node, other);
  });

const sameEdges = (a: Edge[], b: Edge[]): boolean =>
  a.length === b.length &&
  a.every((edge, index) => {
    const other = b[index];

    return (
      other !== undefined &&
      edge.id === other.id &&
      edge.source === other.source &&
      edge.target === other.target &&
      edge.sourceHandle === other.sourceHandle &&
      edge.targetHandle === other.targetHandle
    );
  });

export const useCanvasStore = create<ICanvasStore>()(
  temporal(
    (set, get) => {
      let dragOrigin: Node[] | null = null;

      const appendNode = (node: TCanvasNode | TReferenceNode, extra?: Partial<ICanvasState>) => {
        set({ nodes: [...get().nodes, node], ...extra });
      };

      const patchCanvasNodes = (
        matches: (id: string) => boolean,
        patch: (data: ICanvasNodeData, id: string) => Partial<ICanvasNodeData>,
      ) =>
        set({
          nodes: get().nodes.map((node) =>
            matches(node.id) && isCanvasNodeData(node.data)
              ? { ...node, data: { ...node.data, ...patch(node.data, node.id) } }
              : node,
          ),
        });

      const withoutHistory = (update: () => void) => {
        const temporalApi = useCanvasStore.temporal.getState();
        temporalApi.pause();
        update();
        temporalApi.resume();
      };

      const replayDiff = (before: IPersistedSnapshot) => {
        diffStates(before, snapshotOf(get()), get().threadId).forEach(emitCanvasOperation);
      };

      const resetState = (overrides: Partial<ICanvasState>) => {
        dragOrigin = null;
        withoutHistory(() => {
          set({ ...EMPTY_CANVAS_STATE, ...overrides });
          useCanvasStore.temporal.getState().clear();
        });
      };

      const removeElements = (nodeIds: string[], edgeIds: string[]) => {
        const state = get();
        const access = usePermissionsStore.getState();
        if (!access.canEditCanvas) return;

        const removedNodeIds = new Set(
          state.nodes
            .filter(
              (node) =>
                nodeIds.includes(node.id) &&
                node.type !== ECanvasNodeType.Question &&
                canEditNode(node.data.createdBy, access),
            )
            .map((node) => node.id),
        );
        const pickedEdgeIds = new Set(withReverseEdgeIds(state.edges, edgeIds));
        const isAttached = (edge: Edge) => removedNodeIds.has(edge.source) || removedNodeIds.has(edge.target);
        const removedEdges = state.edges.filter((edge) => pickedEdgeIds.has(edge.id) || isAttached(edge));
        if (removedNodeIds.size === 0 && removedEdges.length === 0) return;

        const isRemovedNode = (id: string | null) => id !== null && removedNodeIds.has(id);

        set({
          nodes: state.nodes.filter((node) => !removedNodeIds.has(node.id)),
          edges: state.edges.filter((edge) => !removedEdges.includes(edge)),
          ...(isRemovedNode(state.editingNodeId) && { editingNodeId: null }),
          ...(isRemovedNode(state.openCommentsNodeId) && { openCommentsNodeId: null }),
          ...(isRemovedNode(state.pendingConnection) && { pendingConnection: null }),
        });
        removedNodeIds.forEach((id) => emitCanvasOperation({ type: 'deleteNode', id }));
        removedEdges
          .filter((edge) => !isAttached(edge))
          .forEach((edge) => emitCanvasOperation({ type: 'deleteEdge', id: edge.id }));
      };

      return {
        ...INITIAL_STATE,

        loadCanvas: (threadId, snapshot) => {
          resetState({
            threadId,
            hydrated: true,
            nodes: snapshot.nodes,
            edges: snapshot.edges,
          });
        },

        clearCanvas: () => resetState({ threadId: null, hydrated: false }),

        setActiveTool: (tool) => {
          const state = get();
          if (state.activeTool === tool) return;

          const hasSelectedNode = state.nodes.some((node) => node.selected);
          const hasSelectedEdge = state.edges.some((edge) => edge.selected);
          const needsClear = hasSelectedNode || hasSelectedEdge;

          const temporalApi = useCanvasStore.temporal.getState();
          if (needsClear) temporalApi.pause();

          set({
            activeTool: tool,
            ...(hasSelectedNode && {
              nodes: state.nodes.map((node) => (node.selected ? { ...node, selected: false } : node)),
            }),
            ...(hasSelectedEdge && {
              edges: state.edges.map((edge) => (edge.selected ? { ...edge, selected: false } : edge)),
            }),
            ...CLEARED_OVERLAYS,
          });

          if (needsClear) temporalApi.resume();
        },

        closeAllOverlays: () => set({ ...CLEARED_OVERLAYS }),

        setEditingNodeId: (id) =>
          set(id === null ? { editingNodeId: null } : { editingNodeId: id, openCommentsNodeId: null }),

        setOpenCommentsNodeId: (id) =>
          set(id === null ? { openCommentsNodeId: null } : { openCommentsNodeId: id, editingNodeId: null }),

        requestFit: (padding) => set((state) => ({ fitRequest: state.fitRequest + 1, fitPadding: padding ?? null })),

        setMiddlePan: (active) => set({ middlePan: active }),

        onNodesChange: (changes) => {
          const prev = get().nodes;
          const { canEditCanvas } = usePermissionsStore.getState();

          const allowed = changes.filter(
            (change) => change.type !== 'remove' && (canEditCanvas || change.type !== 'position'),
          );

          const next = applyNodeChanges(allowed, prev);

          const isDragging = allowed.some((change) => change.type === 'position' && change.dragging === true);
          const positionEnd = allowed.some((change) => change.type === 'position' && change.dragging === false);

          const temporalApi = useCanvasStore.temporal.getState();

          if (isDragging) {
            dragOrigin ??= prev;
            temporalApi.pause();
            set({ nodes: next });

            return;
          }

          if (positionEnd) {
            const origin = dragOrigin ?? prev;
            dragOrigin = null;

            withoutHistory(() => set({ nodes: origin }));
            set({ nodes: next });

            detectPositionChanges(origin, next).forEach((change) =>
              emitCanvasOperation({
                type: 'updateNodePosition',
                id: change.id,
                x: change.x,
                y: change.y,
              }),
            );

            return;
          }

          set({ nodes: next });
        },

        onEdgesChange: (changes) =>
          set({
            edges: applyEdgeChanges(
              changes.filter((change) => change.type !== 'remove'),
              get().edges,
            ),
          }),

        addNode: (position, label, id = crypto.randomUUID()) => {
          const { threadId } = get();
          if (!threadId) return;

          const access = usePermissionsStore.getState();
          if (!access.canEditCanvas) return;

          const newNode: TCanvasNode = {
            id,
            type: ECanvasNodeType.Canvas,
            position,
            data: {
              label,
              status: null,
              isAnswer: false,
              comments: [],
              createdBy: access.userId ?? undefined,
              isNew: true,
            },
          };

          appendNode(newNode);
          toCreateOperations(id, threadId, position, newNode.data).forEach(emitCanvasOperation);
        },

        addReferenceNode: (position, data) => {
          const { threadId } = get();
          if (!threadId) return;

          const access = usePermissionsStore.getState();
          if (!access.canEditCanvas) return;

          const id = crypto.randomUUID();
          const newNode: TReferenceNode = {
            id,
            type: ECanvasNodeType.Reference,
            position,
            data: { ...data, createdBy: access.userId ?? undefined },
          };

          appendNode(newNode, { referenceSearchPosition: null });
          emitCanvasOperation({
            type: 'createReferenceNode',
            id,
            threadId,
            x: position.x,
            y: position.y,
            data,
          });
        },

        setReferenceSearchPosition: (position) => set({ referenceSearchPosition: position }),

        deleteNode: (id) => removeElements([id], []),

        deleteEdge: (id) => removeElements([], [id]),

        deleteElements: removeElements,

        connectNodes: (connection) => {
          const { source, target } = connection;
          const cancel = () => set({ pendingConnection: null });

          if (!usePermissionsStore.getState().canEditCanvas) return cancel();
          if (!source || !target || source === target) return cancel();

          const sourceHandle = connection.sourceHandle ?? 'right';
          const targetHandle = connection.targetHandle ?? 'left';

          if (!isHandleId(sourceHandle) || !isHandleId(targetHandle)) {
            return cancel();
          }

          const { edges, threadId } = get();
          if (!threadId) return cancel();

          const isDuplicate = edges.some((edge) => edge.source === source && edge.target === target);
          if (isDuplicate) return cancel();

          const id = crypto.randomUUID();
          const newEdge: Edge = {
            id,
            source,
            target,
            sourceHandle,
            targetHandle,
            type: 'default',
          };

          set({
            edges: [...edges, newEdge],
            pendingConnection: null,
          });

          emitCanvasOperation({
            type: 'createEdge',
            id,
            threadId,
            source,
            target,
            sourceHandle,
            targetHandle,
          });
        },

        setPendingConnection: (nodeId) => set({ pendingConnection: nodeId }),

        setNodesStatus: (ids, status) => {
          if (!usePermissionsStore.getState().canEditCanvas) return;

          const currentNodes = get().nodes;
          const idSet = new Set(ids);
          const touched = currentNodes.filter(
            (node) => idSet.has(node.id) && node.type === ECanvasNodeType.Canvas && isCanvasNodeData(node.data),
          );
          if (touched.length === 0) return;

          const allMatch = touched.every((node) => node.data.status === status);
          const nextStatus: TNodeStatus = allMatch ? null : status;
          const touchedIds = touched.map((node) => node.id);

          const applyIds =
            nextStatus === 'valid'
              ? touchedIds.filter((id) => hasValidatedParent(id, currentNodes, get().edges))
              : touchedIds;
          if (applyIds.length === 0) return;

          const applySet = new Set(applyIds);

          patchCanvasNodes(
            (id) => applySet.has(id),
            () => ({ status: nextStatus }),
          );

          applyIds.forEach((id) =>
            emitCanvasOperation({
              type: 'updateNodeStatus',
              id,
              status: nextStatus,
            }),
          );
        },

        setNodeAnswer: (id) => {
          if (!usePermissionsStore.getState().canEditCanvas) return;

          const currentNodes = get().nodes;
          const target = currentNodes.find((node) => node.id === id);
          if (target?.type !== ECanvasNodeType.Canvas || !isCanvasNodeData(target.data)) return;

          const nextValue = !target.data.isAnswer;
          if (nextValue && !hasValidatedParent(id, currentNodes, get().edges)) return;

          const answerFor = (nodeId: string) => nodeId === id && nextValue;
          const changedIds = new Set(
            currentNodes
              .filter((node) => isCanvasNodeData(node.data) && (node.id === id || (nextValue && node.data.isAnswer)))
              .map((node) => node.id),
          );

          patchCanvasNodes(
            (nodeId) => changedIds.has(nodeId),
            (_, nodeId) => ({ isAnswer: answerFor(nodeId) }),
          );
          changedIds.forEach((changedId) =>
            emitCanvasOperation({ type: 'updateNodeAnswer', id: changedId, isAnswer: answerFor(changedId) }),
          );
        },

        updateNodeLabel: (id, label) => {
          const target = get().nodes.find((node) => node.id === id);
          if (!target || !isCanvasNodeData(target.data)) return;
          if (!canEditNode(target.data.createdBy, usePermissionsStore.getState())) return;

          patchCanvasNodes(
            (nodeId) => nodeId === id,
            () => ({ label }),
          );
          emitCanvasOperation({ type: 'updateNodeLabel', id, label });
        },

        duplicateNode: (id) => {
          const { nodes, threadId } = get();
          if (!threadId) return;

          const access = usePermissionsStore.getState();
          if (!access.canEditCanvas) return;

          const source = nodes.find((node) => node.id === id);
          if (source?.type !== ECanvasNodeType.Canvas) return;
          if (!isCanvasNodeData(source.data)) return;

          const newNodeId = crypto.randomUUID();
          const position = {
            x: source.position.x + DUPLICATE_NODE_OFFSET,
            y: source.position.y + DUPLICATE_NODE_OFFSET,
          };
          const data: ICanvasNodeData = {
            label: source.data.label,
            status: source.data.status,
            isAnswer: false,
            comments: [],
            createdBy: access.userId ?? undefined,
            isNew: true,
          };

          appendNode({
            id: newNodeId,
            type: ECanvasNodeType.Canvas,
            position,
            data,
          } satisfies TCanvasNode);
          toCreateOperations(newNodeId, threadId, position, data).forEach(emitCanvasOperation);
        },

        addComment: (nodeId, text) => {
          const { userId, canComment } = usePermissionsStore.getState();
          if (!userId || !canComment) return;

          const id = crypto.randomUUID();
          const comment: IComment = { id, text, authorId: userId };

          patchCanvasNodes(
            (candidateId) => candidateId === nodeId,
            (data) => ({ comments: [...data.comments, comment] }),
          );

          emitCanvasOperation({ type: 'createComment', id, nodeId, text });
        },

        deleteComment: (nodeId, commentId) => {
          const { canComment, userId } = usePermissionsStore.getState();
          if (!canComment) return;

          const target = get().nodes.find((node) => node.id === nodeId);
          const comment =
            target && isCanvasNodeData(target.data) ? target.data.comments.find((c) => c.id === commentId) : null;
          if (comment?.authorId !== userId) return;

          patchCanvasNodes(
            (id) => id === nodeId,
            (data) => ({ comments: data.comments.filter((c) => c.id !== commentId) }),
          );
          emitCanvasOperation({ type: 'deleteComment', id: commentId });
        },

        clearNewFlag: (id) => {
          const target = get().nodes.find((node) => node.id === id);
          if (!target || !('isNew' in target.data)) return;

          withoutHistory(() =>
            set({
              nodes: get().nodes.map((node) => {
                if (node.id !== id) return node;
                const data = { ...node.data };
                delete data.isNew;

                return { ...node, data };
              }),
            }),
          );
        },

        undo: () => {
          const temporalApi = useCanvasStore.temporal.getState();
          if (temporalApi.pastStates.length === 0) return;

          const before = snapshotOf(get());
          temporalApi.undo();
          replayDiff(before);
        },

        redo: () => {
          const temporalApi = useCanvasStore.temporal.getState();
          if (temporalApi.futureStates.length === 0) return;

          const before = snapshotOf(get());
          temporalApi.redo();
          replayDiff(before);
        },
      };
    },
    {
      partialize: (state) => snapshotOf(state),
      limit: CANVAS_HISTORY_LIMIT,
      equality: (a, b) => sameNodes(a.nodes, b.nodes) && sameEdges(a.edges, b.edges),
    },
  ),
);

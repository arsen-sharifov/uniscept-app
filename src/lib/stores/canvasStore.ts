'use client';

import { create } from 'zustand';
import { temporal } from 'zundo';
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
import {
  ECanvasNodeType,
  type ICanvasNodeData,
  type ICanvasSnapshot,
  type IComment,
  type IReferenceNodeData,
  type TCanvasNode,
  type TCanvasOperation,
  type TNodeStatus,
  type TReferenceNode,
} from '@interfaces';
import { ECanvasTool } from '@/components/tools';
import { detectPositionChanges, emitCanvasOperation, isHandleId } from '@/lib/canvas';
import { isCanvasNodeData, isReferenceNodeData } from '@/components/Canvas/utils';

const MAX_HISTORY = 100;
const DUPLICATE_OFFSET = 24;

const CLEARED_OVERLAYS = {
  pendingConnection: null,
  referenceSearchPosition: null,
  editingNodeId: null,
  openCommentsNodeId: null,
} as const;

const EMPTY_CANVAS_STATE = {
  nodes: [] as Node[],
  edges: [] as Edge[],
  canvasComments: [] as IComment[],
  activeTool: ECanvasTool.Select,
  pendingConnection: null,
  referenceSearchPosition: null,
  editingNodeId: null,
  openCommentsNodeId: null,
  canvasCommentsOpen: false,
  middlePan: false,
} as const;

interface IPersistedSnapshot {
  nodes: Node[];
  edges: Edge[];
  canvasComments: IComment[];
}

interface ICanvasStore extends IPersistedSnapshot {
  threadId: string | null;
  userId: string | null;
  hydrated: boolean;
  activeTool: ECanvasTool;
  pendingConnection: string | null;
  referenceSearchPosition: XYPosition | null;
  editingNodeId: string | null;
  openCommentsNodeId: string | null;
  canvasCommentsOpen: boolean;
  middlePan: boolean;

  loadCanvas: (threadId: string, userId: string | null, snapshot: ICanvasSnapshot) => void;
  clearCanvas: () => void;
  setActiveTool: (tool: ECanvasTool) => void;
  closeAllOverlays: () => void;
  setOpenCommentsNodeId: (id: string | null) => void;
  setCanvasCommentsOpen: (open: boolean) => void;
  setMiddlePan: (active: boolean) => void;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  addNode: (position: XYPosition, label: string) => void;
  addReferenceNode: (position: XYPosition, data: IReferenceNodeData) => void;
  setReferenceSearchPosition: (position: XYPosition | null) => void;
  deleteNode: (id: string) => void;
  deleteEdge: (id: string) => void;
  connectNodes: (connection: Connection) => void;
  setPendingConnection: (nodeId: string | null) => void;
  setNodesStatus: (ids: string[], status: TNodeStatus) => void;
  updateNodeLabel: (id: string, label: string) => void;
  addComment: (nodeId: string, text: string) => void;
  deleteComment: (nodeId: string, commentId: string) => void;
  addCanvasComment: (text: string) => void;
  deleteCanvasComment: (commentId: string) => void;
  duplicateNode: (id: string) => void;
  setEditingNodeId: (id: string | null) => void;
  clearNewFlag: (id: string) => void;
  undo: () => void;
  redo: () => void;
}

const snapshotOf = (state: IPersistedSnapshot): IPersistedSnapshot => ({
  nodes: state.nodes,
  edges: state.edges,
  canvasComments: state.canvasComments,
});

const diffNodeAdditions = (
  ops: TCanvasOperation[],
  nextNodeMap: Map<string, Node>,
  prevNodeMap: Map<string, Node>,
  threadId: string
): void => {
  nextNodeMap.forEach((node, id) => {
    if (prevNodeMap.has(id)) return;

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

    ops.push({
      type: 'createCanvasNode',
      id,
      threadId,
      x: node.position.x,
      y: node.position.y,
      label: node.data.label,
    });

    if (node.data.status !== null) {
      ops.push({ type: 'updateNodeStatus', id, status: node.data.status });
    }

    node.data.comments.forEach((comment) =>
      ops.push({
        type: 'createComment',
        id: comment.id,
        nodeId: id,
        text: comment.text,
      })
    );
  });
};

const diffNodeUpdates = (
  ops: TCanvasOperation[],
  nextNodeMap: Map<string, Node>,
  prevNodeMap: Map<string, Node>
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
  threadId: string
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

const diffCanvasComments = (
  ops: TCanvasOperation[],
  prev: IPersistedSnapshot,
  next: IPersistedSnapshot,
  threadId: string
): void => {
  const prevMap = new Map(prev.canvasComments.map((c) => [c.id, c]));
  const nextMap = new Map(next.canvasComments.map((c) => [c.id, c]));

  prevMap.forEach((_, id) => {
    if (!nextMap.has(id)) ops.push({ type: 'deleteCanvasComment', id });
  });

  nextMap.forEach((comment, id) => {
    if (prevMap.has(id)) return;
    ops.push({
      type: 'createCanvasComment',
      id,
      threadId,
      text: comment.text,
    });
  });
};

const diffStates = (
  prev: IPersistedSnapshot,
  next: IPersistedSnapshot,
  threadId: string | null
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
  diffCanvasComments(ops, prev, next, threadId);

  return ops;
};

export const useCanvasStore = create<ICanvasStore>()(
  temporal(
    (set, get) => {
      const appendNode = (node: TCanvasNode | TReferenceNode, extra?: Partial<{ referenceSearchPosition: null }>) => {
        set({ nodes: [...get().nodes, node], ...(extra ?? {}) });
      };

      const replayDiff = (before: IPersistedSnapshot) => {
        diffStates(before, snapshotOf(get()), get().threadId).forEach(emitCanvasOperation);
      };

      const resetState = (overrides: Partial<ICanvasStore>) => {
        const temporalApi = useCanvasStore.temporal.getState();
        temporalApi.pause();
        set({ ...EMPTY_CANVAS_STATE, ...overrides });
        temporalApi.clear();
        temporalApi.resume();
      };

      return {
        threadId: null,
        userId: null,
        hydrated: false,
        ...EMPTY_CANVAS_STATE,

        loadCanvas: (threadId, userId, snapshot) => {
          resetState({
            threadId,
            userId,
            hydrated: true,
            nodes: snapshot.nodes,
            edges: snapshot.edges,
            canvasComments: snapshot.canvasComments,
          });
        },

        clearCanvas: () => resetState({ threadId: null, userId: null, hydrated: false }),

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

        setCanvasCommentsOpen: (open) => set({ canvasCommentsOpen: open }),

        setMiddlePan: (active) => set({ middlePan: active }),

        onNodesChange: (changes) => {
          const prev = get().nodes;
          const next = applyNodeChanges(changes, prev);

          const isDragging = changes.some((change) => change.type === 'position' && change.dragging === true);
          const positionEnd = changes.some((change) => change.type === 'position' && change.dragging === false);

          const temporalApi = useCanvasStore.temporal.getState();
          if (isDragging) temporalApi.pause();
          if (positionEnd) temporalApi.resume();

          set({ nodes: next });

          changes
            .filter((change) => change.type === 'remove')
            .forEach((change) => emitCanvasOperation({ type: 'deleteNode', id: change.id }));

          if (!positionEnd) return;

          detectPositionChanges(prev, next).forEach((change) =>
            emitCanvasOperation({
              type: 'updateNodePosition',
              id: change.id,
              x: change.x,
              y: change.y,
            })
          );
        },

        onEdgesChange: (changes) => {
          set({ edges: applyEdgeChanges(changes, get().edges) });

          changes
            .filter((change) => change.type === 'remove')
            .forEach((change) => emitCanvasOperation({ type: 'deleteEdge', id: change.id }));
        },

        addNode: (position, label) => {
          const { threadId } = get();
          if (!threadId) return;

          const id = crypto.randomUUID();
          const newNode: TCanvasNode = {
            id,
            type: ECanvasNodeType.Canvas,
            position,
            data: { label, status: null, comments: [], isNew: true },
          };

          appendNode(newNode);
          emitCanvasOperation({
            type: 'createCanvasNode',
            id,
            threadId,
            x: position.x,
            y: position.y,
            label,
          });
        },

        addReferenceNode: (position, data) => {
          const { threadId } = get();
          if (!threadId) return;

          const id = crypto.randomUUID();
          const newNode: TReferenceNode = {
            id,
            type: ECanvasNodeType.Reference,
            position,
            data,
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

        deleteNode: (id) => {
          const state = get();

          set({
            nodes: state.nodes.filter((n) => n.id !== id),
            edges: state.edges.filter((e) => e.source !== id && e.target !== id),
            ...(state.editingNodeId === id && { editingNodeId: null }),
            ...(state.openCommentsNodeId === id && {
              openCommentsNodeId: null,
            }),
            ...(state.pendingConnection === id && { pendingConnection: null }),
          });
          emitCanvasOperation({ type: 'deleteNode', id });
        },

        deleteEdge: (id) => {
          set({ edges: get().edges.filter((e) => e.id !== id) });
          emitCanvasOperation({ type: 'deleteEdge', id });
        },

        connectNodes: (connection) => {
          const { source, target } = connection;
          const cancel = () => set({ pendingConnection: null });

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
          const idSet = new Set(ids);
          const touchedIds: string[] = [];
          let allMatch = true;

          get().nodes.forEach((node) => {
            if (!idSet.has(node.id)) return;
            if (node.type !== ECanvasNodeType.Canvas) return;
            if (!isCanvasNodeData(node.data)) return;

            if (node.data.status !== status) allMatch = false;
            touchedIds.push(node.id);
          });
          if (touchedIds.length === 0) return;

          const nextStatus: TNodeStatus = allMatch ? null : status;
          const touchedSet = new Set(touchedIds);

          set({
            nodes: get().nodes.map((node) => {
              if (!touchedSet.has(node.id)) return node;
              if (!isCanvasNodeData(node.data)) return node;
              const data: ICanvasNodeData = { ...node.data, status: nextStatus };
              return { ...node, data };
            }),
          });

          touchedIds.forEach((id) =>
            emitCanvasOperation({
              type: 'updateNodeStatus',
              id,
              status: nextStatus,
            })
          );
        },

        updateNodeLabel: (id, label) => {
          const target = get().nodes.find((node) => node.id === id);
          if (!target || !isCanvasNodeData(target.data)) return;

          set({
            nodes: get().nodes.map((node) => {
              if (node.id !== id) return node;
              if (!isCanvasNodeData(node.data)) return node;
              const data: ICanvasNodeData = { ...node.data, label };
              return { ...node, data };
            }),
          });
          emitCanvasOperation({ type: 'updateNodeLabel', id, label });
        },

        duplicateNode: (id) => {
          const { nodes, threadId } = get();
          if (!threadId) return;

          const source = nodes.find((node) => node.id === id);
          if (!source || source.type !== ECanvasNodeType.Canvas) return;
          if (!isCanvasNodeData(source.data)) return;

          const newNodeId = crypto.randomUUID();
          const position = {
            x: source.position.x + DUPLICATE_OFFSET,
            y: source.position.y + DUPLICATE_OFFSET,
          };
          const data: ICanvasNodeData = {
            label: source.data.label,
            status: source.data.status,
            comments: [],
            isNew: true,
          };

          appendNode({
            id: newNodeId,
            type: ECanvasNodeType.Canvas,
            position,
            data,
          } satisfies TCanvasNode);

          emitCanvasOperation({
            type: 'createCanvasNode',
            id: newNodeId,
            threadId,
            x: position.x,
            y: position.y,
            label: data.label,
          });

          if (data.status !== null) {
            emitCanvasOperation({
              type: 'updateNodeStatus',
              id: newNodeId,
              status: data.status,
            });
          }
        },

        addComment: (nodeId, text) => {
          const { userId } = get();
          if (!userId) return;

          const id = crypto.randomUUID();
          const comment: IComment = { id, text, authorId: userId };

          set({
            nodes: get().nodes.map((node) => {
              if (node.id !== nodeId) return node;
              if (!isCanvasNodeData(node.data)) return node;
              const data: ICanvasNodeData = {
                ...node.data,
                comments: [...node.data.comments, comment],
              };
              return { ...node, data };
            }),
          });

          emitCanvasOperation({ type: 'createComment', id, nodeId, text });
        },

        deleteComment: (nodeId, commentId) => {
          set({
            nodes: get().nodes.map((node) => {
              if (node.id !== nodeId) return node;
              if (!isCanvasNodeData(node.data)) return node;
              const data: ICanvasNodeData = {
                ...node.data,
                comments: node.data.comments.filter((c) => c.id !== commentId),
              };
              return { ...node, data };
            }),
          });
          emitCanvasOperation({ type: 'deleteComment', id: commentId });
        },

        addCanvasComment: (text) => {
          const { threadId, userId } = get();
          if (!threadId || !userId) return;

          const id = crypto.randomUUID();
          const comment: IComment = { id, text, authorId: userId };

          set({ canvasComments: [...get().canvasComments, comment] });
          emitCanvasOperation({
            type: 'createCanvasComment',
            id,
            threadId,
            text,
          });
        },

        deleteCanvasComment: (commentId) => {
          set({
            canvasComments: get().canvasComments.filter((c) => c.id !== commentId),
          });
          emitCanvasOperation({ type: 'deleteCanvasComment', id: commentId });
        },

        clearNewFlag: (id) => {
          const target = get().nodes.find((node) => node.id === id);
          if (!target || !('isNew' in target.data)) return;

          const temporalApi = useCanvasStore.temporal.getState();
          temporalApi.pause();
          set({
            nodes: get().nodes.map((node) => {
              if (node.id !== id) return node;
              const data = { ...node.data };
              delete data.isNew;
              return { ...node, data };
            }),
          });
          temporalApi.resume();
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
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
        canvasComments: state.canvasComments,
      }),
      limit: MAX_HISTORY,
      equality: (a, b) => a.nodes === b.nodes && a.edges === b.edges && a.canvasComments === b.canvasComments,
    }
  )
);

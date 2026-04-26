import { create } from 'zustand';
import {
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type Connection,
  type XYPosition,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import type {
  ICanvasData,
  ICanvasNodeData,
  IComment,
  IReferenceNodeData,
  TCanvasNode,
  TNodeStatus,
  TReferenceNode,
} from '@interfaces';
import { ECanvasTool } from '@/components/tools';
import {
  emitCanvasOp,
  isHandleId,
  rowToEdge,
  rowToNode,
  type TCanvasSnapshot,
} from '@/components/Canvas/sync';

const newId = () => crypto.randomUUID();

interface ICanvasStore {
  threadId: string | null;
  hydrated: boolean;
  activeTool: ECanvasTool;
  nodes: Node[];
  edges: Edge[];
  pendingConnection: string | null;
  referenceSearchPosition: XYPosition | null;
  _past: ICanvasData[];
  _future: ICanvasData[];

  loadCanvas: (threadId: string, snapshot: TCanvasSnapshot) => void;
  clearCanvas: () => void;
  setActiveTool: (tool: ECanvasTool) => void;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  addNode: (position: XYPosition) => void;
  addReferenceNode: (position: XYPosition, data: IReferenceNodeData) => void;
  setReferenceSearchPosition: (position: XYPosition | null) => void;
  deleteNode: (id: string) => void;
  deleteEdge: (id: string) => void;
  connectNodes: (connection: Connection) => void;
  setPendingConnection: (nodeId: string | null) => void;
  setNodeStatus: (id: string, status: TNodeStatus) => void;
  updateNodeLabel: (id: string, label: string) => void;
  addComment: (nodeId: string, text: string) => void;
  undo: () => void;
  redo: () => void;
}

const MAX_HISTORY = 100;

const detectPositionChanges = (
  prev: Node[],
  next: Node[]
): { id: string; x: number; y: number }[] => {
  const changed: { id: string; x: number; y: number }[] = [];
  const prevById = new Map(prev.map((n) => [n.id, n]));
  for (const node of next) {
    const before = prevById.get(node.id);
    if (!before) continue;
    if (
      before.position.x !== node.position.x ||
      before.position.y !== node.position.y
    ) {
      changed.push({ id: node.id, x: node.position.x, y: node.position.y });
    }
  }
  return changed;
};

export const useCanvasStore = create<ICanvasStore>((set, get) => {
  const saveSnapshot = () => {
    const { nodes, edges, _past } = get();
    set({
      _past: [..._past.slice(-(MAX_HISTORY - 1)), { nodes, edges }],
      _future: [],
    });
  };

  return {
    threadId: null,
    hydrated: false,
    activeTool: ECanvasTool.Select,
    nodes: [],
    edges: [],
    pendingConnection: null,
    referenceSearchPosition: null,
    _past: [],
    _future: [],

    loadCanvas: (threadId, snapshot) => {
      const nodes = snapshot.nodes.map((row) => {
        const referenceTarget = row.source_thread_id
          ? snapshot.referenceTargets[row.source_thread_id]
          : undefined;
        return rowToNode(
          row,
          snapshot.commentsByNode[row.id] ?? [],
          referenceTarget
        );
      });
      const edges = snapshot.edges.map(rowToEdge);
      set({
        threadId,
        hydrated: true,
        nodes,
        edges,
        activeTool: ECanvasTool.Select,
        pendingConnection: null,
        referenceSearchPosition: null,
        _past: [],
        _future: [],
      });
    },

    clearCanvas: () =>
      set({
        threadId: null,
        hydrated: false,
        nodes: [],
        edges: [],
        activeTool: ECanvasTool.Select,
        pendingConnection: null,
        referenceSearchPosition: null,
        _past: [],
        _future: [],
      }),

    setActiveTool: (tool) =>
      set({
        activeTool: tool,
        pendingConnection: null,
        referenceSearchPosition: null,
      }),

    onNodesChange: (changes) => {
      const prev = get().nodes;
      const removeIds = changes
        .filter((change) => change.type === 'remove')
        .map((change) => change.id);

      if (removeIds.length > 0) saveSnapshot();

      const next = applyNodeChanges(changes, prev);
      set({ nodes: next });

      for (const id of removeIds) {
        emitCanvasOp({ type: 'deleteNode', id });
      }

      const positionEnd = changes.some(
        (change) => change.type === 'position' && change.dragging === false
      );
      if (!positionEnd) return;

      for (const change of detectPositionChanges(prev, next)) {
        emitCanvasOp({
          type: 'updateNodePosition',
          id: change.id,
          x: change.x,
          y: change.y,
        });
      }
    },

    onEdgesChange: (changes) => {
      const removeIds = changes
        .filter((change) => change.type === 'remove')
        .map((change) => change.id);

      if (removeIds.length > 0) saveSnapshot();

      set({ edges: applyEdgeChanges(changes, get().edges) });

      for (const id of removeIds) {
        emitCanvasOp({ type: 'deleteEdge', id });
      }
    },

    addNode: (position) => {
      const { threadId } = get();
      if (!threadId) return;
      saveSnapshot();
      const id = newId();
      const label = 'New node';
      const newNode: TCanvasNode = {
        id,
        type: 'canvas-node',
        position,
        data: { label, status: null, comments: [] },
      };
      set({ nodes: [...get().nodes, newNode] });
      emitCanvasOp({
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
      saveSnapshot();
      const id = newId();
      const newNode: TReferenceNode = {
        id,
        type: 'reference-node',
        position,
        data,
      };
      set({ nodes: [...get().nodes, newNode], referenceSearchPosition: null });
      emitCanvasOp({
        type: 'createReferenceNode',
        id,
        threadId,
        x: position.x,
        y: position.y,
        data,
      });
    },

    setReferenceSearchPosition: (position) =>
      set({ referenceSearchPosition: position }),

    deleteNode: (id) => {
      saveSnapshot();
      set({
        nodes: get().nodes.filter((n) => n.id !== id),
        edges: get().edges.filter((e) => e.source !== id && e.target !== id),
      });
      // ON DELETE CASCADE handles attached edges on the server side.
      emitCanvasOp({ type: 'deleteNode', id });
    },

    deleteEdge: (id) => {
      saveSnapshot();
      set({ edges: get().edges.filter((e) => e.id !== id) });
      emitCanvasOp({ type: 'deleteEdge', id });
    },

    connectNodes: (connection) => {
      const { source, target } = connection;
      if (!source || !target || source === target) return;

      const sourceHandle = connection.sourceHandle ?? 'right';
      const targetHandle = connection.targetHandle ?? 'left';
      if (!isHandleId(sourceHandle) || !isHandleId(targetHandle)) return;

      const duplicate = get().edges.some(
        (e) =>
          e.source === source &&
          e.target === target &&
          (e.sourceHandle ?? null) === sourceHandle &&
          (e.targetHandle ?? null) === targetHandle
      );
      if (duplicate) return;

      const { threadId } = get();
      if (!threadId) return;

      saveSnapshot();
      const id = newId();
      const newEdge: Edge = {
        id,
        source,
        target,
        sourceHandle,
        targetHandle,
        type: 'default',
      };
      set({ edges: [...get().edges, newEdge], pendingConnection: null });
      emitCanvasOp({
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

    setNodeStatus: (id, status) => {
      saveSnapshot();
      let nextStatus: TNodeStatus = status;
      set({
        nodes: get().nodes.map((n) => {
          if (n.id !== id) return n;
          const data = n.data as ICanvasNodeData;
          nextStatus = data.status === status ? null : status;
          return { ...n, data: { ...data, status: nextStatus } };
        }),
      });
      emitCanvasOp({ type: 'updateNodeStatus', id, status: nextStatus });
    },

    updateNodeLabel: (id, label) => {
      saveSnapshot();
      set({
        nodes: get().nodes.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, label } } : n
        ),
      });
      emitCanvasOp({ type: 'updateNodeLabel', id, label });
    },

    addComment: (nodeId, text) => {
      saveSnapshot();
      const id = newId();
      const comment: IComment = { id, text };
      set({
        nodes: get().nodes.map((n) => {
          if (n.id !== nodeId) return n;
          const data = n.data as ICanvasNodeData;
          return {
            ...n,
            data: { ...data, comments: [...data.comments, comment] },
          };
        }),
      });
      emitCanvasOp({ type: 'createComment', id, nodeId, text });
    },

    undo: () => {
      const { _past, _future, nodes, edges } = get();
      const prev = _past.at(-1);
      if (!prev) return;
      set({
        nodes: prev.nodes,
        edges: prev.edges,
        _past: _past.slice(0, -1),
        _future: [{ nodes, edges }, ..._future],
      });
    },

    redo: () => {
      const { _past, _future, nodes, edges } = get();
      const next = _future.at(0);
      if (!next) return;
      set({
        nodes: next.nodes,
        edges: next.edges,
        _past: [..._past, { nodes, edges }],
        _future: _future.slice(1),
      });
    },
  };
});

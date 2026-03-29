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

interface ICanvasStore {
  activeTool: ECanvasTool;
  nodes: Node[];
  edges: Edge[];
  pendingConnection: string | null;
  referenceSearchPosition: XYPosition | null;
  _past: ICanvasData[];
  _future: ICanvasData[];

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

let nodeCounter = 0;

const MAX_HISTORY = 100;

export const useCanvasStore = create<ICanvasStore>((set, get) => {
  const saveSnapshot = () => {
    const { nodes, edges, _past } = get();
    set({
      _past: [..._past.slice(-(MAX_HISTORY - 1)), { nodes, edges }],
      _future: [],
    });
  };

  return {
    activeTool: ECanvasTool.Select,
    nodes: [],
    edges: [],
    pendingConnection: null,
    referenceSearchPosition: null,
    _past: [],
    _future: [],

    setActiveTool: (tool) =>
      set({
        activeTool: tool,
        pendingConnection: null,
        referenceSearchPosition: null,
      }),

    onNodesChange: (changes) =>
      set({ nodes: applyNodeChanges(changes, get().nodes) }),

    onEdgesChange: (changes) =>
      set({ edges: applyEdgeChanges(changes, get().edges) }),

    addNode: (position) => {
      saveSnapshot();
      const id = `node-${++nodeCounter}`;
      const newNode: TCanvasNode = {
        id,
        type: 'canvas-node',
        position,
        data: { label: `Node ${nodeCounter}`, status: null, comments: [] },
      };
      set({ nodes: [...get().nodes, newNode] });
    },

    addReferenceNode: (position, data) => {
      saveSnapshot();
      const id = `ref-${++nodeCounter}`;
      const newNode: TReferenceNode = {
        id,
        type: 'reference-node',
        position,
        data,
      };
      set({ nodes: [...get().nodes, newNode], referenceSearchPosition: null });
    },

    setReferenceSearchPosition: (position) =>
      set({ referenceSearchPosition: position }),

    deleteNode: (id) => {
      saveSnapshot();
      set({
        nodes: get().nodes.filter((n) => n.id !== id),
        edges: get().edges.filter((e) => e.source !== id && e.target !== id),
      });
    },

    deleteEdge: (id) => {
      saveSnapshot();
      set({ edges: get().edges.filter((e) => e.id !== id) });
    },

    connectNodes: (connection) => {
      const { source, target } = connection;
      if (!source || !target || source === target) return;

      const edgeId = `edge-${source}:${connection.sourceHandle ?? 'x'}-${target}:${connection.targetHandle ?? 'x'}`;
      if (get().edges.some((e) => e.id === edgeId)) return;

      saveSnapshot();
      const newEdge: Edge = {
        id: edgeId,
        source,
        target,
        sourceHandle: connection.sourceHandle ?? null,
        targetHandle: connection.targetHandle ?? null,
        type: 'default',
      };
      set({ edges: [...get().edges, newEdge], pendingConnection: null });
    },

    setPendingConnection: (nodeId) => set({ pendingConnection: nodeId }),

    setNodeStatus: (id, status) => {
      saveSnapshot();
      set({
        nodes: get().nodes.map((n) => {
          if (n.id !== id) return n;
          const d = n.data as ICanvasNodeData;
          return {
            ...n,
            data: { ...d, status: d.status === status ? null : status },
          };
        }),
      });
    },

    updateNodeLabel: (id, label) => {
      saveSnapshot();
      set({
        nodes: get().nodes.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, label } } : n
        ),
      });
    },

    addComment: (nodeId, text) => {
      saveSnapshot();
      const comment: IComment = { id: `comment-${Date.now()}`, text };
      set({
        nodes: get().nodes.map((n) => {
          if (n.id !== nodeId) return n;
          const d = n.data as ICanvasNodeData;
          return { ...n, data: { ...d, comments: [...d.comments, comment] } };
        }),
      });
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

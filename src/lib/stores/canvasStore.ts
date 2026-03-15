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
import {
  ECanvasTool,
  type ICanvasNodeData,
  type IComment,
  type IReferenceNodeData,
  type TCanvasNode,
  type TNodeStatus,
  type TReferenceNode,
} from '@interfaces';
import {
  type TablesInsert,
  type TDbCanvasNodeWithComments,
  fetchCanvasData,
  insertCanvasNode,
  updateCanvasNode,
  removeCanvasNode,
  insertCanvasEdge,
  removeCanvasEdge,
  insertComment,
  syncCanvasData,
} from '@/lib/supabase';

const dbNodeToFlowNode = (dbNode: TDbCanvasNodeWithComments): Node => {
  if (dbNode.type === 'reference-node') {
    return {
      id: dbNode.id,
      type: 'reference-node',
      position: { x: dbNode.position_x, y: dbNode.position_y },
      data: {
        label: dbNode.label,
        sourceTopicId: dbNode.source_topic_id ?? '',
        sourceTopicName: dbNode.source_topic_name ?? '',
        sourceWorkspaceId: dbNode.source_workspace_id ?? '',
      } satisfies IReferenceNodeData,
    };
  }
  return {
    id: dbNode.id,
    type: 'canvas-node',
    position: { x: dbNode.position_x, y: dbNode.position_y },
    data: {
      label: dbNode.label,
      status: dbNode.status,
      comments: dbNode.comments.map((c) => ({ id: c.id, text: c.text })),
    } satisfies ICanvasNodeData,
  };
};

const flowNodeToDbInsert = (
  node: Node,
  topicId: string
): TablesInsert<'canvas_nodes'> => {
  const base = {
    id: node.id,
    topic_id: topicId,
    position_x: node.position.x,
    position_y: node.position.y,
  };

  if (node.type === 'reference-node') {
    const data = node.data as IReferenceNodeData;
    return {
      ...base,
      type: 'reference-node',
      label: data.label,
      status: null,
      source_topic_id: data.sourceTopicId || null,
      source_topic_name: data.sourceTopicName || null,
      source_workspace_id: data.sourceWorkspaceId || null,
    };
  }

  const data = node.data as ICanvasNodeData;
  return {
    ...base,
    type: 'canvas-node',
    label: data.label,
    status: data.status ?? null,
    source_topic_id: null,
    source_topic_name: null,
    source_workspace_id: null,
  };
};

const flowEdgeToDbInsert = (
  edge: Edge,
  topicId: string
): TablesInsert<'canvas_edges'> => ({
  id: edge.id,
  topic_id: topicId,
  source_node_id: edge.source,
  target_node_id: edge.target,
  source_handle: edge.sourceHandle ?? null,
  target_handle: edge.targetHandle ?? null,
});

interface ISnapshot {
  nodes: Node[];
  edges: Edge[];
}

interface ICanvasStore {
  topicId: string | null;
  userId: string | null;
  activeTool: ECanvasTool;
  nodes: Node[];
  edges: Edge[];
  pendingConnection: string | null;
  referenceSearchPosition: XYPosition | null;
  _past: ISnapshot[];
  _future: ISnapshot[];

  loadCanvas: (topicId: string, userId: string) => Promise<void>;
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
  saveNodePosition: (id: string, position: XYPosition) => void;
  undo: () => void;
  redo: () => void;
}

const MAX_HISTORY = 100;

export const useCanvasStore = create<ICanvasStore>((set, get) => {
  const saveSnapshot = () => {
    const { nodes, edges, _past } = get();
    set({
      _past: [..._past.slice(-(MAX_HISTORY - 1)), { nodes, edges }],
      _future: [],
    });
  };

  const syncToDb = () => {
    const { topicId, userId, nodes, edges } = get();
    if (!topicId || !userId) return;

    const dbNodes = nodes.map((n) => flowNodeToDbInsert(n, topicId));
    const dbEdges = edges.map((e) => flowEdgeToDbInsert(e, topicId));
    const dbComments: TablesInsert<'comments'>[] = nodes.flatMap((n) => {
      const data = n.data as ICanvasNodeData;
      if (!data.comments) return [];
      return data.comments.map((c) => ({
        id: c.id,
        node_id: n.id,
        author_id: userId,
        text: c.text,
      }));
    });

    syncCanvasData(topicId, dbNodes, dbEdges, dbComments).catch(console.error);
  };

  return {
    topicId: null,
    userId: null,
    activeTool: ECanvasTool.Select,
    nodes: [],
    edges: [],
    pendingConnection: null,
    referenceSearchPosition: null,
    _past: [],
    _future: [],

    loadCanvas: async (topicId, userId) => {
      set({
        topicId,
        userId,
        nodes: [],
        edges: [],
        _past: [],
        _future: [],
        activeTool: ECanvasTool.Select,
        pendingConnection: null,
        referenceSearchPosition: null,
      });

      const { nodes, edges } = await fetchCanvasData(topicId);
      set({
        nodes: nodes.map(dbNodeToFlowNode),
        edges: edges.map((e) => ({
          id: e.id,
          source: e.source_node_id,
          target: e.target_node_id,
          sourceHandle: e.source_handle,
          targetHandle: e.target_handle,
          type: 'default',
        })),
      });
    },

    clearCanvas: () =>
      set({
        topicId: null,
        userId: null,
        nodes: [],
        edges: [],
        _past: [],
        _future: [],
        activeTool: ECanvasTool.Select,
        pendingConnection: null,
        referenceSearchPosition: null,
      }),

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
      const id = crypto.randomUUID();
      const newNode: TCanvasNode = {
        id,
        type: 'canvas-node',
        position,
        data: { label: 'New Node', status: null, comments: [] },
      };
      set({ nodes: [...get().nodes, newNode] });

      const { topicId } = get();
      if (topicId) {
        insertCanvasNode(flowNodeToDbInsert(newNode, topicId)).catch(
          console.error
        );
      }
    },

    addReferenceNode: (position, data) => {
      saveSnapshot();
      const id = crypto.randomUUID();
      const newNode: TReferenceNode = {
        id,
        type: 'reference-node',
        position,
        data,
      };
      set({ nodes: [...get().nodes, newNode], referenceSearchPosition: null });

      const { topicId } = get();
      if (topicId) {
        insertCanvasNode(flowNodeToDbInsert(newNode, topicId)).catch(
          console.error
        );
      }
    },

    setReferenceSearchPosition: (position) =>
      set({ referenceSearchPosition: position }),

    deleteNode: (id) => {
      saveSnapshot();
      set({
        nodes: get().nodes.filter((n) => n.id !== id),
        edges: get().edges.filter((e) => e.source !== id && e.target !== id),
      });
      removeCanvasNode(id).catch(console.error);
    },

    deleteEdge: (id) => {
      saveSnapshot();
      set({ edges: get().edges.filter((e) => e.id !== id) });
      removeCanvasEdge(id).catch(console.error);
    },

    connectNodes: (connection) => {
      const { source, target } = connection;
      if (!source || !target || source === target) return;
      if (get().edges.some((e) => e.source === source && e.target === target))
        return;

      saveSnapshot();
      const id = crypto.randomUUID();
      const newEdge: Edge = {
        id,
        source,
        target,
        sourceHandle: connection.sourceHandle ?? null,
        targetHandle: connection.targetHandle ?? null,
        type: 'default',
      };
      set({ edges: [...get().edges, newEdge], pendingConnection: null });

      const { topicId } = get();
      if (topicId) {
        insertCanvasEdge(flowEdgeToDbInsert(newEdge, topicId)).catch(
          console.error
        );
      }
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
      const node = get().nodes.find((n) => n.id === id);
      if (node) {
        const d = node.data as ICanvasNodeData;
        updateCanvasNode(id, { status: d.status }).catch(console.error);
      }
    },

    updateNodeLabel: (id, label) => {
      saveSnapshot();
      set({
        nodes: get().nodes.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, label } } : n
        ),
      });
      updateCanvasNode(id, { label }).catch(console.error);
    },

    addComment: (nodeId, text) => {
      saveSnapshot();
      const commentId = crypto.randomUUID();
      const comment: IComment = { id: commentId, text };
      set({
        nodes: get().nodes.map((n) => {
          if (n.id !== nodeId) return n;
          const d = n.data as ICanvasNodeData;
          return { ...n, data: { ...d, comments: [...d.comments, comment] } };
        }),
      });

      const { userId } = get();
      if (userId) {
        insertComment({
          id: commentId,
          node_id: nodeId,
          author_id: userId,
          text,
        }).catch(console.error);
      }
    },

    saveNodePosition: (id, position) => {
      updateCanvasNode(id, {
        position_x: position.x,
        position_y: position.y,
      }).catch(console.error);
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
      syncToDb();
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
      syncToDb();
    },
  };
});

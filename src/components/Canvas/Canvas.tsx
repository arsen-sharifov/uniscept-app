'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  MarkerType,
  ReactFlow,
  type DefaultEdgeOptions,
  type Edge,
  type EdgeMarker,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { ICanvasNodeData, TNodeStatus } from '@interfaces';
import { ECanvasTool } from '@/components/tools';
import { useCanvasStore } from '@/lib/stores';
import { CanvasNode } from './CanvasNode';
import { ReferenceNode } from './ReferenceNode';
import { ReferenceSearchPanel } from './ReferenceSearchPanel';
import { SaveStatus } from './fragments';
import { useCanvasSync, useCanvasTools, useReferenceSearch } from './hooks';

const nodeTypes = {
  'canvas-node': CanvasNode,
  'reference-node': ReferenceNode,
};

const EDGE_PALETTE = {
  default: {
    stroke: 'rgb(100 116 139 / 0.55)',
    marker: 'rgb(100 116 139 / 0.7)',
  },
  valid: { stroke: 'rgb(16 185 129 / 0.7)', marker: 'rgb(16 185 129 / 0.85)' },
  invalid: { stroke: 'rgb(239 68 68 / 0.7)', marker: 'rgb(239 68 68 / 0.85)' },
} as const;

const defaultEdgeOptions: DefaultEdgeOptions = {
  type: 'default',
  animated: false,
  style: { stroke: EDGE_PALETTE.default.stroke, strokeWidth: 1.5 },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 14,
    height: 14,
    color: EDGE_PALETTE.default.marker,
  },
};

const resolveEdgeTone = (
  sourceStatus: TNodeStatus | undefined,
  targetStatus: TNodeStatus | undefined
): keyof typeof EDGE_PALETTE => {
  if (sourceStatus === 'invalid' || targetStatus === 'invalid')
    return 'invalid';
  if (sourceStatus === 'valid' && targetStatus === 'valid') return 'valid';
  return 'default';
};

interface ICanvasProps {
  workspaceId: string;
  threadId: string;
}

export const Canvas = ({ workspaceId, threadId }: ICanvasProps) => {
  const saveState = useCanvasSync(threadId);
  const referenceThreads = useReferenceSearch({ workspaceId, threadId });

  const hydrated = useCanvasStore((s) => s.hydrated);
  const activeTool = useCanvasStore((s) => s.activeTool);
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const pendingConnection = useCanvasStore((s) => s.pendingConnection);
  const setPendingConnection = useCanvasStore((s) => s.setPendingConnection);
  const onNodesChange = useCanvasStore((s) => s.onNodesChange);
  const onEdgesChange = useCanvasStore((s) => s.onEdgesChange);

  const {
    onPaneClick,
    onNodeClick,
    onEdgeClick,
    onConnect,
    isValidConnection,
  } = useCanvasTools();

  const [middlePan, setMiddlePan] = useState(false);

  useEffect(() => {
    const onDown = (event: MouseEvent) => {
      if (event.button === 1) setMiddlePan(true);
    };
    const onUp = (event: MouseEvent) => {
      if (event.button === 1) setMiddlePan(false);
    };
    const onBlur = () => setMiddlePan(false);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  useEffect(() => {
    if (!pendingConnection) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setPendingConnection(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [pendingConnection, setPendingConnection]);

  const styledEdges = useMemo(() => {
    const statusById = new Map<string, TNodeStatus>();
    for (const node of nodes) {
      if (node.type === 'canvas-node') {
        statusById.set(node.id, (node.data as ICanvasNodeData).status);
      }
    }
    return edges.map<Edge>((edge) => {
      const tone = resolveEdgeTone(
        statusById.get(edge.source),
        statusById.get(edge.target)
      );
      const palette = EDGE_PALETTE[tone];
      const baseMarker = (edge.markerEnd ?? defaultEdgeOptions.markerEnd) as
        | EdgeMarker
        | undefined;
      return {
        ...edge,
        style: { ...edge.style, stroke: palette.stroke, strokeWidth: 1.5 },
        markerEnd: baseMarker
          ? { ...baseMarker, color: palette.marker }
          : undefined,
        data: { ...(edge.data ?? {}), tone },
      };
    });
  }, [edges, nodes]);

  const panOnDrag = activeTool === ECanvasTool.Pan ? [0, 1] : ([1] as number[]);
  const isPanMode = activeTool === ECanvasTool.Pan;

  return (
    <div
      className="relative h-full w-full"
      style={{
        cursor: middlePan ? 'grabbing' : isPanMode ? 'grab' : 'default',
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={styledEdges}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onPaneClick={onPaneClick}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        connectionMode={ConnectionMode.Loose}
        panOnDrag={panOnDrag}
        panOnScroll={false}
        selectionOnDrag={activeTool === ECanvasTool.Select}
        nodesDraggable={activeTool === ECanvasTool.Select}
        elementsSelectable={activeTool === ECanvasTool.Select}
        deleteKeyCode={
          activeTool === ECanvasTool.Select ? ['Backspace', 'Delete'] : null
        }
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={22}
          size={1.2}
          color="rgb(15 23 42 / 0.10)"
        />
        <ReferenceSearchPanel threads={referenceThreads} />
      </ReactFlow>

      {hydrated && <SaveStatus state={saveState} />}
    </div>
  );
};

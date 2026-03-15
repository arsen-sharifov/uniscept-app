'use client';

import { type MouseEvent, useCallback } from 'react';
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  type Node,
  ReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ECanvasTool } from '@interfaces';
import { useCanvasStore } from '@/lib/stores';
import { CanvasNode } from './CanvasNode';
import { ReferenceNode } from './ReferenceNode';
import { ReferenceSearchPanel } from './ReferenceSearchPanel';
import { useCanvasTools } from './useCanvasTools';

const nodeTypes = {
  'canvas-node': CanvasNode,
  'reference-node': ReferenceNode,
};

export const Canvas = () => {
  const activeTool = useCanvasStore((s) => s.activeTool);
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const onNodesChange = useCanvasStore((s) => s.onNodesChange);
  const onEdgesChange = useCanvasStore((s) => s.onEdgesChange);
  const saveNodePosition = useCanvasStore((s) => s.saveNodePosition);

  const {
    onPaneClick,
    onNodeClick,
    onEdgeClick,
    onConnect,
    isValidConnection,
  } = useCanvasTools();

  const onNodeDragStop = useCallback(
    (_event: MouseEvent, node: Node) => {
      saveNodePosition(node.id, node.position);
    },
    [saveNodePosition]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onPaneClick={onPaneClick}
      onNodeClick={onNodeClick}
      onEdgeClick={onEdgeClick}
      onNodeDragStop={onNodeDragStop}
      onConnect={onConnect}
      isValidConnection={isValidConnection}
      connectionMode={ConnectionMode.Loose}
      panOnDrag={activeTool === ECanvasTool.Pan}
      nodesDraggable={activeTool === ECanvasTool.Select}
      elementsSelectable={activeTool === ECanvasTool.Select}
      proOptions={{ hideAttribution: true }}
    >
      <Background variant={BackgroundVariant.Dots} />
      <ReferenceSearchPanel />
    </ReactFlow>
  );
};

'use client';

import { type MouseEvent, useCallback } from 'react';
import {
  type EdgeMouseHandler,
  type IsValidConnection,
  type NodeMouseHandler,
  useReactFlow,
} from '@xyflow/react';
import { useCanvasStore } from '@/lib/stores';
import { ECanvasTool } from '@/components/tools';
import { findNearestHandlePair } from '../utils';

export const useCanvasTools = () => {
  const { screenToFlowPosition } = useReactFlow();

  const activeTool = useCanvasStore((s) => s.activeTool);

  const addNode = useCanvasStore((s) => s.addNode);
  const deleteNode = useCanvasStore((s) => s.deleteNode);
  const deleteEdge = useCanvasStore((s) => s.deleteEdge);
  const connectNodes = useCanvasStore((s) => s.connectNodes);
  const setPendingConnection = useCanvasStore((s) => s.setPendingConnection);
  const setNodeStatus = useCanvasStore((s) => s.setNodeStatus);
  const setReferenceSearchPosition = useCanvasStore(
    (s) => s.setReferenceSearchPosition
  );

  const onPaneClick = useCallback(
    (event: MouseEvent) => {
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      if (activeTool === ECanvasTool.AddNode) {
        addNode(position);
      } else if (activeTool === ECanvasTool.CrossReference) {
        setReferenceSearchPosition(position);
      }
    },
    [activeTool, screenToFlowPosition, addNode, setReferenceSearchPosition]
  );

  const onNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      switch (activeTool) {
        case ECanvasTool.Delete:
          deleteNode(node.id);
          break;
        case ECanvasTool.ValidPath:
          setNodeStatus(node.id, 'valid');
          break;
        case ECanvasTool.InvalidPath:
          setNodeStatus(node.id, 'invalid');
          break;
        case ECanvasTool.Connect: {
          const { pendingConnection, nodes } = useCanvasStore.getState();
          if (!pendingConnection) {
            setPendingConnection(node.id);
          } else {
            const sourceNode = nodes.find((n) => n.id === pendingConnection);

            if (sourceNode) {
              const { sourceHandle, targetHandle } = findNearestHandlePair(
                sourceNode,
                node
              );
              connectNodes({
                source: pendingConnection,
                target: node.id,
                sourceHandle,
                targetHandle,
              });
            }
          }
          break;
        }
      }
    },
    [activeTool, deleteNode, setNodeStatus, setPendingConnection, connectNodes]
  );

  const onEdgeClick: EdgeMouseHandler = useCallback(
    (_event, edge) => {
      if (activeTool === ECanvasTool.Delete) {
        deleteEdge(edge.id);
      }
    },
    [activeTool, deleteEdge]
  );

  const isValidConnection: IsValidConnection = useCallback(
    (connection) => connection.source !== connection.target,
    []
  );

  return {
    onPaneClick,
    onNodeClick,
    onEdgeClick,
    onConnect: connectNodes,
    isValidConnection,
  };
};

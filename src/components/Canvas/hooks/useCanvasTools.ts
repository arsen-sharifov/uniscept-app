'use client';

import { type EdgeMouseHandler, type IsValidConnection, type NodeMouseHandler, useReactFlow } from '@xyflow/react';
import { type MouseEvent, useCallback } from 'react';

import { ECanvasNodeType } from '@interfaces';
import { useTranslations } from '@hooks';
import { ECanvasTool } from '@/components/tools';
import { findNearestHandlePair } from '@/lib/canvas';
import { useCanvasStore } from '@/lib/stores';

import { ZOOM_DURATION_MS, ZOOM_MAX, ZOOM_MIN, ZOOM_STEP_FACTOR } from '../consts';
import { collectStatusTargetIds } from '../utils';

interface IUseCanvasToolsResult {
  onPaneClick: (event: MouseEvent) => void;
  onNodeClick: NodeMouseHandler;
  onNodeDoubleClick: NodeMouseHandler;
  onEdgeClick: EdgeMouseHandler;
  onConnect: ReturnType<typeof useCanvasStore.getState>['connectNodes'];
  isValidConnection: IsValidConnection;
}

const isValidConnection: IsValidConnection = (connection) => connection.source !== connection.target;

const clampZoom = (zoom: number): number => Math.min(Math.max(zoom, ZOOM_MIN), ZOOM_MAX);

export const useCanvasTools = (): IUseCanvasToolsResult => {
  const t = useTranslations();
  const { screenToFlowPosition, getViewport, setViewport } = useReactFlow();

  const activeTool = useCanvasStore((s) => s.activeTool);
  const connectNodes = useCanvasStore((s) => s.connectNodes);

  const zoomToCursor = useCallback(
    (event: MouseEvent, baseFactor: number) => {
      const factor = event.shiftKey ? 1 / baseFactor : baseFactor;
      const { x: vx, y: vy, zoom } = getViewport();
      const targetZoom = clampZoom(zoom * factor);
      if (targetZoom === zoom) return;

      const flow = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      setViewport(
        {
          x: vx + flow.x * (zoom - targetZoom),
          y: vy + flow.y * (zoom - targetZoom),
          zoom: targetZoom,
        },
        { duration: ZOOM_DURATION_MS },
      );
    },
    [getViewport, screenToFlowPosition, setViewport],
  );

  const handleZoomTool = useCallback(
    (event: MouseEvent): boolean => {
      if (activeTool === ECanvasTool.ZoomIn) {
        zoomToCursor(event, ZOOM_STEP_FACTOR);

        return true;
      }
      if (activeTool === ECanvasTool.ZoomOut) {
        zoomToCursor(event, 1 / ZOOM_STEP_FACTOR);

        return true;
      }

      return false;
    },
    [activeTool, zoomToCursor],
  );

  const onPaneClick = useCallback(
    (event: MouseEvent) => {
      if (handleZoomTool(event)) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const store = useCanvasStore.getState();

      if (activeTool === ECanvasTool.AddNode) {
        store.addNode(position, t.platform.canvas.node.defaultLabel);
      } else if (activeTool === ECanvasTool.CrossReference) {
        store.setReferenceSearchPosition(position);
      }
    },
    [activeTool, handleZoomTool, screenToFlowPosition, t.platform.canvas.node.defaultLabel],
  );

  const onNodeClick: NodeMouseHandler = useCallback(
    (event, node) => {
      if (handleZoomTool(event)) return;

      const store = useCanvasStore.getState();

      switch (activeTool) {
        case ECanvasTool.Delete:
          store.deleteNode(node.id);
          break;

        case ECanvasTool.Comment:
          if (node.type === ECanvasNodeType.Canvas) {
            store.setOpenCommentsNodeId(node.id);
          }
          break;

        case ECanvasTool.ValidPath:
          store.setNodesStatus(collectStatusTargetIds(store.nodes, node.id), 'valid');
          break;

        case ECanvasTool.InvalidPath:
          store.setNodesStatus(collectStatusTargetIds(store.nodes, node.id), 'invalid');
          break;

        case ECanvasTool.Connect: {
          if (node.type === ECanvasNodeType.Reference) break;

          const { pendingConnection, nodes } = store;

          if (!pendingConnection) {
            store.setPendingConnection(node.id);
            break;
          }

          const sourceNode = nodes.find((candidate) => candidate.id === pendingConnection);
          if (!sourceNode || sourceNode.type === ECanvasNodeType.Reference) {
            break;
          }

          const { sourceHandle, targetHandle } = findNearestHandlePair(sourceNode, node);
          store.connectNodes({
            source: pendingConnection,
            target: node.id,
            sourceHandle,
            targetHandle,
          });
          break;
        }
      }
    },
    [activeTool, handleZoomTool],
  );

  const onNodeDoubleClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      if (activeTool !== ECanvasTool.Select) return;
      if (node.type === ECanvasNodeType.Canvas) {
        useCanvasStore.getState().setEditingNodeId(node.id);
      }
    },
    [activeTool],
  );

  const onEdgeClick: EdgeMouseHandler = useCallback(
    (event, edge) => {
      if (handleZoomTool(event)) return;
      if (activeTool !== ECanvasTool.Delete) return;

      useCanvasStore.getState().deleteEdge(edge.id);
    },
    [activeTool, handleZoomTool],
  );

  return {
    onPaneClick,
    onNodeClick,
    onNodeDoubleClick,
    onEdgeClick,
    onConnect: connectNodes,
    isValidConnection,
  };
};

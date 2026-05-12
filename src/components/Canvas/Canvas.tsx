'use client';

import { type MouseEvent as ReactMouseEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Background,
  ConnectionMode,
  type Edge,
  type EdgeMouseHandler,
  type NodeMouseHandler,
  ReactFlow,
  useReactFlow,
} from '@xyflow/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import '@xyflow/react/dist/style.css';
import './canvas.css';
import { ECanvasNodeType, type IScreenPoint, type TCanvasContextMenu } from '@interfaces';
import { useEscapeKey, useTranslations } from '@hooks';
import { useCanvasStore } from '@/lib/stores';
import { ECanvasTool } from '@/components/tools';
import { CanvasEdge } from './CanvasEdge';
import { CanvasNode } from './CanvasNode';
import {
  ACCENT_GLOW_FALLBACK,
  ARRIVAL_CLEANUP_MS,
  ARRIVAL_FIT_DURATION_MS,
  ARRIVAL_FIT_PADDING,
  ARROW_MARKER_ATTRIBUTES,
  ARROW_PATH_D,
  BACKGROUND_COLOR_FALLBACK,
  BACKGROUND_DOT_GAP,
  BACKGROUND_SIZE_BY_PATTERN,
  BACKGROUND_VARIANT_BY_PATTERN,
  CONNECTION_RADIUS,
  DEFAULT_EDGE_OPTIONS,
  EDGE_DEFAULT_STROKE_WIDTH,
  EDGE_TONES,
  NODE_DRAG_THRESHOLD,
  PAN_BUTTONS_ALL,
  PAN_BUTTONS_MIDDLE,
  RUBBER_LINE_DASH_ARRAY,
  RUBBER_LINE_DOT_FILL_FALLBACK,
  RUBBER_LINE_DOT_RADIUS,
  RUBBER_LINE_DOT_STROKE_WIDTH,
  RUBBER_LINE_STROKE_FALLBACK,
  RUBBER_LINE_STROKE_WIDTH,
  SELECT_DELETE_KEYS,
  ZOOM_MAX,
  ZOOM_MIN,
} from './consts';
import { ReferenceNode } from './ReferenceNode';
import { ReferenceSearchPanel } from '@/components';
import { CanvasCommentsPanel, ContextMenu, SaveStatus } from './fragments';
import {
  useCanvasPattern,
  useCanvasSync,
  useCanvasTools,
  useEdgePalette,
  useMiddlePan,
  useReferenceSearch,
  useThemeToken,
} from './hooks';
import { computeEffectiveStatuses, resolveBidirectionalEdgeTone, resolveEdgeTone } from './utils';

const NODE_TYPES = {
  [ECanvasNodeType.Canvas]: CanvasNode,
  [ECanvasNodeType.Reference]: ReferenceNode,
};

const EDGE_TYPES = {
  default: CanvasEdge,
};

const PRO_OPTIONS = { hideAttribution: true } as const;

interface ICanvasProps {
  workspaceId: string;
  threadId: string;
}

export const Canvas = ({ workspaceId, threadId }: ICanvasProps) => {
  const t = useTranslations();
  const { saveState, loadError } = useCanvasSync(threadId);
  const referenceNodes = useReferenceSearch({ workspaceId, threadId });

  useMiddlePan();

  const dotColor = useThemeToken('--app-bg-grid', BACKGROUND_COLOR_FALLBACK);
  const rubberStroke = useThemeToken('--accent', RUBBER_LINE_STROKE_FALLBACK);
  const rubberDotFill = useThemeToken('--accent', RUBBER_LINE_DOT_FILL_FALLBACK);
  const accentGlow = useThemeToken('--accent-glow', ACCENT_GLOW_FALLBACK);
  const edgePalette = useEdgePalette();
  const canvasPattern = useCanvasPattern();

  const { fitView, screenToFlowPosition } = useReactFlow();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [emptyHintBefore = '', emptyHintAfter = ''] = t.platform.canvas.empty.hint.split('{key}');

  const hydrated = useCanvasStore((s) => s.hydrated);
  const arriving = hydrated && searchParams.get('focus') === 'ref';
  const arrivalNodeId = searchParams.get('node');
  const activeTool = useCanvasStore((s) => s.activeTool);
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const pendingConnection = useCanvasStore((s) => s.pendingConnection);
  const closeAllOverlays = useCanvasStore((s) => s.closeAllOverlays);
  const middlePan = useCanvasStore((s) => s.middlePan);
  const onNodesChange = useCanvasStore((s) => s.onNodesChange);
  const onEdgesChange = useCanvasStore((s) => s.onEdgesChange);
  const canvasCommentsCount = useCanvasStore((s) => s.canvasComments.length);
  const canvasCommentsOpen = useCanvasStore((s) => s.canvasCommentsOpen);
  const setCanvasCommentsOpen = useCanvasStore((s) => s.setCanvasCommentsOpen);

  const { onPaneClick, onNodeClick, onNodeDoubleClick, onEdgeClick, onConnect, isValidConnection } = useCanvasTools();

  const [contextMenu, setContextMenu] = useState<TCanvasContextMenu | null>(null);
  const [cursorScreen, setCursorScreen] = useState<IScreenPoint | null>(null);
  const [sourceScreen, setSourceScreen] = useState<IScreenPoint | null>(null);

  useEffect(() => {
    if (!middlePan) return;

    document.body.classList.add('canvas-middle-pan');

    return () => document.body.classList.remove('canvas-middle-pan');
  }, [middlePan]);

  useEscapeKey(() => useCanvasStore.getState().setPendingConnection(null), pendingConnection !== null);

  useEffect(() => {
    if (!pendingConnection) return;

    const onMove = (event: MouseEvent) => {
      setCursorScreen({ x: event.clientX, y: event.clientY });

      const element = document.querySelector(`.react-flow__node[data-id="${pendingConnection}"]`);
      if (!element) return;

      const rect = element.getBoundingClientRect();
      setSourceScreen({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    };

    window.addEventListener('mousemove', onMove);

    return () => {
      window.removeEventListener('mousemove', onMove);
      setCursorScreen(null);
      setSourceScreen(null);
    };
  }, [pendingConnection]);

  useEffect(() => {
    if (!arriving) return;

    const raf = requestAnimationFrame(() => {
      void fitView({
        duration: ARRIVAL_FIT_DURATION_MS,
        padding: ARRIVAL_FIT_PADDING,
        ...(arrivalNodeId && { nodes: [{ id: arrivalNodeId }] }),
      });
    });
    const cleanupTimer = window.setTimeout(() => {
      router.replace(pathname, { scroll: false });
    }, ARRIVAL_CLEANUP_MS);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(cleanupTimer);
    };
  }, [arriving, arrivalNodeId, fitView, pathname, router]);

  const effectiveStatusById = useMemo(() => computeEffectiveStatuses(nodes, edges), [nodes, edges]);

  const styledEdges = useMemo(() => {
    const directionsByPair = new Map<string, Set<string>>();

    edges.forEach((edge) => {
      const pairKey = edge.source < edge.target ? `${edge.source}|${edge.target}` : `${edge.target}|${edge.source}`;
      const directions = directionsByPair.get(pairKey) ?? new Set<string>();
      directions.add(`${edge.source}->${edge.target}`);
      directionsByPair.set(pairKey, directions);
    });

    const rendered = new Set<string>();

    return edges.flatMap<Edge>((edge) => {
      const pairKey = edge.source < edge.target ? `${edge.source}|${edge.target}` : `${edge.target}|${edge.source}`;
      if (rendered.has(pairKey)) return [];
      rendered.add(pairKey);

      const bidirectional = (directionsByPair.get(pairKey)?.size ?? 0) >= 2;
      const sourceStatus = effectiveStatusById.get(edge.source);
      const targetStatus = effectiveStatusById.get(edge.target);
      const tone = bidirectional
        ? resolveBidirectionalEdgeTone(sourceStatus, targetStatus)
        : resolveEdgeTone(sourceStatus, targetStatus);

      return [
        {
          ...edge,
          type: 'default',
          className: bidirectional ? 'edge-bidirectional' : undefined,
          style: {
            ...edge.style,
            stroke: edgePalette[tone].stroke,
            strokeWidth: EDGE_DEFAULT_STROKE_WIDTH,
          },
          data: { ...(edge.data ?? {}), tone, bidirectional },
        },
      ];
    });
  }, [edges, effectiveStatusById, edgePalette]);

  const showRubberLine =
    activeTool === ECanvasTool.Connect && pendingConnection !== null && cursorScreen !== null && sourceScreen !== null;

  const handlePaneClick = useCallback(
    (event: ReactMouseEvent) => {
      closeAllOverlays();
      setContextMenu(null);
      onPaneClick(event);
    },
    [closeAllOverlays, onPaneClick]
  );

  const handlePaneContextMenu = useCallback(
    (event: ReactMouseEvent | MouseEvent) => {
      event.preventDefault();
      closeAllOverlays();

      const flow = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      setContextMenu({
        type: 'pane',
        x: event.clientX,
        y: event.clientY,
        flowX: flow.x,
        flowY: flow.y,
      });
    },
    [closeAllOverlays, screenToFlowPosition]
  );

  const handleNodeContextMenu: NodeMouseHandler = useCallback(
    (event, node) => {
      event.preventDefault();
      closeAllOverlays();

      setContextMenu({
        type: 'node',
        x: event.clientX,
        y: event.clientY,
        nodeId: node.id,
      });
    },
    [closeAllOverlays]
  );

  const handleEdgeContextMenu: EdgeMouseHandler = useCallback(
    (event, edge) => {
      event.preventDefault();
      closeAllOverlays();

      setContextMenu({
        type: 'edge',
        x: event.clientX,
        y: event.clientY,
        edgeId: edge.id,
      });
    },
    [closeAllOverlays]
  );

  return (
    <div data-canvas-tool={activeTool} className="relative h-full w-full">
      <svg aria-hidden width="0" height="0" style={{ position: 'absolute', overflow: 'hidden' }}>
        <defs>
          {EDGE_TONES.map((tone) => (
            <marker key={tone} id={`canvas-arrow-${tone}`} {...ARROW_MARKER_ATTRIBUTES}>
              <path d={ARROW_PATH_D} fill={edgePalette[tone].marker} />
            </marker>
          ))}
        </defs>
      </svg>

      <ReactFlow
        nodes={nodes}
        edges={styledEdges}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onPaneClick={handlePaneClick}
        onPaneContextMenu={handlePaneContextMenu}
        onNodeContextMenu={handleNodeContextMenu}
        onEdgeContextMenu={handleEdgeContextMenu}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onEdgeClick={onEdgeClick}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        connectionMode={ConnectionMode.Loose}
        connectionRadius={CONNECTION_RADIUS}
        minZoom={ZOOM_MIN}
        maxZoom={ZOOM_MAX}
        panOnDrag={activeTool === ECanvasTool.Pan || middlePan ? PAN_BUTTONS_ALL : PAN_BUTTONS_MIDDLE}
        selectionOnDrag={activeTool === ECanvasTool.Select}
        elementsSelectable={activeTool === ECanvasTool.Select}
        nodesDraggable={!middlePan}
        nodeDragThreshold={NODE_DRAG_THRESHOLD}
        deleteKeyCode={activeTool === ECanvasTool.Select ? SELECT_DELETE_KEYS : null}
        proOptions={PRO_OPTIONS}
      >
        {canvasPattern !== 'none' && (
          <Background
            variant={BACKGROUND_VARIANT_BY_PATTERN[canvasPattern]}
            gap={BACKGROUND_DOT_GAP}
            size={BACKGROUND_SIZE_BY_PATTERN[canvasPattern]}
            color={dotColor}
          />
        )}
        <ReferenceSearchPanel nodes={referenceNodes} />
      </ReactFlow>

      {showRubberLine && (
        <svg aria-hidden className="pointer-events-none fixed inset-0 z-40" width="100%" height="100%">
          <line
            x1={sourceScreen.x}
            y1={sourceScreen.y}
            x2={cursorScreen.x}
            y2={cursorScreen.y}
            stroke={rubberStroke}
            strokeWidth={RUBBER_LINE_STROKE_WIDTH}
            strokeDasharray={RUBBER_LINE_DASH_ARRAY}
            strokeLinecap="round"
          />
          <circle
            cx={cursorScreen.x}
            cy={cursorScreen.y}
            r={RUBBER_LINE_DOT_RADIUS}
            fill={rubberDotFill}
            stroke="white"
            strokeWidth={RUBBER_LINE_DOT_STROKE_WIDTH}
          />
        </svg>
      )}

      {contextMenu && <ContextMenu menu={contextMenu} onClose={() => setContextMenu(null)} />}

      {arriving && (
        <>
          <div
            aria-hidden
            className="animate-ref-arrival-glow pointer-events-none absolute inset-0 z-30 motion-reduce:hidden"
            style={{
              background: `radial-gradient(ellipse at center, ${accentGlow} 0%, transparent 70%)`,
            }}
          />
          <div
            aria-hidden
            className="animate-ref-arrival-ring pointer-events-none absolute inset-0 z-30 motion-reduce:hidden"
          />
        </>
      )}

      {loadError && !hydrated && (
        <div
          role="alert"
          aria-live="assertive"
          className="absolute inset-0 z-20 flex items-center justify-center bg-[color:var(--app-bg)]/55 backdrop-blur-sm"
        >
          <div className="flex max-w-sm flex-col items-center gap-2 rounded-2xl border border-[color:var(--status-warning-border)] bg-[color:var(--status-warning-bg)] px-5 py-4 text-center shadow-[0_18px_48px_-16px_var(--status-warning-soft)] backdrop-blur-md">
            <span className="text-[12.5px] font-semibold tracking-tight text-[color:var(--status-warning)]">
              {t.platform.canvas.loadError.title}
            </span>
            <p className="text-[11.5px] leading-snug text-[color:var(--status-warning)] opacity-85">
              {t.platform.canvas.loadError.hint}
            </p>
            <button
              type="button"
              onClick={() => router.refresh()}
              className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-[color:var(--status-warning-soft)] px-3 py-1 text-[11px] font-medium text-[color:var(--status-warning)] transition-colors hover:bg-[color:var(--status-warning-border)]"
            >
              {t.platform.canvas.loadError.retry}
            </button>
          </div>
        </div>
      )}

      {hydrated && nodes.length === 0 && !arriving && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center motion-reduce:animate-none"
        >
          <div className="animate-rise-up flex flex-col items-center gap-2 px-6 text-center motion-reduce:animate-none">
            <span className="text-[12px] tracking-[0.18em] text-[color:var(--text-subtle)] uppercase">
              {t.platform.canvas.empty.title}
            </span>
            <span className="text-[15px] font-medium tracking-tight text-[color:var(--text)]">
              {emptyHintBefore}
              <kbd className="rounded-md border border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)]/80 px-1.5 py-0.5 font-mono text-[11px] text-[color:var(--text-strong)] shadow-[0_1px_2px_-1px_rgba(15,23,42,0.08)]">
                N
              </kbd>
              {emptyHintAfter}
            </span>
            <span className="text-[10.5px] text-[color:var(--text-subtle)]">{t.platform.canvas.empty.contextHint}</span>
          </div>
        </div>
      )}

      {hydrated && <SaveStatus state={saveState} />}

      {hydrated && !canvasCommentsOpen && (
        <button
          type="button"
          onClick={() => setCanvasCommentsOpen(true)}
          aria-label={t.platform.canvas.context.openComments}
          className="group/cc absolute top-4 left-4 z-30 flex h-9 items-center gap-1.5 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)]/85 px-3 text-[11px] font-medium tracking-tight text-[color:var(--text)] shadow-[0_4px_12px_-6px_rgba(15,23,42,0.18)] backdrop-blur-md transition-colors duration-150 hover:bg-[color:var(--surface-elevated)]"
        >
          <MessageCircle
            className="h-3.5 w-3.5 text-[color:var(--text-muted)] transition-colors duration-150 group-hover/cc:text-[color:var(--accent)]"
            strokeWidth={2}
          />
          <span>{t.platform.canvas.comments.panelTitle}</span>
          {canvasCommentsCount > 0 && (
            <span className="rounded-full bg-[color:var(--accent-soft)] px-1.5 py-px text-[9px] font-semibold text-[color:var(--accent-text)]">
              {canvasCommentsCount}
            </span>
          )}
        </button>
      )}

      {hydrated && <CanvasCommentsPanel open={canvasCommentsOpen} onClose={() => setCanvasCommentsOpen(false)} />}
    </div>
  );
};

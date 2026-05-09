'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useReactFlow, type XYPosition } from '@xyflow/react';
import { Link2, Search, SearchX } from 'lucide-react';
import { clsx } from 'clsx';
import type { INodeReference, IReferenceNodeData, IScreenPoint } from '@interfaces';
import { useClickOutside, useEscapeKey, useTranslations } from '@hooks';
import { interpolate } from '@/lib/utils';
import { useCanvasStore } from '@/lib/stores';

interface IReferenceSearchPanelContentProps {
  nodes: INodeReference[];
  position: XYPosition;
  screenPos: IScreenPoint;
  onSelect: (position: XYPosition, data: IReferenceNodeData) => void;
  onClose: () => void;
}

const ReferenceSearchPanelContent = ({
  nodes,
  screenPos,
  position,
  onSelect,
  onClose,
}: IReferenceSearchPanelContentProps) => {
  const t = useTranslations();
  const [query, setQuery] = useState('');
  const [rawCursorIndex, setCursorIndex] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  const inputCallbackRef = useCallback((node: HTMLInputElement | null) => {
    node?.focus();
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return nodes;

    return nodes.filter(
      (node) =>
        node.label.toLowerCase().includes(term) ||
        node.threadName.toLowerCase().includes(term) ||
        node.workspaceName.toLowerCase().includes(term)
    );
  }, [nodes, query]);

  const cursorIndex = Math.min(rawCursorIndex, Math.max(filtered.length - 1, 0));

  const handleSelect = useCallback(
    (node: INodeReference) => {
      onSelect(position, {
        label: node.label,
        sourceNodeId: node.id,
        sourceNodeLabel: node.label,
        sourceThreadId: node.threadId,
        sourceThreadName: node.threadName,
        sourceWorkspaceId: node.workspaceId,
        sourceWorkspaceName: node.workspaceName,
      });
    },
    [onSelect, position]
  );

  useEscapeKey(onClose);
  useClickOutside(panelRef, onClose);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setCursorIndex((prev) => (filtered.length === 0 ? 0 : (prev + 1) % filtered.length));
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setCursorIndex((prev) => (filtered.length === 0 ? 0 : (prev - 1 + filtered.length) % filtered.length));
        return;
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        const target = filtered[cursorIndex];
        if (target) handleSelect(target);
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => document.removeEventListener('keydown', onKeyDown);
  }, [filtered, cursorIndex, handleSelect]);

  return (
    <div
      ref={panelRef}
      style={{ left: screenPos.x, top: screenPos.y }}
      className="animate-rise-up fixed z-50 flex w-80 flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white/95 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.32)] backdrop-blur-2xl motion-reduce:animate-none"
    >
      <div className="flex items-center gap-2 border-b border-black/[0.05] px-3 py-2.5">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-cyan-500/10 text-cyan-700">
          <Link2 className="h-3 w-3" strokeWidth={2.25} />
        </span>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Search className="h-3.5 w-3.5 shrink-0 text-neutral-400" strokeWidth={2} />
          <input
            ref={inputCallbackRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.platform.canvas.referenceSearch.placeholder}
            className="min-w-0 flex-1 bg-transparent text-[12.5px] text-neutral-800 outline-none placeholder:text-neutral-400"
          />
        </div>
      </div>

      <div className="flex max-h-72 flex-col gap-px overflow-y-auto p-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-400">
              <SearchX className="h-3.5 w-3.5" strokeWidth={2} />
            </span>
            <p className="text-[11.5px] font-medium text-neutral-700">
              {query
                ? interpolate(t.platform.canvas.referenceSearch.noMatch, {
                    query,
                  })
                : t.platform.canvas.referenceSearch.noResults}
            </p>
            {query && (
              <p className="max-w-[200px] text-[10.5px] leading-snug text-neutral-400">
                {t.platform.canvas.referenceSearch.hint}
              </p>
            )}
          </div>
        ) : (
          filtered.map((node, index) => (
            <button
              key={node.id}
              type="button"
              onMouseEnter={() => setCursorIndex(index)}
              onClick={() => handleSelect(node)}
              className={clsx(
                'group/item relative flex flex-col items-stretch rounded-lg px-3 py-2 text-left transition-colors',
                index === cursorIndex
                  ? 'bg-gradient-to-r from-emerald-500/[0.06] to-cyan-500/[0.06]'
                  : 'hover:bg-black/[0.025]'
              )}
            >
              <span className="truncate text-[12.5px] font-medium tracking-tight text-neutral-900">{node.label}</span>
              <span className="mt-0.5 flex items-center gap-1 truncate text-[10.5px] text-neutral-500">
                <span className="truncate text-neutral-400">{node.workspaceName}</span>
                <span className="text-neutral-300">/</span>
                <span className="truncate text-neutral-400">{node.threadName}</span>
              </span>
            </button>
          ))
        )}
      </div>

      {filtered.length > 0 && (
        <div className="flex items-center justify-between border-t border-black/[0.05] bg-neutral-50/60 px-3 py-1.5 text-[9.5px] text-neutral-500">
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-black/[0.08] bg-white px-1 font-mono text-[9px] text-neutral-700">
              ↵
            </kbd>
            {t.platform.canvas.referenceSearch.actionLink}
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-black/[0.08] bg-white px-1 font-mono text-[9px] text-neutral-700">
              ↑↓
            </kbd>
            {t.platform.canvas.referenceSearch.actionNavigate}
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-black/[0.08] bg-white px-1 font-mono text-[9px] text-neutral-700">
              Esc
            </kbd>
            {t.platform.canvas.referenceSearch.actionClose}
          </span>
        </div>
      )}
    </div>
  );
};

interface IReferenceSearchPanelProps {
  nodes?: INodeReference[];
}

export const ReferenceSearchPanel = ({ nodes = [] }: IReferenceSearchPanelProps) => {
  const { flowToScreenPosition } = useReactFlow();

  const referenceSearchPosition = useCanvasStore((s) => s.referenceSearchPosition);
  const addReferenceNode = useCanvasStore((s) => s.addReferenceNode);
  const setReferenceSearchPosition = useCanvasStore((s) => s.setReferenceSearchPosition);

  if (!referenceSearchPosition) return null;

  return (
    <ReferenceSearchPanelContent
      key={`${referenceSearchPosition.x},${referenceSearchPosition.y}`}
      nodes={nodes}
      position={referenceSearchPosition}
      screenPos={flowToScreenPosition(referenceSearchPosition)}
      onSelect={addReferenceNode}
      onClose={() => setReferenceSearchPosition(null)}
    />
  );
};

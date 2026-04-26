'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useReactFlow, type XYPosition } from '@xyflow/react';
import { Link2, Search, SearchX } from 'lucide-react';
import { clsx } from 'clsx';
import type { IReferenceNodeData, IThreadReference } from '@interfaces';
import { useTranslations } from '@hooks';
import { useCanvasStore } from '@/lib/stores';

interface IReferenceSearchPanelProps {
  threads?: IThreadReference[];
}

interface IReferenceSearchPanelContentProps {
  threads: IThreadReference[];
  position: XYPosition;
  screenPos: XYPosition;
  onSelect: (position: XYPosition, data: IReferenceNodeData) => void;
  onClose: () => void;
}

const ReferenceSearchPanelContent = ({
  threads,
  screenPos,
  position,
  onSelect,
  onClose,
}: IReferenceSearchPanelContentProps) => {
  const t = useTranslations();
  const [query, setQuery] = useState('');
  const [rawCursor, setCursor] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  const inputCallbackRef = useCallback((node: HTMLInputElement | null) => {
    node?.focus();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter(
      (thread) =>
        thread.name.toLowerCase().includes(q) ||
        thread.workspaceName.toLowerCase().includes(q)
    );
  }, [threads, query]);

  const cursor = Math.min(rawCursor, Math.max(filtered.length - 1, 0));

  const handleSelect = useCallback(
    (thread: IThreadReference) => {
      onSelect(position, {
        label: thread.name,
        sourceThreadId: thread.id,
        sourceThreadName: thread.name,
        sourceWorkspaceId: thread.workspaceId,
        sourceWorkspaceName: thread.workspaceName,
      });
    },
    [onSelect, position]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setCursor((prev) =>
          filtered.length === 0 ? 0 : (prev + 1) % filtered.length
        );
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setCursor((prev) =>
          filtered.length === 0
            ? 0
            : (prev - 1 + filtered.length) % filtered.length
        );
        return;
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        const target = filtered[cursor];
        if (target) handleSelect(target);
      }
    };
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose, filtered, cursor, handleSelect]);

  return (
    <div
      ref={panelRef}
      style={{ left: screenPos.x, top: screenPos.y }}
      className="fixed z-50 flex w-80 animate-[ref-rise_180ms_cubic-bezier(0.2,0.8,0.2,1)] flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white/95 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.32)] backdrop-blur-2xl motion-reduce:animate-none"
    >
      <style>{`
        @keyframes ref-rise {
          from { opacity: 0; transform: translateY(6px) scale(0.985); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <div className="flex items-center gap-2 border-b border-black/[0.05] px-3 py-2.5">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-cyan-500/10 text-cyan-700">
          <Link2 className="h-3 w-3" strokeWidth={2.25} />
        </span>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Search
            className="h-3.5 w-3.5 shrink-0 text-neutral-400"
            strokeWidth={2}
          />
          <input
            ref={inputCallbackRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.platform.canvas.searchThreads}
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
                ? `Nothing matches “${query}”`
                : t.platform.canvas.noThreadsFound}
            </p>
            {query && (
              <p className="max-w-[200px] text-[10.5px] leading-snug text-neutral-400">
                Try a different topic name or keyword.
              </p>
            )}
          </div>
        ) : (
          filtered.map((thread, index) => {
            const isCursor = index === cursor;
            return (
              <button
                key={thread.id}
                type="button"
                onMouseEnter={() => setCursor(index)}
                onClick={() => handleSelect(thread)}
                className={clsx(
                  'group/item relative flex flex-col items-stretch rounded-lg px-3 py-2 text-left transition-colors',
                  isCursor
                    ? 'bg-gradient-to-r from-emerald-500/[0.06] to-cyan-500/[0.06]'
                    : 'hover:bg-black/[0.025]'
                )}
              >
                <span className="truncate text-[12.5px] font-medium tracking-tight text-neutral-900">
                  {thread.name}
                </span>
                <span className="mt-0.5 flex items-center gap-1 text-[10.5px] text-neutral-500">
                  <span className="font-mono tracking-tight text-neutral-400">
                    {thread.workspaceName}
                  </span>
                </span>
              </button>
            );
          })
        )}
      </div>

      {filtered.length > 0 && (
        <div className="flex items-center justify-between border-t border-black/[0.05] bg-neutral-50/60 px-3 py-1.5 text-[9.5px] text-neutral-500">
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-black/[0.08] bg-white px-1 font-mono text-[9px] text-neutral-700">
              ↵
            </kbd>
            link
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-black/[0.08] bg-white px-1 font-mono text-[9px] text-neutral-700">
              ↑↓
            </kbd>
            navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-black/[0.08] bg-white px-1 font-mono text-[9px] text-neutral-700">
              Esc
            </kbd>
            close
          </span>
        </div>
      )}
    </div>
  );
};

export const ReferenceSearchPanel = ({
  threads = [],
}: IReferenceSearchPanelProps) => {
  const { flowToScreenPosition } = useReactFlow();

  const referenceSearchPosition = useCanvasStore(
    (s) => s.referenceSearchPosition
  );
  const addReferenceNode = useCanvasStore((s) => s.addReferenceNode);
  const setReferenceSearchPosition = useCanvasStore(
    (s) => s.setReferenceSearchPosition
  );

  const handleClose = useCallback(() => {
    setReferenceSearchPosition(null);
  }, [setReferenceSearchPosition]);

  if (!referenceSearchPosition) return null;

  const screenPos = flowToScreenPosition(referenceSearchPosition);
  const key = `${referenceSearchPosition.x},${referenceSearchPosition.y}`;

  return (
    <ReferenceSearchPanelContent
      key={key}
      threads={threads}
      position={referenceSearchPosition}
      screenPos={screenPos}
      onSelect={addReferenceNode}
      onClose={handleClose}
    />
  );
};

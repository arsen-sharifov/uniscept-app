'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useReactFlow, type XYPosition } from '@xyflow/react';
import { Search } from 'lucide-react';
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
  const panelRef = useRef<HTMLDivElement>(null);

  const inputCallbackRef = useCallback((node: HTMLInputElement | null) => {
    node?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const filtered = threads.filter(
    (t) =>
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.workspaceName.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (thread: IThreadReference) => {
    onSelect(position, {
      label: thread.name,
      sourceThreadId: thread.id,
      sourceThreadName: thread.name,
      sourceWorkspaceId: thread.workspaceName,
    });
  };

  return (
    <div
      ref={panelRef}
      className="fixed z-50 flex w-72 flex-col rounded-2xl border border-black/5 bg-white/90 shadow-xl backdrop-blur-xl"
      style={{ left: screenPos.x, top: screenPos.y }}
    >
      <div className="flex items-center gap-2 border-b border-black/5 px-3 py-2.5">
        <Search className="h-4 w-4 shrink-0 text-black/30" />
        <input
          ref={inputCallbackRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.platform.canvas.searchThreads}
          className="min-w-0 flex-1 bg-transparent text-sm text-black/70 outline-none placeholder:text-black/30"
        />
      </div>

      <div className="flex max-h-60 flex-col overflow-y-auto p-1.5">
        {filtered.length === 0 ? (
          <p className="px-3 py-4 text-center text-xs text-black/30">
            {t.platform.canvas.noThreadsFound}
          </p>
        ) : (
          filtered.map((thread) => (
            <button
              key={thread.id}
              onClick={() => handleSelect(thread)}
              className="flex flex-col rounded-xl px-3 py-2 text-left transition-colors hover:bg-gradient-to-r hover:from-emerald-500/5 hover:to-cyan-500/5"
            >
              <span className="text-sm font-medium text-black/60">
                {thread.name}
              </span>
              <span className="text-[10px] text-black/30">
                {thread.workspaceName}
              </span>
            </button>
          ))
        )}
      </div>
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

'use client';

import { useReactFlow, type XYPosition } from '@xyflow/react';
import { clsx } from 'clsx';
import { Link2, Search, SearchX } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, useEffect, useRef, useMemo, useCallback, useId } from 'react';

import type { INodeReference, IReferenceNodeData, IScreenPoint } from '@interfaces';
import { useClickOutside, useEscapeKey, useFocusTrap } from '@hooks';
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
  const t = useTranslations('platform.canvas.referenceSearch');
  const [query, setQuery] = useState('');
  const [rawCursorIndex, setRawCursorIndex] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const optionIdPrefix = useId();

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
        node.workspaceName.toLowerCase().includes(term),
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
    [onSelect, position],
  );

  useEscapeKey(onClose);
  useClickOutside(panelRef, onClose);
  useFocusTrap(panelRef, true);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setRawCursorIndex((prev) => (filtered.length === 0 ? 0 : (prev + 1) % filtered.length));

        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setRawCursorIndex((prev) => (filtered.length === 0 ? 0 : (prev - 1 + filtered.length) % filtered.length));

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

  const activeOptionId = filtered.length > 0 ? `${optionIdPrefix}-${cursorIndex}` : undefined;

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label={t('placeholder')}
      style={{ left: screenPos.x, top: screenPos.y }}
      className="fixed z-50 flex w-80 animate-rise-up flex-col overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)]/95 text-[color:var(--text)] shadow-[0_24px_60px_-20px_rgba(15,23,42,0.42)] backdrop-blur-2xl motion-reduce:animate-none"
    >
      <div className="flex items-center gap-2 border-b border-[color:var(--border)] px-3 py-2.5">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[color:var(--accent-soft)] text-[color:var(--accent-text)]">
          <Link2 className="h-3 w-3" strokeWidth={2.25} />
        </span>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Search className="h-3.5 w-3.5 shrink-0 text-[color:var(--text-muted)]" strokeWidth={2} aria-hidden />
          <input
            ref={inputCallbackRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('placeholder')}
            aria-label={t('placeholder')}
            role="combobox"
            aria-expanded={filtered.length > 0}
            aria-controls={listboxId}
            aria-activedescendant={activeOptionId}
            aria-autocomplete="list"
            className="min-w-0 flex-1 bg-transparent text-[12.5px] text-[color:var(--text-strong)] outline-none placeholder:text-[color:var(--text-muted)]"
          />
        </div>
      </div>

      <div className="flex max-h-72 flex-col gap-px overflow-y-auto p-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[color:var(--surface-overlay)] text-[color:var(--text-muted)]">
              <SearchX className="h-3.5 w-3.5" strokeWidth={2} />
            </span>
            <p className="text-[11.5px] font-medium text-[color:var(--text-strong)]">
              {query ? t('noMatch', { query }) : t('noResults')}
            </p>
            {query && (
              <p className="max-w-[200px] text-[10.5px] leading-snug text-[color:var(--text-muted)]">{t('hint')}</p>
            )}
          </div>
        ) : (
          <ul role="listbox" id={listboxId} aria-label={t('placeholder')} className="flex flex-col gap-px">
            {filtered.map((node, index) => (
              <li key={node.id} role="option" id={`${optionIdPrefix}-${index}`} aria-selected={index === cursorIndex}>
                <button
                  type="button"
                  onMouseEnter={() => setRawCursorIndex(index)}
                  onClick={() => handleSelect(node)}
                  className={clsx(
                    'group/item relative flex w-full flex-col items-stretch rounded-lg px-3 py-2 text-left transition-colors',
                    index === cursorIndex ? 'bg-[color:var(--accent-soft)]' : 'hover:bg-[color:var(--surface-overlay)]',
                  )}
                >
                  <span className="truncate text-[12.5px] font-medium tracking-tight text-[color:var(--text-strong)]">
                    {node.label}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1 truncate text-[10.5px] text-[color:var(--text-muted)]">
                    <span className="truncate text-[color:var(--text-subtle)]">{node.workspaceName}</span>
                    <span className="text-[color:var(--text-faint)]">/</span>
                    <span className="truncate text-[color:var(--text-subtle)]">{node.threadName}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {filtered.length > 0 && (
        <div className="flex items-center justify-between border-t border-[color:var(--border)] bg-[color:var(--surface-overlay)] px-3 py-1.5 text-[9.5px] text-[color:var(--text-muted)]">
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-[color:var(--border-strong)] bg-[color:var(--surface)] px-1 font-mono text-[9px] text-[color:var(--text-strong)]">
              ↵
            </kbd>
            {t('actionLink')}
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-[color:var(--border-strong)] bg-[color:var(--surface)] px-1 font-mono text-[9px] text-[color:var(--text-strong)]">
              ↑↓
            </kbd>
            {t('actionNavigate')}
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-[color:var(--border-strong)] bg-[color:var(--surface)] px-1 font-mono text-[9px] text-[color:var(--text-strong)]">
              Esc
            </kbd>
            {t('actionClose')}
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

  if (!referenceSearchPosition) {
    return null;
  }

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

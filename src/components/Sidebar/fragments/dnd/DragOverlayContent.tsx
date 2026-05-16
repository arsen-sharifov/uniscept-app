'use client';

import { FileText, Folder } from 'lucide-react';
import type { IFlattenedItem } from '@interfaces';

interface IDragOverlayContentProps {
  item: IFlattenedItem;
  bulkCount?: number;
}

export const DragOverlayContent = ({ item, bulkCount }: IDragOverlayContentProps) => (
  <div className="relative">
    {bulkCount && bulkCount > 1 && (
      <>
        <div className="absolute top-1 left-1 h-full w-56 rounded-xl border border-[color:var(--border-active)]/40 bg-[color:var(--accent-soft)]/50" />
        <div className="absolute top-0.5 left-0.5 h-full w-56 rounded-xl border border-[color:var(--border-active)]/60 bg-[color:var(--accent-soft)]/80" />
      </>
    )}
    <div className="relative w-56 rounded-xl border border-[color:var(--border-active)] bg-[color:var(--surface-elevated)] shadow-lg">
      <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl px-2 py-1 text-sm leading-5 text-[color:var(--text)] transition-all duration-150 hover:bg-[color:var(--accent-soft)] hover:text-[color:var(--accent-text)]">
        <div className="h-3.5 w-3.5 shrink-0" />
        {item.type === 'folder' ? (
          <Folder className="h-4 w-4 shrink-0 text-[color:var(--text-subtle)]" />
        ) : (
          <FileText className="h-4 w-4 shrink-0 text-[color:var(--text-subtle)]" />
        )}
        <span className="truncate">{item.name}</span>
        {item.type === 'folder' && item.childCount > 0 && (
          <span className="ml-auto rounded-full bg-[color:var(--accent-soft)] px-1.5 text-[10px] font-medium text-[color:var(--accent-text)]">
            {item.childCount}
          </span>
        )}
      </div>
      {bulkCount && bulkCount > 1 && (
        <span className="absolute -top-2 -right-2 rounded-full bg-gradient-to-r from-[color:var(--accent)] to-[color:var(--accent-2)] px-2 py-0.5 text-[10px] font-bold text-[color:var(--on-accent)] shadow-sm">
          {bulkCount}
        </span>
      )}
    </div>
  </div>
);

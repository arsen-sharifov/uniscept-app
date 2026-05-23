'use client';

import { clsx } from 'clsx';
import type { LucideIcon } from 'lucide-react';
import { FolderInput, Trash2, X } from 'lucide-react';

import { useTranslations } from '@hooks';

interface IBulkActionsBarProps {
  count: number;
  icon: LucideIcon;
  label: string;
  onDelete: () => void;
  onMove?: () => void;
  onClear: () => void;
  className?: string;
}

export const BulkActionsBar = ({
  count,
  icon: Icon,
  label,
  onDelete,
  onMove,
  onClear,
  className,
}: IBulkActionsBarProps) => {
  const t = useTranslations();
  if (count <= 0) return null;

  return (
    <div
      className={clsx(
        'relative flex items-center gap-1.5 overflow-hidden rounded-xl border border-[color:var(--border-active)] bg-[color:var(--accent-soft)] px-2 py-1.5 shadow-[0_1px_3px_-1px_rgba(0,0,0,0.06)]',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="absolute top-1.5 bottom-1.5 left-0 w-[2px] rounded-r-full bg-gradient-to-b from-[color:var(--accent)] to-[color:var(--accent-2)]"
      />
      <span className="ml-0.5 flex h-5 min-w-5 items-center justify-center rounded-md bg-gradient-to-br from-[color:var(--accent)] to-[color:var(--accent-2)] px-1 text-[10px] font-bold text-[color:var(--on-accent)] shadow-sm">
        {count}
      </span>
      <Icon className="h-3.5 w-3.5 shrink-0 text-[color:var(--accent-text)]" />
      <span className="truncate text-[11px] font-medium text-[color:var(--accent-text)]">{label}</span>
      <div className="ml-auto flex items-center gap-0.5">
        {onMove && (
          <button
            type="button"
            onClick={onMove}
            className="rounded-md p-1 text-[color:var(--text-muted)] transition-colors hover:bg-[color:var(--surface-overlay)] hover:text-[color:var(--accent-text)]"
            title={t.platform.sidebar.moveToFolder}
          >
            <FolderInput className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={onDelete}
          className="rounded-md p-1 text-[color:var(--text-muted)] transition-colors hover:bg-red-500/10 hover:text-red-600"
          title={t.platform.sidebar.delete}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onClear}
          className="rounded-md p-1 text-[color:var(--text-subtle)] transition-colors hover:bg-[color:var(--surface-overlay)] hover:text-[color:var(--text)]"
          title={t.platform.sidebar.cancel}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

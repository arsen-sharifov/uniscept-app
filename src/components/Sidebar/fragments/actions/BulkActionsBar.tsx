'use client';

import { clsx } from 'clsx';
import type { LucideIcon } from 'lucide-react';
import { FolderInput, Trash2, X } from 'lucide-react';

import { SelectionStrip } from '@/components/SelectionStrip';
import { useTranslations } from '@/i18n';

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
        'relative flex items-center gap-1.5 overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-2 py-1.5 shadow-[var(--shadow-modal)]',
        className,
      )}
    >
      <SelectionStrip />
      <span className="ml-0.5 flex h-5 min-w-5 items-center justify-center rounded-md bg-[color:var(--accent)] px-1 font-mono-ui text-[10px] font-bold text-[color:var(--on-accent)] shadow-[var(--shadow-pip)]">
        {count}
      </span>
      <Icon className="h-3.5 w-3.5 shrink-0 text-[color:var(--accent-text)]" />
      <span className="truncate font-grotesk text-[11px] font-medium text-[color:var(--accent-text)]">{label}</span>
      <div className="ml-auto flex items-center gap-0.5">
        {onMove && (
          <button
            type="button"
            onClick={onMove}
            className="cursor-pointer rounded-lg p-1 text-[color:var(--text-muted)] transition-colors duration-150 hover:bg-[color:var(--surface-overlay)] hover:text-[color:var(--accent-text)] focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:outline-none active:bg-[color:var(--accent-soft)] active:text-[color:var(--accent-text)] motion-reduce:transition-none"
            title={t.platform.sidebar.moveToFolder}
          >
            <FolderInput className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={onDelete}
          className="cursor-pointer rounded-lg p-1 text-[color:var(--text-muted)] transition-colors duration-150 hover:bg-[color:var(--status-error-bg)] hover:text-[color:var(--status-error)] focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:outline-none active:bg-[color:var(--status-error-soft)] active:text-[color:var(--status-error)] motion-reduce:transition-none"
          title={t.platform.sidebar.delete}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onClear}
          className="cursor-pointer rounded-lg p-1 text-[color:var(--text-subtle)] transition-colors duration-150 hover:bg-[color:var(--surface-overlay)] hover:text-[color:var(--text-strong)] focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:outline-none active:bg-[color:var(--surface-overlay)] active:text-[color:var(--text-strong)] motion-reduce:transition-none"
          title={t.platform.sidebar.cancel}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

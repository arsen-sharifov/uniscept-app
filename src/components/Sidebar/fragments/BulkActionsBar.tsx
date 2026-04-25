'use client';

import type { LucideIcon } from 'lucide-react';
import { FolderInput, Trash2, X } from 'lucide-react';
import { clsx } from 'clsx';
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
        'relative flex items-center gap-1.5 overflow-hidden rounded-xl border border-emerald-500/20 bg-gradient-to-r from-emerald-50/85 via-emerald-50/60 to-cyan-50/85 px-2 py-1.5 shadow-[0_1px_3px_-1px_rgba(0,0,0,0.06)]',
        className
      )}
    >
      <span
        aria-hidden="true"
        className="absolute top-1.5 bottom-1.5 left-0 w-[2px] rounded-r-full bg-gradient-to-b from-emerald-500 to-cyan-500"
      />
      <span className="ml-0.5 flex h-5 min-w-5 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-cyan-500 px-1 text-[10px] font-bold text-white shadow-sm">
        {count}
      </span>
      <Icon className="h-3.5 w-3.5 shrink-0 text-emerald-700/70" />
      <span className="truncate text-[11px] font-medium text-emerald-900/85">
        {label}
      </span>
      <div className="ml-auto flex items-center gap-0.5">
        {onMove && (
          <button
            type="button"
            onClick={onMove}
            className="rounded-md p-1 text-black/55 transition-colors hover:bg-white/70 hover:text-emerald-700"
            title={t.platform.sidebar.moveToFolder}
          >
            <FolderInput className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={onDelete}
          className="rounded-md p-1 text-black/55 transition-colors hover:bg-red-50 hover:text-red-600"
          title={t.platform.sidebar.delete}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onClear}
          className="rounded-md p-1 text-black/40 transition-colors hover:bg-white/70 hover:text-black/80"
          title={t.platform.sidebar.cancel}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

'use client';

import { clsx } from 'clsx';
import { Folder, FolderOpen, Home } from 'lucide-react';
import { useState, useMemo } from 'react';

import type { TNavItem } from '@interfaces';

import { Modal } from '@/components/Modal';
import { SelectionStrip } from '@/components/SelectionStrip';
import { useTranslations } from '@/i18n';

import { INDENTATION_WIDTH } from '../../consts';
import { flattenTree } from '../../utils';

interface IMoveDialogProps {
  open: boolean;
  items: TNavItem[];
  selectedIds: Set<string>;
  onMove: (targetParentId: string | null) => void;
  onCancel: () => void;
}

export const MoveDialog = ({ open, items, selectedIds, onMove, onCancel }: IMoveDialogProps) => {
  const t = useTranslations();
  const [targetId, setTargetId] = useState<string | null>(null);

  const allFolders = useMemo(() => {
    const flat = flattenTree(items, new Set());

    return flat.filter((item) => item.type === 'folder');
  }, [items]);

  const folders = useMemo(() => allFolders.filter((folder) => !selectedIds.has(folder.id)), [allFolders, selectedIds]);

  const handleConfirm = () => {
    onMove(targetId);
    setTargetId(null);
  };

  const handleCancel = () => {
    setTargetId(null);
    onCancel();
  };

  return (
    <Modal open={open} onClose={handleCancel} className="!rounded-xl">
      <div className="p-6">
        <h2 className="mb-4 font-grotesk text-lg font-semibold text-[color:var(--text-strong)]">
          {t.platform.sidebar.moveToFolder}
        </h2>

        <div className="mb-4 max-h-60 space-y-0.5 overflow-y-auto rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-soft)] p-1.5">
          <button
            type="button"
            onClick={() => setTargetId(null)}
            className={clsx(
              'relative flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 font-grotesk text-sm transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:outline-none focus-visible:ring-inset active:bg-[color:var(--accent-soft)] active:text-[color:var(--text-strong)] motion-reduce:transition-none',
              targetId === null
                ? 'bg-[color:var(--accent-soft)] font-medium text-[color:var(--text-strong)]'
                : 'text-[color:var(--text)] hover:bg-[color:var(--surface-overlay)] hover:text-[color:var(--text-strong)]',
            )}
          >
            {targetId === null && <SelectionStrip />}
            <Home
              className={clsx(
                'h-4 w-4 shrink-0',
                targetId === null ? 'text-[color:var(--accent-text)]' : 'text-[color:var(--text-muted)]',
              )}
            />
            <span>{t.platform.sidebar.rootLevel}</span>
          </button>

          {folders.map((folder) => (
            <button
              type="button"
              key={folder.id}
              onClick={() => setTargetId(folder.id)}
              style={{ paddingLeft: folder.depth * INDENTATION_WIDTH + 12 }}
              className={clsx(
                'relative flex w-full cursor-pointer items-center gap-2 rounded-lg py-2 pr-3 font-grotesk text-sm transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:outline-none focus-visible:ring-inset active:bg-[color:var(--accent-soft)] active:text-[color:var(--text-strong)] motion-reduce:transition-none',
                targetId === folder.id
                  ? 'bg-[color:var(--accent-soft)] font-medium text-[color:var(--text-strong)]'
                  : 'text-[color:var(--text)] hover:bg-[color:var(--surface-overlay)] hover:text-[color:var(--text-strong)]',
              )}
            >
              {targetId === folder.id ? (
                <>
                  <SelectionStrip />
                  <FolderOpen className="h-4 w-4 shrink-0 text-[color:var(--accent-text)]" />
                </>
              ) : (
                <Folder className="h-4 w-4 shrink-0 text-[color:var(--text-muted)]" />
              )}
              <span className="truncate">{folder.name}</span>
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="cursor-pointer rounded-lg border border-[color:var(--border-strong)] px-4 py-2 font-grotesk text-sm font-medium text-[color:var(--text-muted)] transition-colors duration-150 hover:bg-[color:var(--surface-overlay)] hover:text-[color:var(--text-strong)] focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:outline-none active:bg-[color:var(--surface-overlay)] active:text-[color:var(--text-strong)] motion-reduce:transition-none"
          >
            {t.platform.sidebar.cancel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="cursor-pointer rounded-lg bg-[color:var(--accent)] px-4 py-2 font-grotesk text-sm font-medium text-[color:var(--on-accent)] shadow-[0_10px_28px_-12px_var(--accent-glow)] transition-colors duration-150 hover:bg-[color:var(--accent-strong)] focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:outline-none active:bg-[color:var(--accent-strong)] motion-reduce:transition-none"
          >
            {t.platform.sidebar.move}
          </button>
        </div>
      </div>
    </Modal>
  );
};

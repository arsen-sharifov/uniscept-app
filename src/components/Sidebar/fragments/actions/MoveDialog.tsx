'use client';

import { clsx } from 'clsx';
import { Folder, FolderOpen, Home } from 'lucide-react';
import { useState, useMemo } from 'react';

import type { TNavItem } from '@interfaces';
import { useTranslations } from '@hooks';
import { Modal } from '@/components/Modal';

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
    <Modal open={open} onClose={handleCancel}>
      <div className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-[color:var(--text-strong)]">
          {t.platform.sidebar.moveToFolder}
        </h2>

        <div className="mb-4 max-h-60 space-y-0.5 overflow-y-auto rounded-xl border border-[color:var(--border)] p-1.5">
          <button
            type="button"
            onClick={() => setTargetId(null)}
            className={clsx(
              'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
              targetId === null
                ? 'bg-[color:var(--accent-soft)] text-[color:var(--accent-text)]'
                : 'text-[color:var(--text-muted)] hover:bg-[color:var(--surface-overlay)]',
            )}
          >
            <Home
              className={clsx(
                'h-4 w-4 shrink-0',
                targetId === null ? 'text-[color:var(--accent)]' : 'text-[color:var(--text-subtle)]',
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
                'flex w-full items-center gap-2 rounded-lg py-2 pr-3 text-sm transition-colors',
                targetId === folder.id
                  ? 'bg-[color:var(--accent-soft)] text-[color:var(--accent-text)]'
                  : 'text-[color:var(--text-muted)] hover:bg-[color:var(--surface-overlay)]',
              )}
            >
              {targetId === folder.id ? (
                <FolderOpen className="h-4 w-4 shrink-0 text-[color:var(--accent)]" />
              ) : (
                <Folder className="h-4 w-4 shrink-0 text-[color:var(--text-subtle)]" />
              )}
              <span className="truncate">{folder.name}</span>
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-xl px-4 py-2 text-sm text-[color:var(--text-muted)] transition-colors hover:bg-[color:var(--surface-overlay)] hover:text-[color:var(--text-strong)]"
          >
            {t.platform.sidebar.cancel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="rounded-xl bg-gradient-to-r from-[color:var(--accent)] to-[color:var(--accent-2)] px-4 py-2 text-sm font-medium text-[color:var(--on-accent)] shadow-sm transition-all duration-150 hover:scale-[1.02] hover:shadow-md active:scale-[0.99]"
          >
            {t.platform.sidebar.move}
          </button>
        </div>
      </div>
    </Modal>
  );
};

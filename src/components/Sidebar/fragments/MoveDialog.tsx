'use client';

import { useState, useMemo } from 'react';
import { Folder, FolderOpen, Home } from 'lucide-react';
import { clsx } from 'clsx';
import type { TNavItem } from '@interfaces';
import { useTranslations } from '@hooks';
import { Modal } from '@/components';
import { INDENTATION_WIDTH } from '../consts';
import { flattenTree } from '../dnd';

interface IMoveDialogProps {
  open: boolean;
  items: TNavItem[];
  selectedIds: Set<string>;
  onMove: (targetParentId: string | null) => void;
  onCancel: () => void;
}

export const MoveDialog = ({
  open,
  items,
  selectedIds,
  onMove,
  onCancel,
}: IMoveDialogProps) => {
  const t = useTranslations();
  const [targetId, setTargetId] = useState<string | null>(null);

  const allFolders = useMemo(() => {
    const flat = flattenTree(items, new Set());
    return flat.filter((item) => item.type === 'folder');
  }, [items]);

  const folders = useMemo(
    () => allFolders.filter((folder) => !selectedIds.has(folder.id)),
    [allFolders, selectedIds]
  );

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
        <h2 className="mb-4 text-lg font-semibold text-black/80">
          {t.platform.sidebar.moveToFolder}
        </h2>

        <div className="mb-4 max-h-60 space-y-0.5 overflow-y-auto rounded-xl border border-black/5 p-1.5">
          <button
            onClick={() => setTargetId(null)}
            className={clsx(
              'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
              targetId === null
                ? 'bg-gradient-to-r from-emerald-500/15 to-cyan-500/15 text-emerald-700'
                : 'text-black/60 hover:bg-black/5'
            )}
          >
            <Home
              className={clsx(
                'h-4 w-4 shrink-0',
                targetId === null ? 'text-emerald-500' : 'text-black/30'
              )}
            />
            <span>{t.platform.sidebar.rootLevel}</span>
          </button>

          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => setTargetId(folder.id)}
              style={{ paddingLeft: folder.depth * INDENTATION_WIDTH + 12 }}
              className={clsx(
                'flex w-full items-center gap-2 rounded-lg py-2 pr-3 text-sm transition-colors',
                targetId === folder.id
                  ? 'bg-gradient-to-r from-emerald-500/15 to-cyan-500/15 text-emerald-700'
                  : 'text-black/60 hover:bg-black/5'
              )}
            >
              {targetId === folder.id ? (
                <FolderOpen className="h-4 w-4 shrink-0 text-emerald-500" />
              ) : (
                <Folder className="h-4 w-4 shrink-0 text-black/30" />
              )}
              <span className="truncate">{folder.name}</span>
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={handleCancel}
            className="rounded-xl px-4 py-2 text-sm text-black/50 transition-colors hover:bg-black/5"
          >
            {t.platform.sidebar.cancel}
          </button>
          <button
            onClick={handleConfirm}
            className="rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 hover:scale-[1.02] hover:shadow-md active:scale-[0.99]"
          >
            {t.platform.sidebar.move}
          </button>
        </div>
      </div>
    </Modal>
  );
};

'use client';

import { useState, type KeyboardEvent, type MouseEvent } from 'react';
import { ChevronsUpDown, LayoutGrid, Plus } from 'lucide-react';
import { clsx } from 'clsx';
import type { IWorkspaceItem } from '@interfaces';
import { useTranslations } from '@hooks';
import { Popover } from '@/components';
import { BulkActionsBar } from './BulkActionsBar';
import { WorkspaceItems } from './WorkspaceItems';

interface IWorkspaceSwitcherProps {
  workspaces: IWorkspaceItem[];
  activeWorkspaceId?: string;
  selectedIds: Set<string>;
  editingId: string | null;
  editValue: string;
  setEditValue: (value: string) => void;
  inputRef: (element: HTMLInputElement | null) => void;
  commitRename: () => void;
  handleKeyDown: (event: KeyboardEvent) => void;
  onWorkspaceClick: (id: string, event: MouseEvent) => void;
  onCreateWorkspace?: () => void;
  onRequestRename: (id: string, name: string) => void;
  onRequestDelete: (id: string, name: string) => void;
  onMoveWorkspace?: (id: string, position: number) => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
}

export const WorkspaceSwitcher = ({
  workspaces,
  activeWorkspaceId,
  selectedIds,
  editingId,
  editValue,
  setEditValue,
  inputRef,
  commitRename,
  handleKeyDown,
  onWorkspaceClick,
  onCreateWorkspace,
  onRequestRename,
  onRequestDelete,
  onMoveWorkspace,
  onBulkDelete,
  onClearSelection,
}: IWorkspaceSwitcherProps) => {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const active = workspaces.find(
    (workspace) => workspace.id === activeWorkspaceId
  );

  return (
    <Popover
      open={open || editingId !== null}
      onOpenChange={(nextOpen) => {
        if (editingId !== null) return;
        if (!nextOpen && selectedIds.size > 0) onClearSelection();
        setOpen(nextOpen);
      }}
      placement="bottom-start"
      offset={6}
      panelClassName="w-60 max-h-[60vh] overflow-y-auto [scrollbar-width:thin]"
      trigger={
        <button
          type="button"
          className={clsx(
            'group flex w-full min-w-0 items-center gap-2 rounded-xl px-2 py-1.5 text-left transition-colors duration-150',
            open
              ? 'bg-black/[0.04]'
              : 'hover:bg-black/[0.03] active:bg-black/[0.05]'
          )}
        >
          <span
            className={clsx(
              'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors',
              active
                ? 'bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-sm'
                : 'bg-black/5 text-black/40'
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </span>
          <span className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="truncate text-[10px] font-medium tracking-wider text-black/35 uppercase">
              {t.platform.sidebar.workspaces}
            </span>
            <span
              className={clsx(
                'truncate text-sm',
                active
                  ? 'font-semibold text-black/85'
                  : 'font-medium text-black/40'
              )}
              title={active?.name ?? t.platform.sidebar.noWorkspaceSelected}
            >
              {active?.name ?? t.platform.sidebar.noWorkspaceSelected}
            </span>
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-black/30 transition-colors group-hover:text-black/60" />
        </button>
      }
    >
      <div className="flex items-center justify-between border-b border-black/5 px-3 py-2">
        <span className="text-[10px] font-semibold tracking-wider text-black/40 uppercase">
          {t.platform.sidebar.workspaces}
          <span className="ml-1.5 inline-flex items-center justify-center rounded-md bg-black/[0.06] px-1.5 py-0.5 text-[10px] font-semibold text-black/50">
            {workspaces.length}
          </span>
        </span>
        <button
          type="button"
          onClick={() => {
            onCreateWorkspace?.();
            setOpen(false);
          }}
          className="flex items-center gap-1 rounded-lg px-1.5 py-1 text-[11px] font-medium text-emerald-700 transition-colors hover:bg-emerald-500/10"
          title={t.platform.sidebar.newWorkspace}
        >
          <Plus className="h-3 w-3" />
          {t.platform.sidebar.newWorkspace}
        </button>
      </div>

      <div className="space-y-0.5 px-2 py-2">
        {workspaces.length === 0 ? (
          <div className="flex flex-col items-center px-3 py-6 text-center">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20">
              <LayoutGrid className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="mb-3 text-xs text-black/40">
              {t.platform.sidebar.noWorkspaces}
            </p>
            <button
              type="button"
              onClick={() => {
                onCreateWorkspace?.();
                setOpen(false);
              }}
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-shadow hover:shadow-md"
            >
              {t.platform.sidebar.newWorkspace}
            </button>
          </div>
        ) : (
          <WorkspaceItems
            workspaces={workspaces}
            activeWorkspaceId={activeWorkspaceId}
            selectedIds={selectedIds}
            editingId={editingId}
            editValue={editValue}
            setEditValue={setEditValue}
            inputRef={inputRef}
            commitRename={commitRename}
            handleKeyDown={handleKeyDown}
            onClick={(id, event) => {
              onWorkspaceClick(id, event);
              if (!event.shiftKey && !event.ctrlKey && !event.metaKey)
                setOpen(false);
            }}
            onRequestRename={onRequestRename}
            onRequestDelete={onRequestDelete}
            onMove={(id, position) => onMoveWorkspace?.(id, position)}
          />
        )}
      </div>

      {selectedIds.size > 0 && (
        <div className="border-t border-black/[0.06] bg-emerald-500/[0.03] px-2 py-2">
          <BulkActionsBar
            count={selectedIds.size}
            icon={LayoutGrid}
            label={t.platform.sidebar.workspacesSelected}
            onDelete={onBulkDelete}
            onClear={onClearSelection}
          />
        </div>
      )}
    </Popover>
  );
};

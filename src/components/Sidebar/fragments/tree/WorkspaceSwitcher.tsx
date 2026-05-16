'use client';

import { useState, type KeyboardEvent, type MouseEvent } from 'react';
import { ChevronsUpDown, LayoutGrid, Plus } from 'lucide-react';
import { clsx } from 'clsx';
import type { IWorkspaceItem } from '@interfaces';
import { useTranslations } from '@hooks';
import { Popover } from '@/components';
import { BulkActionsBar } from '../actions/BulkActionsBar';
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
  cancelEditing: () => void;
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
  cancelEditing,
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
  const active = workspaces.find((workspace) => workspace.id === activeWorkspaceId);

  return (
    <Popover
      open={open || editingId !== null}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          setOpen(true);
          return;
        }
        if (editingId !== null) cancelEditing();
        if (selectedIds.size > 0) onClearSelection();
        setOpen(false);
      }}
      placement="bottom-start"
      offset={6}
      panelClassName="w-60 max-h-[60vh] overflow-y-auto [scrollbar-width:thin]"
      trigger={
        <button
          type="button"
          className={clsx(
            'group flex w-full min-w-0 items-center gap-2 rounded-xl px-2 py-1.5 text-left transition-colors duration-150',
            open ? 'bg-[color:var(--surface-overlay)]' : 'hover:bg-[color:var(--surface-overlay)]'
          )}
        >
          <span
            className={clsx(
              'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors',
              active
                ? 'bg-gradient-to-br from-[color:var(--accent)] to-[color:var(--accent-2)] text-[color:var(--on-accent)] shadow-sm'
                : 'bg-[color:var(--surface-overlay)] text-[color:var(--text-muted)]'
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </span>
          <span className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="truncate text-[10px] font-medium tracking-wider text-[color:var(--text-subtle)] uppercase">
              {t.platform.sidebar.workspaces}
            </span>
            <span
              className={clsx(
                'truncate text-sm',
                active ? 'font-semibold text-[color:var(--text-strong)]' : 'font-medium text-[color:var(--text-muted)]'
              )}
              title={active?.name ?? t.platform.sidebar.noWorkspaceSelected}
            >
              {active?.name ?? t.platform.sidebar.noWorkspaceSelected}
            </span>
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-[color:var(--text-subtle)] transition-colors group-hover:text-[color:var(--text)]" />
        </button>
      }
    >
      <div className="flex items-center justify-between border-b border-[color:var(--border)] px-3 py-2">
        <span className="text-[10px] font-semibold tracking-wider text-[color:var(--text-muted)] uppercase">
          {t.platform.sidebar.workspaces}
          <span className="ml-1.5 inline-flex items-center justify-center rounded-md bg-[color:var(--surface-overlay)] px-1.5 py-0.5 text-[10px] font-semibold text-[color:var(--text-muted)]">
            {workspaces.length}
          </span>
        </span>
        <button
          type="button"
          onClick={() => {
            onCreateWorkspace?.();
            setOpen(false);
          }}
          className="flex items-center gap-1 rounded-lg px-1.5 py-1 text-[11px] font-medium text-[color:var(--accent-text)] transition-colors hover:bg-[color:var(--accent-soft)]"
          title={t.platform.sidebar.newWorkspace}
        >
          <Plus className="h-3 w-3" />
          {t.platform.sidebar.newWorkspace}
        </button>
      </div>

      <div className="space-y-0.5 px-2 py-2">
        {workspaces.length === 0 ? (
          <div className="flex flex-col items-center px-3 py-6 text-center">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[color:var(--accent)]/20 to-[color:var(--accent-2)]/20">
              <LayoutGrid className="h-4 w-4 text-[color:var(--accent)]" />
            </div>
            <p className="mb-3 text-xs text-[color:var(--text-muted)]">{t.platform.sidebar.noWorkspaces}</p>
            <button
              type="button"
              onClick={() => {
                onCreateWorkspace?.();
                setOpen(false);
              }}
              className="rounded-xl bg-gradient-to-r from-[color:var(--accent)] to-[color:var(--accent-2)] px-3 py-1.5 text-xs font-medium text-[color:var(--on-accent)] shadow-sm transition-shadow hover:shadow-md"
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
              if (!event.shiftKey && !event.ctrlKey && !event.metaKey) setOpen(false);
            }}
            onRequestRename={onRequestRename}
            onRequestDelete={onRequestDelete}
            onMove={(id, position) => onMoveWorkspace?.(id, position)}
          />
        )}
      </div>

      {selectedIds.size > 0 && (
        <div className="border-t border-[color:var(--border)] bg-[color:var(--accent-soft)] px-2 py-2">
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

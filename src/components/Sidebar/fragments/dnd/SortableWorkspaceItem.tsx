'use client';

import { useSortable } from '@dnd-kit/sortable';
import { clsx } from 'clsx';
import { Check, LayoutGrid, Pencil, Settings, Trash2 } from 'lucide-react';
import { type KeyboardEvent, type MouseEvent } from 'react';

import type { IWorkspaceItem, TWorkspaceDropZone } from '@interfaces';

import { SelectionStrip } from '@/components/SelectionStrip';
import { SmartTooltip } from '@/components/Tooltip';
import { useTranslations } from '@/i18n';

import { DropLineIndicator } from './DropLineIndicator';
import { GripActivator } from './GripActivator';
import { InlineRenameInput } from './InlineRenameInput';
import { ItemActionsToolbar } from './ItemActionsToolbar';
import { getDragTransformStyle } from '../../utils';

interface ISortableWorkspaceItemProps {
  workspace: IWorkspaceItem;
  isActive: boolean;
  isSelected: boolean;
  isEditing: boolean;
  editValue: string;
  setEditValue: (value: string) => void;
  inputRef: (element: HTMLInputElement | null) => void;
  commitRename: () => void;
  handleKeyDown: (event: KeyboardEvent) => void;
  onClick: (id: string, event: MouseEvent) => void;
  onRequestRename: (id: string, name: string) => void;
  onRequestDelete: (id: string, name: string) => void;
  onRequestSettings: (id: string) => void;
  isDragActive: boolean;
  dropIndicator: TWorkspaceDropZone | null;
}

export const SortableWorkspaceItem = ({
  workspace,
  isActive,
  isSelected,
  isEditing,
  editValue,
  setEditValue,
  inputRef,
  commitRename,
  handleKeyDown,
  onClick,
  onRequestRename,
  onRequestDelete,
  onRequestSettings,
  isDragActive,
  dropIndicator,
}: ISortableWorkspaceItemProps) => {
  const translations = useTranslations();
  const canManage = workspace.canManageWorkspace;
  const noPermission = translations.common.noPermission;
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: workspace.id,
    disabled: isEditing,
  });

  return (
    <div
      ref={setNodeRef}
      style={getDragTransformStyle(transform, transition, isDragActive)}
      data-workspace-id={workspace.id}
      className="group/item relative"
    >
      {dropIndicator && <DropLineIndicator position={dropIndicator} />}

      {isActive && <SelectionStrip className="z-10" />}

      <div
        className={clsx(
          'relative flex min-h-7 min-w-0 items-stretch overflow-hidden',
          isDragging && 'pointer-events-none rounded-lg opacity-40 shadow-[var(--shadow-card-hover)]',
        )}
      >
        <button
          type="button"
          onClick={(event) => onClick(workspace.id, event)}
          onDoubleClick={(event) => event.preventDefault()}
          className={clsx(
            'flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1 font-grotesk text-sm leading-5 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:outline-none focus-visible:ring-inset active:bg-[color:var(--accent-soft)] active:text-[color:var(--text-strong)] motion-reduce:transition-none',
            isActive
              ? 'bg-[color:var(--accent-soft)] font-medium text-[color:var(--accent-text)] shadow-[0_6px_18px_-10px_var(--accent-glow)]'
              : 'text-[color:var(--text)] group-hover/item:bg-[color:var(--surface-overlay)] group-hover/item:text-[color:var(--text-strong)]',
            isSelected && !isActive && '!bg-[color:var(--accent-soft)] !text-[color:var(--text-strong)]',
            isSelected && 'ring-1 ring-[color:var(--border-active)] ring-inset',
          )}
        >
          <span className="relative h-4 w-4 shrink-0">
            <LayoutGrid
              className={clsx(
                'absolute inset-0 h-4 w-4 transition-opacity duration-150 motion-reduce:transition-none',
                isActive ? 'text-[color:var(--accent-text)]' : 'text-[color:var(--text-muted)]',
                !isEditing && 'group-hover/item:opacity-0',
              )}
            />
            {!isEditing && (
              <GripActivator
                setActivatorRef={setActivatorNodeRef}
                attributes={attributes}
                listeners={listeners}
                isActive={isActive}
                ariaLabel={translations.platform.sidebar.dragToReorder}
              />
            )}
          </span>
          {isEditing ? (
            <InlineRenameInput
              value={editValue}
              onChange={setEditValue}
              onCommit={commitRename}
              onKeyDown={handleKeyDown}
              inputRef={inputRef}
            />
          ) : (
            <SmartTooltip content={workspace.name} className="truncate" onlyIfTruncated>
              {workspace.name}
            </SmartTooltip>
          )}
          {isSelected && !isEditing && (
            <span
              aria-hidden="true"
              className="ml-auto flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent)] text-[color:var(--on-accent)] shadow-[var(--shadow-pip)]"
            >
              <Check strokeWidth={3.5} className="h-2 w-2" />
            </span>
          )}
        </button>

        {!isDragging && !isEditing && (
          <ItemActionsToolbar isActive={isActive} isSelected={isSelected}>
            <button
              type="button"
              onClick={() => onRequestSettings(workspace.id)}
              className="cursor-pointer rounded-lg p-1 text-[color:var(--text-muted)] transition-colors duration-150 hover:bg-[color:var(--surface-overlay)] hover:text-[color:var(--text-strong)] focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:outline-none active:bg-[color:var(--surface-overlay)] active:text-[color:var(--text-strong)] motion-reduce:transition-none"
              title={translations.platform.sidebar.workspaceSettings}
            >
              <Settings className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={canManage ? () => onRequestRename(workspace.id, workspace.name) : undefined}
              aria-disabled={!canManage}
              className={clsx(
                'rounded-lg p-1 text-[color:var(--text-muted)] transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:outline-none motion-reduce:transition-none',
                canManage
                  ? 'cursor-pointer hover:bg-[color:var(--surface-overlay)] hover:text-[color:var(--text-strong)] active:bg-[color:var(--surface-overlay)] active:text-[color:var(--text-strong)]'
                  : 'cursor-not-allowed opacity-50',
              )}
              title={canManage ? translations.platform.sidebar.rename : noPermission}
            >
              <Pencil className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={canManage ? () => onRequestDelete(workspace.id, workspace.name) : undefined}
              aria-disabled={!canManage}
              className={clsx(
                'rounded-lg p-1 text-[color:var(--text-muted)] transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:outline-none motion-reduce:transition-none',
                canManage
                  ? 'cursor-pointer hover:bg-[color:var(--status-error-bg)] hover:text-[color:var(--status-error)] active:bg-[color:var(--status-error-soft)] active:text-[color:var(--status-error)]'
                  : 'cursor-not-allowed opacity-50',
              )}
              title={canManage ? translations.platform.sidebar.delete : noPermission}
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </ItemActionsToolbar>
        )}
      </div>
    </div>
  );
};

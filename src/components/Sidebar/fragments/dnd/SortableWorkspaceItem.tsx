'use client';

import { type KeyboardEvent, type MouseEvent } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { Check, LayoutGrid, Pencil, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import type { IWorkspaceItem, TWorkspaceDropZone } from '@interfaces';
import { useTranslations } from '@hooks';
import { SmartTooltip } from '@/components';
import { getDragTransformStyle } from '../../utils';
import { DropLineIndicator } from './DropLineIndicator';
import { GripActivator } from './GripActivator';
import { InlineRenameInput } from './InlineRenameInput';
import { ItemActionsToolbar } from './ItemActionsToolbar';

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
  isDragActive,
  dropIndicator,
}: ISortableWorkspaceItemProps) => {
  const translations = useTranslations();
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

      {isActive && (
        <span className="pointer-events-none absolute top-1/2 left-0 z-10 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-[color:var(--accent)] to-[color:var(--accent-2)]" />
      )}

      <div
        className={clsx('relative flex min-h-7 min-w-0 items-stretch', isDragging && 'pointer-events-none opacity-40')}
      >
        <button
          type="button"
          onClick={(event) => onClick(workspace.id, event)}
          onDoubleClick={(event) => event.preventDefault()}
          className={clsx(
            'flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1 text-sm leading-5 transition-colors duration-150',
            isActive
              ? 'bg-[color:var(--accent-soft)] font-medium text-[color:var(--accent-text)]'
              : 'text-[color:var(--text)] group-hover/item:bg-[color:var(--surface-overlay)] group-hover/item:text-[color:var(--text-strong)]',
            isSelected && !isActive && '!bg-[color:var(--accent-soft)] !text-[color:var(--text-strong)]',
            isSelected && 'ring-1 ring-[color:var(--border-active)] ring-inset'
          )}
        >
          <span className="relative h-4 w-4 shrink-0">
            <LayoutGrid
              className={clsx(
                'absolute inset-0 h-4 w-4 transition-opacity duration-150',
                isActive ? 'text-[color:var(--accent)]' : 'text-[color:var(--text-subtle)]',
                !isEditing && 'group-hover/item:opacity-0'
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
              className="ml-auto flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[color:var(--accent)] to-[color:var(--accent-2)] text-[color:var(--on-accent)] shadow-[0_1px_2px_-1px_var(--accent-glow)]"
            >
              <Check strokeWidth={3.5} className="h-2 w-2" />
            </span>
          )}
        </button>

        {!isDragging && !isEditing && (
          <ItemActionsToolbar isActive={isActive} isSelected={isSelected}>
            <button
              type="button"
              onClick={() => onRequestRename(workspace.id, workspace.name)}
              className="rounded-md p-1 text-[color:var(--text-muted)] transition-colors duration-150 hover:bg-[color:var(--surface-overlay)] hover:text-[color:var(--text-strong)]"
              title={translations.platform.sidebar.rename}
            >
              <Pencil className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => onRequestDelete(workspace.id, workspace.name)}
              className="rounded-md p-1 text-[color:var(--text-muted)] transition-colors duration-150 hover:bg-red-500/10 hover:text-red-500"
              title={translations.platform.sidebar.delete}
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </ItemActionsToolbar>
        )}
      </div>
    </div>
  );
};

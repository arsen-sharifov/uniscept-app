'use client';

import { useSortable } from '@dnd-kit/sortable';
import { clsx } from 'clsx';
import { Check, ChevronRight, FileText, Folder, FolderOpen, Pencil, Plus, Trash2 } from 'lucide-react';
import { type KeyboardEvent, type MouseEvent } from 'react';

import type { IFlattenedItem, TDropZone, TNavItemType } from '@interfaces';
import { useTranslations } from '@hooks';
import { SmartTooltip } from '@/components/Tooltip';

import { DropLineIndicator } from './DropLineIndicator';
import { GripActivator } from './GripActivator';
import { InlineRenameInput } from './InlineRenameInput';
import { ItemActionsToolbar } from './ItemActionsToolbar';
import { INDENTATION_WIDTH } from '../../consts';
import { getDragTransformStyle } from '../../utils';

interface ISortableNavItemProps {
  item: IFlattenedItem;
  activeItemId?: string;
  isActivelyDragged: boolean;
  editingId: string | null;
  editValue: string;
  setEditValue: (value: string) => void;
  inputRef: (element: HTMLInputElement | null) => void;
  commitRename: () => void;
  handleKeyDown: (event: KeyboardEvent) => void;
  startEditing: (id: string, name: string) => void;
  isSelected: boolean;
  isBulkDragActive: boolean;
  onItemClick?: (id: string, event: MouseEvent) => void;
  onRequestDelete?: (id: string, name: string, type: TNavItemType) => void;
  onCreateThread?: (folderId?: string) => void;
  onToggleCollapse: (id: string) => void;
  dropIndicator: TDropZone | null;
  dropDepth: number | null;
  isDragActive: boolean;
}

export const SortableNavItem = ({
  item,
  activeItemId,
  isActivelyDragged,
  isSelected,
  isBulkDragActive,
  editingId,
  editValue,
  setEditValue,
  inputRef,
  commitRename,
  handleKeyDown,
  startEditing,
  onItemClick,
  onRequestDelete,
  onCreateThread,
  onToggleCollapse,
  dropIndicator,
  dropDepth,
  isDragActive,
}: ISortableNavItemProps) => {
  const translations = useTranslations();
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled: editingId === item.id,
  });

  const isActive = item.id === activeItemId;
  const isEditing = editingId === item.id;
  const isFolder = item.type === 'folder';
  const isEmpty = isFolder && item.childCount === 0;

  const isHiddenDuringBulkDrag = isBulkDragActive && isSelected && !isActivelyDragged;

  const handleClick = (event: MouseEvent) => {
    const hasModifier = event.ctrlKey || event.metaKey || event.shiftKey;
    if (hasModifier) {
      onItemClick?.(item.id, event);

      return;
    }
    if (isFolder) {
      if (!isEmpty) onToggleCollapse(item.id);
    } else {
      onItemClick?.(item.id, event);
    }
  };

  const showLine = dropIndicator === 'before' || dropIndicator === 'after';
  const showFolderHighlight = dropIndicator === 'inside';
  const highlightIcon = isActive || showFolderHighlight;

  return (
    <div
      ref={setNodeRef}
      style={{
        ...getDragTransformStyle(transform, transition, isDragActive),
        paddingLeft: item.depth * INDENTATION_WIDTH,
      }}
      data-item-id={item.id}
      className={clsx('group/item relative', isHiddenDuringBulkDrag && 'h-0 overflow-hidden opacity-0')}
    >
      {showLine && (
        <DropLineIndicator
          position={dropIndicator as 'before' | 'after'}
          leftOffset={(dropDepth ?? item.depth) * INDENTATION_WIDTH + 6}
        />
      )}

      {isActive && (
        <span className="pointer-events-none absolute top-1/2 left-0 z-10 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-[color:var(--accent)] to-[color:var(--accent-2)]" />
      )}

      <div
        className={clsx('relative flex min-h-7 min-w-0 items-stretch', isDragging && 'pointer-events-none opacity-40')}
      >
        <button
          type="button"
          role="treeitem"
          aria-level={item.depth + 1}
          aria-expanded={isFolder ? !item.collapsed : undefined}
          aria-selected={isSelected || undefined}
          onClick={handleClick}
          onDoubleClick={(event) => event.preventDefault()}
          className={clsx(
            'flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1.5 py-1 text-sm leading-5 transition-colors duration-150',
            isFolder && isEmpty ? 'cursor-default' : 'cursor-pointer',
            isActive
              ? 'bg-[color:var(--accent-soft)] font-medium text-[color:var(--accent-text)]'
              : 'text-[color:var(--text)] group-hover/item:bg-[color:var(--surface-overlay)] group-hover/item:text-[color:var(--text-strong)]',
            isSelected && !isActive && '!bg-[color:var(--accent-soft)] !text-[color:var(--text-strong)]',
            isSelected && 'ring-1 ring-[color:var(--border-active)] ring-inset',
            showFolderHighlight &&
              'bg-[color:var(--accent-soft)] !text-[color:var(--accent-text)] ring-1 ring-[color:var(--border-active)] ring-inset',
          )}
        >
          <span className="relative h-4 w-4 shrink-0">
            {isFolder ? (
              isEmpty || item.collapsed ? (
                <Folder
                  className={clsx(
                    'absolute inset-0 h-4 w-4 transition-opacity duration-150',
                    highlightIcon ? 'text-[color:var(--accent)]' : 'text-[color:var(--text-subtle)]',
                    !isEditing && 'group-hover/item:opacity-0',
                  )}
                />
              ) : (
                <FolderOpen
                  className={clsx(
                    'absolute inset-0 h-4 w-4 transition-opacity duration-150',
                    highlightIcon ? 'text-[color:var(--accent)]' : 'text-[color:var(--text-muted)]',
                    !isEditing && 'group-hover/item:opacity-0',
                  )}
                />
              )
            ) : (
              <FileText
                className={clsx(
                  'absolute inset-0 h-4 w-4 transition-opacity duration-150',
                  isActive ? 'text-[color:var(--accent)]' : 'text-[color:var(--text-subtle)]',
                  !isEditing && 'group-hover/item:opacity-0',
                )}
              />
            )}
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
            <SmartTooltip content={item.name} className="truncate" onlyIfTruncated>
              {item.name}
            </SmartTooltip>
          )}
          {isSelected && !isEditing ? (
            <span
              aria-hidden="true"
              className="ml-auto flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[color:var(--accent)] to-[color:var(--accent-2)] text-[color:var(--on-accent)] shadow-[0_1px_2px_-1px_var(--accent-glow)]"
            >
              <Check strokeWidth={3.5} className="h-2 w-2" />
            </span>
          ) : (
            isFolder &&
            !isEmpty &&
            !isEditing && (
              <ChevronRight
                aria-hidden="true"
                className={clsx(
                  'ml-auto h-3 w-3 shrink-0 transition-[transform,opacity,color] duration-150 group-hover/item:opacity-0',
                  !item.collapsed && 'rotate-90',
                  highlightIcon ? 'text-[color:var(--accent)]' : 'text-[color:var(--text-subtle)]',
                )}
              />
            )
          )}
        </button>

        {!isDragging && !isEditing && (
          <ItemActionsToolbar isActive={isActive} isSelected={isSelected}>
            {isFolder && (
              <button
                type="button"
                onClick={() => onCreateThread?.(item.id)}
                className="rounded-md p-1 text-[color:var(--text-muted)] transition-colors duration-150 hover:bg-[color:var(--surface-overlay)] hover:text-[color:var(--accent-text)]"
                title={translations.platform.sidebar.newThread}
              >
                <Plus className="h-3 w-3" />
              </button>
            )}
            <button
              type="button"
              onClick={() => startEditing(item.id, item.name)}
              className="rounded-md p-1 text-[color:var(--text-muted)] transition-colors duration-150 hover:bg-[color:var(--surface-overlay)] hover:text-[color:var(--text-strong)]"
              title={translations.platform.sidebar.rename}
            >
              <Pencil className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => onRequestDelete?.(item.id, item.name, item.type)}
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

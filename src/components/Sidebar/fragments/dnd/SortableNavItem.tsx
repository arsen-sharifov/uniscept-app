'use client';

import { useSortable } from '@dnd-kit/sortable';
import { clsx } from 'clsx';
import { Check, CheckCircle2, ChevronRight, FileText, Folder, FolderOpen, Pencil, Plus, Trash2 } from 'lucide-react';
import { type KeyboardEvent, type MouseEvent } from 'react';

import type { IFlattenedItem, TDropZone, TNavItemType } from '@interfaces';

import { SelectionStrip } from '@/components/SelectionStrip';
import { SmartTooltip } from '@/components/Tooltip';
import { useTranslations } from '@/i18n';
import { usePermissionsStore } from '@/lib/stores';

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
  const canManageStructure = usePermissionsStore((s) => s.canManageStructure);
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled: editingId === item.id || !canManageStructure,
  });

  const isActive = item.id === activeItemId;
  const isEditing = editingId === item.id;
  const isFolder = item.type === 'folder';
  const isEmpty = isFolder && item.childCount === 0;

  const isAnswered = !isFolder && !!item.answered;

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

      {isActive && <SelectionStrip className="z-10" />}

      <div
        className={clsx(
          'relative flex min-h-8 min-w-0 items-stretch overflow-hidden',
          isDragging && 'pointer-events-none rounded-lg opacity-40 shadow-[var(--shadow-card-hover)]',
        )}
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
            'flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-1.5 font-grotesk text-sm leading-5 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:outline-none focus-visible:ring-inset active:bg-[color:var(--accent-soft)] active:text-[color:var(--text-strong)] motion-reduce:transition-none',
            isFolder && isEmpty ? 'cursor-default' : 'cursor-pointer',
            isFolder && !isActive && 'font-medium',
            isActive
              ? 'bg-[color:var(--accent-soft)] font-medium text-[color:var(--accent-text)] shadow-[0_6px_18px_-10px_var(--accent-glow)]'
              : 'text-[color:var(--text)] group-hover/item:bg-[color:var(--surface-overlay)] group-hover/item:text-[color:var(--text-strong)]',
            isSelected && !isActive && '!bg-[color:var(--accent-soft)] !text-[color:var(--text-strong)]',
            isSelected && 'ring-1 ring-[color:var(--border-active)] ring-inset',
            showFolderHighlight &&
              'bg-[color:var(--accent-soft)] !text-[color:var(--accent-text)] !ring-2 !ring-[color:var(--accent)] ring-inset',
          )}
        >
          <span className="relative h-4 w-4 shrink-0">
            {isFolder ? (
              isEmpty || item.collapsed ? (
                <Folder
                  className={clsx(
                    'absolute inset-0 h-4 w-4 transition-opacity duration-150 motion-reduce:transition-none',
                    highlightIcon ? 'text-[color:var(--accent-text)]' : 'text-[color:var(--text-muted)]',
                    !isEditing && canManageStructure && 'group-hover/item:opacity-0',
                  )}
                />
              ) : (
                <FolderOpen
                  className={clsx(
                    'absolute inset-0 h-4 w-4 transition-opacity duration-150 motion-reduce:transition-none',
                    highlightIcon ? 'text-[color:var(--accent-text)]' : 'text-[color:var(--text-muted)]',
                    !isEditing && canManageStructure && 'group-hover/item:opacity-0',
                  )}
                />
              )
            ) : (
              <FileText
                className={clsx(
                  'absolute inset-0 h-4 w-4 transition-opacity duration-150 motion-reduce:transition-none',
                  isActive ? 'text-[color:var(--accent-text)]' : 'text-[color:var(--text-muted)]',
                  !isEditing && canManageStructure && 'group-hover/item:opacity-0',
                )}
              />
            )}
            {!isEditing && canManageStructure && (
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
          {isAnswered && !isSelected && !isEditing && (
            <span
              aria-label={translations.platform.sidebar.resolved}
              title={translations.platform.sidebar.resolved}
              className={clsx(
                'ml-auto flex shrink-0 items-center transition-opacity duration-150 motion-reduce:transition-none',
                canManageStructure && 'group-hover/item:opacity-0',
              )}
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-[color:var(--decision)]" strokeWidth={2.25} />
            </span>
          )}
          {isSelected && !isEditing ? (
            <span
              aria-hidden="true"
              className="ml-auto flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent)] text-[color:var(--on-accent)] shadow-[var(--shadow-pip)]"
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
                  'ml-auto h-3 w-3 shrink-0 transition-[transform,opacity,color] duration-150 motion-reduce:transition-none',
                  canManageStructure && 'group-hover/item:opacity-0',
                  !item.collapsed && 'rotate-90',
                  highlightIcon ? 'text-[color:var(--accent-text)]' : 'text-[color:var(--text-subtle)]',
                )}
              />
            )
          )}
        </button>

        {!isDragging && !isEditing && canManageStructure && (
          <ItemActionsToolbar isActive={isActive} isSelected={isSelected}>
            {isFolder && (
              <button
                type="button"
                onClick={() => onCreateThread?.(item.id)}
                className="cursor-pointer rounded-lg p-1 text-[color:var(--text-muted)] transition-colors duration-150 hover:bg-[color:var(--surface-overlay)] hover:text-[color:var(--accent-text)] focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:outline-none active:bg-[color:var(--accent-soft)] active:text-[color:var(--accent-text)] motion-reduce:transition-none"
                title={translations.platform.sidebar.newThread}
              >
                <Plus className="h-3 w-3" />
              </button>
            )}
            <button
              type="button"
              onClick={() => startEditing(item.id, item.name)}
              className="cursor-pointer rounded-lg p-1 text-[color:var(--text-muted)] transition-colors duration-150 hover:bg-[color:var(--surface-overlay)] hover:text-[color:var(--text-strong)] focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:outline-none active:bg-[color:var(--surface-overlay)] active:text-[color:var(--text-strong)] motion-reduce:transition-none"
              title={translations.platform.sidebar.rename}
            >
              <Pencil className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => onRequestDelete?.(item.id, item.name, item.type)}
              className="cursor-pointer rounded-lg p-1 text-[color:var(--text-muted)] transition-colors duration-150 hover:bg-[color:var(--status-error-bg)] hover:text-[color:var(--status-error)] focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:outline-none active:bg-[color:var(--status-error-soft)] active:text-[color:var(--status-error)] motion-reduce:transition-none"
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

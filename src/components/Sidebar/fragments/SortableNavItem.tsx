'use client';

import { type KeyboardEvent, type MouseEvent } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import {
  Check,
  ChevronRight,
  FileText,
  Folder,
  FolderOpen,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useTranslations } from '@hooks';
import { SmartTooltip } from '@/components';
import type { IFlattenedItem, TDropZone, TNavItemType } from '@interfaces';
import { INDENTATION_WIDTH } from '../consts';
import { getDragTransformStyle } from '../utils';

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
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: editingId === item.id });

  const isActive = item.id === activeItemId;
  const isEditing = editingId === item.id;
  const isFolder = item.type === 'folder';
  const isEmpty = isFolder && item.childCount === 0;

  const isHiddenDuringBulkDrag =
    isBulkDragActive && isSelected && !isActivelyDragged;

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

  const renderName = () => {
    if (isEditing) {
      return (
        <input
          value={editValue}
          onChange={(event) => setEditValue(event.target.value)}
          onBlur={commitRename}
          onKeyDown={handleKeyDown}
          onClick={(event) => event.stopPropagation()}
          ref={inputRef}
          className="min-w-0 flex-1 truncate border-0 bg-transparent p-0 underline decoration-emerald-500 decoration-2 underline-offset-[3px] caret-emerald-500 outline-none [font:inherit] selection:bg-emerald-400/40"
        />
      );
    }
    return (
      <SmartTooltip content={item.name} className="truncate" onlyIfTruncated>
        {item.name}
      </SmartTooltip>
    );
  };

  const showLine = dropIndicator === 'before' || dropIndicator === 'after';
  const showFolderHighlight = dropIndicator === 'inside';

  return (
    <div
      ref={setNodeRef}
      style={{
        ...getDragTransformStyle(transform, transition, isDragActive),
        paddingLeft: item.depth * INDENTATION_WIDTH,
      }}
      data-item-id={item.id}
      className={clsx(
        'group/item relative',
        isHiddenDuringBulkDrag && 'h-0 overflow-hidden opacity-0'
      )}
    >
      {showLine && (
        <div
          style={{ left: (dropDepth ?? item.depth) * INDENTATION_WIDTH + 6 }}
          className={clsx(
            'pointer-events-none absolute right-1 z-20 h-0.5 rounded-full bg-emerald-500',
            dropIndicator === 'before' ? '-top-[1px]' : '-bottom-[1px]'
          )}
        >
          <div className="absolute top-1/2 left-0 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.18)]" />
        </div>
      )}

      {isActive && (
        <span className="pointer-events-none absolute top-1/2 left-0 z-10 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-emerald-500 to-cyan-500" />
      )}

      <div
        className={clsx(
          'relative flex min-h-7 min-w-0 items-stretch',
          isDragging && 'pointer-events-none opacity-40'
        )}
      >
        <button
          onClick={handleClick}
          onDoubleClick={(event) => event.preventDefault()}
          className={clsx(
            'flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1.5 py-1 text-sm leading-5 transition-colors duration-150',
            isFolder && isEmpty ? 'cursor-default' : 'cursor-pointer',
            isActive
              ? 'bg-emerald-500/10 font-medium text-emerald-700'
              : 'text-black/65 group-hover/item:bg-black/[0.04] group-hover/item:text-black/90',
            isSelected && !isActive && '!bg-emerald-500/[0.07] !text-black/85',
            isSelected && 'ring-1 ring-emerald-500/45 ring-inset',
            showFolderHighlight &&
              'bg-emerald-500/10 !text-emerald-700 ring-1 ring-emerald-500/30 ring-inset'
          )}
        >
          <span className="relative h-4 w-4 shrink-0">
            {isFolder ? (
              isEmpty || item.collapsed ? (
                <Folder
                  className={clsx(
                    'absolute inset-0 h-4 w-4 transition-opacity duration-150',
                    isActive
                      ? 'text-emerald-500'
                      : showFolderHighlight
                        ? 'text-emerald-500'
                        : 'text-black/30',
                    !isEditing && 'group-hover/item:opacity-0'
                  )}
                />
              ) : (
                <FolderOpen
                  className={clsx(
                    'absolute inset-0 h-4 w-4 transition-opacity duration-150',
                    isActive
                      ? 'text-emerald-500'
                      : showFolderHighlight
                        ? 'text-emerald-500'
                        : 'text-black/40',
                    !isEditing && 'group-hover/item:opacity-0'
                  )}
                />
              )
            ) : (
              <FileText
                className={clsx(
                  'absolute inset-0 h-4 w-4 transition-opacity duration-150',
                  isActive ? 'text-emerald-500' : 'text-black/30',
                  !isEditing && 'group-hover/item:opacity-0'
                )}
              />
            )}
            {!isEditing && (
              <span
                ref={setActivatorNodeRef}
                {...attributes}
                {...listeners}
                aria-label="Drag to reorder"
                role="button"
                tabIndex={-1}
                data-dnd-grip
                className={clsx(
                  'pointer-events-none absolute inset-0 flex cursor-grab touch-none items-center justify-center opacity-0 transition-opacity duration-150 select-none active:cursor-grabbing',
                  'group-hover/item:pointer-events-auto group-hover/item:opacity-100',
                  isActive
                    ? 'text-emerald-500/80'
                    : 'text-black/40 hover:text-black/70'
                )}
              >
                <GripVertical className="h-3 w-3" strokeWidth={2.5} />
              </span>
            )}
          </span>
          {renderName()}
          {isSelected && !isEditing ? (
            <span
              aria-hidden="true"
              className="ml-auto flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-[0_1px_2px_-1px_rgba(16,185,129,0.6)]"
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
                  isActive
                    ? 'text-emerald-500/70'
                    : showFolderHighlight
                      ? 'text-emerald-600/70'
                      : 'text-black/30'
                )}
              />
            )
          )}
        </button>

        {!isDragging && !isEditing && (
          <div
            className={clsx(
              'pointer-events-none absolute top-1/2 right-1 z-10 flex translate-x-2 -translate-y-1/2 items-center gap-0.5 rounded-lg py-0.5 pr-0.5 pl-5 opacity-0 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.12)] ring-1 backdrop-blur-md transition-[opacity,transform] duration-200 ease-out',
              '[mask-image:linear-gradient(to_right,transparent_0px,black_20px,black_100%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0px,black_20px,black_100%)]',
              'group-hover/item:pointer-events-auto group-hover/item:translate-x-0 group-hover/item:opacity-100',
              isActive || isSelected
                ? 'bg-gradient-to-r from-emerald-50/98 to-cyan-50/98 ring-emerald-500/20'
                : 'bg-white/98 ring-black/[0.06]'
            )}
            onClick={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
          >
            {isFolder && (
              <button
                onClick={() => onCreateThread?.(item.id)}
                className="rounded-md p-1 text-black/40 transition-colors duration-150 hover:bg-black/5 hover:text-emerald-700"
                title={translations.platform.sidebar.newThread}
              >
                <Plus className="h-3 w-3" />
              </button>
            )}
            <button
              onClick={() => startEditing(item.id, item.name)}
              className="rounded-md p-1 text-black/40 transition-colors duration-150 hover:bg-black/5 hover:text-black/80"
              title={translations.platform.sidebar.rename}
            >
              <Pencil className="h-3 w-3" />
            </button>
            <button
              onClick={() => onRequestDelete?.(item.id, item.name, item.type)}
              className="rounded-md p-1 text-black/40 transition-colors duration-150 hover:bg-red-50 hover:text-red-600"
              title={translations.platform.sidebar.delete}
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

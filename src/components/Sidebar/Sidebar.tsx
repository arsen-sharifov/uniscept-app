'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react';
import {
  Files,
  FolderPlus,
  LayoutGrid,
  Plus,
  SearchX,
  Sparkles,
} from 'lucide-react';
import type {
  TDeleteTarget,
  TNavItem,
  TNavItemType,
  IWorkspaceItem,
} from '@interfaces';
import { useTranslations } from '@hooks';
import { ConfirmDialog, Logo } from '@/components';
import {
  BulkActionsBar,
  EmptyState,
  MoveDialog,
  NavItems,
  SearchInput,
  WorkspaceSwitcher,
} from './fragments';
import { useInlineEdit, useSelection } from './hooks';
import { filterTree, getSingleDeleteTitleKey } from './utils';

export interface ISidebarProps {
  items?: TNavItem[];
  workspaces?: IWorkspaceItem[];
  activeWorkspaceId?: string;
  activeItemId?: string;
  onItemClick?: (id: string) => void;
  onDeleteItem?: (id: string) => void;
  onCreateThread?: (folderId?: string) => void;
  onRenameItem?: (id: string, name: string) => void;
  onCreateFolder?: () => void;
  editingItemId?: string | null;
  onEditingComplete?: () => void;
  editingWorkspaceId?: string | null;
  onWorkspaceEditingComplete?: () => void;
  onWorkspaceSelect?: (id: string) => void;
  onCreateWorkspace?: () => void;
  onRenameWorkspace?: (id: string, name: string) => void;
  onDeleteWorkspace?: (id: string) => void;
  onMoveWorkspace?: (id: string, position: number) => void;
  onMoveItem?: (
    id: string,
    type: TNavItemType,
    parentId: string | null,
    position: number
  ) => void;
  onBulkDelete?: (ids: Set<string>) => void;
  onBulkMove?: (ids: Set<string>, parentId: string | null) => void;
  onBulkDeleteWorkspaces?: (ids: Set<string>) => void;
  footer?: ReactNode;
}

export const Sidebar = ({
  items = [],
  workspaces = [],
  activeWorkspaceId,
  activeItemId,
  onItemClick,
  onDeleteItem,
  onCreateThread,
  onRenameItem,
  onCreateFolder,
  editingItemId,
  onEditingComplete,
  editingWorkspaceId,
  onWorkspaceEditingComplete,
  onWorkspaceSelect,
  onCreateWorkspace,
  onRenameWorkspace,
  onDeleteWorkspace,
  onMoveWorkspace,
  onMoveItem,
  onBulkDelete,
  onBulkMove,
  onBulkDeleteWorkspaces,
  footer,
}: ISidebarProps) => {
  const t = useTranslations();

  const {
    selectedIds,
    setSelectedIds,
    toggleSelection,
    selectRange,
    clearSelection,
    clearAndSelect,
    selectionCount,
  } = useSelection();

  const {
    selectedIds: workspaceSelectedIds,
    setSelectedIds: setWorkspaceSelectedIds,
    toggleSelection: toggleWorkspaceSelection,
    selectRange: workspaceSelectRange,
    clearSelection: clearWorkspaceSelection,
    clearAndSelect: clearAndSelectWorkspace,
  } = useSelection();

  const allItemIds = useMemo(() => {
    const collect = (list: TNavItem[]): string[] =>
      list.flatMap((item) =>
        item.type === 'folder' ? [item.id, ...collect(item.items)] : [item.id]
      );
    return new Set(collect(items));
  }, [items]);

  useEffect(() => {
    setSelectedIds((prev) => {
      const next = new Set([...prev].filter((id) => allItemIds.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [allItemIds, setSelectedIds]);

  const allWorkspaceIds = useMemo(
    () => new Set(workspaces.map((workspace) => workspace.id)),
    [workspaces]
  );

  useEffect(() => {
    setWorkspaceSelectedIds((prev) => {
      const next = new Set([...prev].filter((id) => allWorkspaceIds.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [allWorkspaceIds, setWorkspaceSelectedIds]);

  const handleWorkspaceClick = useCallback(
    (id: string, event: MouseEvent) => {
      if (event.shiftKey) {
        workspaceSelectRange(id, workspaces);
        return;
      }
      if (event.ctrlKey || event.metaKey) {
        toggleWorkspaceSelection(id);
        return;
      }
      clearAndSelectWorkspace(id);
      onWorkspaceSelect?.(id);
    },
    [
      workspaces,
      workspaceSelectRange,
      toggleWorkspaceSelection,
      clearAndSelectWorkspace,
      onWorkspaceSelect,
    ]
  );

  const {
    editingId: workspaceEditingId,
    editValue: workspaceEditValue,
    setEditValue: setWorkspaceEditValue,
    inputRef: workspaceInputRef,
    startEditing: startWorkspaceEditing,
    commitRename: commitWorkspaceRename,
    handleKeyDown: handleWorkspaceKeyDown,
  } = useInlineEdit({
    items: workspaces,
    autoEditId: editingWorkspaceId,
    onAutoEditHandled: onWorkspaceEditingComplete,
    onRename: onRenameWorkspace,
  });

  const [deleteTarget, setDeleteTarget] = useState<TDeleteTarget>(null);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [query, setQuery] = useState('');

  const filteredItems = useMemo(
    () => filterTree(items, query.trim()),
    [items, query]
  );

  const handleWorkspaceBulkDelete = useCallback(() => {
    setDeleteTarget({
      mode: 'bulk',
      scope: 'workspace',
      ids: workspaceSelectedIds,
      count: workspaceSelectedIds.size,
    });
  }, [workspaceSelectedIds]);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.mode === 'bulk') {
      if (deleteTarget.scope === 'workspace') {
        onBulkDeleteWorkspaces?.(deleteTarget.ids);
        clearWorkspaceSelection();
      } else {
        onBulkDelete?.(deleteTarget.ids);
        clearSelection();
      }
    } else if (deleteTarget.type === 'workspace') {
      onDeleteWorkspace?.(deleteTarget.id);
    } else {
      onDeleteItem?.(deleteTarget.id);
    }
    setDeleteTarget(null);
  };

  const deleteTitle = !deleteTarget
    ? ''
    : deleteTarget.mode === 'bulk'
      ? t.platform.sidebar.bulkDeleteTitle
      : t.platform.sidebar[getSingleDeleteTitleKey(deleteTarget.type)];

  const deleteMessage = !deleteTarget
    ? ''
    : deleteTarget.mode === 'bulk'
      ? t.platform.sidebar.bulkDeleteConfirm
      : `${t.platform.sidebar.deleteConfirmPrefix} "${deleteTarget.name}"${t.platform.sidebar.deleteConfirmSuffix}`;

  const handleBulkDelete = useCallback(() => {
    setDeleteTarget({
      mode: 'bulk',
      scope: 'navItem',
      ids: selectedIds,
      count: selectionCount,
    });
  }, [selectedIds, selectionCount]);

  const handleRequestDelete = useCallback(
    (id: string, name: string, type: TNavItemType) => {
      setDeleteTarget({ mode: 'single', id, name, type });
    },
    []
  );

  const handleBulkMoveConfirm = useCallback(
    (targetParentId: string | null) => {
      onBulkMove?.(selectedIds, targetParentId);
      clearSelection();
      setShowMoveDialog(false);
    },
    [selectedIds, onBulkMove, clearSelection]
  );

  useEffect(() => {
    if (selectionCount === 0) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') clearSelection();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectionCount, clearSelection]);

  const isSearching = query.trim().length > 0;
  const showSearchEmpty = isSearching && filteredItems.length === 0;
  const showStructureEmpty =
    !isSearching && activeWorkspaceId && items.length === 0;

  return (
    <>
      <aside className="fixed top-4 left-4 z-40 flex h-[calc(100vh-2rem)] w-64 flex-col rounded-2xl border border-black/[0.06] bg-white/85 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12)] backdrop-blur-2xl select-none">
        <div className="px-3 py-3">
          <Logo className="text-base" />
        </div>

        <div className="px-2">
          <WorkspaceSwitcher
            workspaces={workspaces}
            activeWorkspaceId={activeWorkspaceId}
            selectedIds={workspaceSelectedIds}
            editingId={workspaceEditingId}
            editValue={workspaceEditValue}
            setEditValue={setWorkspaceEditValue}
            inputRef={workspaceInputRef}
            commitRename={commitWorkspaceRename}
            handleKeyDown={handleWorkspaceKeyDown}
            onWorkspaceClick={handleWorkspaceClick}
            onCreateWorkspace={onCreateWorkspace}
            onRequestRename={startWorkspaceEditing}
            onRequestDelete={(id, name) =>
              setDeleteTarget({
                mode: 'single',
                id,
                name,
                type: 'workspace',
              })
            }
            onMoveWorkspace={onMoveWorkspace}
            onBulkDelete={handleWorkspaceBulkDelete}
            onClearSelection={clearWorkspaceSelection}
          />
        </div>

        {activeWorkspaceId && items.length > 0 && (
          <div className="px-3 pt-2">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder={t.platform.sidebar.searchPlaceholder}
            />
          </div>
        )}

        {activeWorkspaceId && (
          <div
            data-sidebar-scroll
            className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto scroll-smooth px-2 pt-3 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="mb-1 flex items-center justify-between px-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold tracking-wider text-black/40 uppercase">
                  {t.platform.sidebar.structure}
                </span>
                {items.length > 0 && (
                  <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-md bg-black/[0.06] px-1 text-[9px] font-semibold text-black/45">
                    {items.length}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={onCreateFolder}
                  className="rounded-md p-1 text-black/35 transition-colors hover:bg-black/5 hover:text-black/70"
                  title={t.platform.sidebar.newFolder}
                >
                  <FolderPlus className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onCreateThread?.()}
                  className="rounded-md p-1 text-black/35 transition-colors hover:bg-black/5 hover:text-black/70"
                  title={t.platform.sidebar.newThread}
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {!showStructureEmpty && !showSearchEmpty && (
              <NavItems
                items={filteredItems}
                activeItemId={activeItemId}
                selectedIds={selectedIds}
                onToggleSelection={toggleSelection}
                onSelectRange={selectRange}
                onClearAndSelect={clearAndSelect}
                setSelectedIds={setSelectedIds}
                onItemClick={onItemClick}
                onRequestDelete={handleRequestDelete}
                onCreateThread={onCreateThread}
                onRenameItem={onRenameItem}
                onMoveItem={isSearching ? undefined : onMoveItem}
                onBulkMove={isSearching ? undefined : onBulkMove}
                autoEditId={editingItemId}
                onAutoEditHandled={onEditingComplete}
              />
            )}

            {showSearchEmpty && (
              <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 text-center">
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-black/[0.04]">
                  <SearchX className="h-4 w-4 text-black/35" />
                </div>
                <p className="text-xs text-black/45">
                  {t.platform.sidebar.noSearchResults}
                </p>
                <p className="mt-1 max-w-[180px] truncate text-[11px] text-black/30">
                  &ldquo;{query}&rdquo;
                </p>
              </div>
            )}

            {showStructureEmpty && (
              <div className="flex flex-1 items-center justify-center">
                <EmptyState
                  icon={Sparkles}
                  title={t.platform.sidebar.emptyStructureTitle}
                  hint={t.platform.sidebar.emptyStructureHint}
                  ctaIcon={Plus}
                  ctaLabel={t.platform.sidebar.newThread}
                  onCta={() => onCreateThread?.()}
                />
              </div>
            )}
          </div>
        )}

        {!activeWorkspaceId && (
          <div className="flex flex-1 items-center justify-center px-2">
            <EmptyState
              icon={LayoutGrid}
              title={
                workspaces.length === 0
                  ? t.platform.sidebar.newWorkspaceTitle
                  : t.platform.sidebar.noWorkspaceTitle
              }
              hint={
                workspaces.length === 0
                  ? t.platform.sidebar.newWorkspaceHint
                  : t.platform.sidebar.noWorkspaceHintCta
              }
              ctaIcon={Plus}
              ctaLabel={t.platform.sidebar.newWorkspace}
              onCta={onCreateWorkspace}
            />
          </div>
        )}

        {selectionCount > 0 && (
          <div className="border-t border-black/[0.06] px-2 pt-2 pb-2">
            <BulkActionsBar
              count={selectionCount}
              icon={Files}
              label={t.platform.sidebar.itemsSelected}
              onDelete={handleBulkDelete}
              onMove={() => setShowMoveDialog(true)}
              onClear={clearSelection}
            />
          </div>
        )}

        {footer && (
          <div className="border-t border-black/[0.06] px-2 py-2">{footer}</div>
        )}
      </aside>

      <ConfirmDialog
        open={deleteTarget !== null}
        title={deleteTitle}
        message={deleteMessage}
        confirmLabel={t.platform.sidebar.delete}
        cancelLabel={t.platform.sidebar.cancel}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <MoveDialog
        open={showMoveDialog}
        items={items}
        selectedIds={selectedIds}
        onMove={handleBulkMoveConfirm}
        onCancel={() => setShowMoveDialog(false)}
      />
    </>
  );
};

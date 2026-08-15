'use client';

import { Files, FolderPlus, LayoutGrid, Plus, SearchX, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState, type MouseEvent, type ReactNode } from 'react';

import type { TDeleteTarget, TNavItem, TNavItemType, IWorkspaceItem, IMyInvitation } from '@interfaces';
import { useEscapeKey } from '@hooks';
import { Logo } from '@/components/Branding';
import { ConfirmDialog } from '@/components/Modal';
import { useTranslations } from '@/i18n';
import { usePermissionsStore } from '@/lib/stores';

import {
  BulkActionsBar,
  EmptyState,
  MoveDialog,
  NavItems,
  SearchInput,
  SidebarSkeleton,
  WorkspaceSwitcher,
} from './fragments';
import { useInlineEdit, useSelection } from './hooks';
import { filterTree, getSiblings, getSingleDeleteTitleKey } from './utils';

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
  onOpenWorkspaceSettings?: (id: string) => void;
  invitations?: IMyInvitation[];
  onAcceptInvitation?: (invitation: IMyInvitation) => void;
  onDeclineInvitation?: (invitation: IMyInvitation) => void;
  onMoveItem?: (id: string, type: TNavItemType, parentId: string | null, position: number) => void;
  onBulkDelete?: (ids: Set<string>) => void;
  onBulkMove?: (ids: Set<string>, parentId: string | null, position: number) => void;
  onBulkDeleteWorkspaces?: (ids: Set<string>) => void;
  loading?: boolean;
  footer?: ReactNode;
}

export const Sidebar = ({
  items = [],
  workspaces = [],
  loading = false,
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
  onOpenWorkspaceSettings,
  invitations = [],
  onAcceptInvitation,
  onDeclineInvitation,
  onMoveItem,
  onBulkDelete,
  onBulkMove,
  onBulkDeleteWorkspaces,
  footer,
}: ISidebarProps) => {
  const t = useTranslations();
  const canManageStructure = usePermissionsStore((s) => s.canManageStructure);

  const {
    selectedIds,
    setSelectedIds,
    toggleSelection,
    selectRange,
    clearSelection,
    clearAndSetAnchor,
    selectionCount,
  } = useSelection();

  const {
    selectedIds: workspaceSelectedIds,
    setSelectedIds: setWorkspaceSelectedIds,
    toggleSelection: toggleWorkspaceSelection,
    selectRange: workspaceSelectRange,
    clearSelection: clearWorkspaceSelection,
    clearAndSetAnchor: clearAndSetAnchorWorkspace,
  } = useSelection();

  const allItemIds = useMemo(() => {
    const collect = (list: TNavItem[]): string[] =>
      list.flatMap((item) => (item.type === 'folder' ? [item.id, ...collect(item.items)] : [item.id]));

    return new Set(collect(items));
  }, [items]);

  useEffect(() => {
    setSelectedIds((prev) => {
      const next = new Set([...prev].filter((id) => allItemIds.has(id)));

      return next.size === prev.size ? prev : next;
    });
  }, [allItemIds, setSelectedIds]);

  const allWorkspaceIds = useMemo(() => new Set(workspaces.map((workspace) => workspace.id)), [workspaces]);

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
      clearAndSetAnchorWorkspace(id);
      onWorkspaceSelect?.(id);
    },
    [workspaces, workspaceSelectRange, toggleWorkspaceSelection, clearAndSetAnchorWorkspace, onWorkspaceSelect],
  );

  const {
    editingId: workspaceEditingId,
    editValue: workspaceEditValue,
    setEditValue: setWorkspaceEditValue,
    inputRef: workspaceInputRef,
    startEditing: startWorkspaceEditing,
    commitRename: commitWorkspaceRename,
    cancelEditing: cancelWorkspaceEditing,
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

  const filteredItems = useMemo(() => filterTree(items, query.trim()), [items, query]);

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

  const getDeleteTitle = () => {
    if (!deleteTarget) return '';
    if (deleteTarget.mode === 'bulk') return t.platform.sidebar.bulkDeleteTitle;

    return t.platform.sidebar[getSingleDeleteTitleKey(deleteTarget.type)];
  };

  const getDeleteMessage = () => {
    if (!deleteTarget) return '';
    if (deleteTarget.mode === 'bulk') return t.platform.sidebar.bulkDeleteConfirm;

    return `${t.platform.sidebar.deleteConfirmPrefix} "${deleteTarget.name}"${t.platform.sidebar.deleteConfirmSuffix}`;
  };

  const deleteTitle = getDeleteTitle();
  const deleteMessage = getDeleteMessage();

  const handleBulkDelete = useCallback(() => {
    setDeleteTarget({
      mode: 'bulk',
      scope: 'navItem',
      ids: selectedIds,
      count: selectionCount,
    });
  }, [selectedIds, selectionCount]);

  const handleRequestDelete = useCallback((id: string, name: string, type: TNavItemType) => {
    setDeleteTarget({ mode: 'single', id, name, type });
  }, []);

  const handleBulkMoveConfirm = useCallback(
    (targetParentId: string | null) => {
      const targetSiblings = getSiblings(items, targetParentId);
      const position = targetSiblings.filter((sibling) => !selectedIds.has(sibling.id)).length;
      onBulkMove?.(selectedIds, targetParentId, position);
      clearSelection();
      setShowMoveDialog(false);
    },
    [items, selectedIds, onBulkMove, clearSelection],
  );

  useEscapeKey(clearSelection, selectionCount > 0);

  const isSearching = query.trim().length > 0;
  const showSearchEmpty = isSearching && filteredItems.length === 0;
  const showStructureEmpty = !isSearching && activeWorkspaceId && items.length === 0;

  return (
    <>
      <aside className="app-glass relative z-40 flex h-full w-64 shrink-0 flex-col rounded-2xl border border-[color:var(--border)] transition-[background-color,border-color] duration-200 ease-out select-none motion-reduce:transition-none">
        <div className="border-b border-[color:var(--border)] px-4 py-3">
          <Logo className="text-base text-[color:var(--text-strong)]" />
        </div>

        {loading && <SidebarSkeleton />}

        <div className="px-2 pt-2" hidden={loading}>
          <WorkspaceSwitcher
            workspaces={workspaces}
            activeWorkspaceId={activeWorkspaceId}
            selectedIds={workspaceSelectedIds}
            editingId={workspaceEditingId}
            editValue={workspaceEditValue}
            setEditValue={setWorkspaceEditValue}
            inputRef={workspaceInputRef}
            commitRename={commitWorkspaceRename}
            cancelEditing={cancelWorkspaceEditing}
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
            onRequestSettings={(id) => onOpenWorkspaceSettings?.(id)}
            onMoveWorkspace={onMoveWorkspace}
            onBulkDelete={handleWorkspaceBulkDelete}
            onClearSelection={clearWorkspaceSelection}
            invitations={invitations}
            onAcceptInvitation={onAcceptInvitation}
            onDeclineInvitation={onDeclineInvitation}
          />
        </div>

        {!loading && activeWorkspaceId && items.length > 0 && (
          <div className="px-2 pt-2">
            <SearchInput value={query} onChange={setQuery} placeholder={t.platform.sidebar.searchPlaceholder} />
          </div>
        )}

        {!loading && activeWorkspaceId && (
          <div
            data-sidebar-scroll
            className="relative flex flex-1 [scrollbar-width:none] flex-col overflow-x-hidden overflow-y-auto scroll-smooth px-2 pt-3 pb-2 [&::-webkit-scrollbar]:hidden"
          >
            <div className="mb-1 flex items-center justify-between px-2">
              <div className="flex items-center gap-1.5 font-mono-ui text-[10px] font-bold tracking-[0.14em] text-[color:var(--text-label)] uppercase">
                <span>{t.platform.sidebar.structure}</span>
                {items.length > 0 && <span className="tabular-nums">{items.length}</span>}
              </div>
              {canManageStructure && (
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={onCreateFolder}
                    className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-[color:var(--text-muted)] transition-colors duration-150 hover:bg-[color:var(--surface-overlay)] hover:text-[color:var(--text-strong)] focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:outline-none active:bg-[color:var(--accent-soft)] active:text-[color:var(--accent-text)] motion-reduce:transition-none"
                    title={t.platform.sidebar.newFolder}
                  >
                    <FolderPlus className="h-4 w-4" strokeWidth={1.9} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onCreateThread?.()}
                    className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-[color:var(--text-muted)] transition-colors duration-150 hover:bg-[color:var(--surface-overlay)] hover:text-[color:var(--text-strong)] focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:outline-none active:bg-[color:var(--accent-soft)] active:text-[color:var(--accent-text)] motion-reduce:transition-none"
                    title={t.platform.sidebar.newThread}
                  >
                    <Plus className="h-4 w-4" strokeWidth={1.9} />
                  </button>
                </div>
              )}
            </div>

            {!showStructureEmpty && !showSearchEmpty && (
              <NavItems
                items={filteredItems}
                activeItemId={activeItemId}
                selectedIds={selectedIds}
                onToggleSelection={toggleSelection}
                onSelectRange={selectRange}
                onClearAndSetAnchor={clearAndSetAnchor}
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
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-overlay)]">
                  <SearchX className="h-4 w-4 text-[color:var(--text-subtle)]" />
                </div>
                <p className="font-grotesk text-xs font-medium text-[color:var(--text-muted)]">
                  {t.platform.sidebar.noSearchResults}
                </p>
                <p className="mt-1 max-w-[180px] truncate font-mono-ui text-[10px] text-[color:var(--text-label)]">
                  &ldquo;{query}&rdquo;
                </p>
              </div>
            )}

            {showStructureEmpty && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-2">
                <div className="pointer-events-auto">
                  <EmptyState
                    icon={Sparkles}
                    title={t.platform.sidebar.emptyStructureTitle}
                    hint={t.platform.sidebar.emptyStructureHint}
                    ctaIcon={Plus}
                    ctaLabel={t.platform.sidebar.newThread}
                    onCta={canManageStructure ? () => onCreateThread?.() : undefined}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {!loading && !activeWorkspaceId && (
          <div className="flex flex-1 items-center justify-center px-2">
            <EmptyState
              icon={LayoutGrid}
              title={
                workspaces.length === 0 ? t.platform.sidebar.newWorkspaceTitle : t.platform.sidebar.noWorkspaceTitle
              }
              hint={
                workspaces.length === 0 ? t.platform.sidebar.newWorkspaceHint : t.platform.sidebar.noWorkspaceHintCta
              }
              ctaIcon={Plus}
              ctaLabel={t.platform.sidebar.newWorkspace}
              onCta={onCreateWorkspace}
            />
          </div>
        )}

        {selectionCount > 0 && canManageStructure && (
          <div className="border-t border-[color:var(--border)] px-2 pt-2 pb-2">
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

        {footer && <footer className="border-t border-[color:var(--border)] px-2 py-2">{footer}</footer>}
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

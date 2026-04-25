'use client';

import {
  useCallback,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import {
  DndContext,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { IWorkspaceItem, TWorkspaceDropZone } from '@interfaces';
import { POINTER_ACTIVATION_DISTANCE } from '../consts';
import { SortableWorkspaceItem } from './SortableWorkspaceItem';

interface IWorkspaceItemsProps {
  workspaces: IWorkspaceItem[];
  activeWorkspaceId?: string;
  selectedIds: Set<string>;
  editingId: string | null;
  editValue: string;
  setEditValue: (value: string) => void;
  inputRef: (element: HTMLInputElement | null) => void;
  commitRename: () => void;
  handleKeyDown: (event: KeyboardEvent) => void;
  onClick: (id: string, event: MouseEvent) => void;
  onRequestRename: (id: string, name: string) => void;
  onRequestDelete: (id: string, name: string) => void;
  onMove: (id: string, position: number) => void;
}

export const WorkspaceItems = ({
  workspaces,
  activeWorkspaceId,
  selectedIds,
  editingId,
  editValue,
  setEditValue,
  inputRef,
  commitRename,
  handleKeyDown,
  onClick,
  onRequestRename,
  onRequestDelete,
  onMove,
}: IWorkspaceItemsProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: POINTER_ACTIVATION_DISTANCE },
    })
  );

  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [zone, setZone] = useState<TWorkspaceDropZone>('before');

  const computeFinalIndex = useCallback(
    (
      activeWorkspaceIdToMove: string,
      overWorkspaceId: string,
      dropZone: TWorkspaceDropZone
    ): number => {
      const without = workspaces.filter(
        (workspace) => workspace.id !== activeWorkspaceIdToMove
      );
      const overIdx = without.findIndex(
        (workspace) => workspace.id === overWorkspaceId
      );
      if (overIdx === -1) return -1;
      return dropZone === 'before' ? overIdx : overIdx + 1;
    },
    [workspaces]
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setOverId(null);
  }, []);

  const handleDragMove = useCallback((event: DragMoveEvent) => {
    const { over, activatorEvent, delta } = event;
    if (!over) {
      setOverId(null);
      return;
    }
    setOverId(over.id as string);
    if (!('clientY' in activatorEvent)) return;
    const pointerY = (activatorEvent as PointerEvent).clientY + delta.y;
    const midY = over.rect.top + over.rect.height / 2;
    setZone(pointerY < midY ? 'before' : 'after');
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      setOverId(null);
      if (!over || active.id === over.id) return;
      const finalIdx = computeFinalIndex(
        active.id as string,
        over.id as string,
        zone
      );
      if (finalIdx === -1) return;
      const oldIdx = workspaces.findIndex(
        (workspace) => workspace.id === active.id
      );
      if (finalIdx === oldIdx) return;
      onMove(active.id as string, finalIdx);
    },
    [workspaces, zone, computeFinalIndex, onMove]
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setOverId(null);
  }, []);

  const getDropIndicator = (id: string): TWorkspaceDropZone | null => {
    if (!activeId || !overId || id !== overId || id === activeId) return null;
    const finalIdx = computeFinalIndex(activeId, overId, zone);
    const oldIdx = workspaces.findIndex(
      (workspace) => workspace.id === activeId
    );
    if (finalIdx === -1 || finalIdx === oldIdx) return null;
    return zone;
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext
        items={workspaces.map((workspace) => workspace.id)}
        strategy={verticalListSortingStrategy}
      >
        {workspaces.map((workspace) => (
          <SortableWorkspaceItem
            key={workspace.id}
            workspace={workspace}
            isActive={workspace.id === activeWorkspaceId}
            isSelected={selectedIds.has(workspace.id)}
            isEditing={editingId === workspace.id}
            editValue={editValue}
            setEditValue={setEditValue}
            inputRef={inputRef}
            commitRename={commitRename}
            handleKeyDown={handleKeyDown}
            onClick={onClick}
            onRequestRename={onRequestRename}
            onRequestDelete={onRequestDelete}
            isDragActive={activeId !== null}
            dropIndicator={getDropIndicator(workspace.id)}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
};

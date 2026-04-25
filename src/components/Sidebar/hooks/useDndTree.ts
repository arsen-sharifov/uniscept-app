'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  type DragStartEvent,
  type DragMoveEvent,
  type DragEndEvent,
  type CollisionDetection,
  pointerWithin,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type {
  IProjection,
  TDropZone,
  TNavItem,
  TNavItemType,
} from '@interfaces';
import { flattenTree, getProjection, removeChildrenOf } from '../dnd';
import {
  AUTO_EXPAND_DELAY_MS,
  DROP_ZONE_HYSTERESIS_PX,
  FOLDER_INSIDE_THRESHOLD,
  LEAF_SPLIT_THRESHOLD,
  POINTER_ACTIVATION_DISTANCE,
} from '../consts';

interface IUseDndTreeOptions {
  items: TNavItem[];
  onMoveItem?: (
    id: string,
    type: TNavItemType,
    parentId: string | null,
    position: number
  ) => void;
  onBulkMove?: (ids: Set<string>, parentId: string | null) => void;
  editingId?: string | null;
  selectedIds?: Set<string>;
}

const findAnchorAtParent = <T extends { id: string; parentId: string | null }>(
  items: T[],
  id: string,
  targetParentId: string | null
): string | null => {
  const node = items.find((item) => item.id === id);
  if (!node) return null;
  if (node.parentId === targetParentId) return node.id;
  return node.parentId
    ? findAnchorAtParent(items, node.parentId, targetParentId)
    : null;
};

const resolveFolderZone = (
  ratio: number,
  prev: TDropZone,
  sameTarget: boolean,
  buffer: number
): TDropZone => {
  if (!sameTarget) return ratio < FOLDER_INSIDE_THRESHOLD ? 'before' : 'inside';
  if (prev === 'before')
    return ratio > FOLDER_INSIDE_THRESHOLD + buffer ? 'inside' : 'before';
  if (prev === 'inside')
    return ratio < FOLDER_INSIDE_THRESHOLD - buffer ? 'before' : 'inside';
  return ratio < FOLDER_INSIDE_THRESHOLD ? 'before' : 'inside';
};

const resolveLeafZone = (
  ratio: number,
  prev: TDropZone,
  sameTarget: boolean,
  buffer: number
): TDropZone => {
  if (!sameTarget) return ratio < LEAF_SPLIT_THRESHOLD ? 'before' : 'after';
  if (prev === 'before')
    return ratio > LEAF_SPLIT_THRESHOLD + buffer ? 'after' : 'before';
  return ratio < LEAF_SPLIT_THRESHOLD - buffer ? 'before' : 'after';
};

export const useDndTree = ({
  items,
  onMoveItem,
  onBulkMove,
  editingId,
  selectedIds,
}: IUseDndTreeOptions) => {
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [dropZone, setDropZone] = useState<TDropZone>('after');
  const [isPastLast, setIsPastLast] = useState(false);

  const expandTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const expandTargetRef = useRef<string | null>(null);
  const prevCollapsedRef = useRef<Set<string> | null>(null);
  const isBulkDragRef = useRef(false);
  const zoneRef = useRef<TDropZone>('after');
  const prevMoveOverIdRef = useRef<string | null>(null);
  const stickyOverIdRef = useRef<string | number | null>(null);

  const collisionDetection = useCallback<CollisionDetection>((args) => {
    const pw = pointerWithin(args);
    if (pw.length > 0) {
      stickyOverIdRef.current = pw[0]!.id;
      return pw;
    }
    if (
      stickyOverIdRef.current !== null &&
      args.droppableRects.get(stickyOverIdRef.current)
    ) {
      return [{ id: stickyOverIdRef.current }];
    }
    return closestCenter(args);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: POINTER_ACTIVATION_DISTANCE },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const flattenedItems = useMemo(
    () => flattenTree(items, collapsedIds),
    [items, collapsedIds]
  );

  const sortableItems = useMemo(() => {
    if (!activeId) return flattenedItems;
    const excludeIds =
      selectedIds && selectedIds.size > 1 && selectedIds.has(activeId)
        ? new Set([activeId, ...selectedIds])
        : new Set([activeId]);
    return removeChildrenOf(flattenedItems, excludeIds);
  }, [flattenedItems, activeId, selectedIds]);

  const sortedIds = useMemo(
    () => sortableItems.map((item) => item.id),
    [sortableItems]
  );

  const projected: IProjection | null = useMemo(() => {
    if (!activeId || !overId) return null;
    const base = getProjection(sortableItems, activeId, overId, dropZone);
    if (!base) return null;
    const result: IProjection = isPastLast
      ? { depth: 0, parentId: null, zone: 'after' }
      : base;

    const activeItem = sortableItems.find((item) => item.id === activeId);
    if (!activeItem || activeItem.parentId !== result.parentId) return result;

    const siblings = sortableItems.filter(
      (item) => item.parentId === result.parentId
    );
    const activeIdx = siblings.findIndex((item) => item.id === activeId);
    if (activeIdx === -1) return result;

    const targetIdx = (() => {
      if (result.zone === 'inside') return 0;
      const anchorId = findAnchorAtParent(
        sortableItems,
        overId,
        result.parentId
      );
      const siblingsSansActive = siblings.filter(
        (item) => item.id !== activeId
      );
      const anchorIdx = anchorId
        ? siblingsSansActive.findIndex((item) => item.id === anchorId)
        : -1;
      return anchorIdx === -1
        ? siblingsSansActive.length
        : anchorIdx + (result.zone === 'after' ? 1 : 0);
    })();

    if (targetIdx === activeIdx) return null;
    return result;
  }, [sortableItems, activeId, overId, dropZone, isPastLast]);

  const toggleCollapse = useCallback((id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const expandForDrop = useCallback((id: string) => {
    setCollapsedIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const clearExpandTimer = useCallback(() => {
    if (expandTimerRef.current) {
      clearTimeout(expandTimerRef.current);
      expandTimerRef.current = null;
    }
  }, []);

  const resetDragState = useCallback(() => {
    setActiveId(null);
    setOverId(null);
    setDropZone('after');
    setIsPastLast(false);
    zoneRef.current = 'after';
    prevMoveOverIdRef.current = null;
    expandTargetRef.current = null;
    prevCollapsedRef.current = null;
    isBulkDragRef.current = false;
  }, []);

  const handleDragStart = useCallback(
    ({ active }: DragStartEvent) => {
      if (editingId) return;

      const id = active.id as string;
      const item = flattenedItems.find(
        (flattenedItem) => flattenedItem.id === id
      );
      isBulkDragRef.current = !!(
        selectedIds &&
        selectedIds.size > 1 &&
        selectedIds.has(id)
      );

      stickyOverIdRef.current = null;

      setActiveId(id);
      setOverId(id);

      if (item?.type === 'folder' && !collapsedIds.has(id)) {
        prevCollapsedRef.current = new Set(collapsedIds);
        setCollapsedIds((prev) => new Set(prev).add(id));
      }
    },
    [flattenedItems, collapsedIds, editingId, selectedIds]
  );

  const handleDragMove = useCallback(
    ({ activatorEvent, delta, over }: DragMoveEvent) => {
      const curOverId = (over?.id as string) ?? null;
      setOverId((prev) => (prev === curOverId ? prev : curOverId));

      const hasPointer = 'clientY' in activatorEvent;
      const pointerY = hasPointer
        ? (activatorEvent as PointerEvent).clientY + delta.y
        : null;

      const lastItem = sortableItems[sortableItems.length - 1];
      const lastEl = lastItem
        ? document.querySelector(`[data-item-id="${lastItem.id}"]`)
        : null;
      const lastBottom = lastEl?.getBoundingClientRect().bottom;
      const nextPastLast =
        pointerY !== null && lastBottom !== undefined && pointerY > lastBottom;
      setIsPastLast((prev) => (prev === nextPastLast ? prev : nextPastLast));

      if (!curOverId || curOverId === activeId) {
        if (zoneRef.current !== 'after') {
          zoneRef.current = 'after';
          setDropZone('after');
        }
        clearExpandTimer();
        expandTargetRef.current = null;
        return;
      }

      if (pointerY === null) return;

      const el = document.querySelector(`[data-item-id="${curOverId}"]`);
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const ratio = Math.max(
        0,
        Math.min(1, (pointerY - rect.top) / rect.height)
      );

      const overItem = sortableItems.find((item) => item.id === curOverId);
      const isFolder = overItem?.type === 'folder';
      const sameTarget = curOverId === prevMoveOverIdRef.current;
      prevMoveOverIdRef.current = curOverId;

      const buffer = sameTarget ? DROP_ZONE_HYSTERESIS_PX / rect.height : 0;
      const prev = zoneRef.current;

      const zone = isFolder
        ? resolveFolderZone(ratio, prev, sameTarget, buffer)
        : resolveLeafZone(ratio, prev, sameTarget, buffer);

      if (zone !== zoneRef.current) {
        zoneRef.current = zone;
        setDropZone(zone);
      }

      if (
        zone === 'inside' &&
        overItem?.type === 'folder' &&
        collapsedIds.has(curOverId)
      ) {
        if (expandTargetRef.current !== curOverId) {
          clearExpandTimer();
          expandTargetRef.current = curOverId;
          expandTimerRef.current = setTimeout(() => {
            expandForDrop(curOverId);
            expandTargetRef.current = null;
          }, AUTO_EXPAND_DELAY_MS);
        }
      } else if (expandTargetRef.current) {
        clearExpandTimer();
        expandTargetRef.current = null;
      }
    },
    [activeId, sortableItems, collapsedIds, clearExpandTimer, expandForDrop]
  );

  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      clearExpandTimer();

      if (!over || !projected) {
        if (prevCollapsedRef.current) {
          setCollapsedIds(prevCollapsedRef.current);
          prevCollapsedRef.current = null;
        }
        resetDragState();
        return;
      }

      const draggedId = active.id as string;
      const endOverId = over.id as string;

      if (draggedId === endOverId && !isPastLast) {
        if (prevCollapsedRef.current) {
          setCollapsedIds(prevCollapsedRef.current);
          prevCollapsedRef.current = null;
        }
        resetDragState();
        return;
      }

      const activeIndex = sortableItems.findIndex(
        (item) => item.id === draggedId
      );
      if (activeIndex === -1) {
        resetDragState();
        return;
      }

      const activeItem = sortableItems[
        activeIndex
      ] as (typeof sortableItems)[number];

      const getPosition = () => {
        if (projected.zone === 'inside') return 0;
        const siblings = sortableItems.filter(
          (item) =>
            item.id !== draggedId && item.parentId === projected.parentId
        );
        const anchorId = findAnchorAtParent(
          sortableItems,
          endOverId,
          projected.parentId
        );
        const anchor = anchorId
          ? siblings.findIndex((item) => item.id === anchorId)
          : -1;
        if (anchor === -1) return siblings.length;
        return anchor + (projected.zone === 'after' ? 1 : 0);
      };
      const position = getPosition();

      if (isBulkDragRef.current && selectedIds && selectedIds.size > 1) {
        onBulkMove?.(selectedIds, projected.parentId);
      } else {
        onMoveItem?.(draggedId, activeItem.type, projected.parentId, position);
      }

      if (prevCollapsedRef.current) {
        setCollapsedIds(prevCollapsedRef.current);
        prevCollapsedRef.current = null;
      }

      resetDragState();
    },
    [
      sortableItems,
      projected,
      isPastLast,
      clearExpandTimer,
      resetDragState,
      onMoveItem,
      onBulkMove,
      selectedIds,
    ]
  );

  const handleDragCancel = useCallback(() => {
    clearExpandTimer();
    if (prevCollapsedRef.current) {
      setCollapsedIds(prevCollapsedRef.current);
      prevCollapsedRef.current = null;
    }
    resetDragState();
  }, [clearExpandTimer, resetDragState]);

  useEffect(() => {
    return () => {
      if (expandTimerRef.current) clearTimeout(expandTimerRef.current);
    };
  }, []);

  return {
    flattenedItems: sortableItems,
    sortedIds,
    activeId,
    overId,
    projected,
    isPastLast,
    sensors,
    collisionDetection,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    handleDragCancel,
    toggleCollapse,
    expandForDrop,
  };
};

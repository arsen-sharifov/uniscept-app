import type { DragEndEvent, DragMoveEvent, DragStartEvent } from '@dnd-kit/core';

export const dragStartEvent = (id: string): DragStartEvent => ({ active: { id } }) as never;

export const dragMoveEvent = (overId: string | null, clientY: number | null = null): DragMoveEvent =>
  ({
    activatorEvent: clientY === null ? {} : { clientY },
    delta: { x: 0, y: 0 },
    over: overId === null ? null : { id: overId },
  }) as never;

export const dragEndEvent = (activeId: string, overId: string | null): DragEndEvent =>
  ({ active: { id: activeId }, over: overId === null ? null : { id: overId } }) as never;

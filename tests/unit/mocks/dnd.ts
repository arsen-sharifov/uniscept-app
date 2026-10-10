import type { DndContextProps, DragEndEvent, DragMoveEvent, DragStartEvent } from '@dnd-kit/core';

export const dragStartEvent = (id: string): DragStartEvent => ({ active: { id } }) as never;

export const dragMoveEvent = (
  overId: string | null,
  clientY: number | null = null,
  { activeId = 'dragged', overRect = { top: 0, height: 0 } } = {},
): DragMoveEvent =>
  ({
    active: { id: activeId },
    activatorEvent: clientY === null ? {} : { clientY },
    delta: { x: 0, y: 0 },
    over: overId === null ? null : { id: overId, rect: overRect },
  }) as never;

export const dragEndEvent = (activeId: string, overId: string | null): DragEndEvent =>
  ({ active: { id: activeId }, over: overId === null ? null : { id: overId } }) as never;

export const dndContext: { props: DndContextProps } = { props: {} };

export const DndContext = (props: DndContextProps) => {
  dndContext.props = props;

  return props.children;
};

export const ROW_HEIGHT = 32;

export const clientRect = (top: number, height: number) => ({
  top,
  bottom: top + height,
  left: 0,
  right: 200,
  width: 200,
  height,
});

export const DND_ROW_RECTS = { a: clientRect(0, 32), b: clientRect(40, 32) };

export const WORKSPACE_ROW_RECTS = {
  'ws-1': { top: 0, height: 32 },
  'ws-3': { top: 64, height: 32 },
  'ws-9': { top: 96, height: 32 },
};

export const GAP_POINTER = { x: 100, y: 36 };

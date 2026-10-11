import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { dndContext, dragEndEvent, dragMoveEvent, dragStartEvent, WORKSPACE_ROW_RECTS } from '@mocks/dnd';
import { inlineEdit, workspaceItem } from '@mocks/sidebar';
import { WorkspaceItems } from '@/components/Sidebar/fragments/tree';

vi.mock('@dnd-kit/core', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  DndContext: (await import('@mocks/dnd')).DndContext,
}));
vi.mock('@/i18n', () => import('@mocks/i18n'));

const onClick = vi.fn();
const onRequestDelete = vi.fn();
const onRequestSettings = vi.fn();
const onMove = vi.fn();

const dropLines = () => document.querySelectorAll('[data-workspace-id] > .right-1');

afterEach(() => {
  dndContext.props = {};
});

describe('WorkspaceItems', () => {
  describe('GIVEN three workspaces in the switcher list', () => {
    beforeEach(() => {
      render(
        <WorkspaceItems
          workspaces={[workspaceItem('ws-1'), workspaceItem('ws-2'), workspaceItem('ws-3')]}
          activeWorkspaceId="ws-1"
          selectedIds={new Set()}
          edit={inlineEdit()}
          onClick={onClick}
          onRequestDelete={onRequestDelete}
          onRequestSettings={onRequestSettings}
          onMove={onMove}
        />,
      );
    });

    describe('WHEN it renders', () => {
      test('THEN every workspace gets a row', () => {
        expect(screen.getByText('Workspace ws-1')).toBeInTheDocument();
        expect(screen.getByText('Workspace ws-3')).toBeInTheDocument();
      });
    });

    describe('WHEN the first workspace is dropped on the lower half of the last one', () => {
      beforeEach(() => {
        act(() => dndContext.props.onDragStart!(dragStartEvent('ws-1')));
        act(() =>
          dndContext.props.onDragMove!(
            dragMoveEvent('ws-3', 90, { activeId: 'ws-1', overRect: WORKSPACE_ROW_RECTS['ws-3'] }),
          ),
        );
        act(() => dndContext.props.onDragEnd!(dragEndEvent('ws-1', 'ws-3')));
      });

      test('THEN it moves after the last one', () => {
        expect(onMove).toHaveBeenCalledExactlyOnceWith('ws-1', 2);
      });
    });

    describe('WHEN the first workspace is dropped on the upper half of the last one', () => {
      beforeEach(() => {
        act(() => dndContext.props.onDragStart!(dragStartEvent('ws-1')));
        act(() =>
          dndContext.props.onDragMove!(
            dragMoveEvent('ws-3', 70, { activeId: 'ws-1', overRect: WORKSPACE_ROW_RECTS['ws-3'] }),
          ),
        );
        act(() => dndContext.props.onDragEnd!(dragEndEvent('ws-1', 'ws-3')));
      });

      test('THEN it moves right before the last one', () => {
        expect(onMove).toHaveBeenCalledExactlyOnceWith('ws-1', 1);
      });
    });

    describe('WHEN the last workspace is moved onto the first one with the keyboard', () => {
      beforeEach(() => {
        act(() => dndContext.props.onDragStart!(dragStartEvent('ws-3')));
        act(() => dndContext.props.onDragMove!(dragMoveEvent('ws-1', null, { activeId: 'ws-3' })));
        act(() => dndContext.props.onDragEnd!(dragEndEvent('ws-3', 'ws-1')));
      });

      test('THEN it moves to the top', () => {
        expect(onMove).toHaveBeenCalledExactlyOnceWith('ws-3', 0);
      });
    });

    describe('WHEN the second workspace is dropped right below the first one, where it already sits', () => {
      beforeEach(() => {
        act(() => dndContext.props.onDragStart!(dragStartEvent('ws-2')));
        act(() =>
          dndContext.props.onDragMove!(
            dragMoveEvent('ws-1', 30, { activeId: 'ws-2', overRect: WORKSPACE_ROW_RECTS['ws-1'] }),
          ),
        );
        act(() => dndContext.props.onDragEnd!(dragEndEvent('ws-2', 'ws-1')));
      });

      test('THEN nothing moves', () => {
        expect(onMove).not.toHaveBeenCalled();
      });
    });

    describe('WHEN a drag leaves every row and ends outside the list', () => {
      beforeEach(() => {
        act(() => dndContext.props.onDragStart!(dragStartEvent('ws-1')));
        act(() => dndContext.props.onDragMove!(dragMoveEvent(null, 200, { activeId: 'ws-1' })));
        act(() => dndContext.props.onDragEnd!(dragEndEvent('ws-1', null)));
      });

      test('THEN nothing moves', () => {
        expect(onMove).not.toHaveBeenCalled();
      });
    });

    describe('WHEN a workspace is dropped onto itself', () => {
      beforeEach(() => {
        act(() => dndContext.props.onDragStart!(dragStartEvent('ws-2')));
        act(() => dndContext.props.onDragEnd!(dragEndEvent('ws-2', 'ws-2')));
      });

      test('THEN nothing moves', () => {
        expect(onMove).not.toHaveBeenCalled();
      });
    });

    describe('WHEN the first workspace is dragged over the lower half of the last one', () => {
      beforeEach(() => {
        act(() => dndContext.props.onDragStart!(dragStartEvent('ws-1')));
        act(() =>
          dndContext.props.onDragMove!(
            dragMoveEvent('ws-3', 90, { activeId: 'ws-1', overRect: WORKSPACE_ROW_RECTS['ws-3'] }),
          ),
        );
      });

      test('THEN a drop line marks the slot below the last one', () => {
        expect(dropLines()).toHaveLength(1);
        expect(document.querySelector('[data-workspace-id="ws-3"] > .right-1')).toHaveClass('-bottom-[1px]');
      });
    });

    describe('WHEN a drag over the last workspace is cancelled', () => {
      beforeEach(() => {
        act(() => dndContext.props.onDragStart!(dragStartEvent('ws-1')));
        act(() =>
          dndContext.props.onDragMove!(
            dragMoveEvent('ws-3', 90, { activeId: 'ws-1', overRect: WORKSPACE_ROW_RECTS['ws-3'] }),
          ),
        );
        act(() => dndContext.props.onDragCancel!({} as never));
      });

      test('THEN the drop line clears and nothing moves', () => {
        expect(dropLines()).toHaveLength(0);
        expect(onMove).not.toHaveBeenCalled();
      });
    });

    describe('WHEN the first workspace is dropped on the upper half of a row missing from the list', () => {
      beforeEach(() => {
        act(() => dndContext.props.onDragStart!(dragStartEvent('ws-1')));
        act(() =>
          dndContext.props.onDragMove!(
            dragMoveEvent('ws-9', 100, { activeId: 'ws-1', overRect: WORKSPACE_ROW_RECTS['ws-9'] }),
          ),
        );
        act(() => dndContext.props.onDragEnd!(dragEndEvent('ws-1', 'ws-9')));
      });

      test('THEN nothing moves', () => {
        expect(onMove).not.toHaveBeenCalled();
      });
    });
  });
});

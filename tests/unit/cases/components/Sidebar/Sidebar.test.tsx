import { act, fireEvent, render, screen, within, type RenderResult } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { IWorkspaceItem } from '@interfaces';

import { domRect, stubAnimationFrame } from '@mocks/browser';
import { TRANSLATIONS } from '@mocks/i18n';
import { folderItem, threadItem, workspaceItem } from '@mocks/sidebar';
import { Sidebar } from '@/components/Sidebar';
import { usePermissionsStore } from '@/lib/stores';

vi.mock('@/i18n', () => import('@mocks/i18n'));

const onCreateWorkspace = vi.fn();
const onRenameWorkspace = vi.fn();
const onWorkspaceEditingComplete = vi.fn();
const onItemClick = vi.fn();

const BASE_WORKSPACES = [workspaceItem('ws-1')];

const sidebarElement = (workspaces: IWorkspaceItem[], editingWorkspaceId?: string | null) => (
  <Sidebar
    workspaces={workspaces}
    activeWorkspaceId={workspaces.at(-1)?.id}
    editingWorkspaceId={editingWorkspaceId}
    onCreateWorkspace={onCreateWorkspace}
    onRenameWorkspace={onRenameWorkspace}
    onWorkspaceEditingComplete={onWorkspaceEditingComplete}
  />
);

const switcherTrigger = () => screen.getByRole('button', { expanded: false });

const workspacePanel = () => screen.queryByRole('dialog');

const selectionBar = (label: string) => screen.getByText(label).closest('div')!;

const selectedRows = () => screen.queryAllByRole('treeitem', { selected: true });

let view: RenderResult;
let frames: ReturnType<typeof stubAnimationFrame>;

afterEach(() => {
  usePermissionsStore.getState().clearAccess();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('Sidebar', () => {
  describe('GIVEN a sidebar mounted without any editing props', () => {
    beforeEach(() => {
      render(<Sidebar workspaces={BASE_WORKSPACES} activeWorkspaceId="ws-1" />);
    });

    describe('WHEN it renders', () => {
      test('THEN the switcher shows the active workspace without starting a rename', () => {
        expect(switcherTrigger()).toHaveTextContent('Workspace ws-1');
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      });
    });
  });

  describe('GIVEN a closed workspace switcher', () => {
    beforeEach(() => {
      view = render(sidebarElement(BASE_WORKSPACES, null));
    });

    describe('WHEN a workspace created elsewhere arrives in rename mode', () => {
      beforeEach(() => {
        view.rerender(sidebarElement([...BASE_WORKSPACES, workspaceItem('ws-2')], 'ws-2'));
      });

      test('THEN the switcher opens on its focused rename field', () => {
        expect(workspacePanel()).toContainElement(screen.getByDisplayValue('Workspace ws-2'));
        expect(screen.getByDisplayValue('Workspace ws-2')).toHaveFocus();
        expect(onRenameWorkspace).not.toHaveBeenCalled();
      });
    });

    describe('WHEN that rename is confirmed', () => {
      beforeEach(() => {
        view.rerender(sidebarElement([...BASE_WORKSPACES, workspaceItem('ws-2')], 'ws-2'));
        fireEvent.change(screen.getByDisplayValue('Workspace ws-2'), { target: { value: 'Research' } });
        fireEvent.keyDown(screen.getByDisplayValue('Research'), { key: 'Enter' });
        view.rerender(sidebarElement([...BASE_WORKSPACES, workspaceItem('ws-2')], null));
      });

      test('THEN the name is saved and the switcher closes again', () => {
        expect(onRenameWorkspace).toHaveBeenCalledExactlyOnceWith('ws-2', 'Research');
        expect(workspacePanel()).not.toBeInTheDocument();
      });
    });
  });

  describe('GIVEN an open workspace switcher', () => {
    beforeEach(() => {
      view = render(sidebarElement(BASE_WORKSPACES, null));
      fireEvent.click(switcherTrigger());
    });

    describe('WHEN a workspace is created from the panel', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.sidebar.newWorkspace }));
      });

      test('THEN the creation is requested and the panel stays open', () => {
        expect(onCreateWorkspace).toHaveBeenCalledOnce();
        expect(workspacePanel()).toBeInTheDocument();
      });
    });

    describe('WHEN the created workspace arrives in rename mode', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.sidebar.newWorkspace }));
        view.rerender(sidebarElement([...BASE_WORKSPACES, workspaceItem('ws-2')], 'ws-2'));
      });

      test('THEN its rename field is visible in the panel and keeps the focus', () => {
        expect(workspacePanel()).toContainElement(screen.getByDisplayValue('Workspace ws-2'));
        expect(screen.getByDisplayValue('Workspace ws-2')).toHaveFocus();
        expect(onRenameWorkspace).not.toHaveBeenCalled();
      });
    });

    describe('WHEN the created workspace is named', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.sidebar.newWorkspace }));
        view.rerender(sidebarElement([...BASE_WORKSPACES, workspaceItem('ws-2')], 'ws-2'));
        fireEvent.change(screen.getByDisplayValue('Workspace ws-2'), { target: { value: 'Research' } });
        fireEvent.keyDown(screen.getByDisplayValue('Research'), { key: 'Enter' });
      });

      test('THEN the name is saved and the rename is reported done', () => {
        expect(onRenameWorkspace).toHaveBeenCalledExactlyOnceWith('ws-2', 'Research');
        expect(onWorkspaceEditingComplete).toHaveBeenCalledOnce();
      });
    });
  });

  describe('GIVEN an open workspace switcher listing a workspace the member cannot manage', () => {
    beforeEach(() => {
      render(sidebarElement([workspaceItem('ws-1'), workspaceItem('ws-2', false)], null));
      fireEvent.click(switcherTrigger());
    });

    describe('WHEN only that workspace is added to the selection', () => {
      beforeEach(() => {
        fireEvent.click(within(workspacePanel()!).getByText('Workspace ws-2'), { ctrlKey: true });
      });

      test('THEN the selection bar counts one workspace in the singular and offers no delete', () => {
        expect(selectionBar('workspace selected')).toHaveTextContent('1');
        expect(
          within(selectionBar('workspace selected')).queryByTitle(TRANSLATIONS.platform.sidebar.delete),
        ).not.toBeInTheDocument();
      });
    });

    describe('WHEN a manageable workspace joins the selection', () => {
      beforeEach(() => {
        fireEvent.click(within(workspacePanel()!).getByText('Workspace ws-2'), { ctrlKey: true });
        fireEvent.click(within(workspacePanel()!).getByText('Workspace ws-1'), { ctrlKey: true });
      });

      test('THEN the selection bar counts two workspaces in the plural and offers the delete', () => {
        expect(selectionBar('workspaces selected')).toHaveTextContent('2');
        expect(
          within(selectionBar('workspaces selected')).getByTitle(TRANSLATIONS.platform.sidebar.delete),
        ).toBeInTheDocument();
      });
    });
  });

  describe('GIVEN a structure the member may manage', () => {
    beforeEach(() => {
      usePermissionsStore.setState({ canManageStructure: true });
      render(
        <Sidebar items={[threadItem('t1'), threadItem('t2')]} workspaces={BASE_WORKSPACES} activeWorkspaceId="ws-1" />,
      );
    });

    describe('WHEN one thread is ctrl-clicked', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByText('Thread t1'), { ctrlKey: true });
      });

      test('THEN the selection bar counts one item in the singular', () => {
        expect(selectionBar('item selected')).toHaveTextContent('1');
      });
    });

    describe('WHEN both threads are ctrl-clicked', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByText('Thread t1'), { ctrlKey: true });
        fireEvent.click(screen.getByText('Thread t2'), { ctrlKey: true });
      });

      test('THEN the selection bar counts two items in the plural', () => {
        expect(selectionBar('items selected')).toHaveTextContent('2');
      });
    });
  });

  describe('GIVEN a structure the member may not manage', () => {
    beforeEach(() => {
      usePermissionsStore.setState({ canManageStructure: false });
      render(
        <Sidebar
          items={[threadItem('t1'), folderItem('f1', [threadItem('t2')])]}
          workspaces={BASE_WORKSPACES}
          activeWorkspaceId="ws-1"
          onItemClick={onItemClick}
        />,
      );
    });

    describe('WHEN a thread is ctrl-clicked', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByText('Thread t1'), { ctrlKey: true });
      });

      test('THEN the thread is selected and the selection bar counts it', () => {
        expect(selectedRows()).toHaveLength(1);
        expect(selectionBar('item selected')).toHaveTextContent('1');
      });

      test('THEN move and delete stay visible but locked with the permission hint', () => {
        expect(
          within(selectionBar('item selected')).getByRole('button', {
            name: TRANSLATIONS.platform.sidebar.moveToFolder,
          }),
        ).toHaveAttribute('aria-disabled', 'true');
        expect(
          within(selectionBar('item selected')).getByRole('button', { name: TRANSLATIONS.platform.sidebar.delete }),
        ).toHaveAttribute('aria-disabled', 'true');
        expect(
          within(selectionBar('item selected')).getAllByTitle(TRANSLATIONS.platform.sidebar.structureLocked),
        ).toHaveLength(2);
      });
    });

    describe('WHEN the locked delete of a selection is clicked', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByText('Thread t1'), { ctrlKey: true });
        fireEvent.click(
          within(selectionBar('item selected')).getByRole('button', { name: TRANSLATIONS.platform.sidebar.delete }),
        );
      });

      test('THEN no delete confirmation opens', () => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });
    });

    describe('WHEN the pointer drags a selection rectangle over the rows', () => {
      beforeEach(() => {
        frames = stubAnimationFrame();
        document.querySelectorAll('[data-item-id]').forEach((row, index) => {
          vi.spyOn(row, 'getBoundingClientRect').mockReturnValue(
            domRect({ left: 0, right: 200, top: index * 32, bottom: (index + 1) * 32, width: 200, height: 32 }),
          );
        });
        act(() => {
          document
            .querySelector('[data-sidebar-scroll]')!
            .dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0, clientX: 100, clientY: 0 }));
          window.dispatchEvent(new MouseEvent('mousemove', { clientX: 120, clientY: 90 }));
          frames.flush();
        });
      });

      test('THEN the rows under the rectangle are selected', () => {
        expect(selectedRows().length).toBeGreaterThan(0);
      });
    });
  });
});

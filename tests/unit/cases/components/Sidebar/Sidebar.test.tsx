import { act, fireEvent, render, screen, within, type RenderResult } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { IWorkspaceItem } from '@interfaces';

import { domRect, stubAnimationFrame } from '@mocks/browser';
import { TRANSLATIONS, translate } from '@mocks/i18n';
import { folderItem, myInvitation, threadItem, workspaceItem, BASE_WORKSPACES } from '@mocks/sidebar';
import { Sidebar } from '@/components/Sidebar';
import { usePermissionsStore } from '@/lib/stores';

vi.mock('@/i18n', () => import('@mocks/i18n'));

const onCreateWorkspace = vi.fn();
const onRenameWorkspace = vi.fn();
const onDeleteWorkspace = vi.fn();
const onWorkspaceEditingComplete = vi.fn();
const onItemClick = vi.fn();
const onDeleteItem = vi.fn();
const onRenameItem = vi.fn();
const onEditingComplete = vi.fn();
const onCreateThread = vi.fn();
const onCreateFolder = vi.fn();
const onOpenWorkspaceSettings = vi.fn();
const onBulkDelete = vi.fn();
const onBulkDeleteWorkspaces = vi.fn();
const onBulkMove = vi.fn();
const onAcceptInvitation = vi.fn();
const onDeclineInvitation = vi.fn();

const sidebarElement = (workspaces: IWorkspaceItem[], editingWorkspaceId?: string | null) => (
  <Sidebar
    workspaces={workspaces}
    activeWorkspaceId={workspaces.at(-1)?.id}
    editingWorkspaceId={editingWorkspaceId}
    onCreateWorkspace={onCreateWorkspace}
    onRenameWorkspace={onRenameWorkspace}
    onDeleteWorkspace={onDeleteWorkspace}
    onWorkspaceEditingComplete={onWorkspaceEditingComplete}
    onOpenWorkspaceSettings={onOpenWorkspaceSettings}
    onBulkDeleteWorkspaces={onBulkDeleteWorkspaces}
  />
);

const switcherTrigger = () => screen.getByRole('button', { expanded: false });

const workspacePanel = () => screen.queryByRole('dialog');

const selectionBar = (key: 'platform.sidebar.itemsSelected' | 'platform.sidebar.workspacesSelected', count: number) =>
  screen.getByText(translate(key, { count })).closest('div')!;

const selectedRows = () => screen.queryAllByRole('treeitem', { selected: true });

const searchField = () => screen.getByPlaceholderText(TRANSLATIONS.platform.sidebar.searchPlaceholder);

let view: RenderResult;

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

  describe('GIVEN a sidebar that is still loading', () => {
    beforeEach(() => {
      render(<Sidebar items={[threadItem('t1')]} workspaces={BASE_WORKSPACES} activeWorkspaceId="ws-1" loading />);
    });

    describe('WHEN it renders', () => {
      test('THEN neither the search nor the tree shows yet', () => {
        expect(screen.queryByPlaceholderText(TRANSLATIONS.platform.sidebar.searchPlaceholder)).not.toBeInTheDocument();
        expect(screen.queryByText('Thread t1')).not.toBeInTheDocument();
      });
    });
  });

  describe('GIVEN a member without any workspace', () => {
    beforeEach(() => {
      render(<Sidebar onCreateWorkspace={onCreateWorkspace} footer={<span>Account footer</span>} />);
    });

    describe('WHEN it renders', () => {
      test('THEN an invitation to create the first workspace shows above the footer', () => {
        expect(screen.getByText(TRANSLATIONS.platform.sidebar.newWorkspaceTitle)).toBeInTheDocument();
        expect(screen.getByText(TRANSLATIONS.platform.sidebar.newWorkspaceHint)).toBeInTheDocument();
        expect(screen.getByRole('contentinfo')).toHaveTextContent('Account footer');
      });
    });

    describe('WHEN the call to action is clicked', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByText(TRANSLATIONS.platform.sidebar.newWorkspace));
      });

      test('THEN a workspace creation is requested', () => {
        expect(onCreateWorkspace).toHaveBeenCalledOnce();
      });
    });
  });

  describe('GIVEN workspaces without an active one', () => {
    beforeEach(() => {
      render(<Sidebar workspaces={BASE_WORKSPACES} onCreateWorkspace={onCreateWorkspace} />);
    });

    describe('WHEN it renders', () => {
      test('THEN the member is asked to pick a workspace', () => {
        expect(screen.getByText(TRANSLATIONS.platform.sidebar.noWorkspaceTitle)).toBeInTheDocument();
        expect(switcherTrigger()).toHaveTextContent(TRANSLATIONS.platform.sidebar.noWorkspaceSelected);
      });
    });
  });

  describe('GIVEN an empty structure the member may manage', () => {
    beforeEach(() => {
      usePermissionsStore.setState({ canManageStructure: true });
      render(
        <Sidebar
          workspaces={BASE_WORKSPACES}
          activeWorkspaceId="ws-1"
          onCreateThread={onCreateThread}
          onCreateFolder={onCreateFolder}
        />,
      );
    });

    describe('WHEN it renders', () => {
      test('THEN the empty structure state shows without a search', () => {
        expect(screen.getByText(TRANSLATIONS.platform.sidebar.emptyStructureTitle)).toBeInTheDocument();
        expect(screen.queryByPlaceholderText(TRANSLATIONS.platform.sidebar.searchPlaceholder)).not.toBeInTheDocument();
      });
    });

    describe('WHEN the call to action is clicked', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByText(TRANSLATIONS.platform.sidebar.newThread));
      });

      test('THEN a thread is created at the root', () => {
        expect(onCreateThread).toHaveBeenCalledExactlyOnceWith();
      });
    });

    describe('WHEN the structure header creates a folder and a thread', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByTitle(TRANSLATIONS.platform.sidebar.newFolder));
        fireEvent.click(screen.getByTitle(TRANSLATIONS.platform.sidebar.newThread));
      });

      test('THEN both creations are requested', () => {
        expect(onCreateFolder).toHaveBeenCalledExactlyOnceWith();
        expect(onCreateThread).toHaveBeenCalledExactlyOnceWith();
      });
    });
  });

  describe('GIVEN an empty structure the member may not manage', () => {
    beforeEach(() => {
      usePermissionsStore.setState({ canManageStructure: false });
      render(<Sidebar workspaces={BASE_WORKSPACES} activeWorkspaceId="ws-1" onCreateThread={onCreateThread} />);
    });

    describe('WHEN it renders', () => {
      test('THEN the empty state offers nothing to create', () => {
        expect(screen.getByText(TRANSLATIONS.platform.sidebar.emptyStructureTitle)).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: TRANSLATIONS.platform.sidebar.newThread })).not.toBeInTheDocument();
        expect(screen.queryByTitle(TRANSLATIONS.platform.sidebar.newFolder)).not.toBeInTheDocument();
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

    describe('WHEN a click outside the switcher dismisses that rename', () => {
      beforeEach(() => {
        view.rerender(sidebarElement([...BASE_WORKSPACES, workspaceItem('ws-2')], 'ws-2'));
        fireEvent.change(screen.getByDisplayValue('Workspace ws-2'), { target: { value: 'Research' } });
        fireEvent.mouseDown(document.body);
      });

      test('THEN the rename is dropped, reported done, and the switcher closes', () => {
        expect(onRenameWorkspace).not.toHaveBeenCalled();
        expect(onWorkspaceEditingComplete).toHaveBeenCalledOnce();
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

    describe('WHEN the settings of a workspace are opened from the panel', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByTitle(TRANSLATIONS.platform.sidebar.workspaceSettings));
      });

      test('THEN the settings open with the focus on the switcher, which the dialog returns to when it closes', () => {
        expect(onOpenWorkspaceSettings).toHaveBeenCalledExactlyOnceWith('ws-1');
        expect(workspacePanel()).not.toBeInTheDocument();
        expect(switcherTrigger()).toHaveFocus();
      });
    });

    describe('WHEN the delete of a workspace is confirmed', () => {
      beforeEach(() => {
        fireEvent.click(within(workspacePanel()!).getByTitle(TRANSLATIONS.platform.sidebar.delete));
        fireEvent.click(
          within(screen.getByRole('alertdialog')).getByRole('button', { name: TRANSLATIONS.platform.sidebar.delete }),
        );
      });

      test('THEN that workspace is deleted', () => {
        expect(onDeleteWorkspace).toHaveBeenCalledExactlyOnceWith('ws-1');
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
        expect(selectionBar('platform.sidebar.workspacesSelected', 1)).toHaveTextContent('1');
        expect(
          within(selectionBar('platform.sidebar.workspacesSelected', 1)).queryByTitle(
            TRANSLATIONS.platform.sidebar.delete,
          ),
        ).not.toBeInTheDocument();
      });
    });

    describe('WHEN a manageable workspace joins the selection', () => {
      beforeEach(() => {
        fireEvent.click(within(workspacePanel()!).getByText('Workspace ws-2'), { ctrlKey: true });
        fireEvent.click(within(workspacePanel()!).getByText('Workspace ws-1'), { ctrlKey: true });
      });

      test('THEN the selection bar counts two workspaces in the plural and offers the delete', () => {
        expect(selectionBar('platform.sidebar.workspacesSelected', 2)).toHaveTextContent('2');
        expect(
          within(selectionBar('platform.sidebar.workspacesSelected', 2)).getByTitle(
            TRANSLATIONS.platform.sidebar.delete,
          ),
        ).toBeInTheDocument();
      });
    });

    describe('WHEN the delete of the selected workspaces is confirmed', () => {
      beforeEach(() => {
        fireEvent.click(within(workspacePanel()!).getByText('Workspace ws-2'), { ctrlKey: true });
        fireEvent.click(within(workspacePanel()!).getByText('Workspace ws-1'), { ctrlKey: true });
        fireEvent.click(
          within(selectionBar('platform.sidebar.workspacesSelected', 2)).getByTitle(
            TRANSLATIONS.platform.sidebar.delete,
          ),
        );
        fireEvent.click(
          within(screen.getByRole('alertdialog')).getByRole('button', { name: TRANSLATIONS.platform.sidebar.delete }),
        );
      });

      test('THEN the selected workspaces are deleted and the selection clears', () => {
        expect(onBulkDeleteWorkspaces).toHaveBeenCalledExactlyOnceWith(new Set(['ws-2', 'ws-1']));
        expect(
          screen.queryByText(translate('platform.sidebar.workspacesSelected', { count: 2 })),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('GIVEN an open workspace switcher with a pending invitation', () => {
    beforeEach(() => {
      render(
        <Sidebar
          workspaces={BASE_WORKSPACES}
          activeWorkspaceId="ws-1"
          invitations={[myInvitation('inv-1', 'ws-9')]}
          onAcceptInvitation={onAcceptInvitation}
          onDeclineInvitation={onDeclineInvitation}
        />,
      );
      fireEvent.click(switcherTrigger());
    });

    describe('WHEN it renders', () => {
      test('THEN the invitation names the workspace and the offered role', () => {
        expect(within(workspacePanel()!).getByText('Workspace ws-9')).toBeInTheDocument();
        expect(
          within(workspacePanel()!).getByText(TRANSLATIONS.platform.workspaceSettings.roleNames.member),
        ).toBeInTheDocument();
      });
    });

    describe('WHEN the invitation is accepted', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.sidebar.invitations.accept }));
      });

      test('THEN the acceptance is requested and the panel closes', () => {
        expect(onAcceptInvitation).toHaveBeenCalledExactlyOnceWith(myInvitation('inv-1', 'ws-9'));
        expect(workspacePanel()).not.toBeInTheDocument();
      });
    });

    describe('WHEN the invitation is declined', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.sidebar.invitations.decline }));
      });

      test('THEN the decline is requested and the panel stays open', () => {
        expect(onDeclineInvitation).toHaveBeenCalledExactlyOnceWith(myInvitation('inv-1', 'ws-9'));
        expect(workspacePanel()).toBeInTheDocument();
      });
    });
  });

  describe('GIVEN a structure the member may manage with two root threads and a folder', () => {
    beforeEach(() => {
      usePermissionsStore.setState({ canManageStructure: true });
      render(
        <Sidebar
          items={[threadItem('t1'), threadItem('t2'), folderItem('f1')]}
          workspaces={BASE_WORKSPACES}
          activeWorkspaceId="ws-1"
          onDeleteItem={onDeleteItem}
          onBulkDelete={onBulkDelete}
          onBulkMove={onBulkMove}
        />,
      );
    });

    describe('WHEN one thread is ctrl-clicked', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByText('Thread t1'), { ctrlKey: true });
      });

      test('THEN the selection bar counts one item in the singular', () => {
        expect(selectionBar('platform.sidebar.itemsSelected', 1)).toHaveTextContent('1');
      });
    });

    describe('WHEN both threads are ctrl-clicked', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByText('Thread t1'), { ctrlKey: true });
        fireEvent.click(screen.getByText('Thread t2'), { ctrlKey: true });
      });

      test('THEN the selection bar counts two items in the plural', () => {
        expect(selectionBar('platform.sidebar.itemsSelected', 2)).toHaveTextContent('2');
      });
    });

    describe('WHEN the delete of one thread is requested', () => {
      beforeEach(() => {
        fireEvent.click(screen.getAllByTitle(TRANSLATIONS.platform.sidebar.delete)[0]!);
      });

      test('THEN the confirmation isolates the thread name from the surrounding bidirectional text', () => {
        expect(within(screen.getByRole('alertdialog')).getByText('Thread t1').tagName).toBe('BDI');
      });
    });

    describe('WHEN the delete of one thread is confirmed', () => {
      beforeEach(() => {
        fireEvent.click(screen.getAllByTitle(TRANSLATIONS.platform.sidebar.delete)[0]!);
        fireEvent.click(
          within(screen.getByRole('alertdialog')).getByRole('button', { name: TRANSLATIONS.platform.sidebar.delete }),
        );
      });

      test('THEN that thread is deleted', () => {
        expect(onDeleteItem).toHaveBeenCalledExactlyOnceWith('t1');
        expect(onBulkDelete).not.toHaveBeenCalled();
      });
    });

    describe('WHEN the bulk delete of a selection is cancelled with Escape', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByText('Thread t1'), { ctrlKey: true });
        fireEvent.click(screen.getByText('Thread t2'), { ctrlKey: true });
        fireEvent.click(
          within(selectionBar('platform.sidebar.itemsSelected', 2)).getByRole('button', {
            name: TRANSLATIONS.platform.sidebar.delete,
          }),
        );
        fireEvent.keyDown(window, { key: 'Escape' });
      });

      test('THEN only the confirmation closes and the selection stays', () => {
        expect(screen.getByRole('alertdialog')).toHaveClass('opacity-0');
        expect(selectedRows()).toHaveLength(2);
        expect(selectionBar('platform.sidebar.itemsSelected', 2)).toHaveTextContent('2');
      });
    });

    describe('WHEN the bulk delete of a selection is confirmed', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByText('Thread t1'), { ctrlKey: true });
        fireEvent.click(screen.getByText('Thread t2'), { ctrlKey: true });
        fireEvent.click(
          within(selectionBar('platform.sidebar.itemsSelected', 2)).getByRole('button', {
            name: TRANSLATIONS.platform.sidebar.delete,
          }),
        );
        fireEvent.click(
          within(screen.getByRole('alertdialog')).getByRole('button', { name: TRANSLATIONS.platform.sidebar.delete }),
        );
      });

      test('THEN the selected threads are deleted and the selection clears', () => {
        expect(onBulkDelete).toHaveBeenCalledExactlyOnceWith(new Set(['t1', 't2']));
        expect(selectedRows()).toHaveLength(0);
      });
    });

    describe('WHEN both threads are moved into the folder through the move dialog', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByText('Thread t1'), { ctrlKey: true });
        fireEvent.click(screen.getByText('Thread t2'), { ctrlKey: true });
        fireEvent.click(
          within(selectionBar('platform.sidebar.itemsSelected', 2)).getByRole('button', {
            name: TRANSLATIONS.platform.sidebar.moveToFolder,
          }),
        );
        fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Folder f1' }));
        fireEvent.click(
          within(screen.getByRole('dialog')).getByRole('button', { name: TRANSLATIONS.platform.sidebar.move }),
        );
      });

      test('THEN the threads move to the end of the folder and the selection clears', () => {
        expect(onBulkMove).toHaveBeenCalledExactlyOnceWith(new Set(['t1', 't2']), 'f1', 0);
        expect(selectedRows()).toHaveLength(0);
      });
    });

    describe('WHEN the move dialog is cancelled', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByText('Thread t1'), { ctrlKey: true });
        fireEvent.click(
          within(selectionBar('platform.sidebar.itemsSelected', 1)).getByRole('button', {
            name: TRANSLATIONS.platform.sidebar.moveToFolder,
          }),
        );
        fireEvent.click(
          within(screen.getByRole('dialog')).getByRole('button', { name: TRANSLATIONS.platform.sidebar.cancel }),
        );
      });

      test('THEN the dialog closes without a move and the selection stays', () => {
        expect(onBulkMove).not.toHaveBeenCalled();
        expect(screen.getByRole('dialog')).toHaveClass('opacity-0');
        expect(selectedRows()).toHaveLength(1);
      });
    });

    describe('WHEN a search query is typed', () => {
      beforeEach(() => {
        fireEvent.change(searchField(), { target: { value: 't1' } });
      });

      test('THEN only the matching thread stays and the button that clears the query is named', () => {
        expect(screen.getByText('Thread t1')).toBeInTheDocument();
        expect(screen.queryByText('Thread t2')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: TRANSLATIONS.platform.sidebar.clearSearch })).toBeInTheDocument();
      });
    });

    describe('WHEN a typed query is cleared with its button', () => {
      beforeEach(() => {
        fireEvent.change(searchField(), { target: { value: 't1' } });
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.sidebar.clearSearch }));
      });

      test('THEN the full tree returns', () => {
        expect(searchField()).toHaveValue('');
        expect(screen.getByText('Thread t2')).toBeInTheDocument();
      });
    });

    describe('WHEN a typed query is cleared with Escape', () => {
      beforeEach(() => {
        searchField().focus();
        fireEvent.change(searchField(), { target: { value: 't1' } });
        fireEvent.keyDown(searchField(), { key: 'Escape' });
      });

      test('THEN the query empties and the field lets go of the focus', () => {
        expect(searchField()).toHaveValue('');
        expect(searchField()).not.toHaveFocus();
      });
    });

    describe('WHEN a query matches nothing', () => {
      beforeEach(() => {
        fireEvent.change(searchField(), { target: { value: 'zzz' } });
      });

      test('THEN the empty search state repeats the query', () => {
        expect(screen.getByText(TRANSLATIONS.platform.sidebar.noSearchResults)).toBeInTheDocument();
        expect(screen.getByText('“zzz”')).toBeInTheDocument();
      });
    });

    describe('WHEN the slash key is pressed outside any field', () => {
      beforeEach(() => {
        fireEvent.keyDown(document.body, { key: '/' });
      });

      test('THEN the search takes the focus', () => {
        expect(searchField()).toHaveFocus();
      });
    });
  });

  describe('GIVEN a managed structure with a thread inside a collapsed folder', () => {
    beforeEach(() => {
      usePermissionsStore.setState({ canManageStructure: true });
      view = render(
        <Sidebar
          items={[folderItem('f1', [threadItem('t2')])]}
          workspaces={BASE_WORKSPACES}
          activeWorkspaceId="ws-1"
          editingItemId={null}
          onRenameItem={onRenameItem}
          onEditingComplete={onEditingComplete}
        />,
      );
      fireEvent.click(screen.getByText('Folder f1'));
    });

    describe('WHEN that thread arrives in rename mode', () => {
      beforeEach(() => {
        view.rerender(
          <Sidebar
            items={[folderItem('f1', [threadItem('t2')])]}
            workspaces={BASE_WORKSPACES}
            activeWorkspaceId="ws-1"
            editingItemId="t2"
            onRenameItem={onRenameItem}
            onEditingComplete={onEditingComplete}
          />,
        );
      });

      test('THEN the folder opens on the focused rename field of the thread', () => {
        expect(screen.getByRole('textbox', { name: TRANSLATIONS.platform.sidebar.rename })).toHaveValue('Thread t2');
        expect(screen.getByRole('textbox', { name: TRANSLATIONS.platform.sidebar.rename })).toHaveFocus();
      });
    });

    describe('WHEN that rename is confirmed', () => {
      beforeEach(() => {
        view.rerender(
          <Sidebar
            items={[folderItem('f1', [threadItem('t2')])]}
            workspaces={BASE_WORKSPACES}
            activeWorkspaceId="ws-1"
            editingItemId="t2"
            onRenameItem={onRenameItem}
            onEditingComplete={onEditingComplete}
          />,
        );
        fireEvent.change(screen.getByRole('textbox', { name: TRANSLATIONS.platform.sidebar.rename }), {
          target: { value: 'Named question' },
        });
        fireEvent.keyDown(screen.getByRole('textbox', { name: TRANSLATIONS.platform.sidebar.rename }), {
          key: 'Enter',
        });
      });

      test('THEN the name is saved and the rename is reported done', () => {
        expect(onRenameItem).toHaveBeenCalledExactlyOnceWith('t2', 'Named question');
        expect(onEditingComplete).toHaveBeenCalledOnce();
      });
    });
  });

  describe('GIVEN an open workspace switcher without any workspace', () => {
    beforeEach(() => {
      render(<Sidebar onCreateWorkspace={onCreateWorkspace} />);
      fireEvent.click(switcherTrigger());
    });

    describe('WHEN the call to action of the panel is clicked', () => {
      beforeEach(() => {
        fireEvent.click(
          within(workspacePanel()!)
            .getAllByRole('button', { name: TRANSLATIONS.platform.sidebar.newWorkspace })
            .at(-1)!,
        );
      });

      test('THEN the panel explains the empty list and requests a workspace', () => {
        expect(within(workspacePanel()!).getByText(TRANSLATIONS.platform.sidebar.noWorkspaces)).toBeInTheDocument();
        expect(onCreateWorkspace).toHaveBeenCalledOnce();
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
        expect(selectionBar('platform.sidebar.itemsSelected', 1)).toHaveTextContent('1');
      });

      test('THEN move and delete stay visible but locked with the permission hint', () => {
        expect(
          within(selectionBar('platform.sidebar.itemsSelected', 1)).getByRole('button', {
            name: TRANSLATIONS.platform.sidebar.moveToFolder,
          }),
        ).toHaveAttribute('aria-disabled', 'true');
        expect(
          within(selectionBar('platform.sidebar.itemsSelected', 1)).getByRole('button', {
            name: TRANSLATIONS.platform.sidebar.delete,
          }),
        ).toHaveAttribute('aria-disabled', 'true');
        expect(
          within(selectionBar('platform.sidebar.itemsSelected', 1)).getAllByTitle(
            TRANSLATIONS.platform.sidebar.structureLocked,
          ),
        ).toHaveLength(2);
      });
    });

    describe('WHEN the locked delete of a selection is clicked', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByText('Thread t1'), { ctrlKey: true });
        fireEvent.click(
          within(selectionBar('platform.sidebar.itemsSelected', 1)).getByRole('button', {
            name: TRANSLATIONS.platform.sidebar.delete,
          }),
        );
      });

      test('THEN no delete confirmation opens', () => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });
    });

    describe('WHEN the pointer drags a selection rectangle over the rows', () => {
      beforeEach(() => {
        const frames = stubAnimationFrame();

        document.querySelectorAll('[data-item-id]').forEach((row, index) => {
          vi.spyOn(row, 'getBoundingClientRect').mockReturnValue(
            domRect({ left: 0, right: 200, top: index * 32, bottom: (index + 1) * 32, width: 200, height: 32 }),
          );
        });
        act(() => {
          document
            .querySelector('[data-sidebar-scroll]')!
            .dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0, clientX: 100, clientY: 0 }));
          window.dispatchEvent(new MouseEvent('mousemove', { clientX: 120, clientY: 50 }));
          frames.flush();
        });
      });

      test('THEN the rows under the rectangle are selected', () => {
        expect(selectedRows().map((row) => row.textContent)).toEqual(['Thread t1', 'Folder f1']);
      });
    });
  });
});

import { useRef, useState } from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite';
import type { IWorkspaceItem, TNavItem } from '@interfaces';
import {
  findInTree,
  insertIntoTree,
  removeFromTree,
  Sidebar,
  updateNavItemName,
  type ISidebarProps,
} from '@/components';
import { ARG_CATEGORIES } from '../../consts';
import {
  deepTree,
  defaultWorkspaceId,
  flatThreads,
  fullTree,
  manyItems,
  workspaces,
} from './consts';

const WithFullscreen: Decorator = (Story) => (
  <div className="relative h-screen w-screen bg-neutral-100/60">
    <Story />
  </div>
);

const SidebarWithState = (args: ISidebarProps) => {
  const [activeItemId, setActiveItemId] = useState(args.activeItemId);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(
    args.activeWorkspaceId
  );
  const [items, setItems] = useState<TNavItem[]>(args.items ?? []);
  const [wsItems, setWsItems] = useState<IWorkspaceItem[]>(
    args.workspaces ?? []
  );
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingWorkspaceId, setEditingWorkspaceId] = useState<string | null>(
    null
  );
  const counterRef = useRef(0);
  const nextId = (prefix: string) => `${prefix}-${++counterRef.current}`;

  return (
    <Sidebar
      {...args}
      items={items}
      workspaces={wsItems}
      activeItemId={activeItemId}
      activeWorkspaceId={activeWorkspaceId}
      editingItemId={editingItemId}
      editingWorkspaceId={editingWorkspaceId}
      onItemClick={setActiveItemId}
      onWorkspaceSelect={(id) => {
        setActiveWorkspaceId(id);
        setEditingItemId(null);
      }}
      onCreateThread={(folderId) => {
        const id = nextId('thread');
        const thread: TNavItem = { type: 'thread', id, name: 'New Thread' };
        if (folderId) {
          setItems((prev) => insertIntoTree(prev, thread, folderId, Infinity));
        } else {
          setItems((prev) => [...prev, thread]);
        }
        setEditingItemId(id);
      }}
      onCreateFolder={() => {
        const id = nextId('folder');
        setItems((prev) => [
          ...prev,
          { type: 'folder', id, name: 'New Folder', items: [] },
        ]);
        setEditingItemId(id);
      }}
      onRenameItem={(id, name) =>
        setItems((prev) => updateNavItemName(prev, id, name))
      }
      onDeleteItem={(id) => setItems((prev) => removeFromTree(prev, id))}
      onBulkDelete={(ids) =>
        setItems((prev) =>
          [...ids].reduce((acc, id) => removeFromTree(acc, id), prev)
        )
      }
      onBulkDeleteWorkspaces={(ids) =>
        setWsItems((prev) => {
          const remaining = prev.filter((w) => !ids.has(w.id));
          if (activeWorkspaceId && ids.has(activeWorkspaceId)) {
            setActiveWorkspaceId(remaining[0]?.id);
          }
          return remaining;
        })
      }
      onBulkMove={(ids, parentId) =>
        setItems((prev) => {
          const toMove = [...ids]
            .map((id) => findInTree(prev, id))
            .filter((item): item is TNavItem => item !== null);
          const removed = [...ids].reduce(
            (acc, id) => removeFromTree(acc, id),
            prev
          );
          return toMove.reduce(
            (acc, item) => insertIntoTree(acc, item, parentId, Infinity),
            removed
          );
        })
      }
      onMoveItem={(id, _type, parentId, position) =>
        setItems((prev) => {
          const item = findInTree(prev, id);
          if (!item) return prev;
          const without = removeFromTree(prev, id);
          return insertIntoTree(without, item, parentId, position);
        })
      }
      onCreateWorkspace={() => {
        const id = nextId('ws');
        setWsItems((prev) => [...prev, { id, name: 'New Workspace' }]);
        setActiveWorkspaceId(id);
        setEditingWorkspaceId(id);
      }}
      onRenameWorkspace={(id, name) =>
        setWsItems((prev) =>
          prev.map((w) => (w.id === id ? { ...w, name } : w))
        )
      }
      onDeleteWorkspace={(id) => {
        setWsItems((prev) => {
          const remaining = prev.filter((w) => w.id !== id);
          if (id === activeWorkspaceId && remaining.length > 0) {
            setActiveWorkspaceId(remaining[0].id);
          }
          return remaining;
        });
      }}
      onEditingComplete={() => setEditingItemId(null)}
      onWorkspaceEditingComplete={() => setEditingWorkspaceId(null)}
    />
  );
};

const meta: Meta<typeof Sidebar> = {
  title: 'Components/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Workspace navigation sidebar with a collapsible folder/thread tree structure. Supports up to 3 levels of nesting.',
      },
    },
  },
  argTypes: {
    workspaces: {
      description: 'List of available workspaces',
      table: { category: ARG_CATEGORIES.CONTENT },
    },
    activeWorkspaceId: {
      control: 'text',
      description: 'ID of the currently active workspace',
      table: { category: ARG_CATEGORIES.CONTENT },
    },
    activeItemId: {
      control: 'text',
      description: 'ID of the currently active nav item',
      table: { category: ARG_CATEGORIES.CONTENT },
    },
    items: {
      description: 'Tree of folders and threads to render',
      table: { category: ARG_CATEGORIES.CONTENT },
    },
  },
  decorators: [WithFullscreen],
};

export default meta;

type Story = StoryObj<typeof Sidebar>;

export const Default: Story = {
  render: SidebarWithState,
  args: {
    items: fullTree,
    workspaces,
    activeWorkspaceId: defaultWorkspaceId,
    activeItemId: 'f1-t1',
  },
};

export const Empty: Story = {
  render: SidebarWithState,
  args: {
    items: [],
    workspaces,
    activeWorkspaceId: defaultWorkspaceId,
  },
};

export const FlatThreads: Story = {
  render: SidebarWithState,
  args: {
    items: flatThreads,
    workspaces,
    activeWorkspaceId: defaultWorkspaceId,
    activeItemId: 't2',
  },
};

export const Overflow: Story = {
  render: SidebarWithState,
  args: {
    items: manyItems,
    workspaces,
    activeWorkspaceId: defaultWorkspaceId,
    activeItemId: 'scroll-t5',
  },
};

export const DeepNesting: Story = {
  render: SidebarWithState,
  args: {
    items: deepTree,
    workspaces,
    activeWorkspaceId: defaultWorkspaceId,
    activeItemId: 'd1-f1-t1',
  },
};

export const SingleWorkspace: Story = {
  render: SidebarWithState,
  args: {
    items: fullTree,
    workspaces: [{ id: 'ws-1', name: 'My Workspace' }],
    activeWorkspaceId: 'ws-1',
    activeItemId: 'f1-t1',
  },
};

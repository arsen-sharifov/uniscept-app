import { useState } from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite';
import { Sidebar } from '@/components';
import type { ISidebarProps } from '@/components';
import { ARG_CATEGORIES } from '../../consts';
import {
  deepTree,
  defaultWorkspaceId,
  flatTopics,
  fullTree,
  manyItems,
  workspaces,
} from './consts';

const WithFullscreen: Decorator = (Story) => (
  <div className="relative h-screen w-screen bg-neutral-100/60">
    <Story />
  </div>
);

const meta: Meta<typeof Sidebar> = {
  title: 'Components/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Workspace navigation sidebar with a collapsible folder/topic tree structure. Supports up to 3 levels of nesting.',
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
      description: 'Tree of folders and topics to render',
      table: { category: ARG_CATEGORIES.CONTENT },
    },
  },
  decorators: [WithFullscreen],
};

const SidebarWithState = (args: ISidebarProps) => {
  const [activeItemId, setActiveItemId] = useState(args.activeItemId);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(
    args.activeWorkspaceId
  );

  return (
    <Sidebar
      {...args}
      activeItemId={activeItemId}
      activeWorkspaceId={activeWorkspaceId}
      onItemClick={setActiveItemId}
      onWorkspaceSelect={setActiveWorkspaceId}
    />
  );
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

export const FlatTopics: Story = {
  render: SidebarWithState,
  args: {
    items: flatTopics,
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

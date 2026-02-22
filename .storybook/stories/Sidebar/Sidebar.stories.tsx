import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite';
import { Sidebar } from '@/components/Sidebar';

import { ARG_CATEGORIES } from '../../consts';
import { fullTree, flatTopics, deepTree, manyItems } from './consts';

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
          'Workspace navigation sidebar with a collapsible folder/topic tree structure. Supports unlimited nesting depth.',
      },
    },
  },
  argTypes: {
    workspaceName: {
      control: 'text',
      description: 'Display name of the current workspace',
      table: { category: ARG_CATEGORIES.CONTENT },
    },
    items: {
      description: 'Tree of folders and topics to render',
      table: { category: ARG_CATEGORIES.CONTENT },
    },
  },
  decorators: [WithFullscreen],
};

export default meta;

type Story = StoryObj<typeof Sidebar>;

export const Default: Story = {
  args: {
    items: fullTree,
    workspaceName: 'My Workspace',
  },
};

export const Empty: Story = {
  args: {
    items: [],
    workspaceName: 'New Workspace',
  },
};

export const FlatTopics: Story = {
  args: {
    items: flatTopics,
    workspaceName: 'Quick Notes',
  },
};

export const DeepNesting: Story = {
  args: {
    items: deepTree,
    workspaceName: 'Deep Structure',
  },
};

export const Overflow: Story = {
  args: {
    items: manyItems,
    workspaceName: 'Large Workspace',
  },
};

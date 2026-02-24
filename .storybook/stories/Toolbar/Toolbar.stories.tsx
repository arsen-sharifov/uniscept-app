import { useState } from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite';
import type { IToolbarProps } from '@/components';
import { Toolbar } from '@/components';

import { ARG_CATEGORIES } from '../../consts';
import { defaultGroups, extendedGroups, minimalGroups } from './consts';

const WithFullscreen: Decorator = (Story) => (
  <div className="relative h-screen w-screen bg-neutral-100/60">
    <Story />
  </div>
);

const meta: Meta<typeof Toolbar> = {
  title: 'Components/Toolbar',
  component: Toolbar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Vertical toolbar anchored to the right edge of the viewport. Tool icons are organized into logical groups separated by dividers.',
      },
    },
  },
  argTypes: {
    groups: {
      description:
        'Array of tool groups. Each group is an array of tool items with a Lucide icon.',
      table: { category: ARG_CATEGORIES.CONTENT },
    },
    activeTool: {
      control: { type: 'number' },
      description: 'Flat index of the active tool across all groups',
      table: { category: ARG_CATEGORIES.BEHAVIOR },
    },
  },
  decorators: [WithFullscreen],
};

const ToolbarWithState = (args: IToolbarProps) => {
  const [activeTool, setActiveTool] = useState(args.activeTool);

  return (
    <Toolbar {...args} activeTool={activeTool} onToolClick={setActiveTool} />
  );
};

export default meta;

type Story = StoryObj<typeof Toolbar>;

export const Default: Story = {
  render: ToolbarWithState,
  args: {
    groups: defaultGroups,
    activeTool: 0,
  },
};

export const Empty: Story = {
  render: ToolbarWithState,
  args: {
    groups: [],
  },
};

export const Minimal: Story = {
  render: ToolbarWithState,
  args: {
    groups: minimalGroups,
    activeTool: 0,
  },
};

export const Extended: Story = {
  render: ToolbarWithState,
  args: {
    groups: extendedGroups,
    activeTool: 2,
  },
};

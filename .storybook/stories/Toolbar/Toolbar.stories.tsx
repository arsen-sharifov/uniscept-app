import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite';
import { Toolbar } from '@/components/Toolbar';

import { ARG_CATEGORIES } from '../../consts';
import { defaultGroups, minimalGroups, extendedGroups } from './consts';

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
  },
  decorators: [WithFullscreen],
};

export default meta;

type Story = StoryObj<typeof Toolbar>;

export const Default: Story = {
  args: {
    groups: defaultGroups,
  },
};

export const Empty: Story = {
  args: {
    groups: [],
  },
};

export const Minimal: Story = {
  args: {
    groups: minimalGroups,
  },
};

export const Extended: Story = {
  args: {
    groups: extendedGroups,
  },
};

import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite';
import { ReactFlowProvider } from '@xyflow/react';
import { Canvas } from '@/components';
import { ARG_CATEGORIES } from '../../consts';

const WithFullscreen: Decorator = (Story) => (
  <div className="relative h-screen w-screen bg-neutral-100/60">
    <Story />
  </div>
);

const WithReactFlowProvider: Decorator = (Story) => (
  <ReactFlowProvider>
    <Story />
  </ReactFlowProvider>
);

const meta: Meta<typeof Canvas> = {
  title: 'Components/Canvas',
  component: Canvas,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Interactive node-based canvas powered by React Flow. Requires `workspaceId` and `threadId` to bootstrap sync; in Storybook the supabase calls fail gracefully into the load-error overlay.',
      },
    },
  },
  argTypes: {
    workspaceId: {
      control: { type: 'text' },
      description: 'Active workspace identifier.',
      table: { category: ARG_CATEGORIES.CONTENT },
    },
    threadId: {
      control: { type: 'text' },
      description: 'Active thread identifier.',
      table: { category: ARG_CATEGORIES.CONTENT },
    },
  },
  decorators: [WithFullscreen, WithReactFlowProvider],
};

export default meta;

type Story = StoryObj<typeof Canvas>;

export const Default: Story = {
  args: {
    workspaceId: 'storybook-workspace',
    threadId: 'storybook-thread',
  },
};

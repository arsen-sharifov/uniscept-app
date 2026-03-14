import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite';
import { ReactFlowProvider } from '@xyflow/react';
import { Canvas } from '@/components';

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

const meta: Meta = {
  title: 'Components/Canvas',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Interactive node-based canvas powered by React Flow. Used as the core workspace for building and visualizing argument maps.',
      },
    },
  },
  decorators: [WithFullscreen, WithReactFlowProvider],
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => <Canvas />,
};

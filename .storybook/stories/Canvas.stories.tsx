import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Canvas } from '@/components/canvas';

const meta: Meta<typeof Canvas> = {
  title: 'Components/Canvas',
  component: Canvas,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Interactive node-based canvas powered by React Flow. Used as the core workspace for building and visualizing argument maps.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Canvas>;

export const Default: Story = {
  render: () => (
    <div style={{ width: '100%', height: '100vh' }}>
      <Canvas />
    </div>
  ),
};

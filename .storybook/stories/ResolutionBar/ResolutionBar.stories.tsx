import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ResolutionBar } from '@/components';

import { answeredNodes } from './consts';
import { WithCanvasStage, withCanvasStore } from '../../decorators';

const meta: Meta<typeof ResolutionBar> = {
  title: 'Components/Canvas/ResolutionBar',
  component: ResolutionBar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The resolved indicator for a discussion (flow stage ⑥). It is derived purely from the canvas: once a node is marked as the answer, a “Resolved” pill appears at the top; with no answer it renders nothing. The store is mocked so each state previews in isolation.',
      },
    },
  },
  decorators: [WithCanvasStage],
};

export default meta;

type Story = StoryObj<typeof ResolutionBar>;

export const Resolved: Story = {
  parameters: {
    docs: {
      description: {
        story: 'A node is marked as the answer — the “Resolved” pill appears at the top of the canvas.',
      },
    },
  },
  decorators: [withCanvasStore({ nodes: answeredNodes })],
  render: () => <ResolutionBar />,
};

export const WithoutAnswer: Story = {
  parameters: {
    docs: {
      description: {
        story: 'No answer node yet — the bar is hidden, so nothing renders at the top.',
      },
    },
  },
  decorators: [withCanvasStore({ nodes: [] })],
  render: () => <ResolutionBar />,
};

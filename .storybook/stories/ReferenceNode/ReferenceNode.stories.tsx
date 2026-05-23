import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ReferenceNode } from '@/components';

import { defaultReference, longPathReference, selectedReference } from './consts';
import { SingleReferenceFlow } from './fragments';
import { ARG_CATEGORIES } from '../../consts';
import { WithCanvasStage, WithReactFlow, withCanvasStore } from '../../decorators';

const meta: Meta<typeof ReferenceNode> = {
  title: 'Components/Canvas/ReferenceNode',
  component: ReferenceNode,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Cross-thread reference card — a thin pointer to a node living on another canvas. Dashed border and `--ref` tokens distinguish it from regular reasoning nodes. Double-click or the arrow button navigate to the source canvas in the real app; here the router push is harmless.',
      },
    },
  },
  argTypes: {
    id: {
      control: false,
      table: { category: ARG_CATEGORIES.OTHER },
    },
    data: {
      control: false,
      description: 'IReferenceNodeData — source workspace, thread, and node identifiers.',
      table: { category: ARG_CATEGORIES.CONTENT },
    },
    selected: {
      control: 'boolean',
      description: 'React Flow selection flag.',
      table: { category: ARG_CATEGORIES.APPEARANCE },
    },
  },
  decorators: [WithCanvasStage, WithReactFlow],
};

export default meta;

type Story = StoryObj<typeof ReferenceNode>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Resting reference card with workspace / thread breadcrumb and an external-link affordance.',
      },
    },
  },
  decorators: [withCanvasStore({ nodes: [defaultReference] })],
  render: () => <SingleReferenceFlow node={defaultReference} />,
};

export const Selected: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Selected via React Flow — solid cyan ring replaces the dashed border on the outer edge.',
      },
    },
  },
  decorators: [withCanvasStore({ nodes: [selectedReference] })],
  render: () => <SingleReferenceFlow node={selectedReference} />,
};

export const LongPath: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Workspace and thread names overflow the breadcrumb — both segments truncate with the slash divider preserved.',
      },
    },
  },
  decorators: [withCanvasStore({ nodes: [longPathReference] })],
  render: () => <SingleReferenceFlow node={longPathReference} />,
};

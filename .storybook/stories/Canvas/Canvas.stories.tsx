import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Canvas } from '@/components';

import { denseCanvas, emptyCanvas, evaluatedCanvas, reasoningCanvas } from './consts';
import { ARG_CATEGORIES } from '../../consts';
import { WithCanvasStage, WithReactFlow, withCanvasStore } from '../../decorators';

const meta: Meta<typeof Canvas> = {
  title: 'Components/Canvas',
  component: Canvas,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Interactive node-based reasoning canvas powered by React Flow. In the app it hydrates from Supabase; in Storybook the store is mocked directly so every state — empty, populated, evaluated — is previewable. Stories stay interactive: add nodes with `N`, drag, connect, and use the toolbar.',
      },
    },
  },
  argTypes: {
    workspaceId: {
      control: 'text',
      description: 'Active workspace identifier.',
      table: { category: ARG_CATEGORIES.CONTENT },
    },
    threadId: {
      control: 'text',
      description: 'Active thread identifier.',
      table: { category: ARG_CATEGORIES.CONTENT },
    },
  },
  decorators: [WithCanvasStage, WithReactFlow],
};

export default meta;

type Story = StoryObj<typeof Canvas>;

export const Empty: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Hydrated but with no nodes — shows the empty-state hint with the `N` keyboard shortcut.',
      },
    },
  },
  args: { workspaceId: 'sb-workspace', threadId: 'sb-empty' },
  decorators: [withCanvasStore({ threadId: 'sb-empty', nodes: emptyCanvas.nodes, edges: emptyCanvas.edges })],
};

export const WithNodes: Story = {
  parameters: {
    docs: {
      description: {
        story: 'A small reasoning graph — central question with connected arguments. Fully interactive.',
      },
    },
  },
  args: { workspaceId: 'sb-workspace', threadId: 'sb-reasoning' },
  decorators: [
    withCanvasStore({ threadId: 'sb-reasoning', nodes: reasoningCanvas.nodes, edges: reasoningCanvas.edges }),
  ],
};

export const EvaluatedPaths: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Nodes marked as valid / invalid paths, with comments attached. Edge tones reflect the effective status of the branch.',
      },
    },
  },
  args: { workspaceId: 'sb-workspace', threadId: 'sb-evaluated' },
  decorators: [
    withCanvasStore({ threadId: 'sb-evaluated', nodes: evaluatedCanvas.nodes, edges: evaluatedCanvas.edges }),
  ],
};

export const Dense: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Twelve nodes — useful for checking pan/zoom performance and minimap behaviour.',
      },
    },
  },
  args: { workspaceId: 'sb-workspace', threadId: 'sb-dense' },
  decorators: [withCanvasStore({ threadId: 'sb-dense', nodes: denseCanvas.nodes, edges: denseCanvas.edges })],
};

export const BackendError: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The real un-mocked component. Without a reachable Supabase instance the sync hook fails and the canvas shows its load-error overlay — this is the production failure state.',
      },
    },
  },
  args: {
    workspaceId: 'sb-workspace',
    threadId: 'sb-backend-error',
  },
};

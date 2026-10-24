import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { CanvasNode } from '@/components';

import {
  answerNode,
  defaultNode,
  deletedAuthorNode,
  editedNode,
  editingNode,
  emptyNode,
  formerAuthorNode,
  formattedNode,
  invalidNode,
  longLabelNode,
  pendingNode,
  SB_NODE_ID,
  selectedNode,
  validNode,
  withCommentsNode,
} from './consts';
import { SingleNodeFlow } from '../../components';
import { ARG_CATEGORIES } from '../../consts';
import { WithCanvasStage, withCanvasStore, withPermissionsStore, WithReactFlow } from '../../decorators';

const meta: Meta<typeof CanvasNode> = {
  title: 'Components/Canvas/CanvasNode',
  component: CanvasNode,
  parameters: {
    docs: {
      description: {
        component:
          'Primary reasoning card rendered inside React Flow. Holds the label, evaluation status, inline editing, the authorship row and the per-node comments popover (an opaque `--surface` panel). Every state is carried by the shared node band: a 3px tone strip across the top of the card plus a `font-mono-ui` uppercase status word in the same tone. The authorship row is a full-width footer on an `--accent-soft` tint: the avatar and the short name of the author on the left, the time on the right. The store is mocked directly so each visual state (selected, valid/invalid, pending connection, editing, empty, edited, with comments, former member, deleted account) is previewable in isolation.',
      },
    },
  },
  argTypes: {
    id: {
      control: false,
      description: 'Node id assigned by the canvas store.',
      table: { category: ARG_CATEGORIES.OTHER },
    },
    data: {
      control: false,
      description: 'ICanvasNodeData — label, status, comments, author and times.',
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

type Story = StoryObj<typeof CanvasNode>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Resting state — no selection, no comments. An unevaluated node carries no band; the strip and status word appear only once it is validated, refuted, affected or marked as the answer. Handles fade in on hover.',
      },
    },
  },
  decorators: [withCanvasStore({ nodes: [defaultNode] })],
  render: () => <SingleNodeFlow node={defaultNode} />,
};

export const Empty: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A node with no text: the label shows the muted `New node` placeholder, and the editor opens empty with the same words as its prompt.',
      },
    },
  },
  decorators: [withCanvasStore({ nodes: [emptyNode] })],
  render: () => <SingleNodeFlow node={emptyNode} />,
};

export const Selected: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Selected via React Flow — outlined with the active border token.',
      },
    },
  },
  decorators: [withCanvasStore({ nodes: [selectedNode] })],
  render: () => <SingleNodeFlow node={selectedNode} />,
};

export const WithComments: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Comments popover open. Each comment is a `--surface-elevated` card on a `--surface-soft` well, headed by the author row: avatar and short name on the left, time on the right, `· edited` after a change. Comments by the viewer reveal edit and delete over the top corner of the card on hover or keyboard focus; a comment by a former member shows the dashed placeholder.',
      },
    },
  },
  decorators: [withCanvasStore({ nodes: [withCommentsNode], openCommentsNodeId: SB_NODE_ID })],
  render: () => <SingleNodeFlow node={withCommentsNode} />,
};

export const ReadOnlyComments: Story = {
  parameters: {
    docs: {
      story: { inline: false, height: '480px' },
      description: {
        story:
          'Viewer permissions — the comments popover stays readable, but the composer, edit and delete are hidden because `canComment` is off. Rendered in an iframe on the docs page so the permissions override cannot leak into sibling stories that share the store.',
      },
    },
  },
  decorators: [
    withCanvasStore({ nodes: [withCommentsNode], openCommentsNodeId: SB_NODE_ID }),
    withPermissionsStore({ isOwner: false, canEditCanvas: false, canComment: false }),
  ],
  render: () => <SingleNodeFlow node={withCommentsNode} />,
};

export const Valid: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Status set to `valid` — 3px `--status-success` strip, check mark, and the VALID status word.',
      },
    },
  },
  decorators: [withCanvasStore({ nodes: [validNode] })],
  render: () => <SingleNodeFlow node={validNode} />,
};

export const Invalid: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Status set to `invalid` — 3px `--status-error` strip, cross mark, and the INVALID status word.',
      },
    },
  },
  decorators: [withCanvasStore({ nodes: [invalidNode] })],
  render: () => <SingleNodeFlow node={invalidNode} />,
};

export const Answer: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Marked as the discussion final answer — 3px `--decision` strip, flag icon, and the ANSWER status word. Deliberately distinct from valid, which bands in `--status-success`.',
      },
    },
  },
  decorators: [withCanvasStore({ nodes: [answerNode] })],
  render: () => <SingleNodeFlow node={answerNode} />,
};

export const Formatted: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Label with bold, italic, underline, strikethrough, a link, a palette text color and a bullet list. Text colors resolve through the per-theme `--ink-*` tokens, so the same label stays readable in every theme.',
      },
    },
  },
  decorators: [withCanvasStore({ nodes: [formattedNode] })],
  render: () => <SingleNodeFlow node={formattedNode} />,
};

export const Editing: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`editingNodeId` matches this node, so the label turns into the focused rich text editor. Selecting text opens the formatting toolbar.',
      },
    },
  },
  decorators: [withCanvasStore({ nodes: [editingNode], editingNodeId: SB_NODE_ID })],
  render: () => <SingleNodeFlow node={editingNode} />,
};

export const LongLabel: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Label crosses the clamp threshold — the `Show more` toggle appears beneath the text.',
      },
    },
  },
  decorators: [withCanvasStore({ nodes: [longLabelNode] })],
  render: () => <SingleNodeFlow node={longLabelNode} />,
};

export const PendingConnection: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`pendingConnection` equals this node id — a pulsing `--ref-border` ring signals the connect tool is waiting for a target.',
      },
    },
  },
  decorators: [withCanvasStore({ nodes: [pendingNode], pendingConnection: SB_NODE_ID })],
  render: () => <SingleNodeFlow node={pendingNode} />,
};

export const Edited: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The text was changed after it was first written: the authorship row shows the time of the edit followed by `· edited`, and the tooltip on the time lists when the node was created and who edited it when.',
      },
    },
  },
  decorators: [withCanvasStore({ nodes: [editedNode] })],
  render: () => <SingleNodeFlow node={editedNode} />,
};

export const FormerMember: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The author has left the workspace. The text stays readable and the row shows the `Former member` placeholder with a dashed avatar instead of a name.',
      },
    },
  },
  decorators: [withCanvasStore({ nodes: [formerAuthorNode] })],
  render: () => <SingleNodeFlow node={formerAuthorNode} />,
};

export const DeletedAccount: Story = {
  parameters: {
    docs: {
      description: {
        story: 'The author deleted their account. The node keeps its text under the `Deleted account` placeholder.',
      },
    },
  },
  decorators: [withCanvasStore({ nodes: [deletedAuthorNode] })],
  render: () => <SingleNodeFlow node={deletedAuthorNode} />,
};

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs } from 'storybook/preview-api';
import { fn } from 'storybook/test';

import type { IToolGroup } from '@interfaces';

import { ECanvasTool, type IToolbarProps, Toolbar, buildCanvasToolGroups, buildCanvasTools } from '@/components';

import { DENSE_DISABLED_TOOL_IDS, READ_ONLY_DISABLED_TOOL_IDS } from './consts';
import { ToolbarWithState, type IToolbarWithStateProps } from './fragments';
import { ARG_CATEGORIES } from '../../consts';

const meta: Meta<typeof Toolbar> = {
  title: 'Components/Toolbar',
  component: Toolbar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Vertical tool rail floating clear of the right edge of the canvas — a glass panel on `--surface-glass` over `backdrop-blur-2xl`. Tool icons are grouped into logical clusters, each group after the first opening with a hairline top border. `activeTool` is bound to the Controls panel via `useArgs` — clicking a tool updates the live state and fires the `onToolClick` action.',
      },
    },
  },
  args: {
    activeTool: ECanvasTool.Select,
    onToolClick: fn(),
  },
  argTypes: {
    groups: {
      description:
        'Array of tool groups rendered top-to-bottom. Each group has an `id`, optional `label`, and a `tools` array of `IToolItem` (id, icon, label, description, shortcut, kind, disabled). Every group after the first opens with a hairline top border.',
      table: {
        category: ARG_CATEGORIES.CONTENT,
        type: { summary: 'IToolGroup[]', detail: '{ id: string; label?: string; tools: IToolItem[] }[]' },
      },
    },
    activeTool: {
      control: 'text',
      description: 'ID of the active tool. Bound to the Controls panel.',
      table: { category: ARG_CATEGORIES.BEHAVIOR },
    },
    onToolClick: {
      description: 'Fired when a tool is clicked.',
      table: { category: ARG_CATEGORIES.BEHAVIOR },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Toolbar>;

const renderToolbar = (
  options: Pick<IToolbarWithStateProps, 'buildGroups' | 'mapGroups'> = {},
): NonNullable<Story['render']> =>
  function Render(args) {
    const [{ activeTool }, updateArgs] = useArgs<IToolbarProps>();

    return (
      <ToolbarWithState
        {...args}
        {...options}
        activeTool={activeTool}
        onToolClick={(id) => {
          args.onToolClick?.(id);
          updateArgs({ activeTool: id });
        }}
      />
    );
  };

export const Default: Story = {
  render: renderToolbar(),
};

export const SelectActive: Story = {
  args: { activeTool: ECanvasTool.Select },
  render: renderToolbar(),
};

export const ConnectActive: Story = {
  args: { activeTool: ECanvasTool.Connect },
  render: renderToolbar(),
};

export const AddNodeActive: Story = {
  args: { activeTool: ECanvasTool.AddNode },
  render: renderToolbar(),
};

export const WithDisabledTools: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Undo and Redo are disabled — matches the production empty-history state. Disabled tools cannot be activated, but the toolbar still renders them.',
      },
    },
  },
  render: renderToolbar({
    mapGroups: (groups) =>
      groups.map((group) => ({
        ...group,
        tools: group.tools.map((tool) =>
          tool.id === ECanvasTool.Undo || tool.id === ECanvasTool.Redo ? { ...tool, disabled: true } : tool,
        ),
      })),
  }),
};

export const ReadOnly: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Viewer permissions — every canvas-mutating tool is disabled, matching the production state driven by the permissions store. The tooltip keeps showing the label and shortcut; `IToolItem` carries no reason field.',
      },
    },
  },
  render: renderToolbar({
    buildGroups: (t) =>
      buildCanvasToolGroups(t.platform.canvas.tools).map((group) => ({
        ...group,
        tools: group.tools.map((tool) =>
          READ_ONLY_DISABLED_TOOL_IDS.has(tool.id) ? { ...tool, disabled: true } : tool,
        ),
      })),
  }),
};

export const Empty: Story = {
  parameters: {
    docs: {
      description: {
        story: 'No groups passed — the glass rail still renders, holding only the help button in its footer.',
      },
    },
  },
  args: {
    groups: [],
    activeTool: undefined,
  },
  render: renderToolbar(),
};

export const InterleavedGroups: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Custom composition that bypasses `buildCanvasToolGroups`. Tools are regrouped into "primary" (Select, AddNode, Connect) and "secondary" (Valid path, CrossReference, Delete) clusters to demonstrate that any `ECanvasTool` can become the active tool inside an arbitrary group layout.',
      },
    },
  },
  args: { activeTool: ECanvasTool.AddNode },
  render: renderToolbar({
    buildGroups: (t) => {
      const tools = buildCanvasTools(t.platform.canvas.tools);

      return [
        {
          id: 'primary',
          label: t.platform.canvas.tools.groups.build,
          tools: [tools[ECanvasTool.Select], tools[ECanvasTool.AddNode], tools[ECanvasTool.Connect]],
        },
        {
          id: 'secondary',
          label: t.platform.canvas.tools.groups.decide,
          tools: [tools[ECanvasTool.ValidPath], tools[ECanvasTool.CrossReference], tools[ECanvasTool.Delete]],
        },
      ] satisfies IToolGroup[];
    },
  }),
};

export const DenseGroups: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Full default group set with several tools marked `disabled` (Pan, ZoomOut, Delete, InvalidPath, Undo, Redo). Demonstrates how a densely filled rail distributes inside its fixed full-height frame while the group hairlines hold.',
      },
    },
  },
  render: renderToolbar({
    mapGroups: (groups) =>
      groups.map((group) => ({
        ...group,
        tools: group.tools.map((tool) => (DENSE_DISABLED_TOOL_IDS.has(tool.id) ? { ...tool, disabled: true } : tool)),
      })),
  }),
};

export const MinimalSingleGroup: Story = {
  parameters: {
    docs: {
      description: {
        story: 'A single group with three tools — no hairline is drawn, since only groups after the first carry one.',
      },
    },
  },
  args: { activeTool: ECanvasTool.Select },
  render: renderToolbar({
    buildGroups: (t) => {
      const tools = buildCanvasTools(t.platform.canvas.tools);

      return [
        {
          id: 'navigate',
          label: t.platform.canvas.tools.groups.navigate,
          tools: [tools[ECanvasTool.Select], tools[ECanvasTool.Pan], tools[ECanvasTool.ZoomIn]],
        },
      ] satisfies IToolGroup[];
    },
  }),
};

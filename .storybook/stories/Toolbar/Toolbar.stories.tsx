import { useMemo, useState } from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite';
import { type IToolbarProps, ECanvasTool, Toolbar, buildCanvasToolGroups } from '@/components';
import { useTranslations } from '@hooks';
import { ARG_CATEGORIES } from '../../consts';

const WithFullscreen: Decorator = (Story) => (
  <div className="relative h-screen w-screen bg-neutral-100/60">
    <Story />
  </div>
);

const ToolbarWithState = (args: IToolbarProps) => {
  const [activeTool, setActiveTool] = useState(args.activeTool);

  return <Toolbar {...args} activeTool={activeTool} onToolClick={setActiveTool} />;
};

const StaticToolbar = (args: IToolbarProps) => {
  const t = useTranslations();
  const groups = useMemo(() => buildCanvasToolGroups(t.platform.canvas.tools), [t.platform.canvas.tools]);

  return <ToolbarWithState {...args} groups={args.groups ?? groups} />;
};

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
      description: 'Array of tool groups, each with a label and tools array.',
      table: { category: ARG_CATEGORIES.CONTENT },
    },
    activeTool: {
      control: { type: 'text' },
      description: 'ID of the active tool',
      table: { category: ARG_CATEGORIES.BEHAVIOR },
    },
    onToolClick: {
      description: 'Callback fired when a tool is clicked.',
      table: { category: ARG_CATEGORIES.BEHAVIOR },
    },
  },
  decorators: [WithFullscreen],
};

export default meta;

type Story = StoryObj<typeof Toolbar>;

export const Default: Story = {
  render: StaticToolbar,
  args: {
    activeTool: ECanvasTool.Select,
  },
};

export const WithDisabledTools: Story = {
  render: (args) => {
    const t = useTranslations();
    const groups = buildCanvasToolGroups(t.platform.canvas.tools).map((group) => ({
      ...group,
      tools: group.tools.map((tool) =>
        tool.id === ECanvasTool.Undo || tool.id === ECanvasTool.Redo ? { ...tool, disabled: true } : tool
      ),
    }));
    return <ToolbarWithState {...args} groups={groups} />;
  },
  args: {
    activeTool: ECanvasTool.Select,
  },
};

export const Empty: Story = {
  render: ToolbarWithState,
  args: {
    groups: [],
  },
};

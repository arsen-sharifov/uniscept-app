import { useEffect, useState } from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite';
import { ReactFlowProvider } from '@xyflow/react';
import { ECanvasTool, type IToolItem } from '@interfaces';
import {
  type IToolbarProps,
  Canvas,
  Toolbar,
  CANVAS_TOOL_GROUPS,
} from '@/components';
import { useToolbar } from '@/components/Toolbar';
import { useCanvasStore } from '@/lib/stores';
import { ARG_CATEGORIES } from '../../consts';

interface IToolStoryProps {
  initialTool?: ECanvasTool;
}

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

const ToolbarWithState = (args: IToolbarProps) => {
  const [activeTool, setActiveTool] = useState(args.activeTool);

  return (
    <Toolbar {...args} activeTool={activeTool} onToolClick={setActiveTool} />
  );
};

const ToolStory = ({ initialTool = ECanvasTool.Select }: IToolStoryProps) => {
  const { groups, activeTool, handleToolClick } = useToolbar();

  useEffect(() => {
    useCanvasStore.setState({
      activeTool: initialTool,
      _past: [],
      _future: [],
    });
  }, [initialTool]);

  return (
    <>
      <Toolbar
        groups={groups}
        activeTool={activeTool}
        onToolClick={handleToolClick}
      />
      <Canvas />
    </>
  );
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
      description:
        'Array of tool groups. Each group is an array of tool items with a Lucide icon.',
      table: { category: ARG_CATEGORIES.CONTENT },
    },
    activeTool: {
      control: { type: 'text' },
      description: 'ID of the active tool',
      table: { category: ARG_CATEGORIES.BEHAVIOR },
    },
  },
  decorators: [WithFullscreen],
};

export default meta;

type Story = StoryObj<typeof Toolbar>;

export const Default: Story = {
  render: ToolbarWithState,
  args: {
    groups: CANVAS_TOOL_GROUPS,
    activeTool: ECanvasTool.Select,
  },
};

export const WithDisabledTools: Story = {
  render: ToolbarWithState,
  args: {
    groups: CANVAS_TOOL_GROUPS.map((group: IToolItem[]) =>
      group.map((tool: IToolItem) =>
        tool.id === ECanvasTool.Undo || tool.id === ECanvasTool.Redo
          ? { ...tool, disabled: true }
          : tool
      )
    ),
    activeTool: ECanvasTool.Select,
  },
};

export const Empty: Story = {
  render: ToolbarWithState,
  args: {
    groups: [],
  },
};

export const Select: Story = {
  decorators: [WithReactFlowProvider],
  render: () => <ToolStory initialTool={ECanvasTool.Select} />,
};

export const Pan: Story = {
  decorators: [WithReactFlowProvider],
  render: () => <ToolStory initialTool={ECanvasTool.Pan} />,
};

export const AddNode: Story = {
  decorators: [WithReactFlowProvider],
  render: () => <ToolStory initialTool={ECanvasTool.AddNode} />,
};

export const Connect: Story = {
  decorators: [WithReactFlowProvider],
  render: () => <ToolStory initialTool={ECanvasTool.Connect} />,
};

export const Delete: Story = {
  decorators: [WithReactFlowProvider],
  render: () => <ToolStory initialTool={ECanvasTool.Delete} />,
};

export const ValidPath: Story = {
  decorators: [WithReactFlowProvider],
  render: () => <ToolStory initialTool={ECanvasTool.ValidPath} />,
};

export const InvalidPath: Story = {
  decorators: [WithReactFlowProvider],
  render: () => <ToolStory initialTool={ECanvasTool.InvalidPath} />,
};

export const CrossReference: Story = {
  decorators: [WithReactFlowProvider],
  render: () => <ToolStory initialTool={ECanvasTool.CrossReference} />,
};

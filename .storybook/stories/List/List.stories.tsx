import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite';
import { List } from '@/components/List';

import { ARG_CATEGORIES } from '../../consts';
import { SimpleTrigger, SampleContent } from './consts';

const WithContainer: Decorator = (Story) => (
  <div className="w-72 p-4">
    <Story />
  </div>
);

const meta: Meta<typeof List> = {
  title: 'Components/List',
  component: List,
  parameters: {
    docs: {
      description: {
        component:
          'Generic collapsible container with render-prop trigger. The trigger receives the current open state and a toggle callback, making it fully customizable.',
      },
    },
  },
  argTypes: {
    defaultOpen: {
      control: 'boolean',
      description: 'Whether the list starts in an expanded state',
      table: { category: ARG_CATEGORIES.BEHAVIOR },
    },
    trigger: {
      description:
        'Render function `(open: boolean, toggle: () => void) => ReactNode` for the trigger element',
      table: { category: ARG_CATEGORIES.CONTENT },
    },
    children: {
      description: 'Content revealed when the list is expanded',
      table: { category: ARG_CATEGORIES.CONTENT },
    },
  },
  decorators: [WithContainer],
};

export default meta;

type Story = StoryObj<typeof List>;

export const Collapsed: Story = {
  args: {
    trigger: SimpleTrigger('Click to expand'),
    children: <SampleContent text="Revealed content appears here." />,
    defaultOpen: false,
  },
};

export const Expanded: Story = {
  args: {
    trigger: SimpleTrigger('Section header'),
    children: <SampleContent text="This content is visible by default." />,
    defaultOpen: true,
  },
};

function NestedStory() {
  return (
    <List trigger={SimpleTrigger('Parent')} defaultOpen>
      <div className="ml-6 space-y-0.5 border-l border-black/5 pl-3">
        <SampleContent text="Sibling item" />
        <List trigger={SimpleTrigger('Child')} defaultOpen>
          <div className="ml-6 space-y-0.5 border-l border-black/5 pl-3">
            <SampleContent text="Leaf item A" />
            <SampleContent text="Leaf item B" />
          </div>
        </List>
      </div>
    </List>
  );
}

export const Nested: Story = {
  render: NestedStory,
};

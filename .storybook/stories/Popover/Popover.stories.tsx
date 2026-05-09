import { useState } from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite';
import { type IPopoverProps, Popover } from '@/components';
import { ARG_CATEGORIES } from '../../consts';
import { SampleMenu, SampleTrigger } from './consts';

const WithCenteredTrigger: Decorator = (Story) => (
  <div className="flex h-[60vh] items-center justify-center">
    <Story />
  </div>
);

const PopoverWithState = (args: IPopoverProps) => {
  const [open, setOpen] = useState(false);

  return <Popover {...args} open={open} onOpenChange={setOpen} />;
};

const meta: Meta<typeof Popover> = {
  title: 'Components/Popover',
  component: Popover,
  parameters: {
    docs: {
      description: {
        component:
          'Portal-based popover anchored to a trigger element. Closes on outside click, Escape, or window resize. Supports four placement variants and clamps to the viewport.',
      },
    },
  },
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Whether the popover panel is visible',
      table: { category: ARG_CATEGORIES.BEHAVIOR },
    },
    onOpenChange: {
      description: 'Callback fired when the popover should open or close',
      table: { category: ARG_CATEGORIES.BEHAVIOR },
    },
    placement: {
      control: { type: 'inline-radio' },
      options: ['bottom-start', 'bottom-end', 'top-start', 'top-end'],
      description: 'Anchor position relative to the trigger',
      table: { category: ARG_CATEGORIES.APPEARANCE },
    },
    offset: {
      control: { type: 'number' },
      description: 'Distance in pixels between trigger and panel',
      table: { category: ARG_CATEGORIES.APPEARANCE },
    },
    trigger: {
      description: 'Element that toggles the popover when clicked',
      table: { category: ARG_CATEGORIES.CONTENT },
    },
    children: {
      description: 'Popover panel content',
      table: { category: ARG_CATEGORIES.CONTENT },
    },
  },
  decorators: [WithCenteredTrigger],
};

export default meta;

type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  render: PopoverWithState,
  args: {
    trigger: <SampleTrigger />,
    children: <SampleMenu />,
    placement: 'bottom-start',
    offset: 8,
  },
};

export const BottomEnd: Story = {
  render: PopoverWithState,
  args: {
    trigger: <SampleTrigger />,
    children: <SampleMenu />,
    placement: 'bottom-end',
    offset: 8,
  },
};

export const TopStart: Story = {
  render: PopoverWithState,
  args: {
    trigger: <SampleTrigger />,
    children: <SampleMenu />,
    placement: 'top-start',
    offset: 8,
  },
};

export const TopEnd: Story = {
  render: PopoverWithState,
  args: {
    trigger: <SampleTrigger />,
    children: <SampleMenu />,
    placement: 'top-end',
    offset: 8,
  },
};

import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite';
import { SmartTooltip, Tooltip } from '@/components';
import { ARG_CATEGORIES } from '../../consts';

const WithPadding: Decorator = (Story) => (
  <div className="flex items-center justify-center p-24">
    <Story />
  </div>
);

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  parameters: {
    docs: {
      description: {
        component:
          'Hover tooltip with info icon. Shows contextual help text on hover. Supports custom trigger elements via children prop.',
      },
    },
  },
  argTypes: {
    text: {
      control: 'text',
      description: 'Tooltip content text',
      table: { category: ARG_CATEGORIES.CONTENT },
    },
    children: {
      description: 'Custom trigger element. Defaults to an info icon.',
      table: { category: ARG_CATEGORIES.CONTENT },
    },
  },
  decorators: [WithPadding],
};

export default meta;

type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  args: {
    text: 'Required during closed beta. Ask the team for your code.',
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center gap-1.5">
      <span className="text-sm font-medium text-black/70">Invite Code</span>
      <Tooltip text="Required during closed beta. Ask the team for your code." />
    </div>
  ),
};

export const CustomTrigger: Story = {
  args: {
    text: 'This is a custom trigger tooltip.',
    children: (
      <button className="rounded-lg border border-black/10 px-3 py-1.5 text-sm text-black/60 transition-colors hover:bg-black/5">
        Hover me
      </button>
    ),
  },
};

export const Smart: Story = {
  render: () => (
    <SmartTooltip content="Auto-flips when there is not enough room on the chosen side.">
      <button className="rounded-lg border border-black/10 px-3 py-1.5 text-sm text-black/60 transition-colors hover:bg-black/5">
        Hover for SmartTooltip
      </button>
    </SmartTooltip>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Viewport-aware tooltip. Picks the best placement based on available space, opens after a delay, closes on scroll or resize.',
      },
    },
  },
};

export const SmartOnlyIfTruncated: Story = {
  render: () => (
    <SmartTooltip content="Full label that only appears when the trigger is actually clipped." onlyIfTruncated>
      <span className="block max-w-[160px] truncate rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm text-black/70">
        A long label that gets clipped by max-width
      </span>
    </SmartTooltip>
  ),
  parameters: {
    docs: {
      description: {
        story: 'With `onlyIfTruncated`, the tooltip is suppressed unless the trigger overflows its container.',
      },
    },
  },
};

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { SmartTooltip, Tooltip } from '@/components';
import { ARG_CATEGORIES } from '../../consts';
import { WithPad } from '../../decorators';
import { SMART_PLACEMENTS } from './consts';
import { TriggerExample } from './fragments';

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  parameters: {
    docs: {
      description: {
        component:
          'Hover tooltip used for short helper copy. Defaults to an info icon trigger but accepts any element via `children`. Use `SmartTooltip` when the panel needs to flip away from the viewport edge.',
      },
    },
  },
  args: {
    text: 'Required during closed beta. Ask the team for your code.',
    position: 'top',
  },
  argTypes: {
    text: {
      control: 'text',
      description: 'Tooltip content (wraps to a 192px column).',
      table: { category: ARG_CATEGORIES.CONTENT },
    },
    position: {
      control: { type: 'inline-radio' },
      options: ['top', 'bottom'],
      description: 'Side of the trigger the tooltip appears on.',
      table: { category: ARG_CATEGORIES.APPEARANCE },
    },
    children: {
      description: 'Custom trigger. Defaults to an info icon.',
      table: { category: ARG_CATEGORIES.CONTENT },
    },
  },
  decorators: [WithPad],
};

export default meta;

type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {};

export const WithLabel: Story = {
  render: (args) => (
    <div className="flex items-center gap-1.5 text-[color:var(--text)]">
      <span className="text-[13px] font-medium">Invite Code</span>
      <Tooltip {...args} />
    </div>
  ),
};

export const CustomTrigger: Story = {
  args: {
    text: 'This is a custom trigger tooltip.',
    children: <TriggerExample>Hover me</TriggerExample>,
  },
};

export const BottomPosition: Story = {
  args: { position: 'bottom' },
  render: (args) => (
    <div className="flex items-center gap-1.5 text-[color:var(--text)]">
      <span className="text-[13px] font-medium">Read more</span>
      <Tooltip {...args} />
    </div>
  ),
};

export const Smart: Story = {
  name: 'SmartTooltip · auto flip',
  parameters: {
    docs: {
      description: {
        story:
          'Viewport-aware tooltip. Picks the best placement based on available space, opens after a delay, closes on scroll or resize.',
      },
    },
  },
  render: () => (
    <SmartTooltip content="Auto-flips when there is not enough room on the chosen side.">
      <TriggerExample>Hover for SmartTooltip</TriggerExample>
    </SmartTooltip>
  ),
};

export const SmartPlacements: Story = {
  name: 'SmartTooltip · placements',
  parameters: {
    docs: {
      description: {
        story: 'Four hint placements at once — top, bottom, left, right.',
      },
    },
  },
  render: () => (
    <div className="grid grid-cols-2 gap-12 sm:grid-cols-4">
      {SMART_PLACEMENTS.map((placement) => (
        <SmartTooltip key={placement} placement={placement} content={`Placement: ${placement}`}>
          <TriggerExample className="font-medium capitalize">{placement}</TriggerExample>
        </SmartTooltip>
      ))}
    </div>
  ),
};

export const SmartOnlyIfTruncated: Story = {
  name: 'SmartTooltip · onlyIfTruncated',
  parameters: {
    docs: {
      description: {
        story:
          'With `onlyIfTruncated`, the tooltip is suppressed unless the trigger overflows its container. Useful for table cells with ellipsis-truncated text.',
      },
    },
  },
  render: () => (
    <div className="flex flex-col items-center gap-3">
      <SmartTooltip content="Full label that only appears when the trigger is actually clipped." onlyIfTruncated>
        <span className="block max-w-[160px] truncate rounded-lg border border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)] px-3 py-1.5 text-[13px] text-[color:var(--text)]">
          A long label that gets clipped by max-width
        </span>
      </SmartTooltip>
      <SmartTooltip content="Hidden — this label fits inside its container." onlyIfTruncated>
        <span className="block max-w-[200px] truncate rounded-lg border border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)] px-3 py-1.5 text-[13px] text-[color:var(--text)]">
          Short
        </span>
      </SmartTooltip>
    </div>
  ),
};

export const SmartDisabled: Story = {
  name: 'SmartTooltip · disabled',
  parameters: {
    docs: {
      description: {
        story: '`disabled` short-circuits the open behaviour. Hover does nothing.',
      },
    },
  },
  render: () => (
    <SmartTooltip content="This tooltip should never show." disabled>
      <button
        type="button"
        className="rounded-lg border border-dashed border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)]/50 px-3 py-1.5 text-[13px] text-[color:var(--text-muted)]"
      >
        Hover me (no tooltip)
      </button>
    </SmartTooltip>
  ),
};

export const LongText: Story = {
  args: {
    text: 'Required during closed beta. Ask the team for your invite code — it grants access to private workspaces, governance threads, and the reference search index across all canvases inside your tenant.',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Verifies wrap behaviour when the tooltip copy overflows two lines. The panel is capped to 192px wide, so the text should break across multiple rows without horizontal scroll.',
      },
    },
  },
  render: (args) => (
    <div className="flex items-center gap-1.5 text-[color:var(--text)]">
      <span className="text-[13px] font-medium">Invite Code</span>
      <Tooltip {...args} />
    </div>
  ),
};

export const OnDisabledButton: Story = {
  name: 'On disabled button',
  parameters: {
    docs: {
      description: {
        story:
          'Disabled buttons do not fire pointer events, so the trigger is wrapped in a `<span>` that captures hover and forwards it to `SmartTooltip`. The button beneath stays visually disabled.',
      },
    },
  },
  render: () => (
    <SmartTooltip content="You need owner permissions to delete this workspace.">
      <span className="inline-block">
        <button
          type="button"
          disabled
          className="cursor-not-allowed rounded-lg border border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)]/60 px-3 py-1.5 text-[13px] text-[color:var(--text-muted)] opacity-60"
        >
          Delete workspace
        </button>
      </span>
    </SmartTooltip>
  ),
};

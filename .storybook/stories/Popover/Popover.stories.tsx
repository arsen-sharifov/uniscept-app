import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs } from 'storybook/preview-api';
import { fn } from 'storybook/test';
import { type IPopoverProps, Popover } from '@/components';
import { ARG_CATEGORIES } from '../../consts';
import { WithPad } from '../../decorators';
import { PLACEMENTS } from './consts';
import {
  IconTriggerExample,
  PlacementCell,
  MenuExample,
  ReferencesExample,
  TriggerExample,
  SearchableReferencesExample,
} from './fragments';

const placementChangeHandler = fn();

const WithPlacementsGrid: Decorator = (Story) => (
  <div className="grid min-h-screen w-full grid-cols-1 place-items-center gap-16 p-20 sm:grid-cols-2">
    <Story />
  </div>
);

const WithBottomRightCorner: Decorator = (Story) => (
  <div className="relative h-screen w-full">
    <div className="absolute right-4 bottom-4">
      <Story />
    </div>
  </div>
);

const meta: Meta<typeof Popover> = {
  title: 'Components/Popover',
  component: Popover,
  parameters: {
    docs: {
      description: {
        component:
          'Portal-based popover anchored to its trigger. Closes on outside click, Escape, or window resize, and clamps inside the viewport. `open` is bound to the Controls panel via `useArgs`; `onOpenChange` fires as an action.',
      },
    },
  },
  args: {
    open: false,
    placement: 'bottom-start',
    offset: 8,
    onOpenChange: fn(),
  },
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Whether the panel is visible. Bound to the Controls panel.',
      table: { category: ARG_CATEGORIES.BEHAVIOR },
    },
    onOpenChange: {
      description: 'Fired when the popover wants to open or close.',
      table: { category: ARG_CATEGORIES.BEHAVIOR },
    },
    placement: {
      control: { type: 'inline-radio' },
      options: PLACEMENTS.map((p) => p.id),
      description: 'Anchor position relative to the trigger.',
      table: { category: ARG_CATEGORIES.APPEARANCE },
    },
    offset: {
      control: { type: 'number', min: 0, max: 32, step: 1 },
      description: 'Pixels between trigger and panel.',
      table: { category: ARG_CATEGORIES.APPEARANCE },
    },
    trigger: {
      description: 'Element that toggles the popover when clicked.',
      table: { category: ARG_CATEGORIES.CONTENT },
    },
    children: {
      description: 'Panel content.',
      table: { category: ARG_CATEGORIES.CONTENT },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Popover>;

const renderPopover = (): NonNullable<Story['render']> =>
  function Render(args) {
    const [{ open }, updateArgs] = useArgs<IPopoverProps>();

    return (
      <Popover
        {...args}
        open={open}
        onOpenChange={(next) => {
          args.onOpenChange(next);
          updateArgs({ open: next });
        }}
      />
    );
  };

export const Default: Story = {
  args: {
    trigger: <TriggerExample />,
    children: <MenuExample onSelect={fn()} />,
  },
  decorators: [WithPad],
  render: renderPopover(),
};

export const IconAnchor: Story = {
  args: {
    trigger: <IconTriggerExample />,
    children: <MenuExample onSelect={fn()} />,
  },
  decorators: [WithPad],
  render: renderPopover(),
};

export const ReferencePicker: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Long list inside a popover — checks panel width clamping and how internal `onSelect` callbacks surface in the Actions tab.',
      },
    },
  },
  args: {
    trigger: <TriggerExample />,
    children: <ReferencesExample onSelect={fn()} />,
  },
  decorators: [WithPad],
  render: renderPopover(),
};

export const Placements: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'All four placement variants at once. Each cell holds its own open state so anchoring can be compared side-by-side.',
      },
    },
  },
  decorators: [WithPlacementsGrid],
  render: () => (
    <>
      {PLACEMENTS.map(({ id, label }) => (
        <PlacementCell
          key={id}
          placement={id}
          label={label}
          trigger={<TriggerExample />}
          content={<MenuExample onSelect={fn()} />}
          onOpenChange={placementChangeHandler}
        />
      ))}
    </>
  ),
};

export const OpenedByDefault: Story = {
  name: 'Opened by default',
  parameters: {
    docs: {
      description: {
        story:
          'Starts in the open state so the panel is visible without interaction. Handy for visual review and screenshot regressions.',
      },
    },
  },
  args: {
    open: true,
    trigger: <TriggerExample />,
    children: <MenuExample onSelect={fn()} />,
  },
  decorators: [WithPad],
  render: renderPopover(),
};

export const WithSearchableList: Story = {
  name: 'With searchable list',
  parameters: {
    docs: {
      description: {
        story:
          'Reference picker with an in-panel text filter. Typing into the input narrows the list in place — verifies that the popover keeps focus inside the panel.',
      },
    },
  },
  args: {
    trigger: <TriggerExample />,
    children: <SearchableReferencesExample onSelect={fn()} />,
  },
  decorators: [WithPad],
  render: renderPopover(),
};

export const ViewportClamping: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Trigger pinned to the bottom-right corner with `placement="bottom-end"`. The panel clamps inside the viewport instead of overflowing off-screen.',
      },
    },
  },
  args: {
    placement: 'bottom-end',
    trigger: <TriggerExample />,
    children: <MenuExample onSelect={fn()} />,
  },
  decorators: [WithBottomRightCorner],
  render: renderPopover(),
};

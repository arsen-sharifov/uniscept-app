import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { AVATAR_ICONS } from '@constants';
import { Avatar, getInitials } from '@/components';

import { NAME_CASES, SCRIPT_CASES } from './consts';
import {
  CommentThreadExample,
  PopoverTriggerExample,
  SidebarHeaderExample,
  WorkspaceMembersExample,
} from './fragments';
import { Showcase } from '../../components';
import { ARG_CATEGORIES } from '../../consts';
import { WithPad } from '../../decorators';

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  parameters: {
    docs: {
      description: {
        component:
          'Gradient circle showing a chosen icon or derived initials. `getInitials()` derives up to two characters; whitespace-only and empty names fall back to "U".',
      },
    },
  },
  args: {
    name: 'John Doe',
  },
  argTypes: {
    name: {
      control: 'text',
      description: 'Full name used to derive initials.',
      table: { category: ARG_CATEGORIES.CONTENT },
    },
  },
  decorators: [WithPad],
};

export default meta;

type Story = StoryObj<typeof Avatar>;

export const Default: Story = {};

export const SingleName: Story = {
  args: { name: 'Alice' },
};

export const Empty: Story = {
  args: { name: '' },
};

export const Variants: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Every case the initials algorithm handles, rendered through the shared Showcase grid.',
      },
    },
  },
  render: () => (
    <Showcase
      title="Initials resolution"
      caption="getInitials()"
      columns={3}
      items={NAME_CASES.map((c) => ({
        label: c.label,
        hint: getInitials(c.name),
        description: c.description,
        children: (
          <div className="flex items-center gap-3">
            <Avatar name={c.name} />
            <code className="font-mono text-[11px] text-[color:var(--text-muted)]">{`"${c.name || ' '}"`}</code>
          </div>
        ),
      }))}
    />
  ),
};

export const CyrillicAndDiacritics: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Extended coverage for non-Latin scripts. Confirms initials, casing, and fit inside the gradient circle across Cyrillic, Greek, CJK, and RTL inputs.',
      },
    },
  },
  render: () => (
    <Showcase
      title="Non-Latin scripts"
      caption="locale scripts"
      columns={3}
      items={SCRIPT_CASES.map((c) => ({
        label: c.label,
        hint: getInitials(c.name),
        description: c.description,
        children: (
          <div className="flex items-center gap-3">
            <Avatar name={c.name} />
            <code className="font-mono text-[11px] text-[color:var(--text-muted)]">{`"${c.name}"`}</code>
          </div>
        ),
      }))}
    />
  ),
};

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story: 'The five sizes the Avatar ships: xs, sm, md, lg (default), xl. Sizes scale the initials uniformly.',
      },
    },
  },
  render: () => (
    <Showcase
      title="Sizes"
      caption="initials"
      columns={4}
      items={(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => ({
        label: size,
        hint: `size=${size}`,
        children: (
          <div className="flex h-24 w-full items-center justify-center">
            <Avatar name="Dana Park" size={size} />
          </div>
        ),
      }))}
    />
  ),
};

export const WithIcon: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Avatar with a chosen icon instead of initials. This is what users see after picking an icon in Settings → Profile.',
      },
    },
  },
  render: () => (
    <Showcase
      title="Icon variants"
      caption="20 marks"
      columns={5}
      items={AVATAR_ICONS.map(({ id }) => ({
        label: id,
        hint: 'lg',
        children: (
          <div className="flex h-24 w-full items-center justify-center">
            <Avatar name="Dana Park" icon={id} size="lg" />
          </div>
        ),
      }))}
    />
  ),
};

export const IconVsInitials: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Icon and initials side by side at every size. The icon is sized to sit with the same restraint as the letters rather than filling the circle.',
      },
    },
  },
  render: () => (
    <Showcase
      title="Icon vs initials"
      caption="matched weight"
      columns={5}
      items={(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => ({
        label: size,
        hint: `size=${size}`,
        children: (
          <div className="flex h-24 w-full items-center justify-center gap-4">
            <Avatar name="Dana Park" icon="cat" size={size} />
            <Avatar name="Dana Park" size={size} />
          </div>
        ),
      }))}
    />
  ),
};

export const InContext: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Avatar embedded in the surfaces it ships in: sidebar header, comment thread, workspace member list, and a bare popover trigger.',
      },
    },
  },
  render: () => (
    <Showcase
      title="In context"
      caption="product surfaces"
      columns={2}
      items={[
        {
          label: 'Sidebar header',
          hint: 'identity',
          description: 'Compact identity row with plan caption next to the avatar.',
          children: <SidebarHeaderExample />,
        },
        {
          label: 'Comment thread',
          hint: 'timestamp',
          description: 'Aligned to the top of the comment body with a relative timestamp.',
          children: <CommentThreadExample />,
        },
        {
          label: 'Workspace members',
          hint: 'role chip',
          description: 'List row pairs the avatar with a name and a role pill.',
          span: true,
          children: <WorkspaceMembersExample />,
        },
        {
          label: 'Popover trigger',
          hint: 'standalone',
          description: 'Single avatar acting as the toggle for an account menu.',
          children: <PopoverTriggerExample />,
        },
      ]}
    />
  ),
};

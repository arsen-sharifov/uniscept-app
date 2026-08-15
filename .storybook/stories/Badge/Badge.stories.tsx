import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Badge } from '@/components';

import { ConstellationShowcase, FounderBadge, GalleryShowcase } from './fragments';
import { ARG_CATEGORIES } from '../../consts';
import { WithPad } from '../../decorators';

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  parameters: {
    docs: {
      description: {
        component:
          'Achievement badge card with earned and locked states. Earned badges carry a solid `--accent` medallion on `--on-accent` ink, an `--accent-soft` wash behind it, an active border and a hairline accent underline; locked ones dim, show a lock pip, and surface their unlock hint on hover. Used in the grid of Settings → Profile.',
      },
    },
  },
  argTypes: {
    earned: {
      control: 'boolean',
      description: 'Whether the user has unlocked the badge.',
      table: { category: ARG_CATEGORIES.STATE },
    },
  },
  decorators: [WithPad],
};

export default meta;

type Story = StoryObj<typeof Badge>;

export const Earned: Story = {
  args: { earned: true },
  render: ({ earned }) => <FounderBadge earned={earned} />,
};

export const Locked: Story = {
  args: { earned: false },
  render: ({ earned }) => <FounderBadge earned={earned} />,
};

export const Constellation: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Inline row of mini medallions used in the Identity Card to summarise badge progress. Earned pips fill with `--accent` on `--on-accent` ink; locked pips are faint outlines on `--surface-overlay`.',
      },
    },
  },
  render: ConstellationShowcase,
};

export const Gallery: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Every badge in the catalogue. Founder, First Steps, Linguist, and Explorer are marked as earned to illustrate the showcase used in Settings → Profile.',
      },
    },
  },
  render: GalleryShowcase,
};

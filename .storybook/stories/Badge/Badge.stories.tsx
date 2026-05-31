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
          'Achievement badge card with earned and locked states. Earned badges glow with the theme accent gradient; locked ones dim, show a lock pip, and surface their unlock hint on hover. Used in the grid of Settings → Profile.',
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
          'Inline row of mini medallions used in the Identity Card to summarise badge progress. Earned pips glow with the theme accent gradient; locked pips are faint outlines.',
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

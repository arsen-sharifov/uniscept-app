import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Sparkles } from 'lucide-react';

import { BADGES } from '@constants';
import { useTranslations } from '@hooks';
import { Badge, BadgeConstellation } from '@/components';

import { EARNED_DEMO } from './consts';
import { Showcase } from '../../components';
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
  args: {
    icon: Sparkles,
    label: 'Founder',
    unlock: 'Joined during the early beta.',
    earned: true,
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Badge name.',
      table: { category: ARG_CATEGORIES.CONTENT },
    },
    unlock: {
      control: 'text',
      description: 'Hint describing how to unlock the badge.',
      table: { category: ARG_CATEGORIES.CONTENT },
    },
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
  render: (args) => (
    <div className="w-36">
      <Badge {...args} />
    </div>
  ),
};

export const Locked: Story = {
  args: { earned: false },
  render: (args) => (
    <div className="w-36">
      <Badge {...args} />
    </div>
  ),
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
  render: function Render() {
    const { badges } = useTranslations().platform.settings.profile;
    const earnedSet = new Set(EARNED_DEMO);
    const pips = BADGES.map((definition) => ({
      id: definition.id,
      icon: definition.icon,
      label: badges[definition.labelKey],
      earned: earnedSet.has(definition.id),
    }));

    return (
      <Showcase
        title="Badge constellation"
        caption="identity card"
        columns={2}
        items={[
          {
            label: 'Default mix',
            hint: `${EARNED_DEMO.length} / ${BADGES.length}`,
            description: `${EARNED_DEMO.length} badges earned, ${BADGES.length - EARNED_DEMO.length} locked. Mirrors the ProfileSection identity card.`,
            children: <BadgeConstellation pips={pips} />,
          },
          {
            label: 'All earned',
            hint: 'maxed',
            description: 'Every badge unlocked. Every pip lit.',
            children: <BadgeConstellation pips={pips.map((pip) => ({ ...pip, earned: true }))} />,
          },
        ]}
      />
    );
  },
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
  render: function Render() {
    const { badges } = useTranslations().platform.settings.profile;
    const earnedSet = new Set(EARNED_DEMO);

    return (
      <Showcase
        title="Achievement catalogue"
        caption={`${BADGES.length} badges`}
        columns={4}
        items={BADGES.map((definition) => ({
          label: badges[definition.labelKey],
          hint: earnedSet.has(definition.id) ? 'earned' : 'locked',
          children: (
            <div className="flex w-full justify-center">
              <Badge
                icon={definition.icon}
                label={badges[definition.labelKey]}
                unlock={badges[definition.unlockKey]}
                earned={earnedSet.has(definition.id)}
              />
            </div>
          ),
        }))}
      />
    );
  },
};

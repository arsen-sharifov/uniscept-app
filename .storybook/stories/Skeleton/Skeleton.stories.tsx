import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Skeleton } from '@/components';

import { SkeletonCard } from './fragments';
import { ARG_CATEGORIES } from '../../consts';
import { WithPad } from '../../decorators';

const meta: Meta<typeof Skeleton> = {
  title: 'Components/Skeleton',
  component: Skeleton,
  parameters: {
    docs: {
      description: {
        component:
          'Loading placeholder block painted on `--skeleton` with a sweeping highlight that pauses under reduced motion. It carries no size of its own: the caller shapes it through `className`, and every `*Skeleton` fragment (canvas, sidebar, toolbar, settings) is composed from it.',
      },
    },
  },
  args: {
    className: 'h-3 w-40',
  },
  argTypes: {
    className: {
      control: 'text',
      description: 'Tailwind classes that give the block its size and radius.',
      table: { category: ARG_CATEGORIES.APPEARANCE },
    },
  },
  decorators: [WithPad],
};

export default meta;

type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {};

export const Composition: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A card assembled from several blocks: an avatar disc, two text lines of different length, and a button-sized slab, the same way the settings and sidebar skeletons are built.',
      },
    },
  },
  render: SkeletonCard,
};

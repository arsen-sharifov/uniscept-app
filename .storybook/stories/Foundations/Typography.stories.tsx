import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { TypographyAtlas } from './fragments';

const meta: Meta = {
  title: 'Foundations/Typography',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Type system anchored on three families. Every Tailwind class is exactly what the product uses — click to copy.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

export const Scale: Story = { render: () => <TypographyAtlas /> };

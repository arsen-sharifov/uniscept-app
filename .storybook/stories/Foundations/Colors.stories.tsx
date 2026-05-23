import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import type { TTheme } from '@constants';

import { ColorsAtlas } from './fragments';

const meta: Meta = {
  title: 'Foundations/Colors',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Semantic CSS variable palette. Every chip resolves live against the active toolbar theme — switch themes to retune. Click any variable or value to copy.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

export const Palette: Story = {
  render: (_, { globals }) => <ColorsAtlas activeTheme={(globals.theme as TTheme) || 'daybreak'} />,
};

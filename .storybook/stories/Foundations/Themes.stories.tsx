import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { TTheme } from '@constants';
import { ThemesAtlas, TypographyOnTheme } from './fragments';

const meta: Meta = {
  title: 'Foundations/Themes',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Six themes share one token vocabulary. The hero card mirrors your active toolbar theme; the strip surfaces the others. Switch the toolbar to retune everything.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

export const Atlas: Story = {
  render: (_, { globals }) => <ThemesAtlas activeTheme={(globals.theme as TTheme) || 'daybreak'} />,
};

export const Typography: Story = {
  parameters: {
    docs: {
      description: {
        story: 'A four-voice typographic specimen rendered across every theme.',
      },
    },
  },
  render: (_, { globals }) => <TypographyOnTheme activeTheme={(globals.theme as TTheme) || 'daybreak'} />,
};

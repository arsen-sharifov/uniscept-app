import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import type { TTheme } from '@constants';
import type { TPatternVariant } from '@story-interfaces';

import '@xyflow/react/dist/style.css';
import { PATTERN_VARIANTS } from './consts';
import { PatternsAtlas } from './fragments';
import { ARG_CATEGORIES } from '../../consts';

interface IPatternsStoryArgs {
  pattern: TPatternVariant;
}

const meta: Meta<IPatternsStoryArgs> = {
  title: 'Foundations/Patterns & Effects',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Texture (canvas patterns), depth (shadow), shape (radius), rhythm (spacing). Patterns render through the real Background component, not faked CSS. Switch theme via the toolbar; switch pattern via Controls.',
      },
    },
  },
  args: {
    pattern: 'dots',
  },
  argTypes: {
    pattern: {
      control: { type: 'inline-radio' },
      options: [...PATTERN_VARIANTS],
      description: 'Canvas background pattern.',
      table: { category: ARG_CATEGORIES.APPEARANCE },
    },
  },
};

export default meta;

type Story = StoryObj<IPatternsStoryArgs>;

export const Effects: Story = {
  render: (args, { globals }) => (
    <PatternsAtlas pattern={args.pattern} activeTheme={(globals.theme as TTheme) || 'daybreak'} />
  ),
};

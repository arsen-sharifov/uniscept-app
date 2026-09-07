import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { SelectionStrip } from '@/components';

import { SelectedRow } from './fragments';
import { ARG_CATEGORIES } from '../../consts';
import { WithPad } from '../../decorators';

const meta: Meta<typeof SelectionStrip> = {
  title: 'Components/SelectionStrip',
  component: SelectionStrip,
  parameters: {
    docs: {
      description: {
        component:
          'The 3px accent strip that marks the active or selected row across the product: sidebar items, settings navigation, list options and the bulk actions bar. It sits on the left edge of a `relative` host and pairs with an `--accent-soft` row fill.',
      },
    },
  },
  argTypes: {
    className: {
      control: 'text',
      description: 'Extra classes for the strip, such as a stacking index.',
      table: { category: ARG_CATEGORIES.APPEARANCE },
    },
  },
  decorators: [WithPad],
};

export default meta;

type Story = StoryObj<typeof SelectionStrip>;

export const Default: Story = {
  render: (args) => <SelectedRow {...args} />,
};

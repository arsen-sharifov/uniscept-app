import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Avatar } from '@/components';
import { ARG_CATEGORIES } from '../../consts';

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  parameters: {
    docs: {
      description: {
        component:
          'Gradient circle avatar displaying user initials (up to 2 characters).',
      },
    },
  },
  argTypes: {
    name: {
      control: 'text',
      description: 'Full name used to derive initials',
      table: { category: ARG_CATEGORIES.CONTENT },
    },
  },
  decorators: [
    (Story) => (
      <div className="flex items-center justify-center p-12">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  args: { name: 'John Doe' },
};

export const SingleName: Story = {
  args: { name: 'Alice' },
};

export const Empty: Story = {
  args: { name: '' },
};

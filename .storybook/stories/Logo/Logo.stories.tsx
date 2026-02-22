import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Logo } from '@/components/branding';

import { ARG_CATEGORIES } from '../../consts';
import { sizes } from './consts';

const meta: Meta<typeof Logo> = {
  title: 'Branding/Logo',
  component: Logo,
  parameters: {
    docs: {
      description: {
        component:
          'Animated gradient logotype. Use the `className` prop to control font size.',
      },
    },
  },
  argTypes: {
    className: {
      control: 'text',
      description: 'Tailwind classes applied to the logo span',
      table: { category: ARG_CATEGORIES.APPEARANCE },
    },
  },
  decorators: [
    function WithPadding(Story) {
      return (
        <div className="flex items-center justify-center p-12">
          <Story />
        </div>
      );
    },
  ],
};

export default meta;

type Story = StoryObj<typeof Logo>;

export const Default: Story = {
  args: { className: 'text-2xl' },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-4 p-12">
      {sizes.map(({ label, className }) => (
        <div key={label} className="flex items-center gap-4">
          <span className="w-12 text-xs text-black/30">{label}</span>
          <Logo className={className} />
        </div>
      ))}
    </div>
  ),
};

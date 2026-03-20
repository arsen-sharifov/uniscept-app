import { useState } from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite';
import { Stepper } from '@/components';
import { ARG_CATEGORIES } from '../../consts';

const WithPadding: Decorator = (Story) => (
  <div className="mx-auto max-w-md p-12">
    <Story />
  </div>
);

const meta: Meta<typeof Stepper> = {
  title: 'Components/Stepper',
  component: Stepper,
  parameters: {
    docs: {
      description: {
        component:
          'Step progress indicator. Shows numbered steps with labels, connecting lines, and checkmarks for completed steps.',
      },
    },
  },
  argTypes: {
    steps: {
      description: 'Array of step labels',
      table: { category: ARG_CATEGORIES.CONTENT },
    },
    currentStep: {
      control: { type: 'number', min: 1 },
      description: 'Current active step (1-based)',
      table: { category: ARG_CATEGORIES.CONTENT },
    },
  },
  decorators: [WithPadding],
};

export default meta;

type Story = StoryObj<typeof Stepper>;

export const TwoSteps: Story = {
  args: {
    steps: ['Plan', 'Account'],
    currentStep: 1,
  },
};

export const TwoStepsCompleted: Story = {
  args: {
    steps: ['Plan', 'Account'],
    currentStep: 2,
  },
};

export const ThreeSteps: Story = {
  args: {
    steps: ['Plan', 'Account', 'Confirm'],
    currentStep: 2,
  },
};

export const Interactive: Story = {
  render: () => {
    const steps = ['Plan', 'Account', 'Confirm'];
    const [current, setCurrent] = useState(1);

    return (
      <div className="space-y-6">
        <Stepper steps={steps} currentStep={current} />
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setCurrent((s) => Math.max(1, s - 1))}
            className="rounded-lg border border-black/10 px-4 py-2 text-sm transition-colors hover:bg-black/5"
          >
            Back
          </button>
          <button
            onClick={() => setCurrent((s) => Math.min(steps.length, s + 1))}
            className="rounded-lg bg-black px-4 py-2 text-sm text-white transition-colors hover:bg-black/80"
          >
            Next
          </button>
        </div>
      </div>
    );
  },
};

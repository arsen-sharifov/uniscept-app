import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite';

import { Stepper } from '@/components';

import { StepperWithState } from './fragments';
import { ARG_CATEGORIES } from '../../consts';

const WithStage: Decorator = (Story) => (
  <div className="flex min-h-screen w-full items-center justify-center px-8 py-16">
    <div className="w-full max-w-md">
      <Story />
    </div>
  </div>
);

const meta: Meta<typeof Stepper> = {
  title: 'Components/Stepper',
  component: Stepper,
  parameters: {
    docs: {
      description: {
        component:
          'Step progress indicator. Each step shows its label, a check mark once completed, and a connecting line to the next. `currentStep` is 1-based and wired through `useArgs` — the Controls slider drives the visual state live.',
      },
    },
  },
  args: {
    steps: ['Plan', 'Account', 'Confirm'],
    currentStep: 1,
  },
  argTypes: {
    steps: {
      description: 'Array of step labels.',
      table: { category: ARG_CATEGORIES.CONTENT },
    },
    currentStep: {
      control: { type: 'number', min: 1 },
      description: 'Current active step (1-based).',
      table: { category: ARG_CATEGORIES.CONTENT },
    },
  },
  decorators: [WithStage],
};

export default meta;

type Story = StoryObj<typeof Stepper>;

export const TwoSteps: Story = {
  args: { steps: ['Plan', 'Account'], currentStep: 1 },
};

export const TwoStepsCompleted: Story = {
  args: { steps: ['Plan', 'Account'], currentStep: 2 },
};

export const ThreeSteps: Story = {
  args: { steps: ['Plan', 'Account', 'Confirm'], currentStep: 2 },
};

export const FiveSteps: Story = {
  args: {
    steps: ['Idea', 'Outline', 'Draft', 'Review', 'Publish'],
    currentStep: 3,
  },
};

export const FirstStep: Story = {
  name: 'First step active',
  args: { steps: ['Plan', 'Account', 'Confirm'], currentStep: 1 },
};

export const LastStep: Story = {
  name: 'Last step active',
  args: { steps: ['Plan', 'Account', 'Confirm'], currentStep: 3 },
};

export const Interactive: Story = {
  name: 'Interactive (bound)',
  parameters: {
    docs: {
      description: {
        story:
          '`currentStep` is bound to the Controls panel via `useArgs`. The Back/Next buttons each fire an action so you can trace navigation events.',
      },
    },
  },
  args: { steps: ['Plan', 'Account', 'Confirm'], currentStep: 1 },
  render: StepperWithState,
};

export const ManySteps: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Eight-step flow with `currentStep=5`. Verifies how the connector lines, labels and active pill behave when the container has to accommodate a higher count.',
      },
    },
  },
  args: {
    steps: ['Brief', 'Scope', 'Plan', 'Draft', 'Review', 'Approve', 'Ship', 'Wrap'],
    currentStep: 5,
  },
};

export const SingleStep: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Edge case with exactly one step — no connector line should render between siblings.',
      },
    },
  },
  args: {
    steps: ['Done'],
    currentStep: 1,
  },
};

export const LongLabels: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Verifies wrapping behaviour when step labels are unusually long.',
      },
    },
  },
  args: {
    steps: ['Choose a workspace', 'Set up billing', 'Invite collaborators', 'Confirm setup'],
    currentStep: 2,
  },
};

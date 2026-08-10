import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ErrorBoundary } from '@/components';

import { CrashDemo, CrashedBoundary } from './fragments';
import { WithPad } from '../../decorators';

const meta: Meta<typeof ErrorBoundary> = {
  title: 'Components/ErrorBoundary',
  component: ErrorBoundary,
  parameters: {
    docs: {
      description: {
        component:
          'Class error boundary that catches render-time crashes in its subtree and shows a fallback instead of blanking the app (React only exposes this hook as a class). Caught errors go through `event.error` (logged, no toast). Route errors are owned by the Next `error.tsx` files; in the app this boundary only isolates `<Toaster />` inside `<EventBoundary>` with a `null` fallback. Recovery is a remount (new `key`). Click "Crash the render" to throw inside the child, then "Try again".',
      },
    },
  },
  decorators: [WithPad],
};

export default meta;

type Story = StoryObj<typeof ErrorBoundary>;

export const Playground: Story = {
  render: () => <CrashDemo />,
};

export const Fallback: Story = {
  render: () => <CrashedBoundary />,
};

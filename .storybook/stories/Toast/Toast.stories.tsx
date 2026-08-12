import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Toaster } from '@/components';

import { OpenToasts, TriggerRow } from './fragments';
import { WithPad } from '../../decorators';

const meta: Meta<typeof Toaster> = {
  title: 'Components/Toast',
  component: Toaster,
  parameters: {
    docs: {
      description: {
        component:
          'Imperative toast system. Call `event.success`, `event.info`, `event.warning` with a message, or `event.error(unknownError)` to normalize, log, and surface a caught error as a localized toast. Everything is callable from anywhere, even outside React. The `<Toaster />` renderer is mounted once via `<EventBoundary>` in the root layout; here it sits beside the trigger buttons.',
      },
    },
  },
  decorators: [WithPad],
};

export default meta;

type Story = StoryObj<typeof Toaster>;

export const Playground: Story = {
  render: () => (
    <>
      <TriggerRow />
      <Toaster />
    </>
  ),
};

export const OpenStates: Story = {
  name: 'Open toasts',
  render: () => <OpenToasts />,
};

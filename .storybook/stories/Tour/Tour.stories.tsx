import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { GuidePicker, TourCelebration, TourOffer } from '@/components';

import { NO_CANVAS_SNAPSHOT, READY_SNAPSHOT } from './consts';
import { ARG_CATEGORIES } from '../../consts';
import { withOnboardingStore } from '../../decorators';

const meta: Meta<typeof GuidePicker> = {
  title: 'Components/Tour',
  component: GuidePicker,
  parameters: {
    docs: {
      story: { inline: false },
      description: {
        component:
          'The three dialogs of the onboarding tour, each headed by Nodi on the `app-panel` material over the scrim: the tour offer, the guide picker and the celebration. None of them takes an `open` prop; each reads its open state from the onboarding store, so every story seeds that store and renders in its own iframe.',
      },
    },
  },
  argTypes: {
    snapshot: {
      control: false,
      description:
        'App state the guide requirements are checked against: workspace count, the open canvas and its nodes, and permissions. Decides which guides can start and which hint a disabled row shows.',
      table: { category: ARG_CATEGORIES.BEHAVIOR },
    },
  },
};

export default meta;

type Story = StoryObj<typeof GuidePicker>;

export const Offer: Story = {
  decorators: [withOnboardingStore({ offerOpen: true })],
  parameters: {
    docs: {
      description: {
        story:
          'Nodi introduces itself and offers the tour. The primary button starts the first guide. The secondary button, the close button, Escape and a click on the scrim all mark the offer as answered and close it.',
      },
    },
  },
  render: () => <TourOffer />,
};

export const GuidesFirstVisit: Story = {
  args: { snapshot: READY_SNAPSHOT },
  decorators: [withOnboardingStore({ pickerOpen: true })],
  parameters: {
    docs: {
      description: {
        story:
          'With no guide finished, only the first guide can start. Every other row is disabled and shows why it is locked.',
      },
    },
  },
};

export const GuidesInProgress: Story = {
  args: { snapshot: NO_CANVAS_SNAPSHOT },
  decorators: [withOnboardingStore({ pickerOpen: true, completedGuides: ['base', 'example'] })],
  parameters: {
    docs: {
      description: {
        story:
          'Finished guides are ticked and can be replayed. A guide that needs something the account does not have yet, here an open canvas, stays disabled and names what is missing.',
      },
    },
  },
};

export const Celebration: Story = {
  decorators: [withOnboardingStore({ celebrating: true })],
  parameters: {
    docs: {
      description: {
        story:
          'Nodi cheers beside the title, and the Initiate badge is shown as earned. The primary button, the close button, Escape and a click on the scrim all close the dialog.',
      },
    },
  },
  render: () => <TourCelebration />,
};

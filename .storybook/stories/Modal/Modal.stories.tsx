import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Modal } from '@/components';
import { ARG_CATEGORIES } from '../../consts';

const meta: Meta<typeof Modal> = {
  title: 'Components/Modal',
  component: Modal,
  parameters: {
    docs: {
      description: {
        component:
          'Portal-based modal with backdrop blur, Escape key support, and focus restoration. Supports overflow control and optional close button.',
      },
    },
  },
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Whether the modal is visible',
      table: { category: ARG_CATEGORIES.BEHAVIOR },
    },
    onClose: {
      description:
        'Callback when the modal is closed (backdrop click or Escape)',
      table: { category: ARG_CATEGORIES.BEHAVIOR },
    },
    children: {
      description: 'Modal content',
      table: { category: ARG_CATEGORIES.CONTENT },
    },
    className: {
      control: 'text',
      description:
        'Additional classes for the modal container (e.g. max-w-[1100px])',
      table: { category: ARG_CATEGORIES.APPEARANCE },
    },
    overflowHidden: {
      control: 'boolean',
      description:
        'When true, hides the default close button and sets overflow-hidden',
      table: { category: ARG_CATEGORIES.BEHAVIOR },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90"
        >
          Open Modal
        </button>
        <Modal open={open} onClose={() => setOpen(false)}>
          <div className="p-6">
            <h2 className="mb-2 text-lg font-bold text-black">Default Modal</h2>
            <p className="text-sm text-black/50">
              Click the backdrop, press Escape, or use the close button to
              dismiss.
            </p>
          </div>
        </Modal>
      </>
    );
  },
};

export const CustomWidth: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90"
        >
          Open Wide Modal
        </button>
        <Modal open={open} onClose={() => setOpen(false)} className="max-w-3xl">
          <div className="p-6">
            <h2 className="mb-2 text-lg font-bold text-black">Wide Modal</h2>
            <p className="text-sm text-black/50">
              This modal uses a custom max-w-3xl width class.
            </p>
          </div>
        </Modal>
      </>
    );
  },
};

export const OverflowHidden: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90"
        >
          Open Overflow Hidden Modal
        </button>
        <Modal open={open} onClose={() => setOpen(false)} overflowHidden>
          <div className="relative p-6">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-2 right-2 cursor-pointer rounded-lg p-1.5 text-black/30 transition-colors hover:bg-black/5 hover:text-black/60"
            >
              X
            </button>
            <h2 className="mb-2 text-lg font-bold text-black">
              Overflow Hidden
            </h2>
            <p className="text-sm text-black/50">
              The default close button is hidden. The consumer provides its own.
            </p>
          </div>
        </Modal>
      </>
    );
  },
};

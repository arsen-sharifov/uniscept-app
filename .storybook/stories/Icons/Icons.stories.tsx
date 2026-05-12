import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { type LucideProps, icons } from 'lucide-react';
import { ARG_CATEGORIES } from '../../consts';
import { BENCHMARK_SIZES } from './consts';
import { IconGallery, SampleCard } from './fragments';

const meta: Meta<LucideProps> = {
  title: 'Components/Icons',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Virtualised Lucide icon gallery. Controls drive stroke, size and colour on the entire grid; click any tile to copy the JSX tag. Search filters by name.',
      },
    },
  },
  args: {
    size: 18,
    strokeWidth: 1.85,
    color: undefined,
    absoluteStrokeWidth: false,
  },
  argTypes: {
    size: {
      control: { type: 'range', min: 12, max: 36, step: 1 },
      description: 'Icon size in pixels.',
      table: { category: ARG_CATEGORIES.APPEARANCE },
    },
    color: {
      control: 'color',
      description: 'Icon stroke color (leave empty to inherit `currentColor`).',
      table: { category: ARG_CATEGORIES.APPEARANCE },
    },
    strokeWidth: {
      control: { type: 'range', min: 0.5, max: 3, step: 0.05 },
      description: 'Stroke width of icon paths.',
      table: { category: ARG_CATEGORIES.APPEARANCE },
    },
    absoluteStrokeWidth: {
      control: 'boolean',
      description: 'When enabled, stroke width stays constant regardless of icon size.',
      table: { category: ARG_CATEGORIES.BEHAVIOR },
    },
  },
};

export default meta;

type Story = StoryObj<LucideProps>;

export const All: Story = {
  name: 'Gallery',
  render: (args) => <IconGallery {...args} onCopy={fn()} />,
};

export const FilteredCategory: Story = {
  name: 'Filtered (arrow)',
  parameters: {
    docs: {
      description: {
        story:
          'Gallery boots with the search field prefilled to `arrow`, so the grid renders an immediately filtered subset. Useful for inspecting how arrow-family glyphs sit together at the current control values.',
      },
    },
  },
  render: (args) => <IconGallery {...args} onCopy={fn()} initialSearch="arrow" />,
};

export const SizeBenchmark: Story = {
  name: 'Size benchmark',
  parameters: {
    docs: {
      description: {
        story:
          'Single icon (`Sparkles`) rendered side-by-side at 12 / 16 / 20 / 24 / 28 / 32 px so the stroke and optical weight can be compared across sizes. Stroke options from Controls still apply.',
      },
    },
  },
  render: (args) => {
    const { Sparkles } = icons;

    return (
      <div className="flex min-h-screen items-center justify-center bg-[color:var(--app-bg)] p-10">
        <div className="flex items-end gap-6 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] px-8 py-6">
          {BENCHMARK_SIZES.map((px) => (
            <div key={px} className="flex flex-col items-center gap-2 text-[color:var(--text)]">
              <Sparkles
                size={px}
                color={args.color}
                strokeWidth={args.strokeWidth}
                absoluteStrokeWidth={args.absoluteStrokeWidth}
              />
              <span className="font-mono text-[10px] tracking-[0.18em] text-[color:var(--text-subtle)] uppercase">
                {px}px
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

export const InUse: Story = {
  name: 'In-product samples',
  parameters: {
    docs: {
      description: {
        story: 'How some of the icons land in real product surfaces — button, badge, status pip.',
      },
    },
  },
  render: () => {
    const { Sparkles, ArrowUpRight, Check, TriangleAlert, MessageCircle, User } = icons;

    return (
      <div className="min-h-screen bg-[color:var(--app-bg)] p-10">
        <div className="mx-auto grid max-w-[900px] grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <SampleCard title="Primary button">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--accent)] px-3 py-1.5 text-[12px] font-medium text-[color:var(--on-accent)] shadow-[0_8px_18px_-10px_var(--accent-glow)]"
            >
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2.25} />
              Open canvas
            </button>
          </SampleCard>
          <SampleCard title="Reference link">
            <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--ref-bg)] px-2.5 py-1 text-[11.5px] font-medium text-[color:var(--ref)] ring-1 ring-[color:var(--ref-border)]">
              <ArrowUpRight className="h-3 w-3" strokeWidth={2.25} />
              Reference
            </span>
          </SampleCard>
          <SampleCard title="Status pill">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-[color:var(--status-success-bg)] px-2 py-1 font-mono text-[10px] font-semibold tracking-[0.18em] text-[color:var(--status-success)] uppercase ring-1 ring-[color:var(--status-success-border)]">
              <Check className="h-3 w-3" strokeWidth={2.5} />
              Valid
            </span>
          </SampleCard>
          <SampleCard title="Warning toast">
            <span className="inline-flex items-center gap-2 rounded-lg bg-[color:var(--status-warning-bg)] px-3 py-1.5 text-[12px] text-[color:var(--status-warning)] ring-1 ring-[color:var(--status-warning-border)]">
              <TriangleAlert className="h-3.5 w-3.5" strokeWidth={2} />
              Schema migration pending
            </span>
          </SampleCard>
          <SampleCard title="Comments pip">
            <span className="inline-flex items-center gap-1.5 text-[color:var(--text-subtle)]">
              <MessageCircle className="h-3.5 w-3.5" strokeWidth={2} />
              <span className="font-mono text-[10px] tracking-[0.18em] uppercase">3 comments</span>
            </span>
          </SampleCard>
          <SampleCard title="User avatar pill">
            <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)] px-2.5 py-1 text-[12px] text-[color:var(--text)]">
              <User className="h-3.5 w-3.5 text-[color:var(--text-muted)]" strokeWidth={2} />
              Arsen
            </span>
          </SampleCard>
        </div>
      </div>
    );
  },
};

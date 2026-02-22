import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { LucideProps } from 'lucide-react';
import { useMemo, useState } from 'react';

import { ARG_CATEGORIES } from '../../consts';
import { iconEntries } from './consts';

function IconGallery({
  size,
  color,
  strokeWidth,
  absoluteStrokeWidth,
}: LucideProps) {
  const [search, setSearch] = useState('');
  const [scroll, setScroll] = useState({ top: 0, height: 800 });

  const filtered = useMemo(
    () =>
      search
        ? iconEntries.filter(([name]) =>
            name.toLowerCase().includes(search.toLowerCase())
          )
        : iconEntries,
    [search]
  );

  const totalRows = Math.ceil(filtered.length / 12);
  const from = Math.max(0, Math.floor(scroll.top / 72) - 3);
  const to = Math.min(
    totalRows,
    Math.ceil((scroll.top + scroll.height) / 72) + 3
  );

  return (
    <div className="flex h-screen flex-col gap-3 p-4">
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Search icons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64 rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-gray-400"
        />
        <span className="text-xs text-gray-400">{filtered.length} icons</span>
      </div>

      <div
        className="min-h-0 flex-1 overflow-y-auto"
        onScroll={(e) =>
          setScroll({
            top: e.currentTarget.scrollTop,
            height: e.currentTarget.clientHeight,
          })
        }
      >
        <div style={{ height: totalRows * 72, position: 'relative' }}>
          {Array.from({ length: to - from }, (_, i) => {
            const row = from + i;
            return (
              <div
                key={row}
                className="absolute right-0 left-0 grid grid-cols-12 gap-1.5"
                style={{ top: row * 72, height: 72 }}
              >
                {filtered.slice(row * 12, row * 12 + 12).map(([name, Icon]) => (
                  <div
                    key={name}
                    className="flex min-w-0 flex-col items-center justify-center gap-1 rounded-md border border-gray-100 p-2 hover:bg-gray-50"
                  >
                    <Icon
                      size={size}
                      color={color}
                      strokeWidth={strokeWidth}
                      absoluteStrokeWidth={absoluteStrokeWidth}
                    />
                    <span className="w-full truncate text-center text-[10px] text-gray-400">
                      {name}
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const meta: Meta<LucideProps> = {
  title: 'Components/Icons',
  parameters: {
    docs: {
      description: {
        component: 'Gallery of all available Lucide icons.',
      },
    },
  },
  argTypes: {
    size: {
      control: { type: 'range', min: 12, max: 36, step: 1 },
      description: 'Icon size in pixels',
      table: { category: ARG_CATEGORIES.APPEARANCE },
    },
    color: {
      control: 'color',
      description: 'Icon stroke color',
      table: { category: ARG_CATEGORIES.APPEARANCE },
    },
    strokeWidth: {
      control: { type: 'range', min: 0.5, max: 4, step: 0.25 },
      description: 'Stroke width of icon paths',
      table: { category: ARG_CATEGORIES.APPEARANCE },
    },
    absoluteStrokeWidth: {
      control: 'boolean',
      description:
        'When enabled, stroke width stays constant regardless of icon size',
      table: { category: ARG_CATEGORIES.BEHAVIOR },
    },
  },
};

export default meta;

type Story = StoryObj<LucideProps>;

export const All: Story = {
  render: IconGallery,
};

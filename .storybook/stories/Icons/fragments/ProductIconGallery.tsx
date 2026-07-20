import { type LucideProps, icons } from 'lucide-react';

import { PRODUCT_ICON_NAMES } from '../product-icon-names.generated';
import { IconCell } from './IconCell';

interface IProductIconGalleryProps extends Pick<LucideProps, 'absoluteStrokeWidth' | 'color' | 'size' | 'strokeWidth'> {
  onCopy: (name: string) => void;
}

export const ProductIconGallery = ({
  size,
  color,
  strokeWidth,
  absoluteStrokeWidth,
  onCopy,
}: IProductIconGalleryProps) => (
  <div data-visual-target className="mx-auto w-full max-w-[1120px] px-8 py-10">
    <header className="mb-5 flex flex-wrap items-baseline justify-between gap-3 border-b border-[color:var(--border)] pb-3">
      <h2 className="font-serif text-[22px] leading-none tracking-tight text-[color:var(--text-strong)] italic">
        Product icon set
      </h2>
      <span className="font-mono text-[10px] tracking-[0.2em] text-[color:var(--text-subtle)] uppercase">
        {PRODUCT_ICON_NAMES.length} icons
      </span>
    </header>

    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
      {PRODUCT_ICON_NAMES.map((name) => (
        <IconCell
          key={name}
          name={name}
          Icon={icons[name]}
          size={size}
          color={color}
          strokeWidth={strokeWidth}
          absoluteStrokeWidth={absoluteStrokeWidth}
          onCopy={onCopy}
        />
      ))}
    </div>
  </div>
);

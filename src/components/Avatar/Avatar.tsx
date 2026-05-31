import { clsx } from 'clsx';

import type { TAvatarSize, TGlyphId } from '@interfaces';
import { GLYPH_ICONS } from '@constants';

import { GLYPH_SIZE_PX, PRESENCE_CLASS, SIZE_CLASS } from './consts';

export interface IAvatarProps {
  name: string;
  glyph?: TGlyphId | null;
  size?: TAvatarSize;
  showPresence?: boolean;
  className?: string;
}

export const getInitials = (name: string, fallback = 'U') =>
  (name?.trim() || fallback?.trim() || 'U')
    .split(/\s+/)
    .map((w: string) => [...w][0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

export const Avatar = ({ name, glyph, size = 'lg', showPresence = false, className }: IAvatarProps) => {
  const GlyphIcon = glyph ? GLYPH_ICONS[glyph] : null;

  return (
    <span
      role="img"
      aria-label={name || 'User'}
      className={clsx(
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[color:var(--accent)] to-[color:var(--accent-2)] font-bold text-[color:var(--on-accent)] shadow-sm',
        SIZE_CLASS[size],
        className,
      )}
    >
      {GlyphIcon ? (
        <GlyphIcon size={GLYPH_SIZE_PX[size]} strokeWidth={1.75} className="shrink-0" aria-hidden />
      ) : (
        getInitials(name)
      )}
      {showPresence && (
        <span
          aria-hidden
          className={clsx(
            'absolute right-0 bottom-0 translate-x-px translate-y-px rounded-full border-[color:var(--surface)] bg-[color:var(--accent)]',
            PRESENCE_CLASS[size],
          )}
        />
      )}
    </span>
  );
};

import { clsx } from 'clsx';

import type { TAvatarIcon, TAvatarSize } from '@interfaces';
import { AVATAR_ICON_BY_ID } from '@constants';

import { ICON_SIZE_PX, SIZE_CLASS } from './consts';

export interface IAvatarProps {
  name: string;
  icon?: TAvatarIcon | null;
  size?: TAvatarSize;
  className?: string;
}

export const getInitials = (name: string, fallback = 'U') =>
  (name?.trim() || fallback?.trim() || 'U')
    .split(/\s+/)
    .map((w: string) => [...w][0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

export const Avatar = ({ name, icon, size = 'lg', className }: IAvatarProps) => {
  const AvatarIcon = icon ? AVATAR_ICON_BY_ID[icon] : null;

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
      {AvatarIcon ? (
        <AvatarIcon size={ICON_SIZE_PX[size]} strokeWidth={1.75} className="shrink-0" aria-hidden />
      ) : (
        getInitials(name)
      )}
    </span>
  );
};

import { clsx } from 'clsx';

import type { IBadgePip } from '@interfaces';

export interface IBadgeConstellationProps {
  pips: readonly IBadgePip[];
}

export const BadgeConstellation = ({ pips }: IBadgeConstellationProps) => (
  <div className="flex items-center gap-1">
    {pips.map(({ id, icon: Icon, label, earned }) => (
      <span
        key={id}
        role="img"
        aria-label={label}
        title={label}
        className={clsx(
          'flex h-6 w-6 items-center justify-center rounded-full transition-transform duration-200 ease-out hover:-translate-y-0.5',
          earned ? 'text-[color:var(--on-accent)]' : 'text-[color:var(--text-faint)]',
        )}
        style={
          earned
            ? {
                background:
                  'radial-gradient(120% 120% at 30% 20%, color-mix(in srgb, var(--accent) 85%, white 15%) 0%, var(--accent) 50%, var(--accent-2) 100%)',
                boxShadow:
                  '0 4px 10px -4px var(--accent-glow), inset 0 1px 0 0 color-mix(in srgb, white 40%, transparent)',
              }
            : {
                background: 'color-mix(in srgb, var(--surface-overlay) 80%, transparent)',
                boxShadow: 'inset 0 0 0 1px var(--border-strong)',
              }
        }
      >
        <Icon
          className={clsx('h-3 w-3', earned && 'drop-shadow-[0_1px_0_rgba(0,0,0,0.2)]')}
          strokeWidth={earned ? 2 : 1.7}
        />
      </span>
    ))}
  </div>
);

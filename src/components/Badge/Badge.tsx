import { clsx } from 'clsx';
import { Lock, type LucideIcon } from 'lucide-react';

export interface IBadgeProps {
  icon: LucideIcon;
  label: string;
  unlock: string;
  earned: boolean;
}

export const Badge = ({ icon: Icon, label, unlock, earned }: IBadgeProps) => (
  <div
    role="img"
    aria-label={earned ? label : `${label} · ${unlock}`}
    title={earned ? label : `${label} · ${unlock}`}
    className={clsx(
      'group relative flex w-full flex-col overflow-hidden rounded-2xl border text-left transition-[border-color,transform,box-shadow] duration-300 ease-out',
      'hover:-translate-y-0.5',
      earned
        ? 'border-[color:var(--border-active)] shadow-[0_18px_38px_-22px_var(--accent-glow)]'
        : 'border-[color:var(--border)] hover:border-[color:var(--border-strong)] hover:shadow-[var(--shadow-card-hover)]',
    )}
  >
    <div
      aria-hidden
      className="relative flex h-11 w-full items-center justify-center bg-[color:var(--surface-overlay)]"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-55"
        style={{
          background: earned
            ? 'radial-gradient(140% 90% at 50% 0%, color-mix(in srgb, var(--accent-soft) 55%, transparent) 0%, transparent 70%)'
            : 'radial-gradient(140% 90% at 50% 0%, color-mix(in srgb, var(--surface-overlay) 80%, transparent) 0%, transparent 70%)',
        }}
      />
      <span
        className={clsx(
          'relative flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-300 ease-out group-hover:scale-105',
          earned
            ? 'text-[color:var(--on-accent)]'
            : 'bg-[color:var(--surface-elevated)] text-[color:var(--text-faint)]',
        )}
        style={
          earned
            ? {
                background:
                  'radial-gradient(120% 120% at 30% 20%, color-mix(in srgb, var(--accent) 85%, white 15%) 0%, var(--accent) 45%, var(--accent-2) 100%)',
                boxShadow:
                  '0 6px 14px -6px var(--accent-glow), inset 0 1px 0 0 color-mix(in srgb, white 35%, transparent), inset 0 -1px 0 0 color-mix(in srgb, black 20%, transparent)',
              }
            : { boxShadow: 'inset 0 0 0 1px var(--border-strong)' }
        }
      >
        <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
        {!earned && (
          <span className="absolute -right-0.5 -bottom-0.5 flex h-3 w-3 items-center justify-center rounded-full border border-[color:var(--border-strong)] bg-[color:var(--surface)] text-[color:var(--text-subtle)]">
            <Lock className="h-1.5 w-1.5" strokeWidth={2.4} />
          </span>
        )}
      </span>
    </div>

    <div className="flex flex-col gap-1 bg-[color:var(--surface-elevated)] px-1.5 pt-1.5 pb-2">
      <span
        className={clsx(
          'block truncate text-center font-serif text-[12.5px] leading-none tracking-tight italic',
          earned ? 'text-[color:var(--text-strong)]' : 'text-[color:var(--text-muted)]',
        )}
      >
        {label}
      </span>
    </div>

    <span
      aria-hidden
      className={clsx(
        'pointer-events-none absolute inset-x-0 bottom-0 h-px transition-opacity duration-300',
        earned ? 'bg-gradient-to-r from-transparent via-[color:var(--accent)] to-transparent opacity-90' : 'opacity-0',
      )}
    />
  </div>
);

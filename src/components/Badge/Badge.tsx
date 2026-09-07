import { clsx } from 'clsx';
import { Lock, type LucideIcon } from 'lucide-react';

interface IBadgeProps {
  icon: LucideIcon;
  label: string;
  unlock: string;
  earned: boolean;
}

export const Badge = ({ icon: Icon, label, unlock, earned }: IBadgeProps) => {
  const description = earned ? label : `${label} · ${unlock}`;

  return (
    <div
      role="img"
      aria-label={description}
      title={description}
      className={clsx(
        'group relative flex w-full flex-col overflow-hidden rounded-xl border text-left transition-[border-color,translate] duration-200 ease-out motion-reduce:transition-none',
        'hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]',
        earned
          ? 'border-[color:var(--border-active)]'
          : 'border-[color:var(--border)] hover:border-[color:var(--border-strong)]',
      )}
    >
      <div
        aria-hidden
        className={clsx(
          'relative flex h-11 w-full items-center justify-center',
          earned ? 'bg-[color:var(--accent-soft)]' : 'bg-[color:var(--surface-overlay)]',
        )}
      >
        <span
          className={clsx(
            'relative flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-200 ease-out group-hover:scale-105 motion-reduce:transition-none',
            earned
              ? 'bg-[color:var(--accent)] text-[color:var(--on-accent)]'
              : 'border border-[color:var(--border-strong)] bg-[color:var(--surface-overlay)] text-[color:var(--text-subtle)]',
          )}
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
            'block truncate text-center font-grotesk text-[12.5px] leading-none font-semibold tracking-tight',
            earned ? 'text-[color:var(--text-strong)]' : 'text-[color:var(--text-muted)]',
          )}
        >
          {label}
        </span>
      </div>

      {earned && (
        <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-[color:var(--accent)]" />
      )}
    </div>
  );
};

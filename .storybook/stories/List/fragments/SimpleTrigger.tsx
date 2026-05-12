import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

interface ISimpleTriggerOptions {
  onToggle?: (open: boolean) => void;
}

export const SimpleTrigger = (label: string, { onToggle }: ISimpleTriggerOptions = {}) => {
  const SimpleTriggerRender = (open: boolean, toggle: () => void): ReactNode => (
    <button
      type="button"
      onClick={() => {
        const next = !open;
        toggle();
        onToggle?.(next);
      }}
      className={clsx(
        'flex w-full items-center gap-2 rounded-md px-3 py-2 text-[13px] text-[color:var(--text)] transition-colors',
        open
          ? 'bg-[color:var(--surface-overlay)] text-[color:var(--text-strong)]'
          : 'hover:bg-[color:var(--surface-overlay)] hover:text-[color:var(--text-strong)]'
      )}
    >
      <ChevronRight
        className={clsx('h-3.5 w-3.5 shrink-0 transition-transform duration-200', open && 'rotate-90')}
        strokeWidth={2.25}
      />
      <span className="truncate font-medium">{label}</span>
      <span className="ml-auto font-mono text-[9.5px] tracking-[0.18em] text-[color:var(--text-faint)] uppercase">
        {open ? 'open' : 'closed'}
      </span>
    </button>
  );

  return SimpleTriggerRender;
};

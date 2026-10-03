import { clsx } from 'clsx';
import { Check } from 'lucide-react';

interface ISelectedPipProps {
  active: boolean;
  className?: string;
}

export const SelectedPip = ({ active, className }: ISelectedPipProps) => (
  <span
    aria-hidden={!active}
    className={clsx(
      'flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent)] text-[color:var(--on-accent)] shadow-[var(--shadow-pip)] transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none',
      active ? 'scale-100 opacity-100' : 'scale-50 opacity-0',
      className,
    )}
  >
    <Check className="h-3 w-3" strokeWidth={3} />
  </span>
);

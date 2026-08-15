import { clsx } from 'clsx';

interface ISelectionStripProps {
  className?: string;
}

export const SelectionStrip = ({ className }: ISelectionStripProps) => (
  <span
    aria-hidden
    className={clsx(
      'pointer-events-none absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[color:var(--accent)]',
      className,
    )}
  />
);
